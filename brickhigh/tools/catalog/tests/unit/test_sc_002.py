"""SC-002：LEGO Design ID 與 Element ID／顏色身份必須分層。"""

from tools.catalog.repository import CatalogRepository


def test_UT_004_LegoDesignIdentity_SameDesign_ReusesGeometryPart(tmp_path):
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        first = repo.add_part("BRICK 1X2 W. 2 KNOBS", "System", "LEGO-Design:11211")
        second = repo.add_part("BRICK 1X2 W. 2 KNOBS", "System", "LEGO-Design:11211")
        assert first == second
        assert repo.connection.execute("SELECT COUNT(*) FROM parts").fetchone()[0] == 1


def test_UT_005_LegoElementIdentity_DifferentColour_CreatesElementVariants_SharingDesignGeometry(tmp_path):
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        part = repo.add_part("BRICK 1X2 W. 2 KNOBS", "System", "LEGO-Design:11211")
        medium_nougat = repo.add_variant(part, {"elementId": "6411587", "colour": "Medium Nougat"})
        earth_blue = repo.add_variant(part, {"elementId": "6135606", "colour": "Earth Blue"})
        assert medium_nougat != earth_blue
        assert repo.connection.execute("SELECT COUNT(*) FROM parts").fetchone()[0] == 1
        assert repo.connection.execute("SELECT COUNT(*) FROM variants").fetchone()[0] == 2
        appearances = [row[0] for row in repo.connection.execute("SELECT appearance_json FROM variants ORDER BY appearance_json")]
        assert any('"elementId":"6411587"' in value for value in appearances)
        assert any('"elementId":"6135606"' in value for value in appearances)


def test_UT_006_LegoElementIdentity_SameElement_ReusesSameVariant(tmp_path):
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        part = repo.add_part("BRICK 1X2 W. 2 KNOBS", "System", "LEGO-Design:11211")
        appearance = {"elementId": "6135606", "colour": "Earth Blue"}
        first = repo.add_variant(part, appearance)
        second = repo.add_variant(part, appearance)
        assert first == second
        assert repo.connection.execute("SELECT COUNT(*) FROM variants").fetchone()[0] == 1

