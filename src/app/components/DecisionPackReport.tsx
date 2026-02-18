import {
  ArrowLeft,
  Download,
  Check,
  Clock,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

interface DecisionPackReportProps {
  onBack: () => void;
}

export function DecisionPackReport({
  onBack,
}: DecisionPackReportProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-start gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Execute Approval
              </button>

              {/* Custom Tooltip */}
              {showTooltip && (
                <div className="absolute top-full mt-2 right-0 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border border-gray-700 z-50">
                  <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
                  Triggers enterprise approval workflow
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Executive Decision Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider rounded border border-amber-200">
                  Board Review Required
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  ref: DP-2024-APAC-B1
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-6">
                2024년 3분기 APAC 시장 인프라 투자 승인 건
              </h1>
            </div>

            {/* Risk Exposure Gauge */}
            <div className="flex flex-col items-center ml-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#F3F4F6"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(62 / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900">
                    62
                  </div>
                  <div className="text-sm text-gray-500">
                    / 100
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Risk Exposure
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  Moderate strategic risk detected
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Issue Date
              </div>
              <div className="text-sm font-semibold text-gray-900">
                2024년 10월 24일
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Department
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Global Strategy TF
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Capital Expenditure
              </div>
              <div className="text-sm font-semibold text-gray-900">
                $2,450,000
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Classification
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Infrastructure / Strategic
              </div>
            </div>
          </div>
        </div>

        {/* Decision Overview + Approval Workflow */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* LEFT - Decision Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
              Decision Overview
            </h2>

            {/* Core Objective */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                Core Objective
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                APAC 지역 내 클라우드 인프라 확장을 통해 시장
                점유율 4.5% 증가 목표.
              </p>
            </div>

            {/* Projected KPIs */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Projected KPIs
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      Latency Reduction
                    </span>
                    <span className="text-xs font-bold text-green-600">
                      -15.4%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      Market Share Expansion
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      +4.5%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accountable Owners */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Accountable Owners
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    박
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">
                      박지훈
                    </div>
                    <div className="text-xs text-gray-500">
                      Strategy
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    E
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">
                      Elena Chen
                    </div>
                    <div className="text-xs text-gray-500">
                      Ops
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Approval Workflow */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
              Approval Workflow
            </h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Role
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Status
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Date
                </div>
              </div>

              {/* CFO - Approved */}
              <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-200 items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    CFO Financial
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                    <Check className="w-3 h-3" />
                    승인됨
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  2024-10-20
                </div>
              </div>

              {/* CTO - Reviewing */}
              <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-200 items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    CTO Technical
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                    <Clock className="w-3 h-3" />
                    검토중
                  </span>
                </div>
                <div className="text-sm text-gray-600">—</div>
              </div>

              {/* Legal - Rejected */}
              <div className="grid grid-cols-3 gap-4 px-4 py-3 items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Legal Compliance
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                    <X className="w-3 h-3" />
                    반려됨
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  2024-10-22
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 italic">
              모든 승인 단계는 조직의 거버넌스 정책에 따라 자동
              기록됩니다.
            </p>
          </div>
        </div>

        {/* Governance Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Governance Analysis
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              Generated by Policy Engine + o1 Reasoner
            </span>
          </div>

          <div className="space-y-4">
            {/* Critical */}
            <div className="flex gap-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide rounded">
                    Critical
                  </span>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">
                  데이터 주권 규정 충돌 가능성: 인도네시아 현지
                  데이터 보관(PDP) 준수 방안 필요
                </p>
              </div>
            </div>

            {/* Moderate */}
            <div className="flex gap-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide rounded">
                    Moderate
                  </span>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">
                  투자비 증가 예상 12% 초과 (연간 $280k 추가
                  운영 비용 발생 가능)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
            Required Actions Before Approval
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p className="text-sm text-gray-900 leading-relaxed pt-1">
                현지 리전(Jakarta Office) 기반 데이터 저장 전략
                수립
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="text-sm text-gray-900 leading-relaxed pt-1">
                3개년 비용 최적화 계획 제출
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="text-sm text-gray-900 leading-relaxed pt-1">
                투자 ROI 분석 보고서 업데이트
              </p>
            </div>
          </div>
        </div>

        {/* Inference Path & Audit Trail */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-gray-900">
              Inference Path & Audit Trail
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              Generated by AI Governance Engine v4.2
            </span>
          </div>

          {/* Timeline */}
          <div className="relative pl-8 space-y-8">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

            {/* Step 01 */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Step 01 — Identification
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  2024-10-24 14:32:18
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                CapEx 인프라 신규 투자 건 자동 식별
              </p>
              <p className="text-xs text-gray-500">
                기반 문서 내 "$2.4M", "Region Expansion" 키워드
                추출
              </p>
            </div>

            {/* Step 02 */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Step 02 — Policy Alignment
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  2024-10-24 14:32:24
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                Global Strategy 2024-Q3 우선순위 적용
              </p>
              <p className="text-xs text-gray-500">
                APAC 리전 확장 필요성 검증 완료
              </p>
            </div>

            {/* Step 03 */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Step 03 — Risk Assessment
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  2024-10-24 14:32:31
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                강화된 거버넌스 워크플로 활성화
              </p>
              <p className="text-xs text-gray-500">
                $2M 초과 투자 → CFO 및 이사회 자동 보고
              </p>
            </div>

            {/* Final indicator */}
            <div className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div className="flex items-start justify-between">
                <div className="text-sm font-bold text-green-600">
                  Decision Pack Generated
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  2024-10-24 14:32:38
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            본 보고서는 AI Governance 시스템에 의해 자동
            생성되었습니다.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            조직의 최종 의사결정은 승인 권한자에게 있습니다.
          </p>
          <p className="text-xs text-gray-400 font-mono tracking-wider">
            CONFIDENTIAL · SENTRA{" "}
          </p>
        </div>
      </div>
    </div>
  );
}