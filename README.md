# DecisionGovernance AI

An enterprise governance platform that validates AI-agent decisions against organizational policy, risk thresholds, and approval chains — before they execute.

## What it does

When AI agents propose operational decisions (budget allocation, hiring, procurement, compliance actions), DecisionGovernance AI intercepts those proposals and runs them through a structured governance pipeline:

1. **Structured Extraction** — Parses decision context, entities, constraints, and intent from free-form AI proposals
2. **Deterministic Policy Evaluation** — Evaluates against company policy rules, approval hierarchies, and governance boundaries
3. **Ontology-Lite Graph Reasoning** — Maps decisions into a typed governance graph (decisions, goals, risks, policies, approvers)
4. **Risk Scoring & Simulation** — Quantifies financial, compliance, and strategic risk; generates safer counterfactual scenarios
5. **Decision Pack Generation** — Produces an approval-ready governance artifact with full evidence trail

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| Backend | FastAPI (Python) — separate repository |
| Auth | Google OAuth 2.0 |
| Database | PostgreSQL |

## Project Structure

```
src/
├── api/              # API client and type definitions
├── app/
│   ├── components/
│   │   ├── landing/  # Landing page sections
│   │   ├── governance/  # Governance console components
│   │   ├── GovernanceConsole.tsx  # Main analysis console
│   │   ├── WorkspaceDashboard.tsx # Decision queue & metrics
│   │   ├── DecisionPackReport.tsx # Governance artifact viewer
│   │   └── ...
│   ├── contexts/     # Auth and language contexts
│   ├── i18n/         # Translations (EN/KO)
│   └── store/        # Client-side caching
└── config.ts         # Environment configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend repository)

### Setup

```bash
# Install dependencies
npm install

# Configure API endpoint
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your backend URL

# Start development server
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_APP_URL` | Auto-detected | Frontend origin for OAuth redirect |

## Key Features

- **Governance Console** — Interactive decision analysis surface with knowledge graph, reasoning timeline, evidence explorer, simulation lab, and decision pack generation
- **Workspace Dashboard** — Real-time queue of AI-proposed decisions with risk status, metrics, and one-click validation
- **Decision Packs** — Exportable governance artifacts with risk analysis, approval chains, evidence, and recommended actions
- **Simulation Lab** — Compare alternative scenarios and their governance impact before approving
- **Multi-language** — English and Korean (한국어) support

## Architecture

```
AI Agent → Proposal → [Extraction] → [Policy Engine] → [Ontology Graph]
                                                              ↓
                    Decision Pack ← [Risk Scoring] ← [Simulation]
```

The frontend consumes a FastAPI backend that orchestrates the governance pipeline. All governance logic (policy evaluation, risk scoring, ontology reasoning) runs server-side. The frontend provides the review, analysis, and approval interface.
