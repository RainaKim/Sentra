import { Network, Settings, GitMerge, ShieldCheck, Package, ListTree } from 'lucide-react';

export function TrustIndicators() {
  const indicators = [
    { icon: Network, label: 'Ontology-Driven Decision Modeling' },
    { icon: Settings, label: 'Deterministic Governance Engine' },
    { icon: GitMerge, label: 'Multi-hop AI Reasoning' },
    { icon: ShieldCheck, label: 'Real-Time Policy Enforcement' },
    { icon: Package, label: 'Audit-Ready Decision Pack' },
    { icon: ListTree, label: 'Explainable Decision Trace' },
  ];

  return (
    <section className="py-20 px-16 max-w-[1440px] mx-auto border-y border-gray-200 bg-gray-50/50">
      <div className="grid grid-cols-3 gap-x-16 gap-y-8 max-w-5xl mx-auto">
        {indicators.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}