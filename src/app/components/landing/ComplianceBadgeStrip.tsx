import { ShieldCheck, Lock } from "lucide-react";

const badges = [
  "SOC 2 Type II",
  "EU AI Act Aligned",
  "GDPR Ready",
  "SOX Audit Trail",
  "HIPAA Compatible",
];

export function ComplianceBadgeStrip() {
  return (
    <div style={{ background: "#F8F9FF", borderBottom: "1px solid #ECEDF5" }} className="py-4 px-16">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">

        {/* Left group: label + divider + badges */}
        <div className="flex items-center gap-5 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap flex-shrink-0">
            Built for Regulated Industries
          </span>
          <div className="w-px h-4 bg-slate-200 flex-shrink-0" />
          <div className="flex items-center gap-4 flex-shrink-0">
            {badges.map((badge) => (
              <span key={badge} className="flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 flex-shrink-0" style={{ color: "#6366F1" }} />
                <span className="text-[11px] font-medium text-slate-600">{badge}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right group: divider + deployment signal */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-px h-4 bg-slate-200" />
          <div
            className="flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.1)" }}
          >
            <Lock className="w-2.5 h-2.5" style={{ color: "#6366F1" }} />
          </div>
          <p className="text-[11px] text-slate-500 whitespace-nowrap">
            <span className="font-semibold text-slate-700">Data stays in your environment</span>
            {" "}— private cloud, on-prem, or managed SaaS
          </p>
        </div>

      </div>
    </div>
  );
}
