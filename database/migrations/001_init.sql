CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS terminology_releases (
  id           SERIAL PRIMARY KEY,
  system       TEXT NOT NULL CHECK (system IN ('NAMASTE', 'ICD11_TM2')),
  version      TEXT NOT NULL,
  imported_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (system, version)
);

CREATE TABLE IF NOT EXISTS terminology_concepts (
  id               SERIAL PRIMARY KEY,
  release_id       INT NOT NULL REFERENCES terminology_releases(id) ON DELETE CASCADE,
  code             TEXT NOT NULL,
  term             TEXT NOT NULL,
  normalized_term  TEXT,
  description      TEXT,
  tradition        TEXT,
  UNIQUE (release_id, code)
);

