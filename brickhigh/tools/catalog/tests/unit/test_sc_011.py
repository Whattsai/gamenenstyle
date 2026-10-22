"""SC-011：source revision 身分必須對來源、metadata 與工具鏈變更敏感。"""

from copy import deepcopy

import pytest

from tools.catalog.building import revision_input_digest
from tools.catalog.repository import CatalogRepository


BASE_ITEM = {
    "variantId": "11111111-1111-4111-8111-111111111111",
    "part": "3001.dat",
    "colour": "4",
    "metadata": {"path": "metadata.json", "sha256": "a" * 64},
}
BASE_TOOLCHAIN = {"importerCommit": "b" * 40, "scripts": {"building.py": "c" * 64}}
BASE_SOURCE = {"filename": "3001.dat", "dependencyDigest": "d" * 64}


def _changed_identity(change_kind):
    item = deepcopy(BASE_ITEM)
    toolchain = deepcopy(BASE_TOOLCHAIN)
    source = deepcopy(BASE_SOURCE)
    if change_kind == "source":
        source["dependencyDigest"] = "e" * 64
    elif change_kind == "metadata":
        item["metadata"]["sha256"] = "f" * 64
    elif change_kind == "toolchain":
        toolchain["scripts"]["building.py"] = "1" * 64
    else:
        raise AssertionError(change_kind)
    return item, toolchain, source


def test_UT_031_SetDrivenSuccessor_AllowsSameBaselineAndPreservesPublishedParent(tmp_path):
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        part = repo.add_part("Brick 2 x 4", "System", "LEGO-Design:3001")
        variant = repo.add_variant(part, {"colour": "Red"})
        parent = repo.create_snapshot("2026-09-08T15:59:59Z", {"setNumbers": ["fixture-a"]})
        repo.put_entry(parent, variant, ["e1"], {}, {"designId": "3001", "elementId": "300101"})
        repo.freeze(parent, repo.snapshot(parent)["version"])
        repo.connection.execute("UPDATE snapshots SET status='Published' WHERE snapshot_id=?", (parent,))
        parent_before = repo.snapshot(parent)
        entries_before = repo.entries(parent)

        successor = repo.fork(parent, parent_before["baseline_at"])
        new_part = repo.add_part("BRICK 1X2 W. 2 KNOBS", "System", "LEGO-Design:11211")
        new_variant = repo.add_variant(new_part, {"colour": "Medium Nougat"})
        repo.put_entry(successor, new_variant, ["e2"], {}, {
            "designId": "11211", "elementId": "6411587", "setNumber": "fixture-set"
        })

        assert repo.snapshot(parent) == parent_before
        assert repo.entries(parent) == entries_before
        assert repo.snapshot(successor)["baseline_at"] == parent_before["baseline_at"]
        assert new_variant not in {row["variant_id"] for row in repo.entries(parent)}
        assert new_variant in {row["variant_id"] for row in repo.entries(successor)}


def test_revision_build_policy_same_identity_is_stable():
    first = revision_input_digest(BASE_ITEM, BASE_TOOLCHAIN, BASE_SOURCE)
    again = revision_input_digest(deepcopy(BASE_ITEM), deepcopy(BASE_TOOLCHAIN), deepcopy(BASE_SOURCE))
    assert first == again


@pytest.mark.parametrize("change_kind", ["source", "metadata", "toolchain"])
def test_revision_build_policy_changed_source_creates_revision_identity(change_kind):
    original = revision_input_digest(BASE_ITEM, BASE_TOOLCHAIN, BASE_SOURCE)
    item, toolchain, source = _changed_identity(change_kind)
    assert revision_input_digest(item, toolchain, source) != original
