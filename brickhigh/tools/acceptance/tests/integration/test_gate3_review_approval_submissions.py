"""驗證使用者明確核准已逐件綁定20個不變模型修訂與真附件；不改寫Catalog狀態。"""

import hashlib
import json
from pathlib import Path


def test_fixed20_explicit_approvals_are_attached_to_real_revision_evidence():
    workspace = Path(__file__).resolve().parents[4]
    staging = workspace / "artifacts/acceptance/gate3-fixed20-staging"
    summary = json.loads((staging / "summary.json").read_text(encoding="utf-8"))
    attestation_path = staging / "user-approval-attestation-20261020.json"
    attestation = json.loads(attestation_path.read_text(encoding="utf-8"))
    assert attestation["kind"] == "chat-user-explicit-approval-attestation"
    assert attestation["userStatement"] == "我看完了  之前也都檢查過了   請你直接通過"
    assert attestation["snapshotId"] == summary["snapshotId"]
    assert len(attestation["subjectRevisions"]) == summary["itemCount"] == 20
    assert len(list((staging / "review-submissions").glob("*.json"))) == 20
    assert {r["revisionId"] for r in attestation["subjectRevisions"]} == {
        r["revisionId"] for r in summary["items"]}
    evidence_cache = {}
    for item in summary["items"]:
        review_path = workspace / item["reviewFile"]
        submitted_path = staging / "review-submissions" / review_path.name
        original = json.loads(review_path.read_text(encoding="utf-8"))
        submitted = json.loads(submitted_path.read_text(encoding="utf-8"))
        assert submitted["revisionId"] == original["revisionId"] == item["revisionId"]
        assert {k: v for k, v in submitted.items() if k != "reviews"} == {
            k: v for k, v in original.items() if k != "reviews"}
        assert set(submitted["reviews"]) == {"geometry", "appearance", "attribution"}
        for kind, fields in submitted["reviews"].items():
            previous = original["reviews"][kind]
            assert previous["decision"] == "Pending"
            unchanged = set(previous) - {
                "decision", "reviewer", "reason", "evidencePath", "evidenceSha256"}
            assert all(fields[k] == previous[k] for k in unchanged)
            assert fields["decision"] == "Approved"
            assert fields["reviewer"] == "本對話使用者（身分未驗證）"
            assert fields["reason"]
            key = fields["evidencePath"]
            path = (workspace / key).resolve()
            assert path.is_relative_to(workspace.resolve())
            if key not in evidence_cache:
                assert path.is_file() and path.stat().st_size > 0
                evidence_cache[key] = hashlib.sha256(path.read_bytes()).hexdigest()
            assert fields["evidenceSha256"] == evidence_cache[key]
    # 這只證實本次明確核准與附件一致；不會宣稱來源官方身份、正式Ready或已發布。
    assert summary["readyCount"] == 0


def test_fixed20_submissions_pass_real_catalog_review_preflight_without_mutation():
    """使用真GLB/metadata/六視圖/來源封存逐件驗證報告，僅唯讀不得改Validating。"""
    from tools.catalog.quality import _files, _normalize_review
    from tools.catalog.repository import CatalogRepository

    workspace = Path(__file__).resolve().parents[4]
    staging = workspace / "artifacts/acceptance/gate3-fixed20-staging"
    summary = json.loads((staging / "summary.json").read_text(encoding="utf-8"))
    with CatalogRepository(staging / "catalog.sqlite", workspace=workspace, read_only=True) as repo:
        for item in summary["items"]:
            row = repo.connection.execute(
                "SELECT * FROM model_revisions WHERE revision_id=?", (item["revisionId"],)
            ).fetchone()
            assert row is not None and row["status"] in {"Validating", "Ready"}
            before_status = row["status"]
            path = staging / "review-submissions" / Path(item["reviewFile"]).name
            submitted = json.loads(path.read_text(encoding="utf-8"))
            normalized = _normalize_review(workspace, dict(row),
                                           _files(json.loads(row["manifest_json"])), submitted)
            assert all(review["decision"] == "Approved" for review in normalized["reviews"].values())
            assert repo.connection.execute(
                "SELECT status FROM model_revisions WHERE revision_id=?", (item["revisionId"],)
            ).fetchone()["status"] == before_status
