import { Shield, Cpu, Network } from "lucide-react";

const personas = [
  {
    Icon: Shield,
    heading: "For Compliance & Risk",
    body: "See how Decision Packs satisfy audit requirements and map to your approval chain.",
    cta: "Request a Demo →",
    href: "mailto:contact@decisiongovernance.ai?subject=Compliance Demo",
  },
  {
    Icon: Cpu,
    heading: "For Engineering Teams",
    body: "Review the system architecture, integration surface, and validation pipeline design.",
    cta: "Request a Technical Walkthrough →",
    href: "mailto:contact@decisiongovernance.ai?subject=Technical Walkthrough",
  },
  {
    Icon: Network,
    heading: "For AI Program Leads",
    body: "See how governance integrates with your existing agent stack without rearchitecting.",
    cta: "Book an Integration Call →",
    href: "mailto:contact@decisiongovernance.ai?subject=Integration Call",
  },
];

export function MidPageCTA() {
  return (
    <section style={{ background: "#F1F2F7" }} className="py-24 px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4"
            style={{ fontFamily: "'Inter', sans-serif", color: "#6366F1" }}
          >
            Get Started
          </p>
          <h2
            className="font-bold tracking-tight text-gray-900"
            style={{
              fontFamily: "'Space Grotesk', system-ui",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              letterSpacing: "-0.025em",
            }}
          >
            Find the right conversation for your team
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map(({ Icon, heading, body, cta, href }) => (
            <div
              key={heading}
              className="flex flex-col"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 32,
              }}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center mb-6 flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#EEF2FF",
                }}
              >
                <Icon className="w-5 h-5" style={{ color: "#6366F1" }} />
              </div>

              {/* Heading */}
              <h3
                className="font-semibold text-gray-900 mb-3"
                style={{
                  fontFamily: "'Space Grotesk', system-ui",
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                {heading}
              </h3>

              {/* Body */}
              <p
                className="leading-relaxed mb-6 flex-1"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: "#6B7280",
                }}
              >
                {body}
              </p>

              {/* CTA link */}
              <a
                href={href}
                className="transition-colors hover:underline underline-offset-4"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6366F1",
                }}
              >
                {cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
