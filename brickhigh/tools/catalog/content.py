"""受控本機路徑、實際讀取內容驗證與不可變物件庫。"""

import ctypes
from ctypes import wintypes
import hashlib
import os
from pathlib import Path, PurePosixPath
import stat
import tempfile

from .policies import CatalogError


class ContentPathPolicy:
    """所有 key 都是包內相對路徑，不信任 mtime 或名稱。"""

    @staticmethod
    def resolve(root, key):
        root = Path(root).absolute()
        if not isinstance(key, str) or not key or "\\" in key or ":" in key or "\x00" in key:
            raise CatalogError("內容路徑無效。")
        parts = PurePosixPath(key).parts
        if PurePosixPath(key).is_absolute() or any(part in {".", ".."} for part in key.split("/")):
            raise CatalogError("內容路徑超出允許範圍。")
        reserved = {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)), *(f"LPT{i}" for i in range(1, 10))}
        if any(part.rstrip(" .") != part or part.split(".")[0].upper() in reserved for part in parts):
            raise CatalogError("內容路徑包含保留名稱。")
        candidate = root.joinpath(*parts)
        for node in [root, *root.parents]:
            # 根目錄的祖先可能含 junction，亦不可藉此穿越指定範圍。
            reparse = (os.name == "nt" and node.exists()
                       and node.lstat().st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT)
            if reparse or node.is_symlink():
                raise CatalogError("內容路徑包含重新解析節點。")
        current = root
        for part in parts:
            current /= part
            if current.exists() or current.is_symlink():
                info = current.lstat()
                if current.is_symlink() or (os.name == "nt" and info.st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT):
                    raise CatalogError("內容路徑包含重新解析節點。")
        if not candidate.resolve().is_relative_to(root.resolve()):
            raise CatalogError("內容路徑超出允許範圍。")
        return candidate

    @staticmethod
    def read_bytes(root, key):
        path = ContentPathPolicy.resolve(root, key)
        if os.name != "nt":
            return path.read_bytes()
        # 持有同一不可寫換的 handle，解析實際路徑後才開始讀取。
        import msvcrt
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.c_void_p,
                                      wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
        kernel.CreateFileW.restype = wintypes.HANDLE
        kernel.GetFinalPathNameByHandleW.argtypes = [wintypes.HANDLE, wintypes.LPWSTR, wintypes.DWORD, wintypes.DWORD]
        kernel.GetFinalPathNameByHandleW.restype = wintypes.DWORD
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        handle = kernel.CreateFileW(str(path), 0x80000000, 1, None, 3, 0x08000000, None)
        if handle == ctypes.c_void_p(-1).value:
            raise ctypes.WinError(ctypes.get_last_error())
        try:
            buffer = ctypes.create_unicode_buffer(32768)
            length = kernel.GetFinalPathNameByHandleW(handle, buffer, len(buffer), 0)
            if length == 0 or length >= len(buffer):
                raise CatalogError("無法確認實際內容路徑。")
            final = buffer.value
            if final.startswith("\\\\?\\UNC\\"):
                final = "\\\\" + final[8:]
            elif final.startswith("\\\\?\\"):
                final = final[4:]
            if not Path(final).is_relative_to(Path(root).resolve()):
                raise CatalogError("實際檔案位於內容根目錄外。")
            fd = msvcrt.open_osfhandle(handle, os.O_RDONLY | os.O_BINARY)
            handle = None
            with os.fdopen(fd, "rb") as stream:
                return stream.read()
        finally:
            if handle is not None:
                kernel.CloseHandle(handle)

    @staticmethod
    def read_verified(root, key, expected_digest):
        data = ContentPathPolicy.read_bytes(root, key)
        if hashlib.sha256(data).hexdigest() != expected_digest:
            raise CatalogError("內容 SHA-256 不符，原資料已保留。")
        return data

    @staticmethod
    def validate_runtime_config(config):
        if isinstance(config, dict):
            if config.get("remoteCatalog") or config.get("autoUpdate"):
                raise CatalogError("執行環境不得依賴遠端更新。")
            for value in config.values():
                ContentPathPolicy.validate_runtime_config(value)
        elif isinstance(config, list):
            for value in config:
                ContentPathPolicy.validate_runtime_config(value)
        elif isinstance(config, str) and config.lower().startswith(("http:", "https:", "ftp:", "file:")):
            raise CatalogError("執行期資產不得包含外部 URI。")

    @staticmethod
    def validate_player_key(key):
        parts = PurePosixPath(key).parts
        if any(part.lower() in {"tools", "draft", "sources", "secrets", ".env"} for part in parts):
            raise CatalogError("製作工具或私人設定不得進入玩家安裝包。")


class ObjectStore:
    """SHA-256 定址；已存在物件永不覆寫。"""

    def __init__(self, root):
        self.root = Path(root).absolute()
        self.root.mkdir(parents=True, exist_ok=True)

    def put(self, data):
        sha = hashlib.sha256(data).hexdigest()
        key = "objects/" + sha + "/content"
        target = ContentPathPolicy.resolve(self.root, key)
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            fd, temporary = tempfile.mkstemp(prefix=".staging-", dir=target.parent)
            try:
                with os.fdopen(fd, "wb") as stream:
                    stream.write(data)
                    stream.flush()
                    os.fsync(stream.fileno())
                try:
                    os.link(temporary, target)
                except FileExistsError:
                    pass
            finally:
                Path(temporary).unlink(missing_ok=True)
        ContentPathPolicy.read_verified(self.root, key, sha)
        return {"sha256": sha, "storage_key": key, "byte_length": len(data)}

    def read(self, reference):
        return ContentPathPolicy.read_verified(self.root, reference["storage_key"], reference["sha256"])
