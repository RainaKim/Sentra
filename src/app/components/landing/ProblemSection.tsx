import { useRef, useState, useEffect } from "react";
import { AlertTriangle, FileSearch, Shield, Landmark, HeartPulse, Building2 } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    barColor: "bg-red-400",
    title: "No policy boundary",
    description:
      "AI agents can propose actions faster than human governance processes can review them.",
  },
  {
    icon: FileSearch,
    barColor: "bg-amber-400",
    title: "No decision trace",
    description:
      "Even when an AI decision looks reasonable, teams cannot easily explain why it was made, what rules it triggered, or who must approve it.",
  },
  {
    icon: Shield,
    barColor: "bg-gray-400",
    title: "No safe remediation",
    description:
      "Most systems can flag a problem. Few can propose safer alternatives and quantify how governance outcomes would change.",
  },
];

export function ProblemSection() {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ backgroundColor: "#F1F2F7" }} className="py-24 px-16">
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
            Why AI decisions need governance
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-3xl">
            AI agents can act autonomously. Enterprises still need control.
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-2xl">
            AI agents are starting to make real operational decisions — hiring
            staff, reallocating budget, launching products, processing sensitive
            data, and negotiating workflows across teams. But most organizations
            still lack a system that can validate those decisions before
            execution.
          </p>
        </div>

        {/* Industry use cases */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease-out 0.1s",
          }}
        >
          {[
            {
              icon: Landmark,
              industry: "Financial Services",
              example: "A trading AI proposes a $2.4M infrastructure reallocation. DecisionGovernance validates it against budget policy, CFO approval thresholds, and SOX audit requirements — in under 10 seconds.",
            },
            {
              icon: HeartPulse,
              industry: "Healthcare",
              example: "A clinical AI recommends a protocol change affecting patient care pathways. DecisionGovernance maps it against HIPAA compliance rules and medical governance boundaries before any action is taken.",
            },
            {
              icon: Building2,
              industry: "Enterprise Operations",
              example: "An AI agent proposes a vendor contract renewal. DecisionGovernance checks procurement policy, approval hierarchy, and risk exposure — producing a Decision Pack for the legal and finance review.",
            },
          ].map(({ icon: Icon, industry, example }) => (
            <div
              key={industry}
              className="rounded-xl border border-indigo-100 p-5"
              style={{ background: "#F8F9FF" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: "#6366F1" }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6366F1" }}>
                  {industry}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">{example}</p>
            </div>
          ))}
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-7"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: `all 0.5s ease-out ${0.2 + i * 0.12}s`,
                }}
              >
                <div className={`w-full h-1 rounded-full ${problem.barColor} mb-5`} />
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-4 mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
