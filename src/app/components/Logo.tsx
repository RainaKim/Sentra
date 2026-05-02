import { cn } from "./ui/utils";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export default function Logo({ variant = "dark", className }: LogoProps) {
  const wordmarkColor = variant === "dark" ? "#FFFFFF" : "#0B0F1A";
  const markColor = "#6366F1";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/*
        Mark: Two offset rectangles — Tally-style diagonal split.
        Upper block  → upper-right  (governance layer / output)
        Lower block  → lower-left   (data layer / input)
        The dark slash between them = the decision path / flow direction.
        Pure geometry. No decoration. Reads at any size.
      */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Upper block — top-right, wide */}
        <rect x="8" y="0" width="24" height="13" rx="3.5" fill={markColor} />

        {/* Lower block — bottom-left, square */}
        <rect x="0" y="19" width="18" height="13" rx="3.5" fill={markColor} />
      </svg>

      {/*
        Wordmark: Figtree 600 — rounded, modern geometric sans.
        Pairs with the geometric mark and complements Space Grotesk headings
        on the landing page without competing.
        Single compound word, clean two-tone: white body + indigo AI.
        No weight splits, no opacity tricks.
      */}
      <span aria-label="DecisionGovernance AI" style={{ lineHeight: 1 }}>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "'Figtree', 'Space Grotesk', system-ui, sans-serif",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: wordmarkColor,
          }}
        >
          DecisionGovernance
        </span>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "'Figtree', 'Space Grotesk', system-ui, sans-serif",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#6366F1",
          }}
        >
          {" "}AI
        </span>
      </span>
    </div>
  );
}
