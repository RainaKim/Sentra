import { useState } from "react";
import type {
  RiskScoringPayload,
  RiskDimensionResponse,
  GovernanceEvidence,
  GovernanceEvidenceItem,
} from "../../api/types";

import { useLang } from "../contexts/LangContext";
import { EvidenceList } from "./governance/EvidenceList";
import { EvidenceToggle } from "./governance/EvidenceToggle";

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------

interface RiskScoringPanelProps {
  riskScoring?: RiskScoringPayload | null;
  governanceEvidence?: GovernanceEvidence | null;
  /** Used only to show "계산 중" placeholder during processing */
  status?: string;
}

/** Maps dimension id → governance_evidence key */
const DIMENSION_EVIDENCE_KEY: Record<string, string> = {
  strategic: 'strategyEvidence',
};

function getDimensionEvidence(
  id: string,
  evidence: GovernanceEvidence,
): GovernanceEvidenceItem[] {
  const key = DIMENSION_EVIDENCE_KEY[id] ?? `${id}Evidence`;
  return evidence[key] ?? [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function bandBadgeClasses(band: string): string {
  switch (band) {
    case "CRITICAL": return "bg-red-100 text-red-700";
    case "HIGH":     return "bg-orange-100 text-orange-700";
    case "MEDIUM":   return "bg-amber-100 text-amber-700";
    default:         return "bg-green-100 text-green-700";
  }
}

function scoreTextClass(band: string): string {
  switch (band) {
    case "CRITICAL": return "text-red-600";
    case "HIGH":     return "text-orange-500";
    case "MEDIUM":   return "text-amber-500";
    default:         return "text-green-600";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BandBadge({ band, label }: { band: string; label: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${bandBadgeClasses(band)}`}>
      {label}
    </span>
  );
}

interface DimensionRowProps {
  dimension: RiskDimensionResponse;
  isFirst: boolean;
  evidence: GovernanceEvidenceItem[];
}

function DimensionRow({ dimension, isFirst, evidence }: DimensionRowProps) {
  const { t, lang } = useLang();
  const [showEvidence, setShowEvidence] = useState(false);

  const dimLabelKey = `risk.dim.${dimension.id}`;
  const dimLabel = t(dimLabelKey) !== dimLabelKey
    ? t(dimLabelKey)
    : (lang === 'en' ? (dimension.label_en ?? dimension.label ?? dimension.id) : (dimension.label ?? dimension.id));

  const bandLabelKey = `risk.band.${dimension.band?.toLowerCase()}`;
  const bandLabel = t(bandLabelKey) !== bandLabelKey ? t(bandLabelKey) : dimension.band;

  return (
    <div>
      {!isFirst && <div className="h-px bg-gray-200" />}
      <div className="px-4 py-3.5 hover:bg-white transition-colors border-l-3 border-l-amber-500">
        {/* Dimension header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-900">{dimLabel}</span>
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{dimension.score}/100</span>
            {" · "}
            <span>{bandLabel}</span>
          </span>
        </div>

        {evidence.length > 0 && (
          <>
            <EvidenceToggle expanded={showEvidence} onToggle={() => setShowEvidence((v) => !v)} />
            {showEvidence && <EvidenceList evidence={evidence} lang={lang} />}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function RiskScoringPanel({ riskScoring, governanceEvidence, status }: RiskScoringPanelProps) {
  const { t } = useLang();

  if (!riskScoring) {
    if (status === "processing") {
      return (
        <div className="text-xs text-gray-400 italic py-1">
          {t("risk.calculating")}
        </div>
      );
    }
    return null;
  }

  const { aggregate, dimensions } = riskScoring;

  const aggBandKey = `risk.band.${aggregate.band?.toLowerCase()}`;
  const aggBandLabel = t(aggBandKey) !== aggBandKey ? t(aggBandKey) : aggregate.band;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      {/* Aggregate score card */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">{t("risk.score.title")}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold ${scoreTextClass(aggregate.band)}`}>
            {aggregate.score}/100
          </span>
          <BandBadge band={aggregate.band} label={aggBandLabel} />
        </div>
      </div>

      {/* Dimension rows */}
      {dimensions.length > 0 && dimensions
        .filter((dim) => {
          const items = governanceEvidence
            ? getDimensionEvidence(dim.id, governanceEvidence)
            : (dim.evidence ?? []);
          return items.length > 0;
        })
        .map((dim, idx) => (
          <DimensionRow
            key={dim.id}
            dimension={dim}
            isFirst={idx === 0}
            evidence={governanceEvidence ? getDimensionEvidence(dim.id, governanceEvidence) : (dim.evidence ?? [])}
          />
        ))}
    </div>
  );
}
