import { ArrowRight, FileText, Database, Shield, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50" id="how">
      <div className="px-16 max-w-[1440px] mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
          우리 회사의 안전한 의사결정을 위한 기술적 차별점
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
                <h3 className="text-xl font-bold text-gray-900">자유로운 생각의 시작</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  정해진 형식 없이 쓴 기획안, 주고받은 이메일, 거칠게 적은 메모 등 어떤 형태의 아이디어라도 AI가 바로 읽어 들입니다.
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
                <h3 className="text-xl font-bold text-gray-900">데이터 표준화 및 정제</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  중구난방인 텍스트를 AI와 시스템이 분석할 수 있도록 핵심 목표와 리스크 위주로 깔끔하게 정리합니다.
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
                <h3 className="text-xl font-bold text-gray-900">실시간 규정 준수 체크</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  정리된 내용을 바탕으로 회사의 예산 정책, 보안 지침, 업무 규정에 어긋나는 부분이 없는지 꼼꼼하게 따져보고 위험 신호를 보냅니다.
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
                <h3 className="text-xl font-bold text-gray-900">즉시 승인 가능한 보고서 완성</h3>
                <p className="text-xs text-gray-500 max-w-[420px] leading-relaxed">
                  모든 검토를 마친 뒤, 경영진이 고민 없이 3초 만에 보고 판단할 수 있는 완벽한 보고서 형태로 제공합니다.
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
            <h4 className="text-2xl font-bold text-gray-900">결과가 예측 가능한 빈틈없는 통제</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              매번 답이 달라지는 일반 AI와 달리, 우리 시스템은 회사가 정한 규칙(Rule Engine)과 정책(Policy Mapping)에 따라 항상 일관되고 정확한 판단을 내립니다.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Explainable
            </div>
            <h4 className="text-2xl font-bold text-gray-900">속 시원히 공개되는 판단 근거</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              내부를 알 수 없는 '블랙박스' 방식이 아닙니다. AI가 어떤 단계를 거쳐 그런 결론을 내렸는지 모든 추론 경로를 기록하여, 사람이 직접 눈으로 확인할 수 있게 합니다.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-3">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Audit-Ready
            </div>
            <h4 className="text-2xl font-bold text-gray-900">따로 준비할 게 없는 자동 보고 체계</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              결재 순서부터 위험 신호, 상세 점검 기록(Audit Log)까지 모든 것이 자동으로 만들어집니다. 기업의 까다로운 준법 감시(Compliance) 요건을 별도의 노력 없이 즉시 충족합니다.
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}