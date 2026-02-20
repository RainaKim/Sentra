import {
  ArrowLeft,
  Download,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useState } from "react";
import type { DecisionResponse, GovernanceRule } from "../../api/types";

interface DecisionPackReportProps {
  onBack: () => void;
  /** Real backend payload — undefined while in demo mode */
  decisionData?: DecisionResponse;
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

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function riskColor(score: number): string {
  if (score >= 7) return "#EF4444";
  if (score >= 4) return "#F59E0B";
  return "#22C55E";
}

function riskLabel(score: number): string {
  if (score >= 7) return "높은 위험 수준";
  if (score >= 4) return "중간 위험 수준";
  return "낮은 위험 수준";
}

function translateSeverity(s: string | undefined): string {
  switch (s?.toLowerCase()) {
    case 'critical': return '심각';
    case 'high':     return '높음';
    case 'medium':   return '중간';
    case 'low':      return '낮음';
    case 'info':     return '정보';
    default:         return s ?? '정보';
  }
}

function translateCategory(c: string | undefined): string {
  switch (c?.toLowerCase()) {
    case 'privacy':    return '개인정보보호';
    case 'governance': return '거버넌스';
    case 'compliance': return '준법';
    case 'security':   return '보안';
    case 'financial':  return '재무';
    case 'ethics':     return '윤리';
    case 'risk':       return '위험';
    case 'legal':      return '법무';
    default:           return c ?? '';
  }
}

function translateFlagCode(code: string | undefined): string {
  if (!code) return '';
  const known: Record<string, string> = {
    "HIGH_FINANCIAL_RISK": "고위험 재무 지출이 포함된 의사결정입니다",
    "BOARD_APPROVAL_REQUIRED": "이사회 승인 필요",
    "PRIVACY_REVIEW_REQUIRED": "개인정보/보안 검토 필요",
    "CRITICAL_CONFLICT": "의사결정 내 치명적 상충 항목이 존재합니다",
    "HIGH_RISK": "고위험 의사결정으로 분류되었습니다",
    "STRATEGIC_CRITICAL": "전략적 중요성이 매우 높은 의사결정입니다",
    "MISSING_OWNER": "의사결정 실행 책임자가 지정되지 않았습니다",
    "MISSING_RISK_ASSESSMENT": "리스크 평가가 누락되었습니다",
    "FINANCIAL_THRESHOLD_EXCEEDED": "재무 승인 기준을 초과하였습니다",
    "GOVERNANCE_COVERAGE_GAP": "이 의사결정 유형에 적용 가능한 거버넌스 규정이 없습니다 — 규정 추가 또는 수동 검토를 고려하세요",
  };
  return known[code] ?? code.replace(/_/g, ' ');
}

function severityBg(severity: string | undefined): string {
  if (severity === "critical") return "bg-red-50 border-l-4 border-red-500";
  if (severity === "high") return "bg-amber-50 border-l-4 border-amber-500";
  return "bg-gray-50 border-l-4 border-gray-400";
}

function severityBadge(severity: string | undefined): string {
  if (severity === "critical") return "bg-red-100 text-red-800";
  if (severity === "high") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-700";
}

function severityIcon(severity: string | undefined) {
  const cls =
    severity === "critical"
      ? "text-red-600"
      : severity === "high"
        ? "text-amber-600"
        : "text-gray-500";
  return <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cls}`} />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DecisionPackReport({
  onBack,
  decisionData: dp,
}: DecisionPackReportProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────
  const score = dp?.governance?.risk_score ?? 0;
  const gaugeCircumference = 352;
  const gaugeDash = (score / 10) * gaugeCircumference;
  const gaugeColor = riskColor(score);

  const rawTitle =
    (dp?.decision_pack as Record<string, unknown> | undefined)?.title as
      | string
      | undefined;
  const title =
    stripExtractionFailed(rawTitle) ??
    stripExtractionFailed(dp?.decision?.statement) ??
    "의사결정 분석 보고서";

  const govStatus = dp?.governance?.status ?? "";
  const isReview =
    govStatus.includes("review") || govStatus === "needs_review";
  const isApproved = govStatus === "approved" || govStatus === "complete";
  const statusLabel = isReview
    ? "검토 필요"
    : isApproved
      ? "승인됨"
      : govStatus || "분석 완료";
  const statusClasses = isReview
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : isApproved
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  const processedAt = dp?.extraction_metadata?.processed_at as
    | string
    | undefined;

  // decision_pack sub-fields
  const dpRaw = dp?.decision_pack as Record<string, unknown> | undefined;
  const dpSummary = dpRaw?.summary as Record<string, unknown> | undefined;
  const confidence =
    (dpSummary?.confidence_score as number | undefined) ?? null;
  const recommendedActions =
    (dpRaw?.recommended_next_actions as string[] | undefined) ?? [];

  // Governance
  const govFlags = dp?.governance?.flags ?? [];
  const allRules: GovernanceRule[] = dp?.governance?.all_rules ?? [];
  const triggeredRules = allRules.filter(
    (r) => r.status === "TRIGGERED" || r.status === "VIOLATION",
  );

  // Approval rows — use governance.approval_chain as authoritative source.
  // The chain is pre-filtered by the backend to only include required approvers.
  // Items may be strings or objects {role, name, level, status, reason, source_rule_id}.
  function approvalChainItemName(item: unknown): string {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      return (obj.role ?? obj.name ?? obj.approver_id ?? String(item)) as string;
    }
    return String(item);
  }
  const approvalChain = dp?.governance?.approval_chain ?? [];

  const requiredApprovals =
    (dp?.decision?.required_approvals as string[] | undefined) ?? [];

  // KPIs / owners
  const kpis = dp?.decision?.kpis ?? [];
  const owners = dp?.decision?.owners ?? [];

  // ── Demo fallback ────────────────────────────────────────────────────────
  // When no real data: render original static content
  if (!dp) {
    return <DemoDecisionPack onBack={onBack} showTooltip={showTooltip} setShowTooltip={setShowTooltip} />;
  }

  // ── Live render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </button>
          <div className="flex items-start gap-3">
            <button disabled className="px-4 py-2 border border-gray-200 rounded text-sm font-semibold text-gray-400 bg-gray-50 cursor-not-allowed flex items-center gap-2 opacity-60">
              <Download className="w-4 h-4" />
              PDF 내보내기
            </button>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                승인 실행
              </button>
              {showTooltip && (
                <div className="absolute top-full mt-2 right-0 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border border-gray-700 z-50">
                  <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45" />
                  기업 승인 워크플로우를 시작합니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${statusClasses}`}
                >
                  {statusLabel}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  ref: {dp.decision_id}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-6">
                {title}
              </h1>
            </div>

            {/* Risk Gauge */}
            <div className="flex flex-col items-center ml-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                  <circle
                    cx="64" cy="64" r="56"
                    stroke={gaugeColor}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${gaugeDash} ${gaugeCircumference}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900">{score}</div>
                  <div className="text-sm text-gray-500">/ 10</div>
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">위험 노출도</div>
                <div className="text-xs mt-1" style={{ color: gaugeColor }}>
                  {riskLabel(score)}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">생성일</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(processedAt)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">회사</div>
              <div className="text-sm font-semibold text-gray-900">{dp.company?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">산업</div>
              <div className="text-sm font-semibold text-gray-900">{dp.company?.industry ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">신뢰도</div>
              <div className="text-sm font-semibold text-gray-900">
                {confidence != null ? `${(confidence * 100).toFixed(0)}%` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Decision Overview + Approval Workflow ────────────────────── */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* LEFT — Decision Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
              의사결정 개요
            </h2>

            {/* Core Objective */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">핵심 목표</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {stripExtractionFailed(dp.decision?.statement) ?? "추출된 목표 없음"}
              </p>
            </div>

            {/* KPIs — only shown when KPIs actually exist (not applicable for compliance checks) */}
            {kpis.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">예상 KPI</h3>
                <div className="space-y-4">
                  {kpis.map((kpi, idx) => {
                    const targetStr = kpi.target != null ? String(kpi.target) : '';
                    const isNegative =
                      (kpi.metric ?? '').toLowerCase().includes('cost') ||
                      (kpi.metric ?? '').toLowerCase().includes('비용') ||
                      (kpi.metric ?? '').toLowerCase().includes('expense') ||
                      targetStr.startsWith('-');
                    const barColor = isNegative ? 'bg-red-500' : 'bg-blue-500';
                    const valueColor = isNegative ? 'text-red-600' : 'text-blue-600';
                    const impactLabel = isNegative ? '부정적 영향 예상' : '긍정적 영향 예상';
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {kpi.metric ?? `KPI ${idx + 1}`}
                          </span>
                          <span className={`text-sm font-bold ${valueColor}`}>
                            {targetStr || '—'}
                          </span>
                        </div>
                        <div className="h-9 bg-gray-50 rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1.5 border border-gray-200">
                          <div className={`w-1.5 ${barColor} h-3 rounded-t`} />
                          <div className={`w-1.5 ${barColor} h-4 rounded-t`} />
                          <div className={`w-1.5 ${barColor} h-5 rounded-t`} />
                          <div className={`w-1.5 ${barColor} h-6 rounded-t`} />
                          <div className={`w-1.5 ${barColor} h-7 rounded-t`} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">{impactLabel}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Owners */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">담당자</h3>
              {owners.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {owners.map((owner, idx) => {
                    const initial = (owner.name ?? owner.role ?? "?")[0].toUpperCase();
                    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500"];
                    return (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className={`w-8 h-8 rounded-full ${colors[idx % colors.length]} flex items-center justify-center text-white text-xs font-bold`}>
                          {initial}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">{owner.name ?? "—"}</div>
                          <div className="text-xs text-gray-500">{owner.role ?? "—"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                  <Info className="w-4 h-4" />
                  담당자 미지정 — 승인 전 담당자 설정 권장
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Approval Workflow */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
              승인 체계
            </h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">담당자</div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">직무</div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">상태</div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">날짜</div>
              </div>

              {approvalChain.length > 0 ? (
                approvalChain.map((item, idx) => {
                  const obj = (item && typeof item === 'object') ? item as Record<string, unknown> : null;
                  // person's name (e.g. "이수진") — falls back to ID if name not provided
                  const personName = obj?.name ? String(obj.name) : typeof item === 'string' ? item : '—';
                  // job title (e.g. "준법감시인")
                  const jobTitle = obj?.role ? String(obj.role) : '—';
                  const rawStatus = obj?.status ? String(obj.status) : '';
                  const statusLabel = rawStatus === 'required' ? '승인 필요' : rawStatus === 'optional' ? '선택 사항' : '검토 대기';
                  const reason = obj?.reason ? String(obj.reason) : '';
                  const sourceRule = obj?.source_rule_id ? String(obj.source_rule_id) : '';
                  return (
                    <div key={idx} className="px-4 py-3 border-b border-gray-200 last:border-b-0">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div className="text-sm font-semibold text-gray-900">{personName}</div>
                        <div className="text-sm text-gray-600">{jobTitle}</div>
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                            <Clock className="w-3 h-3" />
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">—</div>
                      </div>
                      {reason && (
                        <div className="text-xs text-gray-500 mt-1.5">
                          {sourceRule ? `${sourceRule}: ` : ''}{reason}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : requiredApprovals.length > 0 ? (
                requiredApprovals.map((label, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 items-center">
                    <div className="text-sm font-semibold text-gray-900">{label}</div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        검토 대기
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">—</div>
                  </div>
                ))
              ) : dp.governance?.requires_human_review ? (
                <div className="grid grid-cols-3 gap-4 px-4 py-3 items-center">
                  <div className="text-sm font-semibold text-gray-900">전문가 검토</div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                      <Clock className="w-3 h-3" />
                      검토 대기
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">—</div>
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  승인 절차 불필요
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4 italic">
              모든 승인 단계는 조직의 거버넌스 정책에 따라 자동 기록됩니다.
            </p>
          </div>
        </div>

        {/* ── Governance Analysis ───────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              거버넌스 분석
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              정책 엔진 + 심층 추론 분석
            </span>
          </div>

          {govFlags.length > 0 ? (
            <div className="space-y-4">
              {govFlags.map((flag, idx) => (
                <div key={flag.code ?? idx} className={`flex gap-4 p-4 rounded ${severityBg(flag.severity)}`}>
                  {severityIcon(flag.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded ${severityBadge(flag.severity)}`}>
                        {translateSeverity(flag.severity)}
                      </span>
                      {flag.category && (
                        <span className="text-xs text-gray-500">{translateCategory(flag.category)}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {translateFlagCode(flag.code)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : triggeredRules.length > 0 ? (
            <div className="space-y-4">
              {triggeredRules.map((rule, idx) => (
                <div key={rule.rule_id ?? idx} className={`flex gap-4 p-4 rounded ${rule.status === "VIOLATION" ? "bg-red-50 border-l-4 border-red-500" : "bg-amber-50 border-l-4 border-amber-500"}`}>
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${rule.status === "VIOLATION" ? "text-red-600" : "text-amber-600"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded ${rule.status === "VIOLATION" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                        {rule.status === "VIOLATION" ? "위반" : rule.status === "TRIGGERED" ? "감지" : rule.status ?? "미확인"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {rule.description ?? rule.name ?? rule.rule_id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              감지된 거버넌스 위반 없음
            </div>
          )}
        </div>

        {/* ── Required Actions ──────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
            승인 전 필요 조치
          </h2>
          {recommendedActions.length > 0 ? (
            <div className="space-y-4">
              {recommendedActions.map((action, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed pt-1">{action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">필요한 사전 조치 없음</p>
          )}
        </div>

        {/* ── Inference Path & Audit Trail ──────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-gray-900">분석 경로 및 감사 기록</h2>
            <span className="text-xs text-gray-500 font-mono">거버넌스 AI가 단계별로 분석하고 자동 기록한 이력입니다</span>
          </div>

          <div className="relative pl-8 space-y-8">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

            {/* Step 1 — Extraction */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">1단계 — 정보 추출</h3>
                <span className="text-xs text-gray-500 font-mono">{formatDateTime(processedAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                {stripExtractionFailed(dp.decision?.statement)?.slice(0, 80) ?? "의사결정 텍스트 파싱"}
                {(dp.decision?.statement?.length ?? 0) > 80 ? "…" : ""}
              </p>
              <p className="text-xs text-gray-500">
                분석 방식: 지능형 자동 분석
              </p>
            </div>

            {/* Step 2 — Policy Engine */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">2단계 — 정책 검토</h3>
                <span className="text-xs text-gray-500 font-mono">{formatDateTime(processedAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                {allRules.length}개 거버넌스 규칙 평가 완료
              </p>
              <p className="text-xs text-gray-500">
                감지된 규칙: {triggeredRules.length}개
                {triggeredRules.length > 0 && (
                  <span className="block mt-0.5 text-amber-700">
                    {triggeredRules[0].description ?? triggeredRules[0].name ?? triggeredRules[0].rule_id ?? ''}
                  </span>
                )}
              </p>
            </div>

            {/* Step 3 — Reasoning */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">3단계 — 심층 분석</h3>
                <span className="text-xs text-gray-500 font-mono">{formatDateTime(processedAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                전략적 분석 및 권고사항 생성
              </p>
              <p className="text-xs text-gray-500">
                신뢰도: {confidence != null ? `${(confidence * 100).toFixed(0)}%` : "—"} /
                전문가 검토 필요: {dp.governance?.requires_human_review ? "예" : "아니오"}
              </p>
            </div>

            {/* Final */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div className="flex items-start justify-between">
                <div className="text-sm font-bold text-green-600">의사결정 보고서 생성 완료</div>
                <span className="text-xs text-gray-500 font-mono">{formatDateTime(processedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            본 보고서는 AI Governance 시스템에 의해 자동 생성되었습니다.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            조직의 최종 의사결정은 승인 권한자에게 있습니다.
          </p>
          <p className="text-xs text-gray-400 font-mono tracking-wider">
            CONFIDENTIAL · DecisionGovernance AI
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo fallback (shown when no real data is present)
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-start gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Execute Approval
              </button>
              {showTooltip && (
                <div className="absolute top-full mt-2 right-0 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border border-gray-700 z-50">
                  <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45" />
                  Triggers enterprise approval workflow
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider rounded border border-amber-200">
                  Board Review Required
                </span>
                <span className="text-xs text-gray-500 font-mono">ref: DP-2024-APAC-B1</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-6">
                2024년 3분기 APAC 시장 인프라 투자 승인 건
              </h1>
            </div>
            <div className="flex flex-col items-center ml-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="#F59E0B" strokeWidth="12" fill="none"
                    strokeDasharray={`${(62 / 100) * 352} 352`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900">62</div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">Risk Exposure</div>
                <div className="text-xs text-amber-600 mt-1">Moderate strategic risk detected</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issue Date</div>
              <div className="text-sm font-semibold text-gray-900">2024년 10월 24일</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</div>
              <div className="text-sm font-semibold text-gray-900">Global Strategy TF</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Capital Expenditure</div>
              <div className="text-sm font-semibold text-gray-900">$2,450,000</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Classification</div>
              <div className="text-sm font-semibold text-gray-900">Infrastructure / Strategic</div>
            </div>
          </div>
        </div>

        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">본 보고서는 AI Governance 시스템에 의해 자동 생성되었습니다.</p>
          <p className="text-xs text-gray-500 mb-4">조직의 최종 의사결정은 승인 권한자에게 있습니다.</p>
          <p className="text-xs text-gray-400 font-mono tracking-wider">CONFIDENTIAL · DecisionGovernance AI</p>
        </div>
      </div>
    </div>
  );
}
