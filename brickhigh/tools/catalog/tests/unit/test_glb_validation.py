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
