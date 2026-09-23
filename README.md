# AyuLink — NAMASTE ↔ ICD-11 TM2 Terminology Mapping

Capstone project (Lovely Professional University): a system for mapping NAMASTE (Ayurveda, Siddha, Unani) diagnosis codes to WHO ICD-11 Traditional Medicine Module 2, with clinician review and FHIR-compliant output.

> 🚧 **Status:** Project scaffold only. Implementation in progress.

## Tech Stack

| Part | Technology |
|------|------------|
| Frontend | React (Vite) |
| Backend / API | Node.js + Express |
| ML Service | Python + FastAPI |
| Database | PostgreSQL + pgvector |
| Interoperability | HL7 FHIR (ConceptMap) |
| Deployment | Docker, Kubernetes, GitHub Actions |

## Project Structure

```
CAPSTONE-Project/
├── client/                 # React frontend: clinician review dashboard & viewers
├── server/                 # Express backend: API gateway + core business logic
│   └── src/
│       ├── config/         # Environment & database config
│       ├── clients/        # Clients for ml-service and external APIs
│       ├── middleware/     # Auth, error handling, audit logging
│       ├── utils/          # Shared helpers
│       └── modules/        # One module per system layer
│           ├── auth/       # Authentication
│           ├── ingestion/  # Terminology import & normalization
│           ├── mapping/    # Candidate mapping & routing
│           ├── priority/   # Review queue prioritization
│           ├── review/     # Clinician review API
│           ├── feedback/   # Reviewer decision capture
│           ├── fhir/       # FHIR ConceptMap generation
│           └── audit/      # Audit & version history
├── ml-service/             # FastAPI service: embeddings & scoring
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── embeddings/     # Embedding generation
│   │   ├── scoring/        # Mapping reliability scoring
│   │   ├── recalibration/  # Feedback-based model updates
│   │   └── core/           # Service config
│   └── tests/
├── database/
│   ├── migrations/         # SQL schema migrations
│   └── seeds/              # Seed data
├── data/                   # Terminology datasets (raw/processed are gitignored)
├── evaluation/             # Benchmarking scripts
├── infra/
│   ├── docker/             # Dockerfiles
│   └── k8s/                # Kubernetes manifests
├── .github/workflows/      # CI/CD pipelines
└── docs/                   # Architecture diagrams & API docs
```

### Module convention (server)

Each module in `server/src/modules/` follows the same pattern:

```
x.routes.js → x.controller.js → x.service.js → x.repository.js
  (routes)      (HTTP layer)     (business logic)   (database)
```

## Roadmap

### Phase 1: Foundation & Terminology Ingestion *(current)*

Goal: get the core backend and database running, and import both terminology systems in a clean, versioned form.

- [ ] Express server skeleton (config, middleware, error handling, health check)
- [ ] PostgreSQL + pgvector running locally via Docker Compose
- [ ] Initial database schema (terminology tables with release versioning)
- [ ] `ingestion` module: import NAMASTE and ICD-11 TM2 datasets
- [ ] Text normalization (case, punctuation/whitespace, abbreviations, transliteration)
- [ ] React (Vite) client scaffold

**Technologies used in this phase:**

| Technology | Purpose |
|------------|---------|
| Node.js + Express | Backend API server |
| PostgreSQL | Terminology storage with version tracking |
| pgvector | Enabled now, used from Phase 2 for embeddings |
| Docker Compose | Local database & service orchestration |
| React + Vite | Frontend scaffold |

### Upcoming Phases

| Phase | Focus |
|-------|-------|
| 2 | ML service: embeddings & candidate mapping |
| 3 | Reliability scoring & confidence-based routing |
| 4 | Review queue & clinician review dashboard |
| 5 | Feedback engine & recalibration |
| 6 | FHIR ConceptMap API & audit/versioning |
| 7 | Evaluation against WHO reference mappings |
| 8 | Containerization, Kubernetes & CI/CD |

## Getting Started

_Setup instructions will be added as each service is implemented._

## Team

_To be added._
