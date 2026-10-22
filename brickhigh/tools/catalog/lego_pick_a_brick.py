"""LEGO Pick a Brick GraphQL response 的保守 Element/Design crosswalk。"""

from __future__ import annotations

from dataclasses import dataclass
import csv
import gzip
import hashlib
import json
from pathlib import Path

from tools.catalog.set_inventory_identity import (
    AuthoritativeElementBinding,
    SetInventoryIdentityError,
)


@dataclass(frozen=True)
class PickABrickResponseMapping:
    """官方 response 與 pinned Element dataset 的可核對映射結果。"""

    bindings: tuple[AuthoritativeElementBinding, ...]
    mapped_element_ids: tuple[str, ...]
    unmapped_element_ids: tuple[str, ...]
    result_count: int
    total: int
    mapping_conflicts: tuple[dict, ...] = ()


@dataclass(frozen=True)
class PickABrickSetEvidenceMapping:
    """同時綁定指定盒組 request 與完整 response 的可核對結果。"""

    set_number: str
    request_sha256: str
    response_sha256: str
    mapping: PickABrickResponseMapping


def _element_lookup(source_root: Path) -> dict[str, tuple[str, str, str]]:
    path = Path(source_root) / "elements.csv.gz"
    if not path.is_file():
        raise SetInventoryIdentityError("缺少 pinned dataset：elements.csv.gz")

    lookup: dict[str, tuple[str, str, str]] = {}
    with gzip.open(path, "rt", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        fields = set(reader.fieldnames or ())
        required = {"element_id", "part_num", "color_id", "design_id"}
        if not required.issubset(fields):
            raise SetInventoryIdentityError("pinned dataset 欄位不完整：elements.csv.gz")
        for row in reader:
            element_id = str(row.get("element_id", "")).strip()
            part_num = str(row.get("part_num", "")).strip()
            color_id = str(row.get("color_id", "")).strip()
            design_id = str(row.get("design_id", "")).strip()
            if not element_id or not part_num or not color_id or not design_id:
                continue
            mapped = (part_num, color_id, design_id)
            previous = lookup.get(element_id)
            if previous is not None and previous != mapped:
                raise SetInventoryIdentityError(
                    "同一 Element ID 出現互相衝突的 pinned part/color/design 映射。"
                )
            lookup[element_id] = mapped
    return lookup


def _read_json_object(path: Path, label: str) -> tuple[dict, str]:
    path = Path(path)
    try:
        raw = path.read_bytes()
        payload = json.loads(raw.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise SetInventoryIdentityError(f"{label} 無法讀取。") from error
    if not isinstance(payload, dict):
        raise SetInventoryIdentityError(f"{label} 必須是 JSON object。")
    return payload, hashlib.sha256(raw).hexdigest()


def _validate_set_request(payload: dict, expected_set_number: str) -> None:
    if payload.get("operationName") != "PickABrickQuery":
        raise SetInventoryIdentityError("Pick a Brick request operationName 不正確。")
    query_document = str(payload.get("query", ""))
    if "PickABrickQuery" not in query_document or "searchElements" not in query_document:
        raise SetInventoryIdentityError("Pick a Brick request query 不是預期的 searchElements operation。")

    variables = payload.get("variables")
    if not isinstance(variables, dict):
        raise SetInventoryIdentityError("Pick a Brick request 缺少 variables。")
    query_input = variables.get("input", variables)
    if not isinstance(query_input, dict):
        raise SetInventoryIdentityError("Pick a Brick request input 格式不正確。")
    allowed_input_keys = {
        "page",
        "perPage",
        "query",
        "availability",
        "sort",
        "appearsIn",
    }
    unexpected_keys = sorted(set(query_input) - allowed_input_keys)
    if unexpected_keys:
        raise SetInventoryIdentityError(
            "指定盒組 authoritative 查詢不可包含其他可能縮小範圍的 input 欄位。"
        )
    if query_input.get("query") not in (None, ""):
        raise SetInventoryIdentityError("指定盒組 authoritative 查詢不可再疊加文字搜尋。")

    availability = query_input.get("availability")
    if (
        not isinstance(availability, list)
        or len(availability) != 2
        or set(availability) != {"AVAILABLE", "OUT_OF_STOCK"}
    ):
        raise SetInventoryIdentityError(
            "指定盒組 authoritative 查詢必須同時包含 available 與 out-of-stock 元素。"
        )

    page = query_input.get("page")
    per_page = query_input.get("perPage")
    if type(page) is not int or page != 1:
        raise SetInventoryIdentityError("指定盒組單頁 evidence 必須從 page=1 開始。")
    if type(per_page) is not int or per_page <= 0:
        raise SetInventoryIdentityError("Pick a Brick request perPage 必須是正整數。")

    official_set_number = str(expected_set_number).strip().split("-", 1)[0]
    if not official_set_number:
        raise SetInventoryIdentityError("指定盒組編號不可為空。")
    appears_in = str(query_input.get("appearsIn", "")).strip()
    if appears_in != official_set_number:
        raise SetInventoryIdentityError("Pick a Brick appearsIn 與指定盒組不一致。")


def map_pick_a_brick_set_response(
    request_path: Path,
    response_path: Path,
    source_root: Path,
    expected_set_number: str,
    *, required_element_ids: frozenset[str] | None = None,
) -> PickABrickSetEvidenceMapping:
    """驗證指定盒組 request，並要求單一 response 已完整覆蓋全部 results。"""

    request_payload, request_sha256 = _read_json_object(request_path, "Pick a Brick request")
    _validate_set_request(request_payload, expected_set_number)
    response, response_sha256 = _read_json_object(response_path, "Pick a Brick response")
    mapping = _map_response_payload(response, source_root, required_element_ids)
    if mapping.result_count != mapping.total:
        raise SetInventoryIdentityError("Pick a Brick response 未完整覆蓋指定盒組全部 results。")
    return PickABrickSetEvidenceMapping(
        set_number=str(expected_set_number).strip(),
        request_sha256=request_sha256,
        response_sha256=response_sha256,
        mapping=mapping,
    )


def map_pick_a_brick_response_elements(
    response_path: Path,
    source_root: Path,
) -> PickABrickResponseMapping:
    """解析 PickABrickQuery response；只產出可由 pinned dataset 核對的映射。

    這個函式本身不證明 response 是哪一個盒組的查詢結果。正式 set-scoped
    authoritative identity 仍必須由封存 request metadata 證明查詢條件，再交由
    load_authoritative_element_bindings 綁定 immutable raw source bytes。
    """

    payload, _ = _read_json_object(response_path, "Pick a Brick response")
    return _map_response_payload(payload, source_root)


def _map_response_payload(payload, source_root, required_element_ids=None):
    """完整驗證所有頁面計數與ID；範圍外crosswalk衝突明列稽核，候選衝突仍拒絕。"""
    errors = payload.get("errors")
    if errors:
        raise SetInventoryIdentityError("Pick a Brick GraphQL response 含 errors。")

    try:
        search = payload["data"]["searchElements"]
    except (KeyError, TypeError) as error:
        raise SetInventoryIdentityError("Pick a Brick response 缺少 data.searchElements。") from error
    if not isinstance(search, dict):
        raise SetInventoryIdentityError("Pick a Brick searchElements 格式不正確。")

    results = search.get("results")
    if not isinstance(results, list):
        raise SetInventoryIdentityError("Pick a Brick response 缺少 results。")

    total = search.get("total")
    count = search.get("count")
    if type(total) is not int or total < 0:
        raise SetInventoryIdentityError("Pick a Brick total 必須是非負整數。")
    if type(count) is not int or count < 0:
        raise SetInventoryIdentityError("Pick a Brick count 必須是非負整數。")
    if count != len(results):
        raise SetInventoryIdentityError("Pick a Brick count 與 results 數量不一致。")
    if count > total:
        raise SetInventoryIdentityError("Pick a Brick count 不可大於 total。")

    official: dict[str, str] = {}
    for row in results:
        if not isinstance(row, dict):
            raise SetInventoryIdentityError("Pick a Brick result 格式不正確。")
        element_id = str(row.get("id", "")).strip()
        design_id = None if row.get("designId") is None else str(row["designId"]).strip()
        if not element_id or row.get("designId") is not None and not design_id:
            raise SetInventoryIdentityError("Pick a Brick result 缺少 Element／Design ID。")
        previous = official.get(element_id)
        if element_id in official:
            raise SetInventoryIdentityError("同一官方 Element ID 對應到互相衝突的 Design ID。")
        official[element_id] = design_id

    pinned = _element_lookup(source_root)
    bindings: list[AuthoritativeElementBinding] = []
    mapped_ids: list[str] = []
    unmapped_ids: list[str] = []
    conflicts = []
    for element_id, official_design_id in sorted(official.items()):
        mapped = pinned.get(element_id)
        if mapped is None:
            unmapped_ids.append(element_id)
            continue
        part_num, color_id, pinned_design_id = mapped
        if official_design_id is not None and pinned_design_id != official_design_id:
            conflict = {"elementId": element_id, "officialDesignId": official_design_id,
                        "pinnedDesignId": pinned_design_id}
            if required_element_ids is None or element_id in required_element_ids:
                raise SetInventoryIdentityError(
                    f"官方 Pick a Brick Design ID 與 pinned Element mapping 不一致。Element {element_id}：官方 {official_design_id}／pinned {pinned_design_id}。")
            conflicts.append(conflict)
            continue
        bindings.append(
            AuthoritativeElementBinding(
                part_num,
                color_id,
                element_id,
                official_design_id,
            )
        )
        mapped_ids.append(element_id)

    return PickABrickResponseMapping(
        bindings=tuple(bindings),
        mapped_element_ids=tuple(mapped_ids),
        unmapped_element_ids=tuple(unmapped_ids),
        result_count=count,
        total=total,
        mapping_conflicts=tuple(conflicts),
    )
