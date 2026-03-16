import { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Clock,
  FileSearch,
  FlaskConical,
  FileText,
} from "lucide-react";

const tabs = [
  {
    icon: Layout,
    title: "Overview",
    subtitle: "Decision graph, verdict, and risk at a glance",
    content: OverviewPreview,
  },
  {
    icon: Clock,
    title: "Reasoning Timeline",
    subtitle: "Trace from AI proposal to governance verdict",
    content: TimelinePreview,
  },
  {
    icon: FileSearch,
    title: "Evidence Explorer",
    subtitle: "Internal policies, strategic context, external signals",
    content: EvidencePreview,
  },
  {
    icon: FlaskConical,
    title: "Simulation Lab",
    subtitle: "Compare alternative scenarios and risk impact",
    content: SimulationPreview,
  },
  {
    icon: FileText,
    title: "Decision Pack",
    subtitle: "Approval-ready governance artifact",
    content: DecisionPackPreview,
  },
];

function OverviewPreview() {
  return (
    <div className="flex h-full gap-4">
      {/* Graph area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5 flex flex-col overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Decision Knowledge Graph</div>
        <div
          className="flex-1 relative min-h-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Full SVG graph — wider viewBox, more nodes */}
          <svg viewBox="0 0 520 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* === Edges === */}
            {/* Decision → 3-way split */}
            <line x1="260" y1="40" x2="260" y2="60" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="100" y1="60" x2="420" y2="60" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="100" y1="60" x2="100" y2="78" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="260" y1="60" x2="260" y2="78" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="420" y1="60" x2="420" y2="78" stroke="#e2e4e9" strokeWidth="1.2" />
            {/* Row 2 → Row 3 */}
            <line x1="100" y1="106" x2="100" y2="126" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="260" y1="106" x2="260" y2="126" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="420" y1="106" x2="420" y2="126" stroke="#e2e4e9" strokeWidth="1.2" />
            {/* Row 3 → Row 4 (leaves) */}
            <line x1="100" y1="154" x2="100" y2="168" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="60" y1="168" x2="140" y2="168" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="60" y1="168" x2="60" y2="182" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="140" y1="168" x2="140" y2="182" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="260" y1="154" x2="260" y2="182" stroke="#e2e4e9" strokeWidth="1.2" />
            <line x1="420" y1="154" x2="420" y2="182" stroke="#e2e4e9" strokeWidth="1.2" />

            {/* Conflict dashed line between Strategic Goal and Risk */}
            <line x1="350" y1="200" x2="260" y2="200" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

            {/* === Row 1: Decision (root) === */}
            <rect x="200" y="16" width="120" height="28" rx="10" fill="#111827" />
            <text x="260" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="SUIT Variable, Inter, sans-serif">Decision</text>

            {/* === Row 2: 3 policy nodes === */}
            <rect x="30" y="78" width="140" height="28" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <text x="100" y="96" textAnchor="middle" fill="#4b5563" fontSize="9" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Budget Policy</text>

            <rect x="190" y="78" width="140" height="28" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <text x="260" y="96" textAnchor="middle" fill="#4b5563" fontSize="9" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Strategic Goal G1</text>

            <rect x="350" y="78" width="140" height="28" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <text x="420" y="96" textAnchor="middle" fill="#4b5563" fontSize="9" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Compliance Rule</text>

            {/* === Row 3: evaluation nodes === */}
            <rect x="25" y="126" width="150" height="28" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <text x="100" y="144" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Threshold Check</text>

            <rect x="185" y="126" width="150" height="28" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="205" cy="140" r="3" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="270" y="144" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Alignment Score</text>

            <rect x="348" y="126" width="144" height="28" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="368" cy="140" r="3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            <text x="428" y="144" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Audit Verified</text>

            {/* === Row 4: leaf nodes === */}
            <rect x="5" y="182" width="110" height="26" rx="9" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="24" cy="195" r="3" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="66" y="199" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">CFO Approval</text>

            <rect x="125" y="182" width="30" height="26" rx="9" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <text x="140" y="199" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">R3</text>

            <rect x="195" y="182" width="130" height="26" rx="9" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="214" cy="195" r="3" fill="none" stroke="#ef4444" strokeWidth="1.5" />
            <text x="268" y="199" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Risk: Budget Overrun</text>

            <rect x="355" y="182" width="130" height="26" rx="9" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="374" cy="195" r="3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            <text x="428" y="199" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="500" fontFamily="SUIT Variable, Inter, sans-serif">Legal Sign-off</text>

          </svg>
          <div className="absolute bottom-3 left-4 text-[9px] text-gray-300">9 nodes · 8 edges · 1 conflict</div>
        </div>
      </div>
      {/* Verdict panel */}
      <div className="w-44 bg-white rounded-xl border border-gray-100 p-4 flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Verdict</div>
        <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold text-gray-800">Review Required</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Risk Score</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-300 to-red-400 rounded-full" style={{ width: "82%" }} />
            </div>
            <span className="text-[10px] font-bold text-gray-700">0.82</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-2">Approval Chain</div>
          <div className="space-y-2">
            {["CFO Review", "Legal Sign-off", "Board Approval"].map((n) => (
              <div key={n} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border border-gray-200 bg-gray-50 flex-shrink-0" />
                <span className="text-[10px] text-gray-500">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelinePreview() {
  const steps = [
    { time: "00:00", label: "AI Proposal Received", detail: "Agent submitted Q3 Infrastructure Budget Allocation for governance review", status: "complete" as const },
    { time: "00:01", label: "Structured Extraction", detail: "Parsed decision context: $2.4M budget, 3 departments, Q3 timeline", status: "complete" as const },
    { time: "00:03", label: "Policy Evaluation", detail: "3 rules triggered — Budget threshold R-001, Approval hierarchy R-003, Strategic alignment R-007", status: "complete" as const },
    { time: "00:04", label: "Risk Scoring", detail: "Composite risk score computed across financial, operational, and compliance dimensions", status: "complete" as const },
    { time: "00:05", label: "Governance Verdict", detail: "Escalated to CFO review — budget exceeds autonomous approval threshold", status: "active" as const },
  ];
  return (
    <div className="flex h-full gap-4">
      {/* Timeline */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reasoning Timeline</div>
          <div className="text-[9px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Total: 5.2s</div>
        </div>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${step.status === "active" ? "bg-amber-400 ring-4 ring-amber-50" : "bg-gray-900"}`} />
                {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-200 min-h-[24px]" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] text-gray-400 font-mono">{step.time}s</span>
                  <span className={`text-xs font-semibold ${step.status === "active" ? "text-amber-700" : "text-gray-800"}`}>{step.label}</span>
                </div>
                <div className="text-[10px] text-gray-400 leading-relaxed">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Summary sidebar */}
      <div className="w-44 bg-white rounded-xl border border-gray-100 p-4 flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Pipeline Stats</div>
        {[
          { label: "Latency", value: "5.2s" },
          { label: "Rules Checked", value: "12" },
          { label: "Rules Triggered", value: "3" },
          { label: "Evidence Sources", value: "5" },
        ].map((s) => (
          <div key={s.label} className="py-3 border-b border-gray-50 last:border-0">
            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-sm font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
        <div className="mt-auto pt-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
            <div className="text-[9px] text-emerald-600 font-semibold">Pipeline Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidencePreview() {
  return (
    <div className="flex h-full gap-4">
      {/* Main evidence list */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Evidence Explorer</div>
          <div className="text-[9px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">5 sources matched</div>
        </div>
        <div className="space-y-4">
          {/* Internal Policy */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
              <span className="text-xs font-semibold text-gray-800">Internal Policy</span>
              <span className="text-[9px] bg-gray-900 text-white px-1.5 py-0.5 rounded font-medium">3</span>
            </div>
            <div className="space-y-1.5 pl-4">
              {[
                { id: "R-001", name: "Budget threshold rule", status: "Violated", statusColor: "text-red-600 bg-red-50" },
                { id: "R-003", name: "Approval hierarchy policy", status: "Triggered", statusColor: "text-amber-600 bg-amber-50" },
                { id: "R-007", name: "Strategic alignment rule", status: "Triggered", statusColor: "text-amber-600 bg-amber-50" },
              ].map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-gray-400">{r.id}</span>
                    <span className="text-[11px] text-gray-700 font-medium">{r.name}</span>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${r.statusColor}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
          {/* External Signals */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="text-xs font-semibold text-gray-800">External Signals</span>
              <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium">2</span>
            </div>
            <div className="space-y-1.5 pl-4">
              {[
                { name: "Market volatility index", value: "Elevated", valueColor: "text-amber-600" },
                { name: "Competitor budget benchmark", value: "Within range", valueColor: "text-emerald-600" },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-[11px] text-gray-700 font-medium">{s.name}</span>
                  <span className={`text-[10px] font-semibold ${s.valueColor}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Evidence detail sidebar */}
      <div className="w-44 bg-white rounded-xl border border-gray-100 p-4 flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Coverage</div>
        {[
          { label: "Financial", pct: 92 },
          { label: "Operational", pct: 78 },
          { label: "Compliance", pct: 100 },
          { label: "Strategic", pct: 65 },
        ].map((c) => (
          <div key={c.label} className="mb-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-600 font-medium">{c.label}</span>
              <span className="text-[9px] font-bold text-gray-500">{c.pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full" style={{ width: `${c.pct}%` }} />
            </div>
          </div>
        ))}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Confidence</div>
          <div className="text-lg font-bold text-gray-900">87%</div>
          <div className="text-[9px] text-gray-400">Evidence strength</div>
        </div>
      </div>
    </div>
  );
}

function SimulationPreview() {
  const scenarios = [
    { name: "Original Proposal", risk: 0.82, verdict: "Review Required", verdictColor: "text-amber-700 bg-amber-50 border-amber-100", bar: "from-amber-300 to-red-400" },
    { name: "Reduced Budget (80%)", risk: 0.45, verdict: "Conditionally Approved", verdictColor: "text-emerald-700 bg-emerald-50 border-emerald-100", bar: "from-emerald-300 to-emerald-400" },
    { name: "Phased Rollout", risk: 0.31, verdict: "Approved", verdictColor: "text-emerald-700 bg-emerald-50 border-emerald-100", bar: "from-emerald-200 to-emerald-400" },
  ];
  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Simulation Lab</div>
          <div className="text-[9px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">3 scenarios</div>
        </div>
        <div className="space-y-2">
          {scenarios.map((s, i) => (
            <div key={s.name} className={`rounded-xl border p-3 ${i === 0 ? "border-gray-200 bg-gray-50/50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 w-5 h-5 rounded flex items-center justify-center">{i + 1}</span>
                  <span className="text-[11px] font-semibold text-gray-800">{s.name}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${s.verdictColor}`}>{s.verdict}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.bar} rounded-full`} style={{ width: `${s.risk * 100}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 tabular-nums w-8 text-right">{s.risk.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Comparison sidebar */}
      <div className="w-44 bg-white rounded-xl border border-gray-100 p-4 flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Best Option</div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4">
          <div className="text-[10px] font-bold text-emerald-800 mb-0.5">Phased Rollout</div>
          <div className="text-[9px] text-emerald-600">Lowest risk at 0.31</div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Risk Reduction</div>
            <div className="text-sm font-bold text-gray-900">62%</div>
          </div>
          <div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Budget Impact</div>
            <div className="text-sm font-bold text-gray-900">$0</div>
          </div>
          <div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Timeline</div>
            <div className="text-sm font-bold text-gray-900">+1 quarter</div>
          </div>
        </div>
        <div className="mt-auto pt-3">
          <div className="bg-gray-900 text-white text-[10px] font-semibold rounded-lg py-2 text-center">Apply Scenario</div>
        </div>
      </div>
    </div>
  );
}

function DecisionPackPreview() {
  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Decision Pack</div>
          <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">DEC-2024-09-1847</span>
        </div>
        {/* Summary */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 mb-3">
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Executive Summary</div>
          <div className="text-[10px] text-gray-700 leading-relaxed">
            Q3 Infrastructure Budget Allocation ($2.4M) requires CFO review. Risk score 0.82 (HIGH). Three rules triggered. Recommended: phased rollout.
          </div>
        </div>
        {/* Meta grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Status", value: "Review Required", color: "text-amber-700" },
            { label: "Risk", value: "HIGH", color: "text-red-600" },
            { label: "Confidence", value: "87%", color: "text-gray-900" },
            { label: "Approvers", value: "3 pending", color: "text-gray-900" },
          ].map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-lg border border-gray-100 p-2.5">
              <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-0.5">{m.label}</div>
              <div className={`text-[10px] font-bold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>
        {/* Sections table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 text-[8px] font-semibold text-gray-400 uppercase tracking-wider">
            <div className="px-3 py-1.5 col-span-2">Section</div>
            <div className="px-3 py-1.5 text-right">Pages</div>
          </div>
          {[
            ["Decision Context", "1–2"],
            ["Policy Analysis", "3–5"],
            ["Risk Assessment", "6–7"],
            ["Simulation Results", "8–9"],
            ["Approval Requirements", "10"],
          ].map((row) => (
            <div key={row[0]} className="grid grid-cols-3 border-t border-gray-50 text-[10px]">
              <div className="px-3 py-1.5 text-gray-700 font-medium col-span-2">{row[0]}</div>
              <div className="px-3 py-1.5 text-right text-gray-400 font-mono">{row[1]}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Export sidebar */}
      <div className="w-44 bg-white rounded-xl border border-gray-100 p-4 flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Export</div>
        <div className="space-y-1.5 mb-4">
          {["PDF Report", "DOCX", "JSON API"].map((f) => (
            <div key={f} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[10px] text-gray-700 font-medium text-center">{f}</div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-2">Share With</div>
          <div className="space-y-1.5">
            {["CFO Office", "Legal Team", "Board Secretary"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] font-bold text-gray-500">{t.split(" ").map(w => w[0]).join("")}</span>
                </div>
                <span className="text-[10px] text-gray-600">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <div className="bg-gray-900 text-white text-[10px] font-semibold rounded-lg py-2 text-center">Generate Pack</div>
        </div>
      </div>
    </div>
  );
}

export function ConsoleDeepDive() {
  const [activeTab, setActiveTab] = useState(0);
  const [paused, setPaused] = useState(false);
  const ActiveContent = tabs[activeTab].content;

  const advance = useCallback(() => {
    setActiveTab((prev) => (prev + 1) % tabs.length);
  }, []);

  // Auto-rotate every 4 seconds, pause on hover
  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, 2500);
    return () => clearInterval(id);
  }, [paused, advance]);

  return (
    <section style={{ backgroundColor: "#F1F2F7" }} className="py-24 px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12 space-y-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            Governance Console
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-3xl">
            Five integrated analysis tools, one governance surface
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-2xl">
            Each decision flows through structured analysis views — from
            knowledge graph to evidence to simulation to final approval artifact.
          </p>
        </div>

        {/* Interactive console */}
        <div
          className="flex gap-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Tab list — vertical */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = i === activeTab;
              return (
                <button
                  key={tab.title}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-white border border-gray-200 shadow-sm"
                      : "hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-gray-900" : "bg-gray-200"
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                        {tab.title}
                      </div>
                      {isActive && (
                        <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                          {tab.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Progress bar for active tab — hidden, just drives timing */}
                </button>
              );
            })}
          </div>

          {/* Preview area — fixed height for consistency */}
          <div className="flex-1 h-[400px]">
            <div
              key={activeTab}
              className="h-full"
              style={{ animation: "fadeSlideIn 0.3s ease-out" }}
            >
              <ActiveContent />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
