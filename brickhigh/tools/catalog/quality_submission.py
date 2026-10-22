"""固定20件人工核准提交；沿用原品質API，不推測官方身份、不發布。"""
from contextlib import contextmanager
import argparse
import hashlib
import json
import os
import tempfile
from pathlib import Path
import sqlite3

from .content import ContentPathPolicy, ObjectStore
from .policies import CatalogConflict, CatalogError, GateNotMet, canonical_json, digest
from .quality import (_base_files, _files, _normalize_review, complete_revision_quality,
                      verify_persisted_quality)
from .repository import CatalogRepository
from .validation_content import create_request

STAGE = 'artifacts/acceptance/gate3-fixed20-staging'
ATTESTATION = STAGE + '/user-approval-attestation-20261020.json'
DATABASE = STAGE + '/catalog.sqlite'


def _read(root, key):
    return ContentPathPolicy.read_bytes(root, key)


def _json(root, key):
    return json.loads(_read(root, key))


def _sha(data):
    return hashlib.sha256(data).hexdigest()


def _save(root, key, value):
    """只建立或核對原位元組；不覆寫既有提交證據。"""
    data = canonical_json(value).encode('utf-8')
    path = ContentPathPolicy.resolve(root, key)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix='.quality-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        try:
            os.link(temporary, path)
        except FileExistsError:
            if _read(root, key) != data:
                raise CatalogConflict('既有提交證據與本次內容不符。')
    finally:
        Path(temporary).unlink(missing_ok=True)
    return key


@contextmanager
def submission_lock(project):
    """作業系統持有的單一提交者鎖；程序中斷會釋放，不變更MCP Write Lease。"""
    path = ContentPathPolicy.resolve(project, STAGE + '/quality-submit.lock')
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a+b') as stream:
        if path.stat().st_size == 0:
            stream.write(b'0')
            stream.flush()
        stream.seek(0)
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(stream.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as error:
            raise CatalogConflict('另一工作正在提交品質；請稍後安全重試。') from error
        try:
            yield
        finally:
            stream.seek(0)
            if os.name == 'nt':
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(stream.fileno(), fcntl.LOCK_UN)


def _ready_matches(project, row, normalized):
    if not verify_persisted_quality(project, row):
        raise GateNotMet('Ready修訂的封存品質證據失效。')
    files = _files(json.loads(row['manifest_json']))
    ref = files['quality-review.json']
    saved = ContentPathPolicy.read_verified(project, ref['storageKey'], ref['sha256'])
    if json.loads(saved) != normalized:
        raise CatalogConflict('Ready修訂的原核准內容不同；不得重新核准或覆寫。')


def _preflight(project, repo, expected_count):
    summary = _json(project, STAGE + '/summary.json')
    plan = _json(project, STAGE + '/plan.json')
    stage = _json(project, STAGE + '/stage.json')
    attestation = _json(project, ATTESTATION)
    items = summary['items']
    if (summary['itemCount'] != expected_count or len(items) != expected_count
            or stage['itemCount'] != expected_count or len(plan['items']) != expected_count
            or not summary['snapshotId'] == stage['snapshotId'] == plan['snapshotId'] == attestation['snapshotId']
            or attestation.get('kind') != 'chat-user-explicit-approval-attestation'
            or set(attestation.get('reviewScope', [])) != {'geometry', 'appearance', 'attribution'}
            or not isinstance(attestation.get('userStatement'), str) or not attestation['userStatement'].strip()
            or attestation.get('sourceSummarySha256') != _sha(_read(project, STAGE + '/summary.json'))
            or attestation.get('subjectRevisions') != [{key: item[key] for key in
                ('sourcePart', 'colour', 'revisionId', 'reviewFile')} for item in items]):
        raise GateNotMet('20件範圍、原摘要或明確核准聲明不一致。')
    snapshot = repo._require(summary['snapshotId'], {'Frozen'})
    revisions = [i['revisionId'] for i in items]
    variants = [i['variantId'] for i in plan['items']]
    if len(set(revisions)) != expected_count or len(set(variants)) != expected_count:
        raise GateNotMet('提交revision或Frozen變體重複。')
    entries = {e['variant_id']: e for e in repo.entries(snapshot['snapshot_id'])}
    if set(entries) != set(variants):
        raise GateNotMet('提交清單與真正Frozen範圍不一致。')
    directory = ContentPathPolicy.resolve(project, STAGE + '/review-submissions')
    names = [Path(i['reviewFile']).name for i in items]
    if (len(set(names)) != expected_count
            or {p.name for p in directory.iterdir()} != set(names)):
        raise GateNotMet('必須恰有20份對應提交檔，不接受缺件或額外項目。')
    prepared = []
    for item, planned in zip(items, plan['items']):
        if (item['sourcePart'] != planned['part'] or item['colour'] != planned['colour']
                or item['reviewFile'] != STAGE + '/reviews/' + Path(item['reviewFile']).name):
            raise GateNotMet('模型來源／色碼／審查路徑與原計畫不符。')
        row = repo.connection.execute('SELECT * FROM model_revisions WHERE revision_id=?',
                                      (item['revisionId'],)).fetchone()
        if row is None or row['variant_id'] != planned['variantId'] or row['status'] not in {'Validating', 'Ready'}:
            raise GateNotMet('revision不屬於固定變體或不是Validating／Ready。')
        row = dict(row)
        entry = entries[row['variant_id']]
        if entry['selected_revision_id'] not in {None, row['revision_id']}:
            raise CatalogConflict('Frozen已選定不同revision；禁止覆寫選件。')
        key = STAGE + '/review-submissions/' + Path(item['reviewFile']).name
        raw = _read(project, key)
        submitted = json.loads(raw)
        if (submitted['reviews']['attribution']['evidencePath'] != ATTESTATION
                or submitted['reviews']['attribution']['evidenceSha256'] != _sha(_read(project, ATTESTATION))):
            raise GateNotMet('署名審查未綁定本次明確核准聲明。')
        normalized = _normalize_review(project, row, _files(json.loads(row['manifest_json'])), submitted)
        if row['status'] == 'Ready':
            _ready_matches(project, row, normalized)
        prepared.append({'sourcePart': item['sourcePart'], 'colour': item['colour'], 'revisionId': row['revision_id'],
                         'variantId': row['variant_id'], 'submissionKey': key, 'submissionSha256': _sha(raw),
                         'sourceFiles': list(_base_files(_files(json.loads(row['manifest_json']))).values()),
                         'normalized': normalized})
    return snapshot, entries, prepared


def _progress(stage, completed, total):
    print('@@JOB ' + canonical_json({'stage': stage, 'completed': completed, 'total': total,
                                    'timeoutSeconds': 300}), flush=True)


def submit_approved_batch(project, *, expected_count=20):
    """預驗整批後逐件走原品質程序；已Ready需同一份核准，缺receipt亦可恢復。"""
    project = Path(project).resolve()
    with submission_lock(project):
        _progress('quality_preflight', 0, expected_count)
        with CatalogRepository(ContentPathPolicy.resolve(project, DATABASE), workspace=project, read_only=True) as repo:
            snapshot, entries, prepared = _preflight(project, repo, expected_count)
            head = repo.head()
        binding = {'schemaVersion': 1, 'database': DATABASE, 'snapshotId': snapshot['snapshot_id'],
                   'scope': snapshot['scope_manifest_json'],
                   'frozenEntries': [{k: entry[k] for k in ('variant_id', 'evidence_ids_json',
                       'classification_json', 'display_projection_json')} for entry in entries.values()],
                   'files': [{'key': key, 'sha256': _sha(_read(project, key))} for key in
                             (STAGE+'/summary.json', STAGE+'/plan.json', ATTESTATION)],
                   'items': [{k: v for k, v in item.items() if k != 'normalized'} for item in prepared]}
        batch = digest(binding)
        root = 'artifacts/quality-submissions/' + batch
        store = ObjectStore(project/'artifacts/catalog')
        references = []
        keys = {file['key'] for file in binding['files']} | {item['submissionKey'] for item in prepared}
        for item in prepared:
            submitted = _json(project, item['submissionKey'])
            keys.update(v['evidencePath'] for v in submitted['reviews'].values())
        for key in sorted(keys):
            data = _read(project, key)
            ref = store.put(data)
            references.append({'key': key, 'sha256': ref['sha256'], 'objectKey': 'artifacts/catalog/'+ref['storage_key']})
        _save(project, root+'/request.json', {'binding': binding, 'archives': references})
        archived = {ref['key']: ref['objectKey'] for ref in references}
        receipts = []
        with CatalogRepository(ContentPathPolicy.resolve(project, DATABASE), workspace=project) as repo:
            for index, item in enumerate(prepared, 1):
                _progress('quality_submit', index-1, expected_count)
                row = dict(repo.connection.execute('SELECT * FROM model_revisions WHERE revision_id=?',
                                                   (item['revisionId'],)).fetchone())
                # 再讀本次封存的提交檔，避免預驗後由外部替換輸入。
                report = json.loads(ContentPathPolicy.read_verified(project, archived[item['submissionKey']], item['submissionSha256']))
                normalized = _normalize_review(project, row, _files(json.loads(row['manifest_json'])), report)
                if row['status'] == 'Validating':
                    complete_revision_quality(repo, project, item['revisionId'], archived[item['submissionKey']])
                    row = dict(repo.connection.execute('SELECT * FROM model_revisions WHERE revision_id=?',
                                                       (item['revisionId'],)).fetchone())
                _ready_matches(project, row, normalized)
                selected = next(e for e in repo.entries(snapshot['snapshot_id']) if e['variant_id'] == item['variantId'])
                if selected['selected_revision_id'] is None:
                    repo.select_revision(snapshot['snapshot_id'], item['variantId'], item['revisionId'],
                                         expected_version=repo.snapshot(snapshot['snapshot_id'])['version'])
                elif selected['selected_revision_id'] != item['revisionId']:
                    raise CatalogConflict('Frozen選件競爭衝突。')
                files = _files(json.loads(row['manifest_json']))
                receipt = {'revisionId': item['revisionId'], 'variantId': item['variantId'], 'status': 'Ready',
                           'submissionSha256': item['submissionSha256'], 'qualityReportSha256': files['quality-report.json']['sha256'],
                           'qualityReviewSha256': files['quality-review.json']['sha256']}
                _save(project, root+'/receipts/'+item['revisionId']+'.json', receipt)
                receipts.append(receipt)
                _progress('quality_submit', index, expected_count)
            if repo.head() != head:
                raise CatalogConflict('提交期間Published head有外部變更；本任務未發布。')
            actual = repo.snapshot(snapshot['snapshot_id'])
            gaps = []
            for entry in repo.entries(snapshot['snapshot_id']):
                projection = json.loads(entry['display_projection_json'])
                issues = []
                if json.loads(actual['scope_manifest_json']).get('fixture') is True or projection.get('fixture') is True:
                    issues.append('fixture-source')
                if not projection.get('designId') or not projection.get('elementId') or not json.loads(entry['evidence_ids_json']):
                    issues.append('missing-verifiable-source-identity')
                if issues:
                    item = next(i for i in prepared if i['variantId'] == entry['variant_id'])
                    gaps.append({'sourcePart': item['sourcePart'], 'colour': item['colour'],
                                 'variantId': entry['variant_id'], 'revisionId': entry['selected_revision_id'], 'issues': issues})
            version = actual['version']
            selection = repo.selection_digest(snapshot['snapshot_id'])
        version_file = project/'game/ProjectSettings/ProjectVersion.txt'
        editor = version_file.read_text(encoding='utf-8').split('m_EditorVersion: ')[1].splitlines()[0] if version_file.is_file() else '6000.3.18f1'
        request = create_request(project, DATABASE, snapshot['snapshot_id'], editor)
        request_key = _save(project, root+'/next-validation-request.json', request)
        evidence = {'schemaVersion': 1, 'batchDigest': batch, 'snapshotId': snapshot['snapshot_id'],
                    'snapshotVersion': version, 'sourceSelectionDigest': selection, 'receipts': receipts,
                    'formalSourceGaps': gaps, 'published': False}
        ref = store.put(canonical_json(evidence).encode('utf-8'))
        result = {'qualityStatus': 'Passed', 'batchDigest': batch, 'readyCount': len(receipts), 'selectedCount': len(receipts),
                  'snapshotId': snapshot['snapshot_id'], 'snapshotVersion': version, 'sourceSelectionDigest': selection,
                  'formalBuildEligible': not gaps, 'formalSourceGaps': gaps, 'published': False,
                  'evidenceKey': 'artifacts/catalog/'+ref['storage_key'], 'evidenceSha256': ref['sha256'],
                  'validationRequestKey': request_key}
        _save(project, root+'/result.json', result)
        _progress('quality_complete', expected_count, expected_count)
        return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args(argv)  # 固定任務不接受外部資料庫、檔案、count或任意命令。
    try:
        result = submit_approved_batch(Path.cwd())
        print(canonical_json(result), flush=True)
        return 0
    except (CatalogError, OSError, ValueError, KeyError, TypeError, sqlite3.Error) as error:
        print(canonical_json({'qualityStatus': 'Failed', 'reason': str(error)}), flush=True)
        return 3


if __name__ == '__main__':
    raise SystemExit(main())
