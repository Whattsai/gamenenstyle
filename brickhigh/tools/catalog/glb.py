"""GLB 製作端結構檢查；不取代 Khronos Validator 與 Unity 畫面驗證。"""

import hashlib
import json
import math
import struct

from .policies import CatalogError


def inspect_glb(data):
    """只接受自含、靜態、已烘焙單位變換的三角網格。"""
    try:
        return _inspect(data)
    except (KeyError, IndexError, TypeError, ValueError, struct.error, OverflowError) as error:
        raise CatalogError("GLB 結構或幾何資料無效。") from error


def _inspect(data):
    if len(data) < 20 or struct.unpack_from('<III', data) != (0x46546C67, 2, len(data)):
        raise CatalogError("GLB 檔頭或完整長度不符。")
    chunks = []
    offset = 12
    while offset < len(data):
        length, kind = struct.unpack_from('<II', data, offset)
        if length % 4 or offset + 8 + length > len(data):
            raise CatalogError("GLB 區塊長度不符。")
        chunks.append((kind, data[offset + 8:offset + 8 + length]))
        offset += 8 + length
    if [kind for kind, _ in chunks] != [0x4E4F534A, 0x004E4942]:
        raise CatalogError("GLB 必須包含 JSON 與單一內嵌 buffer。")
    doc = json.loads(chunks[0][1])
    binary = chunks[1][1]
    if doc['asset']['version'] != '2.0' or len(doc['buffers']) != 1:
        raise CatalogError("GLB 格式版本不符。")
    if not 0 <= len(binary) - doc['buffers'][0]['byteLength'] <= 3:
        raise CatalogError("GLB buffer 大小不符。")
    if doc.get('extensionsUsed') or doc.get('extensionsRequired'):
        raise CatalogError("GLB 擴充必須先經預覽工具核准，不能默認忽略。")
    if doc.get('skins') or doc.get('animations'):
        raise CatalogError("目錄模型必須先烘焙靜態姿態。")

    def check_uri(value):
        if isinstance(value, dict):
            if 'uri' in value:
                raise CatalogError("GLB 不得依賴外部 URI。")
            for child in value.values():
                check_uri(child)
        elif isinstance(value, list):
            for child in value:
                check_uri(child)

    check_uri(doc)

    def index(items, number):
        if not isinstance(number, int) or isinstance(number, bool) or number < 0:
            raise CatalogError("GLB 索引無效。")
        return items[number]

    def accessor(number, components, accepted):
        entry = index(doc['accessors'], number)
        if entry.get('sparse') or entry.get('normalized') or entry['type'] != components:
            raise CatalogError("GLB accessor 必須為已展開的直接資料。")
        formats = {5121: ('B', 1), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
        if entry['componentType'] not in accepted:
            raise CatalogError("GLB accessor 型別不符。")
        code, size = formats[entry['componentType']]
        count = {'SCALAR': 1, 'VEC3': 3}[components]
        view = index(doc['bufferViews'], entry['bufferView'])
        if view['buffer'] != 0 or entry['count'] < 1:
            raise CatalogError("GLB accessor 沒有資料。")
        start = view.get('byteOffset', 0)
        local = entry.get('byteOffset', 0)
        stride = view.get('byteStride', count * size)
        end = local + (entry['count'] - 1) * stride + count * size
        if min(start, local) < 0 or stride < count * size or end > view['byteLength'] or start + end > len(binary):
            raise CatalogError("GLB accessor 越界。")
        return [struct.unpack_from('<' + code * count, binary, start + local + i * stride)
                for i in range(entry['count'])]

    points = []
    triangles = 0
    used_meshes = set()
    visited = set()

    def node(number):
        nonlocal triangles
        if number in visited:
            raise CatalogError("GLB 場景節點重複或循環。")
        visited.add(number)
        entry = index(doc['nodes'], number)
        identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        if (entry.get('scale', [1, 1, 1]) != [1, 1, 1]
                or entry.get('translation', [0, 0, 0]) != [0, 0, 0]
                or entry.get('rotation', [0, 0, 0, 1]) != [0, 0, 0, 1]
                or entry.get('matrix', identity) != identity):
            raise CatalogError("GLB 座標及 root scale 必須先烘焙為公尺。")
        if 'mesh' in entry:
            mesh = index(doc['meshes'], entry['mesh'])
            used_meshes.add(entry['mesh'])
            for primitive in mesh['primitives']:
                if primitive.get('mode', 4) != 4 or primitive.get('targets'):
                    raise CatalogError("GLB 必須是靜態三角網格。")
                positions = accessor(primitive['attributes']['POSITION'], 'VEC3', {5126})
                if any(not math.isfinite(v) for point in positions for v in point):
                    raise CatalogError("GLB 頂點包含非有限值。")
                indices = ([value[0] for value in accessor(primitive['indices'], 'SCALAR', {5121, 5123, 5125})]
                           if 'indices' in primitive else list(range(len(positions))))
                if len(indices) % 3 or max(indices) >= len(positions):
                    raise CatalogError("GLB 三角形索引無效。")
                index(doc['materials'], primitive['material'])
                triangles += len(indices) // 3
                points.extend(positions)
        for child in entry.get('children', []):
            node(child)

    for root in index(doc['scenes'], doc.get('scene', 0))['nodes']:
        node(root)
    if not points or triangles == 0:
        raise CatalogError("GLB 沒有可渲染網格。")
    return {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data),
            'meshCount': len(used_meshes), 'triangles': triangles, 'materialCount': len(doc['materials']),
            'boundsMeters': {'min': [min(p[i] for p in points) for i in range(3)],
                             'max': [max(p[i] for p in points) for i in range(3)]},
            'qualityPassed': False,
            'remainingChecks': ['KhronosValidator', 'DimensionsAndConnectors', 'SixViews', 'SourceAppearance', 'UnityRuntime']}
