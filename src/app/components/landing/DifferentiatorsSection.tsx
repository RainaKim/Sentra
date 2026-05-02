import { useRef, useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Derived from what you already have",
    description:
      "When a regulator asks where your governance rules came from, the answer is your own documents — not a vendor's template. The parallel agent pipeline reverse-constructs your policy structure from what you already own. No configuration sprint. No rules workshop. No consultant.",
    accent: "bg-gray-900",
  },
  {
    number: "02",
    title: "Graph traversal + semantic retrieval",
    description:
      "Standard RAG misses the governance relationships that matter: who has authority over what, under which conditions, and why. Running graph traversal alongside semantic retrieval means every verdict is grounded in both the structure of your policies and the full history of your decisions.",
    accent: "bg-gray-600",
  },
  {
    number: "03",
    title: "Live regulatory context at validation time",
    description:
      "Governance decisions made against last quarter's policy update are compliance liabilities waiting to happen. Every validation runs against real-time regulatory signals — so the risk score your approver sees reflects today's environment, not the last time someone updated a document.",
    accent: "bg-gray-600",
  },
  {
    number: "04",
    title: "Immutable organizational memory",
    description:
      "Every AI decision your organization ever governed is permanently recorded in the knowledge graph. When an auditor, regulator, or board member asks why your AI approved or blocked a decision six months ago, you produce a complete reasoning chain — not a log entry.",
    accent: "bg-gray-900",
  },
];

const comparisonRows = [
  {
    capability: "Policy compliance audit",
    manual: "Weeks of manual review",
    generic: "Not supported",
    dg: "Automated at every decision",
  },
  {
    capability: "Decision explainability",
    manual: "Inconsistent or unavailable",
    generic: "Black-box output",
    dg: "Full reasoning chain, always",
  },
  {
    capability: "Time to governance verdict",
    manual: "Days to weeks",
    generic: "Minutes (no context)",
    dg: "Under 10 seconds",
  },
  {
    capability: "Regulatory framework coverage",
    manual: "Depends on team",
    generic: "None",
    dg: "EU AI Act · SOX · HIPAA · GDPR",
  },
  {
    capability: "Audit trail",
    manual: "Manual documentation",
    generic: "Partial logs",
    dg: "Immutable, from first decision",
  },
  {
    capability: "Data residency",
    manual: "N/A",
    generic: "Vendor cloud only",
    dg: "Private cloud, on-prem, or managed SaaS",
  },
];

export function DifferentiatorsSection() {
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
        <div
          className="mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            What makes this different
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-2xl">
            Built for governance rigor, not just AI convenience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <div
              key={feature.number}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-7"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.5s ease-out ${0.15 + i * 0.1}s`,
              }}
            >
              <div
                className={`w-8 h-0.5 ${feature.accent} rounded-full mb-4`}
              />
              <p className="text-[10px] font-bold text-gray-300 mb-3">
                {feature.number}
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease-out 0.55s",
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-5" style={{ color: "#6366F1" }}>
            How It Compares
          </p>
          <div className="rounded-2xl overflow-hidden border border-slate-200 mt-12">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-900 text-[11px] uppercase tracking-widest">
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-400">Capability</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-400">Manual Process</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-400">Generic AI Tool</th>
                  <th className="px-5 py-3.5 text-left font-bold text-indigo-300">DecisionGovernance AI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.capability} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{row.capability}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{row.manual}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{row.generic}</td>
                    <td className="px-5 py-3.5 text-sm text-indigo-600 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {row.dg}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
