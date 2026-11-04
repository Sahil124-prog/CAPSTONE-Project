from fastapi import APIRouter, HTTPException, Query
from app.core.search import get_db_connection

router = APIRouter(tags=["FHIR"])

@router.get("/fhir/ConceptMap")
def get_concept_map():
    """
    Returns the full FHIR R4 ConceptMap JSON for all expert-approved mappings.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT namaste_term, icd11_code, icd11_term, confidence_score 
            FROM mapping_reviews 
            WHERE status = 'APPROVED'
        """)
        rows = cur.fetchall()
        
        elements = []
        for row in rows:
            namaste_term, icd11_code, icd11_term, conf = row
            # Convert decimal to float safely
            confidence = float(conf) if conf else 0.0
            elements.append({
                "code": namaste_term,
                "display": namaste_term,
                "target": [{
                    "code": icd11_code,
                    "display": icd11_term,
                    "equivalence": "equivalent" if confidence >= 0.85 else "narrower"
                }]
            })

        concept_map = {
            "resourceType": "ConceptMap",
            "id": "namaste-to-icd11-tm2",
            "status": "active",
            "sourceUri": "http://ayulink.in/CodeSystem/namaste",
            "targetUri": "http://id.who.int/icd/release/11/2024-01/mms/tm2",
            "group": [{
                "source": "NAMASTE",
                "target": "ICD-11-TM2",
                "element": elements
            }]
        }
        return concept_map
    finally:
        cur.close()
        conn.close()

@router.get("/fhir/ConceptMap/$translate")
def translate_concept(code: str = Query(..., description="NAMASTE term to translate")):
    """
    Translates a specific NAMASTE term to its approved ICD-11 TM2 code via FHIR Parameters.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT icd11_code, icd11_term 
            FROM mapping_reviews 
            WHERE status = 'APPROVED' AND namaste_term ILIKE %s
            LIMIT 1
        """, (code,))
        row = cur.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="No confirmed mapping found for this code")
            
        icd11_code, icd11_term = row
        return {
            "resourceType": "Parameters",
            "parameter": [
                {"name": "result", "valueBoolean": True},
                {"name": "match", "part": [
                    {"name": "equivalence", "valueCode": "equivalent"},
                    {"name": "concept", "valueCoding": {
                        "system": "ICD-11-TM2", 
                        "code": icd11_code, 
                        "display": icd11_term
                    }}
                ]}
            ]
        }
    finally:
        cur.close()
        conn.close()