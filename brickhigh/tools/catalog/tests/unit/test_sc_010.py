"""SC-010：外觀 revision 的六視圖與 provenance manifest 規則。"""

import json

import pytest

from tools.catalog.content import ObjectStore
from tools.catalog.policies import GateNotMet, canonical_json
from tools.catalog.quality import quality_review_template
from tools.catalog.tests.unit.test_quality_report import catalog_fixture


def _replace_json_artifact(workspace, manifest, name, mutate):
    record = next(item for item in manifest["files"] if item["name"] == name)
    payload = json.loads((workspace / record["storageKey"]).read_text(encoding="utf-8"))
    mutate(payload)
    raw = canonical_json(payload).encode("utf-8")
    saved = ObjectStore(workspace / "artifacts" / "catalog").put(raw)
    record.update({
        "sha256": saved["sha256"],
        "byteLength": len(raw),
        "storageKey": "artifacts/catalog/" + saved["storage_key"],
    })



@pytest.mark.parametrize("tamper", ["missing-shape-evidence", "fake-perfect-overlap", "wrong-geometry-profile"])
def test_revision_quality_rejects_forged_printed_geometry_placement(tmp_path, tamper):
    revision, manifest = catalog_fixture(tmp_path)
    def corrupt(conversion):
        if tamper == "missing-shape-evidence":
            conversion.pop("sourceGeometryEvidence")
        elif tamper == "fake-perfect-overlap":
            conversion["sourceGeometryEvidence"]["colourMetrics"]["1"] = {
                "sourceCoverage": 1.0, "intersectionOverUnion": 1.0, "sampleGrid": 96}
        else:
            conversion["sourceGeometryEvidence"]["profile"] = "insecure-reporter-v0"
    _replace_json_artifact(tmp_path, manifest, "conversion.json", corrupt)
    with pytest.raises(GateNotMet, match="印刷幾何"):
        quality_review_template(tmp_path, revision, manifest)


@pytest.mark.parametrize("tamper", ["missing-evidence", "fabricated-blue", "source-root-mismatch"])
def test_revision_quality_rejects_missing_or_forged_print_colour_evidence(tmp_path, tamper):
    revision, manifest = catalog_fixture(tmp_path)
    def corrupt(conversion):
        if tamper == "missing-evidence":
            conversion.pop("sourceSurfaceEvidence")
        elif tamper == "fabricated-blue":
            conversion["sourceSurfaceEvidence"] = {
                "sourceExplicitFaceColours": ["1"], "usedExportedColours": ["1"]}
        else:
            conversion["source"]["filename"] = "973p06.dat"
    _replace_json_artifact(tmp_path, manifest, "conversion.json", corrupt)
    with pytest.raises(GateNotMet, match="來源分色"):
        quality_review_template(tmp_path, revision, manifest)


@pytest.mark.parametrize("tamper", ["missing-comparisons", "incorrect-rgba", "incorrect-material-name"])
def test_revision_quality_rejects_exported_pbr_vs_source_mismatch(tmp_path, tamper):
    revision, manifest = catalog_fixture(tmp_path)
    # 真實 model.glb 不變；即使只有封存後轉換報告被替換，也不能交給外觀人工覆核。
    def corrupt(conversion):
        if tamper == "missing-comparisons":
            conversion["materialComparisons"] = []
        elif tamper == "incorrect-rgba":
            conversion["materialComparisons"][0]["target"]["baseColorLinear"][0] = .5
        else:
            conversion["materialComparisons"][0]["material"] = "Material_fake"
    _replace_json_artifact(tmp_path, manifest, "conversion.json", corrupt)
    with pytest.raises(GateNotMet, match="材質"):
        quality_review_template(tmp_path, revision, manifest)


def test_UT_028_RevisionManifestPolicy_VariantViews_RequiresSixDirections(tmp_path):
    revision, manifest = catalog_fixture(tmp_path)

    review = quality_review_template(tmp_path, revision, manifest)

    appearance = review["reviews"]["appearance"]
    assert appearance["modelSha256"] == review["modelSha256"]
    assert appearance["sixViewsSha256"] == review["sixViewsSha256"]
    assert appearance["sourceSha256s"] == review["sourceSha256s"]

    _replace_json_artifact(
        tmp_path,
        manifest,
        "six-views.json",
        lambda payload: payload["views"].pop("back"),
    )
    with pytest.raises(GateNotMet, match="六視圖方向不完整"):
        quality_review_template(tmp_path, revision, manifest)


def test_UT_029_RevisionManifestPolicy_Attribution_RequiresProvenance(tmp_path):
    revision, manifest = catalog_fixture(tmp_path)
    baseline = quality_review_template(tmp_path, revision, manifest)
    assert baseline["sourceSha256s"]

    cases = (
        ("conversion.json", lambda payload: payload["source"]["files"][0].pop("author"), "來源 provenance"),
        ("conversion.json", lambda payload: payload["source"]["files"][0].update({"license": ""}), "來源 provenance"),
        ("conversion.json", lambda payload: payload["source"]["files"][0].update({"source": "https://example.invalid/3001.dat"}), "來源 provenance"),
        ("conversion.json", lambda payload: payload["toolchain"].update({"importerCommit": ""}), "製作工具版本"),
        ("conversion.json", lambda payload: payload["source"]["colourConfig"].update({"sha256": "0" * 64}), "色彩設定來源版本"),
        ("attribution.json", lambda payload: payload.update({"modifications": ""}), "製作修改紀錄"),
    )

    for artifact, mutate, message in cases:
        case_root = tmp_path / ("case-" + str(cases.index((artifact, mutate, message))))
        case_root.mkdir()
        case_revision, case_manifest = catalog_fixture(case_root)
        _replace_json_artifact(case_root, case_manifest, artifact, mutate)
        with pytest.raises(GateNotMet, match=message):
            quality_review_template(case_root, case_revision, case_manifest)
