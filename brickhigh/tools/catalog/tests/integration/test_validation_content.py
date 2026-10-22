"""正式 Frozen 建置輸入與不可變證據契約；測試資料不屬於QA或可交付資產。"""
import json
from pathlib import Path
from uuid import uuid4

import pytest

from tools.catalog.policies import CatalogConflict, GateNotMet
from tools.catalog.repository import CatalogRepository
from tools.catalog.validation_content import create_request, prepare_validation, verify_validation, finalize_validation


def frozen(tmp_path):
    database = tmp_path / "catalog.sqlite"
    with CatalogRepository(database, workspace=tmp_path) as repo:
        part = repo.add_part("僅限自動化測試", "System", "test:geometry")
        variant = repo.add_variant(part, {"color": "4"})
        snapshot = repo.create_snapshot("2026-10-19T00:00:00Z", {"fixture": True})
        repo.put_entry(snapshot, variant, [], {"tier": "Basic", "reason": "test"},
                       {"fixture": True, "designId": "test-design", "elementId": "test-element"})
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
    lock = tmp_path / "game/Packages/packages-lock.json"
    lock.parent.mkdir(parents=True)
    lock.write_text('{}', encoding='utf-8')
    return database, snapshot


def test_request_reads_actual_frozen_version_selection_and_preserves_database(tmp_path):
    database, snapshot = frozen(tmp_path)
    before = database.read_bytes()
    request = create_request(tmp_path, "catalog.sqlite", snapshot, "6000.3.18f1")
    with CatalogRepository(database, workspace=tmp_path, read_only=True) as repo:
        assert request['snapshotVersion'] == repo.snapshot(snapshot)['version']
        assert request['sourceSelectionDigest'] == repo.selection_digest(snapshot)
    assert database.read_bytes() == before


def test_pending_fixture_staging_produces_blocked_evidence_without_ready_or_head_change(tmp_path):
    database, snapshot = frozen(tmp_path)
    request = create_request(tmp_path, "catalog.sqlite", snapshot, "6000.3.18f1")
    output = "artifacts/validation-content/pending"
    before = database.read_bytes()
    result = prepare_validation(tmp_path, request, output)
    assert result['status'] == 'Blocked'
    assert result['items'][0]['issues'] == ['fixture-source', 'no-selected-ready-revision']
    assert (tmp_path / output / 'preflight.json').is_file()
    assert database.read_bytes() == before
    with pytest.raises(GateNotMet):
        verify_validation(tmp_path, output)


@pytest.mark.parametrize('field,value', [('snapshotVersion', 999), ('sourceSelectionDigest', 'a'*64),
                                      ('packageLockDigest', 'b'*64), ('buildTarget', 'linux-x64'),
                                      ('coordinateProfile', 'unknown')])
def test_stale_or_unsupported_inputs_fail_before_build(tmp_path, field, value):
    _, snapshot = frozen(tmp_path)
    request = create_request(tmp_path, "catalog.sqlite", snapshot, "6000.3.18f1")
    request[field] = value
    with pytest.raises((CatalogConflict, GateNotMet)):
        prepare_validation(tmp_path, request, 'artifacts/validation-content/stale')


def test_inputs_and_result_cannot_be_overwritten(tmp_path):
    _, snapshot = frozen(tmp_path)
    request = create_request(tmp_path, "catalog.sqlite", snapshot, "6000.3.18f1")
    prepare_validation(tmp_path, request, 'artifacts/validation-content/once')
    with pytest.raises((FileExistsError, CatalogConflict)):
        prepare_validation(tmp_path, request, 'artifacts/validation-content/once')


def test_real_fixed20_qa_preserves_current_quality_state_and_produces_no_formal_build(tmp_path):
    project = Path(__file__).resolve().parents[4]
    stage = project/'artifacts/acceptance/gate3-fixed20-staging'
    if not (stage/'stage.json').is_file():
        pytest.skip('本機固定20件staging尚未建立')
    snapshot = json.loads((stage/'stage.json').read_text(encoding='utf-8'))['snapshotId']
    before = (stage/'catalog.sqlite').read_bytes()
    request = create_request(project, 'artifacts/acceptance/gate3-fixed20-staging/catalog.sqlite', snapshot, '6000.3.18f1')
    result = prepare_validation(project, request, 'artifacts/validation-content/test-pending-' + uuid4().hex)
    assert result['status'] == 'Blocked' and len(result['items']) == 20
    assert all('fixture-source' in row['issues'] for row in result['items'])
    assert (stage/'catalog.sqlite').read_bytes() == before


def ready_source(tmp_path, include_pending=False):
    """在tmp中用既有品質fixture走完整核准API；不讀寫20件QA Pending。"""
    import hashlib
    from tools.catalog.tests.unit.test_quality_report import catalog_fixture
    from tools.catalog.quality import quality_review_template, complete_revision_quality
    from tools.catalog.policies import canonical_json
    revision, manifest = catalog_fixture(tmp_path)
    database = tmp_path/'catalog.sqlite'
    with CatalogRepository(database, workspace=tmp_path) as repo:
        part = repo.add_part('Synthetic contract fixture only', 'System', 'test:isolated-ready')
        variant = repo.add_variant(part, {'color': '4'})
        snapshot = repo.create_snapshot('2026-10-19T00:00:00Z', {'families': ['System']})
        repo.put_entry(snapshot, variant, [], {'tier': 'Basic', 'reason': 'isolated-test'},
                       {'name': 'Not a deliverable', 'designId': 'test', 'elementId': 'test'})
        if include_pending:
            pending_variant = repo.add_variant(part, {'color': '1'})
            repo.put_entry(snapshot, pending_variant, [], {'tier': 'Basic', 'reason': 'pending-test'},
                           {'designId': 'test', 'elementId': 'test'})
        repo.freeze(snapshot, repo.snapshot(snapshot)['version'])
        rid = repo.start_revision(variant, revision['input_digest'], {'tool': 'isolated-test'})
        manifest.update(revisionId=rid, variantId=variant)
        repo.transition_revision(rid, 'Building')
        repo.transition_revision(rid, 'Validating', manifest=manifest)
        row = dict(repo.connection.execute('SELECT * FROM model_revisions WHERE revision_id=?', (rid,)).fetchone())
        review = quality_review_template(tmp_path, row, manifest)
        for kind, item in review['reviews'].items():
            key = 'test-only/' + kind + '.json'
            file = tmp_path/key
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(canonical_json({'fixtureOnly': True, 'reviewType': kind,
                'revisionId': rid, 'modelSha256': review['modelSha256']}), encoding='utf-8')
            item.update(decision='Approved', reviewer='Isolated test verifier', reason='Synthetic contract test only',
                        evidencePath=key, evidenceSha256=hashlib.sha256(file.read_bytes()).hexdigest())
        (tmp_path/'review.json').write_text(canonical_json(review), encoding='utf-8')
        complete_revision_quality(repo, tmp_path, rid, 'review.json')
        repo.select_revision(snapshot, variant, rid)
    lock = tmp_path/'game/Packages/packages-lock.json'
    lock.parent.mkdir(parents=True)
    lock.write_text('{}')
    return create_request(tmp_path, 'catalog.sqlite', snapshot, '6000.3.18f1')


def test_explicit_ready_subset_does_not_require_published_or_full_coverage(tmp_path):
    request = ready_source(tmp_path, include_pending=True)
    assert prepare_validation(tmp_path, request, 'artifacts/validation-content/all')['status'] == 'Blocked'
    with CatalogRepository(tmp_path/'catalog.sqlite', workspace=tmp_path, read_only=True) as repo:
        ready = next(e for e in repo.entries(request['snapshotId']) if e['revision_status'] == 'Ready')
    subset = create_request(tmp_path, request['database'], request['snapshotId'], request['editorVersion'], [ready['variant_id']])
    assert prepare_validation(tmp_path, subset, 'artifacts/validation-content/subset')['status'] == 'Prepared'


def contract_reports(tmp_path):
    """只測證據協定；UnityFS／PNG是假資料，不能作為Player實測證據。"""
    import hashlib
    request = ready_source(tmp_path)
    key = 'artifacts/validation-content/contract-test'
    result = prepare_validation(tmp_path, request, key)
    assert result['status'] == 'Prepared'
    output = tmp_path/key
    inputs = json.loads((output/'inputs.json').read_text(encoding='utf-8'))
    model = inputs['models'][0]
    data = b'UnityFS\x00synthetic-protocol-test-not-an-asset'
    (output/'content').mkdir()
    (output/'content/model.bundle').write_bytes(data)
    e = {'revisionId': model['revisionId'], 'modelSha256': model['modelSha256'], 'passed': True,
         'bundleKey': 'content/model.bundle', 'bundleSha256': hashlib.sha256(data).hexdigest(), 'assetName': 'test-only.prefab'}
    captures = []
    import struct
    import zlib
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    png_bytes = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB',512,512,8,6,0,0,0))
                 + chunk(b'IDAT', zlib.compress((b'\0'+b'\xff\0\0\xff'*512)*512)) + chunk(b'IEND',b''))
    for side in ['front','back','left','right','top','bottom']:
        filename = 'captures/' + model['revisionId'] + '/' + side + '.png'
        (output/filename).parent.mkdir(parents=True, exist_ok=True)
        (output/filename).write_bytes(png_bytes)
        captures.append({'key': filename, 'sha256': hashlib.sha256(png_bytes).hexdigest()})
    p = {'revisionId': model['revisionId'], 'passed': True, 'meshCount': 1, 'materialCount': 1,
         'dimensionsVerified': True, 'materialsVerified': True, 'visiblePixels': [100]*6, 'captures': captures,
         'bundleKey': e['bundleKey'], 'bundleSha256': e['bundleSha256'], 'assetName': e['assetName']}
    plan = {'purpose': 'FrozenValidationContent', 'requestDigest': inputs['requestDigest'], 'models': [e],
            'bundles': [{'key': e['bundleKey'], 'sha256': e['bundleSha256']}]}
    (output/'player-plan.json').write_text(json.dumps(plan), encoding='utf-8')
    for filename, value in [('editor-report.json', {'passed': True, 'requestDigest': inputs['requestDigest'], 'editorVersion': request['editorVersion'], 'models': [e]}),
                            ('player-report.json', {'passed': True, 'requestDigest': inputs['requestDigest'], 'editorVersion': request['editorVersion'], 'models': [p],
                                'captureMode': 'PlayerCameraRenderRequest', 'renderPipeline': 'UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset',
                                'graphicsDevice': 'Synthetic protocol fixture', 'planSha256': hashlib.sha256((output/'player-plan.json').read_bytes()).hexdigest()}),
                            ('execution.json', {'playerExitCode': 0, 'requestDigest': inputs['requestDigest']})]:
        (output/filename).write_text(json.dumps(value))
    return key, output, request


def test_protocol_result_binds_runtime_identity_objects_sqlite_and_validation_record(tmp_path):
    key, output, request = contract_reports(tmp_path)
    result = finalize_validation(tmp_path, key)
    assert result['status'] == 'Passed' and result['published'] is False and result['packageKind'] is None
    assert verify_validation(tmp_path, key) == result
    assert (output/'runtime-builds.sqlite').is_file()
    with CatalogRepository(tmp_path/'catalog.sqlite', workspace=tmp_path, read_only=True) as repo:
        build = repo.connection.execute('SELECT * FROM validation_builds WHERE build_id=?', (result['buildId'],)).fetchone()
        assert build['selection_digest'] == request['sourceSelectionDigest']
        assert repo.head()['snapshot_id'] is None
    capture = json.loads((output/'player-report.json').read_text(encoding='utf-8'))['models'][0]['captures'][0]['key']
    (output/capture).write_bytes(b'corrupted')
    with pytest.raises(Exception, match='SHA'):
        verify_validation(tmp_path, key)


@pytest.mark.parametrize('failure', ['player-exit', 'wrong-revision', 'missing-capture', 'blank', 'changed-lock', 'selected-drift',
                                   'changed-model-input', 'changed-metadata-input', 'changed-plan', 'commit-race',
                                   'wrong-runtime-binding', 'duplicate-capture', 'non-urp', 'wrong-runtime-version'])
def test_failed_or_drifted_engine_evidence_never_records_passed_build(tmp_path, monkeypatch, failure):
    key, output, request = contract_reports(tmp_path)
    if failure == 'player-exit':
        value = json.loads((output/'execution.json').read_text(encoding='utf-8')); value['playerExitCode'] = 3
        (output/'execution.json').write_text(json.dumps(value))
    elif failure in ['wrong-revision', 'blank', 'wrong-runtime-binding', 'duplicate-capture', 'non-urp', 'wrong-runtime-version']:
        value = json.loads((output/'player-report.json').read_text(encoding='utf-8'))
        if failure == 'wrong-revision': value['models'][0]['revisionId'] = str(uuid4())
        elif failure == 'blank': value['models'][0]['visiblePixels'][0] = 0
        elif failure == 'wrong-runtime-binding': value['models'][0]['bundleSha256'] = 'f'*64
        elif failure == 'duplicate-capture': value['models'][0]['captures'][1] = value['models'][0]['captures'][0]
        elif failure == 'non-urp': value['renderPipeline'] = 'UnsupportedPipeline'
        else: value['editorVersion'] = '6000.3.17f1'
        (output/'player-report.json').write_text(json.dumps(value))
    elif failure == 'missing-capture':
        capture = json.loads((output/'player-report.json').read_text(encoding='utf-8'))['models'][0]['captures'][0]['key']
        (output/capture).unlink()
    elif failure == 'changed-lock':
        (tmp_path/'game/Packages/packages-lock.json').write_text('{"changed":true}')
    elif failure == 'selected-drift':
        with CatalogRepository(tmp_path/'catalog.sqlite', workspace=tmp_path) as repo:
            repo.connection.execute('UPDATE snapshots SET version=version+1 WHERE snapshot_id=?', (request['snapshotId'],))
    elif failure == 'changed-plan':
        (output/'player-plan.json').write_text('{}')
    elif failure == 'commit-race':
        original = CatalogRepository.record_validation
        def changed(self, *args, **kwargs):
            self.connection.execute('UPDATE snapshots SET version=version+1 WHERE snapshot_id=?', (request['snapshotId'],))
            return original(self, *args, **kwargs)
        monkeypatch.setattr(CatalogRepository, 'record_validation', changed)
    else:
        value = json.loads((output/'inputs.json').read_text(encoding='utf-8'))
        if failure == 'changed-model-input': value['models'][0]['modelSha256'] = 'b'*64
        else: value['models'][0]['metadata']['referenceDimensions'] = [1, 1, 1]
        (output/'inputs.json').write_text(json.dumps(value), encoding='utf-8')
    with pytest.raises((GateNotMet, CatalogConflict, OSError)):
        finalize_validation(tmp_path, key)
    with CatalogRepository(tmp_path/'catalog.sqlite', workspace=tmp_path, read_only=True) as repo:
        assert repo.connection.execute('SELECT COUNT(*) FROM validation_builds').fetchone()[0] == 0
        assert repo.head()['snapshot_id'] is None
    assert not (output/'result.json').exists()


def test_cli_blocked_inputs_and_failed_verification_have_stable_exit_codes(tmp_path, capsys):
    from tools.catalog.validation_content import main
    _, snapshot = frozen(tmp_path)
    request = create_request(tmp_path, 'catalog.sqlite', snapshot, '6000.3.18f1')
    plan = tmp_path/'build-plans/validation-content.json'
    plan.parent.mkdir()
    plan.write_text(json.dumps(request), encoding='utf-8')
    args = ['--project', str(tmp_path), '--output', 'artifacts/validation-content/cli']
    assert main(['prepare', *args, '--editor-version', '6000.3.18f1']) == 3
    assert json.loads(capsys.readouterr().out)['status'] == 'Blocked'
    for action in ['finalize', 'verify']:
        assert main([action, *args]) == 4
        assert json.loads(capsys.readouterr().out)['status'] == 'Failed'
    assert main(['prepare', '--project', str(tmp_path), '--output', 'artifacts/validation-content/wrong',
                 '--editor-version', '6000.3.17f1']) == 4
