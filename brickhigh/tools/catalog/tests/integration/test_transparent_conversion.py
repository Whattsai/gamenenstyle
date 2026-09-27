"""真實 LDraw 透明來源經 Blender 匯出至 GLB alpha BLEND。"""

import json
from pathlib import Path
import shutil
import struct
import subprocess

import pytest

from tools.catalog.glb import inspect_glb


def _glb_document(data):
    json_length, json_kind = struct.unpack_from('<II', data, 12)
    assert json_kind == 0x4E4F534A
    return json.loads(data[20:20 + json_length].decode('utf-8').rstrip(' \t\r\n\0'))


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
    assert provenance['productionStatus'] == 'Unknown'

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
    assert provenance['productionStatus'] == 'Unknown'
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
