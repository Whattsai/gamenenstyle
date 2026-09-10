PRAGMA foreign_keys=ON;
PRAGMA journal_mode=DELETE;
CREATE TABLE runtime_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE runtime_snapshots(snapshot_id TEXT PRIMARY KEY,baseline_at TEXT NOT NULL,coverage_json TEXT NOT NULL,schema_version INTEGER NOT NULL);
CREATE TABLE runtime_revisions(variant_id TEXT NOT NULL,revision_id TEXT NOT NULL UNIQUE,PRIMARY KEY(variant_id,revision_id));
CREATE TABLE runtime_variants(snapshot_id TEXT NOT NULL REFERENCES runtime_snapshots,variant_id TEXT NOT NULL,part_id TEXT NOT NULL,
    production_status TEXT NOT NULL CHECK(production_status IN ('Active','Retired','Unknown')),
    tier TEXT NOT NULL CHECK(tier IN ('Basic','Advanced','Special')),display_json TEXT NOT NULL,usage_json TEXT NOT NULL,selected_revision_id TEXT NOT NULL,
    PRIMARY KEY(snapshot_id,variant_id),FOREIGN KEY(variant_id,selected_revision_id) REFERENCES runtime_revisions(variant_id,revision_id));
CREATE TABLE runtime_builds(runtime_build_id TEXT PRIMARY KEY,variant_id TEXT NOT NULL,source_revision_id TEXT NOT NULL,
    build_target TEXT NOT NULL,editor_version TEXT NOT NULL,package_lock_digest TEXT NOT NULL,coordinate_profile TEXT NOT NULL,
    content_digest TEXT NOT NULL,validation_digest TEXT NOT NULL,bundle_key TEXT NOT NULL,
    FOREIGN KEY(variant_id,source_revision_id) REFERENCES runtime_revisions(variant_id,revision_id),
    UNIQUE(runtime_build_id,variant_id,source_revision_id,build_target));
CREATE TABLE runtime_models(snapshot_id TEXT NOT NULL,variant_id TEXT NOT NULL,revision_id TEXT NOT NULL,build_target TEXT NOT NULL,
    runtime_build_id TEXT NOT NULL,metadata_json TEXT NOT NULL,address_key TEXT NOT NULL,
    PRIMARY KEY(snapshot_id,variant_id,revision_id,build_target),
    FOREIGN KEY(snapshot_id,variant_id) REFERENCES runtime_variants(snapshot_id,variant_id),
    FOREIGN KEY(variant_id,revision_id) REFERENCES runtime_revisions(variant_id,revision_id),
    FOREIGN KEY(runtime_build_id,variant_id,revision_id,build_target) REFERENCES runtime_builds(runtime_build_id,variant_id,source_revision_id,build_target));
CREATE TABLE runtime_files(storage_key TEXT PRIMARY KEY,sha256 TEXT NOT NULL,byte_length INTEGER NOT NULL CHECK(byte_length>=0),kind TEXT NOT NULL);
CREATE TABLE runtime_profiles(snapshot_id TEXT NOT NULL REFERENCES runtime_snapshots,profile_id TEXT NOT NULL,definition_json TEXT NOT NULL,PRIMARY KEY(snapshot_id,profile_id));
CREATE INDEX ix_runtime_variants_status ON runtime_variants(snapshot_id,production_status,variant_id);
