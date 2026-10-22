"""固定任務品質提交：僅限隔離測試，不核准或重建真QA資產。"""
import hashlib
import json
from pathlib import Path

import pytest

from tools.catalog.content import ContentPathPolicy
from tools.catalog.policies import CatalogError, canonical_json
from tools.catalog.quality import quality_review_template, verify_persisted_quality
from tools.catalog.repository import CatalogRepository
from tools.catalog.tests.unit.test_quality_report import catalog_fixture

STAGE = 'artifacts/acceptance/gate3-fixed20-staging'


def write(root, key, value):
    path = root/key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(canonical_json(value), encoding='utf-8')
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fixture(root, count=2):
    source, manifest = catalog_fixture(root)
    with CatalogRepository(root/STAGE/'catalog.sqlite', workspace=root) as repo:
        snapshot = repo.create_snapshot('2026-10-20T00:00:00Z', {'fixture': True, 'purpose': 'QAOnly'})
        part = repo.add_part('隔離品質提交測試', 'System', 'Gate3Internal:3001.dat')
        items, plan_items, reports = [], [], []
        for index, colour in enumerate([str(i+1) for i in range(count)], 1):
            variant = repo.add_variant(part, {'color': colour})
            repo.put_entry(snapshot, variant, [], {'tier': 'Basic', 'reason': 'test'}, {'fixture': True})
            rid = repo.start_revision(variant, source['input_digest'], {'tool': 'testOnly'})
            changed = dict(manifest, revisionId=rid, variantId=variant)
            repo.transition_revision(rid, 'Building')
            repo.transition_revision(rid, 'Validating', manifest=changed)
            row = dict(repo.connection.execute('SELECT * FROM model_revisions WHERE revision_id=?', (rid,)).fetchone())
            review = quality_review_template(root, row, changed)
            key = f'{STAGE}/reviews/{index:02d}-3001.json'
            write(root, key, review)
            items.append({'sourcePart': '3001.dat', 'colour': colour, 'revisionId': rid, 'reviewFile': key, 'status': 'Validating'})
            plan_items.append({'variantId': variant, 'part': '3001.dat', 'colour': colour})
            reports.append(review)
        repo.freeze(snapshot, repo.snapshot(snapshot)['version'])
        version = repo.snapshot(snapshot)['version']
    summary = {'schemaVersion': 1, 'snapshotId': snapshot, 'itemCount': count, 'readyCount': 0, 'items': items}
    sha = write(root, STAGE+'/summary.json', summary)
    write(root, STAGE+'/stage.json', {'schemaVersion': 1, 'snapshotId': snapshot, 'itemCount': count})
    write(root, STAGE+'/plan.json', {'schemaVersion': 1, 'snapshotId': snapshot, 'snapshotVersion': version, 'items': plan_items})
    attestation = {'schemaVersion': 1, 'kind': 'chat-user-explicit-approval-attestation',
        'snapshotId': snapshot, 'sourceSummarySha256': sha, 'subjectRevisions': [{k: v for k, v in i.items() if k != 'status'} for i in items],
        'reviewScope': ['geometry', 'appearance', 'attribution'], 'userStatement': '隔離測試人工核准'}
    attestation_key = STAGE+'/user-approval-attestation-20261020.json'
    attestation_sha = write(root, attestation_key, attestation)
    for item, report in zip(items, reports):
        for name, entry in report['reviews'].items():
            key = attestation_key if name == 'attribution' else 'test-evidence/'+name+'.json'
            evidence_sha = attestation_sha if name == 'attribution' else write(root, key, {'testOnly': True, 'kind': name})
            entry.update(decision='Approved', reviewer='隔離測試審查者', reason='僅限測試',
                         evidencePath=key, evidenceSha256=evidence_sha)
        write(root, STAGE+'/review-submissions/'+Path(item['reviewFile']).name, report)
    write(root, 'game/Packages/packages-lock.json', {})
    return summary


def submit(root, count=2):
    from tools.catalog.quality_submission import submit_approved_batch
    return submit_approved_batch(root, expected_count=count)


def states(root):
    with CatalogRepository(root/STAGE/'catalog.sqlite', workspace=root, read_only=True) as repo:
        return [dict(r) for r in repo.connection.execute('SELECT * FROM model_revisions ORDER BY revision_id')]


def test_submit_uses_real_quality_api_selects_ready_and_preserves_fixture_identity(tmp_path):
    summary = fixture(tmp_path)
    originals = {r['revision_id']: json.loads(r['manifest_json']) for r in states(tmp_path)}
    result = submit(tmp_path)
    assert result['qualityStatus'] == 'Passed'
    assert result['readyCount'] == result['selectedCount'] == 2
    assert result['formalBuildEligible'] is False
    assert len(result['formalSourceGaps']) == 2
    with CatalogRepository(tmp_path/STAGE/'catalog.sqlite', workspace=tmp_path, read_only=True) as repo:
        snapshot = repo.snapshot(summary['snapshotId'])
        assert snapshot['status'] == 'Frozen'
        assert json.loads(snapshot['scope_manifest_json'])['fixture'] is True
        assert repo.head() == {'snapshot_id': None, 'version': 0}
        assert repo.connection.execute('SELECT COUNT(*) FROM validation_builds').fetchone()[0] == 0
        for row in repo.entries(summary['snapshotId']):
            assert row['revision_status'] == 'Ready'
            assert json.loads(row['display_projection_json']) == {'fixture': True}
            assert verify_persisted_quality(tmp_path, row)
            manifest = json.loads(row['manifest_json'])
            for record in originals[row['revision_id']]['files']:
                assert record in manifest['files']
    assert json.loads((tmp_path/STAGE/'summary.json').read_text(encoding='utf-8'))['readyCount'] == 0
    assert (tmp_path/result['evidenceKey']).is_file()
    assert (tmp_path/result['validationRequestKey']).is_file()


def test_retry_is_identical_and_rechecks_ready_evidence(tmp_path):
    fixture(tmp_path)
    first = submit(tmp_path)
    db = tmp_path/STAGE/'catalog.sqlite'
    before = db.read_bytes()
    assert submit(tmp_path) == first
    assert db.read_bytes() == before
    row = states(tmp_path)[0]
    file = next(x for x in json.loads(row['manifest_json'])['files'] if x['name'] == 'review:geometry-evidence')
    (tmp_path/file['storageKey']).write_bytes(b'changed')
    with pytest.raises(CatalogError):
        submit(tmp_path)


@pytest.mark.parametrize('fault', ['revision', 'model', 'attachment', 'pending', 'missing', 'duplicate', 'escape', 'attestation'])
def test_invalid_entire_batch_is_rejected_before_any_ready(tmp_path, fault):
    summary = fixture(tmp_path)
    path = tmp_path/STAGE/'review-submissions/02-3001.json'
    report = json.loads(path.read_text(encoding='utf-8'))
    if fault == 'revision':
        report['revisionId'] = summary['items'][0]['revisionId']
    elif fault == 'pending':
        report['reviews']['appearance']['decision'] = 'Pending'
    elif fault == 'attachment':
        (tmp_path/report['reviews']['appearance']['evidencePath']).write_bytes(b'changed')
    elif fault == 'escape':
        report['reviews']['geometry']['evidencePath'] = '../outside.json'
    elif fault == 'missing':
        path.unlink()
    elif fault == 'duplicate':
        write(tmp_path, STAGE+'/review-submissions/03-extra.json', report)
    elif fault == 'model':
        row = states(tmp_path)[0]
        file = next(x for x in json.loads(row['manifest_json'])['files'] if x['name'] == 'model.glb')
        (tmp_path/file['storageKey']).write_bytes(b'changed')
    elif fault == 'attestation':
        attestation = tmp_path/STAGE/'user-approval-attestation-20261020.json'
        data = json.loads(attestation.read_text(encoding='utf-8'))
        data['subjectRevisions'] = data['subjectRevisions'][:1]
        write(tmp_path, attestation.relative_to(tmp_path).as_posix(), data)
    if fault in {'revision', 'pending', 'escape'}:
        write(tmp_path, path.relative_to(tmp_path).as_posix(), report)
    with pytest.raises((CatalogError, OSError)):
        submit(tmp_path)
    assert all(row['status'] == 'Validating' for row in states(tmp_path))


def test_interruption_after_quality_commit_recovers_without_reapproval(tmp_path, monkeypatch):
    fixture(tmp_path)
    import tools.catalog.quality_submission as module
    original = module.complete_revision_quality
    calls = []
    def interrupted(*args, **kwargs):
        calls.append(args[2])
        original(*args, **kwargs)
        raise RuntimeError('模擬已提交品質但尚未寫receipt的中斷')
    monkeypatch.setattr(module, 'complete_revision_quality', interrupted)
    with pytest.raises(RuntimeError):
        submit(tmp_path)
    assert sum(r['status'] == 'Ready' for r in states(tmp_path)) == 1
    monkeypatch.setattr(module, 'complete_revision_quality', original)
    result = submit(tmp_path)
    assert result['readyCount'] == result['selectedCount'] == 2
    assert len(calls) == 1


def test_changed_submission_cannot_reapprove_ready_revision(tmp_path):
    fixture(tmp_path)
    submit(tmp_path)
    path = tmp_path/STAGE/'review-submissions/01-3001.json'
    report = json.loads(path.read_text(encoding='utf-8'))
    report['reviews']['geometry']['reason'] = '不同審查'
    write(tmp_path, path.relative_to(tmp_path).as_posix(), report)
    with pytest.raises(CatalogError):
        submit(tmp_path)


def test_cross_process_lock_rejects_concurrent_submission(tmp_path):
    fixture(tmp_path)
    from tools.catalog.quality_submission import submission_lock
    with submission_lock(tmp_path):
        with pytest.raises(CatalogError, match='正在提交'):
            submit(tmp_path)

def test_frozen_selection_compare_and_swap_rejects_stale_version(tmp_path):
    summary = fixture(tmp_path)
    submit(tmp_path)
    from tools.catalog.policies import CatalogConflict
    with CatalogRepository(tmp_path/STAGE/'catalog.sqlite', workspace=tmp_path) as repo:
        row = repo.entries(summary['snapshotId'])[0]
        with pytest.raises(CatalogConflict):
            repo.select_revision(summary['snapshotId'], row['variant_id'], row['selected_revision_id'],
                                 expected_version=-1)


def test_staging_refresh_preserves_signed_summary_and_ready_models(tmp_path, monkeypatch):
    summary = fixture(tmp_path, count=20)
    submit(tmp_path, count=20)
    import tools.acceptance.gate3_fixed20_staging as module
    original = (tmp_path/STAGE/'summary.json').read_bytes()
    plan = json.loads((tmp_path/STAGE/'plan.json').read_text(encoding='utf-8'))
    rows = [{'sourcePart': i['sourcePart'], 'colour': i['colour'], 'metadataSha256': 'a'*64}
            for i in summary['items']]
    # 重用既有staging分支固定20件；隔離fixture重複只用來檢查摘要封存，不做建模。
    plan['items'] = [dict(i, metadata={'sha256': 'a'*64}) for i in plan['items']]
    write(tmp_path, STAGE+'/plan.json', plan)
    state = {
        'schemaVersion': 1, 'snapshotId': summary['snapshotId'], 'itemCount': 20}
    write(tmp_path, STAGE+'/stage.json', state)
    revisions = [{'variantId': i['variantId'], 'revisionId': subject['revisionId'], 'status': 'Ready'}
                 for i, subject in zip(plan['items'], summary['items'])]
    monkeypatch.setattr(module, '_input_rows', lambda project: rows)
    monkeypatch.setattr(module, 'build_catalog', lambda *args: (_ for _ in ()).throw(AssertionError('不得重新建模')))
    module.stage_fixed20(tmp_path)
    assert (tmp_path/STAGE/'summary.json').read_bytes() == original
