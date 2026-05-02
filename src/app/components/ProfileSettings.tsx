import {
  User,
  Building2,
  Mail,
  Shield,
  Key,
  LogOut,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getCompanies, getMe, updateMe } from "../../api/client";
import type { Company, UserResponse, UserRole } from "../../api/types";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";

export function ProfileSettings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout, token, setAuth } = useAuth();
  const { t, lang } = useLang();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [systemInfoExpanded, setSystemInfoExpanded] = useState(false);

  const isEditing = searchParams.get("edit") === "true";
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editCompanyId, setEditCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getRoleLabel = (role: UserRole) => {
    const map: Record<UserRole, string> = {
      ADMIN: t('profile.role.admin'),
      MANAGER: t('profile.role.manager'),
      USER: t('profile.role.user'),
    };
    return map[role] ?? role;
  };

  const refreshUser = (tk: string) =>
    getMe(tk).then((u) => {
      setUser(u);
      setEditName(u.name ?? "");
      setEditDepartment(u.department_name ?? "");
      setEditCompanyId(u.company_id ?? "");
    });

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    Promise.all([refreshUser(token), getCompanies(token)])
      .then(([, cos]) => setCompanies(cos))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t('profile.error.loadDefault');
        if (message.includes("401") || message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
          logout(); navigate("/");
        } else {
          setFetchError(message);
        }
      })
      .finally(() => setIsLoading(false));
  }, [token, navigate, logout]);

  const enterEditMode = () => { setSearchParams({ edit: "true" }); setSaveError(null); };
  const cancelEdit = () => {
    setSearchParams({});
    setSaveError(null);
    if (user) {
      setEditName(user.name ?? "");
      setEditDepartment(user.department_name ?? "");
      setEditCompanyId(user.company_id ?? "");
    }
  };

  const orgRequired = !user?.company_id;

  const handleSave = async () => {
    if (!token) return;
    if (orgRequired && !editCompanyId) { setSaveError(t('profile.org.required')); return; }
    setIsSaving(true); setSaveError(null);
    try {
      await updateMe(token, {
        name: editName || undefined,
        department_name: editDepartment || undefined,
        company_id: editCompanyId || undefined,
      });
      const refreshed = await getMe(token);
      setUser(refreshed); setAuth(refreshed, token);
      setEditName(refreshed.name ?? "");
      setEditDepartment(refreshed.department_name ?? "");
      setEditCompanyId(refreshed.company_id ?? "");
      setSearchParams({});
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : t('profile.error.save'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const displayName = user?.name ?? user?.email ?? "—";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const roleBadgeStyle = (role: UserRole): React.CSSProperties => {
    const map: Record<UserRole, React.CSSProperties> = {
      ADMIN:   { background: 'rgba(99,102,241,0.20)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.35)' },
      MANAGER: { background: 'rgba(99,102,241,0.10)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.20)' },
      USER:    { background: 'rgba(255,255,255,0.07)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.10)' },
    };
    return map[role] ?? map.USER;
  };

  // shared styles
  const card: React.CSSProperties = { backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem' };
  const labelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4B5563' };
  const valueStyle: React.CSSProperties = { fontSize: '0.9375rem', fontWeight: 500, color: '#F9FAFB' };
  const inputStyle: React.CSSProperties = { width: '100%', backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#F9FAFB', outline: 'none' };
  const sectionDivider: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0F1A', fontFamily: 'SUIT Variable, Inter, sans-serif' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F9FAFB')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('profile.back')}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FCA5A5'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-8 py-12">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#F9FAFB' }}>{t('profile.page.title')}</h1>
          <p style={{ color: '#9CA3AF' }}>{t('profile.page.subtitle')}</p>
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ ...card, padding: '2rem' }} className="animate-pulse">
                <div className="h-3 rounded w-1/4 mb-6" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>
              </div>
            ))}
          </div>

        ) : fetchError ? (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.75rem', padding: '1.5rem' }} className="flex items-start gap-3">
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#FCA5A5', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>{t('profile.error.load')}</p>
              <p className="text-sm mt-1" style={{ color: '#FCA5A5', opacity: 0.7 }}>{fetchError}</p>
            </div>
          </div>

        ) : user ? (
          <div className="space-y-4">

            {/* ── Profile hero card ── */}
            <div style={card} className="overflow-hidden">
              {/* Indigo gradient header */}
              <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #1E2433 100%)', borderBottom: '1px solid rgba(99,102,241,0.20)', padding: '1.5rem 2rem' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: '#6366F1', border: '2px solid rgba(99,102,241,0.4)' }}
                    >
                      {initials}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">{displayName}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={roleBadgeStyle(user.role)}>
                          {getRoleLabel(user.role)}
                        </span>
                        {user.department_name && (
                          <span className="text-sm" style={{ color: '#9CA3AF' }}>{user.department_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit / Save / Cancel */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#D1D5DB' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                      >
                        {t('profile.cancel')}
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                        style={{ background: '#6366F1', color: 'white' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#4F46E5')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#6366F1')}
                      >
                        {isSaving ? t('profile.saving') : t('profile.save')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={enterEditMode}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#D1D5DB' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    >
                      {t('profile.edit')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Save error */}
            {saveError && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle style={{ width: '1rem', height: '1rem', color: '#FCA5A5', flexShrink: 0 }} />
                <p className="text-sm" style={{ color: '#FCA5A5' }}>{saveError}</p>
              </div>
            )}

            {/* ── Account information ── */}
            <div style={{ ...card, padding: '2rem' }}>
              <h3 className="text-base font-semibold mb-6" style={{ color: '#F9FAFB' }}>{t('profile.account.title')}</h3>
              <div className="grid grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label style={labelStyle}><User style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.account.name')}</label>
                  {isEditing ? (
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder={t('profile.account.name.placeholder')} style={inputStyle} />
                  ) : (
                    <div style={valueStyle}>{user.name ?? "—"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label style={labelStyle}><Mail style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.account.email')}</label>
                  <div style={valueStyle}>{user.email}</div>
                </div>

                <div className="space-y-2">
                  <label style={labelStyle}><Building2 style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.account.dept')}</label>
                  {isEditing ? (
                    <input type="text" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} placeholder={t('profile.account.dept.placeholder')} style={inputStyle} />
                  ) : (
                    <div style={valueStyle}>{user.department_name ?? "—"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label style={labelStyle}><Shield style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.account.role')}</label>
                  <div style={valueStyle}>{getRoleLabel(user.role)}</div>
                </div>

                <div className="space-y-2">
                  <label style={labelStyle}><Clock style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.account.created')}</label>
                  <div style={valueStyle}>
                    {new Date(user.created_at).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', hour12: lang !== 'ko',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Organization ── */}
            <div style={{ ...card, padding: '2rem' }}>
              <h3 className="text-base font-semibold mb-6" style={{ color: '#F9FAFB' }}>{t('profile.org.title')}</h3>
              <div className="space-y-2">
                <label style={labelStyle}>
                  <Building2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  {t('profile.org.label')}
                  {isEditing && orgRequired && (
                    <span style={{ color: '#FCA5A5', fontWeight: 700, textTransform: 'none', letterSpacing: 'normal' }}>* {t('profile.org.required.badge')}</span>
                  )}
                </label>
                {isEditing ? (
                  <select
                    value={editCompanyId}
                    onChange={e => setEditCompanyId(e.target.value)}
                    style={{
                      ...inputStyle,
                      border: orgRequired && !editCompanyId ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <option value="" style={{ background: '#1E2433' }}>{t('profile.org.none')}</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: '#1E2433' }}>
                        {(lang === 'en' ? (c.name_en ?? c.name) : c.name) ?? c.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={valueStyle}>
                    {(() => { const c = companies.find((c) => c.id === user.company_id); return (lang === 'en' ? (c?.name_en ?? c?.name) : c?.name) ?? user.company_id ?? "—"; })()}
                  </div>
                )}
              </div>
            </div>

            {/* ── System Info (collapsible) ── */}
            <div style={{ ...card, overflow: 'hidden' }}>
              <button
                onClick={() => setSystemInfoExpanded(!systemInfoExpanded)}
                className="w-full flex items-center justify-between transition-colors"
                style={{ padding: '1.25rem 2rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-3">
                  <Key style={{ width: '1.1rem', height: '1.1rem', color: '#6B7280' }} />
                  <h3 className="text-base font-semibold" style={{ color: '#F9FAFB' }}>{t('profile.system.title')}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#6B7280' }}>
                    {t('profile.system.readonly')}
                  </span>
                </div>
                {systemInfoExpanded
                  ? <ChevronUp style={{ width: '1.1rem', height: '1.1rem', color: '#6B7280' }} />
                  : <ChevronDown style={{ width: '1.1rem', height: '1.1rem', color: '#6B7280' }} />
                }
              </button>

              {systemInfoExpanded && (
                <div style={{ ...sectionDivider, padding: '1.5rem 2rem' }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label style={labelStyle}><Key style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.system.memberId')}</label>
                      <div className="font-mono text-sm px-4 py-3 rounded-lg" style={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.07)', color: '#9CA3AF' }}>
                        {user.id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label style={labelStyle}><Key style={{ width: '0.875rem', height: '0.875rem' }} />{t('profile.system.companyId')}</label>
                      <div className="font-mono text-sm px-4 py-3 rounded-lg" style={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.07)', color: '#9CA3AF' }}>
                        {user.company_id ?? "—"}
                      </div>
                    </div>
                    <div className="pt-4" style={sectionDivider}>
                      <p className="text-xs" style={{ color: '#4B5563' }}>{t('profile.system.note')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Info note ── */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
              <div className="flex items-start gap-3">
                <Shield style={{ width: '1.1rem', height: '1.1rem', color: '#A5B4FC', flexShrink: 0, marginTop: '0.125rem' }} />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold" style={{ color: '#A5B4FC' }}>{t('profile.info.title')}</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{t('profile.info.desc')}</p>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
