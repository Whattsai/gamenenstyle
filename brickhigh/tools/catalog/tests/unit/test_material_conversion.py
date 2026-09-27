"""SC-006／SC-036：材質來源 alpha 與已支援 PBR 的映射。"""

import pytest

from tools.catalog.materials import describe_ldraw_material, ldraw_colour_code_from_material_name
from tools.catalog.policies import CatalogError


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
