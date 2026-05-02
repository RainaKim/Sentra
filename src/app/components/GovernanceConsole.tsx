import {
  AlertTriangle,
  Plus,
  Minus,
  XCircle,
  Bot,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useLang } from "../contexts/LangContext";
import { useAuth } from "../contexts/AuthContext";
import { ReactFlowProvider } from "reactflow";
import { DecisionPackReport } from "./DecisionPackReport";
import { RiskScoringPanel } from "./RiskScoringPanel";
import { runDecisionFlow } from "../../api/decisionRunner";
import { getCompanies, getDecision } from "../../api/client";
import { OntologyGraph } from "./ontology/OntologyGraph";
import type { DecisionResponse, DecisionGoal, DecisionKPI, DecisionOwner, DecisionRisk, GraphPayloadNode } from "../../api/types";
import { EvidenceList } from "./governance/EvidenceList";
import { EvidenceToggle } from "./governance/EvidenceToggle";

// Demo fallback text shown when navigating directly to /console
const DEMO_INPUT =
  'Approve reallocation of $2.4M from infrastructure reserve to accelerate Q3 cloud migration project. Requires sign-off from CFO and IT Director. Project timeline: 6 weeks.';

// Korean → English industry name translation (for breadcrumb pre-fetch phase)
const INDUSTRY_KO_TO_EN: Record<string, string> = {
  '기업 금융': 'Corporate Finance',
  '금융': 'Finance',
  '제조업': 'Manufacturing',
  '제조': 'Manufacturing',
  '유통': 'Distribution',
  '소매': 'Retail',
  '의료': 'Healthcare',
  '헬스케어': 'Healthcare',
  '기술': 'Technology',
  '정보기술': 'Information Technology',
  'IT': 'IT',
  '에너지': 'Energy',
  '건설': 'Construction',
  '부동산': 'Real Estate',
  '물류': 'Logistics',
  '교육': 'Education',
  '공공': 'Public Sector',
  '화학': 'Chemical',
  '바이오': 'Biotech',
  '식품': 'Food & Beverage',
  '식음료': 'Food & Beverage',
};

function translateIndustry(industry: string | undefined, lang: string): string | undefined {
  if (!industry) return undefined;
  if (lang !== 'en') return industry;
  return INDUSTRY_KO_TO_EN[industry] ?? industry;
}

// ---------------------------------------------------------------------------
// Evidence toggle sub-components (rule evidence, approval chain evidence)
// ---------------------------------------------------------------------------


interface FiredRuleRowProps {
  rule: import('../../api/types').GovernanceRule;
  idx: number;
  isFirst: boolean;
  t: (k: string) => string;
  lang?: string;
}

function FiredRuleRow({ rule, idx, isFirst, t, lang }: FiredRuleRowProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const status = rule.status?.toUpperCase() ?? 'UNKNOWN';
  const RULE_STATUS_KR: Record<string, string> = {
    PASSED: t('console.right.rules.passed'),
    TRIGGERED: t('report.gov.triggered'),
    VIOLATION: t('report.gov.violation'),
    CHECKING: '확인 중',
    PENDING: t('console.right.approval.status.pending'),
  };
  const displayStatus = RULE_STATUS_KR[status] ?? status;
  const isViolation = status === 'VIOLATION';
  const statusColor = isViolation ? 'text-red-600' : 'text-amber-600';
  const borderColor = isViolation ? 'border-l-red-500' : 'border-l-amber-500';
  const bgColor = isViolation ? 'bg-red-50' : '';
  const descColor = isViolation ? 'text-red-600' : 'text-gray-600';
  const evidence = rule.evidence ?? [];

  return (
    <div key={rule.rule_id ?? idx}>
      {!isFirst && <div className="h-px bg-gray-200"></div>}
      <div className={`px-4 py-3.5 hover:bg-white transition-colors border-l-3 ${borderColor} ${bgColor}`}>
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <span className="text-xs font-bold text-gray-900 break-words flex-1">
            {rule.rule_id} {lang === 'en' ? (rule.name_en ?? rule.name) : rule.name}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wide ${statusColor} flex-shrink-0`}>
            {displayStatus}
          </span>
        </div>
        {(rule.description ?? rule.why) && (
          <div className="mb-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
              {t('console.right.rules.trigger')}
            </div>
            <p className={`text-xs ${descColor} break-words`}>
              {lang === 'en' ? (rule.description_en ?? rule.why_en ?? rule.description ?? rule.why) : (rule.description ?? rule.why)}
            </p>
          </div>
        )}
        {(rule.consequence?.message || rule.consequence?.action) && (
          <div className="mb-2">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
              {t('console.right.rules.action')}
            </div>
            <p className="text-xs text-gray-700 break-words">
              {(() => {
                const msg = lang === 'en'
                  ? (rule.consequence?.message_en ?? rule.consequence?.message)
                  : rule.consequence?.message;
                if (msg) return msg;
                const a = rule.consequence?.action ?? '';
                if (a.includes('approval')) return lang === 'en' ? 'Approval required' : '승인 필요';
                if (a.includes('review')) return lang === 'en' ? 'Review required' : '검토 필요';
                if (a.includes('goal')) return lang === 'en' ? 'Goal mapping required' : '목표 매핑 필요';
                return a.replace(/_/g, ' ');
              })()}
            </p>
          </div>
        )}
        {evidence.length > 0 && (
          <>
            <EvidenceToggle expanded={showEvidence} onToggle={() => setShowEvidence((v) => !v)} />
            {showEvidence && <EvidenceList evidence={evidence} lang={lang} />}
          </>
        )}
      </div>
    </div>
  );
}

interface ApprovalChainRowProps {
  raw: unknown;
  idx: number;
  total: number;
  t: (k: string) => string;
  lang?: string;
  evidence: import('../../api/types').GovernanceEvidenceItem[];
  allRules: import('../../api/types').GovernanceRule[];
}

function ApprovalChainRow({ raw, idx, total, t, lang, evidence, allRules }: ApprovalChainRowProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const obj = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : null;
  const personName = obj?.name ? String(obj.name) : typeof raw === 'string' ? raw : '—';
  const jobTitle = obj?.role ? String(obj.role) : '—';
  const rawStatus = obj?.status ? String(obj.status) : '';
  const statusLabel = rawStatus === 'required' ? t('console.right.approval.status.required') : rawStatus === 'optional' ? t('console.right.approval.status.optional') : t('console.right.approval.status.pending');
  const statusColor = rawStatus === 'required' ? 'text-red-600' : rawStatus === 'optional' ? 'text-gray-500' : 'text-amber-600';
  const sourceRule = obj?.source_rule_id ? String(obj.source_rule_id) : '';

  // Resolve reason: prefer _en fields; fall back to matching rule's description_en
  const matchedRule = sourceRule ? allRules.find(r => r.rule_id === sourceRule) : undefined;
  const reason = lang === 'en'
    ? (obj?.reason_en
        ? String(obj.reason_en)
        : matchedRule?.description_en ?? matchedRule?.description ?? (obj?.reason ? String(obj.reason) : ''))
    : obj?.reason ? String(obj.reason) : '';

  const borderColor = rawStatus === 'required' ? 'border-l-red-500' : 'border-l-amber-500';

  return (
    <div
      className={`px-4 py-3.5 border-l-3 ${borderColor} ${idx < total - 1 ? 'border-b border-gray-200' : ''} hover:bg-white transition-colors`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <div className="text-xs font-bold text-gray-900 break-words">
            {jobTitle !== '—' ? jobTitle : personName}
          </div>
          {jobTitle !== '—' && personName !== '—' && jobTitle !== personName && (
            <div className="text-[10px] text-gray-400 mt-0.5">{personName}</div>
          )}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wide flex-shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      {reason && (
        <div className="mt-1.5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
            {t('console.right.approval.reason')}
          </div>
          <div className="text-xs text-gray-600 break-words">
            {sourceRule ? `${sourceRule}: ` : ''}{reason}
          </div>
        </div>
      )}
      {evidence.length > 0 && (
        <>
          <EvidenceToggle expanded={showEvidence} onToggle={() => setShowEvidence((v) => !v)} />
          {showEvidence && <EvidenceList evidence={evidence} lang={lang} />}
        </>
      )}
    </div>
  );
}

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
    typeof n === 'object' && n !== null && n.type?.toUpperCase() === nodeType.toUpperCase()
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
      const nameEn = node.label_en ?? (node.properties?.name_en ? String(node.properties.name_en) : undefined);
      const roleEn = node.properties?.role_en ? String(node.properties.role_en) : undefined;
      owners.push({
        name: personName ?? label,
        name_en: nameEn,
        role: label,
        role_en: roleEn,
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
function wrapText(text: string, maxWidth: number, maxLines = 3): string[] {
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

  return lines.slice(0, maxLines);
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
  lang?: string,
  inputTextEn?: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const isEn = lang === 'en';

  // Try to get decision statement from graph_payload Action node first
  const actionNodes = getGraphNodes(result, 'Action');
  const actionLabel = actionNodes.length > 0 ? actionNodes[0].label : null;
  const actionLabelEn = actionNodes.length > 0 ? (actionNodes[0].label_en ?? actionNodes[0].label) : null;

  // Decision root node (center)
  const decisionStatement = isEn
    ? (actionLabelEn ?? result?.decision?.statement_en ?? inputTextEn ?? actionLabel ?? result?.decision?.statement ?? inputText ?? 'Decision')
    : (actionLabel ?? result?.decision?.statement ?? inputText ?? 'Decision');
  
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
    const actorLabel = lang === 'en'
      ? (actor.name_en ?? actor.role_en ?? actor.name ?? actor.role ?? 'Actor')
      : (actor.name ?? actor.role ?? 'Actor');
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

function buildReasoningData(result: DecisionResponse | null, lang: string): {
  conflicts: string[];
  riskAmplification: string[];
  recommendations: string[];
  confidence: number | null;
  analysisMethod: string | null;
} {
  const conflicts: string[] = [];
  const riskAmplification: string[] = [];
  const recommendations: string[] = [];

  if (!result) {
    return { conflicts, riskAmplification, recommendations, confidence: null, analysisMethod: null };
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

  // --- Dedupe helper: returns true if `candidate` is too similar to any existing string ---
  const isSimilar = (candidate: string, existing: string[]): boolean => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
    const cn = norm(candidate);
    return existing.some(e => {
      const en = norm(e);
      return cn.includes(en) || en.includes(cn) || cn === en;
    });
  };
  const pushUnique = (arr: string[], items: string[]) => {
    for (const item of items) {
      if (!isSimilar(item, arr)) arr.push(item);
    }
  };

  // --- 위험 증폭 요인 ---
  const decisionRisks = result.decision?.risks ?? [];
  decisionRisks.slice(0, 2).forEach(r => {
    if (r.description) pushUnique(riskAmplification, [r.description]);
  });
  const flags = result.governance?.flags ?? [];
  if (riskAmplification.length === 0) {
    const highRiskFlags = flags.filter(f => f.severity === 'high' || f.severity === 'critical');
    highRiskFlags.slice(0, 2).forEach(f => {
      pushUnique(riskAmplification, [f.code?.replace(/_/g, ' ') ?? 'Risk detected']);
    });
  }
  const issues = result.governance?.completeness_issues ?? [];
  if (riskAmplification.length === 0) {
    issues.slice(0, 2).forEach(issue => pushUnique(riskAmplification, [issue]));
  }

  // --- 권장 조치 (merge graph_recommendations + next_actions, deduplicated) ---
  const allRecs: string[] = [];
  const graphRecommendations = reasoning?.graph_recommendations;
  if (Array.isArray(graphRecommendations)) allRecs.push(...(graphRecommendations as string[]));
  const nextActions = pack?.recommended_next_actions;
  if (Array.isArray(nextActions)) allRecs.push(...(nextActions as string[]));
  pushUnique(recommendations, allRecs);

  // Supplement with approval chain if still empty
  if (recommendations.length === 0) {
    const approvalChain = result.governance?.approval_chain ?? [];
    approvalChain.slice(0, 2).forEach(item => {
      pushUnique(recommendations, [lang === 'en' ? `${approvalChainItemName(item)} approval required` : `${approvalChainItemName(item)} 승인 필요`]);
    });
  }
  if (result.governance?.requires_human_review && recommendations.length === 0) {
    recommendations.push(lang === 'en' ? 'Expert review required' : '전문가 검토 필요');
  }
  if (recommendations.length === 0) {
    recommendations.push(lang === 'en' ? 'Additional review recommended' : '추가 검토 권장');
  }
  // Cap at 3 to keep the banner concise
  recommendations.splice(3);

  const rawConfidence = reasoning?.confidence as number | undefined;
  const confidence = typeof rawConfidence === 'number'
    ? (rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence))
    : null;
  const analysisMethod = (reasoning?.analysis_method as string) ?? null;

  return { conflicts, riskAmplification, recommendations, confidence, analysisMethod };
}

const CONSOLE_NAV_ITEMS = [
  { label: "Reasoning Timeline", path: "/reasoning-timeline" },
  { label: "Simulation Lab", path: "/simulation-lab" },
  { label: "Evidence Explorer", path: "/evidence-explorer" },
  { label: "Agent Boundaries", path: "/agent-boundaries" },
];

// ---------------------------------------------------------------------------
// Module-level cache — shared with analysis tool screens via consoleCache store.
// Persists across tab navigation but clears when a new decision is launched.
// ---------------------------------------------------------------------------
import { consoleCache, setConsoleCache, consoleCacheKey, getInflightKey, setInflight, clearInflight, updateCacheAndNotify, subscribeCache } from '../store/consoleCache';

export function GovernanceConsole() {
  const location = useLocation();
  const consolNavigate = useNavigate();
  const { t, lang } = useLang();
  const { token, user } = useAuth();
  const locationFlowState = (location.state ?? null) as {
    companyId?: string;
    decisionText?: string;
    decisionTextEn?: string;
    agentName?: string;
    agentNameEn?: string;
    department?: string;
    departmentEn?: string;
    workspaceDecisionId?: string;
    /** Set when navigating from a validated/blocked workspace decision — skip re-run, load this result */
    existingDecisionId?: string;
  } | null;

  // If the user navigated back without state (tab switch), restore from cache.
  // If a new flowState arrives that differs from the cache, it's a new run.
  const incomingKey = consoleCacheKey(locationFlowState);
  const cacheHit = consoleCache !== null && (
    incomingKey === null                          // tab navigation — no state
    || incomingKey === consoleCache.cacheKey      // same decision re-opened
  );
  const flowState = cacheHit ? consoleCache!.flowState : locationFlowState;

  // Derive effective company/decision so real API fires even when navigating directly to /console
  const effectiveCompanyId = flowState?.companyId ?? user?.company_id ?? undefined;
  const effectiveDecisionText = flowState?.decisionText ?? DEMO_INPUT;

  // Clear stale cache when a genuinely new decision arrives
  if (incomingKey !== null && consoleCache !== null && incomingKey !== consoleCache.cacheKey) {
    setConsoleCache(null);
  }

  const [analysisStep, setAnalysisStep] = useState(cacheHit ? consoleCache!.analysisStep : 0);
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 to 2.0
  const [showDecisionPack, setShowDecisionPack] =
    useState(false);

  // Real result from backend (null when in demo mode or still processing)
  const [decisionResult, setDecisionResult] =
    useState<DecisionResponse | null>(cacheHit ? consoleCache!.result : null);
  // Pre-fetched company info for breadcrumb during analysis
  const [prefetchedCompany, setPrefetchedCompany] = useState<import('../../api/types').Company | null>(cacheHit ? consoleCache!.prefetchedCompany : null);
  // Non-null when the API call fails
  const [flowError, setFlowError] = useState<string | null>(null);
  // Live trace log entries accumulated from SSE events + rule results
  const [traceLog, setTraceLog] = useState<{ text: string; color: string }[]>(cacheHit ? consoleCache!.traceLog : []);
  // Controls progress overlay visibility — dismissed immediately if cache hit, or after 1.5s on complete
  const [overlayDismissed, setOverlayDismissed] = useState(cacheHit);

  // Subscribe to in-flight cache updates (when user navigated away and came back)
  useEffect(() => {
    const key = getInflightKey();
    if (!key) return;
    // An analysis is still running in the background — sync state from cache updates
    return subscribeCache((entry) => {
      setAnalysisStep(entry.analysisStep);
      setTraceLog(entry.traceLog);
      if (entry.result) setDecisionResult(entry.result);
      if (entry.prefetchedCompany) setPrefetchedCompany(entry.prefetchedCompany);
      if (entry.analysisStep >= 4) setOverlayDismissed(false); // trigger dismiss timer
    });
  }, []);

  // Pre-fetch company info for breadcrumb
  useEffect(() => {
    if (!flowState?.companyId) return;
    if (cacheHit && consoleCache?.prefetchedCompany) return; // already cached
    getCompanies(token ?? undefined)
      .then((list) => {
        const match = list.find((c) => c.id === flowState.companyId);
        if (match) {
          setPrefetchedCompany(match);
          if (consoleCache) consoleCache.prefetchedCompany = match;
        }
      })
      .catch(() => {});
  }, [flowState?.companyId]);

  // Mutable ref to track accumulated trace log for the in-flight callbacks
  const traceLogRef = useRef(traceLog);
  traceLogRef.current = traceLog;

  useEffect(() => {
    // Skip re-running if we restored from cache (tab navigation)
    if (cacheHit) return;

    // ── Existing result path ──────────────────────────────────────────────────
    // When coming from a validated/blocked workspace decision, load the already-
    // completed governance result instead of re-running the pipeline.
    const existingId = locationFlowState?.existingDecisionId;
    if (existingId) {
      setAnalysisStep(4);
      setTraceLog([{ text: '[결과 로드] 기존 거버넌스 결과를 불러오는 중...', color: 'text-blue-300' }]);
      getDecision(existingId, token ?? undefined, lang)
        .then((result) => {
          setDecisionResult(result);
          setOverlayDismissed(true);
          setTraceLog([{ text: '[결과 로드] 의사결정 결과 로드 완료', color: 'text-green-300' }]);
        })
        .catch((err: Error) => {
          setFlowError(`Failed to load existing result: ${err.message}`);
          setOverlayDismissed(true);
        });
      return;
    }

    // If an in-flight analysis is already running for this key, just subscribe — don't re-launch
    const thisKey = consoleCacheKey(flowState);
    if (thisKey && getInflightKey() === thisKey) return;

    // Stage → trace log label/color mapping
    const STAGE_LOG: Record<string, { prefix: string; color: string }> = {
      extracting:             { prefix: '[Extraction]',   color: 'text-blue-300' },
      evaluating_governance:  { prefix: '[Policy]',       color: 'text-amber-300' },
      building_graph:         { prefix: '[Graph]',        color: 'text-blue-300' },
      reasoning:              { prefix: '[Analysis]',     color: 'text-purple-300' },
      building_decision_pack: { prefix: '[Decision]',    color: 'text-green-300' },
    };
    const STAGE_NAMES: Record<string, string> = {
      extracting: 'Extracting decision context and stakeholders...',
      evaluating_governance: 'Reviewing active governance policy set...',
      building_graph: 'Mapping goals and cost nodes to decision graph...',
      reasoning: 'Analyzing strategic alignment and risk factors...',
      building_decision_pack: 'Generating governance verdict and audit pack...',
    };

    if (effectiveCompanyId) {
      // Fallback timers — advance the stepper visually even if the backend
      // doesn't emit intermediate step events. Real SSE events override these
      // (setAnalysisStep uses Math.max so they can only move forward).
      const fallbackTimers: ReturnType<typeof setTimeout>[] = [
        setTimeout(() => {
          setAnalysisStep((prev) => Math.max(prev, 2));
          setTraceLog((prev) => [...prev, { text: '[Policy] Reviewing active governance policy set...', color: 'text-amber-300' }]);
        }, 4000),
        setTimeout(() => {
          setAnalysisStep((prev) => Math.max(prev, 3));
          setTraceLog((prev) => [...prev, { text: '[Analysis] Analyzing strategic alignment and risk factors...', color: 'text-purple-300' }]);
        }, 10000),
      ];

      // Live mode: run the real governance flow
      // Track accumulated step + traceLog for cache updates that survive unmount
      let latestStep = 0;
      let latestTraceLog: { text: string; color: string }[] = [];

      const cancel = runDecisionFlow(
        {
          companyId: effectiveCompanyId,
          decisionText: effectiveDecisionText,
          token: token ?? undefined,
          lang,
          agentName: flowState.agentName,
          agentNameEn: flowState.agentNameEn,
          department: flowState.department,
          departmentEn: flowState.departmentEn,
          workspaceDecisionId: flowState.workspaceDecisionId,
        },
        {
          onProgress: ({ stepIndex, stage, message }) => {
            latestStep = Math.max(latestStep, stepIndex);
            const info = STAGE_LOG[stage] ?? { prefix: '[분석 엔진]', color: 'text-gray-600' };
            const text = `${info.prefix} ${STAGE_NAMES[stage] ?? stage.replace(/_/g, ' ')}...`;
            latestTraceLog = [...latestTraceLog, { text, color: info.color }];
            // Update component state (no-op if unmounted, but cache listeners get it)
            setAnalysisStep((prev) => Math.max(prev, stepIndex));
            setTraceLog((prev) => [...prev, { text, color: info.color }]);
            // Notify cache listeners (for re-mounted components)
            if (thisKey && flowState) {
              updateCacheAndNotify({
                cacheKey: thisKey,
                flowState,
                result: null,
                traceLog: latestTraceLog,
                prefetchedCompany: null,
                analysisStep: latestStep,
              });
            }
          },
          onComplete: (result) => {
            fallbackTimers.forEach(clearTimeout);

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
              const color = isViolation ? 'text-red-400' : isTriggered ? 'text-amber-300' : 'text-green-300';
              const label = rule.name ?? rule.description ?? rule.rule_id ?? '';
              const text = `[정책 검토] ${rule.rule_id ? rule.rule_id + ' ' : ''}${statusKr}: ${label}`;
              return { text, color };
            });
            const finalTraceLog = [
              ...traceLogRef.current,
              { text: '[결과 생성] 의사결정 보고서 생성 완료', color: 'text-green-300' },
              ...ruleEntries,
            ];
            setTraceLog(finalTraceLog);
            // Save to cache and notify listeners
            if (thisKey && flowState) {
              updateCacheAndNotify({
                cacheKey: thisKey,
                flowState,
                result,
                traceLog: finalTraceLog,
                prefetchedCompany,
                analysisStep: 4,
              });
            }
            clearInflight();
          },
          onError: (err) => {
            fallbackTimers.forEach(clearTimeout);
            setFlowError(err.message);
            setAnalysisStep(4); // advance UI so it doesn't hang
            setTraceLog((prev) => [
              ...prev,
              { text: `[오류] ${err.message}`, color: 'text-red-400' },
            ]);
            clearInflight();
          },
        },
      );

      // Register as in-flight so it survives unmount
      if (thisKey) setInflight(thisKey, cancel);

      return () => {
        fallbackTimers.forEach(clearTimeout);
        // Do NOT cancel the SSE — let it keep running in the background
      };
    } else {
      // Demo mode: simulate progress with timers + hardcoded log entries
      const timers = [
        setTimeout(() => {
          setAnalysisStep(1);
          setTraceLog((prev) => [
            ...prev,
            { text: '[Extraction] Decision context and stakeholders identified', color: 'text-blue-300' },
            { text: '[Graph] Goals and cost nodes mapped to decision graph', color: 'text-blue-300' },
          ]);
        }, 800),
        setTimeout(() => {
          setAnalysisStep(2);
          setTraceLog((prev) => [
            ...prev,
            { text: '[Policy] R1 reviewed — triggered (CFO sign-off required)', color: 'text-amber-300' },
            { text: '[Policy] R2 reviewed — triggered (IT Director review required)', color: 'text-amber-300' },
            { text: '[Policy] R5 violation — budget reallocation threshold exceeded', color: 'text-red-400' },
          ]);
        }, 2200),
        setTimeout(() => {
          setAnalysisStep(3);
          setTraceLog((prev) => [
            ...prev,
            { text: '[Analysis] Analyzing strategic alignment and risk factors...', color: 'text-purple-300' },
            { text: '[Analysis] Goal conflict detected — G1 and G3 misaligned', color: 'text-purple-300' },
            { text: '[Risk] Calculating risk exposure and threshold breach...', color: 'text-red-400' },
          ]);
        }, 3800),
        setTimeout(() => {
          setAnalysisStep(4);
          setTraceLog((prev) => [
            ...prev,
            { text: '[Decision] Generating governance verdict and audit pack...', color: 'text-green-300' },
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

  // Dismiss progress overlay 1.5s after analysis completes so all steps are visible at 100%
  useEffect(() => {
    if (analysisStep >= 4 && !overlayDismissed) {
      const timer = setTimeout(() => setOverlayDismissed(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [analysisStep, overlayDismissed]);

  const reasoningData = buildReasoningData(decisionResult, lang);

  // Show Decision Pack Report if requested
  if (showDecisionPack) {
    return (
      <DecisionPackReport
        onBack={() => setShowDecisionPack(false)}
        decisionData={decisionResult ?? undefined}
        decisionTextEn={flowState?.decisionTextEn ?? flowState?.decisionText}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0B0F1A", fontFamily: "SUIT Variable, Inter, sans-serif" }}>
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-6 flex-shrink-0" style={{ backgroundColor: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Left - Logo + Breadcrumb */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-5 rounded-sm" style={{ background: 'linear-gradient(to bottom, #818CF8, #6366F1)' }}></div>
              <div className="w-1.5 h-5 rounded-sm mt-0.5" style={{ background: 'linear-gradient(to bottom, #6366F1, #4F46E5)' }}></div>
              <div className="w-1.5 h-5 rounded-sm" style={{ background: 'linear-gradient(to bottom, #4F46E5, #3730A3)' }}></div>
            </div>
            <button
              onClick={() => consolNavigate('/workspace')}
              className="font-bold text-sm tracking-wider transition-colors"
              style={{ color: '#E2E8F0' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#E2E8F0')}
            >
              DecisionGovernance AI
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span className="uppercase tracking-wide font-medium">
              {lang === 'en'
                ? (decisionResult?.company?.industry_en ?? translateIndustry(decisionResult?.company?.industry, lang) ?? translateIndustry(prefetchedCompany?.industry, lang) ?? 'Platform')
                : (decisionResult?.company?.industry ?? prefetchedCompany?.industry ?? 'Platform')}
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="uppercase tracking-wide font-medium">
              {lang === 'en'
                ? (decisionResult?.company?.name_en ?? decisionResult?.company?.name ?? prefetchedCompany?.name_en ?? prefetchedCompany?.name ?? 'Decision Console')
                : (decisionResult?.company?.name ?? prefetchedCompany?.name ?? 'Decision Console')}
            </span>
            <ChevronRight className="w-3 h-3" />
            {isAnalyzing ? (
              <span className="animate-pulse font-semibold uppercase tracking-wide" style={{ color: '#818CF8' }}>{t('console.analyzing')}</span>
            ) : (
              <span className="font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('console.complete')}</span>
            )}
          </div>
        </div>
        {/* Back to workspace button */}
        <button
          onClick={() => consolNavigate('/workspace')}
          className="text-xs font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          ← Workspace
        </button>
      </div>

      {/* Error Banner */}
      {flowError && (
        <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-center gap-3">
            <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#F87171' }} />
            <span className="text-xs font-semibold" style={{ color: '#FCA5A5' }}>
              {t('console.errorPrefix')} {flowError}
            </span>
          </div>
          <button onClick={() => setFlowError(null)} className="text-xs font-medium" style={{ color: '#F87171' }}>
            {t('console.errorDismiss')}
          </button>
        </div>
      )}

      {/* Main Layout — sidebar + content */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* LEFT SIDEBAR */}
        <div className="w-52 flex flex-col py-4 flex-shrink-0" style={{ backgroundColor: '#0B0F1A', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 mb-3">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Decisions</div>
          </div>
          <button
            onClick={() => {}}
            className="w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2"
            style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#A5B4FC', borderLeft: '2px solid #6366F1' }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#6366F1' }} />
            Decision Console
          </button>

          <div className="px-4 mt-4 mb-3">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Analysis Tools</div>
          </div>
          {CONSOLE_NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              disabled={isAnalyzing}
              onClick={() => {
                if (isAnalyzing) return;
                const did = decisionResult?.decision_id;
                consolNavigate(did ? `${item.path}?decision_id=${encodeURIComponent(did)}` : item.path);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2 transition-colors"
              style={{
                color: isAnalyzing ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!isAnalyzing) e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={(e) => { if (!isAnalyzing) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              title={isAnalyzing ? 'Analysis in progress…' : undefined}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: isAnalyzing ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)' }} />
              {item.label}
            </button>
          ))}

          <div className="mt-auto px-4 pt-4 mx-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Decision ID</div>
            <div className="text-xs font-semibold font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{decisionResult?.decision_id ?? '—'}</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>
        {/* Two-panel row: Graph + Validation */}
        <div className="flex flex-1 overflow-hidden">

        {/* CENTER PANEL - Governance Mind Map */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4 pb-4">
          <div className="rounded-xl flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-base font-bold" style={{ color: '#F9FAFB' }}>{t('console.graph.title')}</h1>
                  <p className="text-xs mt-0.5 truncate max-w-[600px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {lang === 'en'
                      ? (decisionResult?.agent_name_en ?? decisionResult?.agent_name ?? flowState?.agentNameEn ?? flowState?.agentName ?? 'AI Agent')
                      : (decisionResult?.agent_name ?? flowState?.agentName ?? 'AI Agent')}
                    {' · '}
                    {lang === 'en'
                      ? (decisionResult?.decision_context?.proposal_en ?? decisionResult?.decision_context?.proposal ?? '—')
                      : (decisionResult?.decision_context?.proposal ?? '—')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {decisionResult && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {(() => {
                        const raw = decisionResult.decision_pack as Record<string, unknown> | undefined;
                        const summary = raw?.summary as Record<string, unknown> | undefined;
                        const score = summary?.confidence_score as number | undefined;
                        return score != null ? `${t('console.confidence')} ${(score * 100).toFixed(0)}%` : null;
                      })()}
                    </span>
                  )}
                  <button
                    disabled={isAnalyzing}
                    onClick={() => !isAnalyzing && setShowDecisionPack(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    style={isAnalyzing
                      ? { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' }
                      : { backgroundColor: '#6366F1', color: '#fff' }
                    }
                    onMouseEnter={(e) => { if (!isAnalyzing) e.currentTarget.style.backgroundColor = '#4F46E5'; }}
                    onMouseLeave={(e) => { if (!isAnalyzing) e.currentTarget.style.backgroundColor = '#6366F1'; }}
                  >
                    {isAnalyzing ? t('console.generating') : t('console.generateReport')}
                  </button>
                </div>
              </div>
            </div>

            {/* Graph Area */}
            <div className="flex-1 relative overflow-hidden">
              <ReactFlowProvider>
                <OntologyGraph data={decisionResult} lang={lang} conflicts={reasoningData.conflicts} />
              </ReactFlowProvider>

              {/* Progress overlay while analyzing */}
              {!overlayDismissed && (
                <div className="absolute inset-0 flex flex-col justify-center items-center px-10" style={{ backgroundColor: '#111827' }}>
                  {/* 4-node indigo step pipeline */}
                  {(() => {
                    const pipelineSteps = [
                      { key: 'EXTRACT', label: 'EXTRACT' },
                      { key: 'POLICY', label: 'POLICY' },
                      { key: 'ANALYZE', label: 'ANALYZE' },
                      { key: 'VERDICT', label: 'VERDICT' },
                    ];
                    const isComplete = analysisStep >= 4;
                    return (
                      <div className="w-full max-w-lg">
                        {/* Node pipeline */}
                        <div className="flex items-center justify-between mb-8 relative">
                          {/* Track line */}
                          <div className="absolute top-4 left-4 right-4 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                          {/* Progress line */}
                          <div
                            className="absolute top-4 left-4 h-px transition-all duration-700 ease-in-out"
                            style={{
                              backgroundColor: '#6366F1',
                              width: `calc(${Math.min((analysisStep / 4) * 100, 100)}% - 2rem)`,
                            }}
                          />
                          {pipelineSteps.map((step, idx) => {
                            const done = analysisStep > idx;
                            const active = analysisStep === idx;
                            return (
                              <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                                  style={{
                                    backgroundColor: done ? '#6366F1' : active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                                    border: done ? '2px solid #6366F1' : active ? '2px solid #6366F1' : '2px solid rgba(255,255,255,0.12)',
                                    color: done ? '#fff' : active ? '#A5B4FC' : 'rgba(255,255,255,0.3)',
                                    boxShadow: active ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
                                  }}
                                >
                                  {done ? '✓' : idx + 1}
                                </div>
                                <span className="text-xs font-semibold tracking-widest" style={{ color: done ? '#A5B4FC' : active ? '#818CF8' : 'rgba(255,255,255,0.25)' }}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {/* Status text */}
                        {(() => {
                          const stepLabels = [t('console.astep.1.title'), t('console.astep.2.title'), t('console.astep.3.title'), t('console.astep.4.title')];
                          const stepDescs = [t('console.astep.1.desc'), t('console.astep.2.desc'), t('console.astep.3.desc.default'), t('console.astep.4.desc.default')];
                          const idx = Math.min(analysisStep, 3);
                          return (
                            <p className={`text-sm text-center font-medium ${isComplete ? '' : 'animate-pulse'}`} style={{ color: isComplete ? '#A5B4FC' : 'rgba(255,255,255,0.6)' }}>
                              {isComplete
                                ? (lang === 'en' ? `${stepLabels[idx]} · Complete` : `${stepLabels[idx]} · 완료`)
                                : `${lang === 'en' ? 'Running' : '실행 중'} ${stepLabels[idx]} · ${stepDescs[idx]}`}
                            </p>
                          );
                        })()}
                        {/* Percent */}
                        <p className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>{Math.round((analysisStep / 4) * 100)}%</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>



          </div>
        </div>

        {/* RIGHT PANEL - Rules, Approvals, Trace Log */}
        <div className="w-96 flex flex-col pt-4 pb-4 pr-4 flex-shrink-0">
          <div className="rounded-xl flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('console.right.title')}</span>
              </div>
              <h2 className="text-sm font-bold" style={{ color: '#F9FAFB' }}>
                {isAnalyzing ? t('console.analyzing') : t('console.complete')}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* 1. Governance Verdict - compact */}
            {(() => {
              const status = decisionResult?.governance?.status ?? null;
              const allRules = decisionResult?.governance?.all_rules ?? [];
              const firedRules = allRules.filter(r => {
                const s = r.status?.toUpperCase();
                return s === 'TRIGGERED' || s === 'VIOLATION';
              });
              const riskScore = decisionResult?.governance?.risk_score ?? 0;

              if (!decisionResult) {
                return (
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {t('console.right.verdict.title')}
                    </div>
                    <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('console.right.verdict.pending')}</p>
                  </div>
                );
              }

              const isReview = status === 'review_required' || status === 'needs_review';
              const isApproved = status === 'approved' || status === 'complete';
              const verdictBorderColor = isReview ? 'rgba(245,158,11,0.3)' : isApproved ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)';
              const verdictBg = isReview ? 'rgba(245,158,11,0.08)' : isApproved ? 'rgba(16,185,129,0.08)' : '#1E2433';
              const statusText = isReview ? t('console.right.status.review') : isApproved ? t('console.right.status.approved') : (status ?? '').toUpperCase().replace(/_/g, ' ');
              const statusColor = isReview ? '#FCD34D' : isApproved ? '#6EE7B7' : '#F9FAFB';
              const aggregateBand = decisionResult?.risk_scoring?.aggregate?.band?.toUpperCase();
              const bandKey = aggregateBand
                ? `risk.band.${aggregateBand.toLowerCase()}`
                : riskScore >= 7 ? 'risk.band.high' : riskScore >= 4 ? 'risk.band.medium' : 'risk.band.low';
              const bandLabel = t(bandKey) !== bandKey ? t(bandKey) : (aggregateBand ?? 'LOW');
              const riskBandStyle = (aggregateBand === 'CRITICAL' || aggregateBand === 'HIGH' || riskScore >= 7)
                ? { bg: aggregateBand === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)', color: aggregateBand === 'CRITICAL' ? '#FCA5A5' : '#FDBA74' }
                : (aggregateBand === 'MEDIUM' || riskScore >= 4)
                ? { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' }
                : { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7' };

              return (
                <div className="rounded-xl p-4 space-y-2 animate-in fade-in duration-500" style={{ backgroundColor: verdictBg, border: `1px solid ${verdictBorderColor}` }}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {t('console.right.verdict.title')}
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: riskBandStyle.bg, color: riskBandStyle.color }}>
                      {bandLabel}
                    </span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: statusColor }}>
                    {statusText || '—'}
                  </div>
                  {firedRules.length > 0 && (
                    <ul className="space-y-0.5 pt-1">
                      {firedRules.slice(0, 2).map((rule, i) => (
                        <li key={rule.rule_id ?? i} className="text-xs flex items-start gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <span className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                          <span className="break-words leading-relaxed">
                            {lang === 'en'
                              ? (rule.description_en ?? rule.name_en ?? rule.description ?? rule.name ?? rule.rule_id)
                              : (rule.description ?? rule.name ?? rule.rule_id)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

            {/* 2. Approval Path - compact */}
            {showRules && (decisionResult?.governance?.approval_chain ?? []).length > 0 && (
              <div className="space-y-2 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {t('console.right.approval.title')}
                  </h3>
                  <button
                    onClick={() => { const did = decisionResult?.decision_id; consolNavigate(did ? `/evidence-explorer?decision_id=${encodeURIComponent(did)}` : '/evidence-explorer'); }}
                    className="text-xs transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  >
                    {lang === 'en' ? 'View Details →' : '상세 보기 →'}
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {(decisionResult?.governance?.approval_chain ?? []).map((raw, idx, arr) => {
                    const obj = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null;
                    const role = obj?.role ? String(obj.role) : obj?.name ? String(obj.name) : '—';
                    const rawStatus = obj?.status ? String(obj.status) : '';
                    const statusLabel = rawStatus === 'optional'
                      ? t('console.right.approval.status.optional')
                      : t('console.right.approval.status.pending');
                    const statusColor = rawStatus === 'optional' ? 'rgba(255,255,255,0.3)' : '#FCD34D';
                    return (
                      <div key={idx} className="px-4 py-2.5 flex items-center justify-between" style={idx < arr.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{role}</span>
                        <span className="text-xs font-semibold" style={{ color: statusColor }}>{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Governance Triggers - compact */}
            {showRules && (() => {
              const firedRules = (decisionResult?.governance?.all_rules ?? []).filter(r => {
                const s = r.status?.toUpperCase();
                return s === 'TRIGGERED' || s === 'VIOLATION';
              });
              if (firedRules.length === 0) return null;
              return (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {t('console.right.rules.title')}
                    </h3>
                    <button
                      onClick={() => { const did = decisionResult?.decision_id; consolNavigate(did ? `/evidence-explorer?decision_id=${encodeURIComponent(did)}` : '/evidence-explorer'); }}
                      className="text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                    >
                      {lang === 'en' ? 'View Evidence →' : '근거 보기 →'}
                    </button>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {firedRules.map((rule, idx) => (
                      <div key={rule.rule_id ?? idx} className="px-4 py-2.5 flex items-start justify-between gap-2" style={idx < firedRules.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}>
                        <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {rule.rule_id && <span className="font-mono mr-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{rule.rule_id}</span>}
                          {lang === 'en' ? (rule.name_en ?? rule.name ?? rule.rule_id) : (rule.name ?? rule.rule_id)}
                        </span>
                        <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#F87171' }}>
                          {lang === 'en' ? 'Triggered' : '트리거'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 4. Risk Snapshot - compact */}
            {decisionResult?.risk_scoring && (() => {
              const agg = decisionResult.risk_scoring!.aggregate;
              const dims = (decisionResult.risk_scoring!.dimensions ?? []).slice(0, 2);
              const bandColor = agg.band === 'CRITICAL' ? '#FCA5A5' : agg.band === 'HIGH' ? '#FDBA74' : agg.band === 'MEDIUM' ? '#FCD34D' : '#6EE7B7';
              return (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {t('console.right.risk.section')}
                    </h3>
                    <button
                      onClick={() => { const did = decisionResult?.decision_id; consolNavigate(did ? `/evidence-explorer?decision_id=${encodeURIComponent(did)}` : '/evidence-explorer'); }}
                      className="text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                    >
                      {lang === 'en' ? 'View Evidence →' : '근거 보기 →'}
                    </button>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{lang === 'en' ? 'Risk Score' : '위험도'}</span>
                      <span className="text-xs font-bold" style={{ color: bandColor }}>{agg.score} / 100</span>
                    </div>
                    {dims.map((dim, idx) => {
                      const dimBandColor = dim.band === 'CRITICAL' ? '#FCA5A5' : dim.band === 'HIGH' ? '#FDBA74' : dim.band === 'MEDIUM' ? '#FCD34D' : '#6EE7B7';
                      return (
                        <div key={idx} className="px-4 py-2.5 flex items-center justify-between" style={idx < dims.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{lang === 'en' ? (dim.label_en ?? dim.label) : dim.label}</span>
                          <span className="text-xs font-semibold" style={{ color: dimBandColor }}>{dim.band}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 5. External Signals - compact summary */}
            {decisionResult && (
              <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider block mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {t('console.right.signals.title')}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {lang === 'en' ? 'External context reviewed' : '외부 신호 검토 완료'}
                  </span>
                </div>
                <button
                  onClick={() => { const did = decisionResult?.decision_id; consolNavigate(did ? `/evidence-explorer?decision_id=${encodeURIComponent(did)}` : '/evidence-explorer'); }}
                  className="text-xs flex-shrink-0 ml-2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  {lang === 'en' ? 'View →' : '보기 →'}
                </button>
              </div>
            )}

            {/* Post-analysis: Back to Workspace CTA */}
            {!isAnalyzing && decisionResult && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => consolNavigate('/workspace')}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.25)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.12)'; }}
                >
                  ← Back to Workspace
                </button>
              </div>
            )}


            </div>
          </div>
        </div>
        </div>{/* end two-panel row */}
        </div>{/* end content */}
      </div>{/* end main layout */}
    </div>
  );
}
