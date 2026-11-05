-- AvatarAndPreferences: 僅兩張 user_ 表，完整保留 PlatformFoundation 既有六表。
-- 限額、owner 及狀態轉移由受控 prepared commands 保證，不建立 SQL Trigger。
CREATE TABLE user_profiles (
  profile_id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE REFERENCES auth_accounts(account_id),
  nickname TEXT NOT NULL DEFAULT '' CHECK (length(nickname) <= 12),
  bio TEXT NOT NULL DEFAULT '' CHECK (length(bio) <= 40),
  occupation TEXT CHECK (occupation IS NULL OR length(trim(occupation)) BETWEEN 1 AND 60),
  birth_date TEXT CHECK (birth_date IS NULL OR length(birth_date) = 10),
  region_code TEXT CHECK (region_code IS NULL OR length(region_code) BETWEEN 1 AND 16),
  traits_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(traits_json) AND json_type(traits_json) = 'array'),
  interests_json TEXT NOT NULL DEFAULT '{"interestTagIds":[],"topicTagIds":[],"valueTagIds":[]}'
    CHECK (json_valid(interests_json) AND json_type(interests_json) = 'object'),
  preferences_json TEXT NOT NULL DEFAULT '{}'
    CHECK (json_valid(preferences_json) AND json_type(preferences_json) = 'object'),
  selected_avatar_type TEXT CHECK (selected_avatar_type IN ('builtin','generated')),
  selected_avatar_ref TEXT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL CHECK (updated_at >= created_at),
  CHECK (
    (selected_avatar_type IS NULL AND selected_avatar_ref IS NULL)
    OR (selected_avatar_type IS NOT NULL AND selected_avatar_ref IS NOT NULL
      AND length(selected_avatar_ref) BETWEEN 1 AND 80)
  )
);

CREATE TABLE user_media_assets (
  asset_id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
  kind TEXT NOT NULL CHECK (kind IN ('personal_photo','generated_avatar')),
  object_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  display_order INTEGER CHECK (display_order >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','deleted')),
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  CHECK (
    (kind = 'personal_photo' AND display_order IS NOT NULL)
    OR (kind = 'generated_avatar' AND display_order IS NULL)
  ),
  CHECK (
    (status = 'deleted' AND deleted_at IS NOT NULL AND deleted_at >= created_at)
    OR (status IN ('pending','ready') AND deleted_at IS NULL)
  )
);

CREATE INDEX idx_user_media_owner_kind_status_order
  ON user_media_assets(account_id, kind, status, display_order);
