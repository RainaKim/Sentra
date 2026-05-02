import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronRight, Search, CheckCircle2, Clock } from "lucide-react";
import type { EvidenceItem, GovernanceEvidenceItem, GovernanceEvidence, ExternalSignals, ExternalSignalItem } from "../../api/types";
import { consoleCache } from "../store/consoleCache";
import { useLang } from "../contexts/LangContext";

// Maps governance_evidence key → display type + color for the Evidence Explorer UI
const EVIDENCE_CATEGORY_MAP: Record<string, { type: string; type_color: string }> = {
  financialEvidence: { type: "Financial", type_color: "pink" },
  procurementEvidence: { type: "Procurement", type_color: "orange" },
  strategicEvidence: { type: "Strategic", type_color: "blue" },
  strategyEvidence: { type: "Strategy", type_color: "blue" },
  complianceEvidence: { type: "Compliance", type_color: "gray" },
  operationalEvidence: { type: "Operational", type_color: "orange" },
  reputationalEvidence: { type: "Reputational", type_color: "teal" },
  approvalEvidence: { type: "Approval", type_color: "purple" },
  policyEvidence: { type: "Policy", type_color: "gray" },
};

interface EvidenceSection {
  category: string;
  type_color: string;
  items: EvidenceItem[];
}

function transformGovernanceEvidence(ge: GovernanceEvidence, isEn: boolean): EvidenceSection[] {
  const sections: EvidenceSection[] = [];
  let idx = 0;
  for (const [key, arr] of Object.entries(ge)) {
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const meta = EVIDENCE_CATEGORY_MAP[key] ?? { type: key.replace(/Evidence$/, ""), type_color: "gray" };
    const items: EvidenceItem[] = [];
    for (const item of arr as GovernanceEvidenceItem[]) {
      idx++;
      const title = isEn ? (item.titleEn ?? item.titleKo ?? "") : (item.titleKo ?? item.titleEn ?? "");
      const summary = isEn ? (item.summaryEn ?? item.summaryKo ?? "") : (item.summaryKo ?? item.summaryEn ?? "");
      const citation = isEn ? (item.citationEn ?? item.citationKo ?? "") : (item.citationKo ?? item.citationEn ?? "");
      const docName = isEn ? (item.documentNameEn ?? item.documentNameKo ?? "") : (item.documentNameKo ?? item.documentNameEn ?? "");
      items.push({
        id: item.id ?? `EV-${String(idx).padStart(3, "0")}`,
        source: docName || title || `${meta.type} #${idx}`,
        type: meta.type,
        type_color: meta.type_color,
        confidence: typeof item.metadata?.confidence === "number" ? (item.metadata.confidence <= 1 ? Math.round(item.metadata.confidence * 100) : item.metadata.confidence) : 85,
        relevance: (item.category === "critical" ? "Critical" : item.category === "high" ? "High" : "Medium") as EvidenceItem["relevance"],
        timestamp: (item.metadata?.timestamp as string) ?? new Date().toISOString(),
        status: "Verified",
        summary: summary || citation || title || "—",
        decision_relevance: citation || summary || "—",
      });
    }
    sections.push({ category: meta.type, type_color: meta.type_color, items });
  }
  return sections;
}

const SIGNAL_CATEGORY_MAP: Record<string, { type: string; type_color: string }> = {
  marketSignals: { type: "Market Signal", type_color: "blue" },
  operationalSignals: { type: "Operational Signal", type_color: "orange" },
  regulatorySignals: { type: "Regulatory Signal", type_color: "gray" },
};

function transformExternalSignals(es: ExternalSignals, isEn: boolean): EvidenceSection[] {
  const sections: EvidenceSection[] = [];
  let idx = 0;
  for (const [key, arr] of Object.entries(es)) {
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const meta = SIGNAL_CATEGORY_MAP[key] ?? { type: "External Signal", type_color: "teal" };
    const items: EvidenceItem[] = [];
    for (const item of arr as ExternalSignalItem[]) {
      idx++;
      const title = isEn ? (item.titleEn ?? item.titleKo ?? "") : (item.titleKo ?? item.titleEn ?? "");
      const summary = isEn ? (item.summaryEn ?? item.summaryKo ?? "") : (item.summaryKo ?? item.summaryEn ?? "");
      const relevance = isEn ? (item.decisionRelevanceEn ?? item.decisionRelevanceKo ?? "") : (item.decisionRelevanceKo ?? item.decisionRelevanceEn ?? "");
      items.push({
        id: item.id ?? `ES-${String(idx).padStart(3, "0")}`,
        source: item.source?.sourceLabel || title || `${meta.type} #${idx}`,
        type: meta.type,
        type_color: meta.type_color,
        confidence: typeof item.confidence === "number" ? (item.confidence <= 1 ? Math.round(item.confidence * 100) : item.confidence) : 75,
        relevance: "Medium",
        timestamp: new Date().toISOString(),
        status: "External",
        summary: summary || title || "—",
        decision_relevance: relevance || summary || "—",
      });
    }
    sections.push({ category: meta.type, type_color: meta.type_color, items });
  }
  return sections;
}

const TYPE_COLORS: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  gray: "bg-gray-100 text-gray-700 border-gray-300",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
};

const DECISIONS_NAV = [
  { label: "Decision Console", path: "/console" },
];

const NAV_ITEMS = [
  { label: "Reasoning Timeline", path: "/reasoning-timeline", active: false },
  { label: "Simulation Lab", path: "/simulation-lab", active: false },
  { label: "Evidence Explorer", path: "/evidence-explorer", active: true },
  { label: "Agent Boundaries", path: "/agent-boundaries", active: false },
];

export function EvidenceExplorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const decisionId = searchParams.get("decision_id") ?? "";
  const { lang } = useLang();

  const [sections, setSections] = useState<EvidenceSection[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isEn = lang === 'en';

    // 1. Use cached evidence from GovernanceConsole if available (no extra API call)
    const cached = consoleCache;
    if (cached?.result) {
      const s: EvidenceSection[] = [];
      if (cached.result.governance_evidence) {
        s.push(...transformGovernanceEvidence(cached.result.governance_evidence, isEn));
      }
      if (cached.result.external_signals) {
        s.push(...transformExternalSignals(cached.result.external_signals, isEn));
      }
      if (s.length > 0) {
        setSections(s);
        setLastUpdated(new Date().toISOString());
        setSelectedEvidence(s[0].items[0]);
        setLoading(false);
        return;
      }
    }

    // 2. No cache — show empty
    setSections([]);
    setLastUpdated("");
    setSelectedEvidence(null);
    setLoading(false);
  }, [decisionId, lang]);

  // Flatten + filter for search
  const allItems = sections.flatMap((s) => s.items);
  const query = searchQuery.toLowerCase();
  const filteredSections = query
    ? sections
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (e) => e.source.toLowerCase().includes(query) || e.type.toLowerCase().includes(query) || e.summary.toLowerCase().includes(query)
          ),
        }))
        .filter((s) => s.items.length > 0)
    : sections;

  const verifiedCount = allItems.filter((e) => e.status === "Verified").length;
  const categoryCount = sections.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F1F2F7" }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading evidence data...
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
          <button onClick={() => navigate('/workspace')} className="font-bold text-sm tracking-wider text-gray-900 hover:opacity-80 transition-opacity">
            DecisionGovernance AI
          </button>
        </div>
        <div className="ml-6 flex items-center gap-1 text-xs text-gray-400">
          <span>Platform</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Evidence Explorer</span>
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
            <div className="text-[10px] text-gray-400 font-medium">Decision ID</div>
            <div className="text-[10px] font-semibold text-gray-700 font-mono mt-0.5">
              {decisionId}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4 pb-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-gray-900">Evidence Explorer</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">
                      Inspect all evidence signals used in this decision
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-green-600">Live Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-gray-100 flex-shrink-0">
              {[
                { label: "Total Evidence", value: allItems.length },
                { label: "Verified", value: verifiedCount },
                { label: "Categories", value: categoryCount },
                { label: "Avg Confidence", value: allItems.length > 0 ? `${Math.round(allItems.reduce((s, e) => s + e.confidence, 0) / allItems.length)}%` : "—" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Search + Filter Bar */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search evidence sources..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Column Header */}
            <div className="grid grid-cols-[2.5fr_1fr_0.8fr_0.8fr] gap-3 px-6 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0 items-center">
              {["Source", "Confidence", "Relevance", "Status"].map((col) => (
                <div key={col} className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-left">{col}</div>
              ))}
            </div>

            {/* Grouped Evidence Sections */}
            <div className="flex-1 overflow-y-auto">
              {filteredSections.map((section) => (
                <div key={section.category}>
                  {/* Category Divider */}
                  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${TYPE_COLORS[section.type_color]}`}>
                        {section.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{section.items.length} item{section.items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Avg {Math.round(section.items.reduce((s, e) => s + e.confidence, 0) / section.items.length)}% confidence
                    </span>
                  </div>
                  {/* Rows */}
                  <div className="divide-y divide-gray-50">
                    {section.items.map((ev) => {
                      const isSelected = selectedEvidence?.id === ev.id;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvidence(ev)}
                          className={`w-full grid grid-cols-[2.5fr_1fr_0.8fr_0.8fr] gap-3 px-6 py-2.5 items-center transition-colors hover:bg-gray-50 ${
                            isSelected ? "bg-gray-50 border-l-2 border-l-gray-800" : ""
                          }`}
                        >
                          <span className="text-xs font-medium text-gray-800 truncate text-left">{ev.source}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-600 rounded-full" style={{ width: `${ev.confidence}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-600 w-8 text-right">{ev.confidence}%</span>
                          </div>
                          <span className={`text-[10px] font-semibold text-left ${
                            ev.relevance === "Critical" ? "text-red-600"
                              : ev.relevance === "High" ? "text-gray-900"
                              : ev.relevance === "Medium" ? "text-gray-600"
                              : "text-gray-400"
                          }`}>{ev.relevance}</span>
                          <div className="text-left">
                            {ev.status === "Verified" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[10px] font-semibold text-green-700">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-200 rounded text-[10px] font-semibold text-orange-700">
                                <Clock className="w-2.5 h-2.5" />
                                {ev.status}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-2.5 bg-gray-50 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] text-gray-500">
                Showing {filteredSections.reduce((s, sec) => s + sec.items.length, 0)} of {allItems.length} evidence signals
              </span>
              <span className="text-[10px] text-gray-400">
                Last updated: {lastUpdated || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 flex flex-col pt-4 pb-4 pr-4 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              {selectedEvidence ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${TYPE_COLORS[selectedEvidence.type_color]}`}
                    >
                      {selectedEvidence.type}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 leading-snug">{selectedEvidence.source}</h2>
                </>
              ) : (
                <h2 className="text-sm font-bold text-gray-900">Select evidence</h2>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedEvidence ? (
                <>
                  {/* Source */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Source</span>
                    <span className="text-xs font-semibold text-gray-700 text-right max-w-[150px]">
                      {selectedEvidence.source}
                    </span>
                  </div>

                  {/* Summary */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Summary
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {selectedEvidence.summary}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Confidence Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full"
                          style={{ width: `${selectedEvidence.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{selectedEvidence.confidence}%</span>
                    </div>
                  </div>

                  {/* Decision Relevance */}
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Decision Relevance
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {selectedEvidence.decision_relevance}
                    </p>
                  </div>

                </>
              ) : (
                <p className="text-xs text-gray-400">Select an evidence item to view details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
