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
    """
    Vector search integrated with Phase 8 Multi-Signal Patent Formula.
    """
    query_vector = generate_embedding(query_term)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Fetch top 15 by raw vector distance first, so we have a pool to re-score
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
            SELECT code, term, 1 - (embedding <=> %s::vector) AS semantic_similarity 
            FROM icd_targets
            WHERE code NOT IN (SELECT icd11_code FROM rejected_codes)
            ORDER BY embedding <=> %s::vector 
            LIMIT 15;
        """
        
        cur.execute(sql, (query_term, str(query_vector), str(query_vector)))
        results = cur.fetchall()
        
        # Apply the R = f(S, A, M, C) formula to each result
        scored_candidates = []
        for row in results:
            code = row[0]
            target_term = row[1]
            raw_semantic_score = row[2]
            
            # Basic tradition match heuristic (can be expanded based on your clinical data)
            # Assuming Ayurveda terms often map well to general TM2 patterns
            is_tradition_match = True if tradition != "Unknown" else False
            
            final_score = compute_confidence(
                semantic_score=raw_semantic_score,
                tradition_match=is_tradition_match,
                source_term=query_term,
                target_term=target_term
            )
            
            scored_candidates.append({
                "code": code,
                "term": target_term,
                "confidence": final_score,
                "raw_semantic": round(raw_semantic_score, 4) # Kept for debugging
            })
            
        # Re-sort the candidates based on the new composite formula score
        scored_candidates.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Return only the top K requested by the user
        return scored_candidates[:top_k]
        
    finally:
        cur.close()
        conn.close()