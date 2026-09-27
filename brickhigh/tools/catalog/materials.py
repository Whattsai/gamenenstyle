"""受控 LDraw 顏色轉標準 glTF PBR 材質的政策。"""

import math
import re

from .policies import CatalogError


def ldraw_colour_code_from_material_name(material_name):
    """剝除 ImportLDraw 的已知材質用途尾碼，保留實際數字色碼。"""
    match = re.fullmatch(r'Material_([0-9]+)(?:_(?:c|s))*', material_name or '')
    if match is None:
        raise CatalogError('ImportLDraw 材質名稱不含可核對的 LDraw 數字色碼。')
    return match.group(1)


def describe_ldraw_material(colour_code, source):
    """保留支援的 LDraw 顏色／透明度，拒絕未建模的材質特性。"""
    if not isinstance(source, dict):
        raise CatalogError('LDraw 顏色來源格式無效。')
    if source.get('material') not in ('BASIC', 'RUBBER'):
        raise CatalogError('此 LDraw 材質尚未支援標準 PBR 對照。')
    if any(source.get(key) is not None for key in
           ('fraction', 'vfraction', 'size', 'minsize', 'maxsize', 'secondary_colour')):
        raise CatalogError('此 LDraw 材質含尚未支援的特殊材質參數。')

    luminance = source.get('luminance', 0)
    if (not isinstance(luminance, (int, float)) or isinstance(luminance, bool)
            or not math.isfinite(luminance) or luminance != 0):
        raise CatalogError('發光材質尚未支援標準 PBR 對照。')

    rgb = source.get('colour')
    alpha = source.get('alpha')
    if (not isinstance(rgb, (list, tuple)) or len(rgb) != 3
            or any(not isinstance(channel, (int, float)) or isinstance(channel, bool)
                   or not math.isfinite(channel) or not 0 <= channel <= 1 for channel in rgb)):
        raise CatalogError('LDraw 顏色必須是三個有限且介於零與一之間的線性 RGB 值。')
    if (not isinstance(alpha, (int, float)) or isinstance(alpha, bool)
            or not math.isfinite(alpha) or not 0 <= alpha <= 1):
        raise CatalogError('LDraw alpha 必須是介於零與一之間的有限值。')

    alpha_mode = 'BLEND' if alpha < 1 else 'OPAQUE'
    rgba = list(rgb) + [alpha]
    return {
        'ldrawColour': str(colour_code),
        'source': {
            'name': source.get('name'),
            'colour': list(rgb),
            'alpha': alpha,
            'luminance': luminance,
            'material': source['material'],
        },
        'target': {
            'baseColorLinear': rgba,
            'metallic': 0,
            'roughness': 0.68 if source['material'] == 'RUBBER' else 0.28,
            'alphaMode': alpha_mode,
        },
        'appearanceApproved': False,
    }
