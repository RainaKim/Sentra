import { useRef, useState, useEffect } from "react";
import {
  X,
  Check,
  FileSpreadsheet,
  Mail,
  Clock,
  Eye,
  AlertTriangle,
  Shield,
  Zap,
  FileCheck,
  BarChart3,
  GitBranch,
} from "lucide-react";

const beforeItems = [
  {
    icon: Clock,
    title: "Manual policy review",
    desc: "Every AI decision hand-checked against scattered policy docs",
  },
  {
    icon: Eye,
    title: "No audit trail",
    desc: "No record of why an AI action was approved or rejected",
  },
  {
    icon: FileSpreadsheet,
    title: "Spreadsheet risk assessment",
    desc: "Risk scored manually in Excel, outdated by the time it's done",
  },
  {
    icon: Mail,
    title: "Email-based approvals",
    desc: "Approval chains buried in inboxes, no status visibility",
  },
  {
    icon: AlertTriangle,
    title: "Post-hoc compliance",
    desc: "Issues caught after execution — fines, rollbacks, fire drills",
  },
  {
    icon: X,
    title: "Zero reasoning transparency",
    desc: "No way to explain how or why an AI made a particular decision",
  },
];

const afterItems = [
  {
    icon: Zap,
    title: "Automated policy evaluation",
    desc: "Every decision validated against all rules in under 5 seconds",
  },
  {
    icon: GitBranch,
    title: "Full decision lineage",
    desc: "Complete trace from AI proposal to governance verdict",
  },
  {
    icon: BarChart3,
    title: "Real-time risk scoring",
    desc: "Multi-dimensional risk computed instantly across every decision",
  },
  {
    icon: Shield,
    title: "One-click approval workflows",
    desc: "Structured approval chains with status tracking and escalation",
  },
  {
    icon: FileCheck,
    title: "Proactive compliance",
    desc: "Policy violations caught before execution — not after",
  },
  {
    icon: Check,
    title: "Complete reasoning transparency",
    desc: "Every step of AI reasoning inspectable and auditable",
  },
];

export function WorkflowSection() {
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
    <section className="py-24 px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            Why Decision Governance AI
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-3xl mx-auto">
            From manual firefighting to automated governance
          </h2>
          <p className="text-base text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
            See how teams operate before and after adopting a structured
            governance layer for AI-driven decisions.
          </p>
        </div>

        {/* Before / After columns */}
        <div ref={ref} className="grid grid-cols-2 gap-6">
          {/* BEFORE */}
          <div
            className="rounded-2xl border border-gray-200 overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease-out",
            }}
          >
            <div className="bg-gray-100 px-6 py-4 flex items-center gap-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700">Before</div>
                <div className="text-[10px] text-gray-400">
                  Without governance layer
                </div>
              </div>
            </div>
            <div className="bg-gray-50 divide-y divide-gray-100">
              {beforeItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 px-6 py-4"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateX(0)" : "translateX(-12px)",
                      transition: `all 0.4s ease-out ${0.1 + i * 0.07}s`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 line-through decoration-gray-300">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AFTER */}
          <div
            className="rounded-2xl border border-gray-900 overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease-out 0.2s",
            }}
          >
            <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">After</div>
                <div className="text-[10px] text-gray-400">
                  With Decision Governance AI
                </div>
              </div>
            </div>
            <div className="bg-white divide-y divide-gray-100">
              {afterItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 px-6 py-4"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateX(0)" : "translateX(12px)",
                      transition: `all 0.4s ease-out ${0.1 + i * 0.07}s`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom stats strip */}
        <div
          className="mt-8 bg-gray-900 rounded-2xl px-8 py-5 flex items-center justify-between"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease-out 0.8s",
          }}
        >
          {[
            { value: "< 5s", label: "Average review time" },
            { value: "100%", label: "Decisions auditable" },
            { value: "0", label: "Manual spreadsheets" },
            { value: "24/7", label: "Policy enforcement" },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className={`flex-1 text-center ${i < arr.length - 1 ? "border-r border-white/10" : ""}`}
            >
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
