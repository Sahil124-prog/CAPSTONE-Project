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

## Getting Started

_Setup instructions will be added as each service is implemented._

## Team

_To be added._
