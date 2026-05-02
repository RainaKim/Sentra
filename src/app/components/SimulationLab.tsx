import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronRight, RotateCcw, Play, Loader2 } from "lucide-react";
import type { SimulationScenario, RiskResponseScenario } from "../../api/types";
import { consoleCache } from "../store/consoleCache";
import { useLang } from "../contexts/LangContext";

/** Transform backend RiskResponseScenario → SimulationScenario for the SimulationLab UI */
function transformRiskScenarios(
  scenarios: RiskResponseScenario[],
  baselineScore: number,
  lang: string
): SimulationScenario[] {
  return scenarios.map((s, i) => {
    const isEn = lang === 'en';
    const name = (isEn ? (s.titleEn ?? s.titleKo) : (s.titleKo ?? s.titleEn)) ?? `Scenario ${i + 1}`;
    const subtitle = (isEn ? (s.changeSummaryEn ?? s.changeSummaryKo) : (s.changeSummaryKo ?? s.changeSummaryEn)) ?? '';
    const rawScore = s.expectedOutcome?.aggregateRiskScore ?? (baselineScore + (s.delta?.aggregateRiskScoreDelta ?? 0));
    const newScore = Math.max(0, Math.min(100, rawScore <= 1 ? rawScore * 100 : rawScore));
    const remainingCount = s.remainingIssues?.length ?? 0;
    const band = s.expectedOutcome?.band?.toUpperCase() ?? '';
    const color: SimulationScenario['color'] =
      band === 'CRITICAL' || band === 'HIGH' ? 'red'
      : band === 'MEDIUM' ? 'orange'
      : 'green';
    const financialDelta = s.delta?.financialRiskDelta ?? 0;
    const rationale = isEn
      ? (s.rationaleEn ?? s.rationaleKo)
      : (s.rationaleKo ?? s.rationaleEn);
    return {
      id: s.scenarioId ?? `S${i + 1}`,
      name,
      subtitle,
      risk_score: Math.round(newScore),
      violations: remainingCount,
      financial_impact: financialDelta !== 0 ? `${financialDelta > 0 ? '+' : ''}${financialDelta}%` : '—',
      financial_impact_k: Math.round(financialDelta * 10),
      approval_required: s.expectedOutcome?.requiredApprovals?.join(', ') ?? '—',
      outcome: s.expectedOutcome?.status ?? '—',
      confidence: typeof s.confidence === 'number' ? (s.confidence <= 1 ? Math.round(s.confidence * 100) : s.confidence) : 0,
      exec_time: '—',
      resource_need: '—',
      color,
      resolvedIssues: (isEn ? s.resolvedIssuesEn ?? s.resolvedIssues : s.resolvedIssues ?? s.resolvedIssuesEn) ?? [],
      remainingIssues: (isEn ? s.remainingIssuesEn ?? s.remainingIssues : s.remainingIssues ?? s.remainingIssuesEn) ?? [],
      rationale: rationale ?? undefined,
    };
  });
}
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const COLOR_MAP: Record<string, { fill: string; dot: string }> = {
  red: { fill: "#ef4444", dot: "bg-red-500" },
  orange: { fill: "#f97316", dot: "bg-orange-400" },
  green: { fill: "#22c55e", dot: "bg-green-500" },
};

const GRAY_FILLS = ["#374151", "#6b7280", "#d1d5db"];

const DECISIONS_NAV = [
  { label: "Decision Console", path: "/console" },
];

const NAV_ITEMS = [
  { label: "Reasoning Timeline", path: "/reasoning-timeline", active: false },
  { label: "Simulation Lab", path: "/simulation-lab", active: true },
  { label: "Evidence Explorer", path: "/evidence-explorer", active: false },
  { label: "Agent Boundaries", path: "/agent-boundaries", active: false },
];

export function SimulationLab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const decisionId = searchParams.get("decision_id") ?? "";
  const { lang } = useLang();

  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [simulationsRun, setSimulationsRun] = useState(0);
  const [avgRiskReduction, setAvgRiskReduction] = useState(0);
  const [baselineRiskScore, setBaselineRiskScore] = useState(50);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchData = useCallback(async () => {
    const cached = consoleCache;
    const sim = cached?.result?.risk_response_simulation;
    if (sim?.scenarios && sim.scenarios.length > 0) {
      const rawBaseline = sim.baseline?.aggregateRiskScore ?? cached?.result?.governance?.risk_score ?? 50;
      const baselineScore = rawBaseline <= 1 ? rawBaseline * 100 : rawBaseline;
      setBaselineRiskScore(Math.round(baselineScore));
      const transformed = transformRiskScenarios(sim.scenarios, baselineScore, lang);
      setScenarios(transformed);
      const recommended = transformed.find(s => sim.scenarios?.find(r => r.scenarioId === s.id && r.isRecommended));
      setSelectedScenario(recommended ?? transformed[transformed.length - 1]);
      setSimulationsRun(sim.scenarios.length);
      const deltas = sim.scenarios.map(s => s.delta?.aggregateRiskScoreDelta ?? 0).filter(d => d < 0);
      setAvgRiskReduction(deltas.length > 0 ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length) : 0);
    }
    setLoading(false);
  }, [decisionId, lang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRunSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setTimeout(() => {
      fetchData();
      setSimulating(false);
    }, 600);
  };

  // Derived chart data
  const riskComparisonData = scenarios.map((s, i) => ({
    name: `Sim ${i + 1}`,
    value: s.risk_score,
    fill: COLOR_MAP[s.color]?.fill ?? "#374151",
  }));
  const financialImpactData = scenarios.map((s, i) => ({
    name: `Sim ${i + 1}`,
    value: s.financial_impact_k,
  }));
  const policyViolationsData = scenarios.map((s, i) => ({
    name: `Sim ${i + 1}`,
    value: s.violations,
    fill: GRAY_FILLS[i % GRAY_FILLS.length],
  }));
  // Risk Dimension Breakdown — starts with original decision, then each simulation
  const riskDimensionData = [
    {
      name: "Original",
      "Risk Score": baselineRiskScore,
      Violations: scenarios.length > 0 ? Math.max(...scenarios.map(s => s.violations)) + 2 : 0,
      "Issues": scenarios.length > 0 ? scenarios[0].remainingIssues.length + scenarios[0].resolvedIssues.length : 0,
    },
    ...scenarios.map((s, i) => ({
      name: `Sim ${i + 1}`,
      "Risk Score": s.risk_score,
      Violations: s.violations,
      "Issues": s.remainingIssues.length,
    })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F1F2F7" }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading simulation data...
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
          <button onClick={() => navigate('/workspace')} className="font-bold text-sm tracking-wider text-gray-900 hover:opacity-80 transition-opacity">
            DecisionGovernance AI
          </button>
        </div>
        <div className="ml-6 flex items-center gap-1 text-xs text-gray-400">
          <span>Platform</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Simulation Lab</span>
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

        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4 pb-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-base font-bold text-gray-900">Decision Simulation Lab</h1>
                  <p className="text-xs text-gray-500 mt-0.5">Model counterfactual scenarios to evaluate risk before committing</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Scenario Cards */}
              <div className="grid grid-cols-3 gap-3">
                {scenarios.map((scenario, idx) => {
                  const isSelected = selectedScenario?.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Simulation {idx + 1}</span>
                        <div className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP[scenario.color]?.dot ?? "bg-gray-400"}`} />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900">{scenario.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mb-3">{scenario.subtitle}</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Risk Score</span>
                          <span className={`text-xs font-bold ${
                            scenario.color === "red" ? "text-red-600" :
                            scenario.color === "orange" ? "text-orange-500" : "text-green-600"
                          }`}>{scenario.risk_score}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Violations</span>
                          <span className="text-xs font-bold text-gray-700">{scenario.violations}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Chart Grid 2x2 */}
              <div className="grid grid-cols-2 gap-4">
                {/* Risk Score Comparison */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Risk Score Comparison</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={riskComparisonData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {riskComparisonData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Financial Impact Projection */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Financial Impact Projection ($K)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={financialImpactData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`$${v}K`, "Impact"]} />
                      <Bar dataKey="value" fill="#374151" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Policy Violations Count */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Policy Violations Count</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={policyViolationsData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {policyViolationsData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Risk Dimension Breakdown */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Risk Dimension Breakdown</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={riskDimensionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Risk Score" stroke="#111827" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Violations" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Issues" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center gap-8 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Scenarios</span>
                <span className="text-sm font-bold text-gray-900">{scenarios.length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Simulations Run</span>
                <span className="text-sm font-bold text-gray-900">{simulationsRun}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Avg Risk Reduction</span>
                <span className="text-sm font-bold text-gray-900">{avgRiskReduction}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 flex flex-col pt-4 pb-4 pr-4 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            {selectedScenario ? (
              <>
                {/* Header — scenario name + subtitle */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP[selectedScenario.color]?.dot ?? "bg-gray-400"}`} />
                    <h2 className="text-sm font-bold text-gray-900">{selectedScenario.name}</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{selectedScenario.subtitle}</p>
                  {selectedScenario.rationale && (
                    <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Why This Works</div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{selectedScenario.rationale}</p>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Risk Score — prominent display */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-end justify-between mb-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Risk Score</span>
                      <span className={`text-2xl font-bold tabular-nums ${
                        selectedScenario.color === "red" ? "text-red-600" :
                        selectedScenario.color === "orange" ? "text-orange-500" : "text-green-600"
                      }`}>{selectedScenario.risk_score}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedScenario.color === "red" ? "bg-red-500" :
                          selectedScenario.color === "orange" ? "bg-orange-400" : "bg-green-500"
                        }`}
                        style={{ width: `${selectedScenario.risk_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                    <div className="bg-white px-4 py-3">
                      <div className="text-[10px] text-gray-400 font-medium mb-1">Confidence</div>
                      <div className="text-sm font-bold text-gray-900">{selectedScenario.confidence}%</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                      <div className="text-[10px] text-gray-400 font-medium mb-1">Violations</div>
                      <div className={`text-sm font-bold ${selectedScenario.violations > 0 ? "text-red-600" : "text-green-600"}`}>
                        {selectedScenario.violations}
                      </div>
                    </div>
                    <div className="bg-white px-4 py-3">
                      <div className="text-[10px] text-gray-400 font-medium mb-1">Financial</div>
                      <div className="text-sm font-bold text-gray-900">{selectedScenario.financial_impact}</div>
                    </div>
                    <div className="bg-white px-4 py-3">
                      <div className="text-[10px] text-gray-400 font-medium mb-1">Approval</div>
                      <div className="text-xs font-semibold text-gray-700 leading-tight">{selectedScenario.approval_required}</div>
                    </div>
                  </div>

                  {/* Expected Outcome — resolved & remaining */}
                  <div className="px-5 py-4 space-y-3">
                    {selectedScenario.resolvedIssues.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Resolved Issues</div>
                        <div className="space-y-1.5">
                          {selectedScenario.resolvedIssues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-px">
                                <span className="text-green-600 text-[10px] font-bold">&#10003;</span>
                              </div>
                              <span className="leading-relaxed">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedScenario.remainingIssues.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Remaining Issues</div>
                        <div className="space-y-1.5">
                          {selectedScenario.remainingIssues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <div className="w-4 h-4 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-px">
                                <span className="text-orange-500 text-[10px] font-bold">!</span>
                              </div>
                              <span className="leading-relaxed">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedScenario.resolvedIssues.length === 0 && selectedScenario.remainingIssues.length === 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Expected Outcome</div>
                        <p className="text-xs text-gray-600 leading-relaxed">{selectedScenario.expected_outcome}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-400">Select a scenario to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
