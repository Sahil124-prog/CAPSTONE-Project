import os
import sys
import psycopg2
from dotenv import load_dotenv

# Ensure Python can find the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.embeddings.embedder import generate_embedding

# Load environment variables from the root .env file
load_dotenv(dotenv_path="../.env")

def main():
    conn = psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "ayulink"),
        user=os.getenv("POSTGRES_USER", "ayulink"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host="127.0.0.1",
        port=os.getenv("POSTGRES_PORT", "5433")
    )
    cur = conn.cursor()

    try:
        print("Fetching concepts without embeddings...")
        # Fetch only records where embedding IS NULL (allows pausing and resuming)
        cur.execute("SELECT id, normalized_term FROM terminology_concepts WHERE embedding IS NULL")
        rows = cur.fetchall()
        
        total = len(rows)
        print(f"Found {total} concepts to embed.")

        if total == 0:
            print("Everything is already embedded!")
            return

        for i, (record_id, term) in enumerate(rows, 1):
            if not term:
                continue
            
            vector = generate_embedding(term)
            
            # Update database (pgvector accepts a stringified list of floats)
            cur.execute(
                "UPDATE terminology_concepts SET embedding = %s WHERE id = %s",
                (str(vector), record_id)
            )
            
            # Commit every 100 records and print progress
            if i % 100 == 0 or i == total:
                conn.commit()
                print(f"Processed {i} / {total} embeddings...")

        print("Embedding generation complete!")

    except Exception as e:
        conn.rollback()
        print(f"Error during embedding generation: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()