from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mapping
from app.routers import fhir  # 1. ADD THIS IMPORT

app = FastAPI(title="AyuLink ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mapping.router)
app.include_router(fhir.router)  # 2. ADD THIS REGISTRATION

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AyuLink ML Core"}