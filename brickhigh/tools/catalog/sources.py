"""來源壓縮檔展開與 LDraw 完整依賴檢查；幾何存在不證明仍在生產。"""

import argparse
import hashlib
from pathlib import Path
import stat
import zipfile

from .content import ContentPathPolicy
from .policies import CatalogError


def extract_archive(archive, destination):
    """先檢查全部成員，再展開至明確的新目錄。"""
    destination = Path(destination)
    with zipfile.ZipFile(archive) as source:
        entries = source.infolist()
        if sum(entry.file_size for entry in entries) > 8 * 1024 ** 3:
            raise CatalogError("來源展開大小超過受控上限。")
        targets = []
        for entry in entries:
            if stat.S_ISLNK(entry.external_attr >> 16):
                raise CatalogError("壓縮來源不得包含 symbolic link。")
            target = ContentPathPolicy.resolve(destination, entry.filename.rstrip("/"))
            if not entry.is_dir():
                targets.append((entry, target))
        for entry, target in targets:
            target.parent.mkdir(parents=True, exist_ok=True)
            data = source.read(entry)
            if target.exists():
                if target.read_bytes() != data:
                    raise CatalogError("既有來源與壓縮檔不同，請使用新的來源目錄。")
            else:
                with target.open("xb") as stream:
                    stream.write(data)


def inspect_ldraw(library_root, filename):
    """逐依賴保存檔頭、作者及 hash，未支援 TEXMAP 明確失敗。"""
    root = Path(library_root)
    files = {}
    visiting = set()

    def inspect(name):
        name = name.replace("\\", "/")
        candidates = [ContentPathPolicy.resolve(root, folder + name) for folder in ("parts/", "p/", "")]
        path = next((candidate for candidate in candidates if candidate.is_file()), None)
        if path is None:
            raise CatalogError("缺少 LDraw 依賴：" + name)
        key = path.relative_to(root).as_posix()
        if key in visiting:
            raise CatalogError("LDraw 存在循環依賴：" + key)
        if key in files:
            return
        visiting.add(key)
        data = ContentPathPolicy.read_bytes(root, key)
        lines = data.decode("utf-8-sig").splitlines()
        author = next((line[10:].strip() for line in lines if line.startswith("0 Author:")), None)
        license_text = next((line[11:].strip() for line in lines if line.startswith("0 !LICENSE ")), None)
        if not author or not license_text:
            raise CatalogError("來源缺少作者或使用條件：" + key)
        if not any(term in license_text for term in ("CC BY 4.0", "CC0", "CCAL version 2.0")):
            raise CatalogError("來源使用條件尚未支援：" + key)
        for line in lines:
            if line.startswith("0 !TEXMAP"):
                raise CatalogError("TEXMAP 尚需補建與驗證：" + key)
            if line.startswith("1 "):
                tokens = line.split(maxsplit=14)
                if len(tokens) != 15:
                    raise CatalogError("LDraw 子件語法錯誤：" + key)
                inspect(tokens[14])
        visiting.remove(key)
        files[key] = {"path": key, "author": author, "license": license_text,
                      "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data),
                      "source": "https://library.ldraw.org/library/official/" + key}

    inspect(filename)
    return {"filename": filename, "files": sorted(files.values(), key=lambda row: row["path"]),
            "productionStatus": "Unknown", "productionReason": "模型來源未提供基準日生產證據。"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="展開已取得來源；不判定生產狀態。")
    parser.add_argument("archive")
    parser.add_argument("destination")
    args = parser.parse_args()
    extract_archive(args.archive, args.destination)
