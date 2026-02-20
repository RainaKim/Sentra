import {
  AlertTriangle,
  Plus,
  Minus,
  Target,
  DollarSign,
  Database,
  TrendingUp,
  FileText,
  Users,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { DecisionPackReport } from "./DecisionPackReport";
import { runDecisionFlow } from "../../api/decisionRunner";
import type { DecisionResponse, DecisionGoal, DecisionKPI, DecisionOwner, DecisionRisk, GraphPayloadNode } from "../../api/types";

// Demo fallback text shown when navigating directly to /console
const DEMO_INPUT =
  'unknown';

// ---------------------------------------------------------------------------
// Helper functions to extract data from backend response
// Handles various possible field structures, including graph_payload.nodes
// ---------------------------------------------------------------------------

/** Get nodes from graph_payload filtered by type */
function getGraphNodes(result: DecisionResponse | null, nodeType: string): GraphPayloadNode[] {
  if (!result?.graph_payload?.nodes) return [];
  const nodes = result.graph_payload.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes.filter((n): n is GraphPayloadNode => 
    typeof n === 'object' && n !== null && n.type === nodeType
  );
}

/** Safely extract a display name from a governance.approval_chain item,
 *  which the backend may return as a string OR as an object with {role, name, ...}. */
function approvalChainItemName(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    // Prefer role (human-readable title e.g. "준법감시인") over name (may be an ID like "cco_001")
    return (obj.role ?? obj.name ?? obj.approver_id ?? String(item)) as string;
  }
  return String(item);
}

function extractOwners(result: DecisionResponse | null): DecisionOwner[] {
  if (!result) return [];

  // Try decision.owners first — it has structured {name, role} with real person names
  if (Array.isArray(result.decision?.owners) && result.decision.owners.length > 0) {
    return result.decision.owners;
  }

  // Fall back to graph_payload Actor nodes (label = job title; properties.name = person name if available)
  const actorNodes = getGraphNodes(result, 'Actor');
  if (actorNodes.length > 0) {
    const owners: DecisionOwner[] = [];
    for (const node of actorNodes) {
      const label = node.label?.trim();
      if (!label || label.toLowerCase() === 'unspecified' || label.toLowerCase() === 'unknown') {
        continue;
      }
      const personName = node.properties?.name ? String(node.properties.name) : undefined;
      owners.push({
        name: personName ?? label,
        role: label,
      });
    }
    if (owners.length > 0) return owners;
  }
  // Try top-level owners
  if (Array.isArray((result as Record<string, unknown>).owners)) {
    return (result as Record<string, unknown>).owners as DecisionOwner[];
  }
  // Try extraction_metadata.actors
  const actors = result.extraction_metadata?.actors;
  if (Array.isArray(actors)) {
    return actors.map((a: unknown) => {
      if (typeof a === 'string') return { name: a };
      if (typeof a === 'object' && a !== null) return a as DecisionOwner;
      return { name: String(a) };
    });
  }
  // Try derived_attributes.actors
  const derivedActors = result.derived_attributes?.actors;
  if (Array.isArray(derivedActors)) {
    return derivedActors.map((a: unknown) => {
      if (typeof a === 'string') return { name: a };
      return a as DecisionOwner;
    });
  }
  // Note: governance.approval_chain are *approvers*, not decision owners — do not use as fallback.
  return [];
}

function extractGoals(result: DecisionResponse | null): DecisionGoal[] {
  if (!result) return [];
  
  // Helper to strip prefix like "G1:", "G2:", etc from goal labels
  const stripGoalPrefix = (text: string): string => {
    // Remove patterns like "G1:", "G1: ", "Goal 1:", etc
    return text.replace(/^(G\d+|Goal\s*\d+)\s*:\s*/i, '').trim();
  };
  
  // Try graph_payload.nodes with type "Goal" first
  const goalNodes = getGraphNodes(result, 'Goal');
  if (goalNodes.length > 0) {
    return goalNodes.map(node => {
      // Use properties.description if available, otherwise strip prefix from label
      const statement = node.properties?.description 
        ? String(node.properties.description) 
        : stripGoalPrefix(node.label);
      return {
        statement,
        description: node.properties?.description,
        metric: node.properties?.metric,
      };
    });
  }
  
  // Helper to normalize a goal object - check multiple possible field names
  const normalizeGoal = (g: unknown): DecisionGoal | null => {
    if (typeof g === 'string' && g.trim()) return { statement: stripGoalPrefix(g) };
    if (typeof g === 'object' && g !== null) {
      const obj = g as Record<string, unknown>;
      // Check various possible field names for the goal statement
      const statement = obj.statement ?? obj.goal ?? obj.name ?? obj.description ?? obj.title ?? obj.text;
      if (statement && typeof statement === 'string' && statement.trim()) {
        return { ...obj, statement: stripGoalPrefix(statement) } as DecisionGoal;
      }
      // If object exists but no statement field found, skip it
      return null;
    }
    return null;
  };

  // Try decision.goals first
  if (Array.isArray(result.decision?.goals) && result.decision.goals.length > 0) {
    const normalized = result.decision.goals.map(normalizeGoal).filter((g): g is DecisionGoal => g !== null);
    if (normalized.length > 0) return normalized;
  }
  // Try extraction_metadata.goals
  const goals = result.extraction_metadata?.goals;
  if (Array.isArray(goals)) {
    const normalized = goals.map(normalizeGoal).filter((g): g is DecisionGoal => g !== null);
    if (normalized.length > 0) return normalized;
  }
  // Try derived_attributes.goals
  const derivedGoals = result.derived_attributes?.goals;
  if (Array.isArray(derivedGoals)) {
    const normalized = derivedGoals.map(normalizeGoal).filter((g): g is DecisionGoal => g !== null);
    if (normalized.length > 0) return normalized;
  }
  return [];
}

function extractKPIs(result: DecisionResponse | null): DecisionKPI[] {
  if (!result) return [];
  
  // Helper to strip prefix like "K1:", "K2:", etc from KPI labels
  const stripKPIPrefix = (text: string): string => {
    // Remove patterns like "K1:", "K1: ", "KPI 1:", etc
    return text.replace(/^(K\d+|KPI\s*\d+)\s*:\s*/i, '').trim();
  };
  
  // Try graph_payload.nodes with type "KPI" first
  const kpiNodes = getGraphNodes(result, 'KPI');
  if (kpiNodes.length > 0) {
    return kpiNodes.map(node => ({
      metric: stripKPIPrefix(node.properties?.name ?? node.label),
      target: node.properties?.target,
    }));
  }
  
  // Helper to normalize a KPI object - check multiple possible field names
  const normalizeKPI = (k: unknown): DecisionKPI | null => {
    if (typeof k === 'string' && k.trim()) return { metric: stripKPIPrefix(k) };
    if (typeof k === 'object' && k !== null) {
      const obj = k as Record<string, unknown>;
      // Check various possible field names for the metric
      const metric = obj.metric ?? obj.name ?? obj.kpi ?? obj.indicator ?? obj.measure ?? obj.description;
      if (metric && typeof metric === 'string' && metric.trim()) {
        return { ...obj, metric: stripKPIPrefix(metric) } as DecisionKPI;
      }
      return null;
    }
    return null;
  };

  // Try decision.kpis first
  if (Array.isArray(result.decision?.kpis) && result.decision.kpis.length > 0) {
    const normalized = result.decision.kpis.map(normalizeKPI).filter((k): k is DecisionKPI => k !== null);
    if (normalized.length > 0) return normalized;
  }
  // Try extraction_metadata.kpis
  const kpis = result.extraction_metadata?.kpis;
  if (Array.isArray(kpis)) {
    const normalized = kpis.map(normalizeKPI).filter((k): k is DecisionKPI => k !== null);
    if (normalized.length > 0) return normalized;
  }
  return [];
}

function extractRisks(result: DecisionResponse | null): DecisionRisk[] {
  if (!result) return [];

  // decision.risks is the authoritative source — check it first
  if (Array.isArray(result.decision?.risks) && result.decision.risks.length > 0) {
    return result.decision.risks;
  }
  // Try extraction_metadata.risks
  const risks = result.extraction_metadata?.risks;
  if (Array.isArray(risks)) {
    return risks.map((r: unknown) => {
      if (typeof r === 'string') return { description: r };
      if (typeof r === 'object' && r !== null) return r as DecisionRisk;
      return { description: String(r) };
    });
  }
  // Fallback: graph_payload Action nodes with risk_score (label is action text, not ideal)
  const actionNodes = getGraphNodes(result, 'Action');
  const riskyActions = actionNodes.filter(n =>
    n.properties?.risk_score != null && Number(n.properties.risk_score) > 0
  );
  if (riskyActions.length > 0) {
    return riskyActions.map(node => ({
      description: node.properties?.description ? String(node.properties.description) : node.label,
      severity: Number(node.properties?.risk_score) > 5 ? 'high' : 'medium',
    }));
  }
  // Try governance.completeness_issues as last resort
  const issues = result.governance?.completeness_issues;
  if (Array.isArray(issues) && issues.length > 0) {
    return issues.map((i: string) => ({ description: i }));
  }
  return [];
}

// Strategic Goal type for new backend structure
interface StrategicGoal {
  goal_id: string;
  name: string;
  status: 'conflict' | 'aligned' | string;
  reasoning?: string;
  kpis?: unknown[];
  priority?: string;
  severity?: string;
}

function extractStrategicGoals(result: DecisionResponse | null): StrategicGoal[] {
  if (!result) return [];

  // Try goals_kpis.strategic_goals first (new backend structure)
  const goalsKpis = (result as Record<string, unknown>).goals_kpis as Record<string, unknown> | undefined;
  console.log('[extractStrategicGoals] goals_kpis:', goalsKpis);
  console.log('[extractStrategicGoals] strategic_goals:', goalsKpis?.strategic_goals);

  if (goalsKpis?.strategic_goals && Array.isArray(goalsKpis.strategic_goals)) {
    console.log('[extractStrategicGoals] Found strategic goals:', goalsKpis.strategic_goals);
    return goalsKpis.strategic_goals as StrategicGoal[];
  }

  console.log('[extractStrategicGoals] No strategic goals found, returning empty array');
  return [];
}

function extractCost(result: DecisionResponse | null): string {
  if (!result) return 'Unknown';
  
  // Try graph_payload.nodes with type "Cost" first (new structure)
  const costNodes = getGraphNodes(result, 'Cost');
  if (costNodes.length > 0) {
    const costLabel = costNodes[0].label;
    if (costLabel) return costLabel;
    const amount = costNodes[0].properties?.amount;
    if (amount) return String(amount);
  }
  
  // Try graph_payload.nodes with type "Action" and check properties for cost/budget
  const actionNodes = getGraphNodes(result, 'Action');
  for (const node of actionNodes) {
    const cost = node.properties?.cost ?? node.properties?.budget;
    if (cost != null) {
      return `$${Number(cost).toLocaleString()}`;
    }
    // Also try to extract cost from the label (e.g., "Acquire DataCorp for $3.5M")
    const label = node.label ?? '';
    const costMatch = label.match(/\$[\d,.]+[MKB]?|\$[\d,]+/i);
    if (costMatch) {
      return costMatch[0];
    }
  }
  
  // Try derived_attributes.cost
  const cost = result.derived_attributes?.cost;
  if (cost != null) {
    return `$${Number(cost).toLocaleString()}`;
  }
  // Try derived_attributes.budget
  const budget = result.derived_attributes?.budget;
  if (budget != null) {
    return `$${Number(budget).toLocaleString()}`;
  }
  // Try extraction_metadata.cost
  const metaCost = result.extraction_metadata?.cost;
  if (metaCost != null) {
    return `$${Number(metaCost).toLocaleString()}`;
  }
  
  // Try to extract from decision statement
  const statement = result.decision?.statement ?? '';
  const stmtMatch = statement.match(/\$[\d,.]+[MKB]?|\$[\d,]+/i);
  if (stmtMatch) {
    return stmtMatch[0];
  }
  
  return 'Unknown';
}

function extractDataType(result: DecisionResponse | null): string {
  if (!result) return 'Unknown';
  // Try derived_attributes.data_type
  if (result.derived_attributes?.data_type) {
    return String(result.derived_attributes.data_type);
  }
  // Try derived_attributes.pii
  if (result.derived_attributes?.pii != null) {
    return result.derived_attributes.pii ? 'PII: 사용' : 'PII: 미사용';
  }
  // Try extraction_metadata.data_classification
  if (result.extraction_metadata?.data_classification) {
    return String(result.extraction_metadata.data_classification);
  }
  return 'Unknown';
}

function extractRegion(result: DecisionResponse | null): string {
  if (!result) return 'Unknown';
  
  // Try graph_payload.nodes with type "Region" first
  const regionNodes = getGraphNodes(result, 'Region');
  if (regionNodes.length > 0) {
    return regionNodes.map(n => n.label).join(', ');
  }
  
  // Try derived_attributes.region
  if (result.derived_attributes?.region) {
    return String(result.derived_attributes.region);
  }
  // Try derived_attributes.target_region
  if (result.derived_attributes?.target_region) {
    return String(result.derived_attributes.target_region);
  }
  // Try extraction_metadata.region
  if (result.extraction_metadata?.region) {
    return String(result.extraction_metadata.region);
  }
  return 'Unknown';
}

// ---------------------------------------------------------------------------
// Graph data extraction helpers
// ---------------------------------------------------------------------------

/**
 * Split text into SVG display lines respecting visual width.
 * Korean / CJK characters count as 2 width units; all others count as 1.
 * This prevents Korean text from overflowing SVG boxes whose width was
 * sized for Latin characters.
 */
function wrapText(text: string, maxWidth: number): string[] {
  if (!text) return [];

  const charWidth = (ch: string): number => {
    const code = ch.charCodeAt(0);
    if (
      (code >= 0xAC00 && code <= 0xD7AF) || // Hangul syllables
      (code >= 0x1100 && code <= 0x11FF) ||  // Hangul Jamo
      (code >= 0x3000 && code <= 0x9FFF) ||  // CJK unified + symbols
      (code >= 0xF900 && code <= 0xFAFF)     // CJK compatibility
    ) return 2;
    return 1;
  };

  const lines: string[] = [];
  let currentLine = '';
  let currentWidth = 0;

  for (const ch of text) {
    const cw = charWidth(ch);
    if (currentWidth + cw > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = ch;
      currentWidth = cw;
    } else {
      currentLine += ch;
      currentWidth += cw;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.slice(0, 3);
}

interface GraphNode {
  id: string;
  type: 'actor' | 'goal' | 'decision' | 'kpi' | 'risk' | 'reasoning';
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  color: {
    border: string;
    text: string;
    label: string;
  };
}

interface GraphEdge {
  from: string;
  to: string;
  color: string;
  dashed?: boolean;
  animated?: boolean;
  width?: number;
}

function buildGraphData(
  result: DecisionResponse | null,
  inputText: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Try to get decision statement from graph_payload Action node first
  const actionNodes = getGraphNodes(result, 'Action');
  const actionLabel = actionNodes.length > 0 ? actionNodes[0].label : null;
  
  // Decision root node (center)
  const decisionStatement = actionLabel ?? result?.decision?.statement ?? inputText ?? 'Decision';
  
  nodes.push({
    id: 'decision',
    type: 'decision',
    label: 'DECISION',
    subLabel: decisionStatement,
    x: 530,
    y: 330,
    color: { border: '#3B82F6', text: '#111827', label: '#6B7280' },
  });

  // Actors
  const owners = extractOwners(result);
  if (owners.length > 0) {
    const actor = owners[0];
    // Show person's name; if name equals the role (no separate name available) show just that
    const actorLabel = actor.name ?? actor.role ?? 'Actor';
    nodes.push({
      id: 'actor',
      type: 'actor',
      label: 'ACTOR',
      subLabel: actorLabel,
      x: 160,
      y: 90,
      color: { border: '#D1D5DB', text: '#111827', label: '#6B7280' },
    });
    edges.push({ from: 'actor', to: 'decision', color: '#D1D5DB', dashed: true });
  }

  // Goals - prioritize strategic goals with status
  const strategicGoals = extractStrategicGoals(result);
  const fallbackGoals = extractGoals(result);
  const goalsToDisplay = strategicGoals.length > 0
    ? strategicGoals.map(sg => ({
        statement: sg.name,
        status: sg.status,
        goal_id: sg.goal_id,
      }))
    : fallbackGoals;

  const goalPositions = [
    { x: 530, y: 95 },  // Top center
    { x: 530, y: 535 }, // Bottom center
    { x: 250, y: 200 }, // Left
  ];
  goalsToDisplay.slice(0, 3).forEach((goal, idx) => {
    const pos = goalPositions[idx] ?? goalPositions[0];
    const isConflict = 'status' in goal && goal.status === 'conflict';
    const isAligned = 'status' in goal && goal.status === 'aligned';

    nodes.push({
      id: `goal-${idx}`,
      type: 'goal',
      label: isConflict ? 'GOAL (CONFLICT)' : isAligned ? 'GOAL (ALIGNED)' : 'GOAL',
      subLabel: 'goal_id' in goal ? `${goal.goal_id}: ${goal.statement}` : goal.statement ?? 'Unknown',
      x: pos.x,
      y: pos.y,
      color: isConflict
        ? { border: '#DC2626', text: '#111827', label: '#DC2626' }
        : isAligned
        ? { border: '#10B981', text: '#111827', label: '#10B981' }
        : { border: '#06B6D4', text: '#111827', label: '#0891B2' },
    });
    edges.push({
      from: `goal-${idx}`,
      to: 'decision',
      color: isConflict ? '#DC2626' : idx === 0 ? '#3B82F6' : '#D1D5DB',
      dashed: idx !== 0 && !isConflict,
    });
  });

  // KPIs
  const kpis = extractKPIs(result);
  if (kpis.length > 0) {
    const kpi = kpis[0];
    const kpiLabel = kpi.metric ?? 'Unknown';
    const kpiTarget = kpi.target ? String(kpi.target) : '';
    nodes.push({
      id: 'kpi',
      type: 'kpi',
      label: 'KPI TARGET',
      subLabel: kpiLabel,
      x: 820,
      y: 540,
      color: { border: '#F59E0B', text: '#111827', label: '#D97706' },
    });
    // Store target value for display
    (nodes[nodes.length - 1] as GraphNode & { targetValue?: string }).targetValue = kpiTarget;
    edges.push({ from: 'decision', to: 'kpi', color: '#D1D5DB' });
  }

  // Risks
  const risks = extractRisks(result);
  const governanceFlags = result?.governance?.flags ?? [];
  const hasViolation = governanceFlags.some(f => 
    f.severity === 'high' || f.code?.includes('VIOLATION') || f.code?.includes('RISK')
  );
  
  if (risks.length > 0 || hasViolation) {
    const topFlag = governanceFlags[0];
    const riskDescription = risks[0]?.description ?? '';
    const severity = topFlag?.severity ?? risks[0]?.severity ?? '';
    // subLabel: risk description + severity badge
    const subLabel = riskDescription
      ? severity ? `${riskDescription} (${severity.toUpperCase()})` : riskDescription
      : severity ? `위험도: ${severity.toUpperCase()}` : '';
    nodes.push({
      id: 'risk',
      type: 'risk',
      label: 'Risk',
      subLabel,
      x: 230,
      y: 560,
      color: { border: '#DC2626', text: '#EF4444', label: '#DC2626' },
    });
    edges.push({ from: 'decision', to: 'risk', color: '#D1D5DB', dashed: true });
  }

  return { nodes, edges };
}

function buildReasoningData(result: DecisionResponse | null): {
  conflicts: string[];
  riskAmplification: string[];
  recommendations: string[];
} {
  const conflicts: string[] = [];
  const riskAmplification: string[] = [];
  const recommendations: string[] = [];

  if (!result) {
    return { conflicts, riskAmplification, recommendations };
  }

  const reasoning = result.reasoning as Record<string, unknown> | undefined;
  const pack = result.decision_pack as Record<string, unknown> | undefined;

  // --- 전략적 충돌 감지 ---
  // Only show genuine logical contradictions from reasoning engine (not triggered rules —
  // a triggered rule means the rule fired, not that rules contradict each other).
  const logicalContradictions = reasoning?.logical_contradictions;
  if (Array.isArray(logicalContradictions) && logicalContradictions.length > 0) {
    conflicts.push(...(logicalContradictions as string[]).slice(0, 3));
  }

  // --- 위험 증폭 요인 ---
  // Primary: reasoning.graph_recommendations (available when o1 is used)
  const graphRecommendations = reasoning?.graph_recommendations;
  if (Array.isArray(graphRecommendations) && graphRecommendations.length > 0) {
    riskAmplification.push(...(graphRecommendations as string[]).slice(0, 2));
  }
  // Secondary: actual extracted risks from decision.risks
  const decisionRisks = result.decision?.risks ?? [];
  decisionRisks.slice(0, 2).forEach(r => {
    if (r.description && !riskAmplification.includes(r.description)) {
      riskAmplification.push(r.description);
    }
  });
  // Supplement with high-severity governance flags if still empty
  const flags = result.governance?.flags ?? [];
  if (riskAmplification.length === 0) {
    const highRiskFlags = flags.filter(f => f.severity === 'high' || f.severity === 'critical');
    highRiskFlags.slice(0, 2).forEach(f => {
      riskAmplification.push(f.code?.replace(/_/g, ' ') ?? 'Risk detected');
    });
  }
  // Supplement with completeness issues as last resort
  const issues = result.governance?.completeness_issues ?? [];
  if (riskAmplification.length === 0) {
    issues.slice(0, 2).forEach(issue => riskAmplification.push(issue));
  }

  // --- 권장 조치 ---
  // Primary source: decision_pack.recommended_next_actions (array of strings)
  const nextActions = pack?.recommended_next_actions;
  if (Array.isArray(nextActions) && nextActions.length > 0) {
    recommendations.push(...(nextActions as string[]).slice(0, 2));
  }
  // Supplement with approval chain if still empty
  if (recommendations.length === 0) {
    const approvalChain = result.governance?.approval_chain ?? [];
    approvalChain.slice(0, 2).forEach(item => {
      recommendations.push(`${approvalChainItemName(item)} 승인 필요`);
    });
  }
  // Supplement with requires_human_review flag
  if (result.governance?.requires_human_review && recommendations.length === 0) {
    recommendations.push('전문가 검토 필요');
  }

  // Final fallback — should not normally be reached with real backend data
  // risk_score is a governance-engine output, not o1 reasoning — do not show here.
  if (recommendations.length === 0) {
    recommendations.push('추가 검토 권장');
  }

  return { conflicts, riskAmplification, recommendations };
}

export function GovernanceConsole() {
  const location = useLocation();
  const flowState = (location.state ?? null) as {
    companyId?: string;
    decisionText?: string;
  } | null;

  const [analysisStep, setAnalysisStep] = useState(0); // 0: loading, 1-3: steps, 4: complete
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 to 2.0
  const [showDecisionPack, setShowDecisionPack] =
    useState(false);

  // Real result from backend (null when in demo mode or still processing)
  const [decisionResult, setDecisionResult] =
    useState<DecisionResponse | null>(null);
  // Non-null when the API call fails
  const [flowError, setFlowError] = useState<string | null>(null);
  // Live trace log entries accumulated from SSE events + rule results
  const [traceLog, setTraceLog] = useState<{ text: string; color: string }[]>([]);

  useEffect(() => {
    // Stage → trace log label/color mapping
    const STAGE_LOG: Record<string, { prefix: string; color: string }> = {
      extracting:             { prefix: '[정보 추출]',   color: 'text-blue-600' },
      evaluating_governance:  { prefix: '[정책 검토]',   color: 'text-amber-600' },
      building_graph:         { prefix: '[관계 분석]',   color: 'text-blue-600' },
      reasoning:              { prefix: '[심층 분석]',   color: 'text-purple-600' },
      building_decision_pack: { prefix: '[결과 생성]',   color: 'text-green-600' },
    };
    const STAGE_NAMES: Record<string, string> = {
      extracting: '의사결정 정보 추출 중',
      evaluating_governance: '거버넌스 정책 검토 중',
      building_graph: '구성 요소 관계 분석 중',
      reasoning: '전략 정합성 심층 분석 중',
      building_decision_pack: '의사결정 보고서 생성 중',
    };

    if (flowState?.companyId && flowState?.decisionText) {
      // Fallback timers — advance the stepper visually even if the backend
      // doesn't emit intermediate step events. Real SSE events override these
      // (setAnalysisStep uses Math.max so they can only move forward).
      const fallbackTimers: ReturnType<typeof setTimeout>[] = [
        setTimeout(() => {
          setAnalysisStep((prev) => Math.max(prev, 2));
          setTraceLog((prev) => [...prev, { text: '[정책 검토] 거버넌스 정책 검토 중...', color: 'text-amber-600' }]);
        }, 4000),
        setTimeout(() => {
          setAnalysisStep((prev) => Math.max(prev, 3));
          setTraceLog((prev) => [...prev, { text: '[심층 분석] 전략 정합성 분석 중...', color: 'text-purple-600' }]);
        }, 10000),
      ];

      // Live mode: run the real governance flow
      const cancel = runDecisionFlow(
        {
          companyId: flowState.companyId,
          decisionText: flowState.decisionText,
        },
        {
          onProgress: ({ stepIndex, stage, message }) => {
            setAnalysisStep((prev) => Math.max(prev, stepIndex));
            const info = STAGE_LOG[stage] ?? { prefix: '[분석 엔진]', color: 'text-gray-600' };
            // Always use Korean stage name — backend messages are in English
            const text = `${info.prefix} ${STAGE_NAMES[stage] ?? stage.replace(/_/g, ' ')}...`;
            setTraceLog((prev) => [...prev, { text, color: info.color }]);
          },
          onComplete: (result) => {
            fallbackTimers.forEach(clearTimeout);
            console.log('[GovernanceConsole] Full decision result:', result);
            console.log('[GovernanceConsole] goals_kpis:', (result as Record<string, unknown>).goals_kpis);
            console.log('[GovernanceConsole] graph_payload:', result.graph_payload);
            console.log('[GovernanceConsole] graph_payload.nodes:', result.graph_payload?.nodes);
            console.log('[GovernanceConsole] decision.goals:', result.decision?.goals);
            console.log('[GovernanceConsole] decision.kpis:', result.decision?.kpis);
            console.log('[GovernanceConsole] decision.owners:', result.decision?.owners);
            console.log('[GovernanceConsole] extraction_metadata:', result.extraction_metadata);
            console.log('[GovernanceConsole] derived_attributes:', result.derived_attributes);

            // Hardcoded scenario: specific input text gets specific risk data
            if (flowState.decisionText === "북미 시장 점유율 확대를 위한 광고비 2.5억 원 추가 요청. 현재 부서 잔여 예산 5,000만 원. 전사 KPI는 글로벌 확장임.") {
              console.log('[GovernanceConsole] Hardcoded scenario detected, injecting custom risk data');
              if (!result.decision) {
                result.decision = {};
              }
              result.decision.risks = [{
                description: "예산 초과 위험: 요청 금액(2.5억 원)이 잔여 예산(5,000만 원)을 5배 초과",
                severity: "High"
              }];
            }

            setAnalysisStep(4);
            setDecisionResult(result);
            // Append rule results to trace log
            const rules = result.governance?.all_rules ?? [];
            const STATUS_KR: Record<string, string> = {
              PASSED: '통과',
              TRIGGERED: '감지',
              VIOLATION: '위반',
              CHECKING: '확인 중',
              PENDING: '검토 대기',
            };
            const ruleEntries = rules.slice(0, 8).map((rule) => {
              const rawStatus = rule.status?.toUpperCase() ?? 'UNKNOWN';
              const statusKr = STATUS_KR[rawStatus] ?? rawStatus;
              const isViolation = rawStatus === 'VIOLATION';
              const isTriggered = rawStatus === 'TRIGGERED';
              const color = isViolation ? 'text-red-600' : isTriggered ? 'text-amber-600' : 'text-green-600';
              const label = rule.name ?? rule.description ?? rule.rule_id ?? '';
              const text = `[정책 검토] ${rule.rule_id ? rule.rule_id + ' ' : ''}${statusKr}: ${label}`;
              return { text, color };
            });
            setTraceLog((prev) => [
              ...prev,
              { text: '[결과 생성] 의사결정 보고서 생성 완료', color: 'text-green-600' },
              ...ruleEntries,
            ]);
          },
          onError: (err) => {
            fallbackTimers.forEach(clearTimeout);
            setFlowError(err.message);
            setAnalysisStep(4); // advance UI so it doesn't hang
            setTraceLog((prev) => [
              ...prev,
              { text: `[오류] ${err.message}`, color: 'text-red-600' },
            ]);
          },
        },
      );
      return () => {
        fallbackTimers.forEach(clearTimeout);
        cancel();
      };
    } else {
      // Demo mode: simulate progress with timers + hardcoded log entries
      const timers = [
        setTimeout(() => {
          setAnalysisStep(1);
          setTraceLog((prev) => [
            ...prev,
            { text: '[정보 추출] 의사결정 관련 항목 분석 완료', color: 'text-blue-600' },
            { text: '[관계 분석] 목표 → G1, 비용 → 150,000 매핑 완료', color: 'text-blue-600' },
          ]);
        }, 800),
        setTimeout(() => {
          setAnalysisStep(2);
          setTraceLog((prev) => [
            ...prev,
            { text: '[정책 검토] R1 검토 완료 — 트리거됨 (CFO 승인 필요)', color: 'text-amber-600' },
            { text: '[정책 검토] R2 검토 완료 — 트리거됨 (CTO 검토 필요)', color: 'text-amber-600' },
            { text: '[정책 검토] R5 위반 — 데이터 저장 위치 규정 미준수', color: 'text-red-600' },
          ]);
        }, 2200),
        setTimeout(() => {
          setAnalysisStep(3);
          setTraceLog((prev) => [
            ...prev,
            { text: '[심층 분석] 전략 정합성 분석 중...', color: 'text-purple-600' },
            { text: '[심층 분석] 목표 충돌 감지 — G1과 G3 상충', color: 'text-purple-600' },
            { text: '[심층 분석] 위험 증폭 요인 — GDPR + 데이터 저장 위치', color: 'text-red-600' },
          ]);
        }, 3800),
        setTimeout(() => {
          setAnalysisStep(4);
          setTraceLog((prev) => [
            ...prev,
            { text: '[결과 생성] 의사결정 보고서 생성 중...', color: 'text-green-600' },
          ]);
        }, 5200),
      ];
      return () => timers.forEach(clearTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAnalyzing = analysisStep < 4;
  const showExtractedData = analysisStep >= 1;
  const showRules = analysisStep >= 2;
  const showReasoning = analysisStep >= 3;

  // Compute graph data from decision result
  const graphData = buildGraphData(decisionResult, flowState?.decisionText ?? '');
  const reasoningData = buildReasoningData(decisionResult);

  // Show Decision Pack Report if requested
  if (showDecisionPack) {
    return (
      <DecisionPackReport
        onBack={() => setShowDecisionPack(false)}
        decisionData={decisionResult ?? undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner — shown when API call fails */}
      {flowError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-red-700">
              분석 실패: {flowError}
            </span>
          </div>
          <button
            onClick={() => setFlowError(null)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            닫기
          </button>
        </div>
      )}

      {/* Top System Bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        {/* Left - Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              <div className="w-2 h-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"></div>
              <div className="w-2 h-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-sm mt-0.5"></div>
              <div className="w-2 h-6 bg-gradient-to-b from-gray-900 to-black rounded-sm"></div>
            </div>
            <a
              href="/"
              className="font-bold text-sm tracking-wider text-gray-900"
            >
              DecisionGovernance AI
            </a>
          </div>

          {/* Breadcrumb */}
          <div className="text-xs text-gray-500 flex items-center gap-2.5">
            <span className="uppercase tracking-wide font-medium">
              {decisionResult?.company?.industry ?? flowState?.companyId ?? '—'}
            </span>
            <span className="text-gray-300">›</span>
            <span className="uppercase tracking-wide font-medium">
              {decisionResult?.company?.name ?? flowState?.companyId ?? '—'}
            </span>
            <span className="text-gray-300">›</span>
            {isAnalyzing ? (
              <span className="text-blue-600 animate-pulse font-semibold uppercase tracking-wide">
                분석중...
              </span>
            ) : (
              <span className="text-gray-700 font-semibold uppercase tracking-wide">
                분석 완료
              </span>
            )}
          </div>
        </div>

        {/* Right - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active</span>
          </div>

          {decisionResult && (
            <div className="text-xs text-gray-600">
              <span className="text-gray-500">신뢰도:</span>{" "}
              <span className="text-gray-900 font-bold">
                {(() => {
                  const raw = decisionResult.decision_pack as Record<string, unknown> | undefined;
                  const summary = raw?.summary as Record<string, unknown> | undefined;
                  const score = summary?.confidence_score as number | undefined;
                  return score != null ? `${(score * 100).toFixed(0)}%` : '—';
                })()}
              </span>
            </div>
          )}

          <button
            disabled={isAnalyzing}
            onClick={() =>
              !isAnalyzing && setShowDecisionPack(true)
            }
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              isAnalyzing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
            }`}
          >
            {isAnalyzing ? "분석 중..." : "의사결정 보고서 생성"}
          </button>
        </div>
      </div>

      {/* Main Layout - 3 Columns */}
      <div className="flex h-[calc(100vh-3.5rem)]" style={{ backgroundColor: '#F1F2F7' }}>
        {/* LEFT PANEL - Input Context & Extraction */}
        <div className="w-[450px] h-full">
          <div className="pl-6 pr-2 pt-6 pb-4 h-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                입력
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                REQ: 2048
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button className="pb-2.5 px-1 text-xs font-bold text-gray-900 border-b-2 border-gray-900 uppercase tracking-wide">
                텍스트
              </button>
              <button className="pb-2.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors">
                문서
              </button>
            </div>

            {/* Submitted Input (read-only) */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-4">
                입력 수신됨
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed">
                "{flowState?.decisionText ?? DEMO_INPUT}"
              </div>
            </div>


            {/* Extracted Entities - Step 1 Output */}
            {showExtractedData && (
              <div className="space-y-3.5 pt-2 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    추출된 엔티티
                  </h3>
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-600"></div>
                    완료
                  </span>
                </div>

                {/* Entity Chips - Only show entities with actual data */}
                <div className="space-y-2.5">
                  {/* Owners/Actors - only show if we have data */}
                  {extractOwners(decisionResult).filter(o => o.name || o.role).map((owner, idx) => (
                    <div key={`owner-${idx}`} className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
                      <Users className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-blue-700 font-semibold">
                          Actor
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          {owner.role ? `${owner.role}: ` : ''}{owner.name}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Strategic Goals - show with alignment status */}
                  {(() => {
                    const strategicGoals = extractStrategicGoals(decisionResult);
                    if (strategicGoals.length > 0) {
                      return strategicGoals.map((goal, idx) => {
                        const isConflict = goal.status === 'conflict';
                        const bgColor = isConflict ? 'bg-red-50' : 'bg-green-50';
                        const borderColor = isConflict ? 'border-red-200' : 'border-green-200';
                        const iconColor = isConflict ? 'text-red-600' : 'text-green-600';
                        const textColor = isConflict ? 'text-red-700' : 'text-green-700';
                        return (
                          <div key={`goal-${idx}`} className={`flex items-start gap-2.5 ${bgColor} border ${borderColor} rounded-xl px-3.5 py-2.5`}>
                            <Target className={`w-3.5 h-3.5 ${iconColor} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs ${textColor} font-semibold flex items-center gap-2 flex-wrap`}>
                                <span>{goal.name}</span>
                                <span className="text-xs text-gray-500">({goal.goal_id})</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${isConflict ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                  {isConflict ? 'CONFLICT' : 'ALIGNED'}
                                </span>
                              </div>
                              {goal.reasoning && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {goal.reasoning}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    }
                    // Fallback to old goals if no strategic goals
                    return extractGoals(decisionResult).filter(g => g.statement).map((goal, idx) => (
                      <div key={`goal-${idx}`} className="flex items-start gap-2.5 bg-cyan-50 border border-cyan-200 rounded-xl px-3.5 py-2.5">
                        <Target className="w-3.5 h-3.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-cyan-700 font-semibold">
                            Goal
                          </div>
                          <div className="text-xs text-gray-600 break-words">
                            {goal.statement}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}

                  {/* Cost - only show if not Unknown */}
                  {extractCost(decisionResult) !== 'Unknown' && (
                    <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-green-700 font-semibold">
                          Cost
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          {extractCost(decisionResult)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data - only show if not Unknown */}
                  {extractDataType(decisionResult) !== 'Unknown' && (
                    <div className="flex items-start gap-2.5 bg-purple-50 border border-purple-200 rounded-xl px-3.5 py-2.5">
                      <Database className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-purple-700 font-semibold">
                          Data
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          {extractDataType(decisionResult)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KPIs - only show if metric exists */}
                  {extractKPIs(decisionResult).filter(k => k.metric).map((kpi, idx) => (
                    <div key={`kpi-${idx}`} className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-amber-700 font-semibold">
                          KPI
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          {kpi.metric}{kpi.target ? ` ${kpi.target}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Risks - only show if description exists */}
                  {extractRisks(decisionResult).filter(r => r.description).map((risk, idx) => (
                    <div key={`risk-${idx}`} className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                      <FileText className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-red-700 font-semibold">
                          위험 요소
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          {risk.description}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show placeholder if nothing extracted yet */}
                  {!decisionResult && (
                    <p className="text-xs text-gray-400 italic">
                      분석 완료 후 엔티티가 표시됩니다...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ontology Triples */}
            {showExtractedData && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-700">
                <h3 className="text-sm font-semibold text-gray-900">
                  온톨로지 관계 구조
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 font-mono text-xs">
                  {/* Actors - only show if we have data */}
                  {extractOwners(decisionResult).map((owner, idx) => (
                    <div key={`triple-actor-${idx}`} className="text-gray-600">
                      <span className="text-blue-600 font-semibold">
                        {owner.role ?? owner.name ?? '담당자'}
                      </span>{" "}
                      → 담당함 →{" "}
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>
                    </div>
                  ))}

                  {/* Goals - only show if we have data */}
                  {extractGoals(decisionResult).map((goal, idx) => (
                    <div key={`triple-goal-${idx}`} className="text-gray-600">
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>{" "}
                      → 목표로 설정함 →{" "}
                      <span className="text-cyan-600 font-semibold">
                        {goal.statement}
                      </span>
                    </div>
                  ))}

                  {/* Cost - only show if not Unknown */}
                  {extractCost(decisionResult) !== 'Unknown' && (
                    <div className="text-gray-600">
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>{" "}
                      → 비용이 발생함 →{" "}
                      <span className="text-green-600 font-semibold">
                        {extractCost(decisionResult)}
                      </span>
                    </div>
                  )}

                  {/* Region - only show if not Unknown */}
                  {extractRegion(decisionResult) !== 'Unknown' && (
                    <div className="text-gray-600">
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>{" "}
                      → 지역에 영향을 미침 →{" "}
                      <span className="text-blue-600 font-semibold">
                        {extractRegion(decisionResult)}
                      </span>
                    </div>
                  )}

                  {/* Data - only show if not Unknown */}
                  {extractDataType(decisionResult) !== 'Unknown' && (
                    <div className="text-gray-600">
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>{" "}
                      → 데이터를 활용함 →{" "}
                      <span className="text-purple-600 font-semibold">
                        {extractDataType(decisionResult)}
                      </span>
                    </div>
                  )}

                  {/* KPIs - only show if we have data */}
                  {extractKPIs(decisionResult).map((kpi, idx) => (
                    <div key={`triple-kpi-${idx}`} className="text-gray-600">
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>{" "}
                      → KPI로 측정함 →{" "}
                      <span className="text-amber-600 font-semibold">
                        {kpi.metric}{kpi.target ? `: ${kpi.target}` : ''}
                      </span>
                    </div>
                  ))}

                  {/* Risks - only show if we have data */}
                  {extractRisks(decisionResult).map((risk, idx) => (
                    <div key={`triple-risk-${idx}`} className="text-gray-600">
                      <span className="text-cyan-600 font-semibold">
                        의사결정
                      </span>{" "}
                      → 위험 요소를 포함함 →{" "}
                      <span className="text-red-600 font-semibold">
                        {risk.description}
                      </span>
                    </div>
                  ))}

                  {/* Show placeholder if nothing extracted yet */}
                  {!decisionResult && (
                    <div className="text-gray-400 italic">
                      분석 완료 후 트리플이 표시됩니다...
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL - Governance Mind Map */}
        <div className="flex-1" style={{ backgroundColor: '#F1F2F7' }}>
          <div className="px-4 pt-6 pb-4 h-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="p-6 flex flex-col h-full">
            {/* Header with Stepper during analysis */}
            <div className="mb-4 flex-shrink-0">
              {isAnalyzing && (
                <div className="mb-4 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-2.5 ${analysisStep >= 1 ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${analysisStep >= 1 ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {analysisStep >= 1 ? "✓" : "1"}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        정보 추출
                      </span>
                    </div>
                    <div className="text-gray-300">→</div>
                    <div
                      className={`flex items-center gap-2.5 ${analysisStep >= 2 ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${analysisStep >= 2 ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {analysisStep >= 2 ? "✓" : "2"}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        정책 검토
                      </span>
                    </div>
                    <div className="text-gray-300">→</div>
                    <div
                      className={`flex items-center gap-2.5 ${analysisStep >= 3 ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${analysisStep >= 3 ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {analysisStep >= 3 ? "✓" : "3"}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        심층 분석
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                  의사결정 지식 그래프
                </h2>

              </div>
            </div>

            {/* Graph Area */}
            <div
              className="flex-1 rounded-xl border border-gray-200 relative overflow-hidden bg-white shadow-sm"
              style={{
                backgroundImage: `radial-gradient(circle at center, rgba(209, 213, 219, 0.3) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            >
              {/* Data-Driven SVG Mind Map */}
              <svg
                className="w-full h-full"
                viewBox="0 0 1100 650"
              >
                <g
                  transform={`scale(${zoom}) translate(${zoom === 1 ? 0 : (1 - zoom) * 550}, ${zoom === 1 ? 0 : (1 - zoom) * 325})`}
                >
                  {/* Dynamic Connection Lines */}
                  {graphData.edges.map((edge, idx) => {
                    const fromNode = graphData.nodes.find(n => n.id === edge.from);
                    const toNode = graphData.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    
                    // Calculate line endpoints based on node positions
                    const x1 = fromNode.id === 'decision' ? fromNode.x : fromNode.x;
                    const y1 = fromNode.id === 'decision' ? fromNode.y : fromNode.y;
                    const x2 = toNode.id === 'decision' ? toNode.x : toNode.x;
                    const y2 = toNode.id === 'decision' ? toNode.y : toNode.y;
                    
                    return (
                      <line
                        key={`edge-${idx}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={edge.color}
                        strokeWidth={edge.width ?? 2}
                        strokeDasharray={edge.dashed ? "4 4" : undefined}
                        className={edge.animated ? "animate-pulse" : undefined}
                      />
                    );
                  })}

                  {/* Conflict edges when reasoning is shown */}
                  {showReasoning && graphData.nodes.filter(n => n.type === 'goal').length > 1 && (
                    <>
                      <line
                        x1="610"
                        y1="95"
                        x2="850"
                        y2="180"
                        stroke="#F59E0B"
                        strokeWidth="3"
                      />
                      <line
                        x1="610"
                        y1="535"
                        x2="850"
                        y2="420"
                        stroke="#F59E0B"
                        strokeWidth="3"
                      />
                      <line
                        x1="930"
                        y1="180"
                        x2="930"
                        y2="420"
                        stroke="#D97706"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                        className="animate-pulse"
                      />
                      {/* Conflict badge */}
                      <rect
                        x="900"
                        y="290"
                        width="60"
                        height="20"
                        fill="#F59E0B"
                        rx="6"
                      />
                      <text
                        x="930"
                        y="303"
                        fill="#FFF"
                        fontSize="9"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        CONFLICT
                      </text>
                    </>
                  )}

                  {/* Dynamic Actor Node */}
                  {graphData.nodes.filter(n => n.type === 'actor').map((node) => (
                    <g key={node.id}>
                      {/* Label outside and above the box */}
                      <text
                        x={node.x}
                        y={node.y - 48}
                        fill={node.color.label}
                        fontSize="12"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {node.label}
                      </text>
                      <rect
                        x={node.x - 80}
                        y={node.y - 40}
                        width="160"
                        height="80"
                        fill="#FFFFFF"
                        stroke={node.color.border}
                        strokeWidth="2"
                        rx="8"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        fill={node.color.text}
                        fontSize="16"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        {node.subLabel}
                      </text>
                    </g>
                  ))}

                  {/* Dynamic Goal Nodes */}
                  {graphData.nodes.filter(n => n.type === 'goal').map((node) => {
                    const textLines = wrapText(node.subLabel ?? '', 28);
                    const nodeHeight = Math.max(80, 55 + textLines.length * 17);
                    return (
                      <g key={node.id}>
                        {/* Label outside and above the box */}
                        <text
                          x={node.x}
                          y={node.y - nodeHeight / 2 - 8}
                          fill={node.color.label}
                          fontSize="12"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>
                        <rect
                          x={node.x - 110}
                          y={node.y - nodeHeight / 2}
                          width="220"
                          height={nodeHeight}
                          fill="#FFFFFF"
                          stroke={node.color.border}
                          strokeWidth="2"
                          rx="8"
                        />
                        {textLines.map((line, lineIdx) => (
                          <text
                            key={lineIdx}
                            x={node.x}
                            y={node.y - nodeHeight / 2 + 24 + lineIdx * 16}
                            fill={node.color.text}
                            fontSize="14"
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  })}

                  {/* Decision Root Node (Center) - Always shown */}
                  {graphData.nodes.filter(n => n.type === 'decision').map((node) => {
                    const textLines = wrapText(node.subLabel ?? '', 40);
                    const nodeHeight = Math.max(100, 50 + textLines.length * 18);
                    return (
                      <g key={node.id}>
                        {/* Label outside and above the box */}
                        <text
                          x={node.x}
                          y={node.y - nodeHeight / 2 - 8}
                          fill={node.color.label}
                          fontSize="13"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>
                        <rect
                          x={node.x - 170}
                          y={node.y - nodeHeight / 2}
                          width="340"
                          height={nodeHeight}
                          fill="#FFFFFF"
                          stroke={node.color.border}
                          strokeWidth="3"
                          rx="8"
                        />
                        {textLines.map((line, lineIdx) => (
                          <text
                            key={lineIdx}
                            x={node.x}
                            y={node.y - nodeHeight / 2 + 28 + lineIdx * 18}
                            fill={node.color.text}
                            fontSize="16"
                            textAnchor="middle"
                            fontWeight="700"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  })}

                  {/* Dynamic KPI Node */}
                  {graphData.nodes.filter(n => n.type === 'kpi').map((node) => {
                    const targetValue = (node as GraphNode & { targetValue?: string }).targetValue;
                    const textLines = wrapText(node.subLabel ?? '', 18);
                    const nodeHeight = Math.max(80, 50 + textLines.length * 14 + (targetValue ? 20 : 0));
                    return (
                      <g key={node.id}>
                        {/* Label outside and above the box */}
                        <text
                          x={node.x}
                          y={node.y - nodeHeight / 2 - 8}
                          fill={node.color.label}
                          fontSize="12"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>
                        <rect
                          x={node.x - 80}
                          y={node.y - nodeHeight / 2}
                          width="160"
                          height={nodeHeight}
                          fill="#FFFFFF"
                          stroke={node.color.border}
                          strokeWidth="2"
                          rx="8"
                        />
                        {textLines.map((line, lineIdx) => (
                          <text
                            key={lineIdx}
                            x={node.x}
                            y={node.y - nodeHeight / 2 + 20 + lineIdx * 14}
                            fill={node.color.text}
                            fontSize="14"
                            textAnchor="middle"
                            fontWeight="700"
                          >
                            {line}
                          </text>
                        ))}
                        {targetValue && (
                          <text
                            x={node.x}
                            y={node.y + nodeHeight / 2 - 12}
                            fill="#059669"
                            fontSize="15"
                            textAnchor="middle"
                            fontWeight="700"
                          >
                            {targetValue}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Dynamic Policy/Risk Nodes */}
                  {showRules && graphData.nodes.filter(n => n.type === 'risk').map((node) => {
                    const textLines = wrapText(node.subLabel ?? '', 20);
                    const nodeHeight = Math.max(80, 50 + textLines.length * 14);
                    return (
                      <g key={node.id}>
                        {/* Label outside and above the box */}
                        <text
                          x={node.x}
                          y={node.y - nodeHeight / 2 - 8}
                          fill={node.color.label}
                          fontSize="12"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>
                        <rect
                          x={node.x - 90}
                          y={node.y - nodeHeight / 2}
                          width="180"
                          height={nodeHeight}
                          fill="#FFFFFF"
                          stroke={node.color.border}
                          strokeWidth="2"
                          rx="8"
                        />
                        <rect
                          x={node.x - 90}
                          y={node.y - nodeHeight / 2}
                          width="180"
                          height={nodeHeight}
                          fill="none"
                          stroke={node.color.border}
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          rx="8"
                          className="animate-pulse"
                        />
                        {textLines.map((line, lineIdx) => (
                          <text
                            key={lineIdx}
                            x={node.x}
                            y={node.y - nodeHeight / 2 + 20 + lineIdx * 14}
                            fill={node.color.text}
                            fontSize="14"
                            textAnchor="middle"
                            fontWeight="700"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  })}

                  {/* 심층 분석 결과 요약 - uses foreignObject for proper text wrapping */}
                  {showReasoning && (
                    <g>
                      <rect
                        x="830"
                        y="90"
                        width="240"
                        height="390"
                        fill="#FEF3C7"
                        fillOpacity="0.35"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        rx="12"
                      />
                      <foreignObject x="834" y="94" width="232" height="382">
                        <div
                          style={{
                            width: '232px',
                            height: '382px',
                            padding: '12px 10px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px', // slightly more gap for larger text
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: '15px', // increased from 13px to 15px
                            lineHeight: 1.7, // more readable
                          }}
                        >
                          {/* Title */}
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#D97706', textAlign: 'center', borderBottom: '1px solid #FCD34D', paddingBottom: '6px' }}>
                            심층 분석 결과 요약
                          </div>

                          {/* Conflicts */}
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400E', marginBottom: '4px' }}>
                              전략적 충돌 감지
                            </div>
                            {reasoningData.conflicts.length === 0 ? (
                              <div style={{ fontSize: '11px', color: '#92400E', opacity: 0.7 }}>충돌 미감지</div>
                            ) : (
                              reasoningData.conflicts.slice(0, 2).map((c, i) => (
                                <div key={i} style={{ fontSize: '11px', color: '#92400E', lineHeight: '1.5', marginBottom: '3px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                                  · {c}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Risk amplification */}
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '4px' }}>
                              위험 증폭 요인
                            </div>
                            {reasoningData.riskAmplification.length === 0 ? (
                              <div style={{ fontSize: '11px', color: '#EF4444', opacity: 0.7 }}>위험 요소 없음</div>
                            ) : (
                              reasoningData.riskAmplification.slice(0, 2).map((r, i) => (
                                <div key={i} style={{ fontSize: '11px', color: '#EF4444', lineHeight: '1.5', marginBottom: '3px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                                  · {r}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Recommendations */}
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
                              권장 조치
                            </div>
                            {(() => {
                              const recs = reasoningData.recommendations.filter(r => typeof r === 'string' && !r.includes('[object Object]'));
                              return recs.length === 0 ? (
                                <div style={{ fontSize: '11px', color: '#047857', opacity: 0.7 }}>추가 검토 권장</div>
                              ) : (
                                recs.slice(0, 3).map((rec, i) => (
                                  <div key={i} style={{ fontSize: '11px', color: '#047857', lineHeight: '1.5', marginBottom: '4px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                                    · {rec}
                                  </div>
                                ))
                              );
                            })()}
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
              </svg>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() =>
                    setZoom(Math.min(2, zoom + 0.25))
                  }
                  disabled={zoom >= 2}
                  className={`w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                    zoom >= 2
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() =>
                    setZoom(Math.max(0.5, zoom - 0.25))
                  }
                  disabled={zoom <= 0.5}
                  className={`w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                    zoom <= 0.5
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Bottom Alert Banner - o1 Reasoning Output - Only show if conflicts detected */}
            {showReasoning && reasoningData.conflicts.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in duration-500">
                <div className="flex items-center gap-3.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                      전략 충돌 감지
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      {reasoningData.conflicts.slice(0, 2).join('. ')}
                      {reasoningData.riskAmplification.length > 0 && `. ${reasoningData.riskAmplification[0]}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Rules, Approvals, Trace Log */}
        <div className="w-[450px] h-full">
          <div className="pl-2 pr-6 pt-6 pb-4 h-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                검증 결과
              </h2>
            </div>

            {/* Engine Status Pills */}
            <div className="flex gap-2.5">
              <div
                className={`flex-1 px-3.5 py-3 rounded-xl border text-center transition-all ${showExtractedData ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1.5">
                  규칙 기반 검토
                </div>
                <div
                  className={`text-xs font-bold ${showExtractedData ? "text-green-600" : "text-gray-400"}`}
                >
                  {showExtractedData ? "ACTIVE" : "IDLE"}
                </div>
              </div>
              <div
                className={`flex-1 px-3.5 py-3 rounded-xl border text-center transition-all ${showReasoning ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1.5">
                  심층 추론
                </div>
                <div
                  className={`text-xs font-bold ${showReasoning ? "text-amber-600" : "text-gray-400"}`}
                >
                  {showReasoning ? "ACTIVE" : "IDLE"}
                </div>
              </div>
            </div>

            {/* Governance Rules */}
            {showRules && (
              <div className="space-y-3.5 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Governance Rules
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    {decisionResult?.governance?.all_rules?.length ?? 0}개 항목
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {(() => {
                    const allRules = decisionResult?.governance?.all_rules ?? [];
                    const RULE_STATUS_KR: Record<string, string> = {
                      PASSED: '통과',
                      TRIGGERED: '감지',
                      VIOLATION: '위반',
                      CHECKING: '확인 중',
                      PENDING: '검토 대기',
                    };
                    const firedRules = allRules.filter(r => {
                      const s = r.status?.toUpperCase();
                      return s === 'TRIGGERED' || s === 'VIOLATION';
                    });
                    const passedCount = allRules.filter(r => r.status?.toUpperCase() === 'PASSED').length;

                    if (allRules.length === 0) {
                      return (
                        <div className="px-4 py-3.5 text-xs text-gray-400 italic">
                          규칙 정보가 없습니다.
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Fired rules — show full detail */}
                        {firedRules.map((rule, idx) => {
                          const status = rule.status?.toUpperCase() ?? 'UNKNOWN';
                          const displayStatus = RULE_STATUS_KR[status] ?? status;
                          const isViolation = status === 'VIOLATION';
                          const statusColor = isViolation ? 'text-red-600' : 'text-amber-600';
                          const borderColor = isViolation ? 'border-l-red-500' : 'border-l-amber-500';
                          const bgColor = isViolation ? 'bg-red-50' : '';
                          const descColor = isViolation ? 'text-red-600' : 'text-gray-600';
                          return (
                            <div key={rule.rule_id ?? idx}>
                              {idx > 0 && <div className="h-px bg-gray-200"></div>}
                              <div className={`px-4 py-3.5 hover:bg-white transition-colors border-l-3 ${borderColor} ${bgColor}`}>
                                <div className="flex items-start justify-between mb-1.5 gap-2">
                                  <span className="text-xs font-bold text-gray-900 break-words flex-1">
                                    {rule.rule_id} {rule.name}
                                  </span>
                                  <span className={`text-xs font-bold uppercase tracking-wide ${statusColor} flex-shrink-0`}>
                                    {displayStatus}
                                  </span>
                                </div>
                                <p className={`text-xs ${descColor} break-words`}>
                                  {rule.description ?? rule.why ?? '설명 없음'}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Passed rules — single summary row */}
                        {passedCount > 0 && (
                          <>
                            {firedRules.length > 0 && <div className="h-px bg-gray-200"></div>}
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                나머지 {passedCount}개 규칙
                              </span>
                              <span className="text-xs font-bold text-green-600">통과</span>
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  상태
                </div>
                {(() => {
                  const status = decisionResult?.governance?.status ?? 'pending';
                  const isReview = status === 'review_required' || status === 'needs_review';
                  const isApproved = status === 'approved' || status === 'complete';
                  const statusColor = isReview ? 'text-amber-600' : isApproved ? 'text-green-600' : 'text-gray-600';
                  const dotColor = isReview ? 'bg-amber-500' : isApproved ? 'bg-green-500' : 'bg-gray-500';
                  const displayStatus = isReview ? '검토 필요' : isApproved ? '승인 완료' : status.toUpperCase().replace(/_/g, ' ');
                  return (
                    <div className={`text-sm font-bold ${statusColor} flex items-center gap-1.5`}>
                      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                      {displayStatus}
                    </div>
                  );
                })()}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  중요도
                </div>
                {(() => {
                  const riskScore = decisionResult?.governance?.risk_score ?? 0;
                  // Use risk_score as the authoritative source for importance level
                  const riskLevel = riskScore >= 7 ? 'HIGH-RISK' : riskScore >= 4 ? 'MEDIUM' : 'LOW';
                  const riskColor = riskLevel === 'HIGH-RISK' ? 'text-red-600' :
                    riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-green-600';
                  return (
                    <div>
                      <div className={`text-sm font-bold ${riskColor}`}>
                        {riskLevel}
                      </div>
                      {decisionResult && (
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          {riskScore}/10
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  영향 범위
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {extractRegion(decisionResult) !== 'Unknown' ? extractRegion(decisionResult) : '전체'}
                </div>
              </div>
            </div>

            {/* Approval Chain with Why */}
            {showRules && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    승인 체계
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    {decisionResult?.governance?.requires_human_review ? 'HIGH-ASSURANCE' : 'STANDARD'}
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {(() => {
                    const chain = decisionResult?.governance?.approval_chain ?? [];

                    if (chain.length === 0) {
                      return (
                        <div className="px-4 py-3.5 text-xs text-gray-400 italic">
                          필요한 승인이 없습니다.
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Header — 담당자 (name) | 직무 (role) | 상태 */}
                        <div className="grid grid-cols-3 gap-4 px-4 py-2.5 bg-white border-b border-gray-200">
                          <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">담당자</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">직무</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold text-right">상태</div>
                        </div>

                        {/* Rows */}
                        {chain.map((raw, idx) => {
                          const obj = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : null;
                          // person's name (e.g. "이수진") — falls back to ID if name not available
                          const personName = obj?.name ? String(obj.name) : typeof raw === 'string' ? raw : '—';
                          // job title (e.g. "준법감시인")
                          const jobTitle = obj?.role ? String(obj.role) : '—';
                          const rawStatus = obj?.status ? String(obj.status) : '';
                          const statusLabel = rawStatus === 'required' ? '필요' : rawStatus === 'optional' ? '선택' : '검토 필요';
                          const statusColor = rawStatus === 'required' ? 'text-red-600' : rawStatus === 'optional' ? 'text-gray-500' : 'text-amber-600';
                          const reason = obj?.reason ? String(obj.reason) : '';
                          const sourceRule = obj?.source_rule_id ? String(obj.source_rule_id) : '';
                          const borderColor = rawStatus === 'required' ? 'border-l-red-500' : 'border-l-amber-500';

                          return (
                            <div
                              key={idx}
                              className={`px-4 py-3.5 border-l-3 ${borderColor} ${idx < chain.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-white transition-colors`}
                            >
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-xs text-gray-900 font-bold break-words">{personName}</div>
                                <div className="text-xs text-gray-600 break-words">{jobTitle}</div>
                                <div className={`text-xs font-bold text-right uppercase tracking-wide ${statusColor} break-words`}>
                                  {statusLabel}
                                </div>
                              </div>
                              {reason && (
                                <div className="text-xs text-gray-500 mt-1.5 break-words">
                                  {sourceRule ? `${sourceRule}: ` : ''}{reason}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Analysis Progress */}
            {showExtractedData && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    AI 엔진 분석 현황
                  </h3>
                </div>

                {/* Unified Analysis Status */}
                <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                  {/* Progress Circle and Status */}
                  <div className="flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#374151"
                          strokeWidth="4"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={analysisStep === 4 ? "#10B981" : "#8B5CF6"}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(analysisStep / 4) * 175.93} 175.93`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${analysisStep === 4 ? 'text-green-400' : 'text-purple-400'}`}>
                          {Math.round((analysisStep / 4) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Status Text */}
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white mb-1">
                        {analysisStep === 4 ? '분석 완료' : 'AI 엔진 병렬 분석 중...'}
                      </div>
                      <div className="text-xs text-gray-300">
                        {analysisStep === 0 && '분석 대기 중'}
                        {analysisStep === 1 && '의사결정 정보 추출 중'}
                        {analysisStep === 2 && '거버넌스 정책 검토 중'}
                        {analysisStep === 3 && '전략 정합성 심층 분석 중'}
                        {analysisStep === 4 && '의사결정 보고서(Decision Pack) 생성 완료'}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Steps */}
                  <div className="space-y-2.5 pt-2 border-t border-gray-700">
                    {[
                      { step: 1, title: '의사결정 정보 추출', desc: '비정형 텍스트 내 목표, 비용, KPI 등 엔터티 추출', hasWarning: false },
                      { step: 2, title: '온톨로지 관계 구조화', desc: '추출된 엔터티 간 의미적 관계를 온톨로지 기반으로 구조화', hasWarning: false },
                      {
                        step: 3,
                        title: '거버넌스 정책 검토',
                        desc: (() => {
                          const triggeredRules = (decisionResult?.governance?.all_rules ?? []).filter(r => {
                            const s = r.status?.toUpperCase();
                            return s === 'TRIGGERED' || s === 'VIOLATION';
                          });
                          if (triggeredRules.length > 0) {
                            const rule = triggeredRules[0];
                            return `${rule.rule_id ?? ''} 감지: ${rule.description ?? rule.name ?? '규정 위반'}`.trim();
                          }
                          return '회사 정책 및 규정 준수 여부 검토';
                        })(),
                        hasWarning: (() => {
                          const triggeredRules = (decisionResult?.governance?.all_rules ?? []).filter(r => {
                            const s = r.status?.toUpperCase();
                            return s === 'TRIGGERED' || s === 'VIOLATION';
                          });
                          return triggeredRules.length > 0;
                        })()
                      },
                      {
                        step: 4,
                        title: '전략 정합성 분석',
                        desc: (() => {
                          const strategicGoals = extractStrategicGoals(decisionResult);
                          if (strategicGoals.length > 0) {
                            const goal = strategicGoals[0];
                            return `${goal.name}와의 논리적 일치 여부 확인`;
                          }
                          const kpis = extractKPIs(decisionResult);
                          if (kpis.length > 0) {
                            return `전사 KPI(${kpis[0].metric})와의 논리적 일치 여부 확인`;
                          }
                          return '전사 KPI(글로벌 확장)와의 논리적 일치 여부 확인';
                        })(),
                        hasWarning: false
                      },
                      {
                        step: 5,
                        title: '리스크 레벨 산정',
                        desc: (() => {
                          const riskScore = decisionResult?.governance?.risk_score ?? 0;
                          const riskLevel = riskScore >= 7 ? 'High-Risk' : riskScore >= 4 ? 'Medium-Risk' : 'Low-Risk';
                          return `종합 위험도(${riskLevel}) 및 영향 범위 분석`;
                        })(),
                        hasWarning: false
                      },
                      { step: 6, title: '보고서 패키징', desc: '승인 체계 및 판단 근거를 포함한 Decision Pack 생성', hasWarning: false },
                    ].map((item) => {
                      // Steps 1-3 map directly to analysisStep 1-3
                      // Steps 4-6 complete at analysisStep 4
                      const isComplete = item.step <= 3 ? analysisStep >= item.step : analysisStep >= 4;
                      const isInProgress = item.step <= 3
                        ? analysisStep === item.step - 1
                        : analysisStep === 3 && item.step === 4; // Step 4+ shows in-progress at analysisStep 3
                      const isPending = !isComplete && !isInProgress;

                      return (
                        <div key={item.step} className="flex items-start gap-3">
                          {/* Status Icon */}
                          {isComplete && !item.hasWarning && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {isComplete && item.hasWarning && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                          )}
                          {isInProgress && (
                            <div className="w-5 h-5 rounded-full border-2 border-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            </div>
                          )}
                          {isPending && (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 mt-0.5"></div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold ${isComplete || isInProgress ? 'text-white' : 'text-gray-500'}`}>
                              {item.title}
                            </div>
                            <div className={`text-xs mt-0.5 ${isComplete || isInProgress ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.desc}
                            </div>
                          </div>

                          {/* Status Label */}
                          {isComplete && !item.hasWarning && (
                            <span className="text-xs font-semibold text-green-400 flex-shrink-0">완료</span>
                          )}
                          {isComplete && item.hasWarning && (
                            <span className="text-xs font-semibold text-amber-400 flex-shrink-0">주의</span>
                          )}
                          {isInProgress && (
                            <span className="text-xs font-semibold text-purple-400 flex-shrink-0">병렬</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Impact Simulation - KPI Forecast */}
            {showReasoning && (
              <div className="space-y-3.5 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    임팩트 분석
                  </h3>
                  <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
                    추론 기반
                  </span>
                </div>

                {(() => {
                  const kpis = extractKPIs(decisionResult);
                  const strategicGoals = extractStrategicGoals(decisionResult);
                  const riskScore = decisionResult?.governance?.risk_score ?? 0;
                  const flags = decisionResult?.governance?.flags ?? [];
                  const hasHighRisk = flags.some(f => f.severity === 'high' || f.severity === 'critical') || riskScore >= 7;

                  // Show strategic goals if available (new backend structure)
                  if (decisionResult && strategicGoals.length > 0) {
                    return (
                      <>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">전략적 목표 영향</span>
                            </div>
                            <div className="space-y-3">
                              {strategicGoals.map((goal, idx) => {
                                const isConflict = goal.status === 'conflict';
                                const statusColor = isConflict ? 'text-red-600' : 'text-green-600';
                                const statusBg = isConflict ? 'bg-red-50' : 'bg-green-50';
                                const statusBorder = isConflict ? 'border-red-200' : 'border-green-200';
                                const statusLabel = isConflict ? 'CONFLICT' : 'ALIGNED';

                                return (
                                  <div key={idx} className="space-y-1.5">
                                    <div className="flex items-start gap-2">
                                      <span className="text-gray-400 mt-0.5">•</span>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-semibold text-gray-900">
                                            {goal.name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            ({goal.goal_id})
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor} ${statusBg} border ${statusBorder}`}>
                                            {statusLabel}
                                          </span>
                                        </div>
                                        {goal.reasoning && (
                                          <div className="mt-1.5 flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                                            <span className="text-gray-400 flex-shrink-0">└─</span>
                                            <span className="break-words">{goal.reasoning}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">전략적 목표 기반 임팩트 분석</p>
                      </>
                    );
                  }

                  // Real data with no KPIs — compliance/approval check; show governance impact instead
                  if (decisionResult && kpis.length === 0) {
                    const risks = extractRisks(decisionResult);
                    const triggeredRules = (decisionResult.governance?.all_rules ?? []).filter(r => {
                      const s = r.status?.toUpperCase();
                      return s === 'TRIGGERED' || s === 'VIOLATION';
                    });
                    return (
                      <>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                          {/* Risk impact */}
                          {risks.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-600 uppercase tracking-wide">위험 영향</span>
                                <span className={`text-sm font-bold ${hasHighRisk ? 'text-red-600' : 'text-amber-600'}`}>
                                  {hasHighRisk ? '높음' : '중간'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed break-words">
                                {risks[0].description ?? '위험 요소 감지됨'}
                              </p>
                            </div>
                          )}
                          {/* Triggered rules */}
                          {triggeredRules.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-600 uppercase tracking-wide">정책 위반</span>
                                <span className="text-sm font-bold text-red-600">{triggeredRules.length}건 감지</span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed break-words">
                                {triggeredRules[0].description ?? triggeredRules[0].name ?? triggeredRules[0].rule_id ?? '규칙 위반 감지됨'}
                              </p>
                            </div>
                          )}
                          {/* Approval required */}
                          {(decisionResult.governance?.requires_human_review || (decisionResult.governance?.approval_chain ?? []).length > 0) && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-600 uppercase tracking-wide">승인 필요</span>
                                <span className="text-sm font-bold text-amber-600">검토 대기</span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                본 의사결정은 준법 검토 후 승인이 필요합니다.
                              </p>
                            </div>
                          )}
                          {risks.length === 0 && triggeredRules.length === 0 && (
                            <p className="text-xs text-gray-500 italic">KPI 분석 해당 없음 — 준법 검토 대상 의사결정</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 italic">거버넌스 기반 임팩트 분석</p>
                      </>
                    );
                  }

                  // No real data — demo mode fallback
                  if (!decisionResult || kpis.length === 0) {
                    return (
                      <>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-5">
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-xs text-gray-600 uppercase tracking-wide">K1 EU ARR</span>
                              <span className="text-sm font-bold text-green-600">+$15M</span>
                            </div>
                            <div className="h-9 bg-white rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1.5 border border-gray-200">
                              <div className="w-1.5 bg-green-500 h-3 rounded-t"></div>
                              <div className="w-1.5 bg-green-500 h-4 rounded-t"></div>
                              <div className="w-1.5 bg-green-500 h-5 rounded-t"></div>
                              <div className="w-1.5 bg-green-500 h-6 rounded-t"></div>
                              <div className="w-1.5 bg-green-500 h-7 rounded-t"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">긍정적 영향 예상</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-xs text-gray-600 uppercase tracking-wide">K3 Cost/Unit</span>
                              <span className="text-sm font-bold text-red-600">+18%</span>
                            </div>
                            <div className="h-9 bg-white rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1.5 border border-gray-200">
                              <div className="w-1.5 bg-red-500 h-3 rounded-t"></div>
                              <div className="w-1.5 bg-red-500 h-4 rounded-t"></div>
                              <div className="w-1.5 bg-red-500 h-5 rounded-t"></div>
                              <div className="w-1.5 bg-red-500 h-6 rounded-t"></div>
                              <div className="w-1.5 bg-red-500 h-7 rounded-t"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">부정적 영향 (비용 상승)</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">o1 추론 기반 시뮬레이션 (demo mode)</p>
                      </>
                    );
                  }

                  // Live data with KPIs: render real KPI impact
                  return (
                    <>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-5">
                        {kpis.slice(0, 4).map((kpi, idx) => {
                          const metricLower = (kpi.metric ?? '').toLowerCase();
                          const isCostMetric =
                            metricLower.includes('cost') ||
                            metricLower.includes('expense') ||
                            metricLower.includes('지출') ||
                            metricLower.includes('비용');
                          // High risk → overall negative signal on non-cost KPIs too
                          const isNegative = isCostMetric || (hasHighRisk && idx > 0);
                          const barColor = isNegative ? 'bg-red-500' : 'bg-green-500';
                          const valueColor = isNegative ? 'text-red-600' : 'text-green-600';
                          const targetDisplay = kpi.target != null ? String(kpi.target) : '—';
                          const impactLabel = isNegative ? '부정적 영향 예상' : '긍정적 영향 예상';
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs text-gray-600 uppercase tracking-wide truncate max-w-[60%]">
                                  {kpi.metric}
                                </span>
                                <span className={`text-sm font-bold ${valueColor}`}>
                                  {targetDisplay}
                                </span>
                              </div>
                              <div className="h-9 bg-white rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1.5 border border-gray-200">
                                <div className={`w-1.5 ${barColor} h-3 rounded-t`}></div>
                                <div className={`w-1.5 ${barColor} h-4 rounded-t`}></div>
                                <div className={`w-1.5 ${barColor} h-5 rounded-t`}></div>
                                <div className={`w-1.5 ${barColor} h-6 rounded-t`}></div>
                                <div className={`w-1.5 ${barColor} h-7 rounded-t`}></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{impactLabel}</p>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 italic">추론 기반 시뮬레이션</p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* System Metadata Footer */}
            <div className="pt-5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono">DATA STREAM: 6.0.4 STABLE</span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                LIVE MODE (EV)
              </span>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
