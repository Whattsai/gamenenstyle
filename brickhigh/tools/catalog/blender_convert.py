"""以獨立 Blender 背景程序轉換已核對來源；不讀寫使用者的 blend 或偏好設定。"""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

WORKSPACE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(WORKSPACE))

from tools.catalog.content import ContentPathPolicy
from tools.catalog.glb import inspect_glb
from tools.catalog.policies import CatalogError
from tools.catalog.sources import inspect_ldraw

IMPORTER_COMMIT = 'c306fb777a4e0da85492f09d65daf458767a0aa1'


def convert(args):
    """輸出探索模型與轉換對照；完整品質核准前永遠不標為 Ready。"""
    import bpy
    from mathutils import Matrix

    if not bpy.app.background or bpy.data.filepath:
        raise CatalogError('轉換只允許未開啟 blend 的獨立背景程序。')
    library = Path(args.library).resolve()
    importer = Path(args.importer).resolve()
    output = Path(args.output).absolute()
    ContentPathPolicy.resolve(output, 'model.glb')
    if output.exists():
        raise CatalogError('轉換目錄已存在；請使用新 revision 目錄，避免覆蓋證據。')
    commit = subprocess.check_output(['git', '-C', str(importer), 'rev-parse', 'HEAD'], text=True).strip()
    dirty = subprocess.check_output(['git', '-C', str(importer), 'status', '--porcelain', '--untracked-files=no'], text=True)
    if commit != IMPORTER_COMMIT or dirty:
        raise CatalogError('ImportLDraw 版本或內容不符，需重新核准工具輸入。')
    source = inspect_ldraw(library, args.part)
    config = ContentPathPolicy.read_bytes(library, 'LDConfig.ldr')
    source['colourConfig'] = {'path': 'LDConfig.ldr', 'sha256': hashlib.sha256(config).hexdigest(),
                              'source': 'https://library.ldraw.org/library/official/LDConfig.ldr'}
    sys.path.insert(0, str(importer.parent))
    from ImportLDraw.loadldraw import loadldraw

    # 這是 --factory-startup 的獨立程序，不操作既有使用者場景。
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    options = loadldraw.Options
    options.ldrawDirectory = str(library)
    options.realScale = 1
    options.defaultColour = args.colour
    options.useColourScheme = 'ldraw'
    options.resolution = 'Standard'
    for name in ('useUnofficialParts', 'useLSynthParts', 'useLogoStuds', 'instanceStuds', 'gaps',
                 'curvedWalls', 'importCameras', 'positionObjectOnGroundAtOrigin', 'positionCamera',
                 'addWorldEnvironmentTexture', 'addGroundPlane', 'setRenderSettings'):
        setattr(options, name, False)
    options.addBevelModifier = True
    options.bevelWidth = .25
    loadldraw.hasCollections = hasattr(bpy.data, 'collections')
    warnings = []

    class ImportReporter:
        """滿足匯入器的操作回報契約；錯誤與警告完整留在工作紀錄。"""
        def report(self, levels, message):
            if 'ERROR' in levels:
                raise CatalogError(message)
            if 'WARNING' in levels or 'Unsupported' in message:
                warnings.append(message)
            print('ImportLDraw ' + ','.join(sorted(levels)) + ': ' + message)

    root = loadldraw.loadFromFile(ImportReporter(), str(ContentPathPolicy.resolve(library, 'parts/' + args.part)))
    if root is None:
        raise CatalogError('LDraw 匯入失敗，沒有輸出模型。')
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    if not meshes or not any(len(obj.data.polygons) for obj in meshes):
        raise CatalogError('來源未產生可渲染網格。')

    comparisons = []
    for material in {m for obj in meshes for m in obj.data.materials if m is not None}:
        code = material.name.removeprefix('Material_').removesuffix('_c')
        colour = loadldraw.LegoColours.colours.get(code)
        if colour is None:
            colour = loadldraw.LegoColours.colours.get(int(code)) if code.isdigit() else None
        if colour is None or colour['alpha'] < 1 or colour['material'] not in ('BASIC', 'RUBBER') or colour['luminance']:
            raise CatalogError('此來源材質尚需獨立轉換對照，不能直接降級為不透明塑膠。')
        rgba = list(colour['colour'][:3]) + [1.0]
        roughness = .68 if colour['material'] == 'RUBBER' else .28
        comparisons.append({'material': material.name, 'ldrawColour': code, 'source': colour,
                            'target': {'baseColorLinear': rgba, 'metallic': 0, 'roughness': roughness},
                            'appearanceApproved': False})
        material.node_tree.nodes.clear()
        shader = material.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        shader.inputs['Base Color'].default_value = rgba
        shader.inputs['Metallic'].default_value = 0
        shader.inputs['Roughness'].default_value = roughness
        destination = material.node_tree.nodes.new('ShaderNodeOutputMaterial')
        material.node_tree.links.new(shader.outputs['BSDF'], destination.inputs['Surface'])
        material.diffuse_color = rgba

    # 匯入器已將 LDraw 轉為 Blender Z-up；GLB 匯出再做唯一一次 Y-up 轉換。
    # 烘焙世界矩陣及修飾器後移除父節點，避免 Unity 再次套用比例或鏡像。
    graph = bpy.context.evaluated_depsgraph_get()
    for obj in meshes:
        evaluated = obj.evaluated_get(graph)
        mesh = bpy.data.meshes.new_from_object(evaluated, depsgraph=graph)
        mesh.transform(obj.matrix_world)
        obj.parent = None
        obj.modifiers.clear()
        obj.data = mesh
        obj.matrix_world = Matrix.Identity(4)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in meshes:
        obj.select_set(True)
    output.mkdir(parents=True)
    bpy.ops.export_scene.gltf(filepath=str(output / 'model.glb'), export_format='GLB',
                              use_selection=True, export_yup=True, export_apply=False,
                              export_animations=False, export_skins=False, export_morph=False,
                              export_cameras=False, export_lights=False, export_extras=False,
                              export_copyright='Per-source attribution: conversion.json')
    geometry = inspect_glb((output / 'model.glb').read_bytes())
    report = {'schemaVersion': 1, 'purpose': 'GeometryProbe', 'variantEvidencePending': True,
              'productionStatus': 'Unknown', 'qualityPassed': False,
              'source': source, 'geometry': geometry, 'materialComparisons': comparisons,
              'toolchain': {'blenderVersion': bpy.app.version_string, 'importerCommit': commit,
                            'coordinateProfile': 'ldraw-canonical-metres-v1',
                            'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},
              'importerWarnings': warnings, 'remainingChecks': geometry['remainingChecks']}
    (output / 'conversion.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'output': str(output), 'triangles': geometry['triangles'], 'qualityPassed': False}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='轉換單一來源幾何，不判定未停產或品質核准。')
    parser.add_argument('--library', required=True)
    parser.add_argument('--importer', required=True)
    parser.add_argument('--part', required=True)
    parser.add_argument('--colour', required=True)
    parser.add_argument('--output', required=True)
    convert(parser.parse_args(sys.argv[sys.argv.index('--') + 1:]))
