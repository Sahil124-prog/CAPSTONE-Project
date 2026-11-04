import os
import psycopg2
from app.embeddings.embedder import generate_embedding

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "127.0.0.1"),
        port=os.environ.get("DB_PORT", "5433"),
        dbname=os.environ.get("DB_NAME", "ayulink"),
        user=os.environ.get("DB_USER", "ayulink"),
        password=os.environ.get("DB_PASSWORD", "change_me")  # Updated password here
    )

def search_similar_icd11(query_term: str, top_k: int = 5):
    """
    Embeds the input term and finds the closest ICD-11 TM2 matches using pgvector cosine distance,
    while actively filtering out any codes the experts have previously rejected for this term.
    """
    query_vector = generate_embedding(query_term)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 1. Fetch rejections for this term
        # 2. Materialize the TM2 codes
        # 3. Calculate distance ONLY for non-rejected codes
        sql = """
            WITH rejected_codes AS (
                SELECT icd11_code FROM mapping_reviews 
                WHERE namaste_term ILIKE %s AND status = 'REJECTED'
            ),
            icd_targets AS MATERIALIZED (
                SELECT c.code, c.term, c.embedding 
                FROM terminology_concepts c
                JOIN terminology_releases r ON c.release_id = r.id
                WHERE r.system = 'ICD11_TM2'
            )
            SELECT code, term, 1 - (embedding <=> %s::vector) AS similarity 
            FROM icd_targets
            WHERE code NOT IN (SELECT icd11_code FROM rejected_codes)
            ORDER BY embedding <=> %s::vector 
            LIMIT %s;
        """
        
        # Pass the original search term alongside the vectors
        cur.execute(sql, (query_term, str(query_vector), str(query_vector), top_k))
        results = cur.fetchall()
        
        candidates = []
        for row in results:
            candidates.append({
                "code": row[0],
                "term": row[1],
                "confidence": round(row[2], 4)
            })
        return candidates
    finally:
        cur.close()
        conn.close()