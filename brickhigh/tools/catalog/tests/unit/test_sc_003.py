"""SC-003：穩定的外觀識別與外部別名衝突。"""

import pytest

from tools.catalog.policies import VariantIdentityPolicy, CatalogConflict


def test_UT_007_VariantIdentityPolicy_RealAppearance_CreatesVariant():
    appearances = [{"color": "4", "print": None, "material": "plastic"},
                   {"color": "1", "print": "face", "material": "plastic"}]
    keys = VariantIdentityPolicy.observed_keys(appearances + appearances)
    assert len(keys) == 2
    assert VariantIdentityPolicy.key({"material": "plastic", "print": None, "color": "4"}) in keys


def test_UT_008_VariantIdentityPolicy_PrintedKey_PreservesIdentity():
    plain = {"color": "4", "print": None, "material": "plastic"}
    assert VariantIdentityPolicy.key(plain) != VariantIdentityPolicy.key(dict(plain, print="face"))
    assert VariantIdentityPolicy.key(plain) != VariantIdentityPolicy.key(dict(plain, material="rubber"))
    first = VariantIdentityPolicy.stable_id("part-3001", plain)
    assert first == VariantIdentityPolicy.stable_id("part-3001", dict(plain))


def test_UT_009_VariantIdentityPolicy_ConflictingAlias_IsolatesMapping():
    aliases = {("ldraw", "3001.dat", "part"): "part-a"}
    assert VariantIdentityPolicy.bind_alias(aliases, "ldraw", "3001.dat", "part", "part-a") == "part-a"
    with pytest.raises(CatalogConflict):
        VariantIdentityPolicy.bind_alias(aliases, "ldraw", "3001.dat", "part", "part-b")
    assert aliases[("ldraw", "3001.dat", "part")] == "part-a"
