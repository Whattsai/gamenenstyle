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


def test_source_geometry_provides_independent_reference_dimensions_through_nested_transform(tmp_path):
    (tmp_path / "parts").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    # 子件尺寸為 X=20、Y=24、Z=10 LDU；父件矩陣交換 X/Y 並翻轉 Z，尺寸應成 24/20/10 LDU。
    (tmp_path / "parts/b.dat").write_text(
        header + "3 16 0 0 0 20 0 0 0 -24 10\n",
        encoding="utf-8",
    )
    (tmp_path / "parts/a.dat").write_text(
        header + "1 16 100 200 300 0 1 0 1 0 0 0 0 -1 b.dat\n",
        encoding="utf-8",
    )

    manifest = inspect_ldraw(tmp_path, "a.dat")
    reference = manifest["referenceGeometry"]
    assert reference["method"] == "ldraw-source-vertices-v1"
    assert reference["coordinateProfile"] == "ldraw-canonical-metres-v1"
    assert reference["dimensionsMeters"] == pytest.approx([.0096, .008, .004])
    assert reference["boundsLdu"]["min"] == pytest.approx([76, 200, 290])
    assert reference["boundsLdu"]["max"] == pytest.approx([100, 220, 300])
    assert len(reference["dependencyDigest"]) == 64


def test_source_connector_candidates_promote_stud_but_keep_underside_tube_as_geometry_hint(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    (tmp_path / "p/stud.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "p/stud4.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 20 0 10 1 0 0 0 1 0 0 0 1 stud.dat\n"
        + "1 16 0 24 0 1 0 0 0 -5 0 0 0 1 stud4.dat\n",
        encoding="utf-8",
    )

    manifest = inspect_ldraw(tmp_path, "a.dat")
    candidates = manifest["connectorCandidates"]
    assert len(candidates) == 1
    stud = candidates[0]
    assert stud["profile"] == "system-stud-v1"
    assert stud["primitive"] == "p/stud.dat"
    assert stud["side"] == "male"
    assert stud["position"] == pytest.approx([.008, 0, -.004])
    assert stud["normal"] == pytest.approx([0, 1, 0])
    assert stud["tangent"] == pytest.approx([1, 0, 0])
    assert len(stud["dependencyDigest"]) == 64

    # stud4 是底部 tube 幾何中心，不等於已證明的 logical female socket anchor；先保留 transform hint。
    hints = manifest["connectorPrimitiveHints"]
    tube = next(item for item in hints if item["primitive"] == "p/stud4.dat")
    assert tube["position"] == pytest.approx([0, -.0096, 0])
    assert tube["normal"] == pytest.approx([0, -1, 0])
    assert tube["tangent"] == pytest.approx([1, 0, 0])


def test_source_connector_candidates_keep_duplo_stud_profiles_separate_from_system_studs(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    (tmp_path / "p/stud7.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "p/stud8.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 20 0 10 1 0 0 0 1 0 0 0 1 stud7.dat\n"
        + "1 16 0 24 0 1 0 0 0 -5 0 0 0 1 stud8.dat\n",
        encoding="utf-8",
    )

    manifest = inspect_ldraw(tmp_path, "a.dat")
    candidates = manifest["connectorCandidates"]
    assert {item["profile"] for item in candidates} == {"duplo-stud-v1"}
    assert {item["family"] for item in candidates} == {"duplo-stud"}
    stud = candidates[0]
    assert stud["primitive"] == "p/stud7.dat"
    assert stud["side"] == "male"
    assert stud["normal"] == pytest.approx([0, 1, 0])
    assert any(item["primitive"] == "p/stud8.dat" for item in manifest["connectorPrimitiveHints"]), \
        "DUPLO underside tube geometry remains a hint until logical socket anchors are paired and verified."


def test_source_connector_candidates_promote_documented_system_stud_variants(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    for name in ("stud2.dat", "stud2a.dat", "stud10.dat", "stud4a.dat", "stud4s.dat"):
        (tmp_path / "p" / name).write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 0 0 0 1 0 0 0 1 0 0 0 1 stud2.dat\n"
        + "1 16 20 0 0 1 0 0 0 1 0 0 0 1 stud2a.dat\n"
        + "1 16 40 0 0 1 0 0 0 1 0 0 0 1 stud10.dat\n"
        + "1 16 0 24 0 1 0 0 0 -1 0 0 0 1 stud4a.dat\n"
        + "1 16 20 24 0 1 0 0 0 -1 0 0 0 1 stud4s.dat\n",
        encoding="utf-8",
    )

    manifest = inspect_ldraw(tmp_path, "a.dat")
    candidates = manifest["connectorCandidates"]
    assert len(candidates) == 3
    assert all(item["profile"] == "system-stud-v1" and item["side"] == "male" for item in candidates)
    assert {item["primitive"] for item in candidates} == {
        "p/stud2.dat", "p/stud2a.dat", "p/stud10.dat",
    }
    assert {item["primitive"] for item in manifest["connectorPrimitiveHints"]} >= {
        "p/stud4a.dat", "p/stud4s.dat",
    }


def test_source_connector_candidates_extract_both_technic_friction_pin_ends(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -20 1\n"
    (tmp_path / "p/confric5.dat").write_text(header + primitive_geometry, encoding="utf-8")
    # 2780.dat 的官方結構：同一 confric5 primitive 以相反方向組成 pin 的兩端。
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 0 0 0 0 1 0 0 0 1 1 0 0 confric5.dat\n"
        + "1 16 0 0 0 0 -1 0 0 0 1 1 0 0 confric5.dat\n",
        encoding="utf-8",
    )

    candidates = inspect_ldraw(tmp_path, "a.dat")["connectorCandidates"]
    pins = [item for item in candidates if item["profile"] == "technic-friction-pin-v1"]
    assert len(pins) == 2
    assert all(item["family"] == "technic-pin" and item["side"] == "male" for item in pins)
    assert all(item["position"] == pytest.approx([0, 0, 0]) for item in pins)
    assert {tuple(round(value, 6) for value in item["normal"]) for item in pins} == {(-1.0, 0.0, 0.0), (1.0, 0.0, 0.0)}
    assert all(item["tangent"] == pytest.approx([0, 0, -1]) for item in pins)


def test_source_connector_candidates_extract_both_technic_axle_ends(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    (tmp_path / "p/axleend2.dat").write_text(header + primitive_geometry, encoding="utf-8")
    # 官方 Technic axle 以兩個相反 transform 的 axleend2.dat 表示兩端，local -Y 即對外插接軸。
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 40 0 0 0 -1 0 1 0 0 0 0 1 axleend2.dat\n"
        + "1 16 -40 0 0 0 1 0 1 0 0 0 0 -1 axleend2.dat\n",
        encoding="utf-8",
    )

    candidates = inspect_ldraw(tmp_path, "a.dat")["connectorCandidates"]
    axles = [item for item in candidates if item["profile"] == "technic-axle-v1"]
    assert len(axles) == 2
    assert all(item["family"] == "technic-axle" and item["side"] == "male" for item in axles)
    assert {tuple(round(value, 6) for value in item["position"]) for item in axles} == {(-.016, 0, 0), (.016, 0, 0)}
    assert {tuple(round(value, 6) for value in item["normal"]) for item in axles} == {(-1.0, 0.0, 0.0), (1.0, 0.0, 0.0)}


def test_source_connector_candidates_preserve_two_technic_pin_hole_openings(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    (tmp_path / "p/peghole.dat").write_text(header + primitive_geometry, encoding="utf-8")
    # Technic through-hole 的兩個開口由兩個相反方向的 peghole primitive 表示；每端都要保留成獨立 female connector。
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 0 10 0 1 0 0 0 -1 0 0 0 1 peghole.dat\n"
        + "1 16 0 -10 0 1 0 0 0 1 0 0 0 1 peghole.dat\n",
        encoding="utf-8",
    )

    candidates = inspect_ldraw(tmp_path, "a.dat")["connectorCandidates"]
    holes = [item for item in candidates if item["profile"] == "technic-pin-hole-v1"]
    assert len(holes) == 2
    assert all(item["family"] == "technic-pin-hole" and item["side"] == "female" for item in holes)
    assert {tuple(round(value, 6) for value in item["position"]) for item in holes} == {(0, -.004, 0), (0, .004, 0)}
    assert {tuple(round(value, 6) for value in item["normal"]) for item in holes} == {(0, -1.0, 0), (0, 1.0, 0)}


def test_source_connector_candidates_extract_joint8_ball_and_socket_axes(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    (tmp_path / "p/joint8ball.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "p/joint8socket3.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "p/joint8socket1.dat").write_text(
        header + "1 16 0 0 0 1 0 0 0 1 0 0 0 1 joint8socket3.dat\n",
        encoding="utf-8",
    )
    # 14417 / 14418 的官方 transform：primitive owning body 位於 local +Z，接合開口朝 local -Z。
    (tmp_path / "parts/a.dat").write_text(
        header
        + "1 16 0 4 -20 1 0 0 0 1 0 0 0 1 joint8ball.dat\n"
        + "1 16 30 4 0 0 0 -1 0 1 0 1 0 0 joint8socket1.dat\n",
        encoding="utf-8",
    )

    manifest = inspect_ldraw(tmp_path, "a.dat")
    candidates = manifest["connectorCandidates"]
    ball = next(item for item in candidates if item["profile"] == "ball-v1")
    socket = next(item for item in candidates if item["profile"] == "socket-v1")

    assert ball["primitive"] == "p/joint8ball.dat"
    assert ball["side"] == "male"
    assert ball["position"] == pytest.approx([0, -.0016, .008])
    assert ball["normal"] == pytest.approx([0, 0, 1])
    assert ball["tangent"] == pytest.approx([1, 0, 0])

    assert socket["primitive"] == "p/joint8socket1.dat"
    assert socket["side"] == "female"
    assert socket["position"] == pytest.approx([.012, -.0016, 0])
    assert socket["normal"] == pytest.approx([1, 0, 0])
    assert socket["tangent"] == pytest.approx([0, 0, -1])

    # joint8socket3 只是 socket1 內部幾何，不可再升格成第二個 logical socket。
    assert len([item for item in candidates if item["profile"] == "socket-v1"]) == 1
    assert any(item["primitive"] == "p/joint8socket3.dat" for item in manifest["connectorPrimitiveHints"])


def test_source_connector_hints_preserve_unmapped_technic_primitive_transform_without_promoting_it(tmp_path):
    (tmp_path / "parts").mkdir()
    (tmp_path / "p").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    primitive_geometry = "3 16 -1 0 -1 1 0 -1 0 -4 1\n"
    (tmp_path / "p/connhole.dat").write_text(header + primitive_geometry, encoding="utf-8")
    (tmp_path / "parts/a.dat").write_text(
        header + "1 16 20 30 40 0 2 0 0 0 3 4 0 0 connhole.dat\n",
        encoding="utf-8",
    )

    manifest = inspect_ldraw(tmp_path, "a.dat")
    assert manifest["connectorCandidates"] == []
    hints = manifest["connectorPrimitiveHints"]
    assert len(hints) == 1
    hint = hints[0]
    assert hint["primitive"] == "p/connhole.dat"
    assert hint["sourceFile"] == "parts/a.dat"
    assert hint["position"] == pytest.approx([.008, -.012, -.016])
    assert hint["normal"] == pytest.approx([-1, 0, 0])
    assert hint["tangent"] == pytest.approx([0, 0, -1])
    assert hint["axisScaleLdu"] == pytest.approx(2)
    assert hint["tangentScaleLdu"] == pytest.approx(4)
    assert hint["bitangentScaleLdu"] == pytest.approx(3)
    assert len(hint["dependencyDigest"]) == 64


def test_source_geometry_conditional_line_ignores_control_points_for_reference_bounds(tmp_path):
    (tmp_path / "parts").mkdir()
    header = "0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt\n0 Author: Fixture Author\n"
    # type 5 的後兩點只控制顯示條件，不是實際幾何端點，不可把 nominal bounds 撐到 999 LDU。
    (tmp_path / "parts/a.dat").write_text(
        header + "5 24 0 0 0 20 -24 10 999 999 999 -999 -999 -999\n",
        encoding="utf-8",
    )

    reference = inspect_ldraw(tmp_path, "a.dat")["referenceGeometry"]
    assert reference["dimensionsMeters"] == pytest.approx([.008, .0096, .004])
