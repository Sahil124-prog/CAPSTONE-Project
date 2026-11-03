ALTER TABLE terminology_concepts 
ADD COLUMN embedding vector(384);

CREATE INDEX idx_terminology_concepts_embedding 
ON terminology_concepts USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);