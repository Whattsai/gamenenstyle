"""受控 LDraw 顏色轉標準 glTF PBR 材質的政策。"""

import math
import re

from .policies import CatalogError


def verify_exported_materials(glb_bytes, comparisons):
    """比對實際 GLB 材質與來源轉換紀錄；不能只相信 Blender 事前設定的 shader。"""
    import json
    import struct

    try:
        if (not isinstance(glb_bytes, bytes) or len(glb_bytes) < 20
                or struct.unpack_from('<III', glb_bytes) != (0x46546C67, 2, len(glb_bytes))):
            raise CatalogError('GLB 材質來源核對缺少有效模型。')
        json_length, chunk_kind = struct.unpack_from('<II', glb_bytes, 12)
        if chunk_kind != 0x4E4F534A or json_length < 2 or 20 + json_length > len(glb_bytes):
            raise CatalogError('GLB 材質來源核對缺少 JSON 內容。')
        document = json.loads(glb_bytes[20:20 + json_length])
        materials = document['materials']
    except (ValueError, TypeError, KeyError, struct.error) as error:
        raise CatalogError('GLB 材質來源核對格式無效。') from error

    if (not isinstance(materials, list) or not isinstance(comparisons, list)
            or not materials or len(materials) != len(comparisons)):
        raise CatalogError('GLB 匯出材質與來源數量不一致。')

    expected = {}
    for record in comparisons:
        if not isinstance(record, dict) or not isinstance(record.get('target'), dict):
            raise CatalogError('GLB 缺少可驗證的來源材質對照。')
        name = record.get('material')
        if not isinstance(name, str) or not name or name in expected:
            raise CatalogError('GLB 來源材質名稱缺失或重複。')
        expected[name] = record['target']

    names = set()
    for material in materials:
        if not isinstance(material, dict):
            raise CatalogError('GLB 材質資料無效。')
        name = material.get('name')
        if not isinstance(name, str) or name not in expected or name in names:
            raise CatalogError('GLB 匯出材質名稱與來源不一致。')
        names.add(name)
        target = expected[name]
        pbr = material.get('pbrMetallicRoughness')
        if not isinstance(pbr, dict):
            raise CatalogError('GLB 缺少標準 PBR 材質。')

        def close(actual, desired):
            return (type(actual) in (int, float) and type(desired) in (int, float)
                    and math.isfinite(actual) and math.isfinite(desired)
                    and abs(actual - desired) <= .002)

        rgba = pbr.get('baseColorFactor', [1, 1, 1, 1])
        expected_rgba = target.get('baseColorLinear')
        if (not isinstance(rgba, list) or not isinstance(expected_rgba, list)
                or len(rgba) != 4 or len(expected_rgba) != 4
                or not all(close(actual, desired) for actual, desired in zip(rgba, expected_rgba))
                or not close(pbr.get('metallicFactor', 1), target.get('metallic'))
                or not close(pbr.get('roughnessFactor', 1), target.get('roughness'))
                or material.get('alphaMode', 'OPAQUE') != target.get('alphaMode')
                or any(not close(actual, 0) for actual in material.get('emissiveFactor', [0, 0, 0]))):
            raise CatalogError('GLB 匯出 PBR、色彩或透明度與來源不一致。')

def verify_printed_source_surfaces(glb_bytes, root_ldraw_bytes):
    """來源根件的顯式分色面必須在實際場景 GLB 的三角面材質中被使用；不等同印刷視覺核准。"""
    import json
    import struct

    if not isinstance(root_ldraw_bytes, bytes):
        raise CatalogError('來源分色 LDraw 缺少原始位元組。')
    try:
        lines = root_ldraw_bytes.decode('utf-8-sig').splitlines()
    except UnicodeDecodeError as error:
        raise CatalogError('來源分色 LDraw 不是有效文字。') from error
    source_colours = set()
    for line in lines:
        fields = line.split()
        if fields and fields[0] in ('3', '4'):
            if len(fields) != (11 if fields[0] == '3' else 14):
                raise CatalogError('來源分色面語法不完整。')
            if fields[1] not in ('16', '24'):
                if not fields[1].isdigit():
                    raise CatalogError('來源分色面尚不支援非數字色碼。')
                source_colours.add(fields[1])
    if not source_colours:
        return {'sourceExplicitFaceColours': [], 'usedExportedColours': []}

    try:
        if not isinstance(glb_bytes, bytes) or len(glb_bytes) < 20:
            raise ValueError('缺少 GLB')
        magic, version, length = struct.unpack_from('<III', glb_bytes)
        chunk_len, chunk_type = struct.unpack_from('<II', glb_bytes, 12)
        if (magic, version, length, chunk_type) != (0x46546C67, 2, len(glb_bytes), 0x4E4F534A):
            raise ValueError('GLB 標頭錯誤')
        doc = json.loads(glb_bytes[20:20 + chunk_len])
        materials = doc['materials']
        meshes = doc['meshes']
        used = set()
        visited = set()

        def visit(node_index):
            # glTF 場景必須是無循環的樹：同一節點不得重複掛載，索引不得為負。
            if (type(node_index) is not int or node_index < 0
                    or node_index >= len(doc['nodes']) or node_index in visited):
                raise ValueError('glTF 場景節點索引或拓樸無效')
            visited.add(node_index)
            node = doc['nodes'][node_index]
            if 'mesh' in node:
                mesh_id = node['mesh']
                if type(mesh_id) is not int or mesh_id < 0 or mesh_id >= len(meshes):
                    raise ValueError('glTF 網格索引無效')
                mesh = meshes[mesh_id]
                for primitive in mesh['primitives']:
                    # glTF 僅 mode 4（TRIANGLES）是獨立三角面；點、線、strip/fan 均不能冒充印刷。
                    if primitive.get('mode', 4) != 4:
                        continue
                    # 分色材質須真正對應至少一個三角形，不接受空 primitive 掛名。
                    accessor_id = primitive.get('indices', primitive.get('attributes', {}).get('POSITION'))
                    count = doc['accessors'][accessor_id]['count']
                    if type(count) is not int or count < 3 or count % 3:
                        continue
                    mat = materials[primitive['material']]
                    code = ldraw_colour_code_from_material_name(mat['name'])
                    used.add(code)
            for child in node.get('children', []):
                visit(child)

        for root in doc['scenes'][doc.get('scene', 0)]['nodes']:
            visit(root)
    except (ValueError, KeyError, IndexError, TypeError, struct.error, RecursionError, CatalogError) as error:
        raise CatalogError('來源分色面無法與有效 GLB 場景材質綁定。') from error
    missing = source_colours - used
    if missing:
        raise CatalogError('來源分色面在輸出 GLB 中未被三角網格使用：' + ', '.join(sorted(missing)))
    return {'sourceExplicitFaceColours': sorted(source_colours),
            'usedExportedColours': sorted(source_colours & used)}



def verify_printed_source_geometry(glb_bytes, root_ldraw_bytes):
    """以來源印刷分色面的 XY 形狀及前後位置核對真 GLB；不代替來源照片與 Player 人工驗收。

    目前只支援根件直接繪製、同一 Z 平面的 LDraw type3/type4 顯式分色面。
    任一非平面顯色幾何不得略過後宣稱印刷完成。
    """
    import json
    import struct

    profile = 'printed-xy-grid-v1'
    try:
        lines = root_ldraw_bytes.decode('utf-8-sig').splitlines()
    except (AttributeError, UnicodeDecodeError) as error:
        raise CatalogError('印刷幾何缺少可讀的 LDraw 來源。') from error
    sources = {}
    for line in lines:
        fields = line.split()
        if not fields or fields[0] not in ('3', '4'):
            continue
        count = 3 if fields[0] == '3' else 4
        if len(fields) != 2 + 3 * count:
            raise CatalogError('印刷幾何來源三角/四邊面格式錯誤。')
        code = fields[1]
        if code in ('16', '24'):
            continue
        if not code.isdigit():
            raise CatalogError('印刷幾何存在未支援的分色碼。')
        try:
            coords = [float(n) for n in fields[2:]]
        except ValueError as error:
            raise CatalogError('印刷幾何來源座標無法解析。') from error
        if not all(math.isfinite(n) for n in coords):
            raise CatalogError('印刷幾何來源座標無效。')
        vertices = [(coords[n] * .0004, -coords[n + 1] * .0004, -coords[n + 2] * .0004)
                    for n in range(0, len(coords), 3)]
        if max(v[2] for v in vertices) - min(v[2] for v in vertices) > 1e-7:
            raise CatalogError('印刷幾何尚未支援非 Z 平面的分色面。')
        entry = sources.setdefault(code, {'depths': set(), 'triangles': []})
        entry['depths'].add(round(vertices[0][2], 7))
        for n in range(1, count - 1):
            entry['triangles'].append((vertices[0], vertices[n], vertices[n + 1]))
    if not sources:
        return {'profile': profile, 'colourMetrics': {}}
    if any(len(entry['depths']) != 1 for entry in sources.values()):
        raise CatalogError('印刷幾何分色面跨多層深度，尚未支援比對。')

    try:
        json_length, json_type = struct.unpack_from('<II', glb_bytes, 12)
        if json_type != 0x4E4F534A:
            raise ValueError('GLB JSON')
        document = json.loads(glb_bytes[20:20 + json_length])
        bin_header = 20 + json_length
        bin_length, bin_type = struct.unpack_from('<II', glb_bytes, bin_header)
        if bin_type != 0x004E4942:
            raise ValueError('GLB BIN')
        binary = glb_bytes[bin_header + 8:bin_header + 8 + bin_length]
        accessors = document['accessors']
        views = document['bufferViews']

        def read_accessor(number):
            acc = accessors[number]
            view = views[acc['bufferView']]
            formats = {5121: 'B', 5123: 'H', 5125: 'I', 5126: 'f'}
            code = formats[acc['componentType']]
            width = 3 if acc['type'] == 'VEC3' else 1
            length = struct.calcsize('<' + code * width)
            stride = view.get('byteStride', length)
            start = view.get('byteOffset', 0) + acc.get('byteOffset', 0)
            return [struct.unpack_from('<' + code * width, binary, start + stride * i)
                    for i in range(acc['count'])]

        # glTF 的 POSITION 為節點局部座標；印刷核對必須套用整條父子節點
        # 的 matrix／TRS，否則只改場景 transform 就能繞過形狀位置驗證。
        def local_matrix(node):
            if 'matrix' in node:
                # glTF 禁止 matrix 與 TRS 同時定義，避免忽略相互衝突的座標變換。
                if any(key in node for key in ('translation', 'rotation', 'scale')):
                    raise ValueError('glTF matrix 與 TRS 不可並存')
                values = node['matrix']
                if (not isinstance(values, list) or len(values) != 16
                        or not all(type(v) in (int, float) and math.isfinite(v) for v in values)
                        or any(values[index] != expected for index, expected in
                               ((3, 0), (7, 0), (11, 0), (15, 1)))):
                    # 世界座標計算只支援合法仿射矩陣，不得忽略錯誤的齊次座標列。
                    raise ValueError('無效 glTF matrix')
                return values

            def vector(key, default):
                values = node.get(key, default)
                if (not isinstance(values, list) or len(values) != len(default)
                        or not all(type(v) in (int, float) and math.isfinite(v) for v in values)):
                    raise ValueError('無效 glTF TRS')
                return values

            tx, ty, tz = vector('translation', [0, 0, 0])
            x, y, z, w = vector('rotation', [0, 0, 0, 1])
            sx, sy, sz = vector('scale', [1, 1, 1])
            norm = math.sqrt(x * x + y * y + z * z + w * w)
            if norm < 1e-12:
                raise ValueError('無效 glTF rotation')
            x, y, z, w = x / norm, y / norm, z / norm, w / norm
            return [
                (1 - 2 * (y*y + z*z)) * sx, 2 * (x*y + z*w) * sx, 2 * (x*z - y*w) * sx, 0,
                2 * (x*y - z*w) * sy, (1 - 2 * (x*x + z*z)) * sy, 2 * (y*z + x*w) * sy, 0,
                2 * (x*z + y*w) * sz, 2 * (y*z - x*w) * sz, (1 - 2 * (x*x + y*y)) * sz, 0,
                tx, ty, tz, 1,
            ]

        def multiply(parent, child):
            return [sum(parent[k*4 + row] * child[col*4 + k] for k in range(4))
                    for col in range(4) for row in range(4)]

        def world_point(matrix, point):
            x, y, z = point
            return (matrix[0]*x + matrix[4]*y + matrix[8]*z + matrix[12],
                    matrix[1]*x + matrix[5]*y + matrix[9]*z + matrix[13],
                    matrix[2]*x + matrix[6]*y + matrix[10]*z + matrix[14])

        rendered = {code: [] for code in sources}
        identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        visited = set()

        def walk(node_id, parent):
            # 整個場景共用已訪節點，拒絕循環、重複 root 及跨父節點的共享掛載。
            # 必須先驗證型別與範圍，避免 Python 將 bool 或負索引當成合法節點。
            if (type(node_id) is not int or node_id < 0
                    or node_id >= len(document['nodes']) or node_id in visited):
                raise ValueError('glTF 場景節點索引或拓樸無效')
            visited.add(node_id)
            node = document['nodes'][node_id]
            matrix = multiply(parent, local_matrix(node))
            if 'mesh' in node:
                mesh_id = node['mesh']
                if (type(mesh_id) is not int or mesh_id < 0
                        or mesh_id >= len(document['meshes'])):
                    raise ValueError('glTF 網格索引無效')
                for prim in document['meshes'][mesh_id]['primitives']:
                    name = document['materials'][prim['material']]['name']
                    colour = ldraw_colour_code_from_material_name(name)
                    if colour not in rendered or prim.get('mode', 4) != 4:
                        # 只將 TRIANGLES 網格納入印刷形狀與位置投影，不將 strip/fan 當三角列表。
                        continue
                    points = [world_point(matrix, p) for p in read_accessor(prim['attributes']['POSITION'])]
                    inds = [v[0] for v in read_accessor(prim['indices'])] if 'indices' in prim else list(range(len(points)))
                    for i in range(0, len(inds), 3):
                        rendered[colour].append(tuple(points[inds[j]] for j in range(i, i + 3)))
            for child in node.get('children', []):
                walk(child, matrix)

        for node_id in document['scenes'][document.get('scene', 0)]['nodes']:
            walk(node_id, identity)
    except (KeyError, IndexError, ValueError, TypeError, struct.error, RecursionError, CatalogError) as error:
        raise CatalogError('印刷幾何 GLB 三角資料無法核對。') from error

    def inside(px, py, triangle):
        (ax, ay, _), (bx, by, _), (cx, cy, _) = triangle
        d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by)
        d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy)
        d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay)
        return not (min(d1, d2, d3) < -1e-12 and max(d1, d2, d3) > 1e-12)

    metrics = {}
    for colour, source in sorted(sources.items()):
        depth = next(iter(source['depths']))
        expected = source['triangles']
        candidate = [t for t in rendered[colour]
                     if all(abs(v[2] - depth) <= .0004 for v in t)]
        if not candidate:
            raise CatalogError('印刷幾何找不到對應正面深度的三角面：' + colour)

        # 用固定網格計算「來源印刷區域」對「實際 GLB 材質區域」的覆蓋與 IoU；
        # 比顏色存在更能拒絕印刷缺角、縮放或整體錯位，容許少量倒角/浮點差。
        coords = [v for group in (expected, candidate) for tri in group for v in tri]
        xlo = min(v[0] for v in coords) - .0002
        xhi = max(v[0] for v in coords) + .0002
        ylo = min(v[1] for v in coords) - .0002
        yhi = max(v[1] for v in coords) + .0002
        if xhi - xlo > .06 or yhi - ylo > .06:
            raise CatalogError('印刷幾何比較範圍過大。')
        expected_cells = rendered_cells = intersection = 0
        grid = 96
        for row in range(grid):
            py = ylo + (row + .5) * (yhi - ylo) / grid
            for col in range(grid):
                px = xlo + (col + .5) * (xhi - xlo) / grid
                in_source = any(inside(px, py, t) for t in expected)
                in_export = any(inside(px, py, t) for t in candidate)
                expected_cells += in_source
                rendered_cells += in_export
                intersection += in_source and in_export
        union = expected_cells + rendered_cells - intersection
        if expected_cells < 12 or union == 0:
            raise CatalogError('印刷幾何來源面積不足，無法核對形狀。')
        coverage = intersection / expected_cells
        iou = intersection / union
        if coverage < .82 or iou < .80:
            raise CatalogError(
                f'印刷幾何形狀或位置與來源不符：colour={colour} coverage={coverage:.3f} IoU={iou:.3f}')
        metrics[colour] = {'sourceCoverage': round(coverage, 4),
                           'intersectionOverUnion': round(iou, 4),
                           'sampleGrid': grid}
    return {'profile': profile, 'colourMetrics': metrics}


def ldraw_colour_code_from_material_name(material_name):
    """剝除 ImportLDraw 的已知材質用途尾碼，保留實際數字色碼。"""
    match = re.fullmatch(r'Material_([0-9]+)(?:_(?:c|s))*', material_name or '')
    if match is None:
        raise CatalogError('ImportLDraw 材質名稱不含可核對的 LDraw 數字色碼。')
    return match.group(1)


def describe_ldraw_material(colour_code, source):
    """保留支援的 LDraw 顏色／透明度，拒絕未建模的材質特性。"""
    if not isinstance(source, dict):
        raise CatalogError('LDraw 顏色來源格式無效。')
    if source.get('material') not in ('BASIC', 'RUBBER'):
        raise CatalogError('此 LDraw 材質尚未支援標準 PBR 對照。')
    if any(source.get(key) is not None for key in
           ('fraction', 'vfraction', 'size', 'minsize', 'maxsize', 'secondary_colour')):
        raise CatalogError('此 LDraw 材質含尚未支援的特殊材質參數。')

    luminance = source.get('luminance', 0)
    if (not isinstance(luminance, (int, float)) or isinstance(luminance, bool)
            or not math.isfinite(luminance) or luminance != 0):
        raise CatalogError('發光材質尚未支援標準 PBR 對照。')

    rgb = source.get('colour')
    alpha = source.get('alpha')
    if (not isinstance(rgb, (list, tuple)) or len(rgb) != 3
            or any(not isinstance(channel, (int, float)) or isinstance(channel, bool)
                   or not math.isfinite(channel) or not 0 <= channel <= 1 for channel in rgb)):
        raise CatalogError('LDraw 顏色必須是三個有限且介於零與一之間的線性 RGB 值。')
    if (not isinstance(alpha, (int, float)) or isinstance(alpha, bool)
            or not math.isfinite(alpha) or not 0 <= alpha <= 1):
        raise CatalogError('LDraw alpha 必須是介於零與一之間的有限值。')

    alpha_mode = 'BLEND' if alpha < 1 else 'OPAQUE'
    rgba = list(rgb) + [alpha]
    return {
        'ldrawColour': str(colour_code),
        'source': {
            'name': source.get('name'),
            'colour': list(rgb),
            'alpha': alpha,
            'luminance': luminance,
            'material': source['material'],
        },
        'target': {
            'baseColorLinear': rgba,
            'metallic': 0,
            'roughness': 0.68 if source['material'] == 'RUBBER' else 0.28,
            'alphaMode': alpha_mode,
        },
        'appearanceApproved': False,
    }
