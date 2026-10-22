"""Gate 2 固定 20 件：核對來源 part、LEGO Design ID 與 Element ID 身份。"""

import csv
import gzip
import hashlib
import json
import re
from pathlib import Path

from tools.acceptance.audit_internal_model_set import MODEL_DIRS
from tools.catalog.set_inventory_identity import resolve_set_inventory_identity


PROJECT = Path(__file__).resolve().parents[4]
DATASET_ROOT = PROJECT / "artifacts/sources/rebrickable-20260927"
REPORT = PROJECT / "artifacts/acceptance/gate2-fixed20-part-crosswalk.json"
IDENTITY_EVIDENCE = PROJECT / "tools/acceptance/fixtures/gate2-973p06-identity.json"


def _sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _source_design_hint(source_part):
    match = re.match(r"^(\d+)", source_part)
    return match.group(1) if match else None


def _normalise_colour_name(value):
    return re.sub(r"[^a-z0-9]", "", str(value).lower().replace("grey", "gray"))


def _model_ldraw_colour(conversion):
    colours = {
        (item.get("ldrawColour"), item.get("source", {}).get("name"))
        for item in conversion.get("materialComparisons", [])
        if item.get("ldrawColour") not in (None, "16")
    }
    return next(iter(colours)) if len(colours) == 1 else (None, None)


def test_gate2_fixed20_part_numbers_are_crosswalked_against_pinned_dataset():
    manifest_path = DATASET_ROOT / "download-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    parts_entry = next(item for item in manifest["datasets"] if item["name"] == "parts.csv.gz")
    parts_path = DATASET_ROOT / parts_entry["name"]
    assert _sha(parts_path) == parts_entry["sha256"]

    with gzip.open(parts_path, "rt", encoding="utf-8-sig", newline="") as stream:
        records = {row["part_num"]: row for row in csv.DictReader(stream)}

    colors_entry = next(item for item in manifest["datasets"] if item["name"] == "colors.csv.gz")
    colors_path = DATASET_ROOT / colors_entry["name"]
    assert _sha(colors_path) == colors_entry["sha256"]
    with gzip.open(colors_path, "rt", encoding="utf-8-sig", newline="") as stream:
        rebrickable_colors = {
            _normalise_colour_name(row["name"]): row["id"]
            for row in csv.DictReader(stream)
        }

    elements_entry = next(item for item in manifest["datasets"] if item["name"] == "elements.csv.gz")
    elements_path = DATASET_ROOT / elements_entry["name"]
    assert _sha(elements_path) == elements_entry["sha256"]
    elements_by_part = {}
    with gzip.open(elements_path, "rt", encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            elements_by_part.setdefault(row.get("part_num"), []).append(row)

    items = []
    for folder in MODEL_DIRS:
        conversion = json.loads((PROJECT / "artifacts/models" / folder / "conversion.json").read_text(encoding="utf-8"))
        source_part = Path(conversion["source"]["filename"]).stem
        record = records.get(source_part)
        element_rows = elements_by_part.get(source_part, [])
        design_ids = sorted({row.get("design_id") for row in element_rows if row.get("design_id")})
        element_ids = sorted({row.get("element_id") for row in element_rows if row.get("element_id")})
        color_ids = sorted({row.get("color_id") for row in element_rows if row.get("color_id")})
        design_hint = _source_design_hint(source_part)
        model_ldraw_colour, model_colour_name = _model_ldraw_colour(conversion)
        rebrickable_colour_id = rebrickable_colors.get(_normalise_colour_name(model_colour_name)) if model_colour_name else None
        colour_rows = [
            row for row in element_rows
            if rebrickable_colour_id is not None and row.get("color_id") == rebrickable_colour_id
        ]
        appearance_design_ids = sorted({row.get("design_id") for row in colour_rows if row.get("design_id")})

        if design_hint in appearance_design_ids:
            canonical_design_id = design_hint
            design_resolution = "appearance-colour-and-numeric-source-part"
        elif len(appearance_design_ids) == 1:
            canonical_design_id = appearance_design_ids[0]
            design_resolution = "appearance-colour-single-design"
        elif not appearance_design_ids and design_hint in design_ids:
            canonical_design_id = design_hint
            design_resolution = "geometry-design-only-no-pinned-element-alias"
        elif not appearance_design_ids and len(design_ids) == 1:
            canonical_design_id = design_ids[0]
            design_resolution = "single-design-only-no-pinned-element-alias"
        else:
            canonical_design_id = None
            design_resolution = "unresolved"

        appearance_rows = [row for row in colour_rows if row.get("design_id") == canonical_design_id]
        canonical_element_ids = sorted({row.get("element_id") for row in appearance_rows if row.get("element_id")})
        if canonical_element_ids:
            appearance_identity_status = "verified-element-alias"
        elif canonical_design_id and rebrickable_colour_id is not None:
            appearance_identity_status = "no-pinned-element-alias"
        else:
            appearance_identity_status = "unresolved"
        items.append({
            "folder": folder,
            "sourcePart": source_part,
            "exactPartNumberMatch": record is not None,
            "record": record,
            "legoDesignIds": design_ids,
            "legoElementIds": element_ids,
            "elementColorIds": color_ids,
            "modelLdrawColour": model_ldraw_colour,
            "modelColourName": model_colour_name,
            "rebrickableColourId": rebrickable_colour_id,
            "appearanceDesignIds": appearance_design_ids,
            "canonicalLegoDesignId": canonical_design_id,
            "canonicalDesignResolution": design_resolution,
            "canonicalAppearanceElementIds": canonical_element_ids,
            "appearanceIdentityStatus": appearance_identity_status,
            "legoDesignIdResolved": bool(canonical_design_id),
            "legoElementIdResolved": bool(canonical_element_ids),
        })

    exact_count = sum(item["exactPartNumberMatch"] for item in items)
    unmatched = [item["sourcePart"] for item in items if not item["exactPartNumberMatch"]]
    # fixed-20 目前只剩舊 LDraw pattern 973p06 未能 exact match；不可靜默接受 alias。
    assert exact_count == 19
    assert unmatched == ["973p06"]
    exact_items = [item for item in items if item["exactPartNumberMatch"]]
    assert len(items) == 20
    assert all(item["canonicalLegoDesignId"] for item in exact_items)
    assert all(item["modelLdrawColour"] for item in exact_items)
    assert all(item["rebrickableColourId"] for item in exact_items)
    assert all(item["appearanceIdentityStatus"] in {"verified-element-alias", "no-pinned-element-alias"} for item in exact_items)
    no_pinned_element_aliases = [item["folder"] for item in exact_items if item["appearanceIdentityStatus"] == "no-pinned-element-alias"]
    assert sum(item["legoElementIdResolved"] for item in items) == 15
    assert {item["sourcePart"] for item in items if not item["legoElementIdResolved"]} == {
        "3001", "973p06", "2780", "14417", "14418"
    }
    assert set(no_pinned_element_aliases) == {
        "pm-20260923-transparent-color47",
        "pm-20260923-technic-pin-2780",
        "pm-20260927-expansion-v1/14417-colour7",
        "pm-20260927-expansion-v1/14418-colour7",
    }

    relationships_entry = next(item for item in manifest["datasets"] if item["name"] == "part_relationships.csv.gz")
    relationships_path = DATASET_ROOT / relationships_entry["name"]
    assert _sha(relationships_path) == relationships_entry["sha256"]
    relationship_candidates = []
    with gzip.open(relationships_path, "rt", encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            for source_part in unmatched:
                if source_part not in {row["child_part_num"], row["parent_part_num"]}:
                    continue
                related = row["parent_part_num"] if row["child_part_num"] == source_part else row["child_part_num"]
                relationship_candidates.append({
                    "sourcePart": source_part,
                    "relType": row["rel_type"],
                    "childPartNum": row["child_part_num"],
                    "parentPartNum": row["parent_part_num"],
                    "relatedPart": related,
                    "relatedPartExists": related in records,
                    "relatedRecord": records.get(related),
                })
    # 封存 relationships dataset 對 973p06 也沒有可追溯關聯；不能把人工 alias 偽裝成 Rebrickable exact/relationship row。
    assert relationship_candidates == []

    identity = json.loads(IDENTITY_EVIDENCE.read_text(encoding="utf-8"))
    assert identity["schemaVersion"] == 1
    assert identity["sourcePart"] == "973p06"
    assert identity["claimScope"] == "identity-only"
    assert identity["rebrickableExactMatch"] is False
    assert identity["legoDesignId"] is None
    assert identity["legoElementIds"] == []
    assert identity["ldraw"]["basePart"] == "973"
    assert identity["ldraw"]["patternPart"] == "973p06"
    assert identity["ldraw"]["title"] == "Minifig Torso with Blue V-Neck, Pockets and 3 Buttons Pattern"
    assert identity["externalAliases"] == [{
        "provider": "BrickLink",
        "externalId": "973pb0069",
        "title": "Torso Vest with Pockets and Buttons over Blue Shirt Pattern",
        "url": "https://www.bricklink.com/catalogList.asp?catID=150&catType=P&catXrefLevel=0&pg=135&v=1&viewWanted=Y",
    }]
    assert set(identity["disallowedClaims"]) == {
        "RebrickableExactMatch", "OfficialLegoDesignId", "OfficialLegoElementId", "Ready"
    }
    assert identity["review"]["observedAt"] == "2026-10-02"
    assert identity["review"]["rationale"].strip()

    set_10334 = resolve_set_inventory_identity(DATASET_ROOT, "10334")
    set_10334_rows = {
        (row["partNum"], row["colorId"]): row
        for row in set_10334["items"]
    }
    set_10334_parts = {row["partNum"] for row in set_10334["items"]}
    for item in items:
        appearance_key = (item["sourcePart"], item["rebrickableColourId"])
        appearance_row = set_10334_rows.get(appearance_key) if item["rebrickableColourId"] is not None else None
        item["set10334PartPresent"] = item["sourcePart"] in set_10334_parts
        item["set10334AppearancePresent"] = appearance_row is not None
        item["set10334NormalQuantity"] = appearance_row["normalQuantity"] if appearance_row else 0
        item["set10334SpareQuantity"] = appearance_row["spareQuantity"] if appearance_row else 0

    part_overlap = [item["sourcePart"] for item in items if item["set10334PartPresent"]]
    appearance_overlap = [item["sourcePart"] for item in items if item["set10334AppearancePresent"]]
    assert len(part_overlap) == 7
    assert appearance_overlap == []
    assert set_10334["catalogEligibleElementIdentityCount"] == 0

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({
        "schemaVersion": 4,
        "purpose": "Gate 2 fixed-20 pinned bulk identity crosswalk; specified-set inventory identity is a separate required gate",
        "identityEvidenceScope": "pinned-bulk-dataset-not-specified-set-inventory",
        "sourceManifest": str(manifest_path.relative_to(PROJECT)).replace("\\\\", "/"),
        "sourceManifestSha256": _sha(manifest_path),
        "partsDatasetSha256": parts_entry["sha256"],
        "colorsDatasetSha256": colors_entry["sha256"],
        "elementsDatasetSha256": elements_entry["sha256"],
        "itemCount": len(items),
        "exactMatchCount": exact_count,
        "unmatched": unmatched,
        "externalIdentityEvidenceCount": 1,
        "pinnedDatasetDesignIdResolvedCount": sum(item["legoDesignIdResolved"] for item in items),
        "pinnedDatasetElementAliasResolvedCount": sum(item["legoElementIdResolved"] for item in items),
        "pinnedDatasetElementAliasGapCount": sum(not item["legoElementIdResolved"] for item in items),
        "thirdPartySpecifiedSetNumber": set_10334["setNumber"],
        "thirdPartySpecifiedSetInventoryId": set_10334["inventoryId"],
        "thirdPartySpecifiedSetInventoryVersion": set_10334["inventoryVersion"],
        "fixed20PartOverlapCount": len(part_overlap),
        "fixed20PartOverlap": part_overlap,
        "fixed20AppearanceOverlapCount": len(appearance_overlap),
        "fixed20AppearanceOverlap": appearance_overlap,
        "fixed20SetMembershipEvidenceScope": "pinned-rebrickable-set-membership-only; does not provide authoritative LEGO Element identity",
        "specifiedSetInventoryId": None,
        "specifiedSetElementIdentityResolvedCount": 0,
        "catalogEligibleElementIdentityCount": 0,
        "catalogElementIdentityGapCount": len(items),
        "catalogElementIdentityEligibilityReason": "指定盒組 inventory 尚未提供；generic elements.csv 的 Element alias 只能作 bulk identity evidence，不得升格為 set-scoped catalog identity.",
        "canonicalDesignResolvedCount": sum(bool(item["canonicalLegoDesignId"]) for item in items),
        "appearanceElementAliasResolvedCount": sum(bool(item["canonicalAppearanceElementIds"]) for item in items),
        "noPinnedElementAliasCount": sum(item["appearanceIdentityStatus"] == "no-pinned-element-alias" for item in items),
        "noPinnedElementAliasFolders": [item["folder"] for item in items if item["appearanceIdentityStatus"] == "no-pinned-element-alias"],
        "singleDesignIdCount": sum(len(item["legoDesignIds"]) == 1 for item in items),
        "multiDesignIdParts": [
            {"sourcePart": item["sourcePart"], "designIds": item["legoDesignIds"]}
            for item in items if len(item["legoDesignIds"]) > 1
        ],
        "pinnedDatasetDesignIdGaps": [
            item["sourcePart"] for item in items if not item["legoDesignIdResolved"]
        ],
        "pinnedDatasetElementAliasGaps": [
            item["sourcePart"] for item in items if not item["legoElementIdResolved"]
        ],
        "catalogElementIdentityGaps": [
            item["sourcePart"] for item in items
        ],
        "manualIdentityEvidence": str(IDENTITY_EVIDENCE.relative_to(PROJECT)).replace("\\\\", "/"),
        "manualIdentityEvidenceSha256": _sha(IDENTITY_EVIDENCE),
        "relationshipDatasetSha256": relationships_entry["sha256"],
        "relationshipCandidates": relationship_candidates,
        "relationshipCandidatesCertifiedAsAlias": False,
        "unresolvedReason": "973p06 has neither an exact parts row nor a relationship row in the pinned Rebrickable datasets. Manual identity evidence resolves the decorated torso identity only; an official LEGO Design ID and Element ID still require explicit evidence.",
        "items": items,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
