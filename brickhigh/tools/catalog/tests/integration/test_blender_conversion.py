"""真實 Blender／官方 LDraw 來源探針；不視為 Unity 或全量品質驗收。"""

import json
from pathlib import Path
import shutil
import subprocess
import pytest

from tools.catalog.glb import inspect_glb


def test_real_ldraw_brick_exports_nonempty_self_contained_model(tmp_path):
    workspace = Path(__file__).resolve().parents[4]
    library = workspace / 'artifacts/sources/ldraw-release/ldraw'
    importer = workspace / 'artifacts/toolchain/ImportLDraw'
    blender = shutil.which('blender')
    if not blender or not library.is_dir() or not importer.is_dir():
        pytest.skip('此整合探針需另外取得 Blender、固定 ImportLDraw 與官方來源。')
    result = subprocess.run([blender, '--background', '--factory-startup', '--python-exit-code', '4',
                             '--python', str(workspace / 'tools/catalog/blender_convert.py'), '--',
                             '--library', str(library), '--importer', str(importer), '--part', '3001.dat',
                             '--colour', '4', '--output', str(tmp_path / 'converted')],
                            capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert result.returncode == 0, result.stdout + result.stderr
    report = inspect_glb((tmp_path / 'converted/model.glb').read_bytes())
    assert report['triangles'] > 100
    assert report['boundsMeters']['max'][0] - report['boundsMeters']['min'][0] == pytest.approx(.032, abs=.0001)
    provenance = json.loads((tmp_path / 'converted/conversion.json').read_text(encoding='utf-8'))
    assert provenance['productionStatus'] == 'Unknown'
    assert provenance['qualityPassed'] is False
    assert provenance['source']['files']
    assert provenance['toolchain']['importerCommit'] == 'c306fb777a4e0da85492f09d65daf458767a0aa1'
