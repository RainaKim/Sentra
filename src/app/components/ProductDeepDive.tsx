import { CheckCircle2 } from "lucide-react";
import { useLang } from "../contexts/LangContext";

export function ProductDeepDive() {
  const { t } = useLang();

  const features = [
    t('product.feature1'),
    t('product.feature2'),
    t('product.feature3'),
    t('product.feature4'),
  ];

  return (
    <section
      className="py-24 px-16 max-w-[1440px] mx-auto"
      id="product"
    >
      <div className="grid grid-cols-2 gap-16 items-center">
        {/* Left - Dashboard Mock */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-500/10 blur-3xl -z-10"></div>

          <div className="rounded-lg p-8 shadow-xl border border-gray-200" style={{ backgroundColor: '#F1F2F7' }}>
            <div className="space-y-6 font-mono">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('product.dash.title')}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('product.dash.subtitle')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold uppercase tracking-wider border border-green-200">{t('product.dash.active')}</div>
                </div>
              </div>

              {/* Live Trace Log */}
              <div className="bg-gray-50 rounded p-4 border border-gray-200 space-y-2">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  {t('product.dash.log.title')}
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 whitespace-nowrap flex-shrink-0">
                      {t('product.dash.log.policy.prefix')}
                    </span>
                    <span className="text-gray-700 min-w-0">
                      {t('product.dash.log.policy.msg')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pl-4">
                    <span className="text-green-600 flex-shrink-0">✔</span>
                    <span className="text-green-600">
                      {t('product.dash.log.budget.pass')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <span className="text-gray-500 whitespace-nowrap flex-shrink-0">
                      {t('product.dash.log.ai.prefix')}
                    </span>
                    <span className="text-gray-700 min-w-0">
                      {t('product.dash.log.ai.msg')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pl-4">
                    <span className="text-amber-600 flex-shrink-0">⚠</span>
                    <span className="text-amber-600">
                      {t('product.dash.log.conflict')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <span className="text-gray-500 whitespace-nowrap flex-shrink-0">
                      {t('product.dash.log.approval.prefix')}
                    </span>
                    <span className="text-gray-700 min-w-0">
                      {t('product.dash.log.approval.msg')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Graph + Approval Flow */}
              <div className="bg-gray-50 rounded p-5 border border-gray-200 space-y-4">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {t('product.dash.map.title')}
                </div>

                {/* Simple Node Diagram */}
                <div className="overflow-x-auto py-3">
                  <div className="flex items-center gap-1.5 min-w-max mx-auto" style={{ fontFamily: 'SUIT Variable, Inter, sans-serif' }}>
                    <div className="px-2 py-1.5 bg-white text-gray-700 rounded text-xs font-medium border border-gray-200 whitespace-nowrap">
                      {t('product.dash.map.node1')}
                    </div>
                    <div className="w-4 h-px bg-gray-300 flex-shrink-0"></div>
                    <div className="px-2 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200 whitespace-nowrap">
                      {t('product.dash.map.node2')}
                    </div>
                    <div className="w-4 h-px bg-gray-300 flex-shrink-0"></div>
                    <div className="px-2 py-1.5 bg-white text-gray-700 rounded text-xs font-medium border border-gray-200 whitespace-nowrap">
                      {t('product.dash.map.node3')}
                    </div>
                    <div className="w-4 h-px bg-amber-400 flex-shrink-0"></div>
                    <div className="px-2 py-1.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200 whitespace-nowrap">
                      {t('product.dash.map.node4')}
                    </div>
                  </div>
                </div>

                {/* Approval Flow */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    {t('product.dash.approval.title')}
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex items-center gap-1.5 min-w-max" style={{ fontFamily: 'SUIT Variable, Inter, sans-serif' }}>
                      <div className="flex items-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        {t('product.dash.approver1')}
                      </div>
                      <div className="w-3 h-px bg-gray-300 flex-shrink-0"></div>
                      <div className="px-2 py-1.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200 whitespace-nowrap">
                        {t('product.dash.approver2')}
                      </div>
                      <div className="w-3 h-px bg-gray-300 flex-shrink-0"></div>
                      <div className="px-2 py-1.5 bg-white text-gray-500 rounded text-xs font-medium border border-gray-200 whitespace-nowrap">
                        {t('product.dash.approver3')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Governance Signals */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {t('product.dash.signals.title')}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('product.dash.budget.label')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-green-500"></div>
                      </div>
                      <span className="text-sm text-green-600 font-semibold">
                        75%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('product.dash.auth.label')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-green-500"></div>
                      </div>
                      <span className="text-sm text-green-600 font-semibold">
                        100%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('product.dash.risk.label')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-amber-500"></div>
                      </div>
                      <span className="text-sm text-amber-600 font-semibold">
                        {t('product.dash.risk.value')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Performance (moved to bottom) */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  {t('product.dash.perf.title')}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      247
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {t('product.dash.perf.decisions')}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      98.2%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {t('product.dash.perf.passrate')}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      3.2s
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {t('product.dash.perf.avgtime')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Features */}
        <div className="space-y-8 flex flex-col items-center justify-center h-full text-center">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
              Enterprise-Grade Governance
            </div>
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {t('product.title1')}<br />
              {t('product.title2')}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('product.subtitle1')}<br />
              {t('product.subtitle2')}
            </p>
          </div>

          <div className="space-y-4 pt-4 w-full max-w-md mx-auto">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 group justify-center"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg text-gray-700 font-medium">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
