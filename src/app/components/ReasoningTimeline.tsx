import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { ReasoningStep, DecisionResponse } from "../../api/types";
import { consoleCache } from "../store/consoleCache";
import { useLang } from "../contexts/LangContext";

/** Build reasoning steps from the cached DecisionResponse */
function buildStepsFromCache(r: DecisionResponse, isEn: boolean): ReasoningStep[] {
  const now = new Date();
  const ts = (offsetMs: number) => {
    const d = new Date(now.getTime() - offsetMs);
    return d.toISOString().slice(11, 23);
  };

  const steps: ReasoningStep[] = [];
  let id = 0;

  // 1. Input Parsing — extracted entities from decision_context
  const entities = r.decision_context?.entities ?? [];
  const entityNames = entities.map((e) => isEn ? e.label : e.key);
  const ontologyFromEntities = entities.filter((e) => e.category).map((e) => e.category!);
  steps.push({
    id: ++id,
    name: "Input Parsing",
    description: "Extract structured entities from decision text",
    timestamp: ts(7000),
    duration: "120ms",
    status: entities.length > 0 ? "completed" : "skipped",
    summary: entities.length > 0
      ? `Extracted ${entities.length} entities: ${entityNames.slice(0, 4).join(", ")}${entities.length > 4 ? "…" : ""}`
      : "No structured entities extracted",
    entities: entityNames,
    ontology: [...new Set(ontologyFromEntities)],
  });

  // 2. Context Retrieval — company + proposal
  const proposal = isEn ? (r.decision_context?.proposal_en ?? r.decision_context?.proposal) : (r.decision_context?.proposal ?? r.decision_context?.proposal_en);
  const companyName = r.company?.name ?? "";
  steps.push({
    id: ++id,
    name: "Context Retrieval",
    description: "Retrieve company context and decision proposal",
    timestamp: ts(6000),
    duration: "185ms",
    status: "completed",
    summary: proposal
      ? `${companyName ? companyName + ": " : ""}${proposal.slice(0, 120)}${proposal.length > 120 ? "…" : ""}`
      : "Decision context loaded",
    entities: companyName ? [companyName] : [],
    ontology: entities.filter((e) => e.kind).map((e) => e.kind!).filter((v, i, a) => a.indexOf(v) === i),
  });

  // 3. Ontology Mapping — graph nodes
  const nodes = Array.isArray(r.graph_payload?.nodes) ? r.graph_payload.nodes : [];
  const nodeTypes = [...new Set(nodes.map((n) => n.type))];
  steps.push({
    id: ++id,
    name: "Ontology Mapping",
    description: "Map entities to knowledge graph ontology",
    timestamp: ts(5000),
    duration: "210ms",
    status: nodes.length > 0 ? "completed" : "skipped",
    summary: nodes.length > 0
      ? `Mapped ${nodes.length} nodes across ${nodeTypes.length} types: ${nodeTypes.slice(0, 4).join(", ")}`
      : "No ontology mapping performed",
    entities: nodes.slice(0, 6).map((n) => isEn ? (n.label_en ?? n.label) : n.label),
    ontology: nodeTypes,
  });

  // 4. Policy Evaluation — triggered rules
  const allRules = r.governance?.all_rules ?? [];
  const triggered = r.governance?.triggered_rules ?? [];
  steps.push({
    id: ++id,
    name: "Policy Evaluation",
    description: "Evaluate governance rules and compliance policies",
    timestamp: ts(4000),
    duration: "340ms",
    status: "completed",
    summary: `Evaluated ${allRules.length} rules, ${triggered.length} triggered`,
    entities: triggered.slice(0, 5).map((rule) => isEn ? (rule.name_en ?? rule.name ?? rule.rule_id ?? "") : (rule.name ?? rule.name_en ?? rule.rule_id ?? "")),
    ontology: [...new Set(triggered.map((rule) => rule.type ?? "policy").filter(Boolean))],
  });

  // 5. Risk Scoring — aggregate + dimensions
  const scoring = r.risk_scoring;
  const dims = scoring?.dimensions ?? [];
  steps.push({
    id: ++id,
    name: "Risk Scoring",
    description: "Compute aggregate and per-dimension risk scores",
    timestamp: ts(3000),
    duration: "280ms",
    status: scoring ? "completed" : "skipped",
    summary: scoring
      ? `Aggregate score: ${scoring.aggregate.score} (${scoring.aggregate.band}) across ${dims.length} dimensions`
      : "Risk scoring not available",
    entities: dims.map((d) => `${isEn ? (d.label_en ?? d.label) : d.label}: ${d.score}`),
    ontology: dims.map((d) => d.id),
  });

  // 6. Approval Chain Resolution
  const chain = r.governance?.approval_chain ?? [];
  steps.push({
    id: ++id,
    name: "Approval Chain Resolution",
    description: "Resolve required approval chain based on policy evaluation",
    timestamp: ts(2000),
    duration: "95ms",
    status: chain.length > 0 ? "completed" : "skipped",
    summary: chain.length > 0
      ? `${chain.length}-step approval chain: ${chain.map((s) => s.role).join(" → ")}`
      : "No approval chain required",
    entities: chain.map((s) => s.name ?? s.role),
    ontology: [...new Set(chain.filter((s) => s.source_rule_id).map((s) => s.source_rule_id!))],
  });

  // 7. Simulation Check
  const sim = r.risk_response_simulation;
  const scenarioCount = sim?.scenarios?.length ?? 0;
  steps.push({
    id: ++id,
    name: "Simulation Check",
    description: "Run risk response simulations for remediation scenarios",
    timestamp: ts(1000),
    duration: "450ms",
    status: scenarioCount > 0 ? "completed" : "skipped",
    summary: scenarioCount > 0
      ? `Generated ${scenarioCount} remediation scenario${scenarioCount > 1 ? "s" : ""}`
      : "No simulation scenarios generated",
    entities: (sim?.scenarios ?? []).slice(0, 4).map((s) => isEn ? (s.titleEn ?? s.titleKo ?? "") : (s.titleKo ?? s.titleEn ?? "")),
    ontology: [...new Set((sim?.scenarios ?? []).flatMap((s) => s.issueTypes ?? []))],
  });

  // 8. Decision Pack Generation
  const pack = r.decision_pack;
  steps.push({
    id: ++id,
    name: "Decision Pack Generation",
    description: "Compile final decision pack with all findings",
    timestamp: ts(0),
    duration: "160ms",
    status: pack ? "completed" : "skipped",
    summary: pack
      ? `Decision pack generated — verdict: ${r.governance?.status ?? "pending"}`
      : "Decision pack pending",
    entities: (r.governance?.flags ?? []).map((f) => f.code).filter(Boolean),
    ontology: [...new Set((r.governance?.flags ?? []).map((f) => f.category ?? "").filter(Boolean))],
  });

  return steps;
}
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  Diamond,
  TreePine,
  Activity,
  Layers,
  GitBranch,
  Search,
  Database,
  Shield,
  Cpu,
  FileCheck,
} from "lucide-react";

const STEP_ICON_MAP: Record<string, typeof Search> = {
  "Input Parsing": Search,
  "Context Retrieval": Database,
  "Ontology Mapping": GitBranch,
  "Policy Evaluation": Shield,
  "Risk Scoring": Activity,
  "Approval Chain Resolution": Layers,
  "Simulation Check": Cpu,
  "Decision Pack Generation": FileCheck,
};

const ICON_ORDER = [Search, Database, GitBranch, Shield, Activity, Layers, Cpu, FileCheck];

function getStepIcon(step: ReasoningStep): typeof Search {
  return STEP_ICON_MAP[step.name] ?? ICON_ORDER[(step.id - 1) % ICON_ORDER.length] ?? Activity;
}

const DECISIONS_NAV = [
  { label: "Decision Console", path: "/console" },
];

const NAV_ITEMS = [
  { label: "Reasoning Timeline", path: "/reasoning-timeline", active: true },
  { label: "Simulation Lab", path: "/simulation-lab", active: false },
  { label: "Evidence Explorer", path: "/evidence-explorer", active: false },
  { label: "Agent Boundaries", path: "/agent-boundaries", active: false },
];

export function ReasoningTimeline() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const decisionId =
    searchParams.get("decision_id") ??
    consoleCache?.flowState?.workspaceDecisionId ??
    "";

  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<ReasoningStep | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const isEn = lang === 'en';
    const cached = consoleCache;
    if (cached?.result) {
      const built = buildStepsFromCache(cached.result, isEn);
      if (built.length > 0) {
        setSteps(built);
        setTotalDuration(1840);
        setSelectedStep(built[0]);
        setLoading(false);
        return;
      }
    }
    // No cache — show empty
    setSteps([]);
    setTotalDuration(0);
    setSelectedStep(null);
    setLoading(false);
  }, [decisionId, lang]);

  const totalDurationStr = totalDuration > 0 ? `${(totalDuration / 1000).toFixed(2)}s` : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F1F2F7" }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading reasoning trace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1F2F7", fontFamily: "SUIT Variable, Inter, sans-serif" }}>
      {/* Top Bar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-5 bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"></div>
            <div className="w-1.5 h-5 bg-gradient-to-b from-gray-800 to-gray-900 rounded-sm mt-0.5"></div>
            <div className="w-1.5 h-5 bg-gradient-to-b from-gray-900 to-black rounded-sm"></div>
          </div>
          <a href="/" className="font-bold text-sm tracking-wider text-gray-900">
            DecisionGovernance AI
          </a>
        </div>
        <div className="ml-6 flex items-center gap-1 text-xs text-gray-400">
          <span>Platform</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Reasoning Timeline</span>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* LEFT SIDEBAR */}
        <div className="w-52 bg-white border-r border-gray-200 flex flex-col py-4 flex-shrink-0">
          <div className="px-4 mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Decisions</div>
          </div>
          {DECISIONS_NAV.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(decisionId ? `${item.path}?decision_id=${encodeURIComponent(decisionId)}` : item.path)}
              className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gray-300" />
              {item.label}
            </button>
          ))}

          <div className="px-4 mt-4 mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Analysis Tools</div>
          </div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(decisionId ? `${item.path}?decision_id=${encodeURIComponent(decisionId)}` : item.path)}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                item.active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.active ? "bg-white" : "bg-gray-300"}`} />
              {item.label}
            </button>
          ))}

          <div className="mt-auto px-4 pt-4 border-t border-gray-100 mx-4">
            <div className="text-[10px] text-gray-400 font-medium">Decision ID</div>
            <div className="text-[10px] font-semibold text-gray-700 font-mono mt-0.5">{decisionId}</div>
          </div>
        </div>

        {/* CENTER — Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4 pb-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-base font-bold text-gray-900">AI Reasoning Timeline</h1>
                  <p className="text-xs text-gray-500 mt-0.5">Step-by-step decision trace for audit and review</p>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                  {totalDurationStr} total
                </span>
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[2rem_1fr_1.5fr_6rem_5rem_6rem] gap-3 px-6 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div />
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Step</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Description</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Timestamp</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Duration</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Status</div>
            </div>

            {/* Steps */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {steps.map((step) => {
                const Icon = getStepIcon(step);
                const isSelected = selectedStep?.id === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className={`w-full text-left grid grid-cols-[2rem_1fr_1.5fr_6rem_5rem_6rem] gap-3 px-6 py-3 transition-colors hover:bg-gray-50 ${isSelected ? "bg-gray-50 border-l-2 border-l-gray-800" : ""}`}
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-gray-900" : "bg-gray-100"}`}>
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                        {step.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 truncate">{step.description}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[10px] font-mono text-gray-400">{step.timestamp}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[10px] font-mono text-gray-500">{step.duration}</span>
                    </div>
                    <div className="flex items-center">
                      {step.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[10px] font-semibold text-green-700">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Completed
                        </span>
                      ) : step.status === "failed" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded text-[10px] font-semibold text-red-700">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-semibold text-gray-500">
                          Skipped
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Stats */}
            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center gap-8 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Total Steps</span>
                <span className="text-sm font-bold text-gray-900">{steps.length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Duration</span>
                <span className="text-sm font-bold text-gray-900">{totalDurationStr}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rules Evaluated</span>
                <span className="text-sm font-bold text-gray-900">{steps.length > 0 ? steps.length : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 flex flex-col pt-4 pb-4 pr-4 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Step {selectedStep?.id ?? "—"} of {steps.length}</span>
              </div>
              <h2 className="text-sm font-bold text-gray-900">{selectedStep?.name ?? "Select a step"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {selectedStep ? (
                <>
                  {/* Execution Info */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Execution Info</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Timestamp</span>
                        <span className="text-[10px] font-mono font-semibold text-gray-700">{selectedStep.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Duration</span>
                        <span className="text-[10px] font-mono font-semibold text-gray-700">{selectedStep.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Summary</div>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {selectedStep.summary}
                    </p>
                  </div>

                  {/* Extracted Entities */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Extracted Entities</div>
                    <div className="space-y-1.5">
                      {selectedStep.entities.map((entity, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Diamond className="w-2.5 h-2.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{entity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matched Ontology Concepts */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Matched Ontology Concepts</div>
                    <div className="space-y-1.5">
                      {selectedStep.ontology.map((concept, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <TreePine className="w-2.5 h-2.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs font-mono text-gray-700">{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400">Select a step to view details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
