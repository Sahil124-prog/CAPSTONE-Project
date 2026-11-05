import os
import psycopg2
from app.embeddings.embedder import generate_embedding
from app.scoring.formula import compute_confidence

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "127.0.0.1"),
        port=os.environ.get("DB_PORT", "5433"),
        dbname=os.environ.get("DB_NAME", "ayulink"),
        user=os.environ.get("DB_USER", "ayulink"),
        password=os.environ.get("DB_PASSWORD", "change_me")
    )

def search_similar_icd11(query_term: str, tradition: str = "Ayurveda", top_k: int = 5):
    query_vector = generate_embedding(query_term)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Added LEFT JOIN to fetch the ICD-10 crosswalk code
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
            SELECT t.code, t.term, 1 - (t.embedding <=> %s::vector) AS semantic_similarity, cw.icd10_code 
            FROM icd_targets t
            LEFT JOIN icd_crosswalk cw ON t.code = cw.icd11_code
            WHERE t.code NOT IN (SELECT icd11_code FROM rejected_codes)
            ORDER BY t.embedding <=> %s::vector 
            LIMIT 15;
        """
        
        cur.execute(sql, (query_term, str(query_vector), str(query_vector)))
        results = cur.fetchall()
        
        scored_candidates = []
        for row in results:
            code = row[0]
            target_term = row[1]
            raw_semantic_score = row[2]
            icd10_crosswalk = row[3] if row[3] else "N/A" # Default if no ICD-10 mapping exists
            
            is_tradition_match = True if tradition != "Unknown" else False
            
            final_score = compute_confidence(
                semantic_score=raw_semantic_score,
                tradition_match=is_tradition_match,
                source_term=query_term,
                target_term=target_term
            )
            
            scored_candidates.append({
                "code": code,
                "icd10_code": icd10_crosswalk,
                "term": target_term,
                "confidence": final_score,
                "raw_semantic": round(raw_semantic_score, 4)
            })
            
        scored_candidates.sort(key=lambda x: x["confidence"], reverse=True)
        return scored_candidates[:top_k]
        
    finally:
        cur.close()
        conn.close()