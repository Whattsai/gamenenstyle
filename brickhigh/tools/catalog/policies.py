"""不依賴 IO 的目錄判定規則；測試報告不能替代實際資產驗收。"""

from datetime import datetime
import hashlib
import json
from uuid import UUID, uuid5


class CatalogError(ValueError):
    """可安全呈現的製作工具錯誤。"""

    exit_code = 2


class CatalogConflict(CatalogError):
    """工作鍵、別名或版本競爭衝突。"""

    exit_code = 5


class GateNotMet(CatalogError):
    """正式來源或逐件品質門檻未滿足。"""

    exit_code = 3


def canonical_json(value):
    """建立順序穩定且不接受非有限浮點值的交換格式。"""
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def digest(value):
    """以標準序列化內容計算 SHA-256。"""
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def utc_time(value):
    """拒絕沒有時區的日期，避免環境時區影響判定。"""
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise CatalogError("證據日期必須包含時區。")
    return parsed


class VariantIdentityPolicy:
    """只從已觀測組合建立穩定識別；別名衝突不合併。"""

    NAMESPACE = UUID("e356c230-0c9d-4d8e-9608-2f98b8358f48")

    @staticmethod
    def key(appearance):
        return digest(appearance)

    @classmethod
    def observed_keys(cls, appearances):
        return {cls.key(appearance) for appearance in appearances}

    @classmethod
    def stable_id(cls, part_id, appearance):
        return str(uuid5(cls.NAMESPACE, part_id + ":" + cls.key(appearance)))

    @staticmethod
    def bind_alias(aliases, source, external_id, kind, target):
        key = (source, external_id, kind)
        if key in aliases and aliases[key] != target:
            raise CatalogConflict("來源識別有相反映射，已保留原映射。")
        aliases[key] = target
        return target


class CatalogCoveragePolicy:
    """依指定盒組候選、未解缺口與逐件品質計算 C/G/V。"""

    @staticmethod
    def evaluate(entries, unresolved_gaps, scope_reviewed):
        rows = list(entries)
        ids = [row["variant_id"] for row in rows]
        if len(set(ids)) != len(ids):
            raise CatalogConflict("候選變體重複，不能重複計算分母。")
        required = [row for row in rows if not row.get("fixture", False)]
        ready = [row for row in required if all(row.get(key) is True for key in
                 ("identity_verified", "ready", "classified", "quality_passed", "provenance_passed"))]
        gaps = len(unresolved_gaps)
        total = len(required)
        allowed = total > 0 and gaps == 0 and len(ready) == total and scope_reviewed is True
        return {"C": total, "G": gaps, "V": len(ready),
                "coverage": len(ready) / total if total else None,
                "label": f"{len(ready)}/{total}" if total else "尚無候選模型",
                "release_allowed": allowed, "scope_reviewed": scope_reviewed,
                "variants": rows, "gaps": list(unresolved_gaps)}
