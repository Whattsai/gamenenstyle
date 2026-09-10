"""SC-024：所有交換檔案必須留在受控內容根。"""

import pytest

from tools.catalog.content import ContentPathPolicy, ObjectStore
from tools.catalog.policies import CatalogError


def test_UT_070_ContentPathPolicy_TraversalPath_RejectsEscape(tmp_path):
    for key in ("../escape", "a/../../escape", "/absolute", "C:/outside", "https://host/file",
                "a\\..\\outside", "file:stream", "//host/share", "CON", "a/aux.txt", "file. "):
        with pytest.raises(CatalogError):
            ContentPathPolicy.resolve(tmp_path, key)
    assert ContentPathPolicy.resolve(tmp_path, "models/3001.glb") == tmp_path / "models/3001.glb"


def test_UT_071_ContentPathPolicy_RemoteAddress_RejectsBuild():
    for content in ({"loadPath": "https://host/bundle"}, {"remoteCatalog": True},
                    {"nested": [{"url": "http://host/catalog"}]}):
        with pytest.raises(CatalogError):
            ContentPathPolicy.validate_runtime_config(content)
    ContentPathPolicy.validate_runtime_config({"loadPath": "bundles/local", "remoteCatalog": False})


def test_UT_072_ContentPathPolicy_DeveloperArtifacts_ExcludedFromPlayer():
    for key in ("tools/catalog/main.py", "draft/snapshot.json", ".env", "sources/raw.csv", "secrets/api-key.json"):
        with pytest.raises(CatalogError):
            ContentPathPolicy.validate_player_key(key)
    ContentPathPolicy.validate_player_key("attribution/ldraw.txt")


def test_immutable_store_reuses_equal_bytes_and_rejects_corruption(tmp_path):
    store = ObjectStore(tmp_path)
    stored = store.put(b"nonempty source artifact")
    assert store.put(b"nonempty source artifact") == stored
    assert store.read(stored) == b"nonempty source artifact"
    (tmp_path / stored["storage_key"]).write_bytes(b"corrupt")
    with pytest.raises(CatalogError):
        store.put(b"nonempty source artifact")

