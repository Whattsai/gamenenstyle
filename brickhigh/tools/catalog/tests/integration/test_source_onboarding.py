"""正式來源後繼匯入契約；僅使用隔離fixture，不替真20件製作核准。"""
import hashlib
import json
from pathlib import Path

import pytest

from tools.catalog.policies import CatalogConflict, CatalogError, canonical_json
from tools.catalog.repository import CatalogRepository
from tools.catalog.tests.integration.test_validation_content import ready_source


def write(root, key, data):
    data = data if isinstance(data, bytes) else canonical_json(data).encode()
    path = root/key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return hashlib.sha256(data).hexdigest()


def fixture(root):
    request = ready_source(root)
    with CatalogRepository(root/'catalog.sqlite', workspace=root, read_only=True) as repo:
        entry = repo.entries(request['snapshotId'])[0]
        revision = dict(repo.connection.execute('SELECT * FROM model_revisions WHERE revision_id=?',
                                               (entry['selected_revision_id'],)).fetchone())
    raw_request = {'operationName': 'PickABrickQuery', 'variables': {'input': {'page': 1, 'perPage': 100,
        'query': '', 'appearsIn': '10698', 'availability': ['AVAILABLE','OUT_OF_STOCK']}},
        'query': 'query PickABrickQuery($input: ElementQueryInput!) { searchElements(input: $input) { results { ... on SearchResultElement { id designId } } total count } }'}
    response = {'data': {'searchElements': {'total': 1, 'count': 1, 'results': [
        {'id': '300121', 'designId': '3001', 'name': 'BRICK 2X4'}]}}}
    folder = 'artifacts/sources/test-official'
    rq = write(root, folder+'/request.bin', raw_request)
    rs = write(root, folder+'/response.bin', response)
    url = 'https://www.lego.com/api/graphql/PickABrickQuery'
    manifest = {'schemaVersion':1,'sourceId':'test-official','method':'POST','requestedUrl':url,'finalUrl':url,
        'httpStatus':200,'ok':True,'contentType':'application/json','observedAt':'2026-10-20T00:00:00Z',
        'requestSha256':rq,'responseSha256':rs,'redirectChain':[],
        'requestByteLength':len((root/folder/'request.bin').read_bytes()),
        'responseByteLength':len((root/folder/'response.bin').read_bytes()),
        'paths':{k:'brickhigh/'+folder+'/'+v for k,v in [('request','request.bin'),('response','response.bin'),('manifest','exchange-manifest.json')]}}
    mh = write(root, folder+'/exchange-manifest.json', manifest)
    import gzip
    raw = ('element_id,part_num,color_id,design_id'+chr(10)+'300121,3001,4,3001'+chr(10)).encode()
    gz = gzip.compress(raw, mtime=0)
    dataset = 'artifacts/sources/pinned/elements.csv.gz'
    dh = write(root, dataset, gz)
    files = {f['name']: f for f in json.loads(revision['manifest_json'])['files']}
    # 此核對是隔離fixture，官方外觀原始證據另外綁定；不能把單純布林值視作正式來源。
    appearance = {'schemaVersion':1,'elementId':'300121','designId':'3001','sourceRevisionId':revision['revision_id'],
        'modelSha256':files['model.glb']['sha256'],'metadataSha256':files['metadata.json']['sha256'],
        'ldrawPart':'3001.dat','ldrawColour':'4','decision':'Approved','reviewer':'隔離來源核對測試',
        'reason':'僅限fixture：核對真原始附件與相同模型bytes，不是正式官方來源結論。',
        'checks':{'shape':True,'colour':True,'print':True,'mould':True},
        'officialEvidence':[]}
    # 額外官方外觀JSON代表可追溯原始資料，真實程式必須重算Element/色/模具，不能相信聲明。
    detail = {'elementId':'300121','designId':'3001','ldrawColour':'4','ldrawPart':'3001.dat',
              'shape':'BRICK 2X4','printed':False,'mouldPart':'3001'}
    detail_key = 'artifacts/sources/test-detail/source.bin'
    detail_sha = write(root, detail_key, detail)
    detail_manifest = {'schemaVersion':1,'sourceId':'test-detail','httpStatus':200,'sourceUri':'https://www.lego.com/service/bricks/5/2/300121',
                       'sha256':detail_sha,'storagePath':'brickhigh/'+detail_key,'byteLength':len((root/detail_key).read_bytes()),'contentType':'application/json'}
    detail_manifest_key = 'artifacts/sources/test-detail/manifest.json'
    dm = write(root, detail_manifest_key, detail_manifest)
    appearance['officialEvidence'] = [{'path':detail_key,'sha256':detail_sha,
        'manifestPath':detail_manifest_key,'manifestSha256':dm}]
    review_key = 'build-plans/source-review.json'
    review_sha = write(root, review_key, appearance)
    plan = {'schemaVersion':1,'database':'catalog.sqlite','parentSnapshotId':request['snapshotId'],
        'parentVersion':request['snapshotVersion'],'parentSelectionDigest':request['sourceSelectionDigest'],
        'pinnedElements':{'path':dataset,'sha256':dh},'cohort':[
            {'sourceVariantId':entry['variant_id'],'sourceRevisionId':revision['revision_id'],
             'ldrawPart':'3001.dat','ldrawColour':'4','family':'System'}],
        'sources':[{'manifestPath':folder+'/exchange-manifest.json','manifestSha256':mh,'setNumber':'10698'}],
        'candidates':[{'sourceVariantId':entry['variant_id'],'elementId':'300121','designId':'3001',
                       'reviewPath':review_key,'reviewSha256':review_sha}],
        'validationPlanSha256':None}
    return plan, revision


def run(root, plan, fault=None):
    from tools.catalog.source_onboarding import onboard_sources
    return onboard_sources(root, plan, expected_count=1, fault=fault)


def test_formal_successor_reuses_bytes_and_original_approval_with_real_quality_api(tmp_path):
    plan, original = fixture(tmp_path)
    before = tmp_path/'catalog.sqlite'
    result = run(tmp_path, plan)
    assert result['status']=='Passed' and result['importedCount']==1
    with CatalogRepository(before, workspace=tmp_path, read_only=True) as repo:
        assert repo.selection_digest(plan['parentSnapshotId'])==plan['parentSelectionDigest']
        assert repo.snapshot(result['snapshotId'])['parent_id']==plan['parentSnapshotId']
        row = repo.entries(result['snapshotId'])[0]
        assert row['variant_id'] != plan['cohort'][0]['sourceVariantId']
        assert row['selected_revision_id'] != original['revision_id']
        assert row['revision_status']=='Ready'
        from tools.catalog.quality import verify_persisted_quality
        assert verify_persisted_quality(tmp_path,row)
        files = {f['name']:f for f in json.loads(row['manifest_json'])['files']}
        old_files = {f['name']:f for f in json.loads(original['manifest_json'])['files']}
        for name in ['model.glb','metadata.json']:
            assert files[name]==old_files[name]
        assert repo.head()=={'snapshot_id':None,'version':0}
    digest_before=hashlib.sha256(before.read_bytes()).hexdigest()
    assert run(tmp_path,plan)==result
    assert hashlib.sha256(before.read_bytes()).hexdigest()==digest_before


@pytest.mark.parametrize('fault',['after_import','after_revision','after_quality','after_freeze','after_commit'])
def test_interruption_rolls_back_or_recovers_same_successor(tmp_path,fault):
    plan,_=fixture(tmp_path)
    from tools.catalog.source_onboarding import OnboardingInterrupted
    with pytest.raises(OnboardingInterrupted):
        run(tmp_path,plan,fault=fault)
    with CatalogRepository(tmp_path/'catalog.sqlite',workspace=tmp_path,read_only=True) as repo:
        expected=2 if fault=='after_commit' else 1
        assert repo.connection.execute('SELECT COUNT(*) FROM snapshots').fetchone()[0]==expected
        assert repo.selection_digest(plan['parentSnapshotId'])==plan['parentSelectionDigest']
    result=run(tmp_path,plan)
    assert result['importedCount']==1


@pytest.mark.parametrize('fault',['response','request','manifest','partial','wrong_set','colour','mould','missing_review','claim_only','stale_parent'])
def test_invalid_or_unproven_evidence_never_creates_formal_sources(tmp_path,fault):
    plan,_=fixture(tmp_path)
    if fault in {'response','request'}:
        (tmp_path/f'artifacts/sources/test-official/{fault}.bin').write_bytes(b'changed')
    elif fault=='manifest':
        plan['sources'][0]['manifestSha256']='a'*64
    elif fault=='partial':
        path=tmp_path/'artifacts/sources/test-official/response.bin'
        value=json.loads(path.read_text(encoding='utf-8'))
        value['data']['searchElements']['total']=2
        sha=write(tmp_path,path.relative_to(tmp_path).as_posix(),value)
        manifest_path=tmp_path/plan['sources'][0]['manifestPath']
        m=json.loads(manifest_path.read_text(encoding='utf-8'))
        m['responseSha256']=sha;m['responseByteLength']=path.stat().st_size
        plan['sources'][0]['manifestSha256']=write(tmp_path,manifest_path.relative_to(tmp_path).as_posix(),m)
    elif fault=='wrong_set':
        plan['sources'][0]['setNumber']='99999'
    elif fault=='stale_parent':
        plan['parentVersion']+=1
    elif fault=='missing_review':
        plan['candidates'][0].pop('reviewPath');plan['candidates'][0].pop('reviewSha256')
    else:
        path=tmp_path/'build-plans/source-review.json'
        r=json.loads(path.read_text(encoding='utf-8'))
        if fault=='claim_only':
            r['officialEvidence']=[]
        else:
            key=r['officialEvidence'][0]['path']
            d=json.loads((tmp_path/key).read_text(encoding='utf-8'))
            d['ldrawColour' if fault=='colour' else 'mouldPart']='71' if fault=='colour' else '4032a'
            r['officialEvidence'][0]['sha256']=write(tmp_path,key,d)
            mp=r['officialEvidence'][0]['manifestPath']
            m=json.loads((tmp_path/mp).read_text(encoding='utf-8'))
            m['sha256']=r['officialEvidence'][0]['sha256'];m['byteLength']=(tmp_path/key).stat().st_size
            r['officialEvidence'][0]['manifestSha256']=write(tmp_path,mp,m)
        plan['candidates'][0]['reviewSha256']=write(tmp_path,'build-plans/source-review.json',r)
    try:
        result=run(tmp_path,plan)
        assert result['status']=='Blocked' and result['importedCount']==0
    except CatalogError:
        pass
    with CatalogRepository(tmp_path/'catalog.sqlite',workspace=tmp_path,read_only=True) as repo:
        assert repo.connection.execute('SELECT COUNT(*) FROM snapshots').fetchone()[0]==1


def test_design_optional_element_fallback_is_supported_in_source_import_and_builder(tmp_path):
    from tools.catalog.importing import _record
    _record({'kind':'candidate','sourceId':'element:300121','family':'System','elementId':'300121',
             'designId':None,'name':'Element only','appearance':{'colour':'4'}},['System'])

def test_unrelated_pinned_conflict_is_reported_without_invalidating_requested_identity(tmp_path):
    plan,_=fixture(tmp_path)
    response_key='artifacts/sources/test-official/response.bin'
    value=json.loads((tmp_path/response_key).read_text(encoding='utf-8'))
    value['data']['searchElements']['results'].append({'id':'999999','designId':'9999'})
    value['data']['searchElements']['count']=2
    value['data']['searchElements']['total']=2
    sha=write(tmp_path,response_key,value)
    mp=plan['sources'][0]['manifestPath']
    m=json.loads((tmp_path/mp).read_text(encoding='utf-8'))
    m['responseSha256']=sha;m['responseByteLength']=(tmp_path/response_key).stat().st_size
    plan['sources'][0]['manifestSha256']=write(tmp_path,mp,m)
    import gzip
    dataset=plan['pinnedElements']['path']
    plan['pinnedElements']['sha256']=write(tmp_path,dataset,gzip.compress(
        ('element_id,part_num,color_id,design_id'+chr(10)+'300121,3001,4,3001'+chr(10)+'999999,9998,4,9998'+chr(10)).encode(),mtime=0))
    result=run(tmp_path,plan)
    assert result['importedCount']==1
    assert result['sourceMappingConflicts']==[{'elementId':'999999','officialDesignId':'9999','pinnedDesignId':'9998'}]


def test_truncated_official_image_is_rejected(tmp_path):
    plan,_=fixture(tmp_path)
    review_key=plan['candidates'][0]['reviewPath']
    review=json.loads((tmp_path/review_key).read_text(encoding='utf-8'))
    ref=review['officialEvidence'][0]
    ref['sha256']=write(tmp_path,ref['path'],bytes([137,80,78,71,13,10,26,10]))
    manifest=json.loads((tmp_path/ref['manifestPath']).read_text(encoding='utf-8'))
    manifest.update(sha256=ref['sha256'],byteLength=8,contentType='image/png')
    ref['manifestSha256']=write(tmp_path,ref['manifestPath'],manifest)
    plan['candidates'][0]['reviewSha256']=write(tmp_path,review_key,review)
    result=run(tmp_path,plan)
    assert result['status']=='Blocked' and result['importedCount']==0


def test_requested_identity_conflict_is_rejected(tmp_path):
    plan,_=fixture(tmp_path)
    import gzip
    path=plan['pinnedElements']['path']
    plan['pinnedElements']['sha256']=write(tmp_path,path,gzip.compress(
        ('element_id,part_num,color_id,design_id'+chr(10)+'300121,3001,4,9999'+chr(10)).encode(),mtime=0))
    with pytest.raises(CatalogError):
        run(tmp_path,plan)

def test_element_only_successor_passes_actual_validation_preflight(tmp_path):
    plan,_=fixture(tmp_path)
    response_key='artifacts/sources/test-official/response.bin'
    response=json.loads((tmp_path/response_key).read_text(encoding='utf-8'))
    response['data']['searchElements']['results'][0]['designId']=None
    sha=write(tmp_path,response_key,response)
    mp=plan['sources'][0]['manifestPath']
    m=json.loads((tmp_path/mp).read_text(encoding='utf-8'))
    m.update(responseSha256=sha,responseByteLength=(tmp_path/response_key).stat().st_size)
    plan['sources'][0]['manifestSha256']=write(tmp_path,mp,m)
    candidate=plan['candidates'][0];candidate['designId']=None
    review=json.loads((tmp_path/candidate['reviewPath']).read_text(encoding='utf-8'))
    review.update(designId=None,mouldEquivalenceReason='Isolated verified Element-only geometry.')
    ref=review['officialEvidence'][0]
    detail=json.loads((tmp_path/ref['path']).read_text(encoding='utf-8'));detail['designId']=None
    ref['sha256']=write(tmp_path,ref['path'],detail)
    dm=json.loads((tmp_path/ref['manifestPath']).read_text(encoding='utf-8'))
    dm.update(sha256=ref['sha256'],byteLength=(tmp_path/ref['path']).stat().st_size)
    ref['manifestSha256']=write(tmp_path,ref['manifestPath'],dm)
    candidate['reviewSha256']=write(tmp_path,candidate['reviewPath'],review)
    result=run(tmp_path,plan)
    from tools.catalog.validation_content import create_request,prepare_validation
    request=create_request(tmp_path,'catalog.sqlite',result['snapshotId'],'6000.3.18f1')
    assert prepare_validation(tmp_path,request,'artifacts/validation-content/element-only')['status']=='Prepared'


def test_committed_source_recovers_build_plan_cas_without_duplicate_revision(tmp_path):
    plan,_=fixture(tmp_path)
    version='game/ProjectSettings/ProjectVersion.txt'
    write(tmp_path,version,b'm_EditorVersion: 6000.3.18f1')
    key='build-plans/validation-content.json'
    expected=canonical_json({'old':'plan'}).encode()
    plan['validationPlanSha256']=hashlib.sha256(expected).hexdigest()
    write(tmp_path,key,{'different':'owner'})
    with pytest.raises(CatalogConflict,match='CAS'):
        run(tmp_path,plan)
    with CatalogRepository(tmp_path/'catalog.sqlite',workspace=tmp_path,read_only=True) as repo:
        assert repo.connection.execute('SELECT COUNT(*) FROM snapshots').fetchone()[0]==2
    write(tmp_path,key,expected)
    result=run(tmp_path,plan)
    assert json.loads((tmp_path/key).read_text(encoding='utf-8'))['snapshotId']==result['snapshotId']
    assert run(tmp_path,plan)==result


def test_blocked_candidate_produces_pending_sha_bound_review_template(tmp_path):
    plan,original=fixture(tmp_path)
    plan['candidates'][0].pop('reviewPath');plan['candidates'][0].pop('reviewSha256')
    result=run(tmp_path,plan)
    templates=result['reviewTemplates']
    assert len(templates)==1
    template=json.loads((tmp_path/templates[0]['path']).read_text(encoding='utf-8'))
    assert template['decision']=='Pending' and template['officialEvidence']==[]
    assert template['sourceRevisionId']==original['revision_id']
    assert not any(template['checks'].values())
    assert result['importedCount']==0

@pytest.mark.parametrize('query',[
    'query PickABrickQuery { searchElements(input: {appearsIn: "99999"}) { results { id designId } total count } }',
    'query PickABrickQuery($input: ElementQueryInput!) { searchElements(input: $input) @skip(if: true) { results { id designId } total count } }',
])
def test_query_cannot_ignore_or_conditionally_skip_verified_input(tmp_path,query):
    plan,_=fixture(tmp_path)
    key='artifacts/sources/test-official/request.bin'
    request=json.loads((tmp_path/key).read_text(encoding='utf-8'));request['query']=query
    sha=write(tmp_path,key,request)
    mp=plan['sources'][0]['manifestPath']
    manifest=json.loads((tmp_path/mp).read_text(encoding='utf-8'))
    manifest.update(requestSha256=sha,requestByteLength=(tmp_path/key).stat().st_size)
    plan['sources'][0]['manifestSha256']=write(tmp_path,mp,manifest)
    with pytest.raises(CatalogError):
        run(tmp_path,plan)
