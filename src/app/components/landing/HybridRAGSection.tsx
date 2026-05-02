import { useRef, useState, useEffect } from "react";

// ── Graph RAG: node positions (viewBox 0 0 320 220) ──────────────────
const G_NODES = [
  { id: "decision",   label: "Decision",        cx: 160, cy: 110, root: true },
  { id: "budget",     label: "Budget Policy",   cx: 72,  cy: 52  },
  { id: "goal",       label: "Strategic Goal",  cx: 248, cy: 52  },
  { id: "risk",       label: "Risk: Overrun",   cx: 72,  cy: 168 },
  { id: "compliance", label: "Compliance Rule", cx: 248, cy: 168 },
];

const G_EDGES = [
  { from: "decision", to: "budget",     highlight: true,  conflict: false },
  { from: "decision", to: "goal",       highlight: false, conflict: false },
  { from: "budget",   to: "risk",       highlight: true,  conflict: false },
  { from: "decision", to: "compliance", highlight: false, conflict: false },
  { from: "goal",     to: "compliance", highlight: false, conflict: true  },
];

function gNode(id: string) {
  return G_NODES.find((n) => n.id === id)!;
}

// ── Vector RAG: dot positions (viewBox 0 0 320 220) ──────────────────
const RETRIEVED_DOTS = [
  { x: 156, y: 100, r: 6   },
  { x: 174, y: 91,  r: 5.5 },
  { x: 160, y: 118, r: 6   },
  { x: 178, y: 115, r: 5   },
  { x: 146, y: 120, r: 5.5 },
  { x: 183, y: 102, r: 5   },
  { x: 167, y: 132, r: 4.5 },
];

const BG_DOTS = [
  { x: 30,  y: 38,  r: 3   },
  { x: 62,  y: 20,  r: 2.5 },
  { x: 100, y: 42,  r: 3.5 },
  { x: 245, y: 30,  r: 3   },
  { x: 282, y: 52,  r: 3.5 },
  { x: 295, y: 22,  r: 2.5 },
  { x: 298, y: 168, r: 3   },
  { x: 270, y: 185, r: 3.5 },
  { x: 205, y: 194, r: 3   },
  { x: 92,  y: 188, r: 3.5 },
  { x: 42,  y: 175, r: 3   },
  { x: 18,  y: 140, r: 3.5 },
  { x: 22,  y: 86,  r: 2.5 },
  { x: 78,  y: 64,  r: 3   },
  { x: 222, y: 70,  r: 2.5 },
  { x: 250, y: 145, r: 3   },
  { x: 118, y: 58,  r: 2.5 },
  { x: 48,  y: 130, r: 2   },
  { x: 200, y: 160, r: 2.5 },
  { x: 130, y: 175, r: 2   },
];

export function HybridRAGSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 md:px-16" style={{ backgroundColor: "#fff" }}>
      <div ref={ref} className="max-w-7xl mx-auto">

        {/* ── Section header ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14 items-end"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "#6366F1" }}>
              Dual Retrieval Engine
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
              Hybrid RAG — two retrieval modes,<br className="hidden md:block" /> one reasoning pass
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
            Every governance check runs two retrieval modes simultaneously: structured
            graph traversal for typed policy relationships, and high-dimensional semantic
            search over your full decision history. Both outputs are merged into a single
            reasoning context before the validation verdict is produced.
          </p>
        </div>

        {/* ── Visualization card ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s",
          }}
        >
          {/* Outer card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Panel row */}
            <div className="grid grid-cols-[1fr_auto_1fr]" style={{ minHeight: 300 }}>

              {/* ── LEFT: Graph Retrieval ── */}
              <div className="flex flex-col p-6" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Panel header */}
                <div className="flex items-center gap-2.5 mb-5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6366F1" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#6366F1" }}>
                    Graph Retrieval
                  </span>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    Cypher traversal
                  </span>
                </div>

                {/* Graph SVG */}
                <div className="flex-1 relative">
                  <svg
                    viewBox="0 0 320 220"
                    className="w-full h-full"
                    style={{ maxHeight: 240 }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <pattern id="rag-grid" x="0" y="0" width="24" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="12" cy="10" r="0.7" fill="rgba(99,102,241,0.12)" />
                      </pattern>
                      <marker id="arrow-indigo" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#6366F1" opacity="0.6" />
                      </marker>
                      <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#EF4444" opacity="0.6" />
                      </marker>
                      <filter id="glow-indigo" x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>

                    <rect width="320" height="220" fill="url(#rag-grid)" />

                    {/* Traversal path pill */}
                    <rect x={5} y={5} width={100} height={16} rx={5}
                      fill="rgba(99,102,241,0.10)" stroke="rgba(99,102,241,0.25)" strokeWidth={0.8} />
                    <text x={12} y={16} fill="#818CF8" fontSize={8} fontWeight={600} letterSpacing="0.03em">
                      traversal path →
                    </text>

                    {/* Edges */}
                    {G_EDGES.map((e) => {
                      const from = gNode(e.from);
                      const to   = gNode(e.to);
                      return (
                        <line
                          key={`${e.from}-${e.to}`}
                          x1={from.cx} y1={from.cy}
                          x2={to.cx}   y2={to.cy}
                          stroke={e.conflict ? "#EF4444" : e.highlight ? "#6366F1" : "rgba(255,255,255,0.1)"}
                          strokeWidth={e.highlight || e.conflict ? 1.5 : 1}
                          strokeDasharray={e.conflict ? "5 3" : undefined}
                          opacity={e.conflict ? 0.65 : 1}
                          markerEnd={e.highlight ? "url(#arrow-indigo)" : e.conflict ? "url(#arrow-red)" : undefined}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {G_NODES.map((n) => {
                      if (n.root) {
                        return (
                          <g key={n.id} filter="url(#glow-indigo)">
                            <circle cx={n.cx} cy={n.cy} r={30}
                              fill="rgba(99,102,241,0.18)" stroke="#6366F1" strokeWidth={1.5} />
                            <text x={n.cx} y={n.cy + 4}
                              textAnchor="middle" fill="#A5B4FC"
                              fontSize={9.5} fontWeight={700} letterSpacing="0.06em">
                              {n.label}
                            </text>
                          </g>
                        );
                      }
                      const w = 92; const h = 24;
                      return (
                        <g key={n.id}>
                          <rect x={n.cx - w / 2} y={n.cy - h / 2} width={w} height={h} rx={7}
                            fill="#151D2E" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
                          <text x={n.cx} y={n.cy + 4.5}
                            textAnchor="middle" fill="#94A3B8"
                            fontSize={8.5} fontWeight={500}>
                            {n.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* ── CENTER: Merge point ── */}
              <div
                className="flex flex-col items-center justify-center px-3 gap-3"
                style={{ minWidth: 96 }}
              >
                {/* top arrow */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, rgba(99,102,241,0.4))" }} />
                </div>

                {/* Merge chip */}
                <div
                  className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                    boxShadow: "0 0 32px rgba(99,102,241,0.5), 0 4px 16px rgba(0,0,0,0.4)",
                    minWidth: 72,
                  }}
                >
                  {/* mini arrows pointing in */}
                  <div className="flex items-center gap-1 w-full justify-center mb-1">
                    <div className="w-4 h-px" style={{ background: "rgba(255,255,255,0.5)" }} />
                    <div className="w-0 h-0" style={{ borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "4px solid rgba(255,255,255,0.7)" }} />
                    <div className="w-0 h-0" style={{ borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderRight: "4px solid rgba(255,255,255,0.7)" }} />
                    <div className="w-4 h-px" style={{ background: "rgba(255,255,255,0.5)" }} />
                  </div>
                  <span className="text-white font-bold text-center leading-tight" style={{ fontSize: 8, letterSpacing: "0.12em" }}>HYBRID</span>
                  <span className="text-white font-bold text-center leading-tight" style={{ fontSize: 8, letterSpacing: "0.12em" }}>CONTEXT</span>
                  {/* mini arrow pointing down */}
                  <div className="flex flex-col items-center mt-1 gap-0.5">
                    <div className="w-0 h-0" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid rgba(255,255,255,0.7)" }} />
                  </div>
                </div>

                {/* bottom arrow */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-8" style={{ background: "linear-gradient(to top, transparent, rgba(99,102,241,0.4))" }} />
                </div>
              </div>

              {/* ── RIGHT: Semantic Retrieval ── */}
              <div className="flex flex-col p-6" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Panel header */}
                <div className="flex items-center gap-2.5 mb-5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#818CF8" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#818CF8" }}>
                    Semantic Retrieval
                  </span>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(99,102,241,0.10)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.18)" }}
                  >
                    high-dim embedding space
                  </span>
                </div>

                {/* Vector SVG */}
                <div className="flex-1 relative">
                  <svg
                    viewBox="0 0 320 220"
                    className="w-full h-full"
                    style={{ maxHeight: 240 }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <radialGradient id="cluster-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                      </radialGradient>
                      <filter id="dot-glow" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>

                    {/* Background dots (unrelated embeddings) */}
                    {BG_DOTS.map((d, i) => (
                      <circle key={`bg-${i}`} cx={d.x} cy={d.y} r={d.r}
                        fill="rgba(148,163,184,0.25)" />
                    ))}

                    {/* Glow behind cluster */}
                    <circle cx={163} cy={108} r={68} fill="url(#cluster-glow)" />

                    {/* Similarity boundary */}
                    <circle cx={163} cy={108} r={58}
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth={1.2}
                      strokeDasharray="6 4"
                      opacity={0.4}
                    />

                    {/* Retrieved dots (nearest neighbors) */}
                    {RETRIEVED_DOTS.map((d, i) => (
                      <circle key={`ret-${i}`} cx={d.x} cy={d.y} r={d.r}
                        fill="#6366F1" opacity={0.8}
                        filter="url(#dot-glow)"
                      />
                    ))}

                    {/* K=7 badge */}
                    <rect x={228} y={7} width={80} height={18} rx={5}
                      fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
                    <text x={268} y={19} textAnchor="middle"
                      fill="#A5B4FC" fontSize={8.5} fontWeight={700}>
                      K = 7 retrieved
                    </text>

                    {/* "similarity radius" label */}
                    <text x={163} y={200} textAnchor="middle"
                      fill="rgba(148,163,184,0.5)" fontSize={8}>
                      similarity radius
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* ── Footer strip ── */}
            <div
              className="grid grid-cols-3 px-6 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Governance relationship graph
              </p>
              <p className="text-[10px] font-semibold text-center" style={{ color: "#818CF8" }}>
                ↑ Merged into one reasoning pass ↑
              </p>
              <p className="text-[10px] text-right" style={{ color: "rgba(148,163,184,0.5)" }}>
                Full decision-history embeddings
              </p>
            </div>
          </div>
        </div>

        {/* ── Closing payoff ── */}
        <p
          className="text-sm leading-relaxed mt-8 max-w-2xl mx-auto text-center"
          style={{
            color: "#64748B",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease-out 0.5s",
          }}
        >
          Because retrieval draws from a structured ontology rather than a flat embedding space,
          the system detects when a proposed action logically contradicts a policy constraint —
          not just when it's semantically unusual. Every governance verdict is backed by specific
          policy evidence: the exact clause, authority assignment, or compliance requirement that applied.
        </p>
      </div>
    </section>
  );
}
