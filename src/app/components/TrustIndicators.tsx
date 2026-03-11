import { Network, Settings, GitMerge, ShieldCheck, Package, ListTree } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export function TrustIndicators() {
  const { t } = useLang();

  const indicators = [
    { icon: Network,     titleKey: 'trust.ind.0.title', descKey: 'trust.ind.0.desc' },
    { icon: Settings,    titleKey: 'trust.ind.1.title', descKey: 'trust.ind.1.desc' },
    { icon: GitMerge,    titleKey: 'trust.ind.2.title', descKey: 'trust.ind.2.desc' },
    { icon: ShieldCheck, titleKey: 'trust.ind.3.title', descKey: 'trust.ind.3.desc' },
    { icon: Package,     titleKey: 'trust.ind.4.title', descKey: 'trust.ind.4.desc' },
    { icon: ListTree,    titleKey: 'trust.ind.5.title', descKey: 'trust.ind.5.desc' },
  ];

  return (
    <section className="py-20 px-16 border-y border-gray-200 bg-gray-50/50">
      <div className="grid grid-cols-2 gap-x-16 gap-y-10 max-w-5xl mx-auto">
        {indicators.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex gap-4 group justify-center"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Icon className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
