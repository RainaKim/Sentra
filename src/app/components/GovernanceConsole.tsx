import {
  AlertTriangle,
  ChevronDown,
  Plus,
  Minus,
  Target,
  DollarSign,
  Database,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DecisionPackReport } from "./DecisionPackReport";

export function GovernanceConsole() {
  const [contextualMapping, setContextualMapping] =
    useState(true);
  const [analysisStep, setAnalysisStep] = useState(0); // 0: loading, 1-3: steps, 4: complete
  const [showReasoningOnly, setShowReasoningOnly] =
    useState(false);
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 to 2.0
  const [showDecisionPack, setShowDecisionPack] =
    useState(false);

  // Simulate analysis progress
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnalysisStep(1), 800),
      setTimeout(() => setAnalysisStep(2), 2200),
      setTimeout(() => setAnalysisStep(3), 3800),
      setTimeout(() => setAnalysisStep(4), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const isAnalyzing = analysisStep < 4;
  const showExtractedData = analysisStep >= 1;
  const showRules = analysisStep >= 2;
  const showReasoning = analysisStep >= 3;

  // Show Decision Pack Report if requested
  if (showDecisionPack) {
    return (
      <DecisionPackReport
        onBack={() => setShowDecisionPack(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top System Bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        {/* Left - Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              <div className="w-2 h-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"></div>
              <div className="w-2 h-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-sm mt-0.5"></div>
              <div className="w-2 h-6 bg-gradient-to-b from-gray-900 to-black rounded-sm"></div>
            </div>
            <a
              href="/"
              className="font-bold text-sm tracking-wider text-gray-900"
            >
              SENTRA
            </a>
          </div>

          {/* Breadcrumb with Loading State */}
          <div className="text-xs text-gray-500 flex items-center gap-2.5">
            <span className="uppercase tracking-wide font-medium">
              ENTERPRISE
            </span>
            <span className="text-gray-300">›</span>
            <span className="uppercase tracking-wide font-medium">
              전략
            </span>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 uppercase tracking-wide font-semibold">
              글로벌 의사결정 원장
            </span>
            {isAnalyzing && (
              <>
                <span className="text-gray-300">›</span>
                <span className="text-blue-600 animate-pulse font-medium">
                  거버넌스 분석 중...
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center - Protocol */}
        <div className="text-xs text-gray-600">
          <span className="text-gray-500">Protocol:</span>{" "}
          <span className="text-gray-900 font-semibold">
            EU 확장 Protocol v1.2
          </span>
        </div>

        {/* Right - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active</span>
          </div>

          <div className="text-xs text-gray-600">
            <span className="text-gray-500">통합 Risk:</span>{" "}
            <span className="text-gray-900 font-bold">18</span>{" "}
            <span className="text-gray-500">/ 100</span>
          </div>

          <button className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-wide font-medium transition-colors">
            이력 보기
          </button>

          <button
            disabled={isAnalyzing}
            onClick={() =>
              !isAnalyzing && setShowDecisionPack(true)
            }
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              isAnalyzing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
            }`}
          >
            {isAnalyzing ? "분석 중..." : "DECISION PACK 생성"}
          </button>
        </div>
      </div>

      {/* Main Layout - 3 Columns */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* LEFT PANEL - Input Context & Extraction */}
        <div className="w-[340px] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                입력 컨텍스트
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                REQ: 2048
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button className="pb-2.5 px-1 text-xs font-bold text-gray-900 border-b-2 border-gray-900 uppercase tracking-wide">
                텍스트
              </button>
              <button className="pb-2.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors">
                문서
              </button>
            </div>

            {/* Submitted Input (read-only) */}
            <div className="space-y-2.5">
              <label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                입력 수신됨
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed">
                "EU 시장 진출을 위해 플랫폼을 확장하고자 합니다.
                예상 비용은 $150,000이며, 사용자 PII를 활용한
                맞춤형 서비스를 제공할 예정입니다. 목표는 EU ARR
                $15M 달성입니다."
              </div>
            </div>

            {/* Contextual Mapping Toggle */}
            <div className="flex items-center justify-between py-3.5 border-y border-gray-200">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                컨텍스트 매핑
              </span>
              <button
                onClick={() =>
                  setContextualMapping(!contextualMapping)
                }
                className={`w-11 h-6 rounded-full transition-all relative ${
                  contextualMapping
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-md ${
                    contextualMapping
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>

            {/* Governance Framework */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                GOVERNANCE FRAMEWORK
              </label>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-gray-900 font-semibold appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all">
                  <option>전략 인프라 (SI-2)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Extracted Entities - Step 1 Output */}
            {showExtractedData && (
              <div className="space-y-3.5 pt-2 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    추출된 엔티티
                  </h3>
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-600"></div>
                    완료
                  </span>
                </div>

                {/* Entity Chips */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-semibold">
                        Actor
                      </div>
                      <div className="text-xs text-gray-600">
                        Manager: David
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-cyan-50 border border-cyan-200 rounded-xl px-3.5 py-2.5">
                    <Target className="w-3.5 h-3.5 text-cyan-600" />
                    <div className="flex-1">
                      <div className="text-xs text-cyan-700 font-semibold">
                        Goal
                      </div>
                      <div className="text-xs text-gray-600">
                        G1: EU 확장
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                    <div className="flex-1">
                      <div className="text-xs text-green-700 font-semibold">
                        Cost
                      </div>
                      <div className="text-xs text-gray-600">
                        $150,000
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-200 rounded-xl px-3.5 py-2.5">
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-xs text-purple-700 font-semibold">
                        Data
                      </div>
                      <div className="text-xs text-gray-600">
                        PII: 사용
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <div className="flex-1">
                      <div className="text-xs text-amber-700 font-semibold">
                        KPI
                      </div>
                      <div className="text-xs text-gray-600">
                        K1: EU ARR $15M
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <div className="flex-1">
                      <div className="text-xs text-red-700 font-semibold">
                        Policy Hint
                      </div>
                      <div className="text-xs text-gray-600">
                        GDPR / Data Residency
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">
                  Demo version
                </p>
              </div>
            )}

            {/* Ontology Triples */}
            {showExtractedData && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-700">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ontology Triples (S–P–O)
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 font-mono text-xs">
                  <div className="text-gray-600">
                    <span className="text-cyan-600 font-semibold">
                      Decision
                    </span>{" "}
                    → HAS_GOAL →{" "}
                    <span className="text-cyan-600 font-semibold">
                      G1(EU Expansion)
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="text-cyan-600 font-semibold">
                      Decision
                    </span>{" "}
                    → HAS_COST →{" "}
                    <span className="text-green-600 font-semibold">
                      150000
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="text-cyan-600 font-semibold">
                      Decision
                    </span>{" "}
                    → AFFECTS_REGION →{" "}
                    <span className="text-blue-600 font-semibold">EU</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="text-cyan-600 font-semibold">
                      Decision
                    </span>{" "}
                    → USES_DATA →{" "}
                    <span className="text-purple-600 font-semibold">PII</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="text-cyan-600 font-semibold">
                      Decision
                    </span>{" "}
                    → HAS_KPI →{" "}
                    <span className="text-amber-600 font-semibold">
                      K1(EU ARR)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL - Governance Mind Map */}
        <div className="flex-1 bg-gray-50 overflow-hidden relative">
          <div className="p-6 h-full flex flex-col">
            {/* Header with Stepper during analysis */}
            <div className="mb-4">
              {isAnalyzing && (
                <div className="mb-4 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-2.5 ${analysisStep >= 1 ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${analysisStep >= 1 ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {analysisStep >= 1 ? "✓" : "1"}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Extraction
                      </span>
                    </div>
                    <div className="text-gray-300">→</div>
                    <div
                      className={`flex items-center gap-2.5 ${analysisStep >= 2 ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${analysisStep >= 2 ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {analysisStep >= 2 ? "✓" : "2"}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Policy Engine
                      </span>
                    </div>
                    <div className="text-gray-300">→</div>
                    <div
                      className={`flex items-center gap-2.5 ${analysisStep >= 3 ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${analysisStep >= 3 ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {analysisStep >= 3 ? "✓" : "3"}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        o1 Reasoning
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Governance graph
                </h2>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-wide cursor-pointer hover:text-gray-900 transition-colors">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-gray-300 bg-white checked:bg-gray-900 checked:border-gray-900"
                      checked={showReasoningOnly}
                      onChange={(e) =>
                        setShowReasoningOnly(e.target.checked)
                      }
                    />
                    추론 경로만 표시
                  </label>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      정밀도
                    </span>
                    <div className="relative">
                      <select className="bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-xs text-gray-900 font-semibold appearance-none cursor-pointer pr-9 hover:border-gray-300 transition-colors shadow-sm">
                        <option>MAX_LEVEL</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Area */}
            <div
              className="flex-1 rounded-xl border border-gray-200 relative overflow-hidden bg-white shadow-sm"
              style={{
                backgroundImage: `radial-gradient(circle at center, rgba(209, 213, 219, 0.3) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            >
              {/* Enhanced SVG Mind Map */}
              <svg
                className="w-full h-full"
                viewBox="0 0 1100 650"
              >
                <g
                  transform={`scale(${zoom}) translate(${zoom === 1 ? 0 : (1 - zoom) * 550}, ${zoom === 1 ? 0 : (1 - zoom) * 325})`}
                >
                  {/* Connection Lines */}
                  {!showReasoningOnly && (
                    <>
                      <line
                        x1="160"
                        y1="90"
                        x2="360"
                        y2="280"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1="530"
                        y1="95"
                        x2="530"
                        y2="270"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <line
                        x1="530"
                        y1="390"
                        x2="530"
                        y2="500"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <line
                        x1="700"
                        y1="330"
                        x2="750"
                        y2="330"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                      />
                      <line
                        x1="360"
                        y1="390"
                        x2="230"
                        y2="520"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </>
                  )}

                  {/* Conflict edge - highlighted */}
                  {showReasoning && (
                    <>
                      <line
                        x1="610"
                        y1="95"
                        x2="850"
                        y2="180"
                        stroke="#F59E0B"
                        strokeWidth="3"
                      />
                      <line
                        x1="610"
                        y1="535"
                        x2="850"
                        y2="420"
                        stroke="#F59E0B"
                        strokeWidth="3"
                      />
                      <line
                        x1="930"
                        y1="180"
                        x2="930"
                        y2="420"
                        stroke="#D97706"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                        className="animate-pulse"
                      />
                      {/* Conflict badge */}
                      <rect
                        x="900"
                        y="290"
                        width="60"
                        height="20"
                        fill="#F59E0B"
                        rx="6"
                      />
                      <text
                        x="930"
                        y="303"
                        fill="#FFF"
                        fontSize="9"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        CONFLICT
                      </text>
                    </>
                  )}

                  {/* Actor Node */}
                  {!showReasoningOnly && (
                    <g>
                      <rect
                        x="80"
                        y="50"
                        width="160"
                        height="80"
                        fill="#FFFFFF"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text
                        x="160"
                        y="75"
                        fill="#6B7280"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        ACTOR
                      </text>
                      <text
                        x="160"
                        y="100"
                        fill="#111827"
                        fontSize="13"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        Manager: David
                      </text>
                    </g>
                  )}

                  {/* Goal 1: EU Expansion */}
                  <g>
                    <rect
                      x="450"
                      y="60"
                      width="160"
                      height="70"
                      fill="#FFFFFF"
                      stroke="#06B6D4"
                      strokeWidth="2"
                      rx="8"
                    />
                    <text
                      x="530"
                      y="85"
                      fill="#0891B2"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      GOAL
                    </text>
                    <text
                      x="530"
                      y="110"
                      fill="#111827"
                      fontSize="14"
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      G1: EU 확장
                    </text>
                  </g>

                  {/* Decision Root Node (Center) */}
                  <g>
                    <rect
                      x="360"
                      y="270"
                      width="340"
                      height="120"
                      fill="#FFFFFF"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      rx="8"
                    />
                    <text
                      x="530"
                      y="300"
                      fill="#6B7280"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      DECISION ROOT
                    </text>
                    <text
                      x="530"
                      y="330"
                      fill="#111827"
                      fontSize="18"
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      EU Market Entry
                    </text>
                    <text
                      x="530"
                      y="355"
                      fill="#111827"
                      fontSize="18"
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      Platform Expansion
                    </text>
                  </g>

                  {/* Goal 3: Cost Reduction (conflicts with G1) */}
                  <g>
                    <rect
                      x="450"
                      y="500"
                      width="160"
                      height="70"
                      fill="#FFFFFF"
                      stroke="#06B6D4"
                      strokeWidth="2"
                      rx="8"
                    />
                    <text
                      x="530"
                      y="525"
                      fill="#0891B2"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      GOAL
                    </text>
                    <text
                      x="530"
                      y="550"
                      fill="#111827"
                      fontSize="14"
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      G3: 비용 절감
                    </text>
                  </g>

                  {/* KPI Node */}
                  {!showReasoningOnly && (
                    <g>
                      <rect
                        x="750"
                        y="290"
                        width="140"
                        height="80"
                        fill="#FFFFFF"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text
                        x="820"
                        y="315"
                        fill="#D97706"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        KPI TARGET
                      </text>
                      <text
                        x="820"
                        y="340"
                        fill="#111827"
                        fontSize="13"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        K1: EU ARR
                      </text>
                      <text
                        x="820"
                        y="360"
                        fill="#059669"
                        fontSize="14"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        $15M
                      </text>
                    </g>
                  )}

                  {/* Policy/Risk Nodes */}
                  {!showReasoningOnly && showRules && (
                    <>
                      <g>
                        <rect
                          x="150"
                          y="520"
                          width="160"
                          height="80"
                          fill="#FFFFFF"
                          stroke="#DC2626"
                          strokeWidth="2"
                          rx="8"
                        />
                        <rect
                          x="150"
                          y="520"
                          width="160"
                          height="80"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          rx="8"
                          className="animate-pulse"
                        />
                        <text
                          x="230"
                          y="545"
                          fill="#DC2626"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          RISK: VIOLATION
                        </text>
                        <text
                          x="230"
                          y="570"
                          fill="#EF4444"
                          fontSize="13"
                          textAnchor="middle"
                          fontWeight="700"
                        >
                          GDPR / Data
                        </text>
                        <text
                          x="230"
                          y="588"
                          fill="#EF4444"
                          fontSize="13"
                          textAnchor="middle"
                          fontWeight="700"
                        >
                          Residency
                        </text>
                      </g>
                    </>
                  )}

                  {/* o1 Reasoning visualization */}
                  {showReasoning && (
                    <g>
                      <rect
                        x="850"
                        y="100"
                        width="180"
                        height="360"
                        fill="#FEF3C7"
                        fillOpacity="0.3"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        rx="12"
                      />
                      <text
                        x="940"
                        y="130"
                        fill="#D97706"
                        fontSize="11"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        o1 추론 영역
                      </text>
                      <text
                        x="940"
                        y="165"
                        fill="#92400E"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        전략적 충돌 감지:
                      </text>
                      <text
                        x="940"
                        y="185"
                        fill="#92400E"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        EU 확장(G1)은
                      </text>
                      <text
                        x="940"
                        y="200"
                        fill="#92400E"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        비용 상승을 유발하여
                      </text>
                      <text
                        x="940"
                        y="215"
                        fill="#92400E"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        G3 KPI에 부정 영향
                      </text>
                      <text
                        x="940"
                        y="250"
                        fill="#DC2626"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        Risk 증폭:
                      </text>
                      <text
                        x="940"
                        y="270"
                        fill="#EF4444"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        GDPR + PII 사용
                      </text>
                      <text
                        x="940"
                        y="285"
                        fill="#EF4444"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        Data Residency 이슈
                      </text>
                      <text
                        x="940"
                        y="330"
                        fill="#059669"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="700"
                      >
                        권장 조치:
                      </text>
                      <text
                        x="940"
                        y="355"
                        fill="#047857"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        법무팀 검토 필수
                      </text>
                      <text
                        x="940"
                        y="375"
                        fill="#047857"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        단계적 접근 고려
                      </text>
                      <text
                        x="940"
                        y="395"
                        fill="#047857"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        CEO 승인 권장
                      </text>
                    </g>
                  )}
                </g>
              </svg>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() =>
                    setZoom(Math.min(2, zoom + 0.25))
                  }
                  disabled={zoom >= 2}
                  className={`w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                    zoom >= 2
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() =>
                    setZoom(Math.max(0.5, zoom - 0.25))
                  }
                  disabled={zoom <= 0.5}
                  className={`w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                    zoom <= 0.5
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Bottom Alert Banner - o1 Reasoning Output */}
            {showReasoning && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in duration-500">
                <div className="flex items-center gap-3.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                      o1 전략 충돌 감지
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      EU 확장(G1)과 비용 절감(G3) 간 목표 충돌.
                      GDPR 위반 리스크 높음.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Rules, Approvals, Trace Log */}
        <div className="w-[400px] bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                거버넌스 원장
              </h2>
              <button className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-wide font-medium transition-colors">
                이력 보기 →
              </button>
            </div>

            {/* Engine Status Pills */}
            <div className="flex gap-2.5">
              <div
                className={`flex-1 px-3.5 py-3 rounded-xl border text-center transition-all ${showExtractedData ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1.5">
                  Deterministic
                </div>
                <div
                  className={`text-xs font-bold ${showExtractedData ? "text-green-600" : "text-gray-400"}`}
                >
                  {showExtractedData ? "ACTIVE" : "IDLE"}
                </div>
              </div>
              <div
                className={`flex-1 px-3.5 py-3 rounded-xl border text-center transition-all ${showReasoning ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-1.5">
                  o1 Reasoner
                </div>
                <div
                  className={`text-xs font-bold ${showReasoning ? "text-amber-600" : "text-gray-400"}`}
                >
                  {showReasoning ? "ACTIVE" : "IDLE"}
                </div>
              </div>
            </div>

            {/* Governance Rules */}
            {showRules && (
              <div className="space-y-3.5 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Governance Rules
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    5 LOADED
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {/* R1 */}
                  <div className="px-4 py-3.5 hover:bg-white transition-colors border-l-3 border-l-red-500">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        R1 Budget Threshold
                      </span>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                        TRIGGERED
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Cost: $150k &gt; $100k
                    </p>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  {/* R2 */}
                  <div className="px-4 py-3.5 hover:bg-white transition-colors border-l-3 border-l-red-500">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        R2 Privacy (EU/PII)
                      </span>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                        TRIGGERED
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Region: EU + PII
                    </p>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  {/* R3 */}
                  <div className="px-4 py-3.5 hover:bg-white transition-colors border-l-3 border-l-green-500">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        R3 Launch Window
                      </span>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                        PASSED
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      No conflict
                    </p>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  {/* R4 */}
                  <div className="px-4 py-3.5 hover:bg-white transition-colors border-l-3 border-l-amber-500">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        R4 Strategic Impact
                      </span>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                        CHECKING
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      CEO escalation
                    </p>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  {/* R5 */}
                  <div className="px-4 py-3.5 bg-red-50 hover:bg-white transition-colors border-l-3 border-l-red-500">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        R5 Data Residency
                      </span>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                        VIOLATION
                      </span>
                    </div>
                    <p className="text-xs text-red-600">
                      GDPR compliance risk
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  상태
                </div>
                <div className="text-sm font-bold text-amber-600 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  REVIEW
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  중요도
                </div>
                <div className="text-sm font-bold text-red-600">
                  HIGH-RISK
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  영향 범위
                </div>
                <div className="text-sm font-bold text-gray-900">
                  EU
                </div>
              </div>
            </div>

            {/* Approval Chain with Why */}
            {showRules && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    승인 체계
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    HIGH-ASSURANCE
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-3 gap-4 px-4 py-2.5 bg-white border-b border-gray-200">
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                      담당자
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                      AUTH
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold text-right">
                      상태
                    </div>
                  </div>

                  {/* CFO */}
                  <div
                    className="px-4 py-3.5 border-b border-gray-200 hover:bg-white transition-colors group"
                    title="R1 triggered: $150k > $100k"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-xs text-gray-900 font-medium">
                        CFO
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        CFO-0
                      </div>
                      <div className="text-xs text-red-600 font-bold text-right uppercase tracking-wide">
                        REQUIRED
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5">
                      R1: $150k &gt; $100k
                    </div>
                  </div>

                  {/* CTO */}
                  <div
                    className="px-4 py-3.5 border-b border-gray-200 hover:bg-white transition-colors group"
                    title="R2 triggered: EU + PII"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-xs text-gray-900 font-medium">
                        CTO / Legal
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        CTO-1
                      </div>
                      <div className="text-xs text-red-600 font-bold text-right uppercase tracking-wide">
                        REQUIRED
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5">
                      R2: EU + PII
                    </div>
                  </div>

                  {/* CEO (Optional) */}
                  <div className="px-4 py-3.5 bg-amber-50 hover:bg-white transition-colors">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-xs text-gray-900 font-medium">
                        CEO
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        CEO-9
                      </div>
                      <div className="text-xs text-amber-600 font-bold text-right uppercase tracking-wide">
                        ESCALATION
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5">
                      R4: 전략 영향도 높음
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Trace Log */}
            {showExtractedData && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Live Trace Log
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
                  <div className="text-blue-600">
                    [Extractor] Parsing entities… OK
                  </div>
                  {analysisStep >= 1 && (
                    <div className="text-blue-600 animate-in fade-in">
                      [Ontology Mapper] Mapping Goal → G1, Cost
                      → 150000
                    </div>
                  )}
                  {analysisStep >= 2 && (
                    <>
                      <div className="text-amber-600 animate-in fade-in">
                        [Policy Engine] Checking R1… TRIGGERED
                        (CFO approval)
                      </div>
                      <div className="text-amber-600 animate-in fade-in">
                        [Policy Engine] Checking R2… TRIGGERED
                        (CTO review)
                      </div>
                      <div className="text-red-600 animate-in fade-in">
                        [Policy Engine] R5 VIOLATION: Data
                        Residency
                      </div>
                    </>
                  )}
                  {analysisStep >= 3 && (
                    <>
                      <div className="text-purple-600 animate-in fade-in">
                        [o1 Reasoner] Evaluating strategic
                        alignment…
                      </div>
                      <div className="text-purple-600 animate-in fade-in">
                        [o1 Reasoner] Detected Goal conflict: G1
                        vs G3
                      </div>
                      <div className="text-red-600 animate-in fade-in">
                        [o1 Reasoner] Risk amplification: GDPR +
                        Residency
                      </div>
                    </>
                  )}
                  {analysisStep >= 4 && (
                    <div className="text-green-600 animate-in fade-in">
                      [Pack Builder] Generating Decision Pack…
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Impact Simulation - KPI Forecast */}
            {showReasoning && (
              <div className="space-y-3.5 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Impact Simulation
                  </h3>
                  <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
                    o1 기반
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-5">
                  {/* K1 EU ARR */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs text-gray-600 uppercase tracking-wide">
                        K1 EU ARR
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        +$15M
                      </span>
                    </div>
                    <div className="h-9 bg-white rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1.5 border border-gray-200">
                      <div className="w-1.5 bg-green-500 h-3 rounded-t"></div>
                      <div className="w-1.5 bg-green-500 h-4 rounded-t"></div>
                      <div className="w-1.5 bg-green-500 h-5 rounded-t"></div>
                      <div className="w-1.5 bg-green-500 h-6 rounded-t"></div>
                      <div className="w-1.5 bg-green-500 h-7 rounded-t"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      긍정적 영향 예상
                    </p>
                  </div>

                  {/* K3 Cost/Unit */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs text-gray-600 uppercase tracking-wide">
                        K3 Cost/Unit
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        +18%
                      </span>
                    </div>
                    <div className="h-9 bg-white rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1.5 border border-gray-200">
                      <div className="w-1.5 bg-red-500 h-3 rounded-t"></div>
                      <div className="w-1.5 bg-red-500 h-4 rounded-t"></div>
                      <div className="w-1.5 bg-red-500 h-5 rounded-t"></div>
                      <div className="w-1.5 bg-red-500 h-6 rounded-t"></div>
                      <div className="w-1.5 bg-red-500 h-7 rounded-t"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      부정적 영향 (비용 상승)
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">
                  o1 추론 기반 시뮬레이션 (demo mode)
                </p>
              </div>
            )}

            {/* System Metadata Footer */}
            <div className="pt-5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono">DATA STREAM: 6.0.4 STABLE</span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                LIVE MODE (EV)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
