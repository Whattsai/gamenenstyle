"""真實 LDraw 透明來源經 Blender 匯出至 GLB alpha BLEND。"""

import json
from pathlib import Path
import shutil
import struct
import subprocess

import pytest

from tools.catalog.glb import inspect_glb
from tools.catalog.materials import verify_printed_source_surfaces, verify_printed_source_geometry
from tools.catalog.policies import CatalogError


def _glb_document(data):
    json_length, json_kind = struct.unpack_from('<II', data, 12)
    assert json_kind == 0x4E4F534A
    return json.loads(data[20:20 + json_length].decode('utf-8').rstrip(' \t\r\n\0'))



def test_real_printed_torso_preserves_ldraw_blue_pattern_in_rendered_glb(tmp_path):
    """真 973p06 的正面藍色印刷不是空材質；須被場景內可用的 primitive 引用。"""
    workspace = Path(__file__).resolve().parents[4]
    library = workspace / 'artifacts/sources/ldraw-release/ldraw'
    importer = workspace / 'artifacts/toolchain/ImportLDraw'
    blender = shutil.which('blender')
    if not blender or not library.is_dir() or not importer.is_dir():
        pytest.skip('真印刷測試需要 Blender、固定 ImportLDraw、LDraw 官方封存來源。')

    printed = (library / 'parts/973p06.dat').read_bytes()
    plain = (library / 'parts/973.dat').read_bytes()
    assert b'4 1 ' in printed or b'3 1 ' in printed
    assert b'4 1 ' not in plain and b'3 1 ' not in plain

    result = subprocess.run([
        blender, '--background', '--factory-startup', '--disable-autoexec',
        '--python-exit-code', '4', '--python', str(workspace / 'tools/catalog/blender_convert.py'), '--',
        '--library', str(library), '--importer', str(importer), '--part', '973p06.dat',
        '--colour', '15', '--output', str(tmp_path / 'printed-torso'),
    ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert result.returncode == 0, result.stdout + result.stderr
    data = (tmp_path / 'printed-torso/model.glb').read_bytes()
    assert inspect_glb(data)['triangles'] > 0
    evidence = verify_printed_source_surfaces(data, printed)
    shape_evidence = verify_printed_source_geometry(data, printed)
    assert shape_evidence['profile'] == 'printed-xy-grid-v1'
    assert shape_evidence['colourMetrics']['1']['intersectionOverUnion'] >= 0.80
    assert '1' in evidence['sourceExplicitFaceColours']
    assert '1' in evidence['usedExportedColours']
    report = json.loads((tmp_path / 'printed-torso/conversion.json').read_text(encoding='utf-8'))
    assert report['source']['filename'] == '973p06.dat'
    assert report['sourceGeometryEvidence'] == shape_evidence
    assert report['qualityPassed'] is False

    # 用實際 Blender 的 GLB 進行故障注入：只移動顏色1網格的 X 座標，材質仍正確。
    corrupted = bytearray(data)
    document = _glb_document(data)
    offset = 12 + 8 + ((struct.unpack_from('<I', data, 12)[0] + 3) // 4) * 4 + 8
    moved = 0
    for mesh in document['meshes']:
        for primitive in mesh['primitives']:
            name = document['materials'][primitive['material']]['name']
            if name.split('_')[1] != '1':
                continue
            accessor = document['accessors'][primitive['attributes']['POSITION']]
            view = document['bufferViews'][accessor['bufferView']]
            stride = view.get('byteStride', 12)
            start = offset + view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
            for index in range(accessor['count']):
                position = start + index * stride
                x = struct.unpack_from('<f', corrupted, position)[0]
                struct.pack_into('<f', corrupted, position, x + 0.004)
                moved += 1
    assert moved > 0
    # 色碼仍能匹配，但印刷圖案的位置已改變，必須拒絕。
    verify_printed_source_surfaces(bytes(corrupted), printed)
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(bytes(corrupted), printed)

    # 第二個故障注入：保持所有顏色與材質引用，只縮小印刷佔用面積，模擬缺失筆畫。
    shrunken = bytearray(data)
    for mesh in document['meshes']:
        for primitive in mesh['primitives']:
            name = document['materials'][primitive['material']]['name']
            if name.split('_')[1] != '1':
                continue
            accessor = document['accessors'][primitive['attributes']['POSITION']]
            view = document['bufferViews'][accessor['bufferView']]
            start = offset + view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
            stride = view.get('byteStride', 12)
            for index in range(accessor['count']):
                position = start + index * stride
                x, y = struct.unpack_from('<ff', shrunken, position)
                struct.pack_into('<ff', shrunken, position, x * .5, (y + .006) * .5 - .006)
    verify_printed_source_surfaces(bytes(shrunken), printed)
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(bytes(shrunken), printed)

    # 第三個故障注入：只修改 glTF 場景節點的世界位移，不更動網格頂點與材質。
    # 若只比較 POSITION accessor 的局部座標，會錯把已位移的印刷當成來源一致。
    moved_document = _glb_document(data)
    root = moved_document['nodes'][moved_document['scenes'][moved_document.get('scene', 0)]['nodes'][0]]
    if 'matrix' in root:
        root['matrix'][12] += .004
    else:
        translation = root.setdefault('translation', [0.0, 0.0, 0.0])
        translation[0] += .004
    encoded = json.dumps(moved_document, separators=(',', ':')).encode('utf-8')
    encoded += b' ' * (-len(encoded) % 4)
    old_json_length = struct.unpack_from('<I', data, 12)[0]
    old_tail = data[20 + old_json_length:]
    transformed = (struct.pack('<III', 0x46546C67, 2, 20 + len(encoded) + len(old_tail))
                   + struct.pack('<II', len(encoded), 0x4E4F534A) + encoded + old_tail)
    verify_printed_source_surfaces(transformed, printed)
    with pytest.raises(CatalogError, match='印刷幾何'):
        verify_printed_source_geometry(transformed, printed)

    assert all(row['appearanceApproved'] is False for row in report['materialComparisons'])


def test_real_ldraw_transparent_brick_exports_self_contained_blend_material(tmp_path):
    workspace = Path(__file__).resolve().parents[4]
    library = workspace / 'artifacts/sources/ldraw-release/ldraw'
    importer = workspace / 'artifacts/toolchain/ImportLDraw'
    blender = shutil.which('blender')
    if not blender or not library.is_dir() or not importer.is_dir():
        pytest.skip('此整合探針需另外取得 Blender、固定 ImportLDraw 與官方來源。')

    result = subprocess.run([
        blender, '--background', '--factory-startup', '--disable-autoexec',
        '--python-exit-code', '4', '--python', str(workspace / 'tools/catalog/blender_convert.py'), '--',
        '--library', str(library), '--importer', str(importer), '--part', '3001.dat',
        '--colour', '47', '--output', str(tmp_path / 'converted'),
    ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert result.returncode == 0, result.stdout + result.stderr

    glb_path = tmp_path / 'converted/model.glb'
    data = glb_path.read_bytes()
    geometry = inspect_glb(data)
    assert geometry['triangles'] > 100
    document = _glb_document(data)
    material = document['materials'][0]
    pbr = material['pbrMetallicRoughness']
    assert material['alphaMode'] == 'BLEND'
    assert pbr['baseColorFactor'][3] == pytest.approx(0.5, abs=1 / 256)

    provenance = json.loads((tmp_path / 'converted/conversion.json').read_text(encoding='utf-8'))
    comparison = provenance['materialComparisons'][0]
    assert comparison['material'] == 'Material_47'
    assert comparison['ldrawColour'] == '47'
    assert comparison['source']['alpha'] == pytest.approx(0.5)
    assert comparison['target']['baseColorLinear'][3] == pytest.approx(0.5)
    assert comparison['target']['alphaMode'] == 'BLEND'
    assert comparison['appearanceApproved'] is False
    assert provenance['qualityPassed'] is False
    assert 'productionStatus' not in provenance

    validator = shutil.which('node')
    if not validator:
        pytest.skip('GLB 已由 Blender 匯出；Khronos Validator 另需 Node.js。')
    validation = subprocess.run([
        validator, str(workspace / 'tools/catalog/validate_glb.cjs'), str(glb_path),
        str(tmp_path / 'converted/khronos-report.json'),
    ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert validation.returncode == 0, validation.stdout + validation.stderr
    report = json.loads((tmp_path / 'converted/khronos-report.json').read_text(encoding='utf-8'))
    assert report['issues']['numErrors'] == 0


def test_real_ldraw_asymmetric_slope_resolves_importer_suffix_from_source_colour(tmp_path):
    workspace = Path(__file__).resolve().parents[4]
    library = workspace / 'artifacts/sources/ldraw-release/ldraw'
    importer = workspace / 'artifacts/toolchain/ImportLDraw'
    blender = shutil.which('blender')
    if not blender or not library.is_dir() or not importer.is_dir():
        pytest.skip('此整合探針需另外取得 Blender、固定 ImportLDraw 與官方來源。')

    result = subprocess.run([
        blender, '--background', '--factory-startup', '--disable-autoexec',
        '--python-exit-code', '4', '--python', str(workspace / 'tools/catalog/blender_convert.py'), '--',
        '--library', str(library), '--importer', str(importer), '--part', '3298.dat',
        '--colour', '4', '--output', str(tmp_path / 'asymmetric-slope'),
    ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert result.returncode == 0, result.stdout + result.stderr

    glb_path = tmp_path / 'asymmetric-slope/model.glb'
    data = glb_path.read_bytes()
    geometry = inspect_glb(data)
    dimensions = [geometry['boundsMeters']['max'][i] - geometry['boundsMeters']['min'][i]
                  for i in range(3)]
    assert geometry['triangles'] > 100
    assert max(dimensions) - min(dimensions) > 0.001

    provenance = json.loads((tmp_path / 'asymmetric-slope/conversion.json').read_text(encoding='utf-8'))
    comparison_codes = {row['ldrawColour'] for row in provenance['materialComparisons']}
    source_material_names = {row['material'] for row in provenance['materialComparisons']}
    assert comparison_codes
    assert comparison_codes == {'4'}
    assert source_material_names == {'Material_4', 'Material_4_s'}
    assert all(row['appearanceApproved'] is False for row in provenance['materialComparisons'])
    assert provenance['source']['filename'] == '3298.dat'
    assert all(row['author'] and row['license'] and row['sha256'] for row in provenance['source']['files'])
    assert 'productionStatus' not in provenance
    assert provenance['qualityPassed'] is False

    validator = shutil.which('node')
    if not validator:
        pytest.skip('GLB 已由 Blender 匯出；Khronos Validator 另需 Node.js。')
    validation = subprocess.run([
        validator, str(workspace / 'tools/catalog/validate_glb.cjs'), str(glb_path),
        str(tmp_path / 'asymmetric-slope/khronos-report.json'),
    ], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert validation.returncode == 0, validation.stdout + validation.stderr
    report = json.loads((tmp_path / 'asymmetric-slope/khronos-report.json').read_text(encoding='utf-8'))
    assert report['issues']['numErrors'] == 0
