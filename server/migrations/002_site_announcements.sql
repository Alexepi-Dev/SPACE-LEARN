CREATE TABLE IF NOT EXISTS site_announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'update',
    'scheduled_maintenance',
    'maintenance_in_progress',
    'maintenance_completed',
    'incident'
  )),
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  critical BOOLEAN NOT NULL DEFAULT FALSE,
  areas TEXT[] NOT NULL DEFAULT ARRAY['site']::TEXT[],
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (cardinality(areas) > 0),
  CHECK (end_at IS NULL OR start_at IS NULL OR end_at > start_at),
  CHECK (status NOT IN ('scheduled', 'published') OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS site_announcements_public_idx
  ON site_announcements (published_at DESC)
  WHERE status IN ('scheduled', 'published');

CREATE TABLE IF NOT EXISTS site_maintenance (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  message_fr TEXT NOT NULL,
  message_en TEXT NOT NULL,
  estimated_end_at TIMESTAMPTZ,
  contact_email TEXT,
  updated_by TEXT NOT NULL DEFAULT 'system',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_maintenance (
  id,
  enabled,
  title_fr,
  title_en,
  message_fr,
  message_en
)
VALUES (
  1,
  FALSE,
  'Maintenance en cours',
  'Maintenance in progress',
  'Le site est temporairement indisponible pendant une intervention technique.',
  'The site is temporarily unavailable while we perform technical work.'
)
ON CONFLICT (id) DO NOTHING;
