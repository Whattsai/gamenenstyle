-- MatchingSessions 四張業務表，既有認證／個資 schema 不變，零 Trigger。
CREATE TABLE match_conditions (
 condition_id TEXT NOT NULL PRIMARY KEY,
 account_id TEXT NOT NULL UNIQUE REFERENCES auth_accounts(account_id),
 gender TEXT NOT NULL CHECK(gender IN ('male','female','diverse')),
 romantic_orientation_json TEXT NOT NULL CHECK(romantic_orientation_json IN ('["diverse"]','["female"]','["male"]','["diverse","female"]','["diverse","male"]','["female","male"]','["diverse","female","male"]')),
 birth_date TEXT NOT NULL CHECK(length(birth_date)=10),
 region_code TEXT,
 interests_json TEXT NOT NULL CHECK(json_valid(interests_json) AND json_type(interests_json)='object'),
 preferences_json TEXT NOT NULL CHECK(json_valid(preferences_json) AND json_type(preferences_json)='object'),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL CHECK(updated_at>=created_at)
);
CREATE TABLE match_invitations (
 invitation_id TEXT NOT NULL PRIMARY KEY,
 account_low_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 account_high_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 initiator_account_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 client_request_id TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','cancelled','expired','invalidated')),
 invalidated_reason TEXT,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL CHECK(expires_at>created_at),
 updated_at INTEGER NOT NULL CHECK(updated_at>=created_at),
 responded_at INTEGER,
 UNIQUE(initiator_account_id,client_request_id),
 CHECK(account_low_id < account_high_id COLLATE BINARY),
 CHECK(initiator_account_id IN (account_low_id,account_high_id)),
 CHECK((status='invalidated' AND invalidated_reason IS NOT NULL AND invalidated_reason IN ('other_round_started','eligibility_changed')) OR (status<>'invalidated' AND invalidated_reason IS NULL))
);
CREATE UNIQUE INDEX idx_match_pending_pair ON match_invitations(account_low_id,account_high_id) WHERE status='pending';
CREATE INDEX idx_match_invitation_low ON match_invitations(account_low_id,status);
CREATE INDEX idx_match_invitation_high ON match_invitations(account_high_id,status);
CREATE INDEX idx_match_invitation_expiry ON match_invitations(status,expires_at);
CREATE TABLE game_rounds (
 round_id TEXT NOT NULL PRIMARY KEY,
 invitation_id TEXT NOT NULL UNIQUE REFERENCES match_invitations(invitation_id),
 account_low_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 account_high_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
 status TEXT NOT NULL CHECK(status IN ('active','ended')),
 started_at INTEGER NOT NULL,
 ended_at INTEGER,
 CHECK(account_low_id < account_high_id COLLATE BINARY),
 CHECK((status='active' AND ended_at IS NULL) OR (status='ended' AND ended_at IS NOT NULL AND ended_at>=started_at))
);
CREATE INDEX idx_game_round_pair ON game_rounds(account_low_id,account_high_id,status);
CREATE TABLE game_round_participants (
 participant_id TEXT NOT NULL PRIMARY KEY,
 account_id TEXT NOT NULL UNIQUE REFERENCES auth_accounts(account_id),
 round_id TEXT NOT NULL REFERENCES game_rounds(round_id),
 created_at INTEGER NOT NULL
);
CREATE INDEX idx_game_round_participants_round ON game_round_participants(round_id);
