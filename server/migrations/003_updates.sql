-- 003_updates.sql
-- Migration to create the updates table for version management

CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  release_date TIMESTAMPTZ,
  changelog TEXT[] NOT NULL DEFAULT '{}',
  fixes TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft','scheduled','published','cancelled')),
  scheduled_at TIMESTAMPTZ,
  notes_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup of latest published version
CREATE INDEX IF NOT EXISTS idx_updates_status_version ON updates (status, version DESC);
