"""轉換前拒絕缺依賴、未知紋理、未具來源與越界壓縮檔。"""

import zipfile
import pytest

from tools.catalog.sources import extract_archive, inspect_ldraw
from tools.catalog.policies import CatalogError


def test_archive_escape_is_rejected_before_writing_any_member(tmp_path):
    archive = tmp_path / "source.zip"
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr("good.txt", "good")
        output.writestr("../outside.txt", "bad")
    target = tmp_path / "extracted"
    with pytest.raises(CatalogError):
        extract_archive(archive, target)
    assert not (tmp_path / "outside.txt").exists()
    assert not (target / "good.txt").exists()


def test_dependency_closure_keeps_per_file_provenance_and_missing_files_fail(tmp_path):
    (tmp_path / "parts").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    (tmp_path / "parts/a.dat").write_text(header + "1 16 0 0 0 1 0 0 0 1 0 0 0 1 b.dat\n")
    with pytest.raises(CatalogError, match="依賴"):
        inspect_ldraw(tmp_path, "a.dat")
    (tmp_path / "parts/b.dat").write_text(header + "3 16 0 0 0 20 0 0 0 -24 10\n")
    manifest = inspect_ldraw(tmp_path, "a.dat")
    assert len(manifest["files"]) == 2
    assert all(file["sha256"] and file["author"] and file["license"] for file in manifest["files"])
    (tmp_path / "parts/b.dat").write_text(header + "0 !TEXMAP START PLANAR\n")
    with pytest.raises(CatalogError, match="TEXMAP"):
        inspect_ldraw(tmp_path, "a.dat")
