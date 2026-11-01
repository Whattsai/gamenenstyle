CREATE TABLE auth_accounts (
  account_id TEXT NOT NULL PRIMARY KEY,
  email_normalized TEXT NOT NULL UNIQUE,
  email_verified_at INTEGER NOT NULL,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  credential_version INTEGER NOT NULL DEFAULT 1 CHECK (credential_version >= 1),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE auth_external_identities (
  identity_id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
  provider TEXT NOT NULL CHECK (length(provider) BETWEEN 1 AND 64),
  subject TEXT NOT NULL COLLATE BINARY CHECK (length(subject) BETWEEN 1 AND 512),
  created_at INTEGER NOT NULL,
  UNIQUE (provider, subject),
  UNIQUE (account_id, provider)
);

CREATE TABLE auth_sessions (
  session_id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
  client_platform TEXT NOT NULL CHECK (client_platform IN ('web', 'ios', 'android')),
  credential_version INTEGER NOT NULL CHECK (credential_version >= 1),
  current_generation INTEGER NOT NULL DEFAULT 0 CHECK (current_generation >= 0),
  created_at INTEGER NOT NULL,
  absolute_expires_at INTEGER NOT NULL CHECK (absolute_expires_at > created_at),
  idle_expires_at INTEGER NOT NULL CHECK (idle_expires_at > created_at AND idle_expires_at <= absolute_expires_at),
  revoked_at INTEGER,
  revocation_reason TEXT
);
CREATE INDEX idx_auth_sessions_account ON auth_sessions(account_id);
CREATE UNIQUE INDEX idx_auth_sessions_active_account ON auth_sessions(account_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_auth_sessions_expiry ON auth_sessions(absolute_expires_at);

CREATE TABLE auth_refresh_tokens (
  token_id TEXT NOT NULL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES auth_sessions(session_id),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  generation INTEGER NOT NULL CHECK (generation >= 0),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at),
  consumed_at INTEGER,
  replaced_by_token_id TEXT REFERENCES auth_refresh_tokens(token_id),
  UNIQUE (session_id, generation)
);

CREATE TABLE auth_email_challenges (
  challenge_id TEXT NOT NULL PRIMARY KEY,
  purpose TEXT NOT NULL CHECK (purpose IN ('register_email', 'reset_password')),
  email_normalized TEXT NOT NULL,
  client_platform TEXT NOT NULL CHECK (client_platform IN ('web', 'ios', 'android')),
  flow_token_hash TEXT NOT NULL UNIQUE CHECK (length(flow_token_hash) = 64),
  code_mac TEXT CHECK (code_mac IS NULL OR length(code_mac) = 64),
  generation INTEGER NOT NULL DEFAULT 0 CHECK (generation >= 0),
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts BETWEEN 0 AND 5),
  account_id TEXT REFERENCES auth_accounts(account_id),
  bound_credential_version INTEGER,
  state TEXT NOT NULL CHECK (state IN ('active', 'consumed', 'locked', 'expired')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  absolute_expires_at INTEGER NOT NULL CHECK (absolute_expires_at > created_at),
  resend_after INTEGER NOT NULL,
  consumed_at INTEGER,
  CHECK (expires_at > created_at AND expires_at <= absolute_expires_at)
);
CREATE INDEX idx_auth_email_challenges_email_purpose ON auth_email_challenges(email_normalized, purpose);
CREATE INDEX idx_auth_email_challenges_expiry ON auth_email_challenges(absolute_expires_at);

CREATE TABLE common_rate_limit_buckets (
  bucket_id TEXT NOT NULL PRIMARY KEY,
  policy_key TEXT NOT NULL,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('email', 'ip', 'account', 'session')),
  subject_hash TEXT NOT NULL CHECK (length(subject_hash) = 64),
  window_start INTEGER NOT NULL,
  attempt_count INTEGER NOT NULL CHECK (attempt_count >= 1),
  expires_at INTEGER NOT NULL CHECK (expires_at > window_start),
  UNIQUE (policy_key, subject_type, subject_hash, window_start)
);
CREATE INDEX idx_common_rate_limit_buckets_expiry ON common_rate_limit_buckets(expires_at);

