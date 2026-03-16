import { useRef, useState, useEffect } from "react";
import {
  Bot,
  Cpu,
  Scale,
  Network,
  BarChart3,
  FileCheck,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Bot,
    title: "AI Agent Decision",
    description: "An AI agent proposes an operational decision.",
  },
  {
    number: 2,
    icon: Cpu,
    title: "Structured Extraction",
    description:
      "The intelligence layer extracts entities, intent, constraints, and decision context from free-form proposals.",
  },
  {
    number: 3,
    icon: Scale,
    title: "Deterministic Policy Evaluation",
    description:
      "The rule engine evaluates company policy, approval hierarchy, and governance boundaries.",
  },
  {
    number: 4,
    icon: Network,
    title: "Ontology-Lite Graph Reasoning",
    description:
      "The decision is mapped into a typed governance graph showing relationships across goals, rules, actors, and risks.",
  },
  {
    number: 5,
    icon: BarChart3,
    title: "Risk + Simulation",
    description:
      "The platform quantifies financial, compliance, and strategic risk, then generates safer counterfactual scenarios.",
  },
  {
    number: 6,
    icon: FileCheck,
    title: "Decision Pack",
    description:
      "The system produces an approval-ready governance artifact with evidence, risk, approvals, and recommended actions.",
  },
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
            From AI proposal to auditable governance artifact
          </h2>
        </div>

        {/* Pipeline steps */}
        <div className="flex flex-wrap xl:flex-nowrap items-stretch gap-y-3 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex items-stretch min-w-0"
                style={{
                  flex: "1 1 0",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.5s ease-out ${0.1 + index * 0.1}s`,
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
                {/* Connecting arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden xl:flex items-center justify-center w-5 flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
