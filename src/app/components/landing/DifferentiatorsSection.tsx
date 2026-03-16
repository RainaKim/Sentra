import { useRef, useState, useEffect } from "react";

const features = [
  {
    number: "01",
    title: "Deterministic policy enforcement",
    description:
      "Rule triggers, risk scores, and approval chains are evaluated by deterministic engines — producing consistent, reproducible governance outcomes every time.",
    accent: "bg-gray-900",
  },
  {
    number: "02",
    title: "End-to-end audit trail",
    description:
      "Every governance outcome is fully traceable — linked to source evidence, policy references, and the decision context that produced it.",
    accent: "bg-gray-600",
  },
  {
    number: "03",
    title: "Automated remediation paths",
    description:
      "When a decision is flagged, the platform generates safer alternatives and re-evaluates them through the same governance pipeline — turning rejections into actionable next steps.",
    accent: "bg-gray-600",
  },
  {
    number: "04",
    title: "Structured decision artifacts",
    description:
      "Stakeholders receive approval-ready Decision Packs — structured governance documents with risk analysis, evidence, and recommended actions they can review, approve, and archive.",
    accent: "bg-gray-900",
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
      </div>
    </section>
  );
}
