"""以固定設定從封存GLB輸出六視圖；渲染本身不代表外觀核准。"""

import argparse
import hashlib
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tools.catalog.content import ContentPathPolicy
from tools.catalog.glb import inspect_glb
from tools.catalog.policies import CatalogError


def render(model, output):
    import bpy
    from mathutils import Vector

    if not bpy.app.background or bpy.data.filepath:
        raise CatalogError('六視圖只允許獨立背景程序。')
    model, output = Path(model).absolute(), Path(output).absolute()
    model_bytes = ContentPathPolicy.read_bytes(model.parent, model.name)
    geometry = inspect_glb(model_bytes)
    ContentPathPolicy.resolve(output, 'six-views.json')
    if output.exists():
        raise CatalogError('六視圖目錄已存在，不可覆寫證據。')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(model))
    if model.read_bytes() != model_bytes:
        raise CatalogError('渲染匯入時模型已改變。')
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    points = [obj.matrix_world @ Vector(point) for obj in meshes for point in obj.bound_box]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    centre, size = (low + high) / 2, max(high - low)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 16
    scene.cycles.seed = 0
    scene.cycles.use_denoising = True
    scene.render.resolution_x = scene.render.resolution_y = 384
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get('Background')
    background.inputs['Color'].default_value = (.8, .8, .8, 1)
    background.inputs['Strength'].default_value = .65
    camera_data = bpy.data.cameras.new('CatalogSixViews')
    camera = bpy.data.objects.new('CatalogSixViews', camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera_data.type = 'ORTHO'
    camera_data.ortho_scale = size * 1.3
    camera_data.clip_start = size * .001
    camera_data.clip_end = size * 100
    light_data = bpy.data.lights.new('CatalogKey', 'AREA')
    light = bpy.data.objects.new('CatalogKey', light_data)
    scene.collection.objects.link(light)
    light_data.energy = 200 * size * size
    light_data.shape = 'DISK'
    light_data.size = size * 3
    # canonical Y-up 到 Blender Z-up：(x,y,z) -> (x,-z,y)。
    directions = {'front': (0, 0, 1), 'back': (0, 0, -1), 'left': (-1, 0, 0),
                  'right': (1, 0, 0), 'top': (0, 1, 0), 'bottom': (0, -1, 0)}
    profile = {'id': 'catalog-six-views-v1', 'coordinateProfile': 'canonical-rh-metres-v1',
               'engine': 'CYCLES', 'device': 'CPU', 'samples': 16, 'seed': 0, 'denoising': True,
               'resolution': [384, 384], 'viewTransform': 'Standard', 'worldStrength': .65,
               'orthoScaleMeters': camera_data.ortho_scale,
               'lightEnergy': light_data.energy, 'lightSizeMeters': light_data.size,
               'blenderVersion': bpy.app.version_string,
               'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    report = {'schemaVersion': 1, 'modelSha256': geometry['sha256'], 'visualApproved': False,
              'profile': profile, 'views': {}}
    output.mkdir(parents=True)
    for name, direction in dict(directions, preview=(1, .8, 1)).items():
        x, y, z = direction
        offset = Vector((x, -z, y)).normalized()
        camera.location = centre + offset * size * 4
        camera.rotation_euler = (-offset).to_track_quat('-Z', 'Y').to_euler()
        bpy.context.view_layer.update()
        light.location = camera.location + camera.matrix_world.to_quaternion() @ Vector((-size, size, 0))
        light.rotation_euler = (centre - light.location).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = str(output / (name + '.png'))
        bpy.ops.render.render(write_still=True)
        image = (output / (name + '.png')).read_bytes()
        record = {'file': name + '.png', 'sha256': hashlib.sha256(image).hexdigest(),
                  'byteLength': len(image), 'canonicalDirection': list(direction),
                  'cameraMatrixBlender': [list(row) for row in camera.matrix_world],
                  'lightPositionBlender': list(light.location)}
        if name == 'preview':
            report['preview'] = record
        else:
            report['views'][name] = record
    (output / 'six-views.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='從canonical GLB產生可追溯六視圖。')
    parser.add_argument('--model', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    render(args.model, args.output)
