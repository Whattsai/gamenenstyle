"""SC-013：不支援來源必須留下安全失敗原因，不能當作完成。"""

import json

import pytest

from tools.catalog.building import _source_failure_reason, build_catalog
from tools.catalog.policies import CatalogError
from tools.catalog.repository import CatalogRepository
from tools.catalog.sources import inspect_ldraw
from tools.catalog.tests.integration.test_catalog_build import prepare


@pytest.mark.parametrize(
    ("error", "reason"),
    [
        (CatalogError("缺少 LDraw 依賴：p/missing.dat"), "MissingDependency"),
        (CatalogError("TEXMAP 尚需補建與驗證：parts/a.dat"), "TexmapUnsupported"),
        (CatalogError("來源缺少作者或使用條件：parts/a.dat"), "MissingProvenance"),
        (CatalogError("來源使用條件尚未支援：parts/a.dat"), "UnsupportedLicense"),
        (CatalogError("LDraw 子件語法錯誤：parts/a.dat"), "MalformedSource"),
        (UnicodeError("fixture"), "UnsupportedSource"),
    ],
)
def test_source_failure_reason_is_stable_and_does_not_persist_raw_detail(error, reason):
    assert _source_failure_reason(error) == reason


@pytest.mark.parametrize(
    ("case", "reason"),
    [
        ("missing-dependency", "MissingDependency"),
        ("texmap", "TexmapUnsupported"),
        ("unsupported-license", "UnsupportedLicense"),
    ],
)
def test_real_ldraw_source_errors_are_classified_without_raw_detail(tmp_path, case, reason):
    parts = tmp_path / "parts"
    parts.mkdir()
    valid_header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"

    if case == "missing-dependency":
        body = valid_header + "1 16 0 0 0 1 0 0 0 1 0 0 0 1 missing.dat\n"
    elif case == "texmap":
        body = valid_header + "0 !TEXMAP START PLANAR\n3 16 0 0 0 20 0 0 0 -24 10\n"
    else:
        body = "0 !LICENSE GPL-3.0\n0 Author: Fixture Author\n3 16 0 0 0 20 0 0 0 -24 10\n"
    (parts / "a.dat").write_text(body, encoding="utf-8")

    with pytest.raises(CatalogError) as captured:
        inspect_ldraw(tmp_path, "a.dat")
    assert _source_failure_reason(captured.value) == reason


def test_UT_037_ModelBuildPolicy_UnsupportedSource_RecordsFailure(tmp_path, monkeypatch):
    snapshot, plan = prepare(tmp_path)
    variant_id = plan["items"][0]["variantId"]
    source_state = {
        "sourceError": "SourceUnavailable",
        "sourceFailureReason": "TexmapUnsupported",
        "part": plan["items"][0]["part"],
    }

    monkeypatch.setattr(
        "tools.catalog.building.prepare_toolchain",
        lambda _workspace, _plan: {
            "toolchain": {"fixture": True},
            "sources": {variant_id: source_state},
        },
    )

    def converter_must_not_run(*_args, **_kwargs):
        raise AssertionError("不支援來源不得啟動 converter")

    monkeypatch.setattr("tools.catalog.building.convert_item", converter_must_not_run)

    result = build_catalog(
        tmp_path,
        tmp_path / "catalog.sqlite",
        snapshot,
        "unsupported-source",
        "plan.json",
    )

    assert result["jobStatus"] == "Failed"
    assert result["exitCode"] == 4
    assert result["qualityPassed"] is False
    assert result["revisions"][0]["status"] == "Failed"

    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        row = repo.connection.execute(
            "SELECT status,validation_json FROM model_revisions WHERE variant_id=?",
            (variant_id,),
        ).fetchone()
        assert row["status"] == "Failed"
        failure = json.loads(row["validation_json"])
        assert failure["failureCode"] == "SourceUnavailable"
        assert failure["sourceFailureReason"] == "TexmapUnsupported"
        assert "TEXMAP" not in json.dumps(failure, ensure_ascii=False)
        assert repo.entries(snapshot)[0]["selected_revision_id"] is None
        assert repo.head()["snapshot_id"] is None
