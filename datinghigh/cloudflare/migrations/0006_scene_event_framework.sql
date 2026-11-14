-- 新框架向前升級；非空舊遊戲只能經已識別 local wrapper 備份後清除，不能直接重新解釋 ID。
-- 舊候選是 StoryCatalog，不得把存量 ID 當成 Category。非空資料保留並拒絕升級。
SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_rounds)
 THEN 1 ELSE json('SCENE_FRAMEWORK_REQUIRES_EXPLICIT_OLD_GAME_MIGRATION') END;

CREATE TABLE content_story_categories (
 category_id TEXT NOT NULL PRIMARY KEY,
 code TEXT NOT NULL,
 version TEXT NOT NULL,
 title TEXT NOT NULL,
 interest_tag_ids_json TEXT NOT NULL CHECK(json_valid(interest_tag_ids_json) AND json_type(interest_tag_ids_json)='array'),
 recommendation_priority INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('draft','published','retired')),
 published_at INTEGER,
 UNIQUE(code,version)
);
CREATE UNIQUE INDEX idx_content_category_published ON content_story_categories(code) WHERE status='published';

CREATE TABLE content_scene_catalog (
 scene_catalog_id TEXT NOT NULL PRIMARY KEY,
 scene_id TEXT NOT NULL,
 version TEXT NOT NULL,
 title TEXT NOT NULL,
 manifest_key TEXT NOT NULL UNIQUE,
 manifest_sha256 TEXT NOT NULL CHECK(length(manifest_sha256)=64 AND manifest_sha256 NOT GLOB '*[^0-9a-f]*'),
 status TEXT NOT NULL CHECK(status IN ('draft','published','retired')),
 published_at INTEGER,
 UNIQUE(scene_id,version)
);
CREATE UNIQUE INDEX idx_content_scene_published ON content_scene_catalog(scene_id) WHERE status='published';

CREATE TABLE content_scene_category_links (
 scene_catalog_id TEXT NOT NULL REFERENCES content_scene_catalog(scene_catalog_id),
 category_id TEXT NOT NULL REFERENCES content_story_categories(category_id),
 PRIMARY KEY(scene_catalog_id,category_id)
);

ALTER TABLE content_story_catalog ADD COLUMN scene_catalog_id TEXT REFERENCES content_scene_catalog(scene_catalog_id);
ALTER TABLE content_story_catalog ADD COLUMN sequence_group_id TEXT;
ALTER TABLE content_story_catalog ADD COLUMN sequence_order INTEGER CHECK((sequence_group_id IS NULL AND sequence_order IS NULL) OR (sequence_group_id IS NOT NULL AND sequence_order IS NOT NULL AND sequence_order>=1));
ALTER TABLE content_story_catalog ADD COLUMN prerequisites_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(prerequisites_json) AND json_type(prerequisites_json)='array');
ALTER TABLE game_rounds RENAME COLUMN story_offer_catalog_ids_json TO story_offer_category_ids_json;
ALTER TABLE game_story_sessions ADD COLUMN selected_category_id TEXT REFERENCES content_story_categories(category_id);
UPDATE content_story_catalog SET status='retired' WHERE scene_catalog_id IS NULL AND status='published';
CREATE INDEX idx_content_story_scene_status ON content_story_catalog(scene_catalog_id,status);
CREATE INDEX idx_content_story_sequence ON content_story_catalog(sequence_group_id,sequence_order);
CREATE INDEX idx_scene_category_reverse ON content_scene_category_links(category_id,scene_catalog_id);

CREATE TABLE game_scene_visits (
 scene_visit_id TEXT NOT NULL PRIMARY KEY,
 story_session_id TEXT NOT NULL REFERENCES game_story_sessions(story_session_id),
 visit_seq INTEGER NOT NULL CHECK(visit_seq=1),
 scene_catalog_id TEXT NOT NULL REFERENCES content_scene_catalog(scene_catalog_id),
 entered_at INTEGER NOT NULL,
 left_at INTEGER CHECK(left_at IS NULL OR left_at>=entered_at),
 UNIQUE(story_session_id,visit_seq)
);

CREATE TABLE game_event_instances (
 event_instance_id TEXT NOT NULL PRIMARY KEY,
 story_session_id TEXT NOT NULL REFERENCES game_story_sessions(story_session_id),
 binding_id TEXT NOT NULL,
 event_id TEXT NOT NULL,
 event_version TEXT NOT NULL,
 repeat_group TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('active','completed','cancelled')),
 state_json TEXT NOT NULL CHECK(json_valid(state_json) AND json_type(state_json)='object' AND length(state_json)<=16384),
 revision INTEGER NOT NULL CHECK(revision>=1),
 created_at INTEGER NOT NULL,
 completed_at INTEGER,
 UNIQUE(story_session_id,binding_id),
 CHECK((status='active' AND completed_at IS NULL) OR (status IN ('completed','cancelled') AND completed_at IS NOT NULL AND completed_at>=created_at))
);
CREATE INDEX idx_game_event_repeat ON game_event_instances(repeat_group,status,story_session_id);
CREATE INDEX idx_game_event_session_status ON game_event_instances(story_session_id,status);
CREATE INDEX idx_game_category_vote_episode ON game_round_events(round_id,json_extract(payload_json,'$.episodeSeq'),actor_account_id,sequence DESC) WHERE kind='story.category.vote.submitted';
CREATE UNIQUE INDEX idx_game_episode_offers ON game_round_events(round_id,json_extract(payload_json,'$.episodeSeq')) WHERE kind='story.episode.offers.frozen';
