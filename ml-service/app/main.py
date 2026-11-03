from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import mapping

load_dotenv(dotenv_path="../.env")

app = FastAPI(title="AyuLink ML Mapping Service")

# Allow the React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mapping.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml-service"}