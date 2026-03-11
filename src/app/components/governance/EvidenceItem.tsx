import type { GovernanceEvidenceItem } from '../../../api/types';

const CATEGORY_LABELS_KO: Record<string, string> = {
  policy:       '정책',
  finance:      '재무 문서',
  financial:    '재무 문서',
  org:          '조직 권한',
  organization: '조직 권한',
  authority:    '조직 권한',
  compliance:   '컴플라이언스',
  rule:         '규정',
  budget:       '예산',
  legal:        '법규',
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  policy:       'Policy',
  finance:      'Financial Document',
  financial:    'Financial Document',
  org:          'Org Authority',
  organization: 'Org Authority',
  authority:    'Org Authority',
  compliance:   'Compliance',
  rule:         'Regulation',
  budget:       'Budget',
  legal:        'Legal',
};

function getCategoryLabel(category?: string, lang?: string): string {
  if (!category) return '';
  const key = category.toLowerCase();
  const labels = lang === 'en' ? CATEGORY_LABELS_EN : CATEGORY_LABELS_KO;
  return labels[key] ?? category;
}

interface EvidenceItemProps {
  item: GovernanceEvidenceItem;
  lang?: string;
}

export function EvidenceItem({ item, lang }: EvidenceItemProps) {
  const isEn = lang === 'en';

  const docName = isEn
    ? (item.documentNameEn ?? item.documentNameKo ?? item.titleEn ?? item.titleKo)
    : (item.documentNameKo ?? item.documentNameEn ?? item.titleKo ?? item.titleEn);

  const citation = isEn
    ? (item.citationEn ?? item.citationKo ?? item.summaryEn ?? item.summaryKo)
    : (item.citationKo ?? item.citationEn ?? item.summaryKo ?? item.summaryEn);

  const categoryLabel = getCategoryLabel(item.category, lang);

  if (!docName && !citation) return null;

  return (
    <div className="bg-white rounded border border-gray-200 px-2.5 py-1.5 space-y-0.5">
      {docName && (
        <p className="text-[10px] font-semibold text-gray-700 leading-snug">{docName}</p>
      )}
      {citation && (
        <p className="text-[10px] text-gray-500 leading-relaxed">{citation}</p>
      )}
    </div>
  );
}
