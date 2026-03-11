import { ArrowRight, FileText, Database, Shield, CheckCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export function HowItWorks() {
  const { t } = useLang();

  return (
    <section className="py-24 bg-gray-50" id="how">
      <div className="px-16 max-w-[1440px] mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
          {t('how.title')}
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Flow Diagram */}
        <div className="flex items-start justify-between relative">
          {/* Step 1 */}
          <div className="flex-1 text-center relative z-10">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-gray-900 shadow-lg flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-900" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-400">INPUT</div>
                <h3 className="text-xl font-bold text-gray-900">{t('how.step1.title')}</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  {t('how.step1.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-start justify-center px-8 relative z-0 pt-10">
            <div className="flex items-center gap-2">
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex-1 text-center relative z-10">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg flex items-center justify-center">
                <Database className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-700">PROCESS</div>
                <h3 className="text-xl font-bold text-gray-900">{t('how.step2.title')}</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  {t('how.step2.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="flex items-start justify-center px-8 relative z-0 pt-10">
            <div className="flex items-center gap-2">
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex-1 text-center relative z-10">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-600">VALIDATE</div>
                <h3 className="text-xl font-bold text-gray-900">{t('how.step3.title')}</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  {t('how.step3.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className="flex items-start justify-center px-8 relative z-0 pt-10">
            <div className="flex items-center gap-2">
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex-1 text-center relative z-10">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-500">OUTPUT</div>
                <h3 className="text-xl font-bold text-gray-900">{t('how.step4.title')}</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  {t('how.step4.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Differentiation Cards */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Deterministic
            </div>
            <h4 className="text-2xl font-bold text-gray-900">{t('how.card1.title')}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('how.card1.desc')}
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Explainable
            </div>
            <h4 className="text-2xl font-bold text-gray-900">{t('how.card2.title')}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('how.card2.desc')}
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Audit-Ready
            </div>
            <h4 className="text-2xl font-bold text-gray-900">{t('how.card3.title')}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('how.card3.desc')}
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
