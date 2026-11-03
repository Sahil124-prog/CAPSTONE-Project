from sentence_transformers import SentenceTransformer

# Initialize globally so the model loads into memory only once
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> list[float]:
    """
    Takes a normalized medical term and returns a 384-dimension vector.
    """
    if not text:
        return [0.0] * 384
        
    # encode() returns a numpy array; convert to a standard Python list for pgvector
    vector = model.encode(text)
    return vector.tolist()