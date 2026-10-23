CREATE TABLE IF NOT EXISTS connected_accounts (
 id BIGSERIAL PRIMARY KEY, platform TEXT NOT NULL CHECK(platform IN ('youtube','tiktok','facebook')),
 platform_user_id TEXT NOT NULL, display_name TEXT NOT NULL DEFAULT '',
 access_token_enc TEXT NOT NULL, refresh_token_enc TEXT, token_expires_at TIMESTAMPTZ,
 scopes TEXT[] NOT NULL DEFAULT '{}', metadata JSONB NOT NULL DEFAULT '{}',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(platform,platform_user_id));
CREATE TABLE IF NOT EXISTS videos (
 id UUID PRIMARY KEY, original_name TEXT NOT NULL, stored_name TEXT NOT NULL UNIQUE,
 mime_type TEXT NOT NULL, size_bytes BIGINT NOT NULL, sha256 TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS publish_jobs (
 id UUID PRIMARY KEY, video_id UUID NOT NULL REFERENCES videos(id), platform TEXT NOT NULL CHECK(platform IN ('youtube','tiktok','facebook')),
 account_id BIGINT REFERENCES connected_accounts(id) ON DELETE SET NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 tags TEXT[] NOT NULL DEFAULT '{}', privacy TEXT NOT NULL DEFAULT 'private', scheduled_at TIMESTAMPTZ,
 status TEXT NOT NULL CHECK(status IN ('queued','uploading','processing','succeeded','failed','cancelled')),
 platform_post_id TEXT, platform_status TEXT, error_code TEXT, error_message TEXT, attempts INTEGER NOT NULL DEFAULT 0,
 idempotency_key TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), completed_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS publish_jobs_due_idx ON publish_jobs(status,scheduled_at,created_at);
