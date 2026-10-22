"""SC-005／SC-006：自含、非空、以公尺保存的模型，不以外部 URI 補件。"""

import json
import struct
import pytest

from tools.catalog.glb import inspect_glb
from tools.catalog.policies import CatalogError


def triangle_glb(*, external=False, scale=None, invalid_index=False):
    vertices = struct.pack('<9f', 0, 0, 0, .008, .0096, -.004, .008, 0, 0)
    binary = vertices + struct.pack('<3H', 0, 1, 5 if invalid_index else 2) + b'\0\0'
    document = {
        'asset': {'version': '2.0'}, 'scene': 0, 'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0}], 'buffers': [{'byteLength': len(binary)}],
        'bufferViews': [{'buffer': 0, 'byteOffset': 0, 'byteLength': 36},
                        {'buffer': 0, 'byteOffset': 36, 'byteLength': 6}],
        'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': 3, 'type': 'VEC3'},
                      {'bufferView': 1, 'componentType': 5123, 'count': 3, 'type': 'SCALAR'}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0}, 'indices': 1, 'material': 0}]}],
        'materials': [{'pbrMetallicRoughness': {'baseColorFactor': [1, 0, 0, 1]}}],
    }
    if external:
        document['buffers'][0]['uri'] = 'https://invalid.example/mesh.bin'
    if scale:
        document['nodes'][0]['scale'] = scale
    text = json.dumps(document).encode()
    text += b' ' * (-len(text) % 4)
    return (struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(text) + 8 + len(binary))
            + struct.pack('<II', len(text), 0x4E4F534A) + text
            + struct.pack('<II', len(binary), 0x004E4942) + binary)



def textured_triangle_glb(*, defect=None):
    """建立最小 GLB 內嵌紋理樣本，可受控注入壞引用而不經 mock Validator。"""
    import base64
    vertices = struct.pack('<9f', 0, 0, 0, .008, .0096, -.004, .008, 0, 0)
    indices = struct.pack('<3H', 0, 1, 2) + b'\0\0'
    uv = struct.pack('<6f', 0, 0, 1, 0, 0, 1)
    png = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y/TbY8AAAAASUVORK5CYII='
    )
    if defect == 'corrupt_png':
        png = b'NOTAPNG!' + png[8:]
    binary = vertices + indices + uv + png
    binary += b'\0' * (-len(binary) % 4)
    document = {
        'asset': {'version': '2.0'}, 'scene': 0, 'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0}], 'buffers': [{'byteLength': len(binary)}],
        'bufferViews': [
            {'buffer': 0, 'byteOffset': 0, 'byteLength': 36},
            {'buffer': 0, 'byteOffset': 36, 'byteLength': 6},
            {'buffer': 0, 'byteOffset': 44, 'byteLength': 24},
            {'buffer': 0, 'byteOffset': 68, 'byteLength': len(png)},
        ],
        'accessors': [
            {'bufferView': 0, 'componentType': 5126, 'count': 3, 'type': 'VEC3'},
            {'bufferView': 1, 'componentType': 5123, 'count': 3, 'type': 'SCALAR'},
            {'bufferView': 2, 'componentType': 5126, 'count': 3, 'type': 'VEC2'},
        ],
        'meshes': [{'primitives': [{
            'attributes': {'POSITION': 0, 'TEXCOORD_0': 2},
            'indices': 1, 'material': 0,
        }]}],
        'materials': [{'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}}}],
        'textures': [{'source': 0}],
        'images': [{'bufferView': 3, 'mimeType': 'image/png'}],
    }
    if defect == 'missing_uv':
        del document['meshes'][0]['primitives'][0]['attributes']['TEXCOORD_0']
    elif defect == 'missing_image':
        document['textures'][0]['source'] = 1
    elif defect == 'bad_texture_index':
        document['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index'] = 2
    elif defect == 'out_of_bounds':
        document['bufferViews'][3]['byteLength'] = len(png) + 500
    elif defect == 'wrong_mime':
        document['images'][0]['mimeType'] = 'image/jpeg'
    elif defect == 'bad_sampler':
        document['textures'][0]['sampler'] = 2
    elif defect == 'bad_uv_accessor':
        document['meshes'][0]['primitives'][0]['attributes']['TEXCOORD_0'] = 99
    elif defect == 'uv_count_mismatch':
        document['accessors'][2]['count'] = 2
    elif defect == 'invalid_uv_type':
        document['accessors'][2]['type'] = 'VEC3'
    elif defect == 'truncated_png':
        document['bufferViews'][3]['byteLength'] = 16
    raw = json.dumps(document).encode('utf-8')
    raw += b' ' * (-len(raw) % 4)
    return (
        struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(raw) + 8 + len(binary))
        + struct.pack('<II', len(raw), 0x4E4F534A) + raw
        + struct.pack('<II', len(binary), 0x004E4942) + binary
    )


def test_textured_glb_accepts_embedded_png_and_explicit_uv_but_remains_not_ready():
    result = inspect_glb(textured_triangle_glb())
    assert result['triangles'] == 1
    assert result['materialCount'] == 1
    assert result['qualityPassed'] is False


@pytest.mark.parametrize('defect', [
    'missing_uv', 'missing_image', 'bad_texture_index', 'out_of_bounds',
    'corrupt_png', 'wrong_mime', 'bad_sampler', 'bad_uv_accessor',
    'uv_count_mismatch', 'invalid_uv_type', 'truncated_png',
])
def test_textured_glb_rejects_dangling_texture_or_invalid_embedded_image(defect):
    with pytest.raises(CatalogError):
        inspect_glb(textured_triangle_glb(defect=defect))

def test_self_contained_mesh_reports_real_geometry_but_not_ready():
    report = inspect_glb(triangle_glb())
    assert report['triangles'] == 1
    assert report['meshCount'] == 1
    assert report['boundsMeters']['max'] == pytest.approx([.008, .0096, 0])
    assert report['boundsMeters']['min'] == pytest.approx([0, 0, -.004])
    assert report['qualityPassed'] is False  # 仍需官方 validator、接點及實際六視圖


@pytest.mark.parametrize('data', [b'', triangle_glb(external=True),
                                triangle_glb(scale=[.01, .01, .01]),
                                triangle_glb(invalid_index=True), triangle_glb()[:-1]])
def test_corrupt_external_or_unbaked_source_fails(data):
    with pytest.raises(CatalogError):
        inspect_glb(data)
