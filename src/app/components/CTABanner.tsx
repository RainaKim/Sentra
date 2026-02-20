import { ArrowRight } from 'lucide-react';

export function CTABanner() {
  return (
    <section className="py-24 px-16 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,120,120,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(80,80,80,0.1),transparent_50%)]"></div>
        
        <div className="relative px-16 py-20 text-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white tracking-tight leading-tight">
              AI 경쟁력은 모델이 아니라<br />
              Governance에서 결정됩니다.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              빠른 AI 의사결정과 조직의 통제를 동시에 확보하세요.<br />
              DecisionGovernance AI로 안전하고 검증된 AI 경영을 시작합니다.
            </p>
          </div>

          <button 
            onClick={() => {
              const element = document.getElementById('governance-framework-selector');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="px-10 py-5 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all hover:shadow-2xl text-lg font-bold inline-flex items-center gap-3"
          >
            지금 Decision Pack 생성
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}