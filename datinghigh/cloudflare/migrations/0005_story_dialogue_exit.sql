-- 僅在受控 local wrapper 清空非正式舊遊戲資料後升級。非空直接失敗，絕不補假候選。
SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_rounds)
 AND NOT EXISTS(SELECT 1 FROM game_round_participants)
 AND NOT EXISTS(SELECT 1 FROM match_invitations)
 THEN 1 ELSE json('STORY_MIGRATION_REQUIRES_EMPTY_GAME_DATA') END;
ALTER TABLE game_round_participants RENAME TO game_active_round_claims;
DROP INDEX idx_game_round_participants_round;
CREATE INDEX idx_game_active_round_claims_round ON game_active_round_claims(round_id);
DROP TABLE game_rounds;
CREATE TABLE game_rounds (
 round_id TEXT NOT NULL PRIMARY KEY,
 invitation_id TEXT NOT NULL UNIQUE REFERENCES match_invitations(invitation_id),
 account_low_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 account_high_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 status TEXT NOT NULL CHECK(status IN ('active','ended')),
 started_at INTEGER NOT NULL,
 ended_at INTEGER,
 last_event_seq INTEGER NOT NULL DEFAULT 0 CHECK(last_event_seq>=0),
 story_offer_catalog_ids_json TEXT NOT NULL CHECK(json_valid(story_offer_catalog_ids_json) AND json_type(story_offer_catalog_ids_json)='array' AND json_array_length(story_offer_catalog_ids_json) BETWEEN 1 AND 3),
 CHECK(account_low_id < account_high_id COLLATE BINARY),
 CHECK((status='active' AND ended_at IS NULL) OR (status='ended' AND ended_at IS NOT NULL AND ended_at>=started_at))
);
CREATE INDEX idx_game_round_pair ON game_rounds(account_low_id,account_high_id,status);
CREATE TABLE content_story_catalog (
 catalog_id TEXT NOT NULL PRIMARY KEY,
 story_id TEXT NOT NULL,
 version TEXT NOT NULL,
 interest_tag_ids_json TEXT NOT NULL CHECK(json_valid(interest_tag_ids_json) AND json_type(interest_tag_ids_json)='array'),
 recommendation_priority INTEGER NOT NULL,
 manifest_key TEXT NOT NULL UNIQUE,
 manifest_sha256 TEXT NOT NULL CHECK(length(manifest_sha256)=64 AND manifest_sha256 NOT GLOB '*[^0-9a-f]*'),
 status TEXT NOT NULL CHECK(status IN ('draft','published','retired')),
 published_at INTEGER,
 UNIQUE(story_id,version)
);
CREATE UNIQUE INDEX idx_content_story_published ON content_story_catalog(story_id) WHERE status='published';
CREATE TABLE game_story_sessions (
 story_session_id TEXT NOT NULL PRIMARY KEY,
 round_id TEXT NOT NULL REFERENCES game_rounds(round_id),
 episode_seq INTEGER NOT NULL CHECK(episode_seq>=1),
 catalog_id TEXT NOT NULL REFERENCES content_story_catalog(catalog_id),
 current_node_id TEXT NOT NULL,
 chapter_status TEXT NOT NULL CHECK(chapter_status IN ('playing','completed')),
 progress_revision INTEGER NOT NULL CHECK(progress_revision>=1),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL CHECK(updated_at>=created_at),
 UNIQUE(round_id,episode_seq)
);
CREATE UNIQUE INDEX idx_game_story_playing ON game_story_sessions(round_id) WHERE chapter_status='playing';
CREATE TABLE game_round_events (
 event_id TEXT NOT NULL PRIMARY KEY,
 round_id TEXT NOT NULL REFERENCES game_rounds(round_id),
 sequence INTEGER NOT NULL CHECK(sequence>0),
 actor_account_id TEXT REFERENCES auth_accounts(account_id),
 client_request_id TEXT,
 kind TEXT NOT NULL,
 payload_json TEXT NOT NULL CHECK(json_valid(payload_json) AND json_type(payload_json)='object' AND length(payload_json)<=16384),
 created_at INTEGER NOT NULL,
 UNIQUE(round_id,sequence),
 UNIQUE(round_id,actor_account_id,client_request_id),
 CHECK((actor_account_id IS NULL AND client_request_id IS NULL) OR (actor_account_id IS NOT NULL AND client_request_id IS NOT NULL))
);
CREATE INDEX idx_game_events_kind_actor ON game_round_events(round_id,kind,actor_account_id,sequence DESC);
CREATE INDEX idx_game_vote_episode ON game_round_events(round_id,json_extract(payload_json,'$.episodeSeq'),actor_account_id,sequence DESC) WHERE kind='story.vote.submitted';
CREATE TABLE game_interaction_instances (
 interaction_instance_id TEXT NOT NULL PRIMARY KEY,
 story_session_id TEXT NOT NULL REFERENCES game_story_sessions(story_session_id),
 node_id TEXT NOT NULL,
 definition_id TEXT NOT NULL,
 definition_version TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('active','completed','cancelled')),
 state_json TEXT NOT NULL CHECK(json_valid(state_json) AND json_type(state_json)='object' AND length(state_json)<=16384),
 revision INTEGER NOT NULL CHECK(revision>=1),
 created_at INTEGER NOT NULL,
 completed_at INTEGER,
 UNIQUE(story_session_id,node_id,definition_id),
 CHECK((status='active' AND completed_at IS NULL) OR (status IN ('completed','cancelled') AND completed_at IS NOT NULL AND completed_at>=created_at))
);
