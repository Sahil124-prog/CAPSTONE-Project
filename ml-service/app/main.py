from fastapi import FastAPI

app = FastAPI(title="AyuLink ML Service")


@app.get("/health")
def health():
    return {"status": "ok", "service": "ayulink-ml"}