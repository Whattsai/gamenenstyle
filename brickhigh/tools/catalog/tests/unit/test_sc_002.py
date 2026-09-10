"""SC-002：生產狀態必須由變體的有效證據決定。"""

from datetime import datetime, timezone

from tools.catalog.policies import ProductionStatusPolicy

BASELINE = datetime(2026, 9, 8, 15, 59, 59, tzinfo=timezone.utc)


def evidence(claim, **changes):
    return dict(claim=claim, effective_from="2026-01-01T00:00:00Z",
                effective_to=None, artifact_id="evidence-1", **changes)


def test_UT_004_ProductionStatusPolicy_DatedEvidence_ClassifiesStatus():
    assert ProductionStatusPolicy.classify([evidence("Producing")], BASELINE) == "Active"
    assert ProductionStatusPolicy.classify([evidence("Discontinued")], BASELINE) == "Retired"


def test_UT_005_ProductionStatusPolicy_AmbiguousEvidence_RemainsUnknown():
    for records in ([], [evidence("OutOfStock")], [evidence("InStock")],
                    [{"claim": "Producing"}],
                    [evidence("Producing"), evidence("Discontinued")],
                    [dict(evidence("Producing"), effective_from="2027-01-01T00:00:00Z")],
                    [dict(evidence("Producing"), effective_to="2026-01-02T00:00:00Z")]):
        assert ProductionStatusPolicy.classify(records, BASELINE) == "Unknown"


def test_UT_006_ProductionStatusPolicy_RetiredColor_PreservesOtherVariant():
    variants = {"red": [evidence("Discontinued")], "blue": [evidence("Producing")]}
    actual = {key: ProductionStatusPolicy.classify(value, BASELINE) for key, value in variants.items()}
    assert actual == {"red": "Retired", "blue": "Active"}

