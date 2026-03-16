import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronRight, ExternalLink, Settings2, X, Check } from "lucide-react";
import type { AgentItem, AgentAutonomy, EscalationRule } from "../../api/types";
import { getWorkspaceAgents, updateWorkspaceAgent } from "../../api/client";
import { MOCK_ESCALATION_RULES } from "../../api/mockData";
import { consoleCache } from "../store/consoleCache";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";

const AUTONOMY_BADGE: Record<string, string> = {
  "Policy Bound": "bg-gray-900 text-white",
  "Conditional": "bg-gray-200 text-gray-700",
  "Human Controlled": "bg-gray-100 text-gray-600",
  "Autonomous": "bg-gray-800 text-white",
};

const AUTONOMY_OPTIONS: AgentAutonomy[] = ["Human Controlled", "Policy Bound", "Conditional", "Autonomous"];

interface BoundaryDraft {
  autonomy: AgentAutonomy;
  riskThreshold: number;
  financialLimit: number;
}

const DECISIONS_NAV = [
  { label: "Decision Console", path: "/console" },
];

const NAV_ITEMS = [
  { label: "Reasoning Timeline", path: "/reasoning-timeline", active: false },
  { label: "Simulation Lab", path: "/simulation-lab", active: false },
  { label: "Evidence Explorer", path: "/evidence-explorer", active: false },
  { label: "Agent Boundaries", path: "/agent-boundaries", active: true },
];

export function AgentBoundaries() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const { lang } = useLang();
  const isEn = lang === "en";
  const decisionId = searchParams.get("decision_id") ?? "";

  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<BoundaryDraft>({ autonomy: "Policy Bound", riskThreshold: 40, financialLimit: 50000 });

  const agentName = (a: AgentItem) => isEn ? (a.name_en ?? a.name) : a.name;
  const agentDept = (a: AgentItem) => isEn ? (a.department_en ?? a.department) : a.department;

  const startEditing = () => {
    if (!selectedAgent) return;
    setDraft({
      autonomy: selectedAgent.autonomy ?? "Policy Bound",
      riskThreshold: selectedAgent.risk_threshold ?? 40,
      financialLimit: selectedAgent.financial_limit ?? 0,
    });
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = async () => {
    if (!selectedAgent || !token) return;
    setSaving(true);
    try {
      const updated = await updateWorkspaceAgent(token, selectedAgent.id, {
        autonomy: draft.autonomy,
        risk_threshold: draft.riskThreshold,
        financial_limit: draft.financialLimit,
      });
      setSelectedAgent(updated);
      setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditing(false);
    } catch (err) {
      console.error("[AgentBoundaries] save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getWorkspaceAgents(token)
      .then((res) => {
        setAgents(res.items);
        // Pre-select agent matching the current decision if cached
        const cachedAgentName = consoleCache?.flowState?.agentNameEn ?? consoleCache?.flowState?.agentName;
        const match = cachedAgentName
          ? res.items.find((a) => (a.name_en ?? a.name).toLowerCase().includes(cachedAgentName.toLowerCase()))
          : null;
        setSelectedAgent(match ?? res.items[0] ?? null);
      })
      .catch((err) => console.error("[AgentBoundaries] fetch agents failed:", err))
      .finally(() => setLoading(false));
    setEscalationRules(MOCK_ESCALATION_RULES);
    setEditing(false);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F1F2F7" }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading agent data...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F1F2F7", fontFamily: "SUIT Variable, Inter, sans-serif" }}
    >
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
          <span className="text-gray-700 font-medium">Agent Boundaries</span>
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
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Analysis Tools
            </div>
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
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  item.active ? "bg-white" : "bg-gray-300"
                }`}
              />
              {item.label}
            </button>
          ))}
          <div className="mt-auto px-4 pt-4 border-t border-gray-100 mx-4">
            <div className="text-[10px] text-gray-400 font-medium">Registry Version</div>
            <div className="text-[10px] font-semibold text-gray-700 font-mono mt-0.5">v2024.09</div>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4 pb-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-base font-bold text-gray-900">Agent Governance Boundaries</h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    View registered agents and configure governance policies for their decisions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-500">
                    <ExternalLink className="w-3 h-3" />
                    Agents synced from external registry
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Agent Registry Table */}
              <div>
                <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Agent Registry
                  </div>
                </div>
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_0.6fr] gap-3 px-6 py-2 bg-gray-50 border-b border-gray-100">
                  {[
                    "Agent Name",
                    "Department",
                    "Autonomy",
                    "Risk Threshold",
                    "Financial Limit",
                    "Status",
                  ].map((col) => (
                    <div
                      key={col}
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center"
                    >
                      {col}
                    </div>
                  ))}
                </div>
                {/* Table Rows */}
                <div className="divide-y divide-gray-50">
                  {agents.map((agent) => {
                    const isSelected = selectedAgent?.id === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => { setSelectedAgent(agent); setEditing(false); }}
                        className={`w-full text-left grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_0.6fr] items-center gap-3 px-6 py-3 transition-colors hover:bg-gray-50 ${
                          isSelected ? "bg-gray-50 border-l-2 border-l-gray-800" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-white">
                              {agentName(agent).slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-gray-900">{agentName(agent)}</div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-600">{agentDept(agent)}</span>
                        </div>
                        <div className="self-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${AUTONOMY_BADGE[agent.autonomy]}`}
                          >
                            {agent.autonomy}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-gray-600">{agent.risk_threshold ?? "—"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-gray-600">${(agent.financial_limit ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          {agent.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                              {agent.status}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom 2-col grid */}
              <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-100">
                {/* Decision Authority */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Governance Config
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-white">
                        {selectedAgent ? agentName(selectedAgent).slice(0, 2).toUpperCase() : "—"}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{selectedAgent ? agentName(selectedAgent) : "—"}</div>
                      <div className="text-[10px] text-gray-400">{selectedAgent ? agentDept(selectedAgent) : ""}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-gray-400">Autonomy</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${selectedAgent ? AUTONOMY_BADGE[selectedAgent.autonomy] : ""}`}
                      >
                        {selectedAgent?.autonomy ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-gray-400">Risk Threshold</span>
                      <span className="text-[10px] font-semibold text-gray-700">{selectedAgent?.risk_threshold ?? "—"}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-gray-400">Financial Limit</span>
                      <span className="text-[10px] font-semibold text-gray-700">{selectedAgent ? `$${(selectedAgent.financial_limit ?? 0).toLocaleString()}` : "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Escalation Rules */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Escalation Rules
                  </div>
                  <div className="space-y-3">
                    {escalationRules.map((rule, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rule.severity === "CRITICAL"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-orange-50 text-orange-700 border border-orange-200"
                            }`}
                          >
                            {rule.severity}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div>
                            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
                              Trigger
                            </div>
                            <div className="text-[10px] text-gray-700 leading-relaxed">{rule.trigger}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
                              Action
                            </div>
                            <div className="text-[10px] text-gray-700 leading-relaxed">{rule.action}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
                              Responsible
                            </div>
                            <div className="text-[10px] font-semibold text-gray-800">{rule.responsible}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center gap-8 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  Total Agents
                </span>
                <span className="text-sm font-bold text-gray-900">{agents.length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  Active
                </span>
                <span className="text-sm font-bold text-gray-900">{agents.filter(a => a.status === "Active").length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  Escalation Rules
                </span>
                <span className="text-sm font-bold text-gray-900">{escalationRules.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 flex flex-col pt-4 pb-4 pr-4 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              {selectedAgent ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{agentDept(selectedAgent)}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${selectedAgent.status === "Active" ? "text-green-700" : "text-orange-600"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedAgent.status === "Active" ? "bg-green-500" : "bg-orange-400"}`} />
                      {selectedAgent.status}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">{agentName(selectedAgent)}</h2>
                </>
              ) : (
                <h2 className="text-sm font-bold text-gray-900">Select an agent</h2>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedAgent ? (
                editing ? (
                  /* ── EDIT MODE ── */
                  <>
                    {/* Autonomy Level */}
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Autonomy Level
                      </div>
                      <div className="space-y-1.5">
                        {AUTONOMY_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setDraft((d) => ({ ...d, autonomy: opt }))}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                              draft.autonomy === opt
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Risk Threshold */}
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Risk Score Threshold
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">Auto-approve decisions below this risk score</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={draft.riskThreshold}
                          onChange={(e) => setDraft((d) => ({ ...d, riskThreshold: Number(e.target.value) }))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900"
                        />
                        <span className="text-sm font-bold text-gray-900 tabular-nums w-8 text-right">{draft.riskThreshold}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-gray-400">Low risk</span>
                        <span className="text-[9px] text-gray-400">High risk</span>
                      </div>
                    </div>

                    {/* Financial Limit */}
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Financial Limit
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">Max value agent can authorize independently</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={draft.financialLimit}
                          onChange={(e) => setDraft((d) => ({ ...d, financialLimit: Number(e.target.value) }))}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── VIEW MODE ── */
                  <>
                    {/* Autonomy Level */}
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Autonomy Level
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${AUTONOMY_BADGE[selectedAgent.autonomy]}`}
                        >
                          {selectedAgent.autonomy}
                        </span>
                      </div>
                    </div>

                    {/* Risk Threshold */}
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Risk Score Threshold
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-700 rounded-full transition-all"
                            style={{ width: `${selectedAgent.risk_threshold ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900 tabular-nums">{selectedAgent.risk_threshold ?? 0}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Auto-approve below this score</p>
                    </div>

                    {/* Financial Limit */}
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        Financial Limit
                      </div>
                      <div className="text-sm font-bold text-gray-900">${(selectedAgent.financial_limit ?? 0).toLocaleString()}</div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Max independent authorization</p>
                    </div>
                  </>
                )
              ) : (
                <p className="text-xs text-gray-400">Select an agent to view details</p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={saveEditing}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditing}
                  disabled={!selectedAgent}
                  className="w-full flex items-center justify-center gap-1.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Configure Boundaries
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
