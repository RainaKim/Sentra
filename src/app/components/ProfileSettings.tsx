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

  const ROLE_BADGE: Record<UserRole, string> = {
    ADMIN: "bg-gray-900 text-white",
    MANAGER: "bg-gray-700 text-white",
    USER: "bg-gray-400 text-white",
  };

  const refreshUser = (tk: string) =>
    getMe(tk).then((u) => {
      setUser(u);
      setEditName(u.name ?? "");
      setEditDepartment(u.department_name ?? "");
      setEditCompanyId(u.company_id ?? "");
    });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    Promise.all([
      refreshUser(token),
      getCompanies(token),
    ])
      .then(([, cos]) => {
        console.log('[ProfileSettings] companies loaded:', cos);
        setCompanies(cos);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t('profile.error.loadDefault');
        if (message.includes("401") || message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
          logout();
          navigate("/");
        } else {
          setFetchError(message);
        }
      })
      .finally(() => setIsLoading(false));
  }, [token, navigate, logout]);

  const enterEditMode = () => {
    setSearchParams({ edit: "true" });
    setSaveError(null);
  };

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
    console.log('[ProfileSettings] handleSave — editCompanyId:', editCompanyId, '| orgRequired:', orgRequired);
    if (orgRequired && !editCompanyId) {
      setSaveError(t('profile.org.required'));
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: editName || undefined,
        department_name: editDepartment || undefined,
        company_id: editCompanyId || undefined,
      };
      console.log('[ProfileSettings] PATCH /v1/me payload:', payload);
      const updateResult = await updateMe(token, payload);
      console.log('[ProfileSettings] PATCH /v1/me response:', updateResult);
      const refreshed = await getMe(token);
      console.log('[ProfileSettings] GET /v1/me refreshed:', refreshed);
      setUser(refreshed);
      setAuth(refreshed, token);
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleBadgeStyle = (role: UserRole) => ROLE_BADGE[role] ?? "bg-gray-200 text-gray-800";

  const displayName = user?.name ?? user?.email ?? "—";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('profile.back')}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.page.title')}</h1>
          <p className="text-gray-600">{t('profile.page.subtitle')}</p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-8 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">{t('profile.error.load')}</p>
              <p className="text-sm text-red-700 mt-1">{fetchError}</p>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Primary Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-white text-xl font-bold">
                      {initials}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeStyle(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        {user.department_name ? (
                          <span className="text-gray-300 text-sm">{user.department_name}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition-all"
                      >
                        {t('profile.cancel')}
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {isSaving ? t('profile.saving') : t('profile.save')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={enterEditMode}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      {t('profile.edit')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Save Error */}
            {saveError ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{saveError}</p>
              </div>
            ) : null}

            {/* Account Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('profile.account.title')}</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <User className="w-3.5 h-3.5" />
                    {t('profile.account.name')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t('profile.account.name.placeholder')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
                    />
                  ) : (
                    <div className="text-base font-medium text-gray-900">{user.name ?? "—"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Mail className="w-3.5 h-3.5" />
                    {t('profile.account.email')}
                  </label>
                  <div className="text-base font-medium text-gray-900">{user.email}</div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Building2 className="w-3.5 h-3.5" />
                    {t('profile.account.dept')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      placeholder={t('profile.account.dept.placeholder')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
                    />
                  ) : (
                    <div className="text-base font-medium text-gray-900">{user.department_name ?? "—"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Shield className="w-3.5 h-3.5" />
                    {t('profile.account.role')}
                  </label>
                  <div className="text-base font-medium text-gray-900">{getRoleLabel(user.role)}</div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Clock className="w-3.5 h-3.5" />
                    {t('profile.account.created')}
                  </label>
                  <div className="text-base font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: lang !== 'ko',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('profile.org.title')}</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Building2 className="w-3.5 h-3.5" />
                  {t('profile.org.label')}
                  {isEditing && orgRequired && (
                    <span className="text-red-500 font-bold normal-case tracking-normal">* {t('profile.org.required.badge')}</span>
                  )}
                </label>
                {isEditing ? (
                  <select
                    value={editCompanyId}
                    onChange={(e) => {
                      console.log('[ProfileSettings] company selected:', e.target.value);
                      setEditCompanyId(e.target.value);
                    }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all ${
                      orgRequired && !editCompanyId
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-gray-900 focus:ring-gray-900/20"
                    }`}
                  >
                    <option value="">{t('profile.org.none')}</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {(lang === 'en' ? (c.name_en ?? c.name) : c.name) ?? c.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-base font-medium text-gray-900">
                    {(() => { const c = companies.find((c) => c.id === user.company_id); return (lang === 'en' ? (c?.name_en ?? c?.name) : c?.name) ?? user.company_id ?? "—"; })()}
                  </div>
                )}
              </div>
            </div>

            {/* Access Permissions */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('profile.access.title')}</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Shield className="w-3.5 h-3.5" />
                  {t('profile.access.role')}
                </label>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeStyle(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* System Information (Collapsible) */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setSystemInfoExpanded(!systemInfoExpanded)}
                className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">{t('profile.system.title')}</h3>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                    {t('profile.system.readonly')}
                  </span>
                </div>
                {systemInfoExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {systemInfoExpanded ? (
                <div className="px-8 pb-8 pt-4 border-t border-gray-200">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <Key className="w-3.5 h-3.5" />
                        {t('profile.system.memberId')}
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-600">
                        {user.id}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <Key className="w-3.5 h-3.5" />
                        {t('profile.system.companyId')}
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-600">
                        {user.company_id ?? "—"}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {t('profile.system.note')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Info Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{t('profile.info.title')}</p>
                  <p className="text-sm text-gray-600">
                    {t('profile.info.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
