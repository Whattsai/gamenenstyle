import csv
import gzip
import json

import pytest

from tools.catalog.lego_pick_a_brick import (
    map_pick_a_brick_response_elements,
    map_pick_a_brick_set_response,
)
from tools.catalog.set_inventory_identity import (
    AuthoritativeElementBinding,
    SetInventoryIdentityError,
)


def _write_elements(path, rows):
    with gzip.open(path, "wt", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(
            stream,
            fieldnames=["element_id", "part_num", "color_id", "design_id"],
        )
        writer.writeheader()
        writer.writerows(rows)


def _source_root(tmp_path):
    root = tmp_path / "rebrickable"
    root.mkdir()
    _write_elements(
        root / "elements.csv.gz",
        [
            {
                "element_id": "6411587",
                "part_num": "11211",
                "color_id": "18",
                "design_id": "11211",
            },
            {
                "element_id": "6135606",
                "part_num": "11211",
                "color_id": "272",
                "design_id": "11211",
            },
        ],
    )
    return root


def _write_response(path, results, *, total=None, count=None, errors=None):
    payload = {
        "data": {
            "searchElements": {
                "results": results,
                "total": len(results) if total is None else total,
                "count": len(results) if count is None else count,
            }
        }
    }
    if errors is not None:
        payload["errors"] = errors
    path.write_text(json.dumps(payload), encoding="utf-8")


def test_pick_a_brick_response_maps_official_element_and_design_ids(tmp_path):
    response = tmp_path / "response.json"
    _write_response(
        response,
        [
            {"id": "6411587", "designId": "11211"},
            {"id": "6135606", "designId": "11211"},
        ],
    )

    mapped = map_pick_a_brick_response_elements(response, _source_root(tmp_path))

    assert mapped.bindings == (
        AuthoritativeElementBinding("11211", "272", "6135606", "11211"),
        AuthoritativeElementBinding("11211", "18", "6411587", "11211"),
    )
    assert mapped.mapped_element_ids == ("6135606", "6411587")
    assert mapped.unmapped_element_ids == ()
    assert mapped.result_count == 2
    assert mapped.total == 2


def test_pick_a_brick_response_keeps_unknown_official_elements_as_gap(tmp_path):
    response = tmp_path / "response.json"
    _write_response(
        response,
        [
            {"id": "6411587", "designId": "11211"},
            {"id": "6999999", "designId": "99999"},
        ],
    )

    mapped = map_pick_a_brick_response_elements(response, _source_root(tmp_path))

    assert mapped.bindings == (
        AuthoritativeElementBinding("11211", "18", "6411587", "11211"),
    )
    assert mapped.mapped_element_ids == ("6411587",)
    assert mapped.unmapped_element_ids == ("6999999",)


def test_pick_a_brick_response_rejects_design_mismatch(tmp_path):
    response = tmp_path / "response.json"
    _write_response(response, [{"id": "6411587", "designId": "99999"}])

    with pytest.raises(SetInventoryIdentityError, match="Design ID"):
        map_pick_a_brick_response_elements(response, _source_root(tmp_path))


def _write_set_request(
    path,
    *,
    set_number="10334",
    availability=("AVAILABLE", "OUT_OF_STOCK"),
    query_text="",
    page=1,
    per_page=400,
    extra_input=None,
):
    query_input = {
        "perPage": per_page,
        "query": query_text,
        "page": page,
        "availability": list(availability),
        "sort": {"key": "RELEVANCE", "direction": "DESC"},
        "appearsIn": set_number,
    }
    if extra_input:
        query_input.update(extra_input)
    payload = {
        "operationName": "PickABrickQuery",
        "variables": {"input": query_input},
        "query": "query PickABrickQuery($input: ElementQueryInput!) { searchElements(input: $input) { results { ... on SearchResultElement { id designId } } total count } }",
    }
    path.write_text(json.dumps(payload), encoding="utf-8")


def test_pick_a_brick_set_response_binds_request_scope_and_complete_response(tmp_path):
    request = tmp_path / "request.json"
    response = tmp_path / "response.json"
    _write_set_request(request)
    _write_response(
        response,
        [
            {"id": "6411587", "designId": "11211"},
            {"id": "6135606", "designId": "11211"},
        ],
    )

    evidence = map_pick_a_brick_set_response(
        request,
        response,
        _source_root(tmp_path),
        "10334-1",
    )

    assert evidence.set_number == "10334-1"
    assert len(evidence.request_sha256) == 64
    assert len(evidence.response_sha256) == 64
    assert evidence.mapping.total == 2
    assert {item.element_id for item in evidence.mapping.bindings} == {"6411587", "6135606"}


@pytest.mark.parametrize(
    ("request_kwargs", "message"),
    [
        ({"set_number": "10335"}, "指定盒組不一致"),
        ({"availability": ("AVAILABLE",)}, "out-of-stock"),
        ({"query_text": "brick"}, "文字搜尋"),
        ({"extra_input": {"filters": []}}, "其他可能縮小範圍"),
    ],
)
def test_pick_a_brick_set_response_rejects_narrowed_or_wrong_scope(
    tmp_path,
    request_kwargs,
    message,
):
    request = tmp_path / "request.json"
    response = tmp_path / "response.json"
    _write_set_request(request, **request_kwargs)
    _write_response(response, [{"id": "6411587", "designId": "11211"}])

    with pytest.raises(SetInventoryIdentityError, match=message):
        map_pick_a_brick_set_response(
            request,
            response,
            _source_root(tmp_path),
            "10334-1",
        )


def test_pick_a_brick_set_response_rejects_incomplete_single_page(tmp_path):
    request = tmp_path / "request.json"
    response = tmp_path / "response.json"
    _write_set_request(request, per_page=1)
    _write_response(
        response,
        [{"id": "6411587", "designId": "11211"}],
        total=2,
        count=1,
    )

    with pytest.raises(SetInventoryIdentityError, match="未完整覆蓋"):
        map_pick_a_brick_set_response(
            request,
            response,
            _source_root(tmp_path),
            "10334-1",
        )


def test_pick_a_brick_response_rejects_graphql_errors_and_count_mismatch(tmp_path):
    root = _source_root(tmp_path)
    response = tmp_path / "response.json"
    _write_response(
        response,
        [{"id": "6411587", "designId": "11211"}],
        errors=[{"message": "bad request"}],
    )
    with pytest.raises(SetInventoryIdentityError, match="GraphQL response 含 errors"):
        map_pick_a_brick_response_elements(response, root)

    _write_response(
        response,
        [{"id": "6411587", "designId": "11211"}],
        count=2,
        total=2,
    )
    with pytest.raises(SetInventoryIdentityError, match="count"):
        map_pick_a_brick_response_elements(response, root)
