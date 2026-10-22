import csv
import gzip
import hashlib
import json
from pathlib import Path

import pytest

from tools.catalog.lego_pick_a_brick import map_pick_a_brick_set_response
from tools.catalog.set_inventory_identity import (
    load_authoritative_element_bindings,
    resolve_set_inventory_identity,
)


def test_example_set_10334_bulk_inventory_is_auditable_but_not_catalog_eligible_without_set_element_ids():
    brickhigh_root = Path(__file__).resolve().parents[4]
    source_root = brickhigh_root / "artifacts" / "sources" / "rebrickable-20260927"

    report = resolve_set_inventory_identity(source_root, "10334")
    output = brickhigh_root / "artifacts" / "acceptance" / "set-10334-identity-audit.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    assert report["setNumber"] == "10334-1"
    assert report["inventoryRowCount"] > 0
    assert report["inventoryQuantity"] > 0
    assert report["candidateUniqueRowCount"] + report["candidateAmbiguousRowCount"] + report["candidateMissingRowCount"] == report["inventoryRowCount"]
    assert report["catalogEligibleInventoryRowCount"] == 0
    assert report["catalogEligibleElementIdentityCount"] == 0
    assert report["catalogIdentityGapCount"] == report["inventoryRowCount"]
    assert report["catalogGeometryDesignCount"] == 0
    assert report["catalogEligibilityRule"] == (
        "requires-authoritative-set-element-id; Design ID is optional when the official source does not expose one; "
        "missing Design ID uses Element ID as a non-deduplicating geometry fallback; part/color candidates never auto-promote; "
        "official parent bindings may bridge only through one unique pinned B sub-part relationship"
    )


def test_example_set_10334_archived_official_pick_a_brick_promotes_only_verified_element_bindings():
    brickhigh_root = Path(__file__).resolve().parents[4]
    source_root = brickhigh_root / "artifacts" / "sources" / "rebrickable-20260927"
    source_id = "lego-pab-10334-authoritative-20261010-v1"
    exchange_root = brickhigh_root / "artifacts" / "sources" / source_id
    request_path = exchange_root / "request.bin"
    response_path = exchange_root / "response.bin"
    if not request_path.is_file() or not response_path.is_file():
        pytest.skip("真實 LEGO 10334 HTTP exchange archive 不存在，不能偽造 authoritative identity。")

    evidence = map_pick_a_brick_set_response(
        request_path,
        response_path,
        source_root,
        "10334-1",
    )
    assert evidence.mapping.result_count == 276
    assert evidence.mapping.total == 276
    assert len(evidence.mapping.bindings) + len(evidence.mapping.unmapped_element_ids) == 276

    acceptance_root = brickhigh_root / "artifacts" / "acceptance"
    acceptance_root.mkdir(parents=True, exist_ok=True)
    binding_path = acceptance_root / "set-10334-authoritative-element-bindings.json"
    binding_payload = {
        "schemaVersion": 2,
        "setNumber": "10334-1",
        "sourceId": source_id,
        "sourceSha256": evidence.response_sha256,
        "requestSha256": evidence.request_sha256,
        "bindings": [
            {
                "partNum": item.part_num,
                "colorId": item.color_id,
                "elementId": item.element_id,
                "designId": item.design_id,
            }
            for item in evidence.mapping.bindings
        ],
        "unmappedOfficialElementIds": list(evidence.mapping.unmapped_element_ids),
    }
    binding_path.write_text(
        json.dumps(binding_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    verified_bindings = load_authoritative_element_bindings(
        binding_path,
        response_path,
        "10334-1",
    )

    special_source_id = "lego-10334-bi-build-translate"
    special_source_path = (
        brickhigh_root / "artifacts" / "sources" / special_source_id / "source.bin"
    )
    if not special_source_path.is_file():
        pytest.skip("官方 LEGO 10334 Building Instructions archive 不存在，不能偽造 Element-only identity。")
    special_source_sha256 = hashlib.sha256(special_source_path.read_bytes()).hexdigest()
    assert special_source_sha256 == "5031a85cc6ae1350a16a3419a44c25ce6ef2aaf9f15aebcc4f9b554b16655177"
    special_binding_path = acceptance_root / "set-10334-element-only-bindings.json"
    special_binding_path.write_text(
        json.dumps(
            {
                "schemaVersion": 2,
                "setNumber": "10334-1",
                "sourceId": special_source_id,
                "sourceSha256": special_source_sha256,
                "evidenceKind": "official-element-membership-with-manual-inventory-reconciliation",
                "sourcePage": 198,
                "sourceObservation": "native PDF text lists 1x Element 6488969",
                "bindings": [
                    {
                        "partNum": "3677c02",
                        "colorId": "323",
                        "elementId": "6488969",
                        "designId": None,
                        "reconciliationKind": "manual-element-only",
                    }
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    special_bindings = load_authoritative_element_bindings(
        special_binding_path,
        special_source_path,
        "10334-1",
    )
    assert len(special_bindings) == 1
    all_bindings = (*verified_bindings, *special_bindings)

    baseline_report = resolve_set_inventory_identity(source_root, "10334")
    inventory_keys = {
        (item["partNum"], item["colorId"])
        for item in baseline_report["items"]
    }
    matching_bindings = tuple(
        item
        for item in verified_bindings
        if (item.part_num, item.color_id) in inventory_keys
    )
    extra_bindings = tuple(
        item
        for item in verified_bindings
        if (item.part_num, item.color_id) not in inventory_keys
    )
    relationship_rows = []
    relationship_path = source_root / "part_relationships.csv.gz"
    with gzip.open(relationship_path, "rt", encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            if {"36752", "36752a", "3677c02"} & {
                str(value).strip() for value in row.values()
            }:
                relationship_rows.append(dict(row))

    reconciliation_path = acceptance_root / "set-10334-authoritative-reconciliation-gaps.json"
    reconciliation_path.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "setNumber": "10334-1",
                "sourceId": source_id,
                "officialResultCount": evidence.mapping.result_count,
                "mappedOfficialElementCount": len(verified_bindings),
                "unmappedOfficialElementIds": list(evidence.mapping.unmapped_element_ids),
                "matchingInventoryBindingCount": len(matching_bindings),
                "extraBindingCount": len(extra_bindings),
                "extraBindings": [
                    {
                        "partNum": item.part_num,
                        "colorId": item.color_id,
                        "elementId": item.element_id,
                    }
                    for item in extra_bindings
                ],
                "relevantPinnedPartRelationships": relationship_rows,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    report = resolve_set_inventory_identity(
        source_root,
        "10334",
        all_bindings,
    )
    output = acceptance_root / "set-10334-authoritative-identity-audit.json"
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    reconciliation_payload = json.loads(reconciliation_path.read_text(encoding="utf-8"))
    reconciliation_payload.update({
        "reconciledSubpartRowCount": report["catalogReconciledSubpartRowCount"],
        "reconciledSubpartBindings": [
            {
                "inventoryPartNum": item["partNum"],
                "colorId": item["colorId"],
                **identity,
            }
            for item in report["items"]
            for identity in item["authoritativeIdentities"]
            if identity.get("reconciledVia") == "pinned-B-subpart"
        ],
        "elementFallbackBindings": [
            {
                "inventoryPartNum": item["partNum"],
                "colorId": item["colorId"],
                **identity,
            }
            for item in report["items"]
            for identity in item["authoritativeIdentities"]
            if identity.get("geometryIdentityKind") == "element-fallback"
        ],
        "remainingIdentityGapCount": report["catalogIdentityGapCount"],
        "remainingIdentityGaps": report["catalogIdentityGaps"],
    })
    reconciliation_path.write_text(
        json.dumps(reconciliation_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    assert report["setNumber"] == "10334-1"
    assert report["inventoryRowCount"] == 276
    assert report["catalogEligibleInventoryRowCount"] == 276
    assert report["catalogEligibleElementIdentityCount"] == 277
    assert report["catalogGeometryDesignCount"] == 184
    assert report["catalogGeometryElementFallbackCount"] == 1
    assert report["catalogGeometryElementFallbackIds"] == ["6488969"]
    assert report["catalogGeometryIdentityCount"] == 185
    assert report["catalogIdentityGapCount"] == 0
    assert report["catalogIdentityGaps"] == []
    assert report["catalogReconciledSubpartRowCount"] == 1
    assert report["catalogElementFallbackRowCount"] == 1
    bridged = next(item for item in report["items"] if item["partNum"] == "36752a" and item["colorId"] == "4")
    assert bridged["authoritativeIdentities"] == [{
        "elementId": "6474268",
        "designId": "36752",
        "officialPartNum": "36752",
        "reconciledVia": "pinned-B-subpart",
    }]
    special = next(
        item
        for item in report["items"]
        if item["partNum"] == "3677c02" and item["colorId"] == "323"
    )
    assert special["authoritativeIdentities"] == [{
        "elementId": "6488969",
        "designId": None,
        "geometryFallbackElementId": "6488969",
        "geometryIdentityKind": "element-fallback",
        "reconciledVia": "manual-element-only",
    }]
    assert len(matching_bindings) + len(extra_bindings) == len(verified_bindings)
