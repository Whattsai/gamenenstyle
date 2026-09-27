"""從實際已轉換GLB渲染六視圖，核對像素及輸入身分。"""

import hashlib
import json
from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageStat


def test_actual_glb_six_views_bind_input_and_contain_visible_model():
    from uuid import uuid4
    workspace = Path(__file__).resolve().parents[4]
    model = workspace / 'artifacts/models/3001-red-exploratory-v1/model.glb'
    output = workspace / ('artifacts/acceptance/six-views-' + uuid4().hex)
    result = subprocess.run([shutil.which('blender'), '--background', '--factory-startup',
        '--disable-autoexec', '--python-exit-code', '4', '--python',
        str(workspace / 'tools/catalog/render_views.py'), '--', '--model', str(model),
        '--output', str(output)], capture_output=True, timeout=240)
    assert result.returncode == 0, result.stdout.decode('utf-8', errors='replace')[-3000:]
    report = json.loads((output / 'six-views.json').read_text(encoding='utf-8'))
    assert report['modelSha256'] == hashlib.sha256(model.read_bytes()).hexdigest()
    assert report['visualApproved'] is False
    assert report['profile']['coordinateProfile'] == 'canonical-rh-metres-v1'
    assert set(report['views']) == {'front', 'back', 'left', 'right', 'top', 'bottom'}
    for name, item in report['views'].items():
        path = output / item['file']
        assert item['sha256'] == hashlib.sha256(path.read_bytes()).hexdigest()
        with Image.open(path) as picture:
            assert picture.size == (384, 384)
            alpha = picture.getchannel('A')
            assert 5000 < sum(alpha.histogram()[1:]) < 384 * 384 * .9
            assert max(ImageStat.Stat(picture.convert('RGB'), mask=alpha).stddev) > 5
    assert (output / 'preview.png').is_file()
