"""Gate 3：將固定20件真實 Catalog 版本保留在隔離 QA staging，供後續正式人工覆核。"""

import json
from pathlib import Path

from tools.acceptance.gate3_fixed20_staging import stage_fixed20
from tools.catalog.repository import CatalogRepository


def test_fixed20_gate3_staging_preserves_20_real_revisions_and_review_baseline():
    project = Path(__file__).resolve().parents[4]
    result = stage_fixed20(project)
    assert result["itemCount"] == 20
    assert result["gate2ReadyCount"] == 20
    assert result["validatingCount"] + result["readyCount"] == 20
    assert result["pendingReviewCount"] == result["validatingCount"]
    staging = project / "artifacts/acceptance/gate3-fixed20-staging"
    with CatalogRepository(staging / "catalog.sqlite", workspace=project) as repo:
        rows = repo.connection.execute("SELECT revision_id, status FROM model_revisions").fetchall()
        # 來源合法匯入會新增 immutable successor revisions，不能再假定全DB剛好20筆。
        # Gate3 QA基線應僅核對原20件ID及狀態，額外revision不得被混入QA計數。
        by_id = {row["revision_id"]: row["status"] for row in rows}
        original = [item["revisionId"] for item in result["items"]]
        assert len(original) == len(set(original)) == 20
        assert set(original) <= set(by_id)
        assert all(by_id[rid] in {"Validating", "Ready"} for rid in original)
        assert sum(by_id[rid] == "Ready" for rid in original) == result["readyCount"]
        assert repo.head()["snapshot_id"] is None
    files = list((staging / "reviews").glob("*.json"))
    assert len(files) == 20
    for file in files:
        review = json.loads(file.read_text(encoding="utf-8"))
        assert set(review["reviews"]) == {"geometry", "appearance", "attribution"}
        assert all(item["decision"] == "Pending" for item in review["reviews"].values())
