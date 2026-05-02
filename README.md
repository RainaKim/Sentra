# DecisionGovernance AI — Frontend

AI agents can now write code, draft contracts, and coordinate workflows — but the next frontier is letting them make decisions that actually change things: hiring someone, committing budget, processing customer data. Most enterprises aren't ready for that. Not because the AI isn't capable, but because there's no layer between the agent's output and real-world consequence.

That's the problem this system solves.

DecisionGovernance AI intercepts every AI-proposed decision before it executes and runs it through the company's actual governance structure — not a generic approval flow, but the specific rules, strategic goals, authority chains, and precedents that define how that company makes decisions. An agent proposing a $450K hiring plan doesn't just get flagged; it gets evaluated against R&D budget headroom, checked for conflicts with the current cost-stability mandate, routed to the right approvers in the right order, and compared against similar decisions that were approved or blocked in the past.

This repository contains the **review, analysis, and approval interface** — the surface where humans inspect AI-proposed decisions, walk through reasoning, simulate alternatives, and approve or reject. The governance pipeline itself (rule engine, ontology graph, risk scoring, governance agent) runs in the [decision-governance-layer](https://github.com/RainaKim/decision-governance-layer) backend.

---

## What it does

When AI agents propose operational decisions (budget allocation, hiring, procurement, compliance actions), the backend intercepts those proposals and runs them through a structured governance pipeline. This frontend surfaces every step:

1. **Structured Extraction** — Decision context, entities, constraints, and intent parsed from free-form proposals
2. **Deterministic Policy Evaluation** — Company policy rules, approval hierarchies, and governance boundaries
3. **Ontology Graph Reasoning** — Decisions mapped into a typed governance graph (decisions, goals, risks, policies, approvers)
4. **Risk Scoring & External Signals** — Financial, compliance, and strategic risk quantified; live regulatory and market signals applied
5. **Governance Agent Verdict** — LangGraph reasoning loop produces a final verdict with evidence, gaps, and precedents
6. **Decision Pack** — Approval-ready governance artifact with full evidence trail, exportable

```
AI Agent proposes: "Build customer scoring using EU PII data"
                              │
               ┌──────────────▼──────────────┐
               │     Backend Pipeline         │
               │  Rule engine → Ontology RAG  │
               │  Risk scoring + Tavily       │
               │  Governance agent (LangGraph)│
               └──────────────┬──────────────┘
                              │
               ┌──────────────▼──────────────┐
               │  This frontend renders:      │
               │  • Workspace Dashboard       │
               │  • Governance Console        │
               │  • Reasoning Timeline        │
               │  • Evidence Explorer         │
               │  • Simulation Lab            │
               │  • Decision Pack Report      │
               └──────────────┬──────────────┘
                              │
                       Human approves / rejects
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite 6 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 4 |
| UI primitives | Radix UI + MUI 7 + shadcn-style components |
| Graph visualization | React Flow + Dagre |
| Charts | Recharts |
| Animation | Motion (Framer Motion) |
| Forms | React Hook Form |
| Auth | Google OAuth 2.0 (via backend) |
| Backend | FastAPI + LangGraph + Neo4j (separate repo) |

---

## Key Features

- **Governance Console** — Interactive decision analysis surface combining knowledge graph view, reasoning timeline, evidence explorer, simulation lab, and decision pack generation in one workspace
- **Workspace Dashboard** — Real-time queue of AI-proposed decisions with risk status, metrics, and one-click validation
- **Reasoning Timeline** — Step-by-step replay of the governance agent's tool calls, retrieved evidence, and intermediate verdicts
- **Evidence Explorer** — Drill into the rules, similar past decisions, goal conflicts, and external signals that drove a verdict
- **Simulation Lab** — Counterfactual scenarios — test how risk and approval chains shift if cost, scope, or constraints change
- **Decision Pack Report** — Exportable governance artifact with risk analysis, approval chains, evidence, and recommended actions
- **Onboarding** — Surfaces the scout-swarm onboarding pipeline that builds a company's governance ontology from existing artifacts
- **Agent Boundaries** — Visual editor for agent permissions, escalation rules, and decision authority
- **Multi-language** — English and Korean (한국어)

---

## Project Structure

```
src/
├── api/                      # API client + type definitions for the backend
├── app/
│   ├── App.tsx
│   ├── routes.tsx            # React Router v7 route tree
│   ├── components/
│   │   ├── landing/          # Hero, ProductDeepDive, ValueSection, CTABanner, …
│   │   ├── governance/       # Governance console internals
│   │   ├── ontology/         # Ontology graph visualization
│   │   ├── figma/            # Design-system imports
│   │   ├── ui/               # shadcn-style primitives (buttons, dialogs, …)
│   │   ├── GovernanceConsole.tsx     # Main analysis console
│   │   ├── WorkspaceDashboard.tsx    # Decision queue & metrics
│   │   ├── DecisionPackReport.tsx    # Governance artifact viewer
│   │   ├── ReasoningTimeline.tsx     # Agent reasoning replay
│   │   ├── EvidenceExplorer.tsx      # Rules, precedents, signals drill-down
│   │   ├── SimulationLab.tsx         # Counterfactual scenarios
│   │   ├── RiskScoringPanel.tsx      # 3-dimension risk display
│   │   ├── AgentBoundaries.tsx       # Agent permissions editor
│   │   ├── Onboarding.tsx            # Scout-swarm onboarding UI
│   │   ├── ProfileSettings.tsx
│   │   ├── AuthModal.tsx / AuthCallback.tsx / LoginPage.tsx
│   │   └── …
│   ├── contexts/             # AuthContext, LanguageContext
│   ├── i18n/                 # EN / KO translations
│   └── store/                # Client-side caching
├── styles/
├── config.ts                 # Environment configuration
└── main.tsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running — see [decision-governance-layer](https://github.com/RainaKim/decision-governance-layer)

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
| `VITE_API_BASE_URL` | `http://localhost:8001` | Backend FastAPI base URL |
| `VITE_APP_URL` | Auto-detected | Frontend origin for OAuth redirect |

### Backend Endpoints Consumed

| Method | Endpoint | Used by |
|--------|----------|---------|
| `POST` | `/v1/validate` | Governance Console — full decision validation |
| `POST` | `/v1/decisions` | Workspace Dashboard — legacy submission |
| `GET` | `/v1/decisions/{id}` | Decision Pack Report |
| `POST` | `/v1/companies/{id}/context` | Onboarding — push operational snapshot |
| `GET` | `/v1/auth/sso/{google,azure}/{authorize,callback}` | Login / SSO |

---

## Architecture (system view)

```
                        ┌─────────────────────────────┐
                        │   This frontend (Sentra)    │
                        │   React + Vite + TS         │
                        └──────────────┬──────────────┘
                                       │ REST / JSON
                                       ▼
            ┌────────────────────────────────────────────────┐
            │   FastAPI backend (decision-governance-layer)  │
            │                                                │
            │   Layer 1 — Deterministic governance core      │
            │     rule engine · approval chain · risk score  │
            │                                                │
            │   Layer 2 — LangGraph governance agent         │
            │     graph RAG · vector RAG · gap detection     │
            │                                                │
            │   External signals — Tavily + LLM synthesis    │
            └──────────────┬─────────────────────────────────┘
                           │
                ┌──────────┴───────────┐
                ▼                      ▼
            Neo4j 5.11+           SQLite / Postgres
            ontology graph        users, companies,
            + vector index        decisions, audit
```

All governance logic — policy evaluation, ontology reasoning, risk scoring, agent loop — runs server-side. This frontend is the review, analysis, and approval surface.

---

## Related Repositories

- **[decision-governance-layer](https://github.com/RainaKim/decision-governance-layer)** — FastAPI + LangGraph + Neo4j backend. Onboarding scout swarm, validation pipeline, governance agent, and risk scoring.
