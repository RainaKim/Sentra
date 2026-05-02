import { useRef, useState, useEffect } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
function PrecisionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="#6366F1" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="2.5" stroke="#6366F1" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1" fill="#6366F1" />
      <path d="M9 1v2.5M9 14.5V17M1 9h2.5M14.5 9H17" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExplainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 5.5h8M2.5 9h6M2.5 12.5h9" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.5 7.5l2 2.5-2 2.5" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke="#6366F1" strokeWidth="1.5" />
      <path d="M6 7.5l2 2 4-4" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12h4" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45" />
    </svg>
  );
}

// ── Feature cards data ────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    Icon: PrecisionIcon,
    title: "Precision Through Structure",
    desc: "Retrieval draws from a typed knowledge graph where every fact — budget thresholds, approval chains, compliance rules — is attached to the governance concept it belongs to.",
    evidence: "Context-aware retrieval",
  },
  {
    Icon: ExplainIcon,
    title: "Explainability at Every Step",
    desc: "Because reasoning follows defined relationships between governance layers, the system can show exactly which policy applied, which authority was invoked, and which facts grounded the answer.",
    evidence: "Full reasoning chain visible",
  },
  {
    Icon: AuditIcon,
    title: "Auditability by Design",
    desc: "The three-layer ontology creates a natural audit trail — capturing who decides what, under which conditions, and with what constraints baked into the model itself.",
    evidence: "Audit-ready by construction",
  },
];

// ── Layer connector between cards ─────────────────────────────────────────────
function LayerConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-1.5 gap-0.5" aria-hidden="true">
      <div style={{ width: 2, height: 14, background: "rgba(99,102,241,0.28)" }} />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1l4 4 4-4" stroke="rgba(99,102,241,0.50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span
        className="rounded px-2 py-0.5"
        style={{
          fontSize: 9,
          background: "rgba(99,102,241,0.08)",
          color: "rgba(99,102,241,0.72)",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Tier chip ─────────────────────────────────────────────────────────────────
function TierChip({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span
      className="rounded px-1.5 py-0.5"
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      {label}
    </span>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function OntologySection() {
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
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fadeUp = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.55s ease-out ${delay}s, transform 0.55s ease-out ${delay}s`,
  });

  return (
    <section
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #EEF0F8 0%, #F4F5FA 40%, #F1F2F7 100%)",
        borderTop: "1px solid rgba(99,102,241,0.10)",
        paddingTop: 96,
        paddingBottom: 112,
        paddingLeft: 64,
        paddingRight: 64,
      }}
    >
      <div ref={ref} className="max-w-7xl mx-auto">

        {/* ── HEADING — full width, above the grid ── */}
        <div className="max-w-2xl mb-14" style={fadeUp(0)}>
          <p
            className="font-bold uppercase"
            style={{ fontSize: 11, color: "#6366F1", letterSpacing: "0.13em", marginBottom: 14 }}
          >
            The Architecture That Makes Contradiction Detection Possible
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', system-ui",
              fontSize: "clamp(1.7rem, 2.6vw, 2.25rem)",
              lineHeight: 1.18,
              color: "#111827",
              letterSpacing: "-0.02em",
              marginBottom: 14,
            }}
          >
            Governance knowledge that knows how decisions connect
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
            Most governance tools retrieve similar documents. DecisionGovernance AI traverses a
            typed knowledge graph — one where policies, approvers, risks, and decision authority
            are encoded as structured relationships. The system detects when a proposed action
            logically contradicts a policy rule, an authority relationship, or a compliance
            constraint. Not a statistical guess. The actual logic of your organization.
          </p>
        </div>

        {/* ── GRID — cards vs diagram, vertically centered ── */}
        <div
          className="grid gap-12 items-center"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div>
            {/* Feature cards */}
            <div className="space-y-4">
              {FEATURE_CARDS.map(({ Icon, title, desc, evidence }, i) => (
                <div
                  key={title}
                  style={{
                    ...fadeUp(0.12 + i * 0.10),
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderRadius: 12,
                    padding: "18px 20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    cursor: "default",
                    transition: "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(99,102,241,0.10)";
                    el.style.transform = "translateY(-2px)";
                    el.style.borderColor = "rgba(99,102,241,0.20)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)";
                    el.style.transform = "translateY(0)";
                    el.style.borderColor = "rgba(0,0,0,0.07)";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "rgba(99,102,241,0.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon />
                  </div>
                  {/* Text */}
                  <div className="min-w-0">
                    <div
                      className="font-semibold"
                      style={{
                        fontFamily: "'Space Grotesk', system-ui",
                        fontSize: 15,
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {title}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7280", marginBottom: 8 }}>
                      {desc}
                    </p>
                    <span style={{ fontSize: 10, fontWeight: 500, color: "#6366F1" }}>
                      {evidence} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — ontology diagram ──────────── */}
          <div style={fadeUp(0.18)}>
            {/* Floating container */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 20px 48px rgba(0,0,0,0.08)",
                padding: 24,
              }}
            >
              {/* ── META card ── */}
              <div
                className="onto-glow relative overflow-hidden rounded-xl"
                style={{
                  background: "#0B0F1A",
                  animation: visible ? "ontoGlow 4s ease-in-out infinite" : "none",
                  backgroundImage:
                    "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{ width: 3, background: "linear-gradient(to bottom, #6366F1, #818CF8)" }}
                />
                <div className="px-5 py-4 pl-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold uppercase"
                        style={{ fontSize: 8, color: "#6366F1", letterSpacing: "0.15em" }}
                      >
                        META
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5"
                        style={{ fontSize: 7, background: "rgba(99,102,241,0.15)", color: "#818CF8" }}
                      >
                        Framework layer
                      </span>
                    </div>
                    <TierChip
                      label="META"
                      color="#A5B4FC"
                      bg="rgba(165,180,252,0.12)"
                      border="rgba(165,180,252,0.22)"
                    />
                  </div>
                  <div
                    className="font-semibold"
                    style={{
                      fontFamily: "'Space Grotesk', system-ui",
                      fontSize: 14,
                      color: "#F9FAFB",
                      marginBottom: 12,
                    }}
                  >
                    Governance Framework
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Decision Authority", "Policy Vault", "Approval Matrix"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: 8,
                          background: "rgba(99,102,241,0.15)",
                          border: "1px solid rgba(99,102,241,0.25)",
                          color: "#A5B4FC",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <LayerConnector label="inherits from" />

              {/* ── DOMAIN card ── */}
              <div
                className="relative overflow-hidden rounded-xl"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(99,102,241,0.18)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(99,102,241,0.06)",
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{ width: 3, background: "linear-gradient(to bottom, #818CF8, #A5B4FC)" }}
                />
                <div className="px-5 py-4 pl-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold uppercase"
                        style={{ fontSize: 8, color: "#818CF8", letterSpacing: "0.15em" }}
                      >
                        DOMAIN
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5"
                        style={{ fontSize: 7, background: "#EEF2FF", color: "#6366F1" }}
                      >
                        Decision layer
                      </span>
                    </div>
                    <TierChip
                      label="DOMAIN"
                      color="#6366F1"
                      bg="rgba(99,102,241,0.08)"
                      border="rgba(99,102,241,0.16)"
                    />
                  </div>
                  <div
                    className="font-semibold text-gray-900"
                    style={{
                      fontFamily: "'Space Grotesk', system-ui",
                      fontSize: 14,
                      marginBottom: 12,
                    }}
                  >
                    Q3 Budget Decision
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Budget Policy", "Strategic Goal G1", "Compliance Rule"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: 8,
                          background: "rgba(99,102,241,0.06)",
                          border: "1px solid rgba(99,102,241,0.14)",
                          color: "#4338CA",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <LayerConnector label="instantiates" />

              {/* ── INSTANCE card ── */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#F8FAFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold uppercase"
                        style={{ fontSize: 8, color: "#94A3B8", letterSpacing: "0.15em" }}
                      >
                        INSTANCE
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5"
                        style={{ fontSize: 7, background: "#F1F5F9", color: "#64748B" }}
                      >
                        Fact layer
                      </span>
                    </div>
                    <TierChip
                      label="INSTANCE"
                      color="#6B7280"
                      bg="rgba(107,114,128,0.08)"
                      border="rgba(107,114,128,0.15)"
                    />
                  </div>
                  <div
                    className="font-semibold text-gray-900"
                    style={{
                      fontFamily: "'Space Grotesk', system-ui",
                      fontSize: 14,
                      marginBottom: 12,
                    }}
                  >
                    Specific Decision Context
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["CFO Approval Req.", "Risk: Budget Overrun", "Q3 Budget $2.4M"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: 8,
                          background: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.10)",
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Caption */}
              <p className="text-center mt-5" style={{ fontSize: 10, color: "#9CA3AF" }}>
                Typed governance hierarchy · Traversable relationship model
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
