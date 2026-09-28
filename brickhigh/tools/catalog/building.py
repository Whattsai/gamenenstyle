"""Frozen 來源模型工作：轉換與封存後停在 Validating，完整品質檢核另行完成。"""

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import time
from uuid import uuid4

from .content import ContentPathPolicy, ObjectStore
from .importing import _object, _read_json
from .jobs import CatalogJobs
from .metadata_quality import inspect_metadata
from .policies import CatalogConflict, CatalogError, canonical_json, digest
from .repository import CatalogRepository
from .resolving import _uuid


def _fence(repo, jobs, token):
    """在同一 SQLite 寫入交易內核對租約，過時 worker 不可提交 revision。"""
    row = repo.connection.execute("""SELECT j.status,j.lease_until FROM jobs j JOIN catalog_job_claims c
        ON j.job_id=c.job_id WHERE c.token=?""", (token,)).fetchone()
    if row is None or row["status"] != "Running" or row["lease_until"] <= jobs._now().isoformat():
        raise CatalogConflict("模型工作租約已失效。")


def _snapshot_fence(repo, plan):
    snapshot = repo._require(plan["snapshotId"], {"Frozen"})
    if snapshot["version"] != plan["snapshotVersion"]:
        raise CatalogConflict("建置期間快照版本已改變，請使用新的建置計畫。")


def _plan(repo, workspace, snapshot_id, key):
    snapshot = repo._require(snapshot_id, {"Frozen"})
    _, plan = _read_json(workspace, key)
    _object(plan, ("schemaVersion", "snapshotId", "snapshotVersion", "library", "importer", "items"))
    if type(plan["schemaVersion"]) is not int or plan["schemaVersion"] != 1:
        raise CatalogError("建置計畫格式不支援。")
    if plan["snapshotId"] != snapshot_id or type(plan["snapshotVersion"]) is not int:
        raise CatalogError("建置計畫快照身分無效。")
    if plan["snapshotVersion"] != snapshot["version"]:
        raise CatalogConflict("建置計畫快照版本已改變。")
    for key in ("library", "importer"):
        ContentPathPolicy.resolve(workspace, plan[key])
    if not isinstance(plan["items"], list) or not plan["items"]:
        raise CatalogError("建置清單不可為空。")
    seen = set()
    for item in plan["items"]:
        _object(item, ("variantId", "part", "colour", "metadata"))
        variant = _uuid(item["variantId"])
        if variant in seen:
            raise CatalogError("建置變體重複。")
        seen.add(variant)
        row = repo.connection.execute("SELECT production_status FROM snapshot_entries WHERE snapshot_id=? AND variant_id=?",
                                      (snapshot_id, variant)).fetchone()
        if row is None or row[0] == "Retired":
            raise CatalogError("變體不在本次允許建置範圍。")
        if (not isinstance(item["part"], str) or not item["part"].endswith(".dat")
                or "/" in item["part"] or "\\" in item["part"]):
            raise CatalogError("LDraw 零件識別無效。")
        ContentPathPolicy.resolve(workspace, item["part"])
        if not isinstance(item["colour"], str) or not item["colour"].isascii() or not item["colour"].isdigit():
            raise CatalogError("LDraw 色碼無效。")
        _object(item["metadata"], ("path", "sha256"))
        data, metadata = _read_json(workspace, item["metadata"]["path"])
        if hashlib.sha256(data).hexdigest() != item["metadata"]["sha256"]:
            raise CatalogError("metadata SHA-256 不符。")
        if not isinstance(metadata, dict) or type(metadata.get("schemaVersion")) is not int or metadata["schemaVersion"] != 1:
            raise CatalogError("metadata schemaVersion 不支援。")
    return plan


def _command(command, timeout):
    try:
        result = subprocess.run(command, capture_output=True, timeout=timeout, shell=False)
    except subprocess.TimeoutExpired as error:
        raise TimeoutError("模型工具逾時。") from error
    if result.returncode != 0:
        raise RuntimeError("模型工具未成功完成。")
    return result.stdout


def prepare_toolchain(workspace, plan):
    """鎖定實際可執行檔、維護腳本、匯入器及逐件來源hash。"""
    from .blender_convert import IMPORTER_COMMIT
    from .sources import inspect_ldraw
    library = ContentPathPolicy.resolve(workspace, plan["library"])
    importer = ContentPathPolicy.resolve(workspace, plan["importer"])
    commit = _command(["git", "-C", str(importer), "rev-parse", "HEAD"], 30).decode().strip()
    dirty = _command(["git", "-C", str(importer), "status", "--porcelain", "--untracked-files=no"], 30)
    if commit != IMPORTER_COMMIT or dirty:
        raise CatalogError("ImportLDraw 版本或內容不符。")
    executables = {name: shutil.which(name) for name in ("blender", "node")}
    if not all(executables.values()):
        raise RuntimeError("缺少模型製作工具。")
    scripts = Path(__file__).parent
    hashes = {name: hashlib.sha256((scripts / name).read_bytes()).hexdigest() for name in (
        "building.py", "metadata_quality.py", "blender_convert.py", "render_views.py", "materials.py", "sources.py", "glb.py", "content.py", "policies.py",
        "validate_glb.cjs", "package-lock.json")}
    tools = {name: hashlib.sha256(Path(path).read_bytes()).hexdigest() for name, path in executables.items()}
    colours = hashlib.sha256(ContentPathPolicy.read_bytes(library, "LDConfig.ldr")).hexdigest()
    sources = {}
    for item in plan["items"]:
        try:
            sources[item["variantId"]] = inspect_ldraw(library, item["part"])
        except (CatalogError, OSError, UnicodeError):
            # 來源缺件屬逐件失敗，不阻止其他獨立模型製作。
            sources[item["variantId"]] = {"sourceError": "SourceUnavailable", "part": item["part"]}
    return {"toolchain": {"importerCommit": commit, "scripts": hashes, "executables": tools,
                          "colourConfigSha256": colours}, "sources": sources}


def convert_item(workspace, plan, item, output, timeout):
    """僅執行維護中的LDraw轉換腳本；Blender與Validator共用有界時間。"""
    from .glb import inspect_glb, verify_validator_report
    scripts = Path(__file__).parent
    deadline = time.monotonic() + timeout
    _command([shutil.which("blender"), "--background", "--factory-startup", "--disable-autoexec",
              "--python-exit-code", "4", "--python", str(scripts / "blender_convert.py"), "--",
              "--library", str(ContentPathPolicy.resolve(workspace, plan["library"])),
              "--importer", str(ContentPathPolicy.resolve(workspace, plan["importer"])),
              "--part", item["part"], "--colour", item["colour"], "--output", str(output)], timeout)
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError("模型工具逾時。")
    _command([shutil.which("node"), str(scripts / "validate_glb.cjs"), str(output / "model.glb"),
              str(output / "khronos-report.json")], remaining)
    geometry = inspect_glb(ContentPathPolicy.read_bytes(output, "model.glb"))
    verify_validator_report(json.loads(ContentPathPolicy.read_bytes(output, "khronos-report.json")), geometry)
    conversion = json.loads(ContentPathPolicy.read_bytes(output, "conversion.json"))
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError("模型工具逾時。")
    _command([shutil.which("blender"), "--background", "--factory-startup", "--disable-autoexec",
              "--python-exit-code", "4", "--python", str(scripts / "render_views.py"), "--",
              "--model", str(output / "model.glb"), "--output", str(output / "views")], remaining)
    views = json.loads(ContentPathPolicy.read_bytes(output / "views", "six-views.json"))
    if views["modelSha256"] != geometry["sha256"]:
        raise CatalogError("六視圖與模型版本不符。")
    for record in [*views["views"].values(), views["preview"]]:
        ContentPathPolicy.read_verified(output / "views", record["file"], record["sha256"])
    attribution = {"schemaVersion": 1, "modelSha256": geometry["sha256"],
                   "sources": conversion["source"]["files"], "colourConfig": conversion["source"]["colourConfig"],
                   "modifications": "LDraw轉換為canonical公尺GLB，烘焙修飾器並依色碼建立PBR材質。",
                   "reviewed": False}
    (output / "attribution.json").write_text(canonical_json(attribution), encoding="utf-8")
    source = dict(conversion["source"])
    source.pop("colourConfig", None)
    return {"geometry": geometry, "source": source, "qualityPassed": False}


def _verify_revision(workspace, row):
    manifest = json.loads(row["manifest_json"])
    if not manifest.get("files"):
        raise CatalogError("模型缺少封存產物。")
    for file in manifest["files"]:
        try:
            data = ContentPathPolicy.read_verified(workspace, file["storageKey"], file["sha256"])
        except OSError as error:
            raise CatalogError("封存模型無法讀取。") from error
        if len(data) != file["byteLength"]:
            raise CatalogError("封存模型長度不符。")
    return manifest


def build_catalog(workspace, database, snapshot_id, job_key, plan_key):
    """可恢復逐件製作；成功轉換停在Validating，不偽造Ready或RuntimeBuild。"""
    workspace = Path(workspace).absolute()
    database = Path(database).absolute()
    if not database.is_relative_to(workspace):
        raise CatalogError("製作資料庫位於工作目錄外。")
    ContentPathPolicy.resolve(workspace, database.relative_to(workspace).as_posix())
    _uuid(snapshot_id)
    with CatalogRepository(database, workspace=workspace) as repo:
        plan = _plan(repo, workspace, snapshot_id, plan_key)
        prepared = prepare_toolchain(workspace, plan)
        with repo.transaction():
            _snapshot_fence(repo, plan)
        inputs = {"plan": plan, "prepared": prepared}
        with CatalogJobs(database) as jobs:
            job = jobs.submit(job_key, "build", inputs)
            token = jobs.claim(job, lease_seconds=660)
            if token is None and jobs.status(job)["status"] != "Completed":
                raise CatalogConflict("另一模型工作仍持有租約。")
            with jobs.release_on_error(token):
                revisions = []
                for item in plan["items"]:
                    identity = {"item": item, "toolchain": prepared["toolchain"],
                                "source": prepared["sources"][item["variantId"]]}
                    input_hash = digest(identity)
                    row = repo.connection.execute("SELECT * FROM model_revisions WHERE variant_id=? AND input_digest=?",
                                                  (item["variantId"], input_hash)).fetchone()
                    if row is not None and row["status"] in {"Validating", "Ready"}:
                        _verify_revision(workspace, row)
                    if token is None:
                        if row is None or row["status"] not in {"Validating", "Ready"}:
                            raise CatalogError("成功工作缺少對應模型。")
                        revisions.append({"variantId": item["variantId"], "revisionId": row["revision_id"], "status": row["status"]})
                        continue
                    with repo.transaction():
                        _fence(repo, jobs, token)
                        _snapshot_fence(repo, plan)
                        revision = repo.start_revision(item["variantId"], input_hash, prepared["toolchain"])
                    def worker(timeout):
                        current = repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (revision,)).fetchone()
                        if current["status"] in {"Validating", "Ready"}:
                            return _verify_revision(workspace, current)
                        with repo.transaction():
                            _fence(repo, jobs, token)
                            repo.connection.execute("UPDATE model_revisions SET status='Building' WHERE revision_id=?", (revision,))
                        output_key = "artifacts/catalog/builds/" + job + "/" + revision + "/" + uuid4().hex
                        output = ContentPathPolicy.resolve(workspace, output_key)
                        failure_code = "ConversionFailed"
                        try:
                            if prepared["sources"][item["variantId"]].get("sourceError"):
                                failure_code = "SourceUnavailable"
                                raise CatalogError("此模型來源缺件或格式尚未支援。")
                            report = convert_item(workspace, plan, item, output, timeout - 30)
                            if report.get("source") != prepared["sources"][item["variantId"]]:
                                failure_code = "SourceChanged"
                                raise CatalogError("轉換時來源已改變，不可沿用先前版本身分。")
                            failure_code = "ArtifactValidationFailed"
                            metadata = ContentPathPolicy.read_verified(workspace, item["metadata"]["path"], item["metadata"]["sha256"])
                            with (output / "metadata.json").open("xb") as stream:
                                stream.write(metadata)
                            files = []
                            store = ObjectStore(workspace / "artifacts" / "catalog")
                            paths = {name: name for name in ("model.glb", "metadata.json", "conversion.json",
                                                            "khronos-report.json", "attribution.json")}
                            paths.update({name: "views/" + name for name in ("six-views.json", "preview.png",
                                          "front.png", "back.png", "left.png", "right.png", "top.png", "bottom.png")})
                            for name, path in paths.items():
                                saved = store.put(ContentPathPolicy.read_bytes(output, path))
                                files.append({"name": name, "sha256": saved["sha256"], "byteLength": saved["byte_length"],
                                              "storageKey": "artifacts/catalog/" + saved["storage_key"]})
                            # 封存製作當時的原始依賴；來源庫更新後仍可核對舊revision。
                            failure_code = "SourceChanged"
                            library = ContentPathPolicy.resolve(workspace, plan["library"])
                            originals = [(source["path"], source["sha256"]) for source in
                                         prepared["sources"][item["variantId"]].get("files", [])]
                            if prepared["toolchain"].get("colourConfigSha256"):
                                originals.append(("LDConfig.ldr", prepared["toolchain"]["colourConfigSha256"]))
                            for path, expected_digest in originals:
                                saved = store.put(ContentPathPolicy.read_verified(library, path, expected_digest))
                                files.append({"name": "sources/" + path, "sha256": saved["sha256"],
                                              "byteLength": saved["byte_length"], "storageKey": "artifacts/catalog/" + saved["storage_key"]})
                            manifest = {"schemaVersion": 1, "variantId": item["variantId"], "revisionId": revision,
                                        "inputDigest": input_hash, "toolchain": prepared["toolchain"], "files": files}
                            validation = {"quality_passed": False, "provenance_passed": False,
                                          "metadataChecks": inspect_metadata(json.loads(metadata), report["geometry"]),
                                          "conversion": report, "remainingChecks": ["DimensionsAndConnectors",
                                          "SourceAppearance", "SixViews", "AttributionReview"]}
                            failure_code = "SnapshotChanged"
                            with repo.transaction():
                                _fence(repo, jobs, token)
                                _snapshot_fence(repo, plan)
                                repo.connection.execute("UPDATE model_revisions SET status='Validating',manifest_json=?,validation_json=? WHERE revision_id=?",
                                                        (canonical_json(manifest), canonical_json(validation), revision))
                            return manifest
                        except Exception as error:
                            failure = {"quality_passed": False, "failureCode": "WorkerTimeout" if isinstance(error, TimeoutError)
                                       else failure_code, "attemptPath": output_key}
                            with repo.transaction():
                                _fence(repo, jobs, token)
                                repo.connection.execute("UPDATE model_revisions SET status='Failed',validation_json=? WHERE revision_id=?",
                                                        (canonical_json(failure), revision))
                            raise
                    jobs.run_item(token, identity, worker, timeout_seconds=630)
                    state = repo.connection.execute("SELECT status FROM model_revisions WHERE revision_id=?", (revision,)).fetchone()[0]
                    revisions.append({"variantId": item["variantId"], "revisionId": revision, "status": state})
                status = jobs.finish(token) if token is not None else "Completed"
                return {"jobId": job, "jobStatus": status, "snapshotId": snapshot_id,
                        "exitCode": 4 if status == "Failed" else 3, "revisions": revisions,
                        "qualityPassed": False}
