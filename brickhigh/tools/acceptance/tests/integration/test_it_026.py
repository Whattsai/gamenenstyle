"""IT-026：在 Windows 上實際建立 junction 並拒絕根外讀取。"""

import subprocess
import pytest

from tools.catalog.content import ContentPathPolicy
from tools.catalog.policies import CatalogError


def test_IT_026_LoadAsset_ReparsePointEscape_RejectsAccess(tmp_path):
    root = tmp_path / "pack"
    outside = tmp_path / "pack-other"
    root.mkdir()
    outside.mkdir()
    (outside / "sentinel.txt").write_text("fixture only", encoding="utf-8")
    link = root / "junction"
    # 固定由 pytest 產生的隔離路徑；只建立連結，不刪除任何目標。
    subprocess.run(["cmd", "/c", "mklink", "/J", str(link), str(outside)],
                   check=True, capture_output=True)
    with pytest.raises(CatalogError):
        ContentPathPolicy.resolve(root, "junction/sentinel.txt")
    with pytest.raises(CatalogError):
        ContentPathPolicy.resolve(root, "../pack-other/sentinel.txt")
    (root / "valid.bin").write_bytes(b"local")
    assert ContentPathPolicy.read_bytes(root, "valid.bin") == b"local"
