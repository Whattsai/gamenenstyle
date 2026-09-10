PRAGMA foreign_keys = ON;
PRAGMA journal_mode = DELETE;
CREATE TABLE IF NOT EXISTS parts (
    part_id TEXT PRIMARY KEY, name TEXT NOT NULL, family TEXT NOT NULL,
    geometry_identity TEXT NOT NULL UNIQUE, version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS variants (
    variant_id TEXT PRIMARY KEY, part_id TEXT NOT NULL REFERENCES parts(part_id),
    variant_key TEXT NOT NULL, appearance_json TEXT NOT NULL,
    UNIQUE(part_id, variant_key));
CREATE TABLE IF NOT EXISTS source_artifacts (
    artifact_id TEXT PRIMARY KEY, source_uri TEXT NOT NULL, observed_at TEXT NOT NULL,
    effective_at TEXT, digest TEXT NOT NULL, storage_key TEXT NOT NULL,
    license_json TEXT NOT NULL, manifest_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY, artifact_id TEXT NOT NULL REFERENCES source_artifacts,
    subject_ref TEXT NOT NULL, claim TEXT NOT NULL, effective_from TEXT, effective_to TEXT,
    reviewer TEXT NOT NULL, reason TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS external_refs (
    source TEXT NOT NULL, external_id TEXT NOT NULL, target_kind TEXT NOT NULL,
    target_id TEXT NOT NULL, evidence_id TEXT NOT NULL,
    PRIMARY KEY(source, external_id, target_kind));
CREATE TABLE IF NOT EXISTS mapping_conflicts (
    conflict_id TEXT PRIMARY KEY, source TEXT NOT NULL, external_id TEXT NOT NULL,
    target_kind TEXT NOT NULL, existing_id TEXT NOT NULL, proposed_id TEXT NOT NULL,
    resolved_evidence_id TEXT);
CREATE TABLE IF NOT EXISTS snapshots (
    snapshot_id TEXT PRIMARY KEY, baseline_at TEXT NOT NULL, parent_id TEXT REFERENCES snapshots,
    status TEXT NOT NULL CHECK(status IN ('Draft','Frozen','Published')),
    scope_manifest_json TEXT NOT NULL, coverage_review_json TEXT NOT NULL DEFAULT '{}',
    compatibility_profiles_json TEXT NOT NULL DEFAULT '{}', version INTEGER NOT NULL DEFAULT 1,
    published_build_id TEXT);
CREATE TABLE IF NOT EXISTS model_revisions (
    revision_id TEXT PRIMARY KEY, variant_id TEXT NOT NULL REFERENCES variants,
    input_digest TEXT NOT NULL, toolchain_json TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending','Building','Validating','Ready','Failed')),
    manifest_json TEXT NOT NULL DEFAULT '{}', validation_json TEXT NOT NULL DEFAULT '{}',
    UNIQUE(variant_id, input_digest), UNIQUE(variant_id, revision_id));
CREATE TABLE IF NOT EXISTS snapshot_entries (
    snapshot_id TEXT NOT NULL REFERENCES snapshots, variant_id TEXT NOT NULL REFERENCES variants,
    production_status TEXT NOT NULL CHECK(production_status IN ('Active','Retired','Unknown')),
    evidence_ids_json TEXT NOT NULL, classification_json TEXT NOT NULL,
    display_projection_json TEXT NOT NULL, selected_revision_id TEXT,
    PRIMARY KEY(snapshot_id,variant_id),
    FOREIGN KEY(variant_id,selected_revision_id) REFERENCES model_revisions(variant_id,revision_id));
CREATE TABLE IF NOT EXISTS coverage_gaps (
    gap_id TEXT PRIMARY KEY, snapshot_id TEXT NOT NULL REFERENCES snapshots,
    source TEXT NOT NULL, family TEXT NOT NULL, kind TEXT NOT NULL, resolution_evidence_id TEXT);
CREATE TABLE IF NOT EXISTS validation_builds (
    build_id TEXT PRIMARY KEY, snapshot_id TEXT NOT NULL REFERENCES snapshots,
    snapshot_version INTEGER NOT NULL, selection_digest TEXT NOT NULL,
    toolchain_digest TEXT NOT NULL, target TEXT NOT NULL, result_digest TEXT NOT NULL,
    status TEXT NOT NULL, revisions_json TEXT NOT NULL,
    UNIQUE(snapshot_id,snapshot_version,selection_digest,toolchain_digest,target,result_digest));
CREATE TABLE IF NOT EXISTS catalog_head (
    id INTEGER PRIMARY KEY CHECK(id=1), snapshot_id TEXT REFERENCES snapshots,
    version INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO catalog_head(id,version) VALUES(1,0);
CREATE TABLE IF NOT EXISTS jobs (
    job_id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE, input_digest TEXT NOT NULL,
    kind TEXT NOT NULL, status TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0,
    result_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS job_items (
    job_id TEXT NOT NULL REFERENCES jobs, input_digest TEXT NOT NULL, status TEXT NOT NULL,
    result_json TEXT NOT NULL DEFAULT '{}', PRIMARY KEY(job_id,input_digest));
CREATE INDEX IF NOT EXISTS ix_entries_status ON snapshot_entries(snapshot_id,production_status,variant_id);

-- 凍結約束置於資料庫邊界；後繼草稿才可改變來源範圍及判定。
CREATE TRIGGER IF NOT EXISTS snapshots_frozen_update BEFORE UPDATE ON snapshots
WHEN OLD.status <> 'Draft' AND (
    OLD.status = 'Published' OR NEW.status NOT IN ('Frozen','Published')
    OR NEW.snapshot_id IS NOT OLD.snapshot_id OR NEW.baseline_at IS NOT OLD.baseline_at
    OR NEW.parent_id IS NOT OLD.parent_id OR NEW.scope_manifest_json IS NOT OLD.scope_manifest_json
    OR NEW.coverage_review_json IS NOT OLD.coverage_review_json
    OR NEW.compatibility_profiles_json IS NOT OLD.compatibility_profiles_json)
BEGIN SELECT RAISE(ABORT, '凍結快照不可變更來源投影。'); END;
CREATE TRIGGER IF NOT EXISTS snapshots_frozen_delete BEFORE DELETE ON snapshots
WHEN OLD.status <> 'Draft'
BEGIN SELECT RAISE(ABORT, '凍結快照不可刪除。'); END;
CREATE TRIGGER IF NOT EXISTS entries_frozen_insert BEFORE INSERT ON snapshot_entries
WHEN (SELECT status FROM snapshots WHERE snapshot_id=NEW.snapshot_id) <> 'Draft'
BEGIN SELECT RAISE(ABORT, '凍結快照不可新增候選。'); END;
CREATE TRIGGER IF NOT EXISTS entries_frozen_delete BEFORE DELETE ON snapshot_entries
WHEN (SELECT status FROM snapshots WHERE snapshot_id=OLD.snapshot_id) <> 'Draft'
BEGIN SELECT RAISE(ABORT, '凍結快照不可刪除候選。'); END;
CREATE TRIGGER IF NOT EXISTS entries_frozen_update BEFORE UPDATE ON snapshot_entries
WHEN (SELECT status FROM snapshots WHERE snapshot_id=OLD.snapshot_id) <> 'Draft' AND (
    (SELECT status FROM snapshots WHERE snapshot_id=OLD.snapshot_id) = 'Published'
    OR NEW.snapshot_id IS NOT OLD.snapshot_id OR NEW.variant_id IS NOT OLD.variant_id
    OR NEW.production_status IS NOT OLD.production_status OR NEW.evidence_ids_json IS NOT OLD.evidence_ids_json
    OR NEW.classification_json IS NOT OLD.classification_json
    OR NEW.display_projection_json IS NOT OLD.display_projection_json)
BEGIN SELECT RAISE(ABORT, '凍結候選僅允許選擇已驗證模型版本。'); END;
CREATE TRIGGER IF NOT EXISTS revision_ready_update BEFORE UPDATE ON model_revisions
WHEN OLD.status = 'Ready'
BEGIN SELECT RAISE(ABORT, 'Ready 模型不可變更。'); END;
CREATE TRIGGER IF NOT EXISTS revision_ready_delete BEFORE DELETE ON model_revisions
WHEN OLD.status = 'Ready'
BEGIN SELECT RAISE(ABORT, 'Ready 模型不可刪除。'); END;
CREATE TRIGGER IF NOT EXISTS validation_build_update BEFORE UPDATE ON validation_builds
BEGIN SELECT RAISE(ABORT, '驗證證據不可覆寫。'); END;
CREATE TRIGGER IF NOT EXISTS validation_build_delete BEFORE DELETE ON validation_builds
BEGIN SELECT RAISE(ABORT, '驗證證據不可刪除。'); END;
