import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  CheckCircle2,
  Activity,
  ArrowRight,
  Bot,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getWorkspaceMetrics, getWorkspaceDecisions, getCompanies } from "../../api/client";
import type { WorkspaceMetrics, WorkspaceDecision } from "../../api/types";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";
import { setWorkspaceDecisionsCache } from "../store/consoleCache";

function statusBadge(status: WorkspaceDecision["status"], riskLevel: string, t: (k: string) => string) {
  // Not yet analyzed — always show "Awaiting"
  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md flex-shrink-0">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-xs font-medium text-amber-700">{t("workspace.status.pending")}</span>
      </div>
    );
  }
  // Pipeline has run — show actual risk level from risk_level field
  const level = (riskLevel ?? "medium").toLowerCase();
  if (level === "critical" || level === "high") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-300 rounded-md flex-shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        <span className="text-xs font-medium text-red-700">{t(`console.right.verdict.${level}`)}</span>
      </div>
    );
  }
  if (level === "medium") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-md flex-shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-xs font-medium text-amber-700">{t("console.right.verdict.medium")}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md flex-shrink-0">
      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      <span className="text-xs font-medium text-green-700">{t("console.right.verdict.low")}</span>
    </div>
  );
}

function DynamicDecisionCard({
  decision,
  lang,
  t,
  onValidate,
}: {
  decision: WorkspaceDecision;
  lang: string;
  t: (k: string) => string;
  onValidate: () => void;
}) {
  const isEn = lang === "en";
  const hasBeenAnalyzed = decision.status !== "pending";
  const riskLevel = (decision.risk_level ?? "medium").toLowerCase();
  const isHighRisk = hasBeenAnalyzed && (riskLevel === "high" || riskLevel === "critical");
  const isBlocked = isHighRisk;
  const borderClass = isHighRisk ? "border-red-200" : "border-gray-200";

  const agentName = isEn ? (decision.agent_name_en ?? decision.agent_name) : decision.agent_name;
  const department = isEn ? (decision.department_en ?? decision.department) : decision.department;
  const proposedTextKo = decision.proposed_text_ko ?? decision.proposed_text;
  const proposedTextEn = decision.proposed_text_en ?? decision.proposed_text;
  const proposedText = isEn ? proposedTextEn : proposedTextKo;

  const impactLabel = isEn ? (decision.impact_label_en ?? decision.impact_label) : decision.impact_label;
  const metaValue =
    impactLabel ??
    (decision.affected_count !== null ? `${decision.affected_count} people` : null) ??
    decision.contract_value ??
    "—";

  const metaLabel = decision.affected_count !== null && !decision.impact_label
    ? t("workspace.card.affected")
    : decision.contract_value && !decision.impact_label
    ? t("workspace.card.value")
    : t("workspace.card.impact");

  return (
    <div className={`bg-white border ${borderClass} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${isBlocked ? "from-red-500 to-red-600" : "from-gray-500 to-gray-700"} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">{agentName}</div>
            <div className={`text-xs text-gray-500 ${isBlocked ? "bg-red-50" : "bg-gray-100"} px-2 py-1 rounded inline-block`}>
              {department}
            </div>
          </div>
        </div>
        {statusBadge(decision.status, decision.risk_level, t)}
      </div>

      <div className="flex-1 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">{t("workspace.card.proposed")}</div>
        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
          {proposedText}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">{metaLabel}</div>
          <div className={`text-sm font-semibold ${isBlocked ? "text-red-700" : "text-gray-900"}`}>{metaValue}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">{t("workspace.card.confidence")}</div>
          <div className="text-sm font-semibold text-gray-900">{Math.round(decision.confidence * 100)}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">{t("workspace.card.dept")}</div>
          <div className="text-sm font-semibold text-gray-900">{department}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onValidate}
          className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-md hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          {t("workspace.btn.validate")}
        </button>
      </div>
    </div>
  );
}

export function WorkspaceDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, lang, setLang } = useLang();

  const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null);
  const [decisions, setDecisions] = useState<WorkspaceDecision[]>([]);
  const [company, setCompany] = useState<import("../../api/types").Company | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    if (!user?.company_id) {
      navigate("/profile?edit=true");
      return;
    }
    getCompanies(token)
      .then((list) => {
        const match = list.find((c) => c.id === user.company_id);
        if (match) setCompany(match);
      })
      .catch(() => {});
    getWorkspaceMetrics(token)
      .then(setMetrics)
      .catch(() => {/* silently fall back to null */});
    getWorkspaceDecisions(token, { limit: 20, sort: "created_at:desc" })
      .then((res) => {
        setDecisions(res.items);
        setWorkspaceDecisionsCache(res.items);
      })
      .catch(() => {/* silently fall back to empty */});
  }, [token]);

  const initials = (() => {
    const name = user?.name ?? user?.email ?? "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  })();

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'SUIT Variable, Inter, sans-serif' }}>
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('workspace.title')}
              </h1>
              <p className="text-sm text-gray-600 max-w-2xl">
                {t('workspace.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Org Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {company
                    ? `${lang === "en" ? (company.name_en ?? company.name) : company.name} · ${t('workspace.connected')}`
                    : t('workspace.connected')}
                </span>
              </div>

              {/* User Avatar */}
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-9 h-9 bg-gray-700 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                {initials}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Summary Metrics Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                {t('workspace.metric1.label')}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics?.decisions_today ?? "—"}</div>
            <div className="mt-2 text-xs text-gray-500">{t('workspace.metric1.sub')}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-600">
                {t('workspace.metric2.label')}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics?.pending_count ?? "—"}</div>
            <div className="mt-2 text-xs text-gray-500">{t('workspace.metric2.sub')}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">
                {t('workspace.metric3.label')}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics?.blocked_count ?? "—"}</div>
            <div className="mt-2 text-xs text-gray-500">{t('workspace.metric3.sub')}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Section Header */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('workspace.feed.title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('workspace.feed.subtitle')}
            </p>
          </div>

          {/* Workflow Visualization */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bot className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-xs font-semibold text-gray-900">{t('workspace.flow.step1')}</div>
                <div className="text-xs text-gray-500 mt-1">{t('workspace.flow.step1.sub')}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mx-4" />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bot className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-xs font-semibold text-gray-900">{t('workspace.flow.step2')}</div>
                <div className="text-xs text-gray-500 mt-1">{t('workspace.flow.step2.sub')}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mx-4" />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-xs font-semibold text-gray-900">{t('workspace.flow.step3')}</div>
                <div className="text-xs text-gray-500 mt-1">{t('workspace.flow.step3.sub')}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mx-4" />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-xs font-semibold text-gray-900">{t('workspace.flow.step4')}</div>
                <div className="text-xs text-gray-500 mt-1">{t('workspace.flow.step4.sub')}</div>
              </div>
            </div>
          </div>

          {/* Decision Cards */}
          <div className="grid grid-cols-2 gap-4">
            {decisions.map((decision) => (
              <DynamicDecisionCard
                key={decision.decision_id}
                decision={decision}
                lang={lang}
                t={t}
                onValidate={() => navigate("/console", {
                  state: {
                    companyId: user?.company_id,
                    decisionText: decision.proposed_text_ko ?? decision.proposed_text,
                    decisionTextEn: decision.proposed_text_en ?? decision.proposed_text,
                    agentName: decision.agent_name,
                    agentNameEn: decision.agent_name_en ?? decision.agent_name,
                    department: decision.department,
                    departmentEn: decision.department_en ?? decision.department,
                    workspaceDecisionId: decision.decision_id,
                  },
                })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
