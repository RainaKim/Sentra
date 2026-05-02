import { useRef, useState, useEffect } from "react";
import {
  Bot,
  Cpu,
  Scale,
  Network,
  BarChart3,
  FileCheck,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const inputStep = {
  number: 1,
  icon: Bot,
  title: "AI Agent Decision",
  description: "An AI agent proposes an operational decision.",
};

const dgSteps = [
  {
    number: 2,
    icon: Cpu,
    title: "Structured Extraction",
    description:
      "Entities, intent, constraints, and decision context are extracted from free-form proposals.",
  },
  {
    number: 3,
    icon: Network,
    title: "Graph Reasoning",
    description:
      "The decision is mapped into the governance graph — linking goals, rules, actors, and risks.",
  },
  {
    number: 4,
    icon: Scale,
    title: "Policy Evaluation",
    description:
      "The rule engine checks company policy, approval hierarchy, and regulatory boundaries.",
  },
  {
    number: 5,
    icon: BarChart3,
    title: "Risk + Simulation",
    description:
      "Financial, compliance, and strategic risk is quantified. Safer counterfactuals are generated.",
  },
  {
    number: 6,
    icon: FileCheck,
    title: "Decision Pack",
    description:
      "An approval-ready artifact is produced — with evidence, risk scores, approvals, and reasoning chain.",
  },
];

const verdicts = [
  { icon: CheckCircle2, label: "Approved", color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
  { icon: Clock,         label: "Review Required", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  { icon: XCircle,       label: "Blocked",  color: "#EF4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
];

export function GovernancePipeline() {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-24 px-16">
      <div ref={ref} className="max-w-7xl mx-auto">

        {/* Section header */}
        <div
          className="mb-16 space-y-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-3xl">
            From AI proposal to auditable governance verdict
          </h2>
        </div>

        {/* Row: input step + intercept marker + DG pipeline */}
        <div
          className="flex flex-wrap xl:flex-nowrap items-stretch gap-y-3"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease-out 0.1s",
          }}
        >
          {/* Step 1 — external input */}
          <div className="flex items-stretch min-w-0" style={{ flex: "1 1 0" }}>
            <div
              className="rounded-xl border p-4 flex-1 min-w-0"
              style={{ background: "#F8F9FF", borderColor: "rgba(99,102,241,0.15)" }}
            >
              <div className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center mb-3"
                style={{ background: "#6366F1" }}>
                1
              </div>
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center mb-3"
                style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.2)" }}>
                <Bot className="w-4 h-4" style={{ color: "#6366F1" }} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6366F1" }}>
                External trigger
              </p>
              <h3 className="text-xs font-bold text-gray-900 mb-1.5 leading-tight">
                {inputStep.title}
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {inputStep.description}
              </p>
            </div>
          </div>

          {/* Intercept transition arrow */}
          <div className="hidden xl:flex items-center justify-center w-8 flex-shrink-0">
            <ChevronRight className="w-4 h-4" style={{ color: "#6366F1" }} />
          </div>

          {/* Steps 2–6 — DecisionGovernance pipeline */}
          {dgSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex items-stretch min-w-0"
                style={{
                  flex: "1 1 0",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.5s ease-out ${0.2 + index * 0.1}s`,
                }}
              >
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center mb-3">
                    {step.number}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 mt-3 mb-1.5 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < dgSteps.length - 1 && (
                  <div className="hidden xl:flex items-center justify-center w-5 flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Verdict row */}
        <div
          className="mt-4 flex items-center gap-3"
          style={{
            opacity: visible ? 1 : 0,
            transition: "all 0.5s ease-out 0.75s",
          }}
        >
          <div className="flex-1 h-px bg-gray-100" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-shrink-0">Verdict</p>
          <div className="flex items-center gap-2">
            {verdicts.map(({ icon: Icon, label, color, bg, border }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                <Icon className="w-3 h-3 flex-shrink-0" />
                {label}
              </span>
            ))}
          </div>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

      </div>
    </section>
  );
}
