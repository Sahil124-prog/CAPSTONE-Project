import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.search import search_similar_icd11, get_db_connection
import os
from fastapi import HTTPException
router = APIRouter()

class MapRequest(BaseModel):
    term: str
    tradition: str = "Unknown"

class Candidate(BaseModel):
    code: str
    term: str
    confidence: float

class MapResponse(BaseModel):
    query: str
    results: list[Candidate]

class ReviewFeedback(BaseModel):
    namaste_term: str
    icd11_code: str
    icd11_term: str
    tradition: str
    confidence_score: float
    status: str

@router.post("/api/map")
def map_term(request: MapRequest):
    if not request.term.strip():
        raise HTTPException(status_code=400, detail="Search term cannot be empty")
        
    candidates = search_similar_icd11(request.term, top_k=5)
    
    # --- PHASE 5: File-Based Diagnostic Logger ---
    status_file = os.path.join(os.getcwd(), "db_status.txt")
    
    try:
        first = candidates[0] if candidates else None
        if isinstance(first, dict):
            top_code = first.get("code")
            raw_conf = first.get("confidence", first.get("score", 0.0))
        elif first:
            top_code = getattr(first, "code", None)
            raw_conf = getattr(first, "confidence", getattr(first, "score", 0.0))
        else:
            top_code = None
            raw_conf = 0.0
            
        top_conf = round(float(raw_conf), 3)
            
        conn = get_db_connection()
        cur = conn.cursor()
        
        trad = getattr(request, "tradition", "Ayurveda")
        
        # Pass tradition down to the search engine for the scoring formula
        candidates = search_similar_icd11(request.term, tradition=trad, top_k=5)
        
        cur.execute("""
            INSERT INTO query_log (search_term, tradition, matched_code, confidence)
            VALUES (%s, %s, %s, %s)
        """, (request.term, trad, top_code, top_conf))
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Log undeniable success to file
        with open(status_file, "w") as f:
            f.write(f"SUCCESS: Successfully saved '{request.term}' to the database!")
            
    except Exception as e:
        # Log the exact PostgreSQL error to file
        with open(status_file, "w") as f:
            f.write(f"DATABASE CRASH ERROR:\n{str(e)}")
    # ----------------------------------------
        
    return {"query": request.term, "results": candidates}

@router.get("/api/reviews")
def get_reviews():
    """
    Fetches all expert reviews from the database to build the Gold Set.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        sql = """
            SELECT id, namaste_term, icd11_code, icd11_term, tradition, confidence_score, status, reviewed_at
            FROM mapping_reviews 
            ORDER BY reviewed_at DESC;
        """
        cur.execute(sql)
        results = cur.fetchall()
        
        reviews = []
        for row in results:
            reviews.append({
                "id": row[0],
                "namaste_term": row[1],
                "icd11_code": row[2],
                "icd11_term": row[3],
                "tradition": row[4],
                "confidence_score": float(row[5]) if row[5] else 0.0,
                "status": row[6],
                "reviewed_at": row[7].isoformat() if row[7] else None
            })
        return {"reviews": reviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/api/priority/unreviewed")
def get_unreviewed_priority():
    """
    Returns the top 50 most frequently searched NAMASTE terms 
    that do NOT yet have an APPROVED mapping in the Gold Set.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        sql = """
            SELECT ql.search_term, MAX(ql.tradition) as tradition, COUNT(*) as query_count
            FROM query_log ql
            LEFT JOIN mapping_reviews mr 
              ON mr.namaste_term ILIKE ql.search_term AND mr.status = 'APPROVED'
            WHERE mr.id IS NULL
            GROUP BY ql.search_term
            ORDER BY query_count DESC
            LIMIT 50;
        """
        cur.execute(sql)
        rows = cur.fetchall()
        
        queue = []
        for row in rows:
            queue.append({
                "term": row[0],
                "tradition": row[1],
                "query_count": row[2]
            })
        return {"unreviewed": queue}
    finally:
        cur.close()
        conn.close()
        
@router.post("/api/review")
def submit_review(feedback: ReviewFeedback):
    """
    Receives APPROVED or REJECTED feedback from the Admin/Expert UI 
    and saves it to the mapping_reviews table.
    """
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO mapping_reviews 
            (namaste_term, icd11_code, icd11_term, tradition, confidence_score, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            feedback.namaste_term,
            feedback.icd11_code,
            feedback.icd11_term,
            feedback.tradition,
            feedback.confidence_score,
            feedback.status
        ))
        return {"message": f"Successfully recorded {feedback.status} for {feedback.namaste_term}"}
    except Exception as e:
        import logging
        logging.error(f"Failed to save review: {e}")
        raise HTTPException(status_code=500, detail="Database insertion failed")
    finally:
        cur.close()
        conn.close()
        
