import {
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import Logo from "./Logo";

const impactStats = [
  { value: "< 10s", label: "Decision pipeline", detail: "end-to-end latency" },
  { value: "3-layer", label: "Ontology engine", detail: "meta · domain · instance" },
  { value: "8 agents", label: "Parallel pipeline", detail: "multi-agent orchestration" },
  { value: "100%", label: "Decision audit coverage", detail: "every decision, fully traceable" },
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
              <div style={{ width: 24, height: 2, background: "#6366F1", marginBottom: 12, margin: "0 auto 12px auto" }} />
              <div
                className="text-white font-bold tracking-tight mb-2"
                style={{ fontFamily: "'Space Grotesk', system-ui", fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em" }}
              >
                {stat.value}
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: "#64748B" }}>{stat.label}</div>
              <div className="text-xs font-normal" style={{ color: "#334155" }}>{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Hero() {

  return (
    <>
      <section
        className="relative"
        style={{ background: "#0B0F1A" }}
      >
        {/* Radial indigo bloom overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background: "radial-gradient(ellipse 80% 60% at 65% 40%, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative min-h-screen flex flex-col justify-center px-16 max-w-[1440px] mx-auto py-24" style={{ zIndex: 1 }}>
          {/* Hero content — only child in flex column, so justify-center truly centers it */}
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Left Side */}
            <div className="space-y-8">
              <span
                className="hero-animate inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#A5B4FC",
                  animationDelay: "0.1s",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                AI Decision Governance Infrastructure
              </span>

              <h1
                className="hero-animate font-bold leading-[1.04] text-white tracking-tight"
                style={{
                  fontFamily: "'Space Grotesk', system-ui",
                  fontSize: "clamp(2.25rem, 4.5vw, 4rem)",
                  letterSpacing: "-0.03em",
                  animationDelay: "0.25s",
                }}
              >
                Your AI agents propose.
                <br />
                <span style={{ color: "#818CF8" }}>DecisionGovernance</span> validates.
                <br />
                Then it executes.
              </h1>

              <p
                className="hero-animate text-lg leading-relaxed max-w-lg"
                style={{ color: "#94A3B8", animationDelay: "0.4s" }}
              >
                The infrastructure layer that intercepts every AI-proposed decision, validates it
                against your governance rules, and produces an approval-ready Decision Pack —
                before a single action reaches your systems.
              </p>

              <div className="hero-animate pt-3" style={{ animationDelay: "0.55s" }}>
                <div className="flex flex-row items-center gap-3 justify-start pt-3">
                  <a href="mailto:contact@decisiongovernance.ai">
                    <Button
                      size="lg"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8"
                      style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.5)" }}
                    >
                      Request a Demo
                    </Button>
                  </a>
                  <a
                    href="#problem-pipeline"
                    className="text-sm font-medium transition-colors hover:underline underline-offset-4 whitespace-nowrap"
                    style={{ color: "#64748B" }}
                  >
                    See How It Works →
                  </a>
                </div>
              </div>

              {/* Trust line */}
              <div className="hero-animate flex items-center gap-6 pt-4" style={{ animationDelay: "0.65s" }}>
                {["Pre-execution interception", "Full audit trail", "Approval-ready artifacts"].map((item, i) => (
                  <div key={item} className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#6366F1" }} />
                      <span className="text-xs font-medium" style={{ color: "#64748B" }}>{item}</span>
                    </div>
                    {i < 2 && <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.12)" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side — Console mock */}
            <div className="relative hero-animate" style={{ animationDelay: "0.5s" }}>
              {(() => (
                <div className="relative py-4">
                  {/* Console mock — dark theme */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "#0D1117",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
                    }}
                  >
                    {/* Topbar */}
                    <div
                      className="h-9 flex items-center justify-between px-4"
                      style={{ background: "#080C14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <Logo variant="dark" className="scale-[0.8] origin-left" />
                      <div className="flex items-center gap-1.5 text-[8px]" style={{ color: "#475569" }}>
                        <span>Finance</span>
                        <span style={{ color: "#334155" }}>›</span>
                        <span>Acme Corp</span>
                        <span style={{ color: "#334155" }}>›</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span style={{ color: "#34D399" }}>Active</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex" style={{ height: 360 }}>
                      {/* Left Sidebar */}
                      <div
                        className="py-4 flex flex-col flex-shrink-0"
                        style={{
                          width: 140,
                          background: "#080C14",
                          borderRight: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="px-4 mb-2">
                          <div
                            className="text-[8px] font-medium uppercase"
                            style={{ color: "#334155", letterSpacing: "0.15em" }}
                          >
                            Decisions
                          </div>
                        </div>
                        <div
                          className="mx-2 px-3 py-2 text-[10px] font-medium flex items-center gap-2 rounded-lg"
                          style={{
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.2)",
                            color: "#A5B4FC",
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#6366F1" }} />
                          Decision Console
                        </div>

                        <div className="px-4 mt-5 mb-2">
                          <div
                            className="text-[8px] font-medium uppercase"
                            style={{ color: "#334155", letterSpacing: "0.15em" }}
                          >
                            Analysis Tools
                          </div>
                        </div>
                        {["Reasoning Timeline", "Evidence Explorer", "Simulation Lab", "Decision Pack"].map((item) => (
                          <div
                            key={item}
                            className="mx-2 px-3 py-2 text-[10px] flex items-center gap-2 rounded-lg"
                            style={{ color: "#475569" }}
                          >
                            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }} />
                            {item}
                          </div>
                        ))}

                        <div
                          className="mt-auto mx-4 pt-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="uppercase"
                            style={{ fontSize: 7, color: "#334155", letterSpacing: "0.1em" }}
                          >
                            Decision ID
                          </div>
                          <div
                            className="mt-1"
                            style={{ fontSize: 8, color: "#6366F1", fontFamily: "monospace" }}
                          >
                            DEC-2024-09-1847
                          </div>
                        </div>
                      </div>

                      {/* Center — Knowledge Graph */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Graph header — single row, no wrapping */}
                        <div
                          className="px-4 py-2.5 flex items-center justify-between flex-shrink-0 gap-3"
                          style={{
                            background: "#0F1521",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {/* Left: title + subtitle — min-w-0 allows it to shrink */}
                          <div className="min-w-0">
                            <div
                              className="font-semibold truncate"
                              style={{ fontSize: 10, color: "#E2E8F0" }}
                            >
                              Decision Knowledge Graph
                            </div>
                            <div className="truncate" style={{ fontSize: 7, color: "#475569", marginTop: 1 }}>
                              Q3 Infrastructure Budget
                            </div>
                          </div>
                          {/* Right: badges — flex-shrink-0 + whitespace-nowrap keeps them on one line */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {[
                              { label: "3-layer", style: { background: "#1A2035", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" } },
                              { label: "87% conf.", style: { background: "rgba(16,185,129,0.1)", color: "#34D399" } },
                              { label: "Report", style: { background: "#6366F1", color: "white", fontWeight: 600 } },
                            ].map((b) => (
                              <span
                                key={b.label}
                                className="px-1.5 py-0.5 rounded whitespace-nowrap"
                                style={{ fontSize: 7, ...b.style }}
                              >
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Graph canvas — pure SVG so nodes + edges share one coordinate system */}
                        <div className="flex-1 relative overflow-hidden">
                          <svg
                            viewBox="0 0 320 256"
                            className="w-full h-full"
                            style={{ display: "block" }}
                          >
                            <defs>
                              <pattern id="kg-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="0.8" fill="rgba(99,102,241,0.12)" />
                              </pattern>
                            </defs>
                            {/* Background */}
                            <rect width="320" height="256" fill="#080C14" />
                            <rect width="320" height="256" fill="url(#kg-dots)" />

                            {/* ── EDGES — trimmed boundary-to-boundary, no node overlap ── */}
                            {/* META(150,44) → Budget Policy(93,106) */}
                            <line x1="150" y1="44" x2="93"  y2="106" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.5" />
                            {/* META(170,44) → Strategic Goal G1(227,106) */}
                            <line x1="170" y1="44" x2="227" y2="106" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.5" />
                            {/* Budget Policy(84,124) → CFO Approval(80,188) */}
                            <line x1="84"  y1="124" x2="80" y2="188" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                            {/* Strategic Goal G1(236,124) → Risk: Overrun(244,188) */}
                            <line x1="236" y1="124" x2="244" y2="188" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                            {/* Conflict: CFO right-edge(120,197) ↔ Risk left-edge(206,197) */}
                            <line x1="120" y1="197" x2="206" y2="197" stroke="#EF4444" strokeDasharray="3 3" strokeWidth="1.5" strokeOpacity="0.85" />

                            {/* ── META NODE  (center 160, 33) ── */}
                            {/* glow ring */}
                            <rect x="107" y="19" width="106" height="26" rx="8" fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
                            {/* node rect — opaque fill so edges never bleed through */}
                            <rect x="110" y="22" width="100" height="22" rx="6" fill="#151830" stroke="#6366F1" strokeWidth="0.8" />
                            {/* tier label */}
                            <text x="160" y="17" textAnchor="middle" fill="#6366F1" fontSize={6.5} fontWeight={700} letterSpacing="0.14em">META</text>
                            {/* content */}
                            <text x="160" y="36" textAnchor="middle" fill="#A5B4FC" fontSize={7} fontWeight={600} letterSpacing="0.04em">Governance Framework</text>

                            {/* ── DOMAIN: Budget Policy  (center 85, 115) ── */}
                            <rect x="44" y="106" width="82" height="18" rx="5" fill="#1A2035" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                            <text x="85" y="118" textAnchor="middle" fill="#94A3B8" fontSize={6.5} fontWeight={500}>Budget Policy</text>

                            {/* ── DOMAIN: Strategic Goal G1  (center 235, 115) ── */}
                            <rect x="192" y="106" width="86" height="18" rx="5" fill="#1A2035" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                            <text x="235" y="118" textAnchor="middle" fill="#94A3B8" fontSize={6.5} fontWeight={500}>Strategic Goal G1</text>

                            {/* ── INSTANCE: CFO Approval  (center 79, 197) ── */}
                            <rect x="38" y="188" width="82" height="18" rx="5" fill="#1A2035" stroke="rgba(245,158,11,0.3)" strokeWidth="0.8" />
                            <circle cx="51" cy="197" r="2.5" fill="#F59E0B" />
                            <text x="83" y="200" textAnchor="middle" fill="#94A3B8" fontSize={6.5} fontWeight={500}>CFO Approval</text>

                            {/* ── INSTANCE: Risk: Overrun  (center 245, 197) ── */}
                            <rect x="206" y="188" width="82" height="18" rx="5" fill="#1A2035" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8" />
                            <circle cx="219" cy="197" r="2.5" fill="#EF4444" />
                            <text x="253" y="200" textAnchor="middle" fill="#94A3B8" fontSize={6.5} fontWeight={500}>Risk: Overrun</text>

                            {/* ── Bottom status bar ── */}
                            <text x="12" y="246" fill="rgba(255,255,255,0.18)" fontSize={6.5} fontFamily="monospace">5 nodes · 4 edges · 1 conflict</text>
                            <rect x="186" y="236" width="122" height="14" rx="3" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.8" />
                            <circle cx="199" cy="243" r="2" fill="#10B981" />
                            <text x="249" y="247" textAnchor="middle" fill="#34D399" fontSize={6.5} fontWeight={500}>Multi-agent pipeline</text>
                          </svg>
                        </div>
                      </div>

                      {/* Right panel — 3 risk dimensions */}
                      <div
                        className="flex-col flex-shrink-0 p-4"
                        style={{
                          width: 160,
                          background: "#0F1521",
                          borderLeft: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                        }}
                      >
                        <div
                          className="uppercase mb-0.5"
                          style={{ fontSize: 7, color: "#334155", letterSpacing: "0.1em" }}
                        >
                          Governance
                        </div>
                        <div className="font-semibold mb-3" style={{ fontSize: 10, color: "#E2E8F0" }}>
                          Analysis Complete
                        </div>

                        {/* Verdict chip */}
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg mb-4"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            border: "1px solid rgba(245,158,11,0.2)",
                          }}
                        >
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#F59E0B" }} />
                          <span className="font-bold" style={{ fontSize: 9, color: "#FCD34D" }}>
                            Review Required
                          </span>
                        </div>

                        {/* Risk dimensions */}
                        <div className="space-y-3 mb-4">
                          {[
                            { label: "Financial", width: "82%", score: "82", scoreColor: "#FCD34D", gradFrom: "#F59E0B", gradTo: "#EF4444" },
                            { label: "Compliance", width: "44%", score: "44", scoreColor: "#A5B4FC", gradFrom: "#6366F1", gradTo: "#818CF8" },
                            { label: "Strategic", width: "28%", score: "28", scoreColor: "#34D399", gradFrom: "#10B981", gradTo: "#34D399" },
                          ].map((row) => (
                            <div key={row.label}>
                              <div
                                className="uppercase mb-1"
                                style={{ fontSize: 7, color: "#475569", letterSpacing: "0.08em" }}
                              >
                                {row.label}
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex-1 rounded-full overflow-hidden"
                                  style={{ height: 6, background: "#1A2035" }}
                                >
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: row.width,
                                      background: `linear-gradient(to right, ${row.gradFrom}, ${row.gradTo})`,
                                    }}
                                  />
                                </div>
                                <span
                                  className="font-bold tabular-nums"
                                  style={{ fontSize: 10, color: row.scoreColor, minWidth: 16 }}
                                >
                                  {row.score}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Approval chain */}
                        <div className="mt-auto">
                          <div
                            className="uppercase mb-2"
                            style={{ fontSize: 7, color: "#334155", letterSpacing: "0.1em" }}
                          >
                            Approval Chain
                          </div>
                          <div className="space-y-2">
                            {["CFO Review", "Legal Sign-off", "Board Approval"].map((name) => (
                              <div key={name} className="flex items-center gap-2">
                                <div
                                  className="flex-shrink-0"
                                  style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 2,
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: "transparent",
                                  }}
                                />
                                <span style={{ fontSize: 8, color: "#475569" }}>{name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge — Decision Pack Ready */}
                  <div
                    className="absolute -top-2 right-2 rounded-2xl px-4 py-3 flex items-center gap-2.5 z-20"
                    style={{
                      background: "#0F1521",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                      animation: "heroFloat 3s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(16,185,129,0.12)" }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#10B981" }} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold" style={{ color: "#E2E8F0" }}>Decision Pack Ready</div>
                      <div className="text-[9px]" style={{ color: "#475569" }}>Auto-generated artifact</div>
                    </div>
                  </div>

                  {/* Floating badge — Conflict Detected */}
                  <div
                    className="absolute top-1/2 -right-4 -translate-y-1/2 rounded-2xl px-4 py-3 flex items-center gap-2.5 z-20"
                    style={{
                      background: "#0F1521",
                      border: "1px solid rgba(239,68,68,0.2)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                      animation: "heroFloat 4s ease-in-out 1.5s infinite",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.1)" }}
                    >
                      <AlertTriangle className="w-4 h-4" style={{ color: "#EF4444" }} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold" style={{ color: "#F87171" }}>Conflict Detected</div>
                      <div className="text-[9px]" style={{ color: "#475569" }}>Goal–policy contradiction</div>
                    </div>
                  </div>
                </div>
              ))()}
            </div>
          </div>

          {/* Scroll indicator — absolute so it doesn't affect justify-center of the grid */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
              className="flex flex-col items-center gap-1 transition-colors"
              style={{
                color: "rgba(255,255,255,0.25)",
                animation: "bounceDown 2s ease-in-out infinite",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
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

    </>
  );
}
