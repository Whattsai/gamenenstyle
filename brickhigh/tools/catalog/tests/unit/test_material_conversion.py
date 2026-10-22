"""SC-006／SC-036：材質來源 alpha 與已支援 PBR 的映射。"""

import pytest

from tools.catalog.materials import (describe_ldraw_material, ldraw_colour_code_from_material_name,
                                     verify_exported_materials, verify_printed_source_surfaces,
                                     verify_printed_source_geometry)
from tools.catalog.policies import CatalogError



def _glb_material_payload(materials, *, meshes=None, triangle_count=3, nodes=None):
    """隔離驗證材質映射：最小 GLB JSON chunk，外層幾何另由 inspect_glb 檢查。"""
    import json
    import struct
    encoded = json.dumps({'materials': materials, 'meshes': meshes or [],
                          'nodes': nodes if nodes is not None else ([{'mesh': 0}] if meshes else []),
                          'scenes': [{'nodes': [0]}] if meshes else [],
                          'accessors': [{'count': triangle_count}, {'count': triangle_count}]}).encode('utf-8')
    encoded += b' ' * (-len(encoded) % 4)
    return (struct.pack('<III', 0x46546C67, 2, 20 + len(encoded))
            + struct.pack('<II', len(encoded), 0x4E4F534A) + encoded)


def _printed_triangle_glb(mode=4, *, node=None, nodes=None, roots=None):
    """建立帶實際 BIN 頂點的最小印刷 GLB，專用於 primitive 拓樸故障注入。"""
    import json
    import struct
    vertices = struct.pack('<9f', 0, 0, .004, .004, 0, .004, 0, -.004, .004)
    indices = struct.pack('<3H', 0, 1, 2) + b'\0\0'
    binary = vertices + indices
    doc = {'materials': [{'name': 'Material_1'}],
           'meshes': [{'primitives': [{'material': 0, 'mode': mode,
                                     'attributes': {'POSITION': 0}, 'indices': 1}]}],
           'nodes': nodes if nodes is not None else [node if node is not None else {'mesh': 0}],
           'scenes': [{'nodes': roots if roots is not None else [0]}],
           'bufferViews': [{'buffer': 0, 'byteOffset': 0, 'byteLength': len(vertices)},
                           {'buffer': 0, 'byteOffset': len(vertices), 'byteLength': 6}],
           'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': 3, 'type': 'VEC3'},
                         {'bufferView': 1, 'componentType': 5123, 'count': 3, 'type': 'SCALAR'}],
           'buffers': [{'byteLength': len(binary)}]}
    encoded = json.dumps(doc).encode('utf-8')
    encoded += b' ' * (-len(encoded) % 4)
    return (struct.pack('<III', 0x46546C67, 2, 28 + len(encoded) + len(binary))
            + struct.pack('<II', len(encoded), 0x4E4F534A) + encoded
            + struct.pack('<II', len(binary), 0x004E4942) + binary)


def _reference_material(*, alpha=1.0, roughness=0.28):
    return {'material': 'Material_4', 'target': {
        'baseColorLinear': [0.25, 0.5, 0.75, alpha],
        'metallic': 0, 'roughness': roughness,
        'alphaMode': 'BLEND' if alpha < 1 else 'OPAQUE',
    }}


def test_material_export_matches_source_rgba_and_pbr():
    expected = [_reference_material()]
    data = _glb_material_payload([{'name': 'Material_4',
        'pbrMetallicRoughness': {
            'baseColorFactor': [0.25, 0.5, 0.75, 1],
            'metallicFactor': 0, 'roughnessFactor': 0.28,
        }}])
    verify_exported_materials(data, expected)


@pytest.mark.parametrize('mutation', [
    lambda m: m['pbrMetallicRoughness'].update({'baseColorFactor': [0.3, 0.5, 0.75, 1]}),
    lambda m: m['pbrMetallicRoughness'].update({'metallicFactor': 0.5}),
    lambda m: m['pbrMetallicRoughness'].update({'roughnessFactor': 0.8}),
    lambda m: m.update({'alphaMode': 'BLEND'}),
    lambda m: m.update({'name': 'Material_missing'}),
    lambda m: m.update({'emissiveFactor': [1, 0, 0]}),
])
def test_material_export_rejects_colour_pbr_mode_or_identity_drift(mutation):
    material = {'name': 'Material_4', 'pbrMetallicRoughness': {
        'baseColorFactor': [0.25, 0.5, 0.75, 1],
        'metallicFactor': 0, 'roughnessFactor': 0.28}}
    mutation(material)
    with pytest.raises(CatalogError):
        verify_exported_materials(_glb_material_payload([material]), [_reference_material()])


def test_material_export_transparent_requires_correct_alpha():
    expected = [_reference_material(alpha=0.5)]
    good = {'name': 'Material_4', 'alphaMode': 'BLEND', 'pbrMetallicRoughness': {
        'baseColorFactor': [0.25, 0.5, 0.75, 0.5],
        'metallicFactor': 0, 'roughnessFactor': 0.28}}
    verify_exported_materials(_glb_material_payload([good]), expected)
    broken = dict(good, alphaMode='OPAQUE')
    with pytest.raises(CatalogError):
        verify_exported_materials(_glb_material_payload([broken]), expected)


def test_material_export_rejects_omitted_or_extra_material():
    expected = [_reference_material()]
    with pytest.raises(CatalogError):
        verify_exported_materials(_glb_material_payload([]), expected)
    duplicated = {'name': 'Material_4', 'pbrMetallicRoughness': {
        'baseColorFactor': [0.25, 0.5, 0.75, 1], 'metallicFactor': 0,
        'roughnessFactor': 0.28}}
    with pytest.raises(CatalogError):
        verify_exported_materials(_glb_material_payload([duplicated, duplicated]), expected)



def test_printed_ldraw_requires_visible_exported_colour_faces():
    # 973p06 正面領帶/背心圖案使用明確色碼 1，素面 973 不包含這組分色面。
    printed = b'0 Minifig Torso with Blue V-Neck Pattern\n4 1 0 0 -10 10 0 -10 10 10 -10 0 10 -10\n'
    plain = b'0 Minifig Torso\n4 16 0 0 -10 10 0 -10 10 10 -10 0 10 -10\n'
    mats = [{'name': 'Material_16'}, {'name': 'Material_1'}]
    used = _glb_material_payload(mats, meshes=[
        {'primitives': [{'material': 0, 'attributes': {'POSITION': 0}, 'indices': 1},
                        {'material': 1, 'attributes': {'POSITION': 0}, 'indices': 1}]},
    ])
    verify_printed_source_surfaces(used, printed)
    verify_printed_source_surfaces(used, plain)
    # 即使藍色 Material 存在，若 GLB 沒有實際繪製對應網格就必須失敗。
    unused = _glb_material_payload(mats, meshes=[{'primitives': [
        {'material': 0, 'attributes': {'POSITION': 0}, 'indices': 1}]}])
    with pytest.raises(CatalogError, match='來源分色'):
        verify_printed_source_surfaces(unused, printed)
    verify_printed_source_surfaces(unused, plain)


def test_printed_ldraw_rejects_material_with_no_triangles_or_wrong_colour():
    printed = b'0 torso\n3 1 0 0 -10 5 0 -10 0 5 -10\n'
    wrong = _glb_material_payload([{'name': 'Material_4'}], meshes=[
        {'primitives': [{'material': 0, 'attributes': {'POSITION': 0}, 'indices': 1}]},
    ])
    with pytest.raises(CatalogError, match='來源分色'):
        verify_printed_source_surfaces(wrong, printed)
    empty = _glb_material_payload([{'name': 'Material_1'}], meshes=[
        {'primitives': [{'material': 0, 'attributes': {'POSITION': 0}, 'indices': 1}]},
    ], triangle_count=0)
    with pytest.raises(CatalogError, match='來源分色'):
        verify_printed_source_surfaces(empty, printed)

@pytest.mark.parametrize('mode', [0, 1, 2, 3, 5, 6])
def test_printed_ldraw_rejects_non_triangle_primitive_modes(mode):
    """glTF 線段、點與 strip/fan 不能冒充三角形印刷面。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    glb = _glb_material_payload([{'name': 'Material_1'}], meshes=[
        {'primitives': [{'material': 0, 'mode': mode,
                         'attributes': {'POSITION': 0}, 'indices': 1}]},
    ])
    with pytest.raises(CatalogError, match='來源分色'):
        verify_printed_source_surfaces(glb, printed)


@pytest.mark.parametrize('nodes', [
    [{'mesh': 0, 'children': [0]}],
    [{'mesh': 0, 'children': [1]}, {'children': [0]}],
    [{'mesh': 0, 'children': [1, 1]}, {'children': []}],
    [{'mesh': 0, 'children': [-1]}, {'children': []}],
])
def test_printed_ldraw_rejects_invalid_scene_graph(nodes):
    """即使印刷材質可達，循環、重複掛載與負索引不得冒充有效 glTF 場景。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    glb = _glb_material_payload([{'name': 'Material_1'}], meshes=[
        {'primitives': [{'material': 0, 'attributes': {'POSITION': 0}, 'indices': 1}]},
    ], nodes=nodes)
    with pytest.raises(CatalogError, match='來源分色'):
        verify_printed_source_surfaces(glb, printed)


@pytest.mark.parametrize('mode', [0, 1, 2, 3, 5, 6])
def test_print_geometry_rejects_non_triangle_primitive_modes(mode):
    """來源形狀重合仍不能讓非 TRIANGLES primitive 假冒印刷面。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    assert verify_printed_source_geometry(_printed_triangle_glb(), printed)['colourMetrics']['1']
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(_printed_triangle_glb(mode), printed)


@pytest.mark.parametrize('node', [
    # glTF 同一節點不可同時宣告 matrix 與任一 TRS；不得忽略第二組座標宣告。
    {'mesh': 0, 'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
     'translation': [0, 0, 0]},
    # glTF 變換須為仿射矩陣，最後一列必須為 (0, 0, 0, 1)。
    {'mesh': 0, 'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2]},
])
def test_print_geometry_rejects_invalid_scene_node_transform(node):
    """印刷位置不能因兩套相互矛盾的節點座標或非仿射 matrix 而被誤判合格。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    assert verify_printed_source_geometry(_printed_triangle_glb(), printed)['colourMetrics']['1']
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(_printed_triangle_glb(node=node), printed)


@pytest.mark.parametrize('nodes, roots', [
    ([{'mesh': 0, 'children': [1, 1]}, {'children': []}], [0]),
    ([{'mesh': 0, 'children': [-1]}, {'children': []}], [0]),
    ([{'mesh': 0}, {'children': []}], [0, 0]),
    ([{'mesh': 0, 'children': [2]}, {'children': [2]}, {'children': []}], [0, 1]),
    ([{'mesh': 0, 'children': [True]}, {'children': []}], [0]),
])
def test_print_geometry_rejects_invalid_scene_graph(nodes, roots):
    """印刷幾何不能因共享節點、重複掛載或非法索引而通過場景拓樸驗證。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    assert verify_printed_source_geometry(_printed_triangle_glb(), printed)['colourMetrics']['1']
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(_printed_triangle_glb(nodes=nodes, roots=roots), printed)


def test_print_geometry_accepts_valid_nested_scene_tree():
    """合法父子節點只計算一次真實三角面，不得被錯誤的去重策略拒絕。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    glb = _printed_triangle_glb(nodes=[{'children': [1]}, {'mesh': 0}])
    assert verify_printed_source_geometry(glb, printed)['colourMetrics']['1']


@pytest.mark.parametrize('mesh_id', [-1, False])
@pytest.mark.parametrize('validator', [verify_printed_source_surfaces, verify_printed_source_geometry])
def test_printed_scene_rejects_noncanonical_mesh_index(mesh_id, validator):
    """GLB 網格引用不得藉由 Python 負索引或 bool 別名假冒有效印刷來源。"""
    printed = b'0 printed torso\n3 1 0 0 -10 10 0 -10 0 10 -10\n'
    glb = _printed_triangle_glb(node={'mesh': mesh_id})
    with pytest.raises(CatalogError):
        validator(glb, printed)


def test_print_geometry_without_explicit_source_print_returns_no_unearned_approval():
    source = b'0 plain torso\n4 16 0 0 -10 10 0 -10 10 10 -10 0 10 -10\n'
    # 素面可正常進行後續覆核；空印刷證據不可以當作外觀已核准。
    assert verify_printed_source_geometry(b'', source) == {
        'profile': 'printed-xy-grid-v1', 'colourMetrics': {}}


def test_print_geometry_rejects_unsupported_non_planar_source_without_claiming_shape_success():
    source = b'0 unknown printed surface\n3 1 0 0 -10 10 0 -10 0 10 -9\n'
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(b'', source)


def test_describe_ldraw_transparent_material_preserves_alpha_and_source_colour():
    source = {
        'name': 'Trans_Clear',
        'colour': [0.973, 0.973, 0.973],
        'alpha': 0.5,
        'luminance': 0.0,
        'material': 'BASIC',
    }

    result = describe_ldraw_material('47', source)

    assert result['ldrawColour'] == '47'
    assert result['source'] == source
    assert result['target'] == {
        'baseColorLinear': [0.973, 0.973, 0.973, 0.5],
        'metallic': 0,
        'roughness': 0.28,
        'alphaMode': 'BLEND',
    }
    assert result['appearanceApproved'] is False


def test_describe_ldraw_opaque_rubber_material_keeps_opaque_mode():
    result = describe_ldraw_material('256', {
        'name': 'Rubber_Black', 'colour': [0.01, 0.01, 0.01], 'alpha': 1.0,
        'luminance': 0.0, 'material': 'RUBBER',
    })

    assert result['target']['baseColorLinear'][3] == 1.0
    assert result['target']['roughness'] == 0.68
    assert result['target']['alphaMode'] == 'OPAQUE'


@pytest.mark.parametrize('name', [
    'Material_4',
    'Material_4_s',
    'Material_4_c',
    'Material_4_c_s',
])
def test_parse_importldraw_technical_material_suffix_keeps_source_colour_code(name):
    assert ldraw_colour_code_from_material_name(name) == '4'


@pytest.mark.parametrize('name', ['Material_default', 'Material_4_unknown', 'Mesh_4_s'])
def test_parse_importldraw_material_name_rejects_unknown_name_without_fallback(name):
    with pytest.raises(CatalogError):
        ldraw_colour_code_from_material_name(name)


@pytest.mark.parametrize('source', [
    {'name': 'Glow', 'colour': [1, 1, 1], 'alpha': 1.0, 'luminance': 1, 'material': 'BASIC'},
    {'name': 'Metal', 'colour': [1, 1, 1], 'alpha': 1.0, 'luminance': 0, 'material': 'METAL'},
    {'name': 'Bad alpha', 'colour': [1, 1, 1], 'alpha': 1.1, 'luminance': 0, 'material': 'BASIC'},
    {'name': 'Bad color', 'colour': [1, float('nan'), 1], 'alpha': 1.0, 'luminance': 0, 'material': 'BASIC'},
])
def test_describe_ldraw_rejects_unsupported_or_invalid_materials(source):
    with pytest.raises(CatalogError):
        describe_ldraw_material('999', source)
