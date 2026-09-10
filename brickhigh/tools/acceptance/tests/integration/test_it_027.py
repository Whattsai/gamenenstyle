"""IT-027：相同大小與 mtime 不得重用舊完整性驗證。"""

import hashlib
import os

import pytest

from tools.catalog.content import ContentPathPolicy
from tools.catalog.policies import CatalogError


def test_IT_027_LoadAsset_ReplacedSameSizeBundle_InvalidatesValidation(tmp_path):
    path = tmp_path / "model.bundle"
    path.write_bytes(b"verified original")
    original_time = path.stat().st_mtime_ns
    expected = hashlib.sha256(path.read_bytes()).hexdigest()
    lease_bytes = ContentPathPolicy.read_verified(tmp_path, "model.bundle", expected)
    path.write_bytes(b"replaced altered!")
    os.utime(path, ns=(original_time, original_time))
    assert len(path.read_bytes()) == len(lease_bytes)
    with pytest.raises(CatalogError):
        ContentPathPolicy.read_verified(tmp_path, "model.bundle", expected)
    assert lease_bytes == b"verified original"


def test_verified_bytes_are_the_loader_input_even_after_file_changes(tmp_path):
    path = tmp_path / "model.bundle"
    path.write_bytes(b"original")
    expected = hashlib.sha256(b"original").hexdigest()
    data = ContentPathPolicy.read_verified(tmp_path, "model.bundle", expected)
    path.write_bytes(b"modified")
    assert hashlib.sha256(data).hexdigest() == expected
    assert data != path.read_bytes()
