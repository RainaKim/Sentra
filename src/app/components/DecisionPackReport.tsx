import {
  ArrowLeft,
  Mail,
  ArrowRight,
  FileText,
  DollarSign,
  Shield,
  Target,
  TrendingUp,
  Check,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type {
  DecisionResponse,
  GovernanceRule,
  GovernanceEvidenceItem,
  RiskResponseScenario,
} from "../../api/types";
import { useLang } from "../contexts/LangContext";

interface DecisionPackReportProps {
  onBack: () => void;
  decisionData?: DecisionResponse;
  decisionTextEn?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripExtractionFailed(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.startsWith("[EXTRACTION FAILED]")
    ? text.replace("[EXTRACTION FAILED] ", "").trim()
    : text;
}

function formatDateTime(iso: string | undefined, lang: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function truncate(text: string | undefined, max = 120): string {
  if (!text) return "";
  const first = text.split(/\.\s|\n/)[0].trim();
  return first.length <= max ? first : first.substring(0, max - 1) + "…";
}

// Name initials: Korean → surname (first char), English → first+last initials, fallback to role
function nameInitials(name: string | null | undefined, role: string): string {
  if (name && name.trim()) {
    const n = name.trim();
    // Korean: all chars are CJK — return first char (성)
    if (/[\u3131-\uD79D]/.test(n[0])) return n[0];
    // English/other: first letter of first word + first letter of last word
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // Fallback: role initials
  return role.split(" ").map((w) => w[0] ?? "").join("").substring(0, 3).toUpperCase() || "?";
}

function bandColor(band: string): { bar: string; badge: string; text: string } {
  switch (band?.toUpperCase()) {
    case "CRITICAL": return { bar: "from-red-200 to-red-300", badge: "bg-red-50 text-red-700 border-red-200", text: "text-red-700" };
    case "HIGH":     return { bar: "from-orange-200 to-orange-300", badge: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-700" };
    case "MEDIUM":   return { bar: "from-amber-100 to-amber-200", badge: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700" };
    default:         return { bar: "from-teal-100 to-teal-200", badge: "bg-teal-50 text-teal-700 border-teal-200", text: "text-teal-700" };
  }
}

function getEvidenceText(e: GovernanceEvidenceItem, lang: string): string {
  const isEn = lang === "en";
  return truncate(isEn
    ? (e.citationEn ?? e.citationKo ?? e.summaryEn ?? e.summaryKo)
    : (e.citationKo ?? e.citationEn ?? e.summaryKo ?? e.summaryEn));
}

function getEvidenceSource(e: GovernanceEvidenceItem, lang: string): string {
  const isEn = lang === "en";
  return isEn
    ? (e.documentNameEn ?? e.documentNameKo ?? e.titleEn ?? e.titleKo ?? "")
    : (e.documentNameKo ?? e.documentNameEn ?? e.titleKo ?? e.titleEn ?? "");
}

function getShortCitation(e: GovernanceEvidenceItem, lang: string): string {
  const raw = lang === "en" ? (e.citationEn ?? e.citationKo ?? "") : (e.citationKo ?? e.citationEn ?? "");
  return raw.length > 40 ? raw.substring(0, 40) + "…" : raw;
}

function translateFlagCode(code: string | undefined, lang: string): string {
  if (!code) return "";
  const ko: Record<string, string> = {
    HIGH_FINANCIAL_RISK: "고위험 재무 지출이 포함된 의사결정입니다",
    BOARD_APPROVAL_REQUIRED: "이사회 승인 필요",
    CRITICAL_CONFLICT: "의사결정 내 치명적 상충 항목이 존재합니다",
    HIGH_RISK: "고위험 의사결정으로 분류되었습니다",
    FINANCIAL_THRESHOLD_EXCEEDED: "재무 승인 기준을 초과하였습니다",
  };
  const en: Record<string, string> = {
    HIGH_FINANCIAL_RISK: "High-risk financial expenditure",
    BOARD_APPROVAL_REQUIRED: "Board approval required",
    CRITICAL_CONFLICT: "Critical conflict detected",
    HIGH_RISK: "Classified as high-risk",
    FINANCIAL_THRESHOLD_EXCEEDED: "Financial approval threshold exceeded",
  };
  return (lang === "ko" ? ko : en)[code] ?? code.replace(/_/g, " ");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
      {label}
    </div>
  );
}

// Evidence card (full design)
function EvidenceCard({
  item,
  lang,
  t,
}: {
  item: GovernanceEvidenceItem;
  lang: string;
  t: (k: string) => string;
}) {
  const summary = getEvidenceText(item, lang);
  const source = getEvidenceSource(item, lang);
  const citation = getShortCitation(item, lang);
  const category = lang === "en"
    ? (item.titleEn ?? item.titleKo ?? item.category ?? "")
    : (item.titleKo ?? item.titleEn ?? item.category ?? "");

  if (!summary && !source) return null;
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="mb-3">
        {summary && (
          <p className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{summary}</p>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {source && (
            <div>
              <div className="text-[10px] text-gray-400">{t("report.evidence.source")}</div>
              <div className="text-xs font-semibold text-gray-900">{source}</div>
            </div>
          )}
          {citation && source && (
            <div className="w-px h-6 bg-gray-200" />
          )}
          {citation && citation !== summary && (
            <div>
              <div className="text-[10px] text-gray-400">{t("report.evidence.citation")}</div>
              <div className="text-xs font-semibold text-gray-900 font-mono">{citation}</div>
            </div>
          )}
        </div>
        {category && (
          <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-1 rounded">
            {category}
          </span>
        )}
      </div>
    </div>
  );
}

// Compact evidence row — used inside small cards (approval chain, rule rows)
function EvidenceRowCompact({
  item,
  lang,
}: {
  item: GovernanceEvidenceItem;
  lang: string;
}) {
  const summary = getEvidenceText(item, lang);
  const source = getEvidenceSource(item, lang);
  const category = lang === "en"
    ? (item.titleEn ?? item.titleKo ?? item.category ?? "")
    : (item.titleKo ?? item.titleEn ?? item.category ?? "");

  if (!summary && !source) return null;
  return (
    <div className="flex items-start gap-2 py-1.5 border-t border-gray-100 first:border-t-0">
      {category && (
        <span className="flex-shrink-0 mt-0.5 text-[9px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
          {category.length > 12 ? category.substring(0, 12) + "…" : category}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {summary && (
          <p className="text-[11px] text-gray-700 leading-relaxed line-clamp-2">{summary}</p>
        )}
        {source && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{source}</p>
        )}
      </div>
    </div>
  );
}

// Collapsible evidence section
function EvidenceToggleCards({
  items,
  lang,
  t,
  compact = false,
}: {
  items: GovernanceEvidenceItem[];
  lang: string;
  t: (k: string) => string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? t("report.hideEvidence") : t("report.viewEvidence")}
        <span className="text-[9px] text-gray-300">({items.length})</span>
      </button>
      {open && (
        <div className={`mt-1.5 ${compact ? "divide-y-0" : "space-y-2 mt-2"}`}>
          {items.slice(0, 3).map((e, i) =>
            compact
              ? <EvidenceRowCompact key={i} item={e} lang={lang} />
              : <EvidenceCard key={i} item={e} lang={lang} t={t} />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 1: Decision Summary
// ---------------------------------------------------------------------------

function DecisionSummarySection({
  dp,
  t,
  lang,
  decisionTextEn,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
  decisionTextEn?: string;
}) {
  const isEn = lang === "en";
  const processedAt = dp.extraction_metadata?.processed_at as string | undefined;
  const govStatus = dp.governance?.status ?? "";
  const isReview = govStatus.includes("review") || govStatus === "needs_review";
  const isApproved = govStatus === "approved" || govStatus === "complete";

  const statusLabel = isReview
    ? t("report.status.review")
    : isApproved ? t("report.status.approved")
    : govStatus.toUpperCase().replace(/_/g, " ");

  const agentName = isEn
    ? (dp.agent_name_en ?? dp.agent_name ?? "AI Agent")
    : (dp.agent_name ?? "AI Agent");

  const agentDept = isEn
    ? (dp.company?.name_en ?? dp.company?.name ?? "")
    : (dp.company?.name ?? "");

  // Aggregate band for severity
  const aggBand = dp.risk_scoring?.aggregate?.band ?? "";
  const bandKey = `risk.band.${aggBand.toLowerCase()}`;
  const bandLabel = t(bandKey) !== bandKey ? t(bandKey) : aggBand;
  const bc = bandColor(aggBand);

  // First approver
  const chain = dp.governance?.approval_chain ?? [];
  const firstApprover = chain.length > 0 ? (() => {
    const item = chain[0];
    if (typeof item === "string") return { role: item, name: "" };
    const obj = item as Record<string, unknown>;
    return {
      role: isEn ? String(obj.role_en ?? obj.role ?? "—") : String(obj.role ?? "—"),
      name: obj.name ? String(obj.name) : "",
    };
  })() : null;

  const packTitle = stripExtractionFailed((dp.decision_pack as Record<string, unknown> | undefined)?.title as string);
  const statement = stripExtractionFailed(dp.decision?.statement);
  // English mode: decision_context.proposal_en → passed-in EN text → packTitle → statement
  // Korean mode: statement → packTitle
  const proposalText = isEn
    ? (dp.decision_context?.proposal_en ?? decisionTextEn ?? packTitle ?? statement ?? "Decision Analysis Report")
    : (statement ?? packTitle ?? "의사결정 분석 보고서");

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm overflow-hidden">
      {/* Header Strip */}
      <div className="bg-gray-50 px-8 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            {t("report.header.reportType")}
          </span>
          <span className="w-1 h-1 bg-gray-400 rounded-full" />
          <span className="text-xs text-gray-500 font-mono">{dp.decision_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{isEn ? "Generated" : "생성"}</span>
          <span className="text-xs font-semibold text-gray-700">{formatDateTime(processedAt, lang)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        {/* Decision Proposal */}
        <div className="mb-6">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            {t("report.header.proposal")}
          </div>
          <p className="text-xl font-bold text-gray-900 leading-snug break-words whitespace-pre-line">{proposalText}</p>
        </div>

        {/* 4-col info grid */}
        <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
          {/* Decision Source */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {t("report.header.source")}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{agentName}</div>
                {agentDept && <div className="text-xs text-gray-400">{agentDept}</div>}
              </div>
            </div>
          </div>

          {/* Governance Status */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {t("report.header.govStatus")}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${isReview ? "bg-amber-50 border-amber-200" : isApproved ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                {isReview
                  ? <AlertTriangle className="w-5 h-5 text-amber-600" />
                  : isApproved
                  ? <Check className="w-5 h-5 text-green-600" />
                  : <Clock className="w-5 h-5 text-gray-500" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{statusLabel}</div>
              </div>
            </div>
          </div>

          {/* Severity */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {isEn ? "Severity Level" : "위험 수준"}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${aggBand === "CRITICAL" || aggBand === "HIGH" ? "bg-red-50 border-red-200" : aggBand === "MEDIUM" ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                <span className={`text-xl font-bold ${bc.text}`}>!</span>
              </div>
              <div>
                <div className={`text-sm font-semibold ${bc.text}`}>{bandLabel || "—"}</div>
              </div>
            </div>
          </div>

          {/* Required Approval */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {t("report.header.requiredApproval")}
            </div>
            {firstApprover ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">
                    {nameInitials(firstApprover.name, firstApprover.role)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{firstApprover.role}</div>
                  {firstApprover.name && <div className="text-xs text-gray-400">{firstApprover.name}</div>}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm text-gray-500">{t("report.header.noApproval")}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next Actions Alert — shown above Reasoning Flow when data is present
// ---------------------------------------------------------------------------

function NextActionsAlert({
  dp,
  lang,
}: {
  dp: DecisionResponse;
  lang: string;
}) {
  const isEn = lang === "en";
  const pack = dp.decision_pack as Record<string, unknown> | undefined;
  const raw = pack?.recommended_next_actions;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const actions = (raw as unknown[])
    .filter((a) => typeof a === "string" && a.trim())
    .slice(0, 4) as string[];
  if (actions.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-4 mb-6 flex gap-4">
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
          {isEn ? "Recommended Next Actions" : "권장 조치"}
        </div>
        <ul className="space-y-1">
          {actions.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-1 h-1 bg-amber-500 rounded-full mt-1.5" />
              <span className="text-xs text-amber-900 leading-relaxed">{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 2: Decision Reasoning Flow
// ---------------------------------------------------------------------------

function ReasoningFlowSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";
  const triggered = (dp.governance?.all_rules ?? []).filter(
    (r) => r.status === "TRIGGERED" || r.status === "VIOLATION"
  );
  const firstRule = triggered[0];
  const chain = dp.governance?.approval_chain ?? [];
  const firstApprover = chain.length > 0 ? (() => {
    const item = chain[0];
    if (typeof item === "string") return item;
    const obj = item as Record<string, unknown>;
    return isEn ? String(obj.role_en ?? obj.role ?? "—") : String(obj.role ?? "—");
  })() : null;

  const statement = isEn
    ? (dp.decision_context?.proposal_en ?? stripExtractionFailed(dp.decision?.statement) ?? "")
    : (stripExtractionFailed(dp.decision?.statement) ?? "");
  const triggerReason = firstRule
    ? (isEn ? (firstRule.why_en ?? firstRule.why ?? firstRule.description_en ?? firstRule.description) : (firstRule.why ?? firstRule.description)) ?? ""
    : null;
  const ruleName = firstRule
    ? (isEn ? (firstRule.name_en ?? firstRule.name ?? firstRule.rule_id) : (firstRule.name ?? firstRule.rule_id))
    : null;

  const steps = [
    {
      icon: <FileText className="w-4 h-4 text-gray-700" />,
      label: t("report.header.proposal"),
      value: statement || "—",
      dark: false,
    },
    {
      icon: <DollarSign className="w-4 h-4 text-gray-700" />,
      label: isEn ? "Financial Analysis" : "재무 분석",
      value: triggerReason || (isEn ? "Budget threshold exceeded" : "예산 기준 초과"),
      dark: false,
    },
    {
      icon: <Shield className="w-4 h-4 text-gray-700" />,
      label: isEn ? "Governance Rule" : "거버넌스 규칙",
      value: ruleName || (isEn ? "Rule triggered" : "규칙 감지"),
      dark: false,
    },
    {
      icon: <Target className="w-4 h-4 text-gray-300" />,
      label: t("report.header.requiredApproval"),
      value: firstApprover || t("report.header.noApproval"),
      dark: true,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={isEn ? "Decision Reasoning Flow" : "의사결정 추론 흐름"} />
      <div className="flex items-stretch gap-2">
        {steps.map((step, i) => (
          <>
            <div key={i} className={`flex-1 rounded-lg p-4 border-2 ${step.dark ? "bg-gray-900 border-gray-900" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                {step.icon}
                <div className={`text-[10px] font-bold uppercase tracking-wide ${step.dark ? "text-gray-300" : "text-gray-600"}`}>
                  {step.label}
                </div>
              </div>
              <div className={`text-xs font-medium leading-relaxed ${step.dark ? "text-white" : "text-gray-900"}`}>
                {step.value}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div key={`arrow-${i}`} className="flex items-center flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 3: Risk Intelligence (bar chart)
// ---------------------------------------------------------------------------

function RiskIntelSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const scoring = dp.risk_scoring;
  if (!scoring) return null;
  const { aggregate, dimensions } = scoring;
  const isEn = lang === "en";

  const aggBandKey = `risk.band.${aggregate.band?.toLowerCase()}`;
  const aggBandLabel = t(aggBandKey) !== aggBandKey ? t(aggBandKey) : aggregate.band;
  const aggColors = bandColor(aggregate.band);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {t("report.section.riskIntel")}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isEn ? "Aggregate" : "종합"}{" "}
          <span className="font-bold text-gray-800">{aggregate.score}/100</span>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${aggColors.badge}`}>
            {aggBandLabel}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {dimensions.map((dim) => {
          const dimKey = `risk.dim.${dim.id}`;
          const dimLabel = t(dimKey) !== dimKey ? t(dimKey) : (isEn && dim.label_en ? dim.label_en : dim.label ?? dim.id);
          const colors = bandColor(dim.band);
          const bandKey = `risk.band.${dim.band?.toLowerCase()}`;
          const bandLabel = t(bandKey) !== bandKey ? t(bandKey) : dim.band;

          return (
            <div key={dim.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">{dimLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-700">{dim.score}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${colors.badge}`}>
                    {bandLabel}
                  </span>
                </div>
              </div>
              <div className="relative h-7 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.bar} rounded-lg transition-all`}
                  style={{ width: `${dim.score}%` }}
                />
                {/* Band markers */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="flex-1 border-r border-gray-300 border-dashed opacity-50" />
                  <div className="flex-1 border-r border-gray-300 border-dashed opacity-50" />
                  <div className="flex-1" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>{isEn ? "Low (0–33)" : "낮음 (0–33)"}</span>
                <span>{isEn ? "Medium (34–66)" : "보통 (34–66)"}</span>
                <span>{isEn ? "High (67–100)" : "높음 (67–100)"}</span>
              </div>
            </div>
          );
        })}

        {/* Procurement evidence — shown when backend returns no procurement dimension */}
        {(() => {
          const procItems = dp.governance_evidence?.procurementEvidence ?? [];
          const hasProcDim = dimensions.some((d) => d.id?.toLowerCase().includes("procurement"));
          if (hasProcDim || procItems.length === 0) return null;
          const bullets = procItems
            .map((e) => getBulletText(e, lang))
            .filter(Boolean);
          if (bullets.length === 0) return null;
          return (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  {isEn ? "Procurement" : "조달"}
                </span>
              </div>
              <ul className="space-y-2">
                {bullets.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2" />
                    <span className="text-xs text-gray-700 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 4: Triggered Governance Rules (table)
// ---------------------------------------------------------------------------

function TriggeredRulesSection({
  rules,
  dp,
  t,
  lang,
}: {
  rules: GovernanceRule[];
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={t("report.section.triggeredRules")} />

      {rules.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-700 py-2">
          <Check className="w-4 h-4 text-green-500" />
          {t("report.rule.noRules")}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-2 gap-6 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              {isEn ? "Rule" : "규칙"}
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              {t("report.rule.triggerReason")}
            </div>
          </div>

          {rules.map((rule, idx) => {
            const name = isEn ? (rule.name_en ?? rule.name ?? rule.rule_id) : (rule.name ?? rule.rule_id);
            const reason = isEn
              ? (rule.why_en ?? rule.description_en ?? rule.why ?? rule.description)
              : (rule.why ?? rule.description);
            const isViolation = rule.status === "VIOLATION";
            const ruleEvidence = (rule.evidence as GovernanceEvidenceItem[] | null) ?? [];

            return (
              <div
                key={rule.rule_id ?? idx}
                className={`px-6 py-4 ${idx < rules.length - 1 ? "border-b border-gray-200" : ""}`}
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{name}</div>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isViolation ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {isViolation ? t("report.gov.violation") : t("report.gov.triggered")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">{truncate(reason, 120) || "—"}</div>
                </div>
                {ruleEvidence.length > 0 && (
                  <EvidenceToggleCards items={ruleEvidence} lang={lang} t={t} compact />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 5: Approval Chain (visual flow)
// ---------------------------------------------------------------------------

function ApprovalChainSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";
  const chain = dp.governance?.approval_chain ?? [];
  const allRules = dp.governance?.all_rules ?? [];
  const approvalEvidence = dp.governance_evidence?.approvalEvidence ?? [];

  // Always prepend AI Agent as submitter
  const agentName = isEn ? (dp.agent_name_en ?? dp.agent_name ?? "AI Agent") : (dp.agent_name ?? "AI Agent");

  const approvers = chain.map((raw) => {
    const obj = raw && typeof raw === "object" ? raw as Record<string, unknown> : null;
    const role = obj ? (isEn ? String(obj.role_en ?? obj.role ?? "—") : String(obj.role ?? "—")) : String(raw);
    const personName = obj?.name ? String(obj.name) : null;
    const rawStatus = obj?.status ? String(obj.status) : "required";
    const sourceRuleId = obj?.source_rule_id ? String(obj.source_rule_id) : null;
    const matchedRule = sourceRuleId ? allRules.find((r) => r.rule_id === sourceRuleId) : undefined;
    const reason = isEn
      ? (obj?.reason_en ? String(obj.reason_en) : matchedRule?.description_en ?? matchedRule?.description ?? (obj?.reason ? String(obj.reason) : ""))
      : (obj?.reason ? String(obj.reason) : "");

    const matches = (a: string, b: string) => { const al = a.toLowerCase(), bl = b.toLowerCase(); return al === bl || al.includes(bl) || bl.includes(al); };
    const evidence = approvalEvidence.filter((e) => {
      const tKo = e.titleKo ?? "", tEn = e.titleEn ?? "";
      return matches(tKo, role) || matches(tEn, role) || (personName ? matches(tKo, personName) || matches(tEn, personName) : false);
    });

    return { role, personName, rawStatus, reason, evidence };
  });

  if (approvers.length === 0 && !dp.governance?.requires_human_review) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
        <SectionLabel label={t("report.section.approvalChain")} />
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Check className="w-4 h-4 text-green-500" />
          {t("report.approval.none")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={t("report.section.approvalChain")} />

      {/* Submitted-by row */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">AI</span>
        </div>
        <div className="text-sm text-gray-500">
          {isEn ? "Submitted by" : "제출자"}{" "}
          <span className="font-semibold text-gray-900">{agentName}</span>
        </div>
      </div>

      {/* Approver list */}
      <div className="space-y-3">
        {approvers.map((ap, idx) => {
          const avatarText = nameInitials(ap.personName, ap.role);
          const isRequired = ap.rawStatus === "required";
          const statusLabel = isRequired
            ? t("report.approval.status.required")
            : ap.rawStatus === "optional"
            ? t("report.approval.status.optional")
            : t("report.approval.status.pending");

          return (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
              {/* Step number */}
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                <span className="text-[10px] font-bold text-gray-600">{idx + 1}</span>
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${isRequired ? "bg-gray-800 border-gray-700" : "bg-gray-200 border-gray-300"}`}>
                <span className={`text-xs font-bold ${isRequired ? "text-white" : "text-gray-600"}`}>{avatarText}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{ap.role}</span>
                  {ap.personName && (
                    <span className="text-xs text-gray-400">{ap.personName}</span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ml-auto ${isRequired ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                    {statusLabel}
                  </span>
                </div>
                {ap.reason && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{truncate(ap.reason, 120)}</p>
                )}
                {ap.evidence.length > 0 && (
                  <EvidenceToggleCards items={ap.evidence} lang={lang} t={t} compact />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 6: Evidence Summary (redesigned — grouped digest)
// ---------------------------------------------------------------------------

// Summary-first text: summaryKo/En preferred, citation as fallback, title as last resort
function getBulletText(e: GovernanceEvidenceItem, lang: string): string {
  const isEn = lang === "en";
  const raw = isEn
    ? (e.summaryEn ?? e.summaryKo ?? e.citationEn ?? e.citationKo ?? e.titleEn ?? e.titleKo ?? "")
    : (e.summaryKo ?? e.summaryEn ?? e.citationKo ?? e.citationEn ?? e.titleKo ?? e.titleEn ?? "");
  return raw.trim();
}

// Deduplicated source chips for a group
function EvidenceSourceChips({
  items,
  lang,
  label,
}: {
  items: GovernanceEvidenceItem[];
  lang: string;
  label: string;
}) {
  const seen = new Set<string>();
  const sources: string[] = [];
  for (const item of items) {
    const src = getEvidenceSource(item, lang);
    if (src && !seen.has(src)) { seen.add(src); sources.push(src); }
  }
  if (sources.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-2">{label}</span>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {sources.map((src, i) => (
          <span key={i} className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 font-medium leading-5">
            {src}
          </span>
        ))}
      </div>
    </div>
  );
}

// One evidence group: icon + title + bullet list + source chips
function EvidenceGroup({
  icon,
  title,
  items,
  lang,
  sourcesLabel,
}: {
  icon: JSX.Element;
  title: string;
  items: GovernanceEvidenceItem[];
  lang: string;
  sourcesLabel: string;
}) {
  const bullets = items.map((e) => getBulletText(e, lang)).filter(Boolean);
  if (bullets.length === 0) return null;

  return (
    <div>
      {/* Group header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</span>
      </div>

      {/* Bullet list */}
      <ul className="space-y-1.5 pl-7">
        {bullets.map((text, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2" />
            <span className="text-xs text-gray-700 leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>

      {/* Source chips */}
      <div className="pl-7">
        <EvidenceSourceChips items={items} lang={lang} label={sourcesLabel} />
      </div>
    </div>
  );
}

function EvidenceSummarySection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";
  const ge = dp.governance_evidence;
  if (!ge) return null;

  const financialItems = ge.financialEvidence ?? [];
  const procurementItems = ge.procurementEvidence ?? [];
  const complianceItems = ge.complianceEvidence ?? [];
  const policyItems = ge.policyEvidence ?? [];
  const strategicItems = [
    ...(ge.strategicEvidence ?? []),
    ...(ge.strategyEvidence ?? []),
    ...(ge.operationalEvidence ?? []),
    ...(ge.reputationalEvidence ?? []),
  ];
  const approvalItems = ge.approvalEvidence ?? [];

  const hasAny = financialItems.length > 0 || procurementItems.length > 0 || complianceItems.length > 0 || policyItems.length > 0 || strategicItems.length > 0 || approvalItems.length > 0;
  if (!hasAny) return null;

  const sourcesLabel = t("report.evidence.sources");

  const groups = [
    {
      key: "financial",
      icon: <DollarSign className="w-3 h-3 text-gray-500" />,
      title: t("report.evidence.group.financial"),
      items: financialItems,
    },
    {
      key: "procurement",
      icon: <DollarSign className="w-3 h-3 text-gray-500" />,
      title: t("report.evidence.group.procurement"),
      items: procurementItems,
    },
    {
      key: "compliance",
      icon: <Shield className="w-3 h-3 text-gray-500" />,
      title: t("report.evidence.group.compliance"),
      items: complianceItems,
    },
    {
      key: "policy",
      icon: <FileText className="w-3 h-3 text-gray-500" />,
      title: t("report.evidence.group.policy"),
      items: policyItems,
    },
    {
      key: "strategic",
      icon: <Target className="w-3 h-3 text-gray-500" />,
      title: t("report.evidence.group.strategic"),
      items: strategicItems,
    },
    {
      key: "approval",
      icon: <Shield className="w-3 h-3 text-gray-500" />,
      title: t("report.evidence.group.approval"),
      items: approvalItems,
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={t("report.section.evidenceSummary")} />
      <div className="space-y-7">
        {groups.map((g, i) => (
          <div key={g.key} className={i > 0 ? "pt-6 border-t border-gray-100" : ""}>
            <EvidenceGroup
              icon={g.icon}
              title={g.title}
              items={g.items}
              lang={lang}
              sourcesLabel={sourcesLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 7: Risk Response Simulation
// ---------------------------------------------------------------------------

function bandColorSimulation(band: string | undefined): {
  scoreText: string;
  badge: string;
} {
  switch ((band ?? "").toUpperCase()) {
    case "CRITICAL": return { scoreText: "text-red-700", badge: "text-red-700 bg-red-50 border-red-200" };
    case "HIGH":     return { scoreText: "text-orange-700", badge: "text-orange-700 bg-orange-50 border-orange-200" };
    case "MEDIUM":   return { scoreText: "text-amber-700", badge: "text-amber-700 bg-amber-50 border-amber-200" };
    default:         return { scoreText: "text-teal-700", badge: "text-teal-700 bg-teal-50 border-teal-200" };
  }
}

function ScenarioCard({
  scenario,
  baseline,
  isRecommended,
  t,
  lang,
}: {
  scenario: RiskResponseScenario;
  baseline: import("../../api/types").RiskSimOutcome | undefined;
  isRecommended: boolean;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";
  const title = isEn ? (scenario.titleEn ?? scenario.titleKo ?? "") : (scenario.titleKo ?? "");
  const changeSummary = isEn ? (scenario.changeSummaryEn ?? scenario.changeSummaryKo ?? "") : (scenario.changeSummaryKo ?? "");
  const resolvedIssues = isEn ? (scenario.resolvedIssuesEn?.length ? scenario.resolvedIssuesEn : scenario.resolvedIssues ?? []) : (scenario.resolvedIssues ?? []);
  const remainingIssues = isEn ? (scenario.remainingIssuesEn?.length ? scenario.remainingIssuesEn : scenario.remainingIssues ?? []) : (scenario.remainingIssues ?? []);
  const scoreBefore = baseline?.aggregateRiskScore ?? null;
  const scoreAfter = scenario.expectedOutcome?.aggregateRiskScore ?? null;
  const bandBefore = (baseline?.band ?? "").toUpperCase();
  const bandAfter = (scenario.expectedOutcome?.band ?? "").toUpperCase();
  const afterColors = bandColorSimulation(bandAfter);
  const beforeBadge = "text-gray-500 bg-gray-100 border-gray-300";
  const confidence = scenario.confidence != null ? Math.round(scenario.confidence * 100) : null;

  // Build delta chips from the delta object (skip null values)
  const d = scenario.delta;
  const deltaChips: Array<{ label: string; delta: number }> = [];
  if (d) {
    if (d.financialRiskDelta != null) deltaChips.push({ label: isEn ? "Financial" : "재무 리스크", delta: d.financialRiskDelta });
    if (d.complianceRiskDelta != null) deltaChips.push({ label: isEn ? "Compliance" : "준법 리스크", delta: d.complianceRiskDelta });
    if (d.strategicRiskDelta != null) deltaChips.push({ label: isEn ? "Strategic" : "전략 리스크", delta: d.strategicRiskDelta });
  }

  const cardClass = isRecommended
    ? "border-2 border-teal-200 bg-teal-50/20 rounded-lg p-6 relative"
    : "border border-gray-200 bg-white rounded-lg p-6";

  return (
    <div className={cardClass}>
      {isRecommended && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
            {t("report.simulation.recommended")}
          </span>
        </div>
      )}

      {/* Title + Change summary / Risk comparison grid */}
      <div className={`grid grid-cols-[1fr_auto_1fr] gap-6 items-start mb-5 ${isRecommended ? "mt-2" : ""}`}>
        {/* Left: title + summary */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
          {changeSummary && <p className="text-xs text-gray-600 leading-relaxed">{changeSummary}</p>}
        </div>

        {/* Center arrow */}
        <div className="flex items-center justify-center px-4 pt-1">
          <ArrowRight className={`w-5 h-5 ${isRecommended ? "text-teal-500" : "text-gray-400"}`} />
        </div>

        {/* Right: risk comparison */}
        <div className="space-y-2.5">
          {scoreBefore != null && scoreAfter != null && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {isEn ? "Risk Score" : "리스크 점수"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-gray-300 line-through">{scoreBefore}</span>
                <ArrowRight className="w-3 h-3 text-gray-300" />
                <span className={`text-xl font-bold ${afterColors.scoreText}`}>{scoreAfter}</span>
              </div>
            </div>
          )}
          {bandBefore && bandAfter && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {isEn ? "Risk Band" : "위험 등급"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${beforeBadge}`}>{bandBefore}</span>
                <ArrowRight className="w-3 h-3 text-gray-300" />
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${afterColors.badge}`}>{bandAfter}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Issue resolution */}
      {(resolvedIssues.length > 0 || remainingIssues.length > 0) && (
        <div className="grid grid-cols-2 gap-5 pt-4 border-t border-gray-200 mb-4">
          {resolvedIssues.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                {t("report.simulation.resolved")}
              </div>
              <ul className="space-y-2">
                {resolvedIssues.map((issue, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`flex-shrink-0 w-1 h-1 rounded-full ${isRecommended ? "bg-teal-500" : "bg-gray-400"}`} />
                    <span className="text-xs text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {remainingIssues.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                {t("report.simulation.remaining")}
              </div>
              <ul className="space-y-2">
                {remainingIssues.map((issue, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-xs text-gray-500">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Risk deltas + confidence */}
      {(deltaChips.length > 0 || confidence != null) && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 flex-wrap">
            {deltaChips.map((chip, i) => {
              const arrow = chip.delta < 0 ? "↓" : chip.delta > 0 ? "↑" : "→";
              const absDelta = Math.abs(chip.delta);
              const color = chip.delta < 0
                ? (isRecommended ? "text-teal-600" : "text-gray-700")
                : chip.delta > 0 ? "text-red-600" : "text-gray-500";
              return (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">{chip.label}</span>
                  <span className={`font-bold ${color}`}>{arrow}{absDelta > 0 ? ` ${absDelta}` : ""}</span>
                </div>
              );
            })}
          </div>
          {confidence != null && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400">{t("report.simulation.confidence")}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isRecommended ? "bg-teal-600" : "bg-gray-500"}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-800">{confidence}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RiskResponseSimulationSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const sim = dp.risk_response_simulation;
  const scenarios = sim?.scenarios ?? [];
  if (scenarios.length === 0) return null;

  const baseline = sim?.baseline;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={t("report.section.riskSimulation")} />
      <p className="text-xs text-gray-500 -mt-3 mb-6">{t("report.simulation.subtitle")}</p>
      <div className="space-y-4">
        {scenarios.map((scenario, idx) => {
          const isRecommended = scenario.isRecommended ?? false;
          return (
            <ScenarioCard
              key={idx}
              scenario={scenario}
              baseline={baseline}
              isRecommended={isRecommended}
              t={t}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Key Insights summary box
// ---------------------------------------------------------------------------

function KeyInsightsSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";
  const triggered = (dp.governance?.all_rules ?? []).filter(
    (r) => r.status === "TRIGGERED" || r.status === "VIOLATION"
  );
  const aggBand = dp.risk_scoring?.aggregate?.band ?? "";
  const bandKey = `risk.band.${aggBand.toLowerCase()}`;
  const bandLabel = t(bandKey) !== bandKey ? t(bandKey) : aggBand;
  const chain = dp.governance?.approval_chain ?? [];

  const insights: string[] = [];

  // First triggered rule → required action
  if (triggered.length > 0) {
    const rule = triggered[0];
    const action = isEn ? (rule.consequence?.message_en ?? rule.consequence?.message) : rule.consequence?.message;
    const ruleName = isEn ? (rule.name_en ?? rule.name) : rule.name;
    if (action && ruleName) insights.push(`${ruleName}: ${action}`);
    else if (action) insights.push(action);
  }

  // Approval chain
  if (chain.length > 0) {
    const approvers = chain.slice(0, 2).map((item) => {
      if (typeof item === "string") return item;
      const obj = item as Record<string, unknown>;
      return isEn ? String(obj.role_en ?? obj.role ?? "") : String(obj.role ?? "");
    }).filter(Boolean).join(", ");
    if (approvers) {
      insights.push(isEn ? `Required approvers: ${approvers}` : `필수 승인자: ${approvers}`);
    }
  }

  // Risk level
  if (bandLabel) {
    insights.push(isEn
      ? `Overall risk level assessed as ${bandLabel} (${dp.risk_scoring?.aggregate?.score ?? "—"}/100)`
      : `전체 리스크 수준 ${bandLabel} (${dp.risk_scoring?.aggregate?.score ?? "—"}/100)으로 평가됨`
    );
  }

  // Governance flags
  const flags = dp.governance?.flags ?? [];
  if (flags.length > 0) {
    insights.push(translateFlagCode(flags[0].code, lang));
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-300 p-8 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            {isEn ? "Key Insights" : "핵심 인사이트"}
          </h3>
          <ul className="space-y-1.5">
            {insights.map((ins, i) => (
              <li key={i} className="text-sm text-gray-700">• {ins}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 8: External Context Signals
// ---------------------------------------------------------------------------

const MAX_CONTEXT_ITEMS = 2;

function ExternalContextSignalRow({
  item,
  isFirst,
  lang,
}: {
  item: import("../../api/types").ExternalSignalItem;
  isFirst: boolean;
  lang: string;
}) {
  const isEn = lang === "en";
  const title = isEn ? (item.titleEn ?? item.titleKo) : item.titleKo;
  const summary = isEn ? (item.summaryEn ?? item.summaryKo) : item.summaryKo;
  const relevance = isEn
    ? (item.decisionRelevanceEn ?? item.decisionRelevanceKo ?? null)
    : (item.decisionRelevanceKo ?? null);
  const sourceLabel = item.source?.sourceLabel ?? null;
  const conf = item.confidence != null ? `${Math.round(item.confidence * 100)}%` : null;

  return (
    <div className={isFirst ? "" : "mt-4 pt-4 border-t border-gray-100"}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-xs font-semibold text-gray-800 leading-snug">{title}</p>
        {conf && <span className="flex-shrink-0 text-[10px] text-gray-400 font-medium">{conf}</span>}
      </div>
      {summary && <p className="text-[11px] text-gray-500 leading-relaxed">{summary}</p>}
      {relevance && (
        <p className="mt-1 text-[11px] text-blue-600 leading-relaxed">
          <span className="mr-1 opacity-50">→</span>{relevance}
        </p>
      )}
      {sourceLabel && (
        <div className="mt-2">
          <span className="text-[10px] text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5 font-medium">
            {sourceLabel}
          </span>
        </div>
      )}
    </div>
  );
}

function ExternalContextGroup({
  title,
  items,
  lang,
  t,
}: {
  title: string;
  items: import("../../api/types").ExternalSignalItem[];
  lang: string;
  t: (k: string) => string;
}) {
  const [showAll, setShowAll] = useState(false);
  if (items.length === 0) return null;

  const visible = showAll ? items : items.slice(0, MAX_CONTEXT_ITEMS);
  const hiddenCount = items.length - MAX_CONTEXT_ITEMS;

  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      <div>
        {visible.map((item, idx) => (
          <ExternalContextSignalRow key={item.id} item={item} isFirst={idx === 0} lang={lang} />
        ))}
      </div>
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
        >
          {t("report.externalContext.more").replace("{n}", String(hiddenCount))}
        </button>
      )}
    </div>
  );
}

function ExternalContextSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const es = dp.external_signals;
  if (!es) return null;

  const groups = [
    { key: "market",      title: t("report.externalContext.group.market"),      items: es.marketSignals      ?? [] },
    { key: "regulatory",  title: t("report.externalContext.group.regulatory"),  items: es.regulatorySignals  ?? [] },
    { key: "operational", title: t("report.externalContext.group.operational"), items: es.operationalSignals ?? [] },
  ].filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={t("report.section.externalContext")} />
      <div className="space-y-7">
        {groups.map((g, i) => (
          <div key={g.key} className={i > 0 ? "pt-6 border-t border-gray-200" : ""}>
            <ExternalContextGroup title={g.title} items={g.items} lang={lang} t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit Metadata
// ---------------------------------------------------------------------------

function AuditMetaSection({
  dp,
  t,
  lang,
}: {
  dp: DecisionResponse;
  t: (k: string) => string;
  lang: string;
}) {
  const isEn = lang === "en";
  const processedAt = dp.extraction_metadata?.processed_at as string | undefined;
  const dpRaw = dp.decision_pack as Record<string, unknown> | undefined;
  const confidence = ((dpRaw?.summary as Record<string, unknown> | undefined)?.confidence_score as number | undefined) ?? null;

  const rows = [
    { label: t("report.meta.decisionId"), value: dp.decision_id, mono: true },
    { label: t("report.meta.generatedAt"), value: formatDateTime(processedAt, lang), mono: true },
    { label: t("report.meta.company"), value: isEn ? (dp.company?.name_en ?? dp.company?.name ?? "—") : (dp.company?.name ?? "—"), mono: false },
    { label: t("report.meta.industry"), value: dp.company?.industry ?? "—", mono: false },
    { label: t("report.meta.confidence2"), value: confidence != null ? `${(confidence * 100).toFixed(0)}%` : "—", mono: false },
    { label: t("report.meta.humanReview"), value: dp.governance?.requires_human_review ? t("report.audit.step3.yes") : t("report.audit.step3.no"), mono: false },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
      <SectionLabel label={t("report.section.auditMeta")} />
      <dl className="grid grid-cols-3 gap-x-8 gap-y-4">
        {rows.map(({ label, value, mono }) => (
          <div key={label}>
            <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
            <dd className={`text-xs font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DecisionPackReport({ onBack, decisionData: dp, decisionTextEn }: DecisionPackReportProps) {
  const { t, lang } = useLang();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!dp) {
    return <DemoDecisionPack onBack={onBack} showTooltip={showTooltip} setShowTooltip={setShowTooltip} />;
  }

  const allRules: GovernanceRule[] = dp.governance?.all_rules ?? [];
  const triggeredRules = allRules.filter(
    (r) => r.status === "TRIGGERED" || r.status === "VIOLATION"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("report.back")}
          </button>
          <button
            onClick={() => {}}
            className="px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <Mail className="w-4 h-4" />
            {t("report.email")}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <DecisionSummarySection dp={dp} t={t} lang={lang} decisionTextEn={decisionTextEn} />
        <NextActionsAlert dp={dp} lang={lang} />
        <ReasoningFlowSection dp={dp} t={t} lang={lang} />
        <RiskIntelSection dp={dp} t={t} lang={lang} />
        <TriggeredRulesSection rules={triggeredRules} dp={dp} t={t} lang={lang} />
        <ApprovalChainSection dp={dp} t={t} lang={lang} />
        <RiskResponseSimulationSection dp={dp} t={t} lang={lang} />
        <EvidenceSummarySection dp={dp} t={t} lang={lang} />
        <ExternalContextSection dp={dp} t={t} lang={lang} />
        <KeyInsightsSection dp={dp} t={t} lang={lang} />
        <AuditMetaSection dp={dp} t={t} lang={lang} />

        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">{t("report.footer.1")}</p>
          <p className="text-xs text-gray-500 mb-4">{t("report.footer.2")}</p>
          <p className="text-xs text-gray-400 font-mono tracking-wider">CONFIDENTIAL · SENTRA</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo fallback
// ---------------------------------------------------------------------------

function DemoDecisionPack({
  onBack,
  showTooltip,
  setShowTooltip,
}: {
  onBack: () => void;
  showTooltip: boolean;
  setShowTooltip: (v: boolean) => void;
}) {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("report.back")}
          </button>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative px-4 py-2 bg-gray-900 text-white rounded text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            {t("report.email")}
            {showTooltip && (
              <span className="absolute top-full mt-2 right-0 w-56 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border border-gray-700 z-50">
                {t("report.footer.1")}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-8 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                {t("report.header.reportType")}
              </span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span className="text-xs text-gray-500 font-mono">ref: DP-2024-NA-001</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">2024-10-24 14:32</span>
          </div>
          <div className="p-8">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("report.header.proposal")}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              2024년 3분기 APAC 시장 인프라 투자 승인 건
            </h1>
            <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{t("report.header.source")}</div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">AI Agent</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{t("report.header.govStatus")}</div>
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded border bg-amber-50 text-amber-800 border-amber-200">
                  {t("report.status.review")}
                </span>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Severity</div>
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded border bg-amber-50 text-amber-700 border-amber-200">MEDIUM</span>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{t("report.header.requiredApproval")}</div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">CFO</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">CFO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 border-t border-gray-200 mt-4">
          <p className="text-xs text-gray-500 mb-1">{t("report.footer.1")}</p>
          <p className="text-xs text-gray-500 mb-4">{t("report.footer.2")}</p>
          <p className="text-xs text-gray-400 font-mono tracking-wider">CONFIDENTIAL · SENTRA</p>
        </div>
      </div>
    </div>
  );
}
