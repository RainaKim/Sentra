import type { GovernanceEvidenceItem } from '../../../api/types';
import { EvidenceItem } from './EvidenceItem';

interface EvidenceListProps {
  evidence: GovernanceEvidenceItem[];
  lang?: string;
}

export function EvidenceList({ evidence, lang }: EvidenceListProps) {
  const seen = new Set<string>();
  const deduped = evidence.filter((item) => {
    if (!item) return false;
    const key = item.id ?? JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length === 0) return null;

  return (
    <div className="mt-1.5 space-y-1.5 pl-2 border-l-2 border-gray-100">
      {deduped.map((item, i) => (
        <EvidenceItem key={item.id ?? i} item={item} lang={lang} />
      ))}
    </div>
  );
}
