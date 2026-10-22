"""指定盒組 inventory 的 Element→Design 身份解析與 fail-closed 稽核。"""

from __future__ import annotations

from dataclasses import dataclass
import csv
import gzip
import hashlib
import json
from pathlib import Path
import re
from typing import Iterable


class SetInventoryIdentityError(ValueError):
    """指定盒組 inventory 或身份證據無法安全解析。"""


@dataclass(frozen=True)
class AuthoritativeElementBinding:
    """由可核對的盒組來源提供，不可由 part/color 候選反推。

    ``design_id`` 只有在來源真的公開時才填；沒有公開 Design ID 的特殊件仍可由
    Element ID 建立完整 catalog identity，但 geometry 不得跨 Element 去重。
    ``reconciliation_kind`` 只用於明確標示內部 inventory crosswalk，不代表 LEGO
    官方宣稱該 part/color 或 Design ID。
    """

    part_num: str
    color_id: str
    element_id: str
    design_id: str | None = None
    reconciliation_kind: str | None = None


def load_authoritative_element_bindings(
    evidence_path: Path,
    source_path: Path,
    expected_set_number: str,
) -> tuple[AuthoritativeElementBinding, ...]:
    """從綁定實際 raw source bytes 的證據檔載入 set-scoped Element identity。"""

    evidence_path = Path(evidence_path)
    source_path = Path(source_path)
    try:
        evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SetInventoryIdentityError("authoritative binding evidence 無法讀取。") from error
    schema_version = evidence.get("schemaVersion")
    if schema_version not in {1, 2}:
        raise SetInventoryIdentityError("authoritative binding evidence schemaVersion 不支援。")
    if str(evidence.get("setNumber", "")).strip() != str(expected_set_number).strip():
        raise SetInventoryIdentityError("authoritative binding evidence 的 set number 不一致。")
    source_id = str(evidence.get("sourceId", "")).strip()
    source_sha256 = str(evidence.get("sourceSha256", "")).strip().lower()
    if not source_id:
        raise SetInventoryIdentityError("authoritative binding evidence 缺少 sourceId。")
    if not re.fullmatch(r"[0-9a-f]{64}", source_sha256):
        raise SetInventoryIdentityError("authoritative binding evidence 缺少有效 source SHA-256。")
    if not source_path.is_file():
        raise SetInventoryIdentityError("authoritative raw source 不存在。")
    actual_sha256 = hashlib.sha256(source_path.read_bytes()).hexdigest()
    if actual_sha256 != source_sha256:
        raise SetInventoryIdentityError("authoritative raw source SHA-256 不一致。")

    raw_bindings = evidence.get("bindings")
    if not isinstance(raw_bindings, list) or not raw_bindings:
        raise SetInventoryIdentityError("authoritative binding evidence 沒有 Element bindings。")
    bindings = []
    element_owners = {}
    seen = set()
    for row in raw_bindings:
        if not isinstance(row, dict):
            raise SetInventoryIdentityError("authoritative Element binding 格式不正確。")
        part_num = str(row.get("partNum", "")).strip()
        color_id = str(row.get("colorId", "")).strip()
        element_id = str(row.get("elementId", "")).strip()
        raw_design_id = row.get("designId")
        design_id = None if raw_design_id is None else str(raw_design_id).strip()
        raw_reconciliation_kind = row.get("reconciliationKind")
        reconciliation_kind = (
            None if raw_reconciliation_kind is None else str(raw_reconciliation_kind).strip()
        )
        if not part_num or not color_id or not element_id:
            raise SetInventoryIdentityError("authoritative Element binding 不可有空欄位。")
        if raw_design_id is not None and not design_id:
            raise SetInventoryIdentityError("authoritative Design ID 不可為空字串。")
        if reconciliation_kind not in {None, "manual-element-only"}:
            raise SetInventoryIdentityError("authoritative reconciliationKind 不支援。")
        owner = (part_num, color_id, design_id, reconciliation_kind)
        previous = element_owners.get(element_id)
        if previous is not None and previous != owner:
            raise SetInventoryIdentityError("authoritative Element ID 對應到互相衝突的 binding。")
        element_owners[element_id] = owner
        key = (part_num, color_id, element_id, design_id, reconciliation_kind)
        if key not in seen:
            seen.add(key)
            bindings.append(
                AuthoritativeElementBinding(
                    part_num,
                    color_id,
                    element_id,
                    design_id,
                    reconciliation_kind,
                )
            )
    return tuple(bindings)


_REQUIRED_COLUMNS = {
    "inventories.csv.gz": {"id", "version", "set_num"},
    "inventory_parts.csv.gz": {"inventory_id", "part_num", "color_id", "quantity", "is_spare"},
    "inventory_minifigs.csv.gz": {"inventory_id", "fig_num", "quantity"},
    "inventory_sets.csv.gz": {"inventory_id", "set_num", "quantity"},
    "elements.csv.gz": {"element_id", "part_num", "color_id", "design_id"},
    "colors.csv.gz": {"id", "name"},
}


def _read_csv(source_root: Path, name: str):
    path = source_root / name
    if not path.is_file():
        raise SetInventoryIdentityError(f"缺少 pinned dataset：{name}")
    try:
        handle = gzip.open(path, "rt", encoding="utf-8-sig", newline="")
    except OSError as error:
        raise SetInventoryIdentityError(f"無法開啟 pinned dataset：{name}") from error
    with handle:
        reader = csv.DictReader(handle)
        fields = set(reader.fieldnames or ())
        if not _REQUIRED_COLUMNS[name].issubset(fields):
            raise SetInventoryIdentityError(f"pinned dataset 欄位不完整：{name}")
        for row in reader:
            yield row


def _positive_int(value: str, field: str) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError) as error:
        raise SetInventoryIdentityError(f"{field} 必須是整數。") from error
    if parsed <= 0:
        raise SetInventoryIdentityError(f"{field} 必須大於 0。")
    return parsed


def _bool(value: str) -> bool:
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "t", "yes", "y"}:
        return True
    if normalized in {"0", "false", "f", "no", "n"}:
        return False
    raise SetInventoryIdentityError("is_spare 必須是明確布林值。")


def _normalize_set_number(raw: str, available: set[str]) -> str:
    value = str(raw).strip()
    if not value:
        raise SetInventoryIdentityError("盒組編號不可為空。")
    if value in available:
        return value
    if "-" not in value:
        preferred = f"{value}-1"
        if preferred in available:
            return preferred
        matches = sorted(item for item in available if item.startswith(f"{value}-"))
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            raise SetInventoryIdentityError("盒組編號有多個版本，請指定完整 set number。")
    raise SetInventoryIdentityError("pinned dataset 找不到指定盒組。")


def _part_relationship_rows(source_root: Path):
    path = Path(source_root) / "part_relationships.csv.gz"
    if not path.is_file():
        raise SetInventoryIdentityError("缺少 pinned dataset：part_relationships.csv.gz")
    try:
        handle = gzip.open(path, "rt", encoding="utf-8-sig", newline="")
    except OSError as error:
        raise SetInventoryIdentityError("無法開啟 pinned dataset：part_relationships.csv.gz") from error
    with handle:
        reader = csv.DictReader(handle)
        fields = set(reader.fieldnames or ())
        required = {"rel_type", "child_part_num", "parent_part_num"}
        if not required.issubset(fields):
            raise SetInventoryIdentityError("pinned dataset 欄位不完整：part_relationships.csv.gz")
        for row in reader:
            yield row


def _binding_index(
    source_root: Path,
    inventory_keys: set[tuple[str, str]],
    bindings: Iterable[AuthoritativeElementBinding],
):
    """把官方 binding 對到 inventory key；僅允許唯一 pinned B sub-part bridge。"""

    result: dict[tuple[str, str], dict[str, dict[str, str | None]]] = {}
    element_targets: dict[str, tuple[str, str]] = {}
    pending: list[AuthoritativeElementBinding] = []

    def add(target: tuple[str, str], binding: AuthoritativeElementBinding, official_part_num: str):
        previous_target = element_targets.get(binding.element_id)
        if previous_target is not None and previous_target != target:
            raise SetInventoryIdentityError("同一 authoritative Element ID 對應到多個 inventory part/color。")
        element_targets[binding.element_id] = target
        owners = result.setdefault(target, {})
        owner = {
            "officialPartNum": official_part_num,
            "designId": binding.design_id,
            "reconciliationKind": binding.reconciliation_kind,
        }
        previous_owner = owners.get(binding.element_id)
        if previous_owner is not None and previous_owner != owner:
            raise SetInventoryIdentityError("同一 authoritative Element ID 的 binding 互相衝突。")
        owners[binding.element_id] = owner

    for binding in bindings:
        part_num = str(binding.part_num).strip()
        color_id = str(binding.color_id).strip()
        element_id = str(binding.element_id).strip()
        if not part_num or not color_id or not element_id:
            raise SetInventoryIdentityError("authoritative Element binding 不可有空欄位。")
        normalized = AuthoritativeElementBinding(
            part_num,
            color_id,
            element_id,
            binding.design_id,
            binding.reconciliation_kind,
        )
        key = (part_num, color_id)
        if key in inventory_keys:
            add(key, normalized, part_num)
        else:
            pending.append(normalized)

    if pending:
        relationships = list(_part_relationship_rows(source_root))
        for binding in pending:
            candidates = sorted({
                str(row.get("child_part_num", "")).strip()
                for row in relationships
                if str(row.get("rel_type", "")).strip() == "B"
                and str(row.get("parent_part_num", "")).strip() == binding.part_num
                and (str(row.get("child_part_num", "")).strip(), binding.color_id) in inventory_keys
            })
            if len(candidates) != 1:
                raise SetInventoryIdentityError(
                    "authoritative Element binding 無法由唯一 pinned B sub-part relationship 對應到指定盒組 inventory。"
                )
            target = (candidates[0], binding.color_id)
            add(target, binding, binding.part_num)
    return result


def _inventory_index(inventories: list[dict]):
    by_set: dict[str, list[tuple[int, int]]] = {}
    for row in inventories:
        set_num = row.get("set_num", "").strip()
        if not set_num:
            raise SetInventoryIdentityError("inventory 缺少 set number。")
        version = _positive_int(row["version"], "inventory version")
        inventory_id = _positive_int(row["id"], "inventory id")
        by_set.setdefault(set_num, []).append((version, inventory_id))
    return by_set


def _latest_inventory(by_set: dict[str, list[tuple[int, int]]], set_num: str):
    matching = by_set.get(set_num, ())
    if not matching:
        raise SetInventoryIdentityError(f"指定組件沒有 inventory：{set_num}")
    latest_version = max(version for version, _ in matching)
    latest_ids = sorted(inventory_id for version, inventory_id in matching if version == latest_version)
    if len(latest_ids) != 1:
        raise SetInventoryIdentityError(f"最新 inventory 版本不唯一：{set_num}")
    return latest_version, latest_ids[0]


def _relation_index(source_root: Path, name: str, child_field: str):
    result: dict[int, list[tuple[str, int]]] = {}
    for row in _read_csv(source_root, name):
        inventory_id = _positive_int(row["inventory_id"], f"{name} inventory id")
        child = row[child_field].strip()
        if not child:
            raise SetInventoryIdentityError(f"{name} 缺少 {child_field}。")
        quantity = _positive_int(row["quantity"], f"{name} quantity")
        result.setdefault(inventory_id, []).append((child, quantity))
    return result


def _expand_inventory_membership(source_root: Path, by_set, root_set: str):
    minifigs = _relation_index(source_root, "inventory_minifigs.csv.gz", "fig_num")
    subsets = _relation_index(source_root, "inventory_sets.csv.gz", "set_num")
    uses = []
    minifigure_refs = 0
    subset_refs = 0

    def visit(set_num: str, multiplier: int, kind: str, trail: tuple[str, ...]):
        nonlocal minifigure_refs, subset_refs
        if set_num in trail:
            chain = " -> ".join((*trail, set_num))
            raise SetInventoryIdentityError(f"inventory 展開形成循環：{chain}")
        version, inventory_id = _latest_inventory(by_set, set_num)
        uses.append({
            "setNumber": set_num,
            "inventoryId": inventory_id,
            "inventoryVersion": version,
            "multiplier": multiplier,
            "kind": kind,
        })
        next_trail = (*trail, set_num)
        for fig_num, quantity in minifigs.get(inventory_id, ()):
            minifigure_refs += quantity * multiplier
            visit(fig_num, multiplier * quantity, "minifigure", next_trail)
        for child_set, quantity in subsets.get(inventory_id, ()):
            subset_refs += quantity * multiplier
            visit(child_set, multiplier * quantity, "subset", next_trail)

    visit(root_set, 1, "root", ())
    return uses, minifigure_refs, subset_refs


def resolve_set_inventory_identity(
    source_root: Path,
    set_number: str,
    authoritative_bindings: Iterable[AuthoritativeElementBinding] = (),
) -> dict:
    """解析 set membership，僅由 authoritative Element binding 升格 catalog identity。

    Rebrickable ``inventory_parts.csv`` 本身只有 part/color，沒有 Element ID；因此即使
    ``elements.csv`` 對某個 part/color 只有一個候選，也只能當 crosswalk evidence，
    不得自行升格為指定盒組的正式 Element 身份。Minifig 與 sub-set inventory 會先
    遞迴展開成實際 part/color，避免把組件容器誤當最終建模分母。
    """

    source_root = Path(source_root)
    inventories = list(_read_csv(source_root, "inventories.csv.gz"))
    by_set = _inventory_index(inventories)
    resolved_set = _normalize_set_number(set_number, set(by_set))
    root_version, root_inventory_id = _latest_inventory(by_set, resolved_set)
    inventory_uses, minifigure_quantity, subset_quantity = _expand_inventory_membership(
        source_root, by_set, resolved_set
    )

    uses_by_inventory: dict[int, list[dict]] = {}
    for use in inventory_uses:
        uses_by_inventory.setdefault(use["inventoryId"], []).append(use)

    aggregated: dict[tuple[str, str], dict] = {}
    for row in _read_csv(source_root, "inventory_parts.csv.gz"):
        inventory_id = _positive_int(row["inventory_id"], "inventory part inventory id")
        uses = uses_by_inventory.get(inventory_id)
        if not uses:
            continue
        part_num = row["part_num"].strip()
        color_id = row["color_id"].strip()
        if not part_num or not color_id:
            raise SetInventoryIdentityError("inventory part 缺少 part/color。")
        base_quantity = _positive_int(row["quantity"], "inventory quantity")
        is_spare = _bool(row["is_spare"])
        key = (part_num, color_id)
        entry = aggregated.setdefault(key, {
            "partNum": part_num,
            "colorId": color_id,
            "quantity": 0,
            "normalQuantity": 0,
            "spareQuantity": 0,
            "sourceSetNumbers": set(),
        })
        for use in uses:
            quantity = base_quantity * use["multiplier"]
            entry["quantity"] += quantity
            if is_spare:
                entry["spareQuantity"] += quantity
            else:
                entry["normalQuantity"] += quantity
            entry["sourceSetNumbers"].add(use["setNumber"])

    if not aggregated:
        raise SetInventoryIdentityError("指定盒組展開後沒有實際零件。")

    rows = []
    for key in sorted(aggregated):
        entry = aggregated[key]
        entry["sourceSetNumbers"] = sorted(entry["sourceSetNumbers"])
        entry["isSpareOnly"] = entry["normalQuantity"] == 0 and entry["spareQuantity"] > 0
        rows.append(entry)
    inventory_keys = set(aggregated)
    authoritative_bindings = tuple(authoritative_bindings)
    binding_index = _binding_index(source_root, inventory_keys, authoritative_bindings)
    official_binding_keys = {
        (str(binding.part_num).strip(), str(binding.color_id).strip())
        for binding in authoritative_bindings
    }

    colors = {row["id"].strip(): row["name"].strip() for row in _read_csv(source_root, "colors.csv.gz")}
    candidates: dict[tuple[str, str], dict[tuple[str, str], dict]] = {key: {} for key in inventory_keys}
    element_lookup: dict[str, dict] = {}
    for row in _read_csv(source_root, "elements.csv.gz"):
        key = (row["part_num"].strip(), row["color_id"].strip())
        if key not in inventory_keys and key not in official_binding_keys:
            continue
        element_id = row["element_id"].strip()
        design_id = row["design_id"].strip()
        if not element_id or not design_id:
            continue
        if key in inventory_keys:
            candidate = {"elementId": element_id, "designId": design_id}
            candidates[key][(element_id, design_id)] = candidate
        previous = element_lookup.get(element_id)
        if previous is not None and previous != {"partNum": key[0], "colorId": key[1], "designId": design_id}:
            raise SetInventoryIdentityError("同一 Element ID 出現互相衝突的 pinned 映射。")
        element_lookup[element_id] = {"partNum": key[0], "colorId": key[1], "designId": design_id}

    catalog_rows = 0
    catalog_element_ids: set[str] = set()
    geometry_design_ids: set[str] = set()
    geometry_element_fallback_ids: set[str] = set()
    geometry_identity_keys: set[str] = set()
    unresolved = []
    for entry in rows:
        key = (entry["partNum"], entry["colorId"])
        entry_candidates = sorted(candidates.get(key, {}).values(), key=lambda value: (value["elementId"], value["designId"]))
        entry["colorName"] = colors.get(entry["colorId"])
        entry["elementCandidates"] = entry_candidates
        entry["candidateStatus"] = (
            "Missing" if not entry_candidates else "Unique" if len(entry_candidates) == 1 else "Ambiguous"
        )

        authoritative_ids = sorted(binding_index.get(key, {}).items())
        resolved = []
        for element_id, binding in authoritative_ids:
            official_part_num = str(binding["officialPartNum"])
            official_design_id = binding.get("designId")
            reconciliation_kind = binding.get("reconciliationKind")
            mapped = element_lookup.get(element_id)
            if mapped is not None:
                if mapped["partNum"] != official_part_num or mapped["colorId"] != key[1]:
                    raise SetInventoryIdentityError("authoritative Element ID 與 pinned 官方 part/color 映射不一致。")
                if official_design_id is not None and mapped["designId"] != official_design_id:
                    raise SetInventoryIdentityError("authoritative Design ID 與 pinned Element mapping 不一致。")
                # manual-element-only 只證明官方 Element identity；即使第三方 pinned crosswalk
                # 剛好有 Design ID，也不能把它冒充成官方 Design 證據來做 geometry dedup。
                design_id = (
                    None
                    if reconciliation_kind == "manual-element-only" and official_design_id is None
                    else official_design_id or mapped["designId"]
                )
            else:
                if reconciliation_kind != "manual-element-only" or official_part_num != key[0]:
                    raise SetInventoryIdentityError(
                        "authoritative Element ID 缺少 pinned mapping；只有明確 manual-element-only direct reconciliation 可保守升格。"
                    )
                design_id = official_design_id

            identity = {"elementId": element_id, "designId": design_id}
            if design_id is not None:
                geometry_design_ids.add(design_id)
                geometry_identity_keys.add(f"design:{design_id}")
            else:
                identity["geometryFallbackElementId"] = element_id
                identity["geometryIdentityKind"] = "element-fallback"
                geometry_element_fallback_ids.add(element_id)
                geometry_identity_keys.add(f"element:{element_id}")
            if official_part_num != key[0]:
                identity["officialPartNum"] = official_part_num
                identity["reconciledVia"] = "pinned-B-subpart"
            elif reconciliation_kind is not None:
                identity["reconciledVia"] = reconciliation_kind
            resolved.append(identity)
            catalog_element_ids.add(element_id)
        entry["authoritativeIdentities"] = resolved
        entry["catalogEligible"] = bool(resolved)
        if resolved:
            catalog_rows += 1
        else:
            unresolved.append({
                "partNum": key[0],
                "colorId": key[1],
                "isSpareOnly": entry["isSpareOnly"],
                "normalQuantity": entry["normalQuantity"],
                "spareQuantity": entry["spareQuantity"],
            })

    return {
        "schemaVersion": 1,
        "identityEvidenceScope": "specified-set-membership-with-authoritative-element-overlay",
        "setNumber": resolved_set,
        "inventoryId": root_inventory_id,
        "inventoryVersion": root_version,
        "expandedInventoryCount": len(inventory_uses),
        "expandedMinifigureQuantity": minifigure_quantity,
        "expandedSubsetQuantity": subset_quantity,
        "inventoryExpansion": inventory_uses,
        "inventoryRowCount": len(rows),
        "inventoryQuantity": sum(entry["quantity"] for entry in rows),
        "candidateUniqueRowCount": sum(entry["candidateStatus"] == "Unique" for entry in rows),
        "candidateAmbiguousRowCount": sum(entry["candidateStatus"] == "Ambiguous" for entry in rows),
        "candidateMissingRowCount": sum(entry["candidateStatus"] == "Missing" for entry in rows),
        "catalogEligibleInventoryRowCount": catalog_rows,
        "catalogEligibleElementIdentityCount": len(catalog_element_ids),
        "catalogGeometryDesignCount": len(geometry_design_ids),
        "catalogGeometryDesignIds": sorted(geometry_design_ids),
        "catalogGeometryElementFallbackCount": len(geometry_element_fallback_ids),
        "catalogGeometryElementFallbackIds": sorted(geometry_element_fallback_ids),
        "catalogGeometryIdentityCount": len(geometry_identity_keys),
        "catalogGeometryIdentityKeys": sorted(geometry_identity_keys),
        "catalogIdentityGapCount": len(unresolved),
        "catalogIdentityGaps": unresolved,
        "catalogReconciledSubpartRowCount": sum(
            any(identity.get("reconciledVia") == "pinned-B-subpart" for identity in item["authoritativeIdentities"])
            for item in rows
        ),
        "catalogElementFallbackRowCount": sum(
            any(identity.get("geometryIdentityKind") == "element-fallback" for identity in item["authoritativeIdentities"])
            for item in rows
        ),
        "catalogEligibilityRule": (
            "requires-authoritative-set-element-id; Design ID is optional when the official source does not expose one; "
            "missing Design ID uses Element ID as a non-deduplicating geometry fallback; part/color candidates never auto-promote; "
            "official parent bindings may bridge only through one unique pinned B sub-part relationship"
        ),
        "items": rows,
    }
