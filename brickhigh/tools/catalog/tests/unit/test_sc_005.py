"""SC-005：指定盒組 C/G/V 覆蓋率、fixture 排除與發布 head gate。"""

import hashlib

import pytest

from tools.catalog.policies import CatalogCoveragePolicy, GateNotMet, canonical_json
from tools.catalog.quality import complete_revision_quality, quality_review_template
from tools.catalog.repository import CatalogRepository
from tools.catalog.tests.unit.test_quality_report import catalog_fixture


def _entry(variant_id, *, fixture=False, identity=True):
    return {
        "variant_id": variant_id,
        "fixture": fixture,
        "identity_verified": identity,
        "ready": True,
        "classified": True,
        "quality_passed": True,
        "provenance_passed": True,
        "designId": "3001",
        "elementId": variant_id,
        "sourceEvidence": "authoritative-set-element",
    }


def test_UT_013_CatalogCoveragePolicy_CompleteCounts_PassesGate():
    entries = [_entry("element-a"), _entry("element-b")]

    report = CatalogCoveragePolicy.evaluate(entries, [], True)

    assert report["C"] == 2
    assert report["G"] == 0
    assert report["V"] == 2
    assert report["coverage"] == 1
    assert report["label"] == "2/2"
    assert report["release_allowed"] is True
    assert {row["elementId"] for row in report["variants"] if not row["fixture"]} == {
        "element-a",
        "element-b",
    }

    identity_gap = [_entry("element-a"), _entry("element-b", identity=False)]
    blocked = CatalogCoveragePolicy.evaluate(identity_gap, [], True)
    assert blocked["C"] == 2
    assert blocked["V"] == 1
    assert blocked["release_allowed"] is False


def test_UT_014_CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery():
    entries = [
        _entry("element-a"),
        _entry("element-b"),
        _entry("fixture-a", fixture=True, identity=False),
        _entry("fixture-b", fixture=True, identity=False),
    ]

    report = CatalogCoveragePolicy.evaluate(entries, [], True)

    assert report["C"] == 2
    assert report["V"] == 2
    assert report["release_allowed"] is True
    assert len(report["variants"]) == 4
    assert {row["variant_id"] for row in report["variants"] if row["fixture"]} == {
        "fixture-a",
        "fixture-b",
    }
    assert {row["variant_id"] for row in report["variants"] if not row["fixture"]} == {
        "element-a",
        "element-b",
    }


def test_UT_015_CatalogCoveragePolicy_SingleFailedGate_PreservesHead(tmp_path):
    revision_fixture, manifest = catalog_fixture(tmp_path)
    database = tmp_path / "catalog.sqlite"
    with CatalogRepository(database, workspace=tmp_path) as repo:
        part = repo.add_part("基本磚", "System", "LEGO-Design:3001")
        variant = repo.add_variant(part, {"color": "4"})
        snapshot = repo.create_snapshot("2026-10-10T00:00:00Z", {"setNumber": "10334"})
        repo.put_entry(
            snapshot,
            variant,
            [],
            {"tier": "Basic", "reason": "指定盒組交付"},
            {"name": "基本磚", "designId": "3001", "elementId": "300101"},
        )
        repo.review_scope(snapshot, {"reviewer": "test", "artifact": "authoritative-scope"})
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])

        original_head = repo.head()
        with pytest.raises(GateNotMet):
            repo.publish(snapshot, original_head["version"], "missing-build", "Win64", "a" * 64)
        assert repo.head() == original_head
        assert repo.snapshot(snapshot)["status"] == "Frozen"

        actual_revision = repo.start_revision(
            variant,
            revision_fixture["input_digest"],
            {"tool": "fixture-quality-flow"},
        )
        revision_fixture["revision_id"] = actual_revision
        revision_fixture["variant_id"] = variant
        manifest["revisionId"] = actual_revision
        manifest["variantId"] = variant
        repo.transition_revision(actual_revision, "Building")
        repo.transition_revision(actual_revision, "Validating")
        with repo.transaction():
            repo.connection.execute(
                "UPDATE model_revisions SET manifest_json=? WHERE revision_id=?",
                (canonical_json(manifest), actual_revision),
            )

        revision_row = dict(
            repo.connection.execute(
                "SELECT * FROM model_revisions WHERE revision_id=?",
                (actual_revision,),
            ).fetchone()
        )
        review = quality_review_template(tmp_path, revision_row, manifest)
        for name, item in review["reviews"].items():
            evidence_key = "review-evidence/" + name + ".json"
            evidence_path = tmp_path / evidence_key
            evidence_path.parent.mkdir(parents=True, exist_ok=True)
            evidence_path.write_text(
                canonical_json({
                    "schemaVersion": 1,
                    "reviewType": name,
                    "revisionId": actual_revision,
                    "modelSha256": review["modelSha256"],
                }),
                encoding="utf-8",
            )
            item["decision"] = "Approved"
            item["reviewer"] = "coverage policy verifier"
            item["reason"] = "UT-015 fixture evidence"
            item["evidencePath"] = evidence_key
            item["evidenceSha256"] = hashlib.sha256(evidence_path.read_bytes()).hexdigest()
        (tmp_path / "quality-review.json").write_text(
            canonical_json(review),
            encoding="utf-8",
        )

        complete_revision_quality(repo, tmp_path, actual_revision, "quality-review.json")
        repo.select_revision(snapshot, variant, actual_revision)
        coverage = repo.coverage(snapshot)
        assert coverage["C"] == coverage["V"] == 1
        assert coverage["G"] == 0
        assert coverage["release_allowed"] is True

        toolchain = "c" * 64
        build = repo.record_validation(
            snapshot,
            "Win64",
            toolchain,
            "d" * 64,
            [actual_revision],
        )
        repo.publish(snapshot, original_head["version"], build, "Win64", toolchain)

        assert repo.snapshot(snapshot)["status"] == "Published"
        assert repo.head()["snapshot_id"] == snapshot
        assert repo.head()["version"] == original_head["version"] + 1
