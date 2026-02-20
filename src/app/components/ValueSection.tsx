import {
  Database,
  Shield,
  FileText,
  ArrowRight,
} from "lucide-react";

export function ValueSection() {
  const phases = [
    {
      number: "01",
      title: "아이디어를 '비즈니스 지도'로 변환",
      icon: Database,
      valueStatement:
        "사용자가 자유롭게 쓴 전략 텍스트를 AI가 읽고, 우리 회사가 이해할 수 있는 디지털 지도로 만듭니다. 단순히 글자를 읽는 게 아니라 누가, 무엇을 위해, 어떤 자원을 써서 리스크를 감수하려 하는지 그 구조를 파악합니다.",
      points: [
        "정보 자동 추출: 기획안에서 핵심 인물과 목표를 자동으로 뽑아냅니다.",
        "의사결정 지도(Graph) 생성: 각 요소가 서로 어떻게 연결되는지 관계를 그립니다.",
        "검토 준비 완료: 회사의 규칙과 비교할 수 있도록 데이터를 정돈합니다.",
      ],
    },
    {
      number: "02",
      title: "회사의 '철칙'으로 깐깐하게 검증",
      icon: Shield,
      valueStatement:
        "작성된 지도를 회사의 업무 규정 및 예산 정책과 대조하여 위험 요소를 찾아냅니다. AI의 똑똑한 추론 능력과 회사의 변하지 않는 규칙(Guardrail)을 결합해 실행 가능 여부를 판단합니다.",
      points: [
        "사고 방지 가드레일: 회사의 정책을 벗어나는 행동을 즉시 찾아내 차단합니다.",
        "꼬리에 꼬리를 무는 분석: 이 결정이 가져올 연쇄적인 파급 효과까지 꼼꼼히 따져봅니다.",
        "목표 충돌 발견: '비용 절감'과 '공격적 채용'처럼 서로 부딪히는 목표가 있는지 자동으로 잡아냅니다.",
      ],
      emphasized: true,
    },
    {
      number: "03",
      title: "'즉시 승인 가능한 보고서' 발행",
      icon: FileText,
      valueStatement:
        "검토가 끝나면 경영진이 3초 만에 보고 판단할 수 있는 최종 결과물을 만듭니다. 법적 책임과 감사까지 고려한 투명한 보고서(Decision Pack)를 제공합니다.",
      points: [
        "결재 라인 자동 구성: 누구에게 승인을 받아야 하는지 결재 순서를 자동으로 짜줍니다.",
        "판단 근거 공개: AI가 왜 이런 결론을 내렸는지 그 이유(추론 경로)를 투명하게 보여줍니다.",
        "증거 기록(Audit Log): 나중에 문제가 생겨도 책임 소재를 확인할 수 있도록 모든 검토 기록을 남깁니다.",
      ],
    },
  ];

  return (
    <section id="value" className="py-24 px-16 max-w-[1440px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16 space-y-5">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          작동 원리
        </div>
        <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
          AI 의사결정, 이렇게 통제합니다
        </h2>
        <p className="text-xl text-gray-600">
          초기 전략 수립부터 안전한 실행까지 — 단 몇 초면 충분합니다
        </p>
      </div>

      {/* Workflow Cards with Connectors */}
      <div className="relative grid grid-cols-3 gap-12">
        {phases.map((phase, index) => (
          <div key={phase.number} className="relative">
            {/* Card */}
            <div
              className={`bg-white rounded-lg p-6 border transition-all hover:-translate-y-1 h-full ${
                phase.emphasized
                  ? "border-gray-900 shadow-xl hover:shadow-2xl"
                  : "border-gray-200 shadow-md hover:shadow-lg"
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      PHASE {phase.number}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        phase.emphasized
                          ? "bg-gray-900"
                          : "bg-gray-800"
                      }`}
                    >
                      <phase.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed border-l-2 border-gray-900 pl-3">
                    {phase.valueStatement}
                  </p>
                </div>

                {/* Capabilities */}
                <div className="space-y-2 pt-1">
                  {phase.points.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2.5 items-start"
                    >
                      <div className="w-1 h-1 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Connector Arrow */}
            {index < phases.length - 1 && (
              <div className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-gray-400 hover:text-gray-900 transition-colors relative left-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}