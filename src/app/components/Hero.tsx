import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../config";
import { getWorkspaceMetrics } from "../../api/client";
import type { WorkspaceMetrics } from "../../api/types";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";

export function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const { t } = useLang();
  const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null);

  useEffect(() => {
    if (!token) return;
    getWorkspaceMetrics(token).then(setMetrics).catch(() => {});
  }, [token]);

  return (
    <>
    <section className="pt-32 pb-24 px-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-2 gap-20 items-start">
        {/* Left Side */}
        <div className="space-y-8 flex flex-col justify-center h-full">
          <div className="space-y-6">
            <h1 className="text-[3.5rem] font-bold leading-[1.15] text-gray-900 tracking-tight">
              {t("hero.headline1")}
              <br />
              {t("hero.headline2")}
              <br />
              {t("hero.headline3")}
            </h1>
            <p className="text-xl leading-relaxed text-gray-600 font-medium max-w-xl whitespace-pre-line">
              {t("hero.subheadline")}
            </p>
          </div>
        </div>

        {/* Right Side - Governance Profile Selector or Active Dashboard */}
        <div className="relative min-w-[600px]">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 via-gray-500/10 to-gray-600/10 blur-3xl -z-10"></div>

          {!isAuthenticated ? (
            /* SSO Login Card */
            <div
              id="governance-framework-selector"
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 space-y-6"
            >
              {/* Header */}
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("auth.card.title")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                  {t("auth.card.subtitle")}
                </p>
              </div>

              {/* SSO Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => { window.location.href = `${API_BASE_URL}/v1/auth/google`; }}
                  className="w-full py-4 px-6 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:shadow-sm"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t("auth.card.google")}
                </button>
              </div>

              {/* SSO Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("auth.card.sso.title")}</p>
                <div className="space-y-2">
                  {[
                    t("auth.card.sso.1"),
                    t("auth.card.sso.2"),
                    t("auth.card.sso.3"),
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Authenticated — Workspace CTA Card */
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 space-y-8">
              {/* Welcome badge */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold text-green-700">
                    {t("hero.ws.status")}
                  </span>
                </div>
              </div>

              {/* User greeting */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto text-white text-xl font-bold">
                  {(user?.name ?? user?.email ?? "?")[0].toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("hero.ws.greeting")}{user?.name ?? user?.email}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("hero.ws.subtitle")}
                </p>
              </div>

              {/* Stats preview */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: t("hero.ws.stat1.label"), value: metrics?.decisions_today ?? "—", color: "text-gray-900" },
                  { label: t("hero.ws.stat2.label"), value: metrics?.pending_count ?? "—", color: "text-amber-600" },
                  { label: t("hero.ws.stat3.label"), value: metrics?.blocked_count ?? "—", color: "text-red-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/workspace")}
                className="w-full py-5 px-6 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t("hero.ws.cta")}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-center text-gray-500">
                {t("hero.ws.microcopy")}
              </p>
            </div>
          )}
        </div>
      </div>

    </section>
    </>
  );
}
