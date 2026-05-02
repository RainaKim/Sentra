import { useRef, useState, useEffect } from "react";

const CX = 260;
const CY = 178;
const RADIUS = 145;

// Orchestrator rect half-dimensions
const OW = 55;
const OH = 24;

// Agent pill half-dimensions
const NW = 52;
const NH = 14;

interface Agent {
  name: string;
  parallel: boolean;
  deg: number;
}

const AGENTS: Agent[] = [
  { name: "Policy Extractor",   parallel: true,  deg: -90  },
  { name: "Goal Mapper",        parallel: true,  deg: -45  },
  { name: "Risk Classifier",    parallel: true,  deg: 0    },
  { name: "Org Parser",         parallel: true,  deg: 45   },
  { name: "Compliance Scanner", parallel: true,  deg: 90   },
  { name: "Comms Analyst",      parallel: true,  deg: 135  },
  { name: "Evidence Collector", parallel: false, deg: 180  },
  { name: "Gov. Synthesizer",   parallel: false, deg: -135 },
];

function agentPos(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) };
}

/**
 * Returns the trimmed spoke endpoints so lines run from the
 * orchestrator rect edge → agent pill edge, with no overlap.
 */
function spokePoints(deg: number) {
  const rad = (deg * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);

  // Nearest intersection with orchestrator rect boundary
  const ts: number[] = [];
  if (ux > 0)  ts.push(OW / ux);
  if (ux < 0)  ts.push(-OW / ux);
  if (uy > 0)  ts.push(OH / uy);
  if (uy < 0)  ts.push(-OH / uy);
  const t0 = Math.min(...ts);
  const sx = CX + ux * t0;
  const sy = CY + uy * t0;

  // Agent center
  const ax = CX + RADIUS * ux;
  const ay = CY + RADIUS * uy;

  // Nearest intersection with agent pill boundary (from agent center toward orchestrator)
  const te: number[] = [];
  if (ux > 0)  te.push(NW / ux);
  if (ux < 0)  te.push(-NW / ux);
  if (uy > 0)  te.push(NH / uy);
  if (uy < 0)  te.push(-NH / uy);
  const t1 = Math.min(...te);
  const ex = ax - ux * t1;
  const ey = ay - uy * t1;

  return { sx, sy, ex, ey };
}

export function ScoutSwarmSection() {
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
    <section style={{ background: "#0B0F1A" }} className="py-24 px-16">
      <div ref={ref} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: text ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: "#6366F1" }}
          >
            Onboarding Intelligence
          </p>
          <h2
            className="font-bold tracking-tight mb-4"
            style={{
              fontFamily: "'Space Grotesk', system-ui",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              letterSpacing: "-0.03em",
              color: "#F1F5F9",
            }}
          >
            Eight specialized agents reconstruct your governance structure
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#94A3B8" }}>
            When you connect your organization, a parallel agent pipeline reads your documents, org
            charts, policies, and communications — reverse-constructing the governance vocabulary that
            defines your decision authority. No configuration sprint. No rules workshop.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="8" viewBox="0 0 28 8">
                <line x1="0" y1="4" x2="28" y2="4" stroke="#6366F1" strokeWidth="1.5" />
              </svg>
              <span className="text-xs" style={{ color: "#64748B" }}>Parallel — runs simultaneously</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg width="28" height="8" viewBox="0 0 28 8">
                <line
                  x1="0" y1="4" x2="28" y2="4"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </svg>
              <span className="text-xs" style={{ color: "#64748B" }}>Sequential — depends on prior phase</span>
            </div>
          </div>
        </div>

        {/* ── Right: SVG hub-and-spoke ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.96)",
            transition: "all 0.7s ease-out 0.2s",
          }}
        >
          <svg viewBox="0 0 520 368" className="w-full h-auto">
            <defs>
              <pattern
                id="swarm-grid"
                x="0" y="0" width="28" height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="14" cy="12" r="0.7" fill="rgba(99,102,241,0.15)" />
              </pattern>
              <radialGradient id="center-bloom" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Dot grid */}
            <rect width="520" height="368" fill="url(#swarm-grid)" />

            {/* Soft glow behind orchestrator */}
            <ellipse cx={CX} cy={CY} rx={92} ry={92} fill="url(#center-bloom)" />

            {/* Spokes — trimmed to run between node boundaries, no overlap */}
            {AGENTS.map((agent) => {
              const { sx, sy, ex, ey } = spokePoints(agent.deg);
              return (
                <line
                  key={`spoke-${agent.name}`}
                  x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={agent.parallel ? "#6366F1" : "rgba(255,255,255,0.28)"}
                  strokeWidth={1}
                  strokeDasharray={agent.parallel ? undefined : "5 3"}
                  opacity={agent.parallel ? 0.6 : 0.7}
                />
              );
            })}

            {/* Center orchestrator node — opaque fill to cleanly sit above spokes */}
            <rect x={205} y={154} width={110} height={48} rx={12}
              fill="#141830" stroke="#6366F1" strokeWidth={1.5} />
            <text x={CX} y={172} textAnchor="middle" fill="#A5B4FC"
              fontSize={8} fontWeight={700} letterSpacing="0.12em">
              MULTI-AGENT
            </text>
            <text x={CX} y={185} textAnchor="middle" fill="#A5B4FC"
              fontSize={8} fontWeight={700} letterSpacing="0.12em">
              ORCHESTRATOR
            </text>
            <text x={CX} y={198} textAnchor="middle"
              fill="rgba(255,255,255,0.28)" fontSize={7}>
              8 agents active
            </text>

            {/* Agent node pills — opaque fill so no spoke bleeds through */}
            {AGENTS.map((agent) => {
              const { x, y } = agentPos(agent.deg);
              return (
                <g key={`node-${agent.name}`}>
                  <rect
                    x={x - NW} y={y - NH} width={NW * 2} height={NH * 2} rx={8}
                    fill={agent.parallel ? "#161a35" : "#121520"}
                    stroke={agent.parallel
                      ? "rgba(99,102,241,0.45)"
                      : "rgba(255,255,255,0.18)"}
                    strokeWidth={1}
                  />
                  <text
                    x={x} y={y + 4}
                    textAnchor="middle"
                    fill={agent.parallel ? "#A5B4FC" : "#94A3B8"}
                    fontSize={8.5} fontWeight={500}
                  >
                    {agent.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
