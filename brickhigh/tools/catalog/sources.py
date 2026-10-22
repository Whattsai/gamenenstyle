"""來源壓縮檔展開與 LDraw 完整依賴檢查；幾何存在不證明仍在生產。"""

import argparse
import hashlib
import math
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
    """逐依賴保存檔頭、作者及 hash，並由原始 LDraw 幾何計算獨立尺寸證據。"""
    root = Path(library_root)
    files = {}
    visiting = set()

    def resolve(name):
        name = name.replace("\\", "/")
        candidates = [ContentPathPolicy.resolve(root, folder + name) for folder in ("parts/", "p/", "")]
        path = next((candidate for candidate in candidates if candidate.is_file()), None)
        if path is None:
            raise CatalogError("缺少 LDraw 依賴：" + name)
        return path.relative_to(root).as_posix(), path

    def inspect(name):
        key, path = resolve(name)
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

    def reference_geometry():
        points = []
        connector_candidates = []
        connector_hints = []
        geometry_visiting = set()
        identity = ((0.0, 0.0, 0.0), ((1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (0.0, 0.0, 1.0)))
        # 每個已支援 primitive 明確保存其 local 接合軸與 tangent；不可假設所有接點都沿 local -Y。
        connector_primitives = {
            "stud.dat": ("stud", "system-stud-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            "stud2.dat": ("stud", "system-stud-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            "stud2a.dat": ("stud", "system-stud-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            "stud10.dat": ("stud", "system-stud-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            # stud4/stud4a/stud4s 與 DUPLO stud8 描述 underside tube 幾何中心，
            # 不是已證明的 logical female socket anchor；保留為 connectorPrimitiveHints，待 pairing fixture 推導。
            "stud7.dat": ("duplo-stud", "duplo-stud-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            "confric5.dat": ("technic-pin", "technic-friction-pin-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            "peghole.dat": ("technic-pin-hole", "technic-pin-hole-v1", "female", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            "axleend2.dat": ("technic-axle", "technic-axle-v1", "male", (0.0, -1.0, 0.0), (1.0, 0.0, 0.0)),
            # Joint-8 ball/socket 的 owning body 位於 primitive local +Z，接合開口朝 local -Z。
            "joint8ball.dat": ("ball", "ball-v1", "male", (0.0, 0.0, -1.0), (1.0, 0.0, 0.0)),
            "joint8socket1.dat": ("socket", "socket-v1", "female", (0.0, 0.0, -1.0), (1.0, 0.0, 0.0)),
        }
        connector_hint_prefixes = (
            "stud", "stug", "axle", "axl", "connect", "confric", "connhol", "beamhole",
            "peghol", "npeghol", "daxle", "dconnhole", "dnpeghole", "joint",
        )

        def numeric(tokens, key):
            try:
                values = tuple(float(token) for token in tokens)
            except ValueError as error:
                raise CatalogError("LDraw 幾何數值無效：" + key) from error
            if not all(math.isfinite(value) for value in values):
                raise CatalogError("LDraw 幾何數值非有限值：" + key)
            return values

        def transform_point(transform, point):
            translation, matrix = transform
            return tuple(translation[row] + sum(matrix[row][column] * point[column] for column in range(3))
                         for row in range(3))

        def compose(parent, child):
            child_translation, child_matrix = child
            parent_translation, parent_matrix = parent
            translation = transform_point(parent, child_translation)
            matrix = tuple(tuple(sum(parent_matrix[row][k] * child_matrix[k][column] for k in range(3))
                                 for column in range(3)) for row in range(3))
            return translation, matrix

        def canonical_position(transform):
            translation, _ = transform
            # 與 Domain CoordinatePolicy.FromLDraw 完全一致：LDraw +Z 必須映成 canonical -Z。
            return [translation[0] * .0004, -translation[1] * .0004, -translation[2] * .0004]

        def transformed_length(transform, local, key):
            _, matrix = transform
            ldraw = [sum(matrix[row][column] * local[column] for column in range(3)) for row in range(3)]
            length = math.sqrt(sum(value * value for value in ldraw))
            if not math.isfinite(length) or length <= 1e-12:
                raise CatalogError("LDraw 接點方向矩陣無效：" + key)
            return length

        def canonical_direction(transform, local, key):
            _, matrix = transform
            ldraw = [sum(matrix[row][column] * local[column] for column in range(3)) for row in range(3)]
            canonical = [ldraw[0], -ldraw[1], -ldraw[2]]
            length = math.sqrt(sum(value * value for value in canonical))
            if not math.isfinite(length) or length <= 1e-12:
                raise CatalogError("LDraw 接點方向矩陣無效：" + key)
            return [value / length for value in canonical]

        def add_vertices(tokens, count, transform, key):
            values = numeric(tokens, key)
            if len(values) != count * 3:
                raise CatalogError("LDraw 幾何語法錯誤：" + key)
            for offset in range(0, len(values), 3):
                points.append(transform_point(transform, values[offset:offset + 3]))

        def visit(name, transform):
            key, path = resolve(name)
            if key in geometry_visiting:
                raise CatalogError("LDraw 存在循環依賴：" + key)
            geometry_visiting.add(key)
            lines = ContentPathPolicy.read_bytes(root, key).decode("utf-8-sig").splitlines()
            for line in lines:
                tokens = line.split()
                if not tokens:
                    continue
                kind = tokens[0]
                if kind == "1":
                    if len(tokens) != 15:
                        raise CatalogError("LDraw 子件語法錯誤：" + key)
                    values = numeric(tokens[2:14], key)
                    child = (values[0:3], (values[3:6], values[6:9], values[9:12]))
                    child_transform = compose(transform, child)
                    child_key, _ = resolve(tokens[14])
                    primitive_name = Path(child_key).name.lower()
                    semantics = connector_primitives.get(primitive_name) if child_key.startswith("p/") else None
                    if semantics is not None:
                        family, profile, side, local_normal, local_tangent = semantics
                        connector_candidates.append({
                            "primitive": child_key,
                            "sourceFile": key,
                            "family": family,
                            "profile": profile,
                            "side": side,
                            "position": canonical_position(child_transform),
                            "normal": canonical_direction(child_transform, local_normal, child_key),
                            "tangent": canonical_direction(child_transform, local_tangent, child_key),
                        })
                    elif child_key.startswith("p/") and primitive_name.startswith(connector_hint_prefixes):
                        # 僅保存未支援 connector-like primitive 的 transform；hint 不是正式 connector，不可直接配對。
                        connector_hints.append({
                            "primitive": child_key,
                            "sourceFile": key,
                            "position": canonical_position(child_transform),
                            "normal": canonical_direction(child_transform, (0.0, -1.0, 0.0), child_key),
                            "tangent": canonical_direction(child_transform, (1.0, 0.0, 0.0), child_key),
                            "axisScaleLdu": transformed_length(child_transform, (0.0, -1.0, 0.0), child_key),
                            "tangentScaleLdu": transformed_length(child_transform, (1.0, 0.0, 0.0), child_key),
                            "bitangentScaleLdu": transformed_length(child_transform, (0.0, 0.0, 1.0), child_key),
                        })
                    visit(tokens[14], child_transform)
                elif kind == "2":
                    if len(tokens) != 8:
                        raise CatalogError("LDraw 線段語法錯誤：" + key)
                    add_vertices(tokens[2:8], 2, transform, key)
                elif kind == "3":
                    if len(tokens) != 11:
                        raise CatalogError("LDraw 三角形語法錯誤：" + key)
                    add_vertices(tokens[2:11], 3, transform, key)
                elif kind == "4":
                    if len(tokens) != 14:
                        raise CatalogError("LDraw 四邊形語法錯誤：" + key)
                    add_vertices(tokens[2:14], 4, transform, key)
                elif kind == "5":
                    if len(tokens) != 14:
                        raise CatalogError("LDraw 條件線語法錯誤：" + key)
                    # 後兩點只控制 conditional line 顯示條件，不是可見幾何端點。
                    add_vertices(tokens[2:8], 2, transform, key)
            geometry_visiting.remove(key)

        visit(filename, identity)
        if not points:
            raise CatalogError("LDraw 來源沒有可量測的幾何端點。")
        minimum = [min(point[axis] for point in points) for axis in range(3)]
        maximum = [max(point[axis] for point in points) for axis in range(3)]
        dimensions = [(maximum[axis] - minimum[axis]) * .0004 for axis in range(3)]
        if any(value <= 0 for value in dimensions):
            raise CatalogError("LDraw 來源尺寸必須為正值。")
        dependency_rows = sorted(files.values(), key=lambda row: row["path"])
        dependency_payload = "\n".join(row["path"] + ":" + row["sha256"] for row in dependency_rows).encode("utf-8")
        dependency_digest = hashlib.sha256(dependency_payload).hexdigest()
        connector_candidates.sort(key=lambda item: (
            item["profile"], tuple(round(value, 12) for value in item["position"]),
            item["primitive"], item["sourceFile"],
        ))
        for index, candidate in enumerate(connector_candidates, start=1):
            candidate["id"] = f"source-{candidate['family']}-{index:03d}"
            candidate["dependencyDigest"] = dependency_digest
        connector_hints.sort(key=lambda item: (
            item["primitive"], tuple(round(value, 12) for value in item["position"]), item["sourceFile"],
        ))
        for hint in connector_hints:
            hint["dependencyDigest"] = dependency_digest
        return {
            "method": "ldraw-source-vertices-v1",
            "coordinateProfile": "ldraw-canonical-metres-v1",
            "boundsLdu": {"min": minimum, "max": maximum},
            "dimensionsMeters": dimensions,
            "dependencyDigest": dependency_digest,
            "connectorCandidates": connector_candidates,
            "connectorPrimitiveHints": connector_hints,
        }

    ordered_files = sorted(files.values(), key=lambda row: row["path"])
    reference = reference_geometry()
    connector_candidates = reference.pop("connectorCandidates")
    connector_hints = reference.pop("connectorPrimitiveHints")
    return {"filename": filename, "files": ordered_files, "referenceGeometry": reference,
            "connectorCandidates": connector_candidates, "connectorPrimitiveHints": connector_hints,
            "productionStatus": "Unknown", "productionReason": "模型來源未提供基準日生產證據。"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="展開已取得來源；不判定生產狀態。")
    parser.add_argument("archive")
    parser.add_argument("destination")
    args = parser.parse_args()
    extract_archive(args.archive, args.destination)
