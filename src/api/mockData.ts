import type {
  ReasoningStep,
  SimulationScenario,
  EvidenceItem,
  AgentItem,
  EscalationRule,
} from "./types";

// ---------------------------------------------------------------------------
// Fallback mock data — used when backend endpoints are unavailable
// ---------------------------------------------------------------------------

export const MOCK_REASONING_STEPS: ReasoningStep[] = [
  {
    id: 1,
    name: "Input Parsing",
    description: "Tokenize and normalize the incoming decision request",
    timestamp: "14:23:01.042",
    duration: "38ms",
    status: "completed",
    summary:
      "The system received a structured decision request and performed tokenization, entity extraction, and normalization. Key entities identified: pricing adjustment, APAC region, quarterly review period. The input was classified as a financial decision with cross-regional implications.",
    entities: [
      "Decision Type: Pricing Adjustment",
      "Initiating Agent: PricingBot v2.3",
      "Region: APAC",
      "Time Horizon: Q4 2024",
    ],
    ontology: [
      "PricingDecision → BusinessDecision",
      "MarginAdjustment → FinancialControl",
    ],
  },
  {
    id: 2,
    name: "Policy Lookup",
    description: "Retrieve and match applicable governance policies",
    timestamp: "14:23:01.080",
    duration: "124ms",
    status: "completed",
    summary:
      "Queried the governance knowledge graph for policies applicable to pricing decisions in the APAC region. Found 12 matching policies across 3 governance domains: financial controls, regional compliance, and pricing authority.",
    entities: [
      "Matched Policies: 12",
      "Governance Domains: Financial, Regional, Pricing",
      "Authority Level: Department Head",
    ],
    ontology: [
      "PolicyLookup → GovernanceQuery",
      "FinancialControl → ComplianceFramework",
    ],
  },
  {
    id: 3,
    name: "Graph Traversal",
    description: "Walk entity-relationship graph for contextual signals",
    timestamp: "14:23:01.204",
    duration: "287ms",
    status: "completed",
    summary:
      "Traversed the organizational knowledge graph to identify all entities related to the pricing decision. Discovered 847 connected nodes across 5 relationship types. Key finding: the decision impacts 3 downstream systems.",
    entities: [
      "Connected Nodes: 847",
      "Relationship Types: 5",
      "Affected Systems: CRM, Billing, Analytics",
    ],
    ontology: [
      "GraphTraversal → KnowledgeDiscovery",
      "EntityRelation → OrganizationalContext",
    ],
  },
  {
    id: 4,
    name: "Risk Assessment",
    description: "Calculate composite risk score from all gathered signals",
    timestamp: "14:23:01.491",
    duration: "356ms",
    status: "completed",
    summary:
      "Synthesized all governance signals, entity relationships, and policy constraints to compute a composite risk score. The multi-dimensional analysis evaluated financial risk (moderate), regulatory risk (low), operational risk (elevated), and reputational risk (low).",
    entities: [
      "Composite Risk Score: 0.67",
      "Financial Risk: Moderate",
      "Regulatory Risk: Low",
      "Operational Risk: Elevated",
    ],
    ontology: [
      "RiskAssessment → DecisionAnalysis",
      "CompositeScore → MultiDimensionalRisk",
    ],
  },
  {
    id: 5,
    name: "Decision Synthesis",
    description: "Generate final recommendation with supporting evidence",
    timestamp: "14:23:01.847",
    duration: "226ms",
    status: "completed",
    summary:
      "Compiled all analysis results into a structured decision recommendation. The system recommends conditional approval with 3 required oversight conditions and 2 monitoring checkpoints. The recommendation includes a confidence score and detailed rationale.",
    entities: [
      "Recommendation: Conditional Approval",
      "Oversight Conditions: 3",
      "Monitoring Checkpoints: 2",
      "Confidence: 87%",
    ],
    ontology: [
      "DecisionSynthesis → GovernanceOutput",
      "ConditionalApproval → DecisionOutcome",
    ],
  },
];

export const MOCK_TOTAL_DURATION_MS = 1031;

export const MOCK_SCENARIOS: SimulationScenario[] = [
  {
    id: "A",
    name: "Scenario A",
    subtitle: "Aggressive Expansion",
    risk_score: 82,
    violations: 4,
    financial_impact: "$2.4M",
    financial_impact_k: 2400,
    approval_required: "CFO + Board Approval",
    expected_outcome:
      "High revenue growth with significant regulatory exposure. Requires board-level sign-off and enhanced monitoring.",
    confidence: 68,
    exec_time: "1.2s",
    resource_need: "High",
    color: "red",
    resolvedIssues: ["Market entry timeline accelerated"],
    remainingIssues: ["Regulatory compliance gaps", "Capital allocation risk", "Board approval pending", "Monitoring framework needed"],
  },
  {
    id: "B",
    name: "Scenario B",
    subtitle: "Moderate Growth",
    risk_score: 54,
    violations: 1,
    financial_impact: "$1.1M",
    financial_impact_k: 1100,
    approval_required: "VP Finance Approval",
    expected_outcome:
      "Balanced approach with manageable risk. Standard approval workflow sufficient.",
    confidence: 85,
    exec_time: "0.9s",
    resource_need: "Medium",
    color: "orange",
    resolvedIssues: ["Budget reallocation approved", "Vendor risk mitigated"],
    remainingIssues: ["Minor compliance review pending"],
  },
  {
    id: "C",
    name: "Scenario C",
    subtitle: "Conservative",
    risk_score: 23,
    violations: 0,
    financial_impact: "$0.4M",
    financial_impact_k: 400,
    approval_required: "Department Head",
    expected_outcome:
      "Low risk with modest returns. Fully within existing authority boundaries.",
    confidence: 94,
    exec_time: "0.6s",
    resource_need: "Low",
    color: "green",
    resolvedIssues: ["All compliance checks passed", "Risk within authority limits", "No additional approvals needed"],
    remainingIssues: [],
  },
];

export const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: "EV-001",
    source: "Bloomberg Market Feed",
    type: "Market Signal",
    type_color: "blue",
    confidence: 94,
    relevance: "High",
    timestamp: "2024-09-18T14:21:03Z",
    status: "Verified",
    summary:
      "APAC equity markets showed a 3.2% upward movement in the technology sector, indicating favorable conditions for pricing adjustments in the region.",
    decision_relevance:
      "Directly supports the financial rationale for the proposed pricing change in the APAC market.",
  },
  {
    id: "EV-002",
    source: "Internal CRM Analytics",
    type: "Operational",
    type_color: "orange",
    confidence: 87,
    relevance: "High",
    timestamp: "2024-09-18T14:20:15Z",
    status: "Verified",
    summary:
      "Customer churn analysis indicates a 12% increase in price sensitivity among enterprise clients in APAC over the past quarter.",
    decision_relevance:
      "Suggests caution in aggressive pricing — moderate adjustments are less likely to trigger churn.",
  },
  {
    id: "EV-003",
    source: "Operational Risk Engine",
    type: "Procurement",
    type_color: "orange",
    confidence: 91,
    relevance: "Critical",
    timestamp: "2024-09-18T14:19:47Z",
    status: "Verified",
    summary:
      "Supply chain disruptions in Southeast Asia may impact fulfillment capacity if demand increases beyond 115% of current levels.",
    decision_relevance:
      "Constrains the upper bound of aggressive scenarios — must ensure demand growth stays within fulfillment capacity.",
  },
  {
    id: "EV-004",
    source: "Regulatory Compliance DB",
    type: "Compliance",
    type_color: "gray",
    confidence: 99,
    relevance: "Critical",
    timestamp: "2024-09-18T14:18:30Z",
    status: "Verified",
    summary:
      "APAC pricing regulations require a 30-day notification period for B2B price changes exceeding 10%.",
    decision_relevance:
      "Hard constraint: any scenario exceeding 10% adjustment requires mandatory notification period compliance.",
  },
  {
    id: "EV-005",
    source: "Reuters Global Feed",
    type: "Reputational",
    type_color: "teal",
    confidence: 78,
    relevance: "Medium",
    timestamp: "2024-09-18T14:17:22Z",
    status: "Pending",
    summary:
      "Competitor analysis indicates 2 of 5 major competitors are planning Q4 price reductions in the APAC enterprise segment.",
    decision_relevance:
      "Market context that may affect the effectiveness of price increases in the short term.",
  },
  {
    id: "EV-006",
    source: "Treasury & Finance System",
    type: "Financial",
    type_color: "pink",
    confidence: 96,
    relevance: "High",
    timestamp: "2024-09-18T14:16:05Z",
    status: "Verified",
    summary:
      "Current Q4 budget allocation allows for up to $1.8M in margin flexibility for APAC pricing initiatives.",
    decision_relevance:
      "Sets the financial envelope — Scenario A exceeds the budget allocation and would require additional approval.",
  },
  {
    id: "EV-007",
    source: "ESG Monitoring Platform",
    type: "Approval",
    type_color: "purple",
    confidence: 72,
    relevance: "Low",
    timestamp: "2024-09-18T14:15:00Z",
    status: "Pending",
    summary:
      "No ESG concerns identified for the proposed pricing adjustment. Environmental and social impact assessment returned neutral.",
    decision_relevance:
      "No ESG blockers — the decision can proceed without additional sustainability review.",
  },
];

export const MOCK_AGENTS: AgentItem[] = [
  {
    id: "AGT-001",
    name: "PricingBot",
    version: "v2.3",
    department: "Revenue Operations",
    domain: "Pricing & Margin Control",
    autonomy: "Policy Bound",
    autonomy_level: 45,
    policy: "POL-FIN-012",
    status: "Active",
    constraints: [
      "Max +15% price adjustment per quarter",
      "APAC region only — no cross-region decisions",
      "Cannot override manual pricing locks",
    ],
    linked_policies: ["POL-FIN-012", "POL-RISK-003", "POL-REG-001"],
  },
  {
    id: "AGT-002",
    name: "ComplianceGuard",
    version: "v1.8",
    department: "Legal & Compliance",
    domain: "Regulatory Monitoring",
    autonomy: "Conditional",
    autonomy_level: 60,
    policy: "POL-LEG-007",
    status: "Active",
    constraints: [
      "Cannot auto-approve regulatory filings",
      "Must escalate cross-jurisdiction issues",
    ],
    linked_policies: ["POL-LEG-007", "POL-REG-002"],
  },
  {
    id: "AGT-003",
    name: "InventoryOptimizer",
    version: "v3.1",
    department: "Supply Chain",
    domain: "Inventory & Fulfillment",
    autonomy: "Policy Bound",
    autonomy_level: 40,
    policy: "POL-OPS-005",
    status: "Active",
    constraints: [
      "Max 20% reorder quantity change",
      "Cannot modify supplier contracts",
      "Safety stock levels are read-only",
    ],
    linked_policies: ["POL-OPS-005", "POL-FIN-008"],
  },
  {
    id: "AGT-004",
    name: "HRAssistant",
    version: "v1.2",
    department: "Human Resources",
    domain: "Employee Management",
    autonomy: "Human Controlled",
    autonomy_level: 15,
    policy: "POL-HR-001",
    status: "Restricted",
    constraints: [
      "All actions require human approval",
      "Cannot access salary data",
      "Read-only access to employee records",
    ],
    linked_policies: ["POL-HR-001", "POL-PRIV-003"],
  },
  {
    id: "AGT-005",
    name: "MarketAnalyzer",
    version: "v2.0",
    department: "Strategy",
    domain: "Market Intelligence",
    autonomy: "Conditional",
    autonomy_level: 55,
    policy: "POL-STR-004",
    status: "Active",
    constraints: [
      "Cannot initiate trades or purchases",
      "External data access limited to approved feeds",
    ],
    linked_policies: ["POL-STR-004", "POL-DATA-002"],
  },
];

export const MOCK_AGENTS_META = {
  active_count: 4,
  decision_rules_count: 147,
  escalations_today: 3,
};

export const MOCK_ESCALATION_RULES: EscalationRule[] = [
  {
    id: "ESC-001",
    severity: "CRITICAL",
    trigger: "Risk score exceeds 0.85 or financial impact > $5M",
    action:
      "Immediate suspension of agent decision authority. Alert CISO and CFO.",
    responsible: "CISO + CFO",
  },
  {
    id: "ESC-002",
    severity: "HIGH",
    trigger: "Policy violation count > 3 in 24h window",
    action:
      "Restrict agent to read-only mode. Notify department head and compliance.",
    responsible: "Department Head + Compliance",
  },
  {
    id: "ESC-003",
    severity: "MEDIUM",
    trigger: "Confidence score below 60% on any governance decision",
    action:
      "Flag for human review. Agent continues with reduced autonomy level.",
    responsible: "Team Lead",
  },
];
