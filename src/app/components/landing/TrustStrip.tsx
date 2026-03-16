import { Cpu, Scale, Network, BarChart3, FileCheck } from "lucide-react";

const items = [
  { label: "Intelligent structured extraction", Icon: Cpu },
  { label: "Deterministic policy engine", Icon: Scale },
  { label: "Ontology-lite reasoning graph", Icon: Network },
  { label: "Quantified risk scoring", Icon: BarChart3 },
  { label: "Approval-ready Decision Packs", Icon: FileCheck },
];

export function TrustStrip() {
  return (
    <section className="bg-white border-y border-gray-200 shadow-sm py-5 px-16">
      <div className="flex items-center justify-center gap-8 max-w-7xl mx-auto">
        {items.map(({ label, Icon }, i) => (
          <div key={label} className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[13px] font-semibold text-gray-800">
                {label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div className="w-px h-8 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
