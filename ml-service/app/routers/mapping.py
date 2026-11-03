from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.search import search_similar_icd11, get_db_connection

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

@router.post("/api/map", response_model=MapResponse)
def map_term(request: MapRequest):
    if not request.term.strip():
        raise HTTPException(status_code=400, detail="Search term cannot be empty")
        
    candidates = search_similar_icd11(request.term, top_k=5)
    return MapResponse(query=request.term, results=candidates)

@router.post("/api/review")
def save_review(feedback: ReviewFeedback):
    if feedback.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")
        
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Use UPSERT to update the status if the expert changes their mind
        sql = """
            INSERT INTO mapping_reviews 
            (namaste_term, icd11_code, icd11_term, tradition, confidence_score, status) 
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (namaste_term, icd11_code) 
            DO UPDATE SET 
                status = EXCLUDED.status,
                confidence_score = EXCLUDED.confidence_score,
                reviewed_at = NOW();
        """
        cur.execute(sql, (
            feedback.namaste_term, 
            feedback.icd11_code, 
            feedback.icd11_term, 
            feedback.tradition, 
            feedback.confidence_score, 
            feedback.status
        ))
        conn.commit()
        return {"message": f"Mapping {feedback.status.lower()} successfully."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

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