import ctypes
import os
from pathlib import Path

import pytest


@pytest.mark.skipif(os.name != "nt", reason="Windows Player native dependency check")
def test_bundled_sqlite_loads_by_absolute_path_and_exports_open_v2():
    brickhigh = Path(__file__).resolve().parents[4]
    dll = brickhigh / "game" / "Assets" / "Plugins" / "x86_64" / "sqlite3.dll"
    assert dll.is_file()

    library = ctypes.WinDLL(str(dll))
    assert library._handle
    assert getattr(library, "sqlite3_open_v2") is not None
