from sentence_transformers import SentenceTransformer

# --- PHASE 7: Multilingual Support ---
# Upgraded from 'all-MiniLM-L6-v2' to support Sanskrit, Hindi, Tamil, and Urdu[cite: 27]
MODEL_NAME = 'paraphrase-multilingual-MiniLM-L12-v2'

print(f"Loading {MODEL_NAME}...")
model = SentenceTransformer(MODEL_NAME)
print("Model loaded successfully.")

def generate_embedding(text: str) -> list[float]:
    """
    Generates a 384-dimensional vector embedding for the given text using 
    a multilingual transformer model capable of understanding Indian traditional terms.
    """
    if not text or not text.strip():
        # Return a zero vector of correct dimension (384 for paraphrase-multilingual-MiniLM-L12-v2)
        return [0.0] * 384
        
    embedding = model.encode(text.strip())
    return embedding.tolist()