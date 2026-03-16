import {
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

const impactStats = [
  { value: "85%", label: "Faster governance review", detail: "vs. manual process" },
  { value: "73%", label: "Less manual effort", detail: "automated analysis" },
  { value: "6", label: "Governance modules", detail: "end-to-end coverage" },
  { value: "Real-time", label: "Audit trail", detail: "every decision logged" },
];

function ImpactStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#0B0F1A] py-16 px-16">
      <div ref={ref} className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-4 gap-0">
          {impactStats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center px-8 py-8 stat-animate ${visible ? "stat-visible" : ""} ${i < 3 ? "border-r border-white/10" : ""}`}
              style={{ animationDelay: visible ? `${i * 0.12}s` : undefined }}
            >
              <div className="text-4xl font-bold text-white tracking-tight mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <style>{`
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-animate {
          opacity: 0;
          transform: translateY(20px);
        }
        .stat-visible {
          animation: countUp 0.6s ease-out forwards;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-animate {
          opacity: 0;
          animation: heroFadeUp 0.7s ease-out forwards;
        }
      `}</style>

      <section
        style={{
          background: "linear-gradient(to bottom, #ffffff 0%, #F1F2F7 100%)",
        }}
      >
        <div className="min-h-screen flex flex-col justify-center px-16 max-w-[1440px] mx-auto py-24">
          {/* Hero content */}
          <div className="grid grid-cols-2 gap-16 items-center flex-1">
            {/* Left Side */}
            <div className="space-y-8">
              <span className="hero-animate inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ animationDelay: "0.1s" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                AI Decision Governance
              </span>

              <h1
                className="hero-animate font-bold leading-[1.06] text-[#030213] tracking-tight"
                style={{ fontSize: "3.75rem", animationDelay: "0.25s" }}
              >
                Govern every AI
                <br />
                agent decision —
                <br />
                before it executes.
              </h1>

              <p className="hero-animate text-lg text-gray-500 leading-relaxed max-w-lg" style={{ animationDelay: "0.4s" }}>
                Validate AI-generated decisions against policy, risk, and
                approval boundaries — before they reach real-world execution.
              </p>

              <div className="hero-animate pt-3" style={{ animationDelay: "0.55s" }}>
                <button
                  onClick={() => isAuthenticated ? navigate("/workspace") : setShowAuthModal(true)}
                  className="bg-[#030213] text-white rounded-xl px-8 py-4 font-semibold text-sm hover:bg-gray-800 transition-all inline-flex items-center gap-2.5 shadow-lg shadow-gray-900/10"
                >
                  {isAuthenticated ? "Go to Workspace" : "Get Started"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust line */}
              <div className="hero-animate flex items-center gap-6 pt-4" style={{ animationDelay: "0.65s" }}>
                {["Deterministic governance", "Full audit trail", "Approval-ready artifacts"].map((item, i) => (
                  <div key={item} className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-xs text-gray-400 font-medium">{item}</span>
                    </div>
                    {i < 2 && <div className="w-px h-3 bg-gray-200" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="relative hero-animate" style={{ animationDelay: "0.5s" }}>
              {(() => (
                <div className="relative py-4">
                  {/* Console mock — light, refined */}
                  <div
                    className="rounded-2xl overflow-hidden bg-white"
                    style={{
                      boxShadow: "0 32px 64px -16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Minimal top bar */}
                    <div className="h-9 flex items-center justify-between px-5 border-b border-gray-100 bg-gray-50/80">
                      <div className="flex items-center gap-2.5">
                        <div className="flex gap-[3px]">
                          <div className="w-1.5 h-4 bg-gray-800 rounded-sm" />
                          <div className="w-1.5 h-4 bg-gray-600 rounded-sm mt-0.5" />
                          <div className="w-1.5 h-4 bg-gray-400 rounded-sm" />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-800 tracking-wide">Governance Console</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] text-gray-400">
                        <span>Finance</span>
                        <span className="text-gray-300">›</span>
                        <span>Acme Corp</span>
                        <span className="text-gray-300">›</span>
                        <span className="text-emerald-600 font-medium">Complete</span>
                      </div>
                    </div>

                    <div className="flex" style={{ height: 360 }}>
                      {/* Sidebar */}
                      <div className="w-36 border-r border-gray-100 bg-gray-50/50 py-4 flex flex-col">
                        <div className="px-4 mb-2">
                          <div className="text-[8px] font-medium text-gray-400 uppercase tracking-[0.15em]">Decisions</div>
                        </div>
                        <div className="mx-2 px-3 py-2 text-[10px] font-medium flex items-center gap-2 bg-gray-900 text-white rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Decision Console
                        </div>

                        <div className="px-4 mt-5 mb-2">
                          <div className="text-[8px] font-medium text-gray-400 uppercase tracking-[0.15em]">Analysis Tools</div>
                        </div>
                        {["Reasoning Timeline", "Evidence Explorer", "Simulation Lab", "Decision Pack"].map((item) => (
                          <div key={item} className="mx-2 px-3 py-2 text-[10px] text-gray-500 flex items-center gap-2 rounded-lg">
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            {item}
                          </div>
                        ))}

                        <div className="mt-auto mx-4 pt-3 border-t border-gray-100">
                          <div className="text-[7px] text-gray-400 uppercase tracking-wider">Decision ID</div>
                          <div className="text-[8px] font-mono text-gray-500 mt-1">DEC-2024-09-1847</div>
                        </div>
                      </div>

                      {/* Center — Graph */}
                      <div className="flex-1 p-3" style={{ backgroundColor: "#F8F9FB" }}>
                        <div className="bg-white rounded-xl border border-gray-100 h-full flex flex-col overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                          {/* Graph header */}
                          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-semibold text-gray-900">Decision Knowledge Graph</div>
                              <div className="text-[8px] text-gray-400 mt-0.5">Q3 Infrastructure Budget Allocation</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">87% conf.</span>
                              <span className="text-[8px] text-white bg-gray-900 px-2.5 py-1 rounded-md font-medium">Report</span>
                            </div>
                          </div>

                          {/* Graph canvas */}
                          <div
                            className="flex-1 relative flex items-center justify-center"
                            style={{
                              backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
                              backgroundSize: "24px 24px",
                            }}
                          >
                            {/* SVG edges */}
                            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                              <line x1="50%" y1="58" x2="50%" y2="80" stroke="#e2e4e9" strokeWidth="1.5" />
                              <line x1="26%" y1="80" x2="74%" y2="80" stroke="#e2e4e9" strokeWidth="1.5" />
                              <line x1="26%" y1="80" x2="26%" y2="106" stroke="#e2e4e9" strokeWidth="1.5" />
                              <line x1="74%" y1="80" x2="74%" y2="106" stroke="#e2e4e9" strokeWidth="1.5" />
                              <line x1="26%" y1="138" x2="26%" y2="164" stroke="#e2e4e9" strokeWidth="1.5" />
                              <line x1="74%" y1="138" x2="74%" y2="164" stroke="#e2e4e9" strokeWidth="1.5" />
                            </svg>

                            <div className="relative z-10 w-full px-6" style={{ marginTop: -16 }}>
                              {/* Root */}
                              <div className="flex justify-center mb-8">
                                <div
                                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-semibold tracking-wide"
                                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
                                >
                                  Decision
                                </div>
                              </div>

                              {/* Level 2 */}
                              <div className="flex justify-between px-1 mb-8">
                                <div
                                  className="bg-white text-gray-700 border border-gray-150 px-4 py-2 rounded-xl text-[8px] font-medium"
                                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                                >
                                  Budget Policy
                                </div>
                                <div
                                  className="bg-white text-gray-700 border border-gray-150 px-4 py-2 rounded-xl text-[8px] font-medium"
                                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                                >
                                  Strategic Goal G1
                                </div>
                              </div>

                              {/* Level 3 */}
                              <div className="flex justify-between px-1">
                                <div
                                  className="bg-white text-gray-500 border border-gray-100 px-4 py-2 rounded-xl text-[8px] font-medium flex items-center gap-2"
                                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                                >
                                  <div className="w-2 h-2 rounded-full border-2 border-amber-400" />
                                  CFO Approval
                                </div>
                                <div
                                  className="bg-white text-gray-500 border border-gray-100 px-4 py-2 rounded-xl text-[8px] font-medium flex items-center gap-2"
                                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                                >
                                  <div className="w-2 h-2 rounded-full border-2 border-red-400" />
                                  Risk: Overrun
                                </div>
                              </div>
                            </div>

                            <div className="absolute bottom-3 left-5 text-[8px] text-gray-300">
                              4 nodes · 3 edges · 1 conflict
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right — Verdict */}
                      <div className="w-40 p-3 pl-0 flex-shrink-0" style={{ backgroundColor: "#F8F9FB" }}>
                        <div className="bg-white rounded-xl border border-gray-100 h-full p-4 flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div className="text-[8px] font-medium text-gray-400 uppercase tracking-[0.15em] mb-1">Governance</div>
                          <div className="text-[10px] font-semibold text-gray-900 mb-4">Analysis Complete</div>

                          {/* Verdict */}
                          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 mb-4">
                            <div className="text-[7px] text-gray-400 uppercase tracking-wider mb-1.5">Verdict</div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-amber-400" />
                              <div className="text-[9px] font-bold text-gray-800">Review Required</div>
                            </div>
                          </div>

                          {/* Risk */}
                          <div className="mb-4">
                            <div className="text-[7px] text-gray-400 uppercase tracking-wider mb-2">Risk Score</div>
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-300 to-red-400 rounded-full" style={{ width: "82%" }} />
                              </div>
                              <span className="text-[9px] font-bold text-gray-700 tabular-nums">0.82</span>
                            </div>
                          </div>

                          {/* Approvals */}
                          <div className="mt-auto">
                            <div className="text-[7px] text-gray-400 uppercase tracking-wider mb-2.5">Approval Chain</div>
                            <div className="space-y-2.5">
                              {["CFO Review", "Legal Sign-off", "Board Approval"].map((name) => (
                                <div key={name} className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 rounded-md border border-gray-200 bg-gray-50 flex-shrink-0" />
                                  <span className="text-[8px] text-gray-500">{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge — top right */}
                  <div
                    className="absolute -top-2 right-2 bg-white rounded-2xl px-4 py-3 flex items-center gap-2.5 z-20"
                    style={{
                      animation: "heroFloat 3s ease-in-out infinite",
                      boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">Decision Pack Ready</div>
                      <div className="text-[9px] text-gray-400">Auto-generated artifact</div>
                    </div>
                  </div>

                  {/* Floating badge — bottom left */}
                  <div
                    className="absolute -bottom-2 left-2 bg-white rounded-2xl px-4 py-3 flex items-center gap-2.5 z-20"
                    style={{
                      animation: "heroFloat 3.5s ease-in-out 0.8s infinite",
                      boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">85% Faster</div>
                      <div className="text-[9px] text-gray-400">Governance review</div>
                    </div>
                  </div>

                  {/* Floating badge — conflict detected */}
                  <div
                    className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white rounded-2xl px-4 py-3 flex items-center gap-2.5 z-20"
                    style={{
                      animation: "heroFloat 4s ease-in-out 1.5s infinite",
                      boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">Conflict Detected</div>
                      <div className="text-[9px] text-gray-400">Goal–policy contradiction</div>
                    </div>
                  </div>
                </div>
              ))()}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center pb-8 pt-4">
            <button
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
              className="flex flex-col items-center gap-1 text-gray-300 hover:text-gray-500 transition-colors"
              style={{ animation: "bounceDown 2s ease-in-out infinite" }}
            >
              <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Impact Stats — separate section with scroll animation */}
      <ImpactStats />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
