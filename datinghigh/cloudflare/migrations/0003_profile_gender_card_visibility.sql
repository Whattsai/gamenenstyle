-- 2026-11-05：向前升級，保留既有資料；未填性別不可推測。
ALTER TABLE user_profiles ADD COLUMN gender TEXT CHECK (gender IS NULL OR gender IN ('male','female','diverse'));
ALTER TABLE user_profiles ADD COLUMN romantic_orientation_json TEXT NOT NULL DEFAULT '[]'
  CHECK (json_valid(romantic_orientation_json) AND json_type(romantic_orientation_json) = 'array');
ALTER TABLE user_profiles ADD COLUMN card_visibility_json TEXT NOT NULL DEFAULT '{}'
  CHECK (json_valid(card_visibility_json) AND json_type(card_visibility_json) = 'object');
