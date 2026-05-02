import {
  CheckCircle2,
  ShieldCheck,
  Cpu,
  LayoutDashboard,
  FileCheck2,
  FileText,
} from "lucide-react";
import { Link } from "react-router";
import { useRef, useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Footer } from "./Footer";

// ─── Fade-up hook ─────────────────────────────────────────────────────────────

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" } };
}

// ─── Timeline bar data ────────────────────────────────────────────────────────

const timelinePhases = [
  {
    num: "01",
    name: "Policy Ingestion",
    duration: "Day 1 · ~2 hours",
    desc: "Upload policy docs. Scout Swarm extracts governance structure.",
  },
  {
    num: "02",
    name: "Ontology Construction",
    duration: "Day 1–2 · Automated",
    desc: "Governance graph built from your documents automatically.",
  },
  {
    num: "03",
    name: "Governance Validation",
    duration: "Day 2–3 · Collaborative",
    desc: "Test decisions. Tune thresholds and approval chains.",
  },
  {
    num: "04",
    name: "Governed Go-Live",
    duration: "Day 3–4",
    desc: "Console active. AI decisions route through the live pipeline.",
  },
];

// ─── Reusable phase layout (light bg) ────────────────────────────────────────

interface PhaseProps {
  phaseNumber: string;
  name: string;
  duration: string;
  eyebrow: string;
  heading: string;
  leadCopy: string;
  secondCopy?: string;
  bg: string;
  children: React.ReactNode;
  timeNote?: string;
}

function OnboardingPhase({
  phaseNumber,
  name,
  duration,
  eyebrow,
  heading,
  leadCopy,
  secondCopy,
  bg,
  children,
  timeNote,
}: PhaseProps) {
  const fadeUp = useFadeUp();
  return (
    <section style={{ background: bg }} className="py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-16 items-start">
        {/* Left column */}
        <div className="lg:sticky lg:top-24">
          <div className="w-12 h-12 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-bold text-sm">
            {phaseNumber}
          </div>
          <h3
            className="text-xl font-bold text-gray-900 mt-4"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            {name}
          </h3>
          <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            {duration}
          </span>
          <div className="w-px bg-indigo-100 min-h-[48px] mx-auto mt-6 hidden lg:block" />
        </div>

        {/* Right column */}
        <div {...fadeUp}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6366F1] mb-3">
            {eyebrow}
          </p>
          <h2
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            {heading}
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
            {leadCopy}
          </p>
          {secondCopy && (
            <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
              {secondCopy}
            </p>
          )}
          {children}
          {timeNote && (
            <p className="text-[13px] text-slate-500 italic mt-6">{timeNote}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Onboarding() {
  const deliverablesFade = useFadeUp();
  const concernsFade = useFadeUp();
  const faqFade = useFadeUp();

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* ── Section 2: Hero ──────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-20 px-6 text-center"
        style={{
          background: "#0B0F1A",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center mb-6">
            <span
              className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#A5B4FC",
              }}
            >
              IMPLEMENTATION GUIDE · ENTERPRISE
            </span>
          </div>

          {/* H1 */}
          <h1
            className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            From policy documents to governed AI in four structured phases.
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mt-5">
            Your implementation team follows a validated sequence: policy
            ingestion, ontology construction, governance validation, and governed
            go-live — typically complete within four business days. No
            configuration sprints. No black-box setup.
          </p>

          {/* Trust row — B1: four items */}
          <div className="flex flex-wrap gap-6 justify-center mt-8">
            {[
              "No configuration sprints",
              "SOC 2 Type II certified",
              "Data residency controlled by your deployment choice",
              "EU AI Act · SOX · HIPAA · GDPR ready",
              "Dedicated implementation lead",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#6366F1] flex-shrink-0" />
                <span className="text-xs text-slate-400">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="mailto:contact@decisiongovernance.ai?subject=Onboarding%20Call%20Request"
              className="inline-block px-8 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Schedule an Onboarding Call
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 3: Timeline Summary Bar — C3: node-and-line visual ──── */}
      <div style={{ background: "#0D1117", borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Desktop node timeline */}
          <div className="hidden md:block relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px" style={{ background: "rgba(99,102,241,0.25)" }} />
            {/* Nodes */}
            <div className="grid grid-cols-4 relative">
              {timelinePhases.map(({ num, name, duration, desc }) => (
                <div key={num} className="flex flex-col items-center text-center px-4">
                  {/* Node circle */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white relative z-10 mb-4"
                    style={{ background: "#6366F1", border: "3px solid #0D1117", boxShadow: "0 0 0 1px rgba(99,102,241,0.5)" }}>
                    {num}
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{name}</p>
                  <p className="text-[11px] font-medium mb-2" style={{ color: "#6366F1" }}>{duration}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile fallback — 2x2 grid */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {timelinePhases.map(({ num, name, duration }) => (
              <div key={num} className="rounded-lg p-4" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#6366F1" }}>Phase {num}</p>
                <p className="text-sm font-semibold text-white mb-0.5">{name}</p>
                <p className="text-[11px] text-slate-500">{duration}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 4: Phase 1 — Policy Ingestion ────────────────────────── */}
      <OnboardingPhase
        phaseNumber="01"
        name="Policy Ingestion"
        duration="Day 1 · ~2 hours total"
        eyebrow="Phase 01 · Day 1 · ~2 hours total"
        heading="Your governance rules are already written down. We read them."
        leadCopy="Upload the documents your organization already uses: policy manuals, compliance frameworks, org charts, approval hierarchies, board resolutions, risk matrices. You do not write new rules. You do not fill out templates. You provide what exists."
        secondCopy="The Scout Swarm — eight specialized AI agents — processes your documents as soon as they are uploaded. Six agents run in parallel: Policy Extractor, Goal Mapper, Risk Classifier, Org Parser, Compliance Scanner, and Comms Analyst. Two run sequentially once parallel extraction completes: Evidence Collector and Gov. Synthesizer. The result is a structured governance model derived entirely from your own documentation."
        bg="#F8F9FF"
        timeNote="Typical human effort: 60–90 minutes to locate and upload your documents. Scout Swarm extraction completes within 30–60 minutes after upload. Total phase duration: approximately 2 hours."
      >
        {/* What you provide list */}
        <div className="mb-6">
          <p className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
            What you provide
          </p>
          <ul className="space-y-2">
            {[
              "Policy documents (PDF, Word, or plain text)",
              "Org charts or authority matrices",
              "Approval hierarchy documentation",
              "Compliance framework references (SOX, HIPAA, GDPR, EU AI Act, or others)",
              "Any existing escalation or exception-handling procedures",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0" />
                <span className="text-[14px] text-slate-600">{item}</span>
              </li>
            ))}
          </ul>

          {/* B6: Dedicated implementation lead note */}
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Your onboarding is assigned a dedicated implementation lead — a named technical contact available throughout all four phases to coordinate upload sessions, review the Governance Structure Summary with your team, and manage go-live provisioning.
          </p>
        </div>

        {/* Trust callout card — A6: updated text */}
        <div
          className="flex items-center gap-3 mt-6 p-4 rounded-xl"
          style={{
            background: "#F8F9FF",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <ShieldCheck className="w-5 h-5 text-[#6366F1] flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700">
            SOC 2 Type II certified — report available on request · Data residency by deployment
          </span>
        </div>
      </OnboardingPhase>

      {/* ── Section 5: Phase 2 — Ontology Construction ───────────────────── */}
      <OnboardingPhase
        phaseNumber="02"
        name="Ontology Construction"
        duration="Day 1–2 · Automated"
        eyebrow="Phase 02 · Day 1–2 · Automated"
        heading="Your policy structure becomes a live, queryable governance model — without a rules workshop."
        leadCopy="Once the Scout Swarm has extracted structure from your documents, the Ontology Engine constructs the governance graph — every policy rule linked to its owning authority, every approval threshold connected to the decision types it governs, every compliance requirement mapped to the business processes it constrains."
        secondCopy="This phase is fully automated. Your team is not involved. The engine runs, builds the graph, and surfaces a Governance Structure Summary for your review at the end of Day 2."
        bg="#FFFFFF"
      >
        {/* Three output callout cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {[
            {
              label: "Goals and KPIs mapped",
              desc: "Strategic objectives linked to governance owners",
            },
            {
              label: "Policy rules indexed",
              desc: "Every conditional rule stored with source document and authority chain",
            },
            {
              label: "Approval chains reconstructed",
              desc: "Who approves what, under which conditions",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4 border border-indigo-100 bg-indigo-50"
            >
              <p className="text-[13px] font-semibold text-indigo-700 mb-1">
                {card.label}
              </p>
              <p className="text-[12px] text-slate-600">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* C2: Simplified ontology diagram */}
        <div className="mt-6 rounded-xl p-5" style={{ background: "#F8F9FF", border: "1px solid rgba(99,102,241,0.12)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#6366F1" }}>What the Engine Produces</p>
          <div className="space-y-1">
            {[
              { tier: "META", label: "Governance Framework", desc: "SOX · HIPAA · EU AI Act · Board Charter", color: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", text: "#4338CA" },
              { tier: "DOMAIN", label: "Policy & Authority Layer", desc: "Budget thresholds · Approval chains · Risk matrices", color: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.15)", text: "#6366F1" },
              { tier: "INSTANCE", label: "Live Decision Context", desc: "Active agents · Current decisions · Evidence nodes", color: "rgba(99,102,241,0.04)", border: "rgba(99,102,241,0.10)", text: "#818CF8" },
            ].map(({ tier, label, desc, color, border, text }, i) => (
              <div key={tier}>
                <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{ background: color, border: `1px solid ${border}` }}>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: border, color: text }}>{tier}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
                {i < 2 && (
                  <div className="flex flex-col items-center py-1" aria-hidden="true">
                    <div style={{ width: 2, height: 10, background: "rgba(99,102,241,0.25)" }} />
                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                      <path d="M1 1l3 3 3-3" stroke="rgba(99,102,241,0.50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </OnboardingPhase>

      {/* ── Section 6: Phase 3 — Governance Validation ───────────────────── */}
      <OnboardingPhase
        phaseNumber="03"
        name="Governance Validation"
        duration="Day 2–3 · Collaborative"
        eyebrow="Phase 03 · Day 2–3 · Collaborative"
        heading="Surface and correct every misread before the system touches a production decision."
        leadCopy="Submit test decisions — real scenarios from your operations — and watch the validation pipeline process them against the governance graph from Phase 2. Each test decision produces: a verdict (Approved / Review Required / Blocked), a full reasoning chain, risk dimension scores, and a recommended approval chain."
        secondCopy="Your governance lead reviews these outputs and adjusts thresholds, escalation conditions, and policy rule triggers through the console. No code. No configuration files. Your governance and compliance leads handle all tuning through the console interface."
        bg="#F8F9FF"
        timeNote="Typical duration: 4–6 hours across two days. Participants: governance lead plus one SME per policy domain."
      >
        {/* Tuning adjustments list */}
        <div>
          <p className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Tuning adjustments available
          </p>
          <ul className="space-y-2">
            {[
              "Approval threshold calibration (budget decisions above $X require CFO review)",
              "Escalation chain ordering for specific decision categories",
              "Risk score weightings across financial, compliance, and strategic dimensions",
              "Exception handling rules for decisions outside standard policy scope",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0" />
                <span className="text-[14px] text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* C1: Verdict card mockup */}
        <div className="mt-8 rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
          {/* Card header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Test Decision</p>
              <p className="text-sm font-semibold text-gray-900">Approve $2.4M infrastructure reallocation to accelerate Q3 cloud migration</p>
            </div>
            <span className="ml-4 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(245,158,11,0.10)", color: "#D97706", border: "1px solid rgba(245,158,11,0.25)" }}>
              Review Required
            </span>
          </div>
          {/* Risk dimensions */}
          <div className="px-5 py-4" style={{ background: "#FFFFFF" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Risk Dimensions</p>
            <div className="space-y-2">
              {[
                { label: "Financial Risk", score: 72, color: "#EF4444" },
                { label: "Compliance Risk", score: 45, color: "#F59E0B" },
                { label: "Strategic Risk", score: 28, color: "#10B981" },
              ].map(({ label, score, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-32 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "#F3F4F6" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                  </div>
                  <span className="text-xs font-semibold w-6 text-right" style={{ color }}>{score}</span>
                </div>
              ))}
            </div>
            {/* Reasoning chain */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F3F4F6" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Reasoning Chain</p>
              <p className="text-xs text-slate-600 leading-relaxed">Budget threshold exceeded CFO approval limit (§4.2). Escalation to CFO + IT Director required before execution. SOX §302 disclosure triggered.</p>
            </div>
          </div>
        </div>
      </OnboardingPhase>

      {/* ── Section 7: Phase 4 — Governed Go-Live (dark) ─────────────────── */}
      <section className="py-20 px-6" style={{ background: "#0B0F1A" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-16 items-start">
          {/* Left column */}
          <div className="lg:sticky lg:top-24">
            <div className="w-12 h-12 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-bold text-sm">
              04
            </div>
            <h3
              className="text-xl font-bold text-white mt-4"
              style={{ fontFamily: "'Space Grotesk', system-ui" }}
            >
              Governed Go-Live
            </h3>
            <span
              className="inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(99,102,241,0.15)",
                color: "#A5B4FC",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              Day 3–4
            </span>
            <div
              className="w-px min-h-[48px] mx-auto mt-6 hidden lg:block"
              style={{ background: "rgba(99,102,241,0.25)" }}
            />
          </div>

          {/* Right column */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6366F1]">
                Phase 04 · Day 3–4
              </p>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold">
                System Active
              </span>
            </div>

            {/* B4: Updated Phase 4 heading */}
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', system-ui" }}
            >
              Every AI decision your organization makes is now governed, explained, and permanently on record.
            </h2>

            <p className="text-[15px] text-slate-300 leading-relaxed mb-4">
              On Day 3 or 4, the platform transitions from validation mode to
              live governance mode. Your AI agents begin routing decisions
              through the pipeline. Every decision receives a verdict. Every
              verdict is logged. Every reasoning chain is stored in the
              tamper-evident audit record.
            </p>

            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              Your governance team has access to the decision console from day
              one of go-live. Approvers receive notifications when human review
              is required. The Decision Pack is generated automatically for
              every governed decision.
            </p>

            {/* A3: API integration callout */}
            <div className="flex items-start gap-3 mb-8 p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="text-white font-semibold">One-time API integration:</span> Your AI agents are updated to route decision proposals to the governance endpoint. Typically 1–2 engineering hours. Your implementation lead provides the integration spec.
              </p>
            </div>

            {/* Stat callouts */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                {
                  stat: "< 10s",
                  label: "Decision latency",
                  sub: "Typical decision latency (standard decisions, SaaS deployment)",
                  qualifier: "Typical · standard decisions · SaaS deployment",
                },
                {
                  stat: "100%",
                  label: "Audit coverage",
                  sub: "Every decision, from the first hour",
                  qualifier: null,
                },
                {
                  stat: "Day 1",
                  label: "Audit trail start",
                  sub: "Tamper-evident record begins at first live decision",
                  qualifier: null,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-5"
                  style={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p
                    className="text-2xl font-bold text-white mb-1"
                    style={{ fontFamily: "'Space Grotesk', system-ui" }}
                  >
                    {s.stat}
                  </p>
                  <p className="text-[12px] font-semibold text-slate-300 mb-1">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{s.sub}</p>
                  {/* A4: qualifier for < 10s */}
                  {s.qualifier && (
                    <p className="text-[10px] text-slate-600 mt-1">{s.qualifier}</p>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
              Your Phase 3 validation decisions are retained in the audit log.
              Your organization has a governance record before a single
              production decision is made.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 8: Deliverables ───────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#F8F9FF" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1] mb-3">
            DELIVERABLES
          </p>
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            Four days in. Here is what your organization has.
          </h2>

          {/* C5: Upgraded deliverable cards */}
          <div {...deliverablesFade} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            {[
              {
                Icon: Cpu,
                title: "A living governance graph",
                desc: "A structured representation of your policy environment — every rule, authority, threshold, and compliance requirement — derived from your own documents and queryable in real time.",
                isPrimary: false,
              },
              {
                Icon: LayoutDashboard,
                title: "An active governance console",
                desc: "Real-time visibility into every AI decision being proposed, validated, approved, or blocked. Approval workflows triggered automatically.",
                isPrimary: false,
              },
              {
                Icon: FileCheck2,
                title: "A regulator-ready audit record",
                desc: "Every governed decision from day one stored with its full reasoning chain, risk scores, approval chain, and source policy references. Exportable for regulatory submissions.",
                isPrimary: true,
              },
              {
                Icon: FileText,
                title: "Auto-generated Decision Packs",
                desc: "For every significant decision, a Decision Pack is generated — AI proposal, governance verdict, reasoning chain, and recommended next steps.",
                isPrimary: false,
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`bg-white rounded-xl p-7 shadow-sm ${card.isPrimary ? "border border-indigo-200" : "border border-gray-200"}`}
              >
                {/* C5: Larger icon container */}
                {card.isPrimary && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">PRIMARY DELIVERABLE</p>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <card.Icon className="w-5 h-5" style={{ color: "#6366F1" }} />
                </div>
                <h3
                  className="text-base font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Space Grotesk', system-ui" }}
                >
                  {card.title}
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 9: Concerns / Anxiety Neutralizer ────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1] mb-3">
            BEFORE YOU ASK
          </p>
          <h2
            className="text-3xl font-bold text-gray-900 mb-10"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            The concerns enterprise teams raise most often.
          </h2>

          <div {...concernsFade} className="space-y-0">
            {[
              {
                q: "Where does our document data go?",
                a: "Nowhere you have not approved. The platform supports deployment in your private cloud, on your own infrastructure, or as a managed SaaS instance with data residency controls. Your policy documents, decision data, and governance graph do not leave your specified environment.",
              },
              {
                q: "How much does this require from our IT team?",
                a: "Document ingestion requires no systems integration. The only IT involvement during onboarding is confirming your deployment environment. Post-go-live API integration for AI agent routing typically requires one to two engineering hours. A dedicated implementation lead is assigned to your account for the full onboarding period and remains your primary contact through go-live.",
              },
              {
                q: "Will this touch or change our existing systems?",
                a: "No. During onboarding, the platform operates entirely in ingestion and validation mode. Nothing connects to your existing production systems. Your ERP, HRMS, financial, and clinical systems are not modified.",
              },
              {
                q: "Is 'Day 3-4 go live' a realistic claim?",
                a: "For organizations with accessible policy documentation. The most common reason onboarding extends is document retrieval. Organizations with centralized documentation consistently complete in three to four days. We scope your timeline during an initial call before any work begins.",
              },
              {
                q: "What if the system misreads our policy structure?",
                a: "Phase 3 exists specifically to surface this. The Governance Structure Summary at end of Phase 2 shows exactly what the system has inferred. Your governance lead reviews and corrects it before validation testing begins.",
              },
            ].map((item, idx, arr) => (
              <div
                key={item.q}
                className="border-l-2 border-indigo-200 pl-5 py-4"
                style={{
                  borderBottom:
                    idx < arr.length - 1 ? "1px solid #F3F4F6" : "none",
                }}
              >
                <p className="text-base font-semibold text-gray-900 mb-2">
                  {item.q}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 10: FAQ ───────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#F8F9FF" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1] mb-3">
            FREQUENTLY ASKED
          </p>
          <h2
            className="text-3xl font-bold text-gray-900 mb-10"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            Other questions teams ask during evaluation.
          </h2>

          <div {...faqFade}>
            {[
              {
                q: "Do we need to involve our compliance or legal team?",
                a: "We recommend including a compliance or legal lead during Phase 3 validation sessions. Participation is 2–3 hours across two days.",
              },
              {
                q: "What document formats are supported?",
                a: "PDF, Word (.docx), plain text, and structured data exports (CSV, JSON) for org chart data. Scanned documents are supported if OCR-processed.",
              },
              {
                q: "Is there a minimum number of documents required?",
                a: "No minimum. Organizations with fewer, well-structured policy documents often produce cleaner ontologies than those with large volumes of overlapping documentation.",
              },
              {
                q: "What AI agent integrations are supported?",
                a: "Any AI agent or orchestration layer that can make a REST API call. OpenAI, Anthropic, Cohere, and custom LLM deployments are all compatible.",
              },
              {
                q: "Who owns the governance ontology after onboarding?",
                a: "Your organization. The governance graph is derived from your documents and stored in your environment. If you end your contract, you receive a full export of the ontology, decision history, and audit logs.",
              },
              {
                q: "What happens when our policies change?",
                a: "Policy updates trigger an incremental re-ingestion cycle, not a full rebuild. Upload the updated document, the Scout Swarm identifies what changed, and the ontology is updated.",
              },
            ].map((item, idx, arr) => (
              <div
                key={item.q}
                className="py-6"
                style={{
                  borderBottom:
                    idx < arr.length - 1 ? "1px solid #E5E7EB" : "none",
                }}
              >
                <p className="text-base font-semibold text-gray-900 mb-2">
                  {item.q}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 11: CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#0B0F1A" }}>
        <div className="max-w-2xl mx-auto text-center">
          {/* B5: Updated CTA heading */}
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            Your governance implementation starts with a single 30-minute call.
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            A 30-minute call is enough to confirm your timeline, deployment
            environment, and document set. We scope before you commit.
          </p>

          <a
            href="mailto:contact@decisiongovernance.ai?subject=Onboarding%20Call%20Request"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
          >
            Schedule an Onboarding Call
          </a>

          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4 mt-4 block transition-colors"
          >
            Read the platform overview →
          </Link>

          {/* B5: Updated disclaimer */}
          <p className="text-xs text-slate-600 mt-8">
            We scope your timeline, deployment environment, and document set before any commitment. Enterprise contracts are custom scoped to your decision volume and compliance requirements.
          </p>

          <p className="text-xs text-slate-600 mt-3">
            Enterprise inquiries:{" "}
            <a
              href="mailto:contact@decisiongovernance.ai"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              contact@decisiongovernance.ai
            </a>
          </p>
        </div>
      </section>

      {/* ── Section 12: Footer ────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
