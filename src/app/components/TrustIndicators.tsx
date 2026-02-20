import { Network, Settings, GitMerge, ShieldCheck, Package, ListTree } from 'lucide-react';

export function TrustIndicators() {
  const indicators = [
    {
      icon: Network,
      title: '기업 규칙 기반의 의사결정 모델링',
      description: '회사의 목표, 권한, 정책을 관계 중심으로 구조화하여 AI가 이해할 수 있게 만드는 기술입니다.',
    },
    {
      icon: Settings,
      title: '빈틈없는 규칙 점검 엔진',
      description: '결과가 매번 바뀌는 일반 AI와 달리, 정해진 회사 규정에 따라 일관되고 명확한 판단을 내리는 핵심 장치입니다.',
    },
    {
      icon: GitMerge,
      title: '단계별 논리 추론 분석',
      description: '단편적인 판단이 아니라, 여러 단계의 복잡한 인과관계를 꼬리에 꼬리를 물듯 분석하여 결론을 도출합니다.',
    },
    {
      icon: ShieldCheck,
      title: '실시간 규정 위반 차단',
      description: '의사결정이 내려지는 즉시 회사의 정책에 어긋나는 부분이 없는지 실시간으로 감시하고 제어합니다.',
    },
    {
      icon: Package,
      title: '즉시 승인 가능한 보고서',
      description: '검토 결과와 리스크를 한눈에 보여주어, 사람이 바로 확인하고 결재할 수 있는 표준화된 패키지를 제공합니다.',
    },
    {
      icon: ListTree,
      title: '투명한 판단 근거 시각화',
      description: 'AI가 왜 그런 결론을 내렸는지 그 과정과 이유를 누구나 이해할 수 있게 투명하게 보여줍니다.',
    },
  ];

  return (
    <section className="py-20 px-16 max-w-[1440px] mx-auto border-y border-gray-200 bg-gray-50/50">
      <div className="grid grid-cols-2 gap-x-12 gap-y-10 max-w-6xl mx-auto">
        {indicators.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex gap-4 group"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Icon className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}