import { useRef, useState, useEffect } from "react";
import {
  Database,
  Settings2,
  Rocket,
  FileText,
  MessageSquare,
  Plug,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Database,
    title: "Connect & Ingest",
    subtitle: "We build your governance knowledge base",
    description:
      "We ingest your company documents — policies, org charts, internal communications, approval logs — and a parallel agent pipeline reverse-constructs your governance ontology. You never define rules from scratch.",
    details: [
      { icon: FileText, label: "Policy documents & compliance manuals" },
      { icon: MessageSquare, label: "Internal communications & memos" },
      { icon: Database, label: "Org structure & approval hierarchies" },
    ],
  },
  {
    step: "02",
    icon: Settings2,
    title: "Review & Validate",
    subtitle: "We derived your governance structure — you confirm it",
    description:
      "The parallel agent pipeline returns your governance ontology for review. You validate what was derived from your documents, configure risk thresholds, and connect to your existing workflow tools. Typical review takes hours, not weeks.",
    details: [
      { icon: Plug, label: "Slack, Jira, Notion, internal APIs" },
      { icon: Settings2, label: "Custom governance rules & thresholds" },
      { icon: Database, label: "AI agent platform connectors" },
    ],
  },
  {
    step: "03",
    icon: Rocket,
    title: "Go Live & Monitor",
    subtitle: "AI decisions flow through governance in real-time",
    description:
      "Once live, every AI-generated decision is automatically routed through the governance pipeline. Your team reviews, approves, and builds a complete audit history from day one. We provide ongoing support as your governance needs evolve.",
    details: [
      { icon: Rocket, label: "Real-time decision pipeline activation" },
      { icon: FileText, label: "Audit trail from first decision" },
      { icon: MessageSquare, label: "Dedicated support & iteration" },
    ],
  },
];

export function ProductModules() {
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
    <section className="bg-[#F1F2F7] py-24 px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            Getting Started
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-3xl mx-auto">
            How we set up governance for your organization
          </h2>
          <p className="text-base text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
            We handle the heavy lifting — ingesting your data, configuring your
            rules, and connecting your tools — so your team is governed from day
            one.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="space-y-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="grid grid-cols-[1fr_1.4fr] gap-8 items-start bg-gray-50 rounded-2xl border border-gray-100 p-8"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: `all 0.5s ease-out ${i * 0.15}s`,
                }}
              >
                {/* Left — title area */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Step {s.step}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {s.title}
                      </div>
                    </div>
                  </div>
                  {s.step === "02" && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
                      style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.18)" }}
                    >
                      ⏱ Hours, not weeks
                    </span>
                  )}
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {s.description}
                  </p>
                </div>

                {/* Right — detail cards */}
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {s.subtitle}
                  </div>
                  {s.details.map((d) => {
                    const DIcon = d.icon;
                    return (
                      <div
                        key={d.label}
                        className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-4"
                        style={{
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <DIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
