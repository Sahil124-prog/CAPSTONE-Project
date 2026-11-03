CREATE TABLE IF NOT EXISTS mapping_reviews (
    id SERIAL PRIMARY KEY,
    namaste_term TEXT NOT NULL,
    icd11_code TEXT NOT NULL,
    icd11_term TEXT NOT NULL,
    tradition TEXT NOT NULL,
    confidence_score NUMERIC(5,4),
    status TEXT CHECK (status IN ('APPROVED', 'REJECTED')),
    reviewed_by TEXT DEFAULT 'expert',
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);