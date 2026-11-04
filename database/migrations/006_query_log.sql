CREATE TABLE IF NOT EXISTS query_log (
  id          SERIAL PRIMARY KEY,
  search_term TEXT NOT NULL,
  tradition   TEXT,
  matched_code TEXT,
  confidence  NUMERIC(4,3),
  queried_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast frequency queries when calculating the priority queue
CREATE INDEX idx_query_log_term ON query_log(search_term);

