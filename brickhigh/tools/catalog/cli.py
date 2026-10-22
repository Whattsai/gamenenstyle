"""開發端製作 CLI；只輸出安全代碼與已核對的摘要。"""

import argparse
import json
from pathlib import Path
import sqlite3
import sys
from uuid import UUID

from .content import ContentPathPolicy
from .jobs import CatalogJobs
from .importing import import_catalog
from .resolving import resolve_catalog
from .building import build_catalog
from .policies import CatalogConflict, CatalogError, GateNotMet
from .quality import complete_revision_quality, quality_review_template, verify_persisted_quality
from .repository import CatalogRepository


class SafeParser(argparse.ArgumentParser):
    """不將未知參數值或來源密鑰複製到錯誤輸出。"""

    def error(self, _message):
        raise CatalogError("命令參數無效。")


def parser():
    command = SafeParser(prog="python -m tools.catalog")
    command.add_argument("--workspace", required=True)
    command.add_argument("--db", default="catalog.sqlite")
    actions = command.add_subparsers(dest="action", required=True, parser_class=SafeParser)
    importing = actions.add_parser("import")
    importing.add_argument("--manifest", required=True)
    importing.add_argument("--job-key", required=True)
    resolve = actions.add_parser("resolve")
    resolve.add_argument("--snapshot", required=True)
    resolve.add_argument("--decisions", required=True)
    build = actions.add_parser("build")
    build.add_argument("--snapshot", required=True)
    build.add_argument("--job-key", required=True)
    build.add_argument("--plan")
    freeze = actions.add_parser("freeze")
    freeze.add_argument("--snapshot", required=True)
    freeze.add_argument("--expected-version", required=True, type=int)
    validate = actions.add_parser("validate")
    validate.add_argument("--snapshot", required=True)
    publish = actions.add_parser("publish")
    publish.add_argument("--snapshot", required=True)
    publish.add_argument("--expected-head-version", required=True, type=int)
    publish.add_argument("--build")
    publish.add_argument("--target")
    publish.add_argument("--toolchain-digest")
    quality_template = actions.add_parser("quality-template")
    quality_template.add_argument("--revision", required=True)
    quality_review = actions.add_parser("quality-review")
    quality_review.add_argument("--revision", required=True)
    quality_review.add_argument("--report", required=True)
    status = actions.add_parser("status")
    status.add_argument("--job", required=True)
    return command


def _uuid(value):
    try:
        if str(UUID(value)) == value:
            return value
    except (ValueError, TypeError, AttributeError):
        pass
    raise CatalogError("識別碼格式無效。")


def _database(workspace_arg, key, *, allow_create=False):
    root = Path(workspace_arg)
    if not root.is_absolute() or not root.is_dir():
        raise CatalogError("工作目錄無效。")
    path = ContentPathPolicy.resolve(root, key)
    if not path.is_file() and not (allow_create and not path.exists()):
        raise CatalogError("找不到既有製作資料庫。")
    return root, path


def _verified_artifact(repo, workspace, artifact_id):
    row = repo.connection.execute("SELECT digest,storage_key FROM source_artifacts WHERE artifact_id=?",
                                  (artifact_id,)).fetchone()
    if row is None:
        return False
    try:
        ContentPathPolicy.read_verified(workspace, row["storage_key"], row["digest"])
        return True
    except (CatalogError, OSError, ValueError):
        return False


def _validation(repo, workspace, snapshot_id):
    """逐項揭露現有 DB 能證明的範圍；布林報告不當作實體品質證據。"""
    snapshot = repo.snapshot(snapshot_id)
    coverage = repo.coverage(snapshot_id)
    global_issues = []
    if snapshot["status"] != "Frozen":
        global_issues.append("snapshot-not-frozen")
    if coverage["C"] == 0:
        global_issues.append("no-catalog-variants")
    if coverage["G"]:
        global_issues.append("unresolved-coverage-gaps")
    review = json.loads(snapshot["coverage_review_json"])
    if not isinstance(review, dict) or not review.get("reviewer") or not _verified_artifact(
            repo, workspace, review.get("artifact")):
        global_issues.append("missing-scope-evidence")

    variants = []
    for entry in repo.entries(snapshot_id):
        issues = []
        evidence_ids = json.loads(entry["evidence_ids_json"])
        if not isinstance(evidence_ids, list) or not evidence_ids or any(not isinstance(item, str) for item in evidence_ids):
            issues.append("missing-source-evidence")
        else:
            for evidence_id in evidence_ids:
                evidence = repo.connection.execute("SELECT artifact_id FROM evidence WHERE evidence_id=?", (evidence_id,)).fetchone()
                if evidence is None or not _verified_artifact(repo, workspace, evidence["artifact_id"]):
                    issues.append("missing-source-evidence")
                    break
        classification = json.loads(entry["classification_json"])
        if not isinstance(classification, dict) or classification.get("tier") not in {
                "Basic", "Advanced", "Special"} or not classification.get("reason"):
            issues.append("missing-classification")
        projection = json.loads(entry["display_projection_json"])
        if not isinstance(projection, dict) or projection.get("fixture"):
            issues.append("fixture-content")
        elif not projection.get("designId") or not projection.get("elementId"):
            issues.append("missing-lego-identity")
        if not entry["selected_revision_id"] or entry["revision_status"] != "Ready":
            issues.append("missing-selected-revision")
        elif not verify_persisted_quality(workspace, entry):
            issues.append("unverifiable-quality-report")
        variants.append({"variantId": entry["variant_id"], "issues": issues})

    matched_builds = repo.connection.execute("""SELECT COUNT(*) FROM validation_builds
        WHERE snapshot_id=? AND snapshot_version=? AND selection_digest=? AND status='Passed'""",
        (snapshot_id, snapshot["version"], repo.selection_digest(snapshot_id))).fetchone()[0]
    if matched_builds == 0:
        global_issues.append("missing-runtime-build")
    allowed = not global_issues and all(not item["issues"] for item in variants)
    counts = {key: coverage[key] for key in ("C", "G", "V")}
    # DB 的 Ready 旗標不是實際品質證據；輸出僅計入本次完整核對的變體。
    counts["V"] = sum(not item["issues"] for item in variants)
    return {"snapshotId": snapshot_id, "status": snapshot["status"],
            "counts": counts,
            "issues": global_issues, "variants": variants, "releaseAllowed": allowed}


def _publish_build(repo, snapshot_id, args):
    snapshot = repo.snapshot(snapshot_id)
    parameters = [snapshot_id, snapshot["version"], repo.selection_digest(snapshot_id)]
    sql = """SELECT build_id,target,toolchain_digest FROM validation_builds
        WHERE snapshot_id=? AND snapshot_version=? AND selection_digest=? AND status='Passed'"""
    if args.build:
        sql += " AND build_id=?"
        parameters.append(_uuid(args.build))
    if args.target:
        sql += " AND target=?"
        parameters.append(args.target)
    if args.toolchain_digest:
        sql += " AND toolchain_digest=?"
        parameters.append(args.toolchain_digest)
    matches = repo.connection.execute(sql, parameters).fetchall()
    if len(matches) != 1:
        raise GateNotMet("建置驗證缺失或不唯一。")
    return matches[0]


def _execute(args, workspace, database):
    if args.action == "build":
        snapshot = _uuid(args.snapshot)
        result = build_catalog(workspace, database, snapshot, args.job_key,
                               args.plan or "build-plans/" + snapshot + ".json")
        return result["exitCode"], result
    if args.action == "import":
        with CatalogRepository(database, workspace=workspace) as repo:
            result = import_catalog(repo, workspace, args.manifest, args.job_key)
            return 0, {"snapshotId": result.snapshot_id, "inputDigest": result.input_digest,
                       "coverage": result.coverage}
    if args.action == "status":
        with CatalogJobs(database) as jobs:
            result = jobs.status(_uuid(args.job))
            return result["exit_code"], result
    if args.action in {"quality-template", "quality-review"}:
        revision_id = _uuid(args.revision)
        with CatalogRepository(database, workspace=workspace) as repo:
            row = repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (revision_id,)).fetchone()
            if row is None:
                raise CatalogError("找不到指定模型版本。")
            if args.action == "quality-template":
                if row["status"] != "Validating":
                    raise GateNotMet("只有Validating revision可建立品質覆核模板。")
                return 0, quality_review_template(workspace, dict(row), json.loads(row["manifest_json"]))
            return 0, complete_revision_quality(repo, workspace, revision_id, args.report)
    snapshot_id = _uuid(args.snapshot)
    with CatalogRepository(database, workspace=workspace) as repo:
        if args.action == "resolve":
            return 0, resolve_catalog(repo, workspace, snapshot_id, args.decisions)
        if args.action == "freeze":
            if args.expected_version < 0:
                raise CatalogError("版本號無效。")
            repo.freeze(snapshot_id, args.expected_version)
            row = repo.snapshot(snapshot_id)
            return 0, {"snapshotId": snapshot_id, "status": row["status"], "version": row["version"]}
        if args.action == "validate":
            result = _validation(repo, workspace, snapshot_id)
            return (0 if result["releaseAllowed"] else 3), result
        if args.expected_head_version < 0:
            raise CatalogError("版本號無效。")
        if repo.head()["version"] != args.expected_head_version:
            raise CatalogConflict("正式版本已被另一工作更新。")
        report = _validation(repo, workspace, snapshot_id)
        if not report["releaseAllowed"]:
            return 3, report
        build = _publish_build(repo, snapshot_id, args)
        repo.publish(snapshot_id, args.expected_head_version, build["build_id"],
                     build["target"], build["toolchain_digest"])
        return 0, {"snapshotId": snapshot_id, "status": "Published", "headVersion": repo.head()["version"]}


def main(argv=None):
    try:
        args = parser().parse_args(argv)
        workspace, database = _database(args.workspace, args.db, allow_create=args.action == "import")
        code, result = _execute(args, workspace, database)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
        return code
    except CatalogConflict:
        print("版本或工作鍵衝突。", file=sys.stderr)
        return 5
    except GateNotMet:
        print("發布門檻不足。", file=sys.stderr)
        return 3
    except CatalogError:
        print("輸入或工作資料無效。", file=sys.stderr)
        return 2
    except (OSError, sqlite3.Error, ValueError, TypeError, KeyError, json.JSONDecodeError):
        print("工具或資料庫無法完成操作。", file=sys.stderr)
        return 4
