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
      title: "Ontology-driven Decision Model",
      icon: Database,
      valueStatement:
        "전략 텍스트를 조직의 Decision Graph로 변환합니다. 주체, 목표, 리스크, 자원을 구조화하여 AI가 이해할 수 있는 관계 모델을 생성합니다.",
      points: [
        "Entity & Relationship 자동 추출",
        "Decision Graph 생성",
        "Governance-ready 데이터 구조화",
      ],
    },
    {
      number: "02",
      title: "Deterministic Governance + AI Reasoning",
      icon: Shield,
      valueStatement:
        "조직 규칙과 AI 추론을 결합하여 모든 의사결정을 실행 전에 검증합니다.",
      points: [
        "Policy 기반 Guardrail 실행",
        "Multi-hop Reasoning으로 영향 분석",
        "Goal 간 충돌 자동 탐지",
      ],
      emphasized: true,
    },
    {
      number: "03",
      title: "Audit-ready Decision Pack",
      icon: FileText,
      valueStatement:
        "승인을 위한 Audit-ready Decision Pack을 제공합니다.",
      points: [
        "Approval Chain 자동 구성",
        "Reasoning Trace 포함",
        "감사 대응 가능한 Audit Log 생성",
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
          Bring Control to AI Decision-Making
        </h2>
        <p className="text-xl text-gray-600">
          초기 Strategy부터 Governed Execution까지 — 몇 초면
          충분합니다
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