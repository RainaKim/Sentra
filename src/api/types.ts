// ---------------------------------------------------------------------------
// API Types — src/api/types.ts
// Shaped from verified curl responses against api_contract_v1.md.
// All fields optional so UI never crashes on missing keys.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Auth — mirrors app/schemas/auth_responses.py exactly
// ---------------------------------------------------------------------------

/** Mirrors backend ADMIN | MANAGER | USER enum */
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

/** Mirrors backend UserResponse schema */
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  department_name: string | null;
  company_id: string | null;
  created_at: string; // ISO 8601
}

/** Returned by POST /v1/auth/login and POST /v1/auth/signup */
export interface AuthResponse {
  access_token: string;
  token_type: string; // always "bearer"
  user: UserResponse;
}

/** FastAPI error envelope — detail is string or validation error array */
export interface ApiError {
  detail: string | Array<{ msg: string; type: string }>;
}

/** Request body for PATCH /v1/me */
export interface UpdateMeRequest {
  name?: string;
  department_name?: string;
  company_id?: string;
}

/** Request body for POST /v1/auth/signup */
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

/** A demo company returned by GET /v1/companies and GET /v1/companies/{id} */
export interface Company {
  id: string;
  name?: string;
  name_en?: string;
  governance_framework?: string;
  industry?: string;
  industry_en?: string;
  description?: string;
  [key: string]: unknown;
}

/** Demo fixture returned by GET /v1/fixtures */
export interface DemoFixture {
  id: string;
  company_id: string;
  title: string;
  text: string;
  tags?: string[];
}

/** Processing status for a decision */
export type DecisionStatus =
  | "pending"
  | "processing"
  | "complete"
  | "failed";

/** Immediate response from POST /v1/decisions (HTTP 202) */
export interface CreateDecisionResponse {
  decision_id: string;
  status: DecisionStatus;
  message?: string;
  /** Convenience URL returned by backend: /v1/decisions/{id} */
  stream_url?: string;
}

// ---------------------------------------------------------------------------
// Sub-shapes inside the full ConsolePayloadResponse
// ---------------------------------------------------------------------------

export interface DecisionGoal {
  statement?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface DecisionKPI {
  metric?: string;
  target?: string | number;
  [key: string]: unknown;
}

export interface DecisionRisk {
  description?: string;
  severity?: string;
  mitigation?: string;
  [key: string]: unknown;
}

export interface DecisionOwner {
  role?: string;
  role_en?: string;
  name?: string;
  name_en?: string;
  [key: string]: unknown;
}

/** Core decision fields (decision.* in ConsolePayloadResponse) */
export interface DecisionFields {
  /** Backend field is "statement" — NOT "decision_statement" */
  statement?: string;
  /** English version of the statement, if backend provides it */
  statement_en?: string;
  goals?: DecisionGoal[];
  kpis?: DecisionKPI[];
  risks?: DecisionRisk[];
  owners?: DecisionOwner[];
  [key: string]: unknown;
}

/**
 * Governance flag — flags[] is an array of objects, NOT strings.
 * Shape: { code: "HIGH_RISK", category: "governance", severity: "high" }
 */
export interface GovernanceFlag {
  code: string;
  category?: string;
  severity?: string;
}

/** Consequence action for a governance rule */
export interface RuleConsequence {
  action?: 'require_approval' | 'require_review' | 'require_goal_mapping' | string;
  approver_role?: string;
  approver_id?: string;
  approver_roles?: string[];
  approver_ids?: string[];
  severity?: string;
  message?: string;
  message_en?: string;
  requires_sequential?: boolean;
  [key: string]: unknown;
}

/** Evidence item returned in governance rule or approval chain */
export interface GovernanceEvidenceItem {
  id?: string;
  category?: string;
  titleKo?: string;
  titleEn?: string;
  sourceType?: string;
  documentNameKo?: string;
  documentNameEn?: string;
  summaryKo?: string;
  summaryEn?: string;
  citationKo?: string;
  citationEn?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Individual governance rule result */
export interface GovernanceRule {
  rule_id?: string;
  name?: string;
  name_en?: string;
  type?: string;
  /** e.g. "PASSED", "TRIGGERED", "VIOLATION" */
  status?: string;
  description?: string;
  description_en?: string;
  why?: string;
  why_en?: string;
  severity?: string;
  consequence?: RuleConsequence;
  evidence?: GovernanceEvidenceItem[] | null;
  [key: string]: unknown;
}

/** A single step in the normalised approval chain */
export interface ApprovalChainStep {
  role: string;
  name?: string | null;
  /** Personnel hierarchy level: 1 = team lead, 2 = dept head, 3 = VP, 4 = C-level */
  level?: number | null;
  status?: string;   // "pending" | "approved" | "rejected"
  reason?: string | null;
  source_rule_id?: string | null;
  auth_type?: string; // "REQUIRED" | "ESCALATION"
  /**
   * 1-based position within a sequential approval chain.
   * null/undefined = parallel (no ordering constraint).
   * When set, step N must be approved before step N+1 proceeds.
   */
  sequential_order?: number | null;
  evidence?: Record<string, unknown> | null;
}

export interface GovernanceFields {
  status?: string;
  requires_human_review?: boolean;
  /** Numeric 0–10 risk score — lives in governance, NOT in decision_pack */
  risk_score?: number;
  /** Rules that fired (may be empty even when flags are set) */
  triggered_rules?: GovernanceRule[];
  /** All rules evaluated, always present */
  all_rules?: GovernanceRule[];
  /** Structured flags: HIGH_RISK, CRITICAL_CONFLICT, etc. */
  flags?: GovernanceFlag[];
  approval_chain?: ApprovalChainStep[];
  completeness_issues?: string[];
  [key: string]: unknown;
}

/** A node in the graph_payload structure */
export interface GraphPayloadNode {
  id: string;
  type: 'Action' | 'Actor' | 'Goal' | 'KPI' | 'Region' | string;
  label: string;
  label_en?: string;
  properties?: {
    description?: string;
    metric?: string;
    name?: string;
    target?: string | number;
    risk_score?: number;
    [key: string]: unknown;
  };
}

/** An edge in the graph_payload structure */
export interface GraphPayloadEdge {
  source: string;
  target: string;
  relation: 'OWNS' | 'HAS_GOAL' | 'HAS_KPI' | 'AFFECTS_REGION' | string;
}

export interface GraphPayload {
  nodes?: GraphPayloadNode[] | number;
  edges?: GraphPayloadEdge[] | number;
  analysis_method?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Outcome snapshot shared by baseline and expectedOutcome */
export interface RiskSimOutcome {
  aggregateRiskScore?: number;
  band?: string;
  status?: string;
  requiredApprovals?: string[];
  requiredApprovalsEn?: string[];
  triggeredRuleIds?: string[];
}

/** Delta values per risk dimension */
export interface RiskSimDelta {
  aggregateRiskScoreDelta?: number | null;
  financialRiskDelta?: number | null;
  complianceRiskDelta?: number | null;
  strategicRiskDelta?: number | null;
}

/** One risk response scenario within risk_response_simulation */
export interface RiskResponseScenario {
  scenarioId?: string;
  templateId?: string;
  titleKo?: string;
  titleEn?: string;
  changeSummaryKo?: string;
  changeSummaryEn?: string;
  issueTypes?: string[];
  expectedOutcome?: RiskSimOutcome;
  delta?: RiskSimDelta;
  resolvedIssues?: string[];
  resolvedIssuesEn?: string[];
  remainingIssues?: string[];
  remainingIssuesEn?: string[];
  confidence?: number;
  isRecommended?: boolean;
  rationaleKo?: string;
  rationaleEn?: string;
}

/** Returned at top level of DecisionResponse when backend computes scenarios */
export interface RiskResponseSimulation {
  baseline?: RiskSimOutcome;
  scenarios?: RiskResponseScenario[];
  generatedAt?: string;
}

/** A single item within an external_context signal group */
export interface ExternalContextItem {
  title: string;
  summary: string;
  decisionRelevance?: string | null;
  confidence?: number | null;
  source?: string | null;
}

/** Supplementary external context attached to the decision pack — purely informational */
export interface ExternalContext {
  note: string;
  generatedAt?: string | null;
  market?: ExternalContextItem[];
  regulatory?: ExternalContextItem[];
  operational?: ExternalContextItem[];
}

/** The main decision pack artifact — structure may vary */
export interface DecisionPack {
  title?: string;
  summary?: string;
  recommendation?: string;
  external_context?: ExternalContext | null;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Risk Scoring — mirrors backend app/schemas/responses.py exactly.
// Fields not in the backend schema are intentionally absent.
// ---------------------------------------------------------------------------

/** Audit pointer to the datum that drove a risk score (backend: RiskEvidenceResponse) */
export interface RiskEvidenceResponse {
  /** "field" | "rule" | "graph_edge" | "note" */
  type: string;
  ref: Record<string, unknown>;
}

/** Evidence item attached to an individual signal */
export interface SignalEvidenceItem {
  label: string;
  source: string;
}

/** A single quantified signal contributing to a risk dimension (backend: RiskSignalResponse) */
export interface RiskSignalResponse {
  id: string;
  label: string;
  label_en?: string;
  value: number;
  unit?: string | null;
  severity?: string | null;
  evidence?: SignalEvidenceItem[] | null;
}

/** One risk dimension, e.g. financial, compliance, strategic (backend: RiskDimensionResponse) */
export interface RiskDimensionResponse {
  id: string;
  label: string;
  label_en?: string;
  score: number;        // 0–100
  band: string;         // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  signals?: RiskSignalResponse[] | null;
  evidence?: GovernanceEvidenceItem[] | null;
  kpi_impact_estimate?: Record<string, unknown> | null;
}

/** Weighted aggregate across all dimensions (backend: RiskAggregateResponse) */
export interface RiskAggregateResponse {
  score: number;        // 0–100
  band: string;         // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  confidence: number;   // 0.0–1.0
}

/** Full risk scoring output — present when status is 'complete' (backend: RiskScoringPayload) */
export interface RiskScoringPayload {
  aggregate: RiskAggregateResponse;
  dimensions: RiskDimensionResponse[];
}

// ---------------------------------------------------------------------------
// Workspace Dashboard — /v1/workspace/*
// ---------------------------------------------------------------------------

export interface WorkspaceMetrics {
  decisions_today: number;
  pending_count: number;
  blocked_count: number;
}

export type WorkspaceDecisionStatus = 'pending' | 'blocked' | 'validated';

export interface WorkspaceDecision {
  decision_id: string;
  /** Governance analysis decision_id — present when status is validated or blocked */
  analysis_decision_id?: string | null;
  agent_name: string;
  agent_name_en?: string;
  department: string;
  department_en?: string;
  status: WorkspaceDecisionStatus;
  proposed_text: string;
  proposed_text_ko?: string;
  proposed_text_en?: string;
  confidence: number;
  risk_level: string;
  impact_label: string | null;
  impact_label_en?: string | null;
  contract_value: string | null;
  affected_count: number | null;
  created_at: string;
  validated_at: string | null;
}

export interface WorkspaceDecisionsResponse {
  items: WorkspaceDecision[];
  total: number;
  limit: number;
  offset: number;
}

/** Evidence grouped by dimension/section, returned at top level of DecisionResponse */
export interface GovernanceEvidence {
  financialEvidence?: GovernanceEvidenceItem[];
  procurementEvidence?: GovernanceEvidenceItem[];
  strategicEvidence?: GovernanceEvidenceItem[];
  strategyEvidence?: GovernanceEvidenceItem[];
  complianceEvidence?: GovernanceEvidenceItem[];
  operationalEvidence?: GovernanceEvidenceItem[];
  reputationalEvidence?: GovernanceEvidenceItem[];
  approvalEvidence?: GovernanceEvidenceItem[];
  [key: string]: GovernanceEvidenceItem[] | undefined;
}

/** Structured decision context returned by the backend */
export interface DecisionContextEntity {
  key: string;
  label: string;
  value: string;
  category?: string;
  /** 'fact' | 'context' | 'judgment' — judgment items are left-panel-unsafe */
  kind?: 'fact' | 'context' | 'judgment';
  /** LLM confidence 0.0–1.0 for this extraction */
  confidence?: number;
}

export interface DecisionContext {
  proposal?: string;
  proposal_en?: string;
  source?: { type?: string; label?: string };
  entities?: DecisionContextEntity[];
}

/** Full ConsolePayloadResponse from GET /v1/decisions/{id} */
export interface DecisionResponse {
  decision_id: string;
  status: DecisionStatus;
  company?: Company;
  decision?: DecisionFields;
  decision_context?: DecisionContext;
  derived_attributes?: Record<string, unknown>;
  governance?: GovernanceFields;
  graph_payload?: GraphPayload;
  reasoning?: Record<string, unknown>;
  decision_pack?: DecisionPack;
  extraction_metadata?: Record<string, unknown>;
  /** Available when status is 'complete'; null/absent during processing */
  risk_scoring?: RiskScoringPayload | null;
  /** Evidence items grouped by risk dimension */
  governance_evidence?: GovernanceEvidence | null;
  /** Optional remediation scenarios (what-if simulations) */
  risk_response_simulation?: RiskResponseSimulation | null;
  /** Supplementary external signals — purely informational, never affect governance verdict */
  external_signals?: ExternalSignals | null;
  /** Supplementary external context for the decision pack */
  external_context?: ExternalContext | null;
  message?: string;
  agent_name?: string;
  agent_name_en?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// External Signals — supplementary context, never modifies governance output
// ---------------------------------------------------------------------------

export interface ExternalSignalSource {
  sourceId: string;
  title?: string | null;
  sourceLabel: string;
  sourceType?: string | null;
  recency?: string | null;
}

export interface ExternalSignalItem {
  id: string;
  titleKo: string;
  titleEn?: string | null;
  summaryKo: string;
  summaryEn?: string | null;
  decisionRelevanceKo?: string | null;
  decisionRelevanceEn?: string | null;
  confidence?: number | null;
  source: ExternalSignalSource;
  tags?: string[] | null;
}

export interface ExternalSignals {
  marketSignals?: ExternalSignalItem[];
  operationalSignals?: ExternalSignalItem[];
  regulatorySignals?: ExternalSignalItem[];
  generatedAt?: string | null;
}

// ---------------------------------------------------------------------------
// Reasoning Timeline — GET /v1/decisions/{id}/reasoning-trace
// ---------------------------------------------------------------------------

export interface ReasoningStep {
  id: number;
  name: string;
  description: string;
  timestamp: string;
  duration: string;
  status: 'completed' | 'failed' | 'skipped';
  summary: string;
  entities: string[];
  ontology: string[];
}

export interface ReasoningTraceResponse {
  decision_id: string;
  total_duration_ms: number;
  steps: ReasoningStep[];
}

// ---------------------------------------------------------------------------
// Simulation Lab — POST /v1/decisions/{id}/simulate
// ---------------------------------------------------------------------------

export interface SimulationScenario {
  id: string;
  name: string;
  subtitle: string;
  risk_score: number;
  violations: number;
  financial_impact: string;
  financial_impact_k: number;
  approval_required: string;
  expected_outcome: string;
  confidence: number;
  exec_time: string;
  resource_need: string;
  color: 'red' | 'orange' | 'green';
  resolvedIssues: string[];
  remainingIssues: string[];
  rationale?: string;
}

export interface SimulationResponse {
  decision_id: string;
  simulations_run: number;
  avg_risk_reduction_pct: number;
  scenarios: SimulationScenario[];
}

export interface RiskHistoryResponse {
  decision_id: string;
  months: string[];
  series: Record<string, number[]>;
}

// ---------------------------------------------------------------------------
// Evidence Explorer — GET /v1/decisions/{id}/evidence
// ---------------------------------------------------------------------------

export interface EvidenceItem {
  id: string;
  source: string;
  type: string;
  type_color: string;
  confidence: number;
  relevance: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  status: 'Verified' | 'Pending' | 'External';
  summary: string;
  decision_relevance: string;
}

export interface EvidenceResponse {
  decision_id: string;
  total: number;
  last_updated: string;
  items: EvidenceItem[];
}

// ---------------------------------------------------------------------------
// Agent Boundaries — GET /v1/workspace/agents
// ---------------------------------------------------------------------------

export type AgentAutonomy = 'Policy Bound' | 'Conditional' | 'Human Controlled' | 'Autonomous';

export interface AgentItem {
  id: string;
  company_id: string;
  name: string;
  name_en?: string;
  department: string;
  department_en?: string;
  autonomy: AgentAutonomy;
  risk_threshold: number;
  financial_limit: number;
  status: 'Active' | 'Restricted' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface AgentsResponse {
  items: AgentItem[];
  total: number;
}

export interface EscalationRule {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  trigger: string;
  action: string;
  responsible: string;
}

export interface EscalationRulesResponse {
  items: EscalationRule[];
}
