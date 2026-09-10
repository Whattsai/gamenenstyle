"""SC-027：空分母與任何未解缺口皆不能通過正式發布。"""

from tools.catalog.policies import CatalogCoveragePolicy


def entry(variant="v1", status="Active", ready=True, **changes):
    return dict(variant_id=variant, production_status=status, ready=ready,
                classified=True, quality_passed=True, provenance_passed=True,
                fixture=False, **changes)


def test_UT_079_CatalogCoveragePolicy_ZeroActive_AvoidsFalseComplete():
    result = CatalogCoveragePolicy.evaluate([], [], True)
    assert result["coverage"] is None
    assert result["label"] == "尚無已確認基準"
    assert result["release_allowed"] is False


def test_UT_080_CatalogCoveragePolicy_SingleGap_BlocksPublish():
    for entries, gaps in (([entry(status="Unknown")], []), ([entry()], ["missing-page"]),
                          ([entry(ready=False)], []),
                          ([dict(entry(), classified=False)], []),
                          ([dict(entry(), quality_passed=False)], []),
                          ([dict(entry(), provenance_passed=False)], [])):
        assert not CatalogCoveragePolicy.evaluate(entries, gaps, True)["release_allowed"]


def test_UT_081_CatalogCoveragePolicy_CompleteKnownSet_RequiresScopeReview():
    report = CatalogCoveragePolicy.evaluate([entry()], [], False)
    assert report["coverage"] == 1.0
    assert not report["release_allowed"]
    assert CatalogCoveragePolicy.evaluate([entry()], [], True)["release_allowed"]

