-- 1. Remove duplicate reviews, keeping only the latest one for each pair
DELETE FROM mapping_reviews
WHERE id NOT IN (
    SELECT MAX(id)
    FROM mapping_reviews
    GROUP BY namaste_term, icd11_code
);

-- 2. Enforce unique constraint so a specific term + code pair can only have one active review
ALTER TABLE mapping_reviews
ADD CONSTRAINT unique_mapping_pair UNIQUE (namaste_term, icd11_code);