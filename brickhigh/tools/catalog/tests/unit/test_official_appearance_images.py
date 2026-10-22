"""LEGO固定Element圖片白名單；隔離核准fixture不代表真模型外觀通過。"""
from io import BytesIO
import hashlib
import json

from PIL import Image
import pytest

from tools.catalog.policies import CatalogError, canonical_json
from tools.catalog.tests.integration.test_source_onboarding import write

BASE = "https://www.lego.com/cdn/product-assets/element.img.lod5photo.192x192/"


def picture(fmt="JPEG", size=(192,192)):
    stream=BytesIO()
    Image.new("RGB",size,(190,0,0)).save(stream,format=fmt)
    return stream.getvalue()


def appearance_fixture(root, *, uri=None, data=None, content_type="image/jpeg", pending=False, part="3001.dat", design="3001", element="300121"):
    key="artifacts/sources/test-element-photo/source.bin"
    data=picture() if data is None else data
    sha=write(root,key,data)
    manifest={"sourceUri":BASE+element+".jpg" if uri is None else uri,
        "observedAt":"2026-10-21T00:00:00Z","httpStatus":200,"contentType":content_type,
        "byteLength":len(data),"sha256":sha,"storagePath":"brickhigh/"+key}
    mp="artifacts/sources/test-element-photo/manifest.json"
    ref={"path":key,"sha256":sha,"manifestPath":mp,"manifestSha256":write(root,mp,manifest)}
    source={"revision_id":"isolated-revision","manifest_json":canonical_json({"files":[
        {"name":"model.glb","sha256":"a"*64},{"name":"metadata.json","sha256":"b"*64}]})}
    candidate={"elementId":element,"designId":design}
    item={"ldrawPart":part,"ldrawColour":"4"}
    review={"schemaVersion":1,"elementId":element,"designId":design,"sourceRevisionId":source["revision_id"],
        "modelSha256":"a"*64,"metadataSha256":"b"*64,"ldrawPart":part,"ldrawColour":"4",
        "decision":"Approved","reviewer":"隔離測試","reason":"只測附件契約，不核准正式模型",
        "checks":{"shape":True,"colour":True,"print":True,"mould":True},"officialEvidence":[ref]}
    if pending:
        candidate["officialEvidence"]=[ref]
    else:
        candidate["reviewPath"]="build-plans/isolated-appearance-review.json"
        candidate["reviewSha256"]=write(root,candidate["reviewPath"],review)
    return candidate,item,source,review,manifest


def check(root, candidate, item, source):
    from tools.catalog.source_onboarding import _appearance
    return _appearance(root,candidate,item,source,None)


def assert_rejected(root,candidate,item,source):
    try:
        review,issues=check(root,candidate,item,source)
        assert review is None and issues and issues!=["OfficialAppearanceReviewMissing"]
    except CatalogError:
        pass


def test_fixed_element_photo_accepts_real_jpeg_192_and_explicit_isolated_review(tmp_path):
    c,i,s,review,_=appearance_fixture(tmp_path)
    result,issues=check(tmp_path,c,i,s)
    assert result==review and issues==[]


@pytest.mark.parametrize("suffix",[
    "https://lego.com/cdn/product-assets/element.img.lod5photo.192x192/300121.jpg",
    "https://www.lego.com.evil.test/cdn/product-assets/element.img.lod5photo.192x192/300121.jpg",
    "http://www.lego.com/cdn/product-assets/element.img.lod5photo.192x192/300121.jpg",
    BASE+"300524.jpg",BASE+"300121.jpg?x=1",BASE+"300121.jpg#x",
    BASE+"%33%30%30%31%32%31.jpg",BASE+"300121.png",
    "https://www.lego.com:443/cdn/product-assets/element.img.lod5photo.192x192/300121.jpg",
    "https://user@www.lego.com/cdn/product-assets/element.img.lod5photo.192x192/300121.jpg",
    "https://www.lego.com/cdn/other/300121.jpg",
    "https://www.lego.com/cdn/product-assets/element.img.lod5photo.256x256/300121.jpg",
])
def test_other_sources_or_elements_are_rejected(tmp_path,suffix):
    c,i,s,_,_=appearance_fixture(tmp_path,uri=suffix)
    assert_rejected(tmp_path,c,i,s)


@pytest.mark.parametrize("fault",["http","manifest_sha","source_sha","length","storage","png","html","truncated","wrong_width","wrong_height","wrong_mime"])
def test_fixed_photo_rejects_untrusted_manifest_or_nonconforming_bytes(tmp_path,fault):
    data=picture()
    if fault=="png": data=picture("PNG")
    elif fault=="html": data=b"<html>not an image</html>"
    elif fault=="truncated": data=data[:-3]
    elif fault=="wrong_width": data=picture(size=(191,192))
    elif fault=="wrong_height": data=picture(size=(192,193))
    c,i,s,r,m=appearance_fixture(tmp_path,data=data,content_type="image/png" if fault=="wrong_mime" else "image/jpeg")
    ref=r["officialEvidence"][0]
    if fault=="http": m["httpStatus"]=404
    elif fault=="source_sha": m["sha256"]="f"*64
    elif fault=="length": m["byteLength"]+=1
    elif fault=="storage": m["storagePath"]="brickhigh/artifacts/other/source.bin"
    ref["manifestSha256"]=write(tmp_path,ref["manifestPath"],m)
    if fault=="manifest_sha": ref["manifestSha256"]="f"*64
    c["reviewSha256"]=write(tmp_path,c["reviewPath"],r)
    assert_rejected(tmp_path,c,i,s)


def test_fixed_photo_is_usable_without_automatically_approving_review(tmp_path):
    c,i,s,_,_=appearance_fixture(tmp_path,pending=True)
    result,issues=check(tmp_path,c,i,s)
    assert result is None and issues==["OfficialAppearanceReviewMissing"]
    # 缺審查時仍應驗實際bytes，不能把破損封存當成可用附件。
    (tmp_path/c["officialEvidence"][0]["path"]).write_bytes(b"changed")
    with pytest.raises(CatalogError):
        check(tmp_path,c,i,s)


def test_valid_fixed_photo_does_not_approve_mould_equivalence(tmp_path):
    c,i,s,_,_=appearance_fixture(tmp_path,part="4032a.dat",design="4032",element="403221")
    result,issues=check(tmp_path,c,i,s)
    assert result is None and issues==["MouldEquivalenceEvidenceMissing"]


@pytest.mark.parametrize("fault",["pending","checks","model","reviewer"])
def test_existing_review_gates_remain_mandatory(tmp_path,fault):
    c,i,s,r,_=appearance_fixture(tmp_path)
    if fault=="pending": r["decision"]="Pending"
    elif fault=="checks": r["checks"]["mould"]=False
    elif fault=="model": r["modelSha256"]="c"*64
    else: r["reviewer"]=""
    c["reviewSha256"]=write(tmp_path,c["reviewPath"],r)
    with pytest.raises(CatalogError):
        check(tmp_path,c,i,s)


@pytest.mark.parametrize("fmt,content_type",[("JPEG","image/jpeg"),("PNG","image/png")])
def test_legacy_element_image_path_is_preserved(tmp_path,fmt,content_type):
    c,i,s,r,_=appearance_fixture(tmp_path,uri="https://www.lego.com/service/bricks/5/2/300121",
                                data=picture(fmt,size=(64,64)),content_type=content_type)
    assert check(tmp_path,c,i,s)==(r,[])


def test_real_nine_archived_photos_are_verified_with_no_approval_or_catalog_mutation():
    from pathlib import Path
    from tools.catalog.source_onboarding import _appearance
    from tools.catalog.repository import CatalogRepository
    project=Path(__file__).resolve().parents[4]
    plan=json.loads((project/"build-plans/source-onboarding.json").read_text(encoding="utf-8"))
    database=project/plan["database"]
    before=hashlib.sha256(database.read_bytes()).hexdigest()
    cohort={i["sourceVariantId"]:i for i in plan["cohort"]}
    with CatalogRepository(database,workspace=project,read_only=True) as repo:
        entries={e["variant_id"]:e for e in repo.entries(plan["parentSnapshotId"])}
        assert repo.snapshot(plan["parentSnapshotId"])["version"]==plan["parentVersion"]==42
        for candidate in plan["candidates"]:
            c=dict(candidate)
            folder="artifacts/sources/gate3-official-image-"+c["elementId"]
            mp=folder+"/manifest.json"
            m=json.loads((project/mp).read_text(encoding="utf-8"))
            c["officialEvidence"]=[{"path":folder+"/source.bin","sha256":m["sha256"],
                "manifestPath":mp,"manifestSha256":hashlib.sha256((project/mp).read_bytes()).hexdigest()}]
            assert "reviewPath" not in c and len(plan["candidates"])==9
            ref=c["officialEvidence"][0]
            data=(project/ref["path"]).read_bytes()
            assert hashlib.sha256(data).hexdigest()==ref["sha256"]
            # 讓與固定Job相同的Pending入口實際執行圖片驗證。
            result,issues=_appearance(project,c,cohort[c["sourceVariantId"]],entries[c["sourceVariantId"]],None)
            assert result is None and issues==["OfficialAppearanceReviewMissing"]
            changed=dict(c)
            changed["officialEvidence"]=[dict(ref,manifestSha256="f"*64)]
            with pytest.raises(CatalogError):
                _appearance(project,changed,cohort[c["sourceVariantId"]],entries[c["sourceVariantId"]],None)
        assert repo.selection_digest(plan["parentSnapshotId"])==plan["parentSelectionDigest"]
    assert hashlib.sha256(database.read_bytes()).hexdigest()==before
