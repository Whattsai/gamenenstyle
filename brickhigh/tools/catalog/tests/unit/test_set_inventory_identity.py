import csv
import gzip
import hashlib
import json

import pytest

from tools.catalog.set_inventory_identity import (
    AuthoritativeElementBinding,
    SetInventoryIdentityError,
    load_authoritative_element_bindings,
    resolve_set_inventory_identity,
)


def _write_gzip_csv(path, fields, rows):
    with gzip.open(path, "wt", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def _append_gzip_csv_row(path, fields, row):
    with gzip.open(path, "at", encoding="utf-8", newline="") as handle:
        csv.DictWriter(handle, fieldnames=fields).writerow(row)


def _source_root(tmp_path):
    root = tmp_path / "rebrickable"
    root.mkdir()
    _write_gzip_csv(
        root / "inventories.csv.gz",
        ["id", "version", "set_num"],
        [
            {"id": "10", "version": "1", "set_num": "10334-1"},
            {"id": "11", "version": "2", "set_num": "10334-1"},
            {"id": "20", "version": "1", "set_num": "10334-2"},
        ],
    )
    _write_gzip_csv(
        root / "inventory_parts.csv.gz",
        ["inventory_id", "part_num", "color_id", "quantity", "is_spare"],
        [
            {"inventory_id": "10", "part_num": "old", "color_id": "4", "quantity": "1", "is_spare": "f"},
            {"inventory_id": "11", "part_num": "11211", "color_id": "18", "quantity": "2", "is_spare": "f"},
            {"inventory_id": "11", "part_num": "11211", "color_id": "272", "quantity": "1", "is_spare": "f"},
            {"inventory_id": "11", "part_num": "3001", "color_id": "4", "quantity": "4", "is_spare": "t"},
            {"inventory_id": "20", "part_num": "alternate", "color_id": "4", "quantity": "1", "is_spare": "f"},
        ],
    )
    _write_gzip_csv(
        root / "inventory_minifigs.csv.gz",
        ["inventory_id", "fig_num", "quantity"],
        [],
    )
    _write_gzip_csv(
        root / "inventory_sets.csv.gz",
        ["inventory_id", "set_num", "quantity"],
        [],
    )
    _write_gzip_csv(
        root / "elements.csv.gz",
        ["element_id", "part_num", "color_id", "design_id"],
        [
            {"element_id": "6411587", "part_num": "11211", "color_id": "18", "design_id": "11211"},
            {"element_id": "6135606", "part_num": "11211", "color_id": "272", "design_id": "11211"},
            {"element_id": "300121", "part_num": "3001", "color_id": "4", "design_id": "3001"},
            {"element_id": "300124", "part_num": "3001", "color_id": "4", "design_id": "3001"},
        ],
    )
    _write_gzip_csv(
        root / "colors.csv.gz",
        ["id", "name"],
        [
            {"id": "4", "name": "Red"},
            {"id": "18", "name": "Medium Nougat"},
            {"id": "272", "name": "Earth Blue"},
        ],
    )
    _write_gzip_csv(
        root / "part_relationships.csv.gz",
        ["rel_type", "child_part_num", "parent_part_num"],
        [],
    )
    return root


def test_candidate_crosswalk_never_auto_promotes_to_set_scoped_identity(tmp_path):
    report = resolve_set_inventory_identity(_source_root(tmp_path), "10334")

    assert report["setNumber"] == "10334-1"
    assert report["inventoryVersion"] == 2
    assert report["inventoryId"] == 11
    assert report["inventoryRowCount"] == 3
    assert report["inventoryQuantity"] == 7
    assert report["candidateUniqueRowCount"] == 2
    assert report["candidateAmbiguousRowCount"] == 1
    assert report["candidateMissingRowCount"] == 0
    assert report["catalogEligibleInventoryRowCount"] == 0
    assert report["catalogEligibleElementIdentityCount"] == 0
    assert report["catalogIdentityGapCount"] == 3
    assert all(not item["catalogEligible"] for item in report["items"])


def test_authoritative_elements_resolve_variants_and_dedupe_geometry_by_design(tmp_path):
    bindings = [
        AuthoritativeElementBinding("11211", "18", "6411587"),
        AuthoritativeElementBinding("11211", "272", "6135606"),
        AuthoritativeElementBinding("3001", "4", "300121"),
    ]

    report = resolve_set_inventory_identity(_source_root(tmp_path), "10334-1", bindings)

    assert report["catalogEligibleInventoryRowCount"] == 3
    assert report["catalogEligibleElementIdentityCount"] == 3
    assert report["catalogGeometryDesignCount"] == 2
    assert report["catalogGeometryDesignIds"] == ["11211", "3001"]
    assert report["catalogIdentityGapCount"] == 0
    identities = [identity for item in report["items"] for identity in item["authoritativeIdentities"]]
    assert {item["elementId"] for item in identities} == {"6411587", "6135606", "300121"}
    assert [item["designId"] for item in identities].count("11211") == 2


def test_authoritative_binding_evidence_is_bound_to_raw_source_bytes(tmp_path):
    source = tmp_path / "lego-10334.raw"
    source.write_bytes(b"official-set-source-v1")
    evidence = tmp_path / "bindings.json"
    evidence.write_text(json.dumps({
        "schemaVersion": 1,
        "setNumber": "10334-1",
        "sourceId": "lego-10334-official",
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "bindings": [
            {"partNum": "11211", "colorId": "18", "elementId": "6411587"},
            {"partNum": "11211", "colorId": "272", "elementId": "6135606"},
        ],
    }), encoding="utf-8")

    bindings = load_authoritative_element_bindings(evidence, source, "10334-1")
    assert bindings == (
        AuthoritativeElementBinding("11211", "18", "6411587"),
        AuthoritativeElementBinding("11211", "272", "6135606"),
    )

    source.write_bytes(b"tampered")
    with pytest.raises(SetInventoryIdentityError, match="SHA-256"):
        load_authoritative_element_bindings(evidence, source, "10334-1")


def test_authoritative_binding_evidence_rejects_wrong_set_number(tmp_path):
    source = tmp_path / "lego-10334.raw"
    source.write_bytes(b"official-set-source-v1")
    evidence = tmp_path / "bindings.json"
    evidence.write_text(json.dumps({
        "schemaVersion": 1,
        "setNumber": "10334-1",
        "sourceId": "lego-10334-official",
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "bindings": [
            {"partNum": "11211", "colorId": "18", "elementId": "6411587"},
        ],
    }), encoding="utf-8")

    with pytest.raises(SetInventoryIdentityError, match="set number"):
        load_authoritative_element_bindings(evidence, source, "10335-1")


def test_authoritative_binding_evidence_rejects_invalid_source_hash(tmp_path):
    source = tmp_path / "lego-10334.raw"
    source.write_bytes(b"official-set-source-v1")
    evidence = tmp_path / "bindings.json"
    evidence.write_text(json.dumps({
        "schemaVersion": 1,
        "setNumber": "10334-1",
        "sourceId": "lego-10334-official",
        "sourceSha256": "not-a-sha256",
        "bindings": [
            {"partNum": "11211", "colorId": "18", "elementId": "6411587"},
        ],
    }), encoding="utf-8")

    with pytest.raises(SetInventoryIdentityError, match="有效 source SHA-256"):
        load_authoritative_element_bindings(evidence, source, "10334-1")


def test_authoritative_binding_evidence_rejects_conflicting_element_owner(tmp_path):
    source = tmp_path / "lego-10334.raw"
    source.write_bytes(b"official-set-source-v1")
    evidence = tmp_path / "bindings.json"
    evidence.write_text(json.dumps({
        "schemaVersion": 1,
        "setNumber": "10334-1",
        "sourceId": "lego-10334-official",
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "bindings": [
            {"partNum": "11211", "colorId": "18", "elementId": "6411587"},
            {"partNum": "3001", "colorId": "4", "elementId": "6411587"},
        ],
    }), encoding="utf-8")

    with pytest.raises(SetInventoryIdentityError, match="互相衝突"):
        load_authoritative_element_bindings(evidence, source, "10334-1")


def test_authoritative_binding_evidence_dedupes_exact_duplicates(tmp_path):
    source = tmp_path / "lego-10334.raw"
    source.write_bytes(b"official-set-source-v1")
    evidence = tmp_path / "bindings.json"
    evidence.write_text(json.dumps({
        "schemaVersion": 1,
        "setNumber": "10334-1",
        "sourceId": "lego-10334-official",
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "bindings": [
            {"partNum": "11211", "colorId": "18", "elementId": "6411587"},
            {"partNum": "11211", "colorId": "18", "elementId": "6411587"},
        ],
    }), encoding="utf-8")

    assert load_authoritative_element_bindings(evidence, source, "10334-1") == (
        AuthoritativeElementBinding("11211", "18", "6411587"),
    )


def test_schema_v2_element_only_evidence_preserves_explicit_reconciliation(tmp_path):
    source = tmp_path / "lego-10334.raw"
    source.write_bytes(b"official-element-membership")
    evidence = tmp_path / "bindings.json"
    evidence.write_text(json.dumps({
        "schemaVersion": 2,
        "setNumber": "10334-1",
        "sourceId": "lego-10334-bi",
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "bindings": [{
            "partNum": "3677c02",
            "colorId": "323",
            "elementId": "6488969",
            "designId": None,
            "reconciliationKind": "manual-element-only",
        }],
    }), encoding="utf-8")

    assert load_authoritative_element_bindings(evidence, source, "10334-1") == (
        AuthoritativeElementBinding(
            "3677c02",
            "323",
            "6488969",
            None,
            "manual-element-only",
        ),
    )


def test_authoritative_element_without_public_design_uses_element_geometry_fallback(tmp_path):
    root = _source_root(tmp_path)
    _append_gzip_csv_row(
        root / "inventory_parts.csv.gz",
        ["inventory_id", "part_num", "color_id", "quantity", "is_spare"],
        {"inventory_id": "11", "part_num": "3677c02", "color_id": "323", "quantity": "1", "is_spare": "f"},
    )

    report = resolve_set_inventory_identity(
        root,
        "10334-1",
        [
            AuthoritativeElementBinding(
                "3677c02",
                "323",
                "6488969",
                None,
                "manual-element-only",
            )
        ],
    )

    special = next(item for item in report["items"] if item["partNum"] == "3677c02")
    assert special["catalogEligible"] is True
    assert special["authoritativeIdentities"] == [{
        "elementId": "6488969",
        "designId": None,
        "geometryFallbackElementId": "6488969",
        "geometryIdentityKind": "element-fallback",
        "reconciledVia": "manual-element-only",
    }]
    assert report["catalogEligibleElementIdentityCount"] == 1
    assert report["catalogGeometryDesignCount"] == 0
    assert report["catalogGeometryElementFallbackCount"] == 1
    assert report["catalogGeometryElementFallbackIds"] == ["6488969"]
    assert report["catalogGeometryIdentityCount"] == 1
    assert report["catalogGeometryIdentityKeys"] == ["element:6488969"]
    assert report["catalogElementFallbackRowCount"] == 1
    assert report["catalogIdentityGapCount"] == 3


def test_unmapped_element_without_explicit_element_only_reconciliation_is_rejected(tmp_path):
    root = _source_root(tmp_path)
    _append_gzip_csv_row(
        root / "inventory_parts.csv.gz",
        ["inventory_id", "part_num", "color_id", "quantity", "is_spare"],
        {"inventory_id": "11", "part_num": "3677c02", "color_id": "323", "quantity": "1", "is_spare": "f"},
    )

    with pytest.raises(SetInventoryIdentityError, match="manual-element-only"):
        resolve_set_inventory_identity(
            root,
            "10334-1",
            [AuthoritativeElementBinding("3677c02", "323", "6488969")],
        )


def test_authoritative_element_must_match_same_part_and_color(tmp_path):
    bindings = [AuthoritativeElementBinding("11211", "18", "6135606")]

    with pytest.raises(SetInventoryIdentityError, match="part/color"):
        resolve_set_inventory_identity(_source_root(tmp_path), "10334-1", bindings)


def test_authoritative_binding_cannot_add_part_outside_set_inventory(tmp_path):
    bindings = [AuthoritativeElementBinding("99999", "4", "300121")]

    with pytest.raises(SetInventoryIdentityError, match="唯一 pinned B"):
        resolve_set_inventory_identity(_source_root(tmp_path), "10334-1", bindings)


def test_unique_pinned_B_subpart_reconciles_official_parent_binding(tmp_path):
    root = _source_root(tmp_path)
    _append_gzip_csv_row(
        root / "inventory_parts.csv.gz",
        ["inventory_id", "part_num", "color_id", "quantity", "is_spare"],
        {"inventory_id": "11", "part_num": "36752a", "color_id": "4", "quantity": "1", "is_spare": "f"},
    )
    _append_gzip_csv_row(
        root / "elements.csv.gz",
        ["element_id", "part_num", "color_id", "design_id"],
        {"element_id": "6474268", "part_num": "36752", "color_id": "4", "design_id": "36752"},
    )
    _append_gzip_csv_row(
        root / "part_relationships.csv.gz",
        ["rel_type", "child_part_num", "parent_part_num"],
        {"rel_type": "B", "child_part_num": "36752a", "parent_part_num": "36752"},
    )

    report = resolve_set_inventory_identity(
        root,
        "10334-1",
        [AuthoritativeElementBinding("36752", "4", "6474268")],
    )

    child = next(item for item in report["items"] if item["partNum"] == "36752a")
    assert child["catalogEligible"] is True
    assert child["authoritativeIdentities"] == [{
        "elementId": "6474268",
        "designId": "36752",
        "officialPartNum": "36752",
        "reconciledVia": "pinned-B-subpart",
    }]
    assert report["catalogReconciledSubpartRowCount"] == 1
    assert report["catalogEligibleElementIdentityCount"] == 1
    assert report["catalogGeometryDesignIds"] == ["36752"]


def test_pinned_B_subpart_bridge_rejects_ambiguous_inventory_children(tmp_path):
    root = _source_root(tmp_path)
    for child in ("36752a", "36752b"):
        _append_gzip_csv_row(
            root / "inventory_parts.csv.gz",
            ["inventory_id", "part_num", "color_id", "quantity", "is_spare"],
            {"inventory_id": "11", "part_num": child, "color_id": "4", "quantity": "1", "is_spare": "f"},
        )
        _append_gzip_csv_row(
            root / "part_relationships.csv.gz",
            ["rel_type", "child_part_num", "parent_part_num"],
            {"rel_type": "B", "child_part_num": child, "parent_part_num": "36752"},
        )
    _append_gzip_csv_row(
        root / "elements.csv.gz",
        ["element_id", "part_num", "color_id", "design_id"],
        {"element_id": "6474268", "part_num": "36752", "color_id": "4", "design_id": "36752"},
    )

    with pytest.raises(SetInventoryIdentityError, match="唯一 pinned B"):
        resolve_set_inventory_identity(
            root,
            "10334-1",
            [AuthoritativeElementBinding("36752", "4", "6474268")],
        )


def test_bare_set_number_prefers_dash_one_when_multiple_set_variants_exist(tmp_path):
    report = resolve_set_inventory_identity(_source_root(tmp_path), "10334")
    assert report["setNumber"] == "10334-1"


def test_minifig_and_subset_inventories_are_recursively_expanded_and_quantities_aggregated(tmp_path):
    root = _source_root(tmp_path)
    _write_gzip_csv(
        root / "inventories.csv.gz",
        ["id", "version", "set_num"],
        [
            {"id": "11", "version": "2", "set_num": "10334-1"},
            {"id": "30", "version": "1", "set_num": "fig-001"},
            {"id": "40", "version": "1", "set_num": "50000-1"},
        ],
    )
    _write_gzip_csv(
        root / "inventory_parts.csv.gz",
        ["inventory_id", "part_num", "color_id", "quantity", "is_spare"],
        [
            {"inventory_id": "11", "part_num": "11211", "color_id": "18", "quantity": "2", "is_spare": "f"},
            {"inventory_id": "30", "part_num": "3001", "color_id": "4", "quantity": "1", "is_spare": "f"},
            {"inventory_id": "40", "part_num": "11211", "color_id": "18", "quantity": "3", "is_spare": "f"},
            {"inventory_id": "40", "part_num": "3001", "color_id": "4", "quantity": "1", "is_spare": "t"},
        ],
    )
    _write_gzip_csv(
        root / "inventory_minifigs.csv.gz",
        ["inventory_id", "fig_num", "quantity"],
        [{"inventory_id": "11", "fig_num": "fig-001", "quantity": "2"}],
    )
    _write_gzip_csv(
        root / "inventory_sets.csv.gz",
        ["inventory_id", "set_num", "quantity"],
        [{"inventory_id": "11", "set_num": "50000-1", "quantity": "2"}],
    )

    report = resolve_set_inventory_identity(root, "10334")

    assert report["inventoryId"] == 11
    assert report["inventoryVersion"] == 2
    assert report["expandedInventoryCount"] == 3
    assert report["expandedMinifigureQuantity"] == 2
    assert report["expandedSubsetQuantity"] == 2
    assert {item["kind"] for item in report["inventoryExpansion"]} == {"root", "minifigure", "subset"}
    by_key = {(item["partNum"], item["colorId"]): item for item in report["items"]}
    assert by_key[("11211", "18")]["quantity"] == 8
    assert by_key[("11211", "18")]["normalQuantity"] == 8
    assert by_key[("3001", "4")]["quantity"] == 4
    assert by_key[("3001", "4")]["normalQuantity"] == 2
    assert by_key[("3001", "4")]["spareQuantity"] == 2
    assert by_key[("3001", "4")]["isSpareOnly"] is False
    assert report["inventoryQuantity"] == 12
    assert report["catalogEligibleElementIdentityCount"] == 0
