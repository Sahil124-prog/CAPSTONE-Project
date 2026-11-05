docker exec -i ayulink-db psql -U ayulink -d ayulink -c "
CREATE TABLE IF NOT EXISTS icd_crosswalk (
    icd11_code TEXT PRIMARY KEY,
    icd10_code TEXT NOT NULL
);

INSERT INTO icd_crosswalk (icd11_code, icd10_code) VALUES 
('SS50', 'E46.0'), 
('SS5B', 'R50.9'), 
('SK93', 'J31.0'), 
('SM16', 'K11.7'),
('SS55', 'E46.1')
ON CONFLICT DO NOTHING;
"