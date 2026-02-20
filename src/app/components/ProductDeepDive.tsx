import { CheckCircle2 } from "lucide-react";

export function ProductDeepDive() {
  const features = [
    "승인 조건 자동 적용 (Approval Chain)",
    "리스크 및 규정 위반 자동 플래그",
    "Audit Log로 근거 추적 가능",
    "사람의 최종 승인 프로세스 지원",
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
                    실시간 규칙 체크 화면
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    회사 정책에 맞는지 확인 중
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold uppercase tracking-wider border border-green-200">작동 중</div>
                </div>
              </div>

              {/* Live Trace Log */}
              <div className="bg-gray-50 rounded p-4 border border-gray-200 space-y-2">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  실시간 점검 기록
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">
                      [정책 엔진]
                    </span>
                    <span className="text-gray-700">
                      이번 결정에 쓸 예산이 충분한지 확인 중...
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pl-4">
                    <span className="text-green-600">✔</span>
                    <span className="text-green-600">
                      예산 규칙(R1) 통과
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <span className="text-gray-500">
                      [AI 분석기]
                    </span>
                    <span className="text-gray-700">
                      회사의 장기 목표(G3)와 충돌하는지 분석 중...
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pl-4">
                    <span className="text-amber-600">⚠</span>
                    <span className="text-amber-600">
                      반대 의견 감지
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <span className="text-gray-500">
                      [결재 안내]
                    </span>
                    <span className="text-gray-700">
                      추가 확인이 필요하여 재무팀장(CFO)에게 승인을 요청합니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Graph + Approval Flow */}
              <div className="bg-gray-50 rounded p-5 border border-gray-200 space-y-4">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  분석 지도
                </div>

                {/* Simple Node Diagram */}
                <div className="flex items-center justify-center gap-2 py-3">
                  <div className="px-2.5 py-1.5 bg-white text-gray-700 rounded text-xs font-medium border border-gray-200 whitespace-nowrap">
                    나의 결정
                  </div>
                  <div className="w-6 h-px bg-gray-300"></div>
                  <div className="px-2.5 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200 whitespace-nowrap">
                    예산 규칙 체크
                  </div>
                  <div className="w-6 h-px bg-gray-300"></div>
                  <div className="px-2.5 py-1.5 bg-white text-gray-700 rounded text-xs font-medium border border-gray-200 whitespace-nowrap">
                    회사 목표와 비교
                  </div>
                  <div className="w-6 h-px bg-amber-400"></div>
                  <div className="px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200 whitespace-nowrap">
                    충돌 확인
                  </div>
                </div>

                {/* Approval Flow */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    현재 결재 순서
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      마케팅 팀장(완료)
                    </div>
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200 whitespace-nowrap">
                      재무팀장 검토(진행 중)
                    </div>
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="px-2.5 py-1.5 bg-white text-gray-500 rounded text-xs font-medium border border-gray-200 whitespace-nowrap">
                      대표이사 승인(대기)
                    </div>
                  </div>
                </div>
              </div>

              {/* Governance Signals */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  안전 신호
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      예산 사용률
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
                      승인 권한
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
                      위험 수준
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-amber-500"></div>
                      </div>
                      <span className="text-sm text-amber-600 font-semibold">
                        낮음
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Performance (moved to bottom) */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  시스템 성능 (성적표)
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      247
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      지금까지 점검한 결정
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      98.2%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      정책 통과율
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      3.2s
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      평균 확인 시간
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
              AI 결정에 조직의<br />통제권을 부여합니다.
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              자동화된 검증 레이어로 AI의 속도와<br />조직의 거버넌스를 동시에 확보하세요.
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