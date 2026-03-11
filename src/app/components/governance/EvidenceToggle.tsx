import { useLang } from '../../contexts/LangContext';

interface EvidenceToggleProps {
  expanded: boolean;
  onToggle: () => void;
}

export function EvidenceToggle({ expanded, onToggle }: EvidenceToggleProps) {
  const { t } = useLang();
  return (
    <button
      onClick={onToggle}
      className="mt-1.5 text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-0.5 transition-colors"
    >
      {expanded ? t('risk.evidence.hide') : t('risk.evidence.show')}
    </button>
  );
}
