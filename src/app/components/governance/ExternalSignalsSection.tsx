import { useState } from 'react';
import type { ExternalSignalItem, ExternalSignals } from '../../../api/types';
import { useLang } from '../../contexts/LangContext';
import { EvidenceToggle } from './EvidenceToggle';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTitle(item: ExternalSignalItem, lang: string): string {
  return (lang === 'en' ? (item.titleEn ?? item.titleKo) : item.titleKo) || '';
}

function getSummary(item: ExternalSignalItem, lang: string): string {
  return (lang === 'en' ? (item.summaryEn ?? item.summaryKo) : item.summaryKo) || '';
}

function getRelevance(item: ExternalSignalItem, lang: string): string | null {
  const v = lang === 'en'
    ? (item.decisionRelevanceEn ?? item.decisionRelevanceKo ?? null)
    : (item.decisionRelevanceKo ?? null);
  return v?.trim() || null;
}

function confidencePct(c: number | null | undefined): string | null {
  if (c == null) return null;
  return `${Math.round(c * 100)}%`;
}

// ---------------------------------------------------------------------------
// Signal row — mirrors DimensionRow layout exactly
// ---------------------------------------------------------------------------

function SignalRow({ item, isFirst }: { item: ExternalSignalItem; isFirst: boolean }) {
  const { lang } = useLang();
  const [showDetail, setShowDetail] = useState(false);

  const title = getTitle(item, lang);
  const summary = getSummary(item, lang);
  const relevance = getRelevance(item, lang);
  const conf = confidencePct(item.confidence);
  const sourceLabel = item.source?.sourceLabel ?? '';
  const hasDetail = !!(summary || relevance);

  return (
    <div>
      {!isFirst && <div className="h-px bg-gray-200" />}
      <div className="px-4 py-3.5 hover:bg-white transition-colors border-l-[3px] border-l-blue-400">
        {/* Always visible: title + chips */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-gray-900 leading-snug">{title}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {conf && (
              <span className="text-[10px] text-gray-400 font-medium">{conf}</span>
            )}
            {sourceLabel && (
              <span className="text-[10px] text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5 font-medium leading-4">
                {sourceLabel}
              </span>
            )}
          </div>
        </div>

        {/* Toggle + expanded detail */}
        {hasDetail && (
          <>
            <EvidenceToggle expanded={showDetail} onToggle={() => setShowDetail((v) => !v)} />
            {showDetail && (
              <div className="mt-1.5 space-y-1.5">
                {summary && (
                  <p className="text-[11px] text-gray-500 leading-relaxed">{summary}</p>
                )}
                {relevance && (
                  <p className="text-[11px] text-blue-600 leading-relaxed">
                    <span className="mr-1 opacity-50">→</span>{relevance}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section — no collapse, renders like other right-panel sections
// ---------------------------------------------------------------------------

interface ExternalSignalsSectionProps {
  signals: ExternalSignals | null | undefined;
}

export function ExternalSignalsSection({ signals }: ExternalSignalsSectionProps) {
  const { t } = useLang();

  const groups: Array<{
    key: 'market' | 'regulatory' | 'operational';
    items: ExternalSignalItem[];
  }> = [
    { key: 'market',      items: signals?.marketSignals      ?? [] },
    { key: 'regulatory',  items: signals?.regulatorySignals  ?? [] },
    { key: 'operational', items: signals?.operationalSignals ?? [] },
  ].filter((g) => g.items.length > 0) as Array<{ key: 'market' | 'regulatory' | 'operational'; items: ExternalSignalItem[] }>;

  const totalCount = groups.reduce((n, g) => n + g.items.length, 0);
  if (totalCount === 0) return null;

  // Flatten all items in order: market → regulatory → operational
  const allItems = groups.flatMap((g) => g.items);

  return (
    <div className="space-y-3">
      {/* Section header — identical to Triggered Governance Rules */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('console.right.signals.title')}
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          {totalCount}{t('console.right.rules.count')}
        </span>
      </div>

      {/* Card — same bg-gray-50 rounded-xl pattern */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        {allItems.map((item, idx) => (
          <SignalRow key={item.id} item={item} isFirst={idx === 0} />
        ))}

        {/* Disclaimer footer */}
        <div className="h-px bg-gray-200" />
        <div className="px-4 py-2.5">
          <p className="text-[10px] text-gray-400 italic leading-relaxed">
            {t('console.right.signals.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
