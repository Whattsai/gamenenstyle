-- 未上線的單線故事只允許由已識別 local wrapper 停寫、備份後清除。
-- 不解釋舊節點、不搬移舊答案，Foundation／Profile／媒體結構保持。
SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_rounds)
 AND NOT EXISTS(SELECT 1 FROM game_story_sessions)
 AND NOT EXISTS(SELECT 1 FROM game_scene_visits)
 AND NOT EXISTS(SELECT 1 FROM game_event_instances)
 AND NOT EXISTS(SELECT 1 FROM game_interaction_instances)
 THEN 1 ELSE json('SCENE_TRACKS_REQUIRE_EXPLICIT_LOCAL_REBUILD') END;

DROP TABLE game_interaction_instances;
ALTER TABLE game_story_sessions DROP COLUMN current_node_id;
ALTER TABLE game_story_sessions RENAME COLUMN progress_revision TO shared_revision;
ALTER TABLE game_story_sessions ADD COLUMN world_state_json TEXT NOT NULL DEFAULT '{}'
 CHECK(json_valid(world_state_json) AND json_type(world_state_json)='object' AND length(world_state_json)<=16384);

CREATE TABLE game_story_participant_progress (
 story_session_id TEXT NOT NULL REFERENCES game_story_sessions(story_session_id),
 account_id TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('inviter','acceptor')),
 current_node_id TEXT NOT NULL,
 current_area_id TEXT NOT NULL,
 revision INTEGER NOT NULL CHECK(revision>=1),
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(story_session_id,account_id),
 UNIQUE(story_session_id,role)
);

DROP TABLE game_event_instances;
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
 track_scope TEXT NOT NULL CHECK(track_scope IN ('inviter','acceptor','shared')),
 UNIQUE(story_session_id,binding_id,track_scope),
 CHECK((status='active' AND completed_at IS NULL) OR (status IN ('completed','cancelled') AND completed_at IS NOT NULL AND completed_at>=created_at))
);
CREATE INDEX idx_game_event_repeat ON game_event_instances(repeat_group,track_scope,status,story_session_id);
CREATE INDEX idx_game_event_session_status ON game_event_instances(story_session_id,status);
DROP INDEX idx_game_vote_episode;
