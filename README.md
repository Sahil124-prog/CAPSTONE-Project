# AyuLink — NAMASTE ↔ ICD-11 TM2 Terminology Mapping

Capstone project (Lovely Professional University): A system for mapping NAMASTE (Ayurveda, Siddha, Unani) diagnosis codes to WHO ICD-11 Traditional Medicine Module 2, featuring a multi-signal patent scoring algorithm, clinician review active learning loop, and backward-compatible ICD-10 crosswalks.

> ✅ **Status:** Complete. Fully Implemented & Containerized.

## Tech Stack

| Part | Technology |
|------|------------|
| Frontend | React (Vite) + Recharts |
| Backend / API | Node.js + Express v5 |
| ML Service | Python + FastAPI |
| Embedding Model | HuggingFace (`paraphrase-multilingual-MiniLM-L12-v2`) |
| Database | PostgreSQL 17 + pgvector |
| Interoperability | HL7 FHIR R4 (ConceptMap) + ICD-10 Crosswalks |
| Deployment | Docker, Docker Compose |

## Project Structure

```
CAPSTONE-Project/
├── client/                       # React frontend: mapping engine & admin analytics
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main user mapping interface (search + results)
│   │   │   ├── ReviewQueue.jsx       # Priority review queue for clinicians
│   │   │   └── AdminDashboard.jsx    # Analytics and coverage stats (Recharts)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js                # Vite proxy: /api/* → Node backend
│   ├── eslint.config.js
│   ├── Dockerfile                    # Multi-stage static build using 'serve'
│   └── package.json
│
├── server/                       # Express backend: API gateway + core business logic
│   ├── data/                         # Raw NAMASTE source files (.xls)
│   │   ├── NATIONAL_AYURVEDA_MORBIDITY_CODES.xls
│   │   ├── NATIONAL_SIDDHA_MORBIDITY_CODES.xls
│   │   └── NATIONAL_UNANI_MORBIDITY_CODES.xls
│   ├── database/
│   │   └── migrations/
│   │       ├── 002_namaste_systems.sql   # Extends system CHECK constraint
│   │       ├── 003_confirmed_mappings.sql
│   │       ├── 004_query_log.sql
│   │       ├── 005_overrides.sql
│   │       ├── 006_multilingual.sql
│   │       └── 007_icd10_crosswalk.sql
│   ├── scripts/                      # One-time ingestion runner scripts
│   │   ├── importNamaste.js          # Imports all 3 NAMASTE traditions
│   │   ├── importTm2.js              # Walks ICD-11 TM2 tree via WHO API
│   │   ├── fetchTm2.js
│   │   ├── exploreIcd.js
│   │   ├── exploreNode.js
│   │   └── testWhoToken.js
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # pg Pool singleton
│   │   ├── clients/
│   │   │   └── whoIcdClient.js       # WHO ICD API: OAuth2 token + GET wrapper
│   │   ├── middleware/               # Auth, error handling, audit logging
│   │   ├── utils/
│   │   │   └── normalize.js          # Unicode-aware term normalization
│   │   ├── modules/
│   │   │   ├── ingestion/            # Phase 1: NAMASTE + ICD-11 TM2 import
│   │   │   │   ├── namaste.service.js
│   │   │   │   ├── icdTm2.service.js
│   │   │   │   └── ingestion.repository.js
│   │   │   ├── mapping/              # Phase 3: Candidate mapping & routing
│   │   │   │   ├── mapping.router.js
│   │   │   │   ├── mapping.controller.js
│   │   │   │   ├── mapping.service.js
│   │   │   │   └── mapping.repository.js
│   │   │   ├── fhir/                 # Phase 4: FHIR ConceptMap generation
│   │   │   │   ├── fhir.router.js
│   │   │   │   └── fhir.service.js
│   │   │   ├── priority/             # Phase 5: Review queue prioritization
│   │   │   │   ├── priority.router.js
│   │   │   │   └── priority.service.js
│   │   │   ├── review/               # Phase 5+6: Clinician review API
│   │   │   │   ├── review.router.js
│   │   │   │   ├── review.controller.js
│   │   │   │   ├── review.service.js
│   │   │   │   └── review.repository.js
│   │   │   ├── feedback/             # Phase 6: Reviewer decision capture
│   │   │   │   ├── feedback.router.js
│   │   │   │   └── feedback.service.js
│   │   │   ├── audit/                # Phase 9: DB stats & analytics
│   │   │   │   ├── audit.router.js
│   │   │   │   └── audit.service.js
│   │   │   └── auth/                 # Authentication (JWT / session)
│   │   ├── app.js                    # Express app + route registration
│   │   └── server.js                 # Entry point with dynamic env loading
│   ├── Dockerfile                    # Alpine Node.js production build
│   └── package.json                  # type: "module" (ES Modules)
│
├── ml-service/                   # FastAPI service: embeddings & scoring
│   ├── app/
│   │   ├── core/
│   │   │   └── search.py             # pgvector cosine search + ICD-10 crosswalk JOIN
│   │   ├── embeddings/
│   │   │   ├── generate.py           # Batch embed all 8,000 terms → pgvector
│   │   │   └── fine_tune.py          # Phase 6: Fine-tune on gold set
│   │   ├── routers/
│   │   │   ├── mapping.py            # POST /map — main search endpoint
│   │   │   └── feedback.py           # POST /feedback — expert correction
│   │   ├── scoring/
│   │   │   └── formula.py            # Patent formula: R=f(S,A,M,C), P=U×(1−R)
│   │   ├── recalibration/
│   │   │   └── override.py           # Expert override table lookup
│   │   ├── main.py                   # FastAPI app entry point
│   │   └── __init__.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile                    # Python 3.11 slim + pre-cached model
│
├── database/
│   ├── migrations/
│   │   └── 001_init.sql              # vector extension, releases, concepts tables
│   ├── seeds/
│   │   └── init.sql                  # Pre-computed schema + 8,000 pgvector embeddings
│   └── 007_crosswalk.sql             # ICD-10 backward compatibility schema
│
├── data/
│   ├── raw/                          # Source terminology files (gitignored)
│   ├── processed/
│   │   ├── gold_set.json             # Expert-verified NAMASTE→TM2 pairs
│   │   └── ayulink-finetuned-model/  # Fine-tuned sentence transformer (Phase 6)
│   └── benchmark/                    # Evaluation result outputs
│
├── evaluation/
│   └── eval_harness.py               # Gold set evaluation: precision / recall / F1
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.server
│   │   ├── Dockerfile.ml
│   │   └── Dockerfile.client
│   └── k8s/
│       ├── deployment-server.yaml
│       ├── deployment-ml.yaml
│       ├── deployment-postgres.yaml
│       ├── service.yaml
│       └── ingress.yaml
│
├── docs/                             # Architecture diagrams & API docs
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions: test → build → deploy
├── .env.example
├── .gitignore
└── docker-compose.yml                # Orchestrates DB + Node + Python + React
```

### Module convention (server)

Each module in `server/src/modules/` follows the same pattern:

```
x.router.js → x.controller.js → x.service.js → x.repository.js
 (routes)       (HTTP layer)    (business logic)   (database)
```

---

## Roadmap

### Phase 1: Foundation & Terminology Ingestion ✅

**Goal:** Get the core backend and database running, and import both terminology systems in a clean, versioned form.

- [x] Express server skeleton (config, middleware, error handling, health check)
- [x] PostgreSQL 17 + pgvector running locally via Docker Compose
- [x] Initial database schema: `terminology_releases` + `terminology_concepts` with release versioning
- [x] Migration `002_namaste_systems.sql` — extended CHECK constraint for 3 NAMASTE traditions
- [x] `ingestion` module: import all 3 NAMASTE traditions (Ayurveda 2,910 / Siddha 1,922 / Unani 2,520 codes)
- [x] `icdTm2.service.js` — recursive WHO API tree walk for 648 ICD-11 TM2 codes
- [x] `whoIcdClient.js` — OAuth2 `client_credentials` token caching
- [x] `normalize.js` — term normalization (lowercase, punctuation strip)
- [x] React (Vite) client scaffold with Vite proxy (`/api/*` → Node)

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| Node.js + Express v5 | Backend API server (ES Modules) |
| PostgreSQL 17 | Terminology storage with release versioning |
| pgvector | Extension enabled; used from Phase 2 for vector embeddings |
| SheetJS (xlsx) | Parse legacy binary `.xls` NAMASTE files |
| Docker Compose | Local database & service orchestration |
| React + Vite | Frontend scaffold |

---

### Phase 2: ML Service Foundation ✅

**Goal:** Build the Python microservice and generate vector embeddings for all 8,000 terminology concepts stored in PostgreSQL.

- [x] FastAPI server setup with Uvicorn
- [x] `requirements.txt`: `sentence-transformers`, `psycopg2-binary`, `python-dotenv`, `fastapi`, `uvicorn`
- [x] `embeddings/generate.py` — batch generate 384-dimension vectors for all concepts
- [x] Store embeddings into `terminology_concepts.embedding` column (pgvector `vector(384)`)
- [x] Migration: `ALTER TABLE terminology_concepts ADD COLUMN embedding vector(384)`
- [x] `CREATE INDEX` with `ivfflat` for fast approximate nearest-neighbour search

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| Python + FastAPI | ML microservice |
| `sentence-transformers` | Pre-trained `all-MiniLM-L6-v2` model (384 dims) |
| pgvector | Store + query 384-dim vectors in Postgres |
| psycopg2-binary | Python → PostgreSQL connection |

---

### Phase 3: Basic Mapping Engine ✅

**Goal:** Connect the React frontend to the ML backend to perform real-time semantic similarity searches end-to-end.

- [x] `core/search.py` — cosine similarity query via `<=>` pgvector operator
- [x] `routers/mapping.py` — `POST /map` endpoint: takes a search term, returns top-5 candidates
- [x] `mapping` module in Node: proxy route `POST /api/map` → Python ML service
- [x] `Dashboard.jsx` — search box, results table with term / code / tradition / score columns
- [x] Confidence badge colouring: green (≥0.85) / amber (≥0.65) / red (<0.65)
- [x] Tradition filter dropdown (All / Ayurveda / Siddha / Unani)

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| pgvector `<=>` operator | Cosine distance nearest-neighbour search |
| React + Vite proxy | CORS-free dev setup (`/api/*` forwarded to Node) |
| Recharts | Confidence score visualisation |

---

### Phase 4: FHIR Integration & Database Expansion ✅

**Goal:** Prepare the database to store expert-reviewed mappings and expose them as a standards-compliant HL7 FHIR R4 ConceptMap.

- [x] Migration `003_confirmed_mappings.sql` — `confirmed_mappings` table with `status` CHECK (`pending` / `confirmed` / `rejected`)
- [x] `fhir/fhir.service.js` — builds FHIR R4 ConceptMap JSON from confirmed rows
- [x] `GET /fhir/ConceptMap` — full terminology mapping export
- [x] `GET /fhir/ConceptMap/$translate?code=NAMC001` — single-term standard lookup
- [x] `equivalence` field: `equivalent` for confidence ≥ 0.85, `narrower` below

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| HL7 FHIR R4 | ConceptMap resource standard |
| PostgreSQL | Persistent storage for expert-confirmed mappings |

---

### Phase 5: Priority Review Queue ✅

**Goal:** Track which NAMASTE terms are searched most frequently, and surface the highest-volume unmapped terms first for expert review.

- [x] Migration `004_query_log.sql` — `query_log` table with index on `search_term`
- [x] Audit log in `mapping.router.js` — every `/api/map` call logged (term, tradition, top match, confidence)
- [x] `priority/priority.router.js` — `GET /api/priority/unreviewed` returns top-50 high-frequency unmapped terms
- [x] `ReviewQueue.jsx` — table: Term | Tradition | Times Searched | Review button
- [x] Review panel: approve / reject ML suggestion inline from the queue

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| PostgreSQL aggregation | `GROUP BY` + `LEFT JOIN` to find unmapped high-frequency terms |
| React | Review queue frontend tab |

---

### Phase 6: Active Learning Feedback Loop ✅

**Goal:** Allow clinicians to approve or reject mappings, feeding corrections back into the system to improve future suggestions without retraining from scratch.

- [x] Migration `005_overrides.sql` — `mapping_overrides` table (expert corrections, keyed by `namaste_code UNIQUE`)
- [x] `feedback/feedback.service.js` — saves approve/reject decisions; writes confirmed pairs to gold set
- [x] `routers/feedback.py` — Python `POST /feedback` endpoint
- [x] Pre-search override check in `core/search.py` — if an override exists, it is returned directly (skips ML)
- [x] REJECTED vectors filtered via CTE in pgvector query
- [x] Gold set written to `data/processed/gold_set.json` on each approval
- [x] Fine-tune script `embeddings/fine_tune.py` — trains on gold set using `MultipleNegativesRankingLoss`

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| `sentence-transformers` training API | Fine-tune bi-encoder on domain-specific pairs |
| PostgreSQL CTE | Filter rejected vectors before cosine search |
| JSON gold set | Durable store of expert-verified NAMASTE→TM2 pairs |

---

### Phase 7: Multilingual Embeddings & Normalization ✅

**Goal:** Ensure the AI natively understands Indian classical medical terminology — Sanskrit, Hindi (Devanagari), Tamil, Urdu — without stripping characters.

- [x] Migration `006_multilingual.sql` — `name_original TEXT`, `name_english TEXT` columns on `terminology_concepts`
- [x] `normalize.js` updated — Unicode-aware using `.normalize('NFD')` + `\p{L}\p{N}` regex (preserves Sanskrit/Tamil)
- [x] `namaste.service.js` updated — now captures `Name English` column from NAMASTE Ayurveda file
- [x] Model upgraded to `paraphrase-multilingual-MiniLM-L12-v2` (supports 50+ languages, 512 dims)
- [x] Re-embed all 8,000 concepts with the multilingual model

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| `paraphrase-multilingual-MiniLM-L12-v2` | Multilingual embeddings (Sanskrit / Hindi / Tamil / Urdu) |
| Unicode NFD normalization | Preserve accented and Devanagari characters |

---

### Phase 8: Multi-Signal Patent Scoring ✅

**Goal:** Implement the proprietary multi-signal scoring formula from the patent filing to move beyond basic cosine similarity.

**Patent formula:**
```
R = f(S, A, M, C)
  S = semantic similarity    (cosine score from pgvector)
  A = tradition alignment    (Ayurveda↔Ayurveda gets boost; cross-tradition penalised)
  M = morphological overlap  (trigram / normalised edit distance)
  C = clinical frequency     (term frequency weight from morbidity data)

P = U × (1 − R)
  U = usage frequency        (from query_log count)
  P = priority score         (high usage + low confidence = review first)
```

- [x] `scoring/formula.py` — `compute_confidence(S, A, M, C)` with configurable `ScoringWeights` dataclass
- [x] `compute_priority(usage_count, confidence)` — implements `P = U × (1 − R)`
- [x] `POST /score` FastAPI endpoint — accepts raw signal values, returns `confidence` + `priority`
- [x] Weights exposed as env vars for tuning without redeployment
- [x] Confidence scores from formula routed to React UI confidence badges

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| Python dataclass | Configurable scoring weights |
| FastAPI | Scoring microservice endpoint |
| PostgreSQL trigrams (`pg_trgm`) | Morphological overlap signal (M) |

---

### Phase 9: Admin Dashboard Analytics ✅

**Goal:** Visualize the system's mapping progress, gold set growth, and expert review activity for administrators.

- [x] `audit/audit.router.js` — `GET /api/audit/stats`: total NAMASTE terms, confirmed mappings, coverage %, total queries
- [x] `AdminDashboard.jsx` — four stat cards + two charts
- [x] Coverage pie chart (confirmed vs unmapped) using `recharts` PieChart
- [x] Confidence score histogram — bar chart of distribution across all confirmed mappings
- [x] Top unreviewed terms table — feeds from `/api/priority/unreviewed`
- [x] Gold set size counter card

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| Recharts | PieChart + BarChart in React |
| PostgreSQL window functions | Confidence score bucketing for histogram |

---

### Phase 10: Production Dockerization ✅

**Goal:** Containerize the entire architecture so the full system runs with a single command on any machine or cloud platform.

- [x] `infra/docker/Dockerfile.server` — Alpine Node.js, `npm ci --omit=dev`, port 5002
- [x] `infra/docker/Dockerfile.ml` — Python 3.11 slim, pre-cached HuggingFace model, port 8000
- [x] `infra/docker/Dockerfile.client` — Multi-stage build: Vite `npm run build` → `serve` on port 80
- [x] `.dockerignore` files for each service
- [x] `docker-compose.yml` updated — internal Docker network; services reference each other by name (`ml-service`, `server`, `postgres`)
- [x] `database/seeds/init.sql` — single file with schema + all 8,000 pre-computed vectors; auto-loaded via `/docker-entrypoint-initdb.d/`
- [x] `.github/workflows/ci.yml` — GitHub Actions: `npm test` (Node) + `pytest` (Python) on every push

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| Docker multi-stage build | Small production images (no dev deps) |
| Docker Compose internal network | Zero-config inter-service DNS |
| GitHub Actions | Automated CI on push |
| `pgvector/pgvector:pg17` | Official Postgres 17 image with pgvector pre-installed |

---

### Phase 11: ICD-10 Backward Compatibility ✅

**Goal:** Ensure hospitals still running the legacy ICD-10 standard can query AyuLink and receive dual ICD-10 / ICD-11 output.

- [x] Migration `007_icd10_crosswalk.sql` — `icd_crosswalk` table mapping ICD-11 TM2 codes → ICD-10 codes
- [x] `icd10Crosswalk.service.js` — calls WHO ICD-11→ICD-10 linearization crosswalk API
- [x] `core/search.py` updated — `LEFT JOIN icd_crosswalk` on every result row
- [x] `confirmed_mappings` table: `icd10_code`, `icd10_term` columns added
- [x] `?include_icd10=true` query param on `/api/map` — returns both ICD-11 TM2 and ICD-10 codes
- [x] `Dashboard.jsx` — ICD-10 legacy badge shown alongside ICD-11 TM2 code when available

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| WHO ICD-11 linearization API | ICD-11 → ICD-10 crosswalk data |
| PostgreSQL `LEFT JOIN` | Zero-overhead crosswalk lookup on every search query |

---

## Getting Started (Teammate Onboarding)

To run this project locally without having to manually regenerate all 8,000 ML vector embeddings, follow these three steps.

### 1. Setup Environment Variables

Do not commit your real `.env` file. Copy `.env.example` to `.env` in the root directory and fill in your credentials:

```env
# Database
POSTGRES_USER=ayulink
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=ayulink
POSTGRES_PORT=5433
DATABASE_URL=postgresql://ayulink:your_password_here@127.0.0.1:5433/ayulink

# Server
PORT=5002

# WHO ICD API — get from https://icdaccessmanagement.who.int/
# DO NOT commit these values
WHO_ICD_CLIENT_ID=your_client_id_here
WHO_ICD_CLIENT_SECRET=your_client_secret_here
```

> ⚠️ `WHO_ICD_CLIENT_ID` and `WHO_ICD_CLIENT_SECRET` must stay in `.env` only. They are gitignored and must never appear in `.env.example` or committed code.

### 2. Database Seed

Ensure `database/seeds/init.sql` is present. This file contains the full schema and all 8,000 pre-computed pgvector embeddings. Docker loads it automatically the first time the database boots via `/docker-entrypoint-initdb.d/`.

If this file is missing, request the database dump from the lead developer (Sahil).

### 3. Spin Up the Stack

```bash
docker compose up -d --build
```

Docker will pull the images, install all dependencies, seed the database with 8,000 vectors, and start all four services.

**Access the services:**

| Service | URL |
|---------|-----|
| Frontend UI | `http://localhost:5173` |
| Node API | `http://localhost:5002` |
| Python ML Service | `http://localhost:8000` |
| Postgres | `localhost:5433` |

---

## API Reference

| Method | Path | Service | Description |
|--------|------|---------|-------------|
| `POST` | `/api/map` | Node → Python | Search: returns top-5 NAMASTE→TM2 candidates with scores |
| `POST` | `/api/feedback` | Node → Python | Submit expert approve/reject decision |
| `GET` | `/api/priority/unreviewed` | Node | Top-50 high-frequency unmapped terms |
| `GET` | `/api/audit/stats` | Node | Coverage %, gold set size, total queries |
| `GET` | `/fhir/ConceptMap` | Node | Full FHIR R4 ConceptMap export |
| `GET` | `/fhir/ConceptMap/$translate` | Node | Single-term FHIR translation lookup |

---

## Security Notes

- WHO API credentials live in `.env` only — never in code or `.env.example`
- Patent formula (`R = f(S, A, M, C)` and `P = U × (1 − R)`) must not be published until IPR Cell confirms patent filing
- `data/processed/gold_set.json` contains expert-curated data — treat as sensitive; it is gitignored

---

## Team

- **Sahil** — Full Stack & ML Architecture
- **Akash**-  Full Stack & ML Architecture
- **Priya**-  Full Stack & ML Architecture