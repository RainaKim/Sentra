import { useRef, useState, useEffect } from "react";
import { TrendingUp, Heart, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface IndustryCard {
  title: string;
  desc: string;
  Icon: LucideIcon;
  metrics: string;
}

const industries: IndustryCard[] = [
  {
    title: "Finance & Strategy",
    Icon: TrendingUp,
    desc: "Govern capital allocation, expansion plans, hiring, and policy-sensitive business decisions with deterministic approval chains and full audit trails.",
    metrics: "47 governance rules \u00b7 CFO \u2192 Audit \u2192 CEO",
  },
  {
    title: "Healthcare & Compliance",
    Icon: Heart,
    desc: "Review patient-data decisions, operational approvals, and high-risk policy workflows with regulatory-grade auditability and evidence traceability.",
    metrics: "58 regulatory rules \u00b7 Security \u2192 Legal \u2192 Director",
  },
  {
    title: "Retail & Operations",
    Icon: ShoppingCart,
    desc: "Validate procurement, staffing, demand planning, and expansion decisions against operational and financial constraints in real time.",
    metrics: "35 operational rules \u00b7 Procurement \u2192 Finance \u2192 VP",
  },
];

export function IndustriesSection() {
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
    <section className="bg-white py-24 px-16">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Section header */}
        <div
          className="mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            Where it applies
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Enterprise governance across verticals
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {industries.map(({ title, desc, Icon, metrics }, i) => (
            <div
              key={title}
              className="bg-gray-50 rounded-xl border border-gray-100 p-6"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.5s ease-out ${0.15 + i * 0.12}s`,
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-4 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              <div className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-200">
                {metrics}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
