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
  Network,
  GitBranch,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getWorkspaceMetrics, getWorkspaceDecisions, getCompanies } from "../../api/client";
import type { WorkspaceMetrics, WorkspaceDecision } from "../../api/types";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";
import { setWorkspaceDecisionsCache } from "../store/consoleCache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

function statusBadge(status: WorkspaceDecision["status"], riskLevel: string, t: (k: string) => string) {
  if (status === "pending") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.30)', borderRadius: '0.375rem', flexShrink: 0 }}>
        <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#FCD34D' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FCD34D' }}>{t("workspace.status.pending")}</span>
      </div>
    );
  }
  const level = (riskLevel ?? "medium").toLowerCase();
  if (level === "critical") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.375rem', flexShrink: 0 }}>
        <AlertTriangle style={{ width: '0.875rem', height: '0.875rem', color: '#FCA5A5' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FCA5A5' }}>{t(`console.right.verdict.${level}`)}</span>
      </div>
    );
  }
  if (level === "high") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.375rem', flexShrink: 0 }}>
        <AlertTriangle style={{ width: '0.875rem', height: '0.875rem', color: '#FCA5A5' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FCA5A5' }}>{t(`console.right.verdict.${level}`)}</span>
      </div>
    );
  }
  if (level === "medium") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.35)', borderRadius: '0.375rem', flexShrink: 0 }}>
        <AlertTriangle style={{ width: '0.875rem', height: '0.875rem', color: '#FDBA74' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#FDBA74' }}>{t("console.right.verdict.medium")}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.375rem', flexShrink: 0 }}>
      <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: '#6EE7B7' }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6EE7B7' }}>{t("console.right.verdict.low")}</span>
    </div>
  );
}

function DynamicDecisionCard({
  decision,
  lang,
  t,
  onValidate,
  onViewResults,
}: {
  decision: WorkspaceDecision;
  lang: string;
  t: (k: string) => string;
  onValidate: () => void;
  onViewResults: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isEn = lang === "en";
  const hasBeenAnalyzed = decision.status !== "pending";
  const riskLevel = (decision.risk_level ?? "medium").toLowerCase();
  const isHighRisk = hasBeenAnalyzed && (riskLevel === "high" || riskLevel === "critical");

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

  const cardStyle: React.CSSProperties = isHighRisk
    ? {
        backgroundColor: '#111827',
        border: '1px solid rgba(239,68,68,0.35)',
        boxShadow: 'inset 3px 0 0 rgba(239,68,68,0.6)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s ease',
      }
    : {
        backgroundColor: '#111827',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s ease',
      };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem',
              background: isHighRisk
                ? 'linear-gradient(135deg, rgba(239,68,68,0.8) 0%, rgba(185,28,28,0.9) 100%)'
                : 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: '#F9FAFB' }}>{agentName}</div>
            <div
              className="text-xs px-2 py-1 rounded inline-block"
              style={{
                background: isHighRisk ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.07)',
                color: isHighRisk ? '#FCA5A5' : '#9CA3AF',
              }}
            >
              {department}
            </div>
          </div>
        </div>
        {statusBadge(decision.status, decision.risk_level, t)}
      </div>

      <div className="flex-1 mb-4">
        <div className="text-sm font-semibold mb-2" style={{ color: '#9CA3AF' }}>{t("workspace.card.proposed")}</div>
        <div
          className="text-sm p-3 rounded"
          style={{
            backgroundColor: '#1E2433',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#D1D5DB',
            lineHeight: '1.5',
          }}
        >
          {proposedText}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{metaLabel}</div>
          <div className="text-sm font-semibold" style={{ color: isHighRisk ? '#FCA5A5' : '#F9FAFB' }}>{metaValue}</div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{t("workspace.card.confidence")}</div>
          <div className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{Math.round(decision.confidence * 100)}%</div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>Submitted</div>
          <div className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>
            {(() => {
              const mins = Math.round((Date.now() - new Date(decision.created_at).getTime()) / 60000);
              return mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`;
            })()}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {decision.status === 'pending' ? (
          <button
            onClick={onValidate}
            className="w-full text-white text-sm font-semibold px-4 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
            style={{ background: '#6366F1' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4F46E5')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6366F1')}
          >
            <Shield className="w-4 h-4" />
            {t("workspace.btn.validate")}
          </button>
        ) : decision.analysis_decision_id ? (
          <button
            onClick={onViewResults}
            className="w-full text-sm font-semibold px-4 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
            style={{
              background: decision.status === 'validated'
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(239,68,68,0.10)',
              color: decision.status === 'validated' ? '#6EE7B7' : '#FCA5A5',
              border: `1px solid ${decision.status === 'validated' ? 'rgba(16,185,129,0.30)' : 'rgba(239,68,68,0.30)'}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = decision.status === 'validated'
                ? 'rgba(16,185,129,0.20)' : 'rgba(239,68,68,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = decision.status === 'validated'
                ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)';
            }}
          >
            <FileText className="w-4 h-4" />
            View Results →
          </button>
        ) : (
          // Analyzed but backend hasn't returned analysis_decision_id yet — allow re-run
          <button
            onClick={onValidate}
            className="w-full text-sm font-semibold px-4 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
          >
            <Shield className="w-4 h-4" />
            Re-run Governance
          </button>
        )}
      </div>
    </div>
  );
}

export function WorkspaceDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, lang } = useLang();

  const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null);
  const [decisions, setDecisions] = useState<WorkspaceDecision[]>([]);
  const [company, setCompany] = useState<import("../../api/types").Company | null>(null);
  const [permissionOpen, setPermissionOpen] = useState(false);

  const canValidate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const guardValidate = (run: () => void) => {
    if (!canValidate) {
      setPermissionOpen(true);
      return;
    }
    run();
  };

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
      .catch(() => {
        setMetrics({
          decisions_today: 3,
          pending_count: 3,
          blocked_count: 0,
        });
      });
    getWorkspaceDecisions(token, { limit: 20, sort: "created_at:desc" })
      .then((res) => {
        setDecisions(res.items);
        setWorkspaceDecisionsCache(res.items);
      })
      .catch(() => {
        const mockDecisions: WorkspaceDecision[] = [
          {
            decision_id: "demo-001",
            agent_name: "Budget Allocation Agent",
            agent_name_en: "Budget Allocation Agent",
            department: "Finance & IT",
            department_en: "Finance & IT",
            status: "pending",
            proposed_text: "Approve reallocation of $2.4M from infrastructure reserve to accelerate Q3 cloud migration project. Requires sign-off from CFO and IT Director. Project timeline: 6 weeks.",
            proposed_text_en: "Approve reallocation of $2.4M from infrastructure reserve to accelerate Q3 cloud migration project. Requires sign-off from CFO and IT Director. Project timeline: 6 weeks.",
            confidence: 0.87,
            risk_level: "medium",
            impact_label: "Critical Infrastructure",
            impact_label_en: "Critical Infrastructure",
            contract_value: "$2.4M",
            affected_count: null,
            created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            validated_at: null,
          },
          {
            decision_id: "demo-002",
            agent_name: "HR Compliance Agent",
            agent_name_en: "HR Compliance Agent",
            department: "People Operations",
            department_en: "People Operations",
            status: "pending",
            proposed_text: "Grant third-party analytics vendor read access to anonymized employee performance data for DEI benchmarking study. 1,200 records affected. Vendor is not currently on approved vendor list.",
            proposed_text_en: "Grant third-party analytics vendor read access to anonymized employee performance data for DEI benchmarking study. 1,200 records affected. Vendor is not currently on approved vendor list.",
            confidence: 0.71,
            risk_level: "high",
            impact_label: "Data Privacy Risk",
            impact_label_en: "Data Privacy Risk",
            contract_value: null,
            affected_count: 1200,
            created_at: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
            validated_at: null,
          },
          {
            decision_id: "demo-003",
            agent_name: "Procurement Agent",
            agent_name_en: "Procurement Agent",
            department: "Legal & Procurement",
            department_en: "Legal & Procurement",
            status: "pending",
            proposed_text: "Auto-renew enterprise SaaS contract with existing vendor for $340K/year. Terms unchanged from prior year. Legal review completed. Renewal deadline in 14 days.",
            proposed_text_en: "Auto-renew enterprise SaaS contract with existing vendor for $340K/year. Terms unchanged from prior year. Legal review completed. Renewal deadline in 14 days.",
            confidence: 0.94,
            risk_level: "low",
            impact_label: "Annual Contract",
            impact_label_en: "Annual Contract",
            contract_value: "$340K",
            affected_count: null,
            created_at: new Date(Date.now() - 1000 * 60 * 97).toISOString(),
            validated_at: null,
          },
        ];
        setDecisions(mockDecisions);
        setWorkspaceDecisionsCache(mockDecisions);
      });
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
    <div className="min-h-screen" style={{ backgroundColor: '#0B0F1A', fontFamily: 'SUIT Variable, Inter, sans-serif' }}>
      {/* Top Header */}
      <div style={{ backgroundColor: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#F9FAFB' }}>
                {t('workspace.title')}
              </h1>
              <p className="text-sm max-w-2xl" style={{ color: '#9CA3AF' }}>
                {t('workspace.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Org Status */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#6EE7B7' }} />
                <span className="text-xs font-medium" style={{ color: '#6EE7B7' }}>
                  {company
                    ? `${lang === "en" ? (company.name_en ?? company.name) : company.name} · ${t('workspace.connected')}`
                    : t('workspace.connected')}
                </span>
              </div>

              {/* User Avatar */}
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-colors"
                style={{ background: '#6366F1', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#4F46E5')}
                onMouseLeave={e => (e.currentTarget.style.background = '#6366F1')}
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
          <div className="rounded-xl p-6" style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity style={{ width: '1.25rem', height: '1.25rem', color: '#A5B4FC' }} />
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
                {t('workspace.metric1.label')}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{metrics?.decisions_today ?? "—"}</div>
            <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>{t('workspace.metric1.sub')}</div>
          </div>

          <div className="rounded-xl p-6" style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#FCD34D' }} />
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
                {t('workspace.metric2.label')}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{metrics?.pending_count ?? "—"}</div>
            <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>{t('workspace.metric2.sub')}</div>
          </div>

          <div className="rounded-xl p-6" style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#FCA5A5' }} />
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
                {t('workspace.metric3.label')}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{metrics?.blocked_count ?? "—"}</div>
            <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>{t('workspace.metric3.sub')}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Section Header */}
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#F9FAFB' }}>
              {t('workspace.feed.title')}
            </h2>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {t('workspace.feed.subtitle')}
            </p>
          </div>

          {/* Workflow Visualization */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'linear-gradient(135deg, #111827 0%, #1E2433 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bot style={{ width: '1.5rem', height: '1.5rem', color: '#A5B4FC' }} />
                </div>
                <div className="text-xs font-semibold" style={{ color: '#F9FAFB' }}>{t('workspace.flow.step1')}</div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{t('workspace.flow.step1.sub')}</div>
              </div>
              <ArrowRight style={{ width: '1.25rem', height: '1.25rem', color: '#374151', flexShrink: 0, margin: '0 1rem' }} />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Network style={{ width: '1.5rem', height: '1.5rem', color: '#A5B4FC' }} />
                </div>
                <div className="text-xs font-semibold" style={{ color: '#F9FAFB' }}>{t('workspace.flow.step2')}</div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{t('workspace.flow.step2.sub')}</div>
              </div>
              <ArrowRight style={{ width: '1.25rem', height: '1.25rem', color: '#374151', flexShrink: 0, margin: '0 1rem' }} />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#A5B4FC' }} />
                </div>
                <div className="text-xs font-semibold" style={{ color: '#F9FAFB' }}>{t('workspace.flow.step3')}</div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{t('workspace.flow.step3.sub')}</div>
              </div>
              <ArrowRight style={{ width: '1.25rem', height: '1.25rem', color: '#374151', flexShrink: 0, margin: '0 1rem' }} />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-2">
                  <GitBranch style={{ width: '1.5rem', height: '1.5rem', color: '#A5B4FC' }} />
                </div>
                <div className="text-xs font-semibold" style={{ color: '#F9FAFB' }}>{t('workspace.flow.step4')}</div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{t('workspace.flow.step4.sub')}</div>
              </div>
            </div>
          </div>

          {/* Decision Cards */}
          {decisions.length === 0 && metrics !== null ? (
            <div className="text-center py-16">
              <p className="text-sm font-semibold mb-1" style={{ color: '#6B7280' }}>No decisions submitted yet</p>
              <p className="text-xs mb-6" style={{ color: '#4B5563' }}>Run your first governance check to see results here.</p>
              <button
                onClick={() => guardValidate(() => navigate('/console'))}
                className="text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                style={{ background: '#6366F1' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#4F46E5')}
                onMouseLeave={e => (e.currentTarget.style.background = '#6366F1')}
              >
                Run Governance Check
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {decisions.map((decision) => (
                <DynamicDecisionCard
                  key={decision.decision_id}
                  decision={decision}
                  lang={lang}
                  t={t}
                  onValidate={() => guardValidate(() => navigate("/console", {
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
                  }))}
                  onViewResults={() => navigate("/console", {
                    state: {
                      companyId: user?.company_id,
                      decisionText: decision.proposed_text_ko ?? decision.proposed_text,
                      decisionTextEn: decision.proposed_text_en ?? decision.proposed_text,
                      agentName: decision.agent_name,
                      agentNameEn: decision.agent_name_en ?? decision.agent_name,
                      department: decision.department,
                      departmentEn: decision.department_en ?? decision.department,
                      workspaceDecisionId: decision.decision_id,
                      existingDecisionId: decision.analysis_decision_id,
                    },
                  })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={permissionOpen} onOpenChange={setPermissionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('workspace.permission.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('workspace.permission.body')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t('workspace.permission.ok')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
