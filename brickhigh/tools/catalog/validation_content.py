"""Frozen → 真 Unity／Player → 不可變 RuntimeBuild 證據；不核准來源、不發布。"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys
import struct
from contextlib import closing

from .content import ContentPathPolicy, ObjectStore
from .policies import CatalogConflict, CatalogError, GateNotMet, canonical_json, digest
from .quality import verify_persisted_quality
from .repository import CatalogRepository

COORDINATE_PROFILE = 'canonical-rh-to-unity-lh-v1'
REQUEST_KEY = 'build-plans/validation-content.json'
STAGING = 'artifacts/acceptance/gate3-fixed20-staging'


def _hash(data):
    return hashlib.sha256(data).hexdigest()


def _read(root, key):
    return ContentPathPolicy.read_bytes(root, key)


def _json(root, key):
    return json.loads(_read(root, key))


def _write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8', newline='\n') as stream:
        stream.write(canonical_json(value))


def builder_digest(project):
    files = {'validation_content.py': _hash(Path(__file__).read_bytes())}
    for name in ['repository.py', 'quality.py', 'content.py', 'policies.py', 'runtime_schema.sql']:
        files[name] = _hash(Path(__file__).with_name(name).read_bytes())
    for key in ['game/Assets/BrickHigh/Editor/ValidationContentBuild.cs',
                'game/Assets/BrickHigh/UnityRuntime/ValidationContentPlayer.cs',
                'game/Assets/BrickHigh/Infrastructure/RuntimeBuildPolicy.cs']:
        path = Path(project)/key
        if path.is_file():
            files[key] = _hash(_read(project, key))
    return digest(files)


def create_request(project, database_key, snapshot_id, editor_version, variant_ids=None):
    """只讀取真正Frozen資料；未通過品質不代表可以免除後續preflight。"""
    project = Path(project).resolve()
    database = ContentPathPolicy.resolve(project, database_key)
    with CatalogRepository(database, workspace=project, read_only=True) as repo:
        snapshot = repo._require(snapshot_id, {'Frozen'})
        available = {e['variant_id'] for e in repo.entries(snapshot_id)}
        selected = sorted(available) if variant_ids is None else variant_ids
        if (not isinstance(selected, list) or not selected or any(not isinstance(v, str) for v in selected)
                or len(selected) != len(set(selected)) or not set(selected).issubset(available)):
            raise GateNotMet('驗證子集合必須明列Frozen中互不重複的variant ID。')
        return {'schemaVersion': 1, 'database': database_key, 'snapshotId': snapshot_id,
                'snapshotVersion': snapshot['version'], 'sourceSelectionDigest': repo.selection_digest(snapshot_id),
                'buildTarget': 'windows-x64', 'editorVersion': editor_version,
                'packageLockDigest': _hash(_read(project, 'game/Packages/packages-lock.json')),
                'coordinateProfile': COORDINATE_PROFILE, 'builderDigest': builder_digest(project),
                'variantIds': sorted(selected)}


def _context(project, request):
    if (request.get('schemaVersion') != 1 or request.get('buildTarget') != 'windows-x64'
            or request.get('coordinateProfile') != COORDINATE_PROFILE
            or type(request.get('snapshotVersion')) is not int
            or not re.fullmatch(r'\d+\.\d+\.\d+[abfp]\d+', request.get('editorVersion', ''))):
        raise GateNotMet('不支援或無效的Frozen建置輸入。')
    actual = create_request(project, request['database'], request['snapshotId'], request['editorVersion'], request.get('variantIds'))
    if request != actual:
        raise CatalogConflict('Frozen版本、選件、package lock或builder digest已改變；不得重用舊輸入。')
    return ContentPathPolicy.resolve(project, request['database'])


def _output(project, key):
    if not isinstance(key, str) or not key.startswith('artifacts/validation-content/'):
        raise CatalogError('建置輸出僅允許獨立validation-content目錄。')
    return ContentPathPolicy.resolve(project, key)


def prepare_validation(project, request, output_key):
    """保存釘選輸入及逐件品質阻擋；禁止將Pending／fixture直接製成正式包。"""
    project = Path(project).resolve()
    database = _context(project, request)
    output = _output(project, output_key)
    output.mkdir(parents=True, exist_ok=False)
    items, models = [], []
    with CatalogRepository(database, workspace=project, read_only=True) as repo:
        repo.connection.execute('BEGIN')
        snapshot = repo.snapshot(request['snapshotId'])
        fixture_scope = json.loads(snapshot['scope_manifest_json']).get('fixture') is True
        if repo.selection_digest(request['snapshotId']) != request['sourceSelectionDigest']:
            raise CatalogConflict('選件已改變。')
        for entry in repo.entries(request['snapshotId']):
            if entry['variant_id'] not in request['variantIds']:
                continue
            issues = []
            projection = json.loads(entry['display_projection_json'])
            if projection.get('fixture') is True or fixture_scope:
                issues.append('fixture-source')
            if entry['revision_status'] != 'Ready' or not entry['selected_revision_id']:
                issues.append('no-selected-ready-revision')
            elif not verify_persisted_quality(project, entry):
                issues.append('unverifiable-quality-report')
            if (not isinstance(projection.get('elementId'), str) or not projection['elementId'].strip()
                    or projection.get('designId') is not None and
                    (not isinstance(projection['designId'], str) or not projection['designId'].strip())):
                issues.append('missing-source-identity')
            # 無選件的QA仍列出實際revision狀態，不能只顯示空清單。
            candidates = [dict(row) for row in repo.connection.execute(
                'SELECT revision_id,status FROM model_revisions WHERE variant_id=? ORDER BY revision_id',
                (entry['variant_id'],))]
            items.append({'variantId': entry['variant_id'], 'revisionId': entry['selected_revision_id'],
                          'issues': issues, 'candidates': candidates})
            if issues:
                continue
            manifest = json.loads(entry['manifest_json'])
            files = {f['name']: f for f in manifest['files']}
            model = {'variantId': entry['variant_id'], 'revisionId': entry['selected_revision_id'],
                     'partId': entry['part_id'], 'display': projection,
                     'classification': json.loads(entry['classification_json']),
                     'sourceManifestDigest': digest(manifest)}
            for name, field in [('model.glb', 'model'), ('metadata.json', 'metadata')]:
                file = files[name]
                data = ContentPathPolicy.read_verified(project, file['storageKey'], file['sha256'])
                key = 'sources/' + model['revisionId'] + '/' + name
                destination = ContentPathPolicy.resolve(output, key)
                destination.parent.mkdir(parents=True, exist_ok=True)
                with destination.open('xb') as stream:
                    stream.write(data)
                model[field+'Key'], model[field+'Sha256'] = key, _hash(data)
                if field == 'metadata':
                    model['metadata'] = json.loads(data)
            models.append(model)
        inputs = {'schemaVersion': 1, 'purpose': 'FrozenValidationContent', 'request': request,
                  'requestDigest': digest(request), 'models': models, 'baselineAt': snapshot['baseline_at'],
                  'headAtStart': repo.head(), 'coverage': repo.coverage(request['snapshotId'])}
    result = {'schemaVersion': 1, 'status': 'Prepared' if items and not any(i['issues'] for i in items) else 'Blocked',
              'requestDigest': digest(request), 'items': items}
    _write(output/'inputs.json', inputs)
    _write(output/'preflight.json', result)
    return result


def runtime_identity(revision, request, content_digest, validation_digest):
    values = [revision, request['buildTarget'], request['editorVersion'], request['packageLockDigest'],
              request['coordinateProfile'], content_digest, validation_digest]
    return _hash(''.join(str(len(v)) + ':' + v for v in values).encode())


def _runtime_index(output, inputs, builds):
    """輸出真正revision映射的staging SQLite；不是Preview／Release manifest。"""
    path = output/'runtime-builds.sqlite'
    if path.exists():
        raise CatalogConflict('RuntimeBuild索引不可覆寫。')
    request = inputs['request']
    with closing(sqlite3.connect(path)) as db, db:
        db.executescript(Path(__file__).with_name('runtime_schema.sql').read_text(encoding='utf-8'))
        db.executemany('INSERT INTO runtime_meta VALUES(?,?)', [(key, str(request[key])) for key in
            ['snapshotId', 'snapshotVersion', 'sourceSelectionDigest', 'buildTarget', 'editorVersion',
             'packageLockDigest', 'coordinateProfile']])
        db.execute('INSERT INTO runtime_snapshots VALUES(?,?,?,1)',
                   (request['snapshotId'], inputs['baselineAt'], canonical_json(inputs['coverage'])))
        for model, build in zip(inputs['models'], builds):
            variant, revision = model['variantId'], model['revisionId']
            db.execute('INSERT INTO runtime_revisions VALUES(?,?)', (variant, revision))
            db.execute('INSERT INTO runtime_variants VALUES(?,?,?,?,?,?,?)',
                       (request['snapshotId'], variant, model['partId'], model['classification']['tier'],
                        canonical_json(model['display']), '{}', revision))
            db.execute('INSERT INTO runtime_builds VALUES(?,?,?,?,?,?,?,?,?,?)',
                       (build['runtimeBuildId'], variant, revision, request['buildTarget'], request['editorVersion'],
                        request['packageLockDigest'], request['coordinateProfile'], build['contentDigest'],
                        build['validationDigest'], build['bundleKey']))
            db.execute('INSERT INTO runtime_models VALUES(?,?,?,?,?,?,?)',
                       (request['snapshotId'], variant, revision, request['buildTarget'], build['runtimeBuildId'],
                        canonical_json(model['metadata']), 'revision/' + revision))
        for file in sorted((output/'content').rglob('*')):
            if file.is_file():
                key = file.relative_to(output).as_posix()
                kind = 'AssetBundle' if file.suffix == '.bundle' else 'LocalCatalog' if file.suffix == '.bin' else 'Metadata'
                data = _read(output, key)
                db.execute('INSERT INTO runtime_files VALUES(?,?,?,?)', (key, _hash(data), len(data), kind))
        if list(db.execute('PRAGMA foreign_key_check')):
            raise GateNotMet('RuntimeBuild SQLite引用不完整。')


def finalize_validation(project, output_key):
    """重驗來源CAS及真Editor／Player結果後保存內容，再提交既有validation_builds。"""
    project = Path(project).resolve()
    output = _output(project, output_key)
    inputs = _json(output, 'inputs.json')
    request = inputs['request']
    database = _context(project, request)
    if inputs['requestDigest'] != digest(request):
        raise GateNotMet('不可變輸入摘要不符。')
    if _json(output, 'preflight.json')['status'] != 'Prepared':
        raise GateNotMet('來源品質未完成，不能建立RuntimeBuild。')
    editor = _json(output, 'editor-report.json')
    player = _json(output, 'player-report.json')
    execution = _json(output, 'execution.json')
    plan = _json(output, 'player-plan.json')
    models = inputs['models']
    with CatalogRepository(database, workspace=project, read_only=True) as repo:
        entries = {e['variant_id']: e for e in repo.entries(request['snapshotId'])}
        if sorted(m['variantId'] for m in models) != request['variantIds']:
            raise GateNotMet('實際模型與明列Frozen子集合不一致。')
        for model in models:
            row = entries[model['variantId']]
            manifest = json.loads(row['manifest_json'])
            files = {f['name']: f for f in manifest['files']}
            if (row['selected_revision_id'] != model['revisionId']
                    or not verify_persisted_quality(project, row)
                    or digest(manifest) != model['sourceManifestDigest']):
                raise GateNotMet('實際Frozen選件、來源品質或manifest與建置輸入不一致。')
            for name, field in [('model.glb', 'model'), ('metadata.json', 'metadata')]:
                source = ContentPathPolicy.read_verified(project, files[name]['storageKey'], files[name]['sha256'])
                copied = ContentPathPolicy.read_verified(output, model[field+'Key'], files[name]['sha256'])
                if _hash(source) != model[field+'Sha256'] or source != copied:
                    raise GateNotMet('建置來源不符合Ready修訂。')
                if field == 'metadata' and json.loads(source) != model['metadata']:
                    raise GateNotMet('建置metadata被替換。')
    expected = [m['revisionId'] for m in models]
    for report in [editor, player]:
        if (report.get('requestDigest') != inputs['requestDigest'] or report.get('passed') is not True
                or report.get('editorVersion') != request['editorVersion']
                or [m['revisionId'] for m in report.get('models', [])] != expected):
            raise GateNotMet('Editor或Player驗證缺失、失敗或對應錯誤修訂。')
    if (execution.get('playerExitCode') != 0 or execution.get('requestDigest') != inputs['requestDigest']):
        raise GateNotMet('Player程序沒有成功完成。')
    plan_sha = _hash(_read(output, 'player-plan.json'))
    if (player.get('planSha256') != plan_sha or plan.get('requestDigest') != inputs['requestDigest']
            or player.get('captureMode') != 'PlayerCameraRenderRequest'
            or player.get('renderPipeline') != 'UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset'
            or not player.get('graphicsDevice')):
        raise GateNotMet('Player未綁定實際載入計畫、URP或實際畫面擷取。')
    for bundle in plan['bundles']:
        ContentPathPolicy.read_verified(output, bundle['key'], bundle['sha256'])
    builds = []
    for model, e, p in zip(models, editor['models'], player['models']):
        if (e.get('passed') is not True or p.get('passed') is not True
                or p.get('meshCount', 0) < 1 or p.get('materialCount', 0) < 1
                or len(p.get('captures', [])) != 6 or len(p.get('visiblePixels', [])) != 6
                or any(type(n) is not int or n < 64 for n in p['visiblePixels'])
                or p.get('dimensionsVerified') is not True or p.get('materialsVerified') is not True
                or e['modelSha256'] != model['modelSha256']
                or any(p.get(k) != e[k] for k in ['bundleKey', 'bundleSha256', 'assetName'])):
            raise GateNotMet('逐件Player真mesh、材質、尺寸或六視圖驗證未通過。')
        expected_captures = ['captures/' + model['revisionId'] + '/' + side + '.png'
                             for side in ['front', 'back', 'left', 'right', 'top', 'bottom']]
        if [c['key'] for c in p['captures']] != expected_captures:
            raise GateNotMet('六視圖缺失、重複或方向不一致。')
        for capture in p['captures']:
            data = _read(output, capture['key'])
            if (_hash(data) != capture['sha256'] or not data.startswith(b'\x89PNG\r\n\x1a\n')
                    or len(data) < 33 or struct.unpack_from('>II', data, 16) != (512, 512)):
                raise GateNotMet('Player截圖內容缺失或被改寫。')
        bundle = _read(output, e['bundleKey'])
        if _hash(bundle) != e['bundleSha256'] or not bundle.startswith(b'UnityFS\x00'):
            raise GateNotMet('缺少實際Unity AssetBundle。')
        validation_digest = digest({'editor': e, 'player': p, 'planSha256': plan_sha, 'requestDigest': inputs['requestDigest']})
        builds.append({'runtimeBuildId': runtime_identity(model['revisionId'], request, _hash(bundle), validation_digest),
                       'variantId': model['variantId'], 'sourceRevisionId': model['revisionId'],
                       'contentDigest': _hash(bundle), 'validationDigest': validation_digest,
                       'bundleKey': e['bundleKey'], 'assetName': e['assetName']})
    _runtime_index(output, inputs, builds)
    # 所有真實輸出先寫內容位址庫；資料庫CAS失敗仍保留證據，不切head。
    store = ObjectStore(project/'artifacts/validation-content-store')
    files = []
    for path in sorted(output.rglob('*')):
        if path.is_file() and path.name not in {'result.json', 'seal.json'}:
            key = path.relative_to(output).as_posix()
            saved = store.put(_read(output, key))
            files.append({'key': key, 'sha256': saved['sha256'], 'byteLength': saved['byte_length'],
                          'objectKey': 'artifacts/validation-content-store/' + saved['storage_key']})
    evidence = {'schemaVersion': 1, 'request': request, 'runtimeBuilds': builds, 'files': files}
    saved = store.put(canonical_json(evidence).encode())
    toolchain = digest({k: request[k] for k in ['buildTarget', 'editorVersion', 'packageLockDigest', 'coordinateProfile', 'builderDigest']})
    _context(project, request)
    with CatalogRepository(database, workspace=project) as repo:
        build_id = repo.record_validation(request['snapshotId'], request['buildTarget'], toolchain,
            saved['sha256'], expected, expected_version=request['snapshotVersion'],
            expected_selection_digest=request['sourceSelectionDigest'])
    result = {'schemaVersion': 1, 'status': 'Passed', 'buildId': build_id,
              'snapshotId': request['snapshotId'], 'snapshotVersion': request['snapshotVersion'],
              'sourceSelectionDigest': request['sourceSelectionDigest'], 'toolchainDigest': toolchain,
              'resultDigest': saved['sha256'], 'evidenceKey': 'artifacts/validation-content-store/' + saved['storage_key'],
              'runtimeBuilds': builds, 'packageKind': None, 'published': False}
    _write(output/'result.json', result)
    _write(output/'seal.json', {'resultSha256': _hash(_read(output, 'result.json')), 'files': files})
    return result


def verify_validation(project, output_key):
    output = _output(project, output_key)
    if _json(output, 'preflight.json')['status'] != 'Prepared':
        raise GateNotMet('Frozen來源仍被品質閘門阻擋。')
    result, seal = _json(output, 'result.json'), _json(output, 'seal.json')
    if result.get('status') != 'Passed' or _hash(_read(output, 'result.json')) != seal['resultSha256']:
        raise GateNotMet('建置結果並非完整不可變證據。')
    evidence = json.loads(ContentPathPolicy.read_verified(project, result['evidenceKey'], result['resultDigest']))
    if evidence['files'] != seal['files'] or evidence['runtimeBuilds'] != result['runtimeBuilds']:
        raise GateNotMet('內容庫與seal索引不一致。')
    for file in seal['files']:
        ContentPathPolicy.read_verified(output, file['key'], file['sha256'])
        ContentPathPolicy.read_verified(project, file['objectKey'], file['sha256'])
    request = evidence['request']
    database = ContentPathPolicy.resolve(project, request['database'])
    with CatalogRepository(database, workspace=project, read_only=True) as repo:
        row = repo.connection.execute('SELECT * FROM validation_builds WHERE build_id=?', (result['buildId'],)).fetchone()
        if row is None or any(row[key] != value for key, value in {
            'snapshot_id': result['snapshotId'], 'snapshot_version': result['snapshotVersion'],
            'selection_digest': result['sourceSelectionDigest'], 'toolchain_digest': result['toolchainDigest'],
            'target': request['buildTarget'], 'result_digest': result['resultDigest'], 'status': 'Passed'}.items()):
            raise GateNotMet('資料庫validation_builds與不可變證據不一致。')
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['prepare', 'finalize', 'verify'])
    parser.add_argument('--project', default='.')
    parser.add_argument('--request', default=REQUEST_KEY)
    parser.add_argument('--output', required=True)
    parser.add_argument('--editor-version')
    args = parser.parse_args(argv)
    project = Path(args.project).resolve()
    try:
        if args.action == 'prepare':
            request_path = ContentPathPolicy.resolve(project, args.request)
            if not request_path.exists():
                stage = _json(project, STAGING + '/stage.json')
                request = create_request(project, STAGING + '/catalog.sqlite', stage['snapshotId'], args.editor_version)
                _write(request_path, request)
            request = _json(project, args.request)
            if request['editorVersion'] != args.editor_version:
                raise CatalogConflict('實際Unity Editor版本不符合釘選輸入。')
            result = prepare_validation(project, request, args.output)
        elif args.action == 'finalize':
            result = finalize_validation(project, args.output)
        else:
            _context(project, _json(_output(project, args.output), 'inputs.json')['request'])
            result = verify_validation(project, args.output)
        print(canonical_json(result))
        return 3 if result.get('status') == 'Blocked' else 0
    except (CatalogError, OSError, ValueError, KeyError, TypeError, sqlite3.Error) as error:
        print(canonical_json({'status': 'Failed', 'reason': str(error)}))
        return 4


if __name__ == '__main__':
    sys.exit(main())
