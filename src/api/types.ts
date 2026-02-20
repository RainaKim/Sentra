// ---------------------------------------------------------------------------
// API Types — src/api/types.ts
// Shaped from verified curl responses against api_contract_v1.md.
// All fields optional so UI never crashes on missing keys.
// ---------------------------------------------------------------------------

/** A demo company returned by GET /v1/companies and GET /v1/companies/{id} */
export interface Company {
  id: string;
  name?: string;
  governance_framework?: string;
  industry?: string;
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
  name?: string;
  [key: string]: unknown;
}

/** Core decision fields (decision.* in ConsolePayloadResponse) */
export interface DecisionFields {
  /** Backend field is "statement" — NOT "decision_statement" */
  statement?: string;
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
  requires_sequential?: boolean;
  [key: string]: unknown;
}

/** Individual governance rule result */
export interface GovernanceRule {
  rule_id?: string;
  name?: string;
  type?: string;
  /** e.g. "PASSED", "TRIGGERED", "VIOLATION" */
  status?: string;
  description?: string;
  why?: string;
  severity?: string;
  consequence?: RuleConsequence;
  [key: string]: unknown;
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
  approval_chain?: string[];
  completeness_issues?: string[];
  [key: string]: unknown;
}

/** A node in the graph_payload structure */
export interface GraphPayloadNode {
  id: string;
  type: 'Action' | 'Actor' | 'Goal' | 'KPI' | 'Region' | string;
  label: string;
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

/** The main decision pack artifact — structure may vary */
export interface DecisionPack {
  title?: string;
  summary?: string;
  recommendation?: string;
  [key: string]: unknown;
}

/** Full ConsolePayloadResponse from GET /v1/decisions/{id} */
export interface DecisionResponse {
  decision_id: string;
  status: DecisionStatus;
  company?: Company;
  decision?: DecisionFields;
  derived_attributes?: Record<string, unknown>;
  governance?: GovernanceFields;
  graph_payload?: GraphPayload;
  reasoning?: Record<string, unknown>;
  decision_pack?: DecisionPack;
  extraction_metadata?: Record<string, unknown>;
  message?: string;
  [key: string]: unknown;
}
