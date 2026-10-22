"""GLB 製作端結構檢查；不取代 Khronos Validator 與 Unity 畫面驗證。"""

import hashlib
import json
import math
import struct

from .policies import CatalogError


def verify_validator_report(report, geometry):
    """核對固定版本Khronos報告及實際GLB身分；未處理警告不得放行。"""
    if (not isinstance(report, dict) or report.get('modelSha256') != geometry['sha256']
            or type(report.get('modelByteLength')) is not int or report['modelByteLength'] != geometry['bytes']
            or report.get('validatorVersion') != '2.0.0-dev.3.10'
            or report.get('mimeType') != 'model/gltf-binary'):
        raise CatalogError('Khronos報告與模型或驗證器版本不符。')
    issues = report.get('issues')
    if (not isinstance(issues, dict) or issues.get('truncated') is not False
            or any(type(issues.get(key)) is not int or issues[key] != 0 for key in ('numErrors', 'numWarnings'))
            or not isinstance(issues.get('messages'), list)):
        raise CatalogError('Khronos報告含錯誤、未處理警告或不完整結果。')
    if any(not isinstance(message, dict) or type(message.get('severity')) is not int
           or message['severity'] not in (2, 3) for message in issues['messages']):
        raise CatalogError('Khronos問題清單與成功計數不符。')


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

    # 不以 GLB 自含 buffer 推定紋理可用；逐張核對內嵌影像及材質引用。
    images = doc.get('images', [])
    textures = doc.get('textures', [])
    for image in images:
        view = index(doc['bufferViews'], image['bufferView'])
        start = view.get('byteOffset', 0)
        length = view['byteLength']
        if (view['buffer'] != 0 or type(start) is not int or type(length) is not int
                or start < 0 or length <= 0 or start + length > doc['buffers'][0]['byteLength']
                or start + length > len(binary)):
            raise CatalogError("GLB 內嵌紋理超出 buffer 範圍。")
        content = binary[start:start + length]
        mime = image.get('mimeType')
        if mime == 'image/png':
            if len(content) < 24 or not content.startswith(bytes.fromhex('89504e470d0a1a0a')) or content[12:16] != b'IHDR':
                raise CatalogError("GLB 內嵌 PNG 資料無效。")
        elif mime == 'image/jpeg':
            if not content.startswith(bytes.fromhex('ffd8')) or not content.endswith(bytes.fromhex('ffd9')):
                raise CatalogError("GLB 內嵌 JPEG 資料無效。")
        else:
            raise CatalogError("GLB 內嵌紋理格式無法確認。")
    for texture in textures:
        index(images, texture['source'])
        if 'sampler' in texture:
            index(doc.get('samplers', []), texture['sampler'])

    def material_uv_requirements(material):
        requirements = []
        pbr = material.get('pbrMetallicRoughness', {})
        for slot in (pbr.get('baseColorTexture'), pbr.get('metallicRoughnessTexture'),
                     material.get('normalTexture'), material.get('occlusionTexture'),
                     material.get('emissiveTexture')):
            if slot is None:
                continue
            index(textures, slot['index'])
            uv = slot.get('texCoord', 0)
            if type(uv) is not int or uv < 0:
                raise CatalogError("GLB 材質紋理座標索引無效。")
            requirements.append('TEXCOORD_' + str(uv))
        return requirements


    def validate_uv_accessor(number, vertex_count):
        uv = index(doc['accessors'], number)
        if (uv.get('type') != 'VEC2' or type(uv.get('count')) is not int
                or uv['count'] != vertex_count or uv.get('sparse')):
            raise CatalogError("GLB 紋理 UV accessor 型別或頂點數不符。")
        component = uv.get('componentType')
        normalized = uv.get('normalized', False)
        if component == 5126 and normalized is False:
            size = 4
        elif component in (5121, 5123) and normalized is True:
            size = 1 if component == 5121 else 2
        else:
            raise CatalogError("GLB 紋理 UV componentType 或 normalized 不符。")
        view = index(doc['bufferViews'], uv['bufferView'])
        start = view.get('byteOffset', 0)
        local = uv.get('byteOffset', 0)
        stride = view.get('byteStride', 2 * size)
        length = view.get('byteLength')
        if (view.get('buffer') != 0 or any(type(n) is not int for n in (start, local, stride, length))
                or start < 0 or local < 0 or stride < 2 * size
                or local + (vertex_count - 1) * stride + 2 * size > length
                or start + local + (vertex_count - 1) * stride + 2 * size > len(binary)):
            raise CatalogError("GLB 紋理 UV accessor 超出 buffer 範圍。")
        if component == 5126:
            for i in range(vertex_count):
                coords = struct.unpack_from('<ff', binary, start + local + i * stride)
                if any(not math.isfinite(value) for value in coords):
                    raise CatalogError("GLB 紋理 UV 座標包含非有限值。")

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
                material = index(doc['materials'], primitive['material'])
                for uv_key in material_uv_requirements(material):
                    if uv_key not in primitive['attributes']:
                        raise CatalogError("GLB 紋理缺少對應 UV 座標。")
                    validate_uv_accessor(primitive['attributes'][uv_key], len(positions))
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
