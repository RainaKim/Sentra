import { ArrowRight, FileText, Database, Shield, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="py-24 px-16 max-w-[1440px] mx-auto bg-gray-50" id="how">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
          Why It Matters
        </h2>
        <p className="text-xl text-gray-600">
          엔터프라이즈 거버넌스를 위한 기술적 차별화
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Flow Diagram */}
        <div className="flex items-center justify-between relative">
          {/* Step 1 */}
          <div className="flex-1 text-center relative z-10">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-gray-900 shadow-lg flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-900" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-400">INPUT</div>
                <h3 className="text-xl font-bold text-gray-900">전략 텍스트</h3>
                <p className="text-sm text-gray-600 max-w-[180px]">
                  비정형 문서, 이메일, 메모 등 모든 형태
                </p>
              </div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-center justify-center px-8 relative z-0">
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
                <h3 className="text-xl font-bold text-gray-900">Decision Object</h3>
                <p className="text-sm text-gray-600 max-w-[180px]">
                  구조화된 JSON 데이터로 변환
                </p>
              </div>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="flex items-center justify-center px-8 relative z-0">
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
                <h3 className="text-xl font-bold text-gray-900">Governance Engine</h3>
                <p className="text-sm text-gray-600 max-w-[180px]">
                  규칙 기반 검증 및 플래그 생성
                </p>
              </div>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className="flex items-center justify-center px-8 relative z-0">
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
                <h3 className="text-xl font-bold text-gray-900">Decision Pack</h3>
                <p className="text-sm text-gray-600 max-w-[180px]">
                  승인 가능한 문서 패키지
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
            <h4 className="text-2xl font-bold text-gray-900">Deterministic Governance</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              규칙 기반 검증으로 AI 의사결정을 예측 가능하게 만듭니다.
            </p>
            <p className="text-xs text-gray-500 font-mono">
              Rule Engine + Policy Mapping
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Explainable
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Explainable Reasoning</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              모든 판단은 추론 경로와 함께 기록됩니다. 블랙박스 없이 의사결정을 검증하세요.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Audit-Ready
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Audit-Ready by Default</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              승인 체계, 리스크 플래그, Audit Log까지 자동 생성됩니다. 엔터프라이즈 컴플라이언스를 즉시 충족합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}