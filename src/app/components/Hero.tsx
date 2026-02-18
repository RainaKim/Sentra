import {
  ArrowRight,
  Shield,
  Building2,
  Lock,
  CheckCircle2,
  FileText,
  Upload,
  Slack,
  BookOpen,
  Mail,
  Github,
  ListTodo,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Hero() {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState<
    string | null
  >(null);
  const [selectedProfile, setSelectedProfile] = useState<
    string | null
  >(null);
  const [step, setStep] = useState<
    "industry" | "company" | "decision"
  >("industry");
  const [activeTab, setActiveTab] = useState<"text" | "pdf">(
    "text",
  );
  const [decisionText, setDecisionText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<
    string | null
  >(null);
  const [showEnterprisePopup, setShowEnterprisePopup] =
    useState(false);

  const industries = [
    {
      id: "finance",
      name: "일반기업",
      icon: Building2,
      rules: "47개 업무 규정",
      approvers: "재무팀장 → 감사팀 → 대표이사",
      description:
        "돈을 쓰는 중요한 결정을 내릴 때, 회사의 예산 규정과 상급자 결재 단계를 자동으로 적용합니다.",
    },
    {
      id: "healthcare",
      name: "병원/의료기관",
      icon: Shield,
      rules: "58개 의료 법규",
      approvers: "보안팀 → 법무팀 → 병원장",
      description:
        "환자의 소중한 정보를 다룰 때, 의료법과 개인정보 보호 규칙에 어긋나는 부분이 없는지 미리 확인합니다.",
    },
    {
      id: "public",
      name: "정부/공공기관",
      icon: Lock,
      rules: "64개 공공 지침",
      approvers: "법무팀 → 감사실 → 이사회",
      description:
        "나랏돈으로 계약하거나 업체를 선정할 때, 투명한 조달 절차와 승인 규정을 빠짐없이 검토합니다.",
    },
  ];

  const profiles = [
    {
      id: "nexus",
      name: "Nexus Dynamics",
      subtitle: "Corporate Finance",
      industry: "finance",
      icon: Building2,
      rules: "47개 Governance 규칙",
      approvers: "CFO → Compliance → CEO",
      focus: "글로벌 확장 · 규제 준수 · 비용 최적화",
      description:
        "자본 배분과 M&A 전략을 중심으로 운영되는 글로벌 금융 기업입니다.",
      badge: "Recommended",
      badgeColor: "emerald",
    },
    {
      id: "delaware",
      name: "State of Delaware (GSA)",
      subtitle: "Public Sector & Procurement",
      industry: "public",
      icon: Lock,
      rules: "64개 Governance 규칙",
      approvers: "Legal → Compliance → Board",
      focus: "조달 · 투명성 · 감사 가능성",
      description:
        "공공 조달과 예산 승인 프로세스를 관리하는 Public Sector Governance 모델입니다.",
      badge: "High-Regulation",
      badgeColor: "blue",
    },
    {
      id: "mayo",
      name: "Mayo Central Hospital",
      subtitle: "Healthcare & Data Privacy",
      industry: "healthcare",
      icon: Shield,
      rules: "58개 Governance 규칙",
      approvers: "Security → Compliance → Medical Director",
      focus: "HIPAA · 환자 안전 · 데이터 주권",
      description:
        "민감한 환자 데이터 보호와 의료 규제 준수를 중심으로 설계된 Governance 환경입니다.",
      badge: "Sensitive Data",
      badgeColor: "purple",
    },
  ];

  const suggestedDecisions = [
    "다음 분기 제품 가격 20% 인상",
    "AI 인프라에 $150K 투자",
    "EU 시장으로 데이터 플랫폼 확장",
  ];

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
  };

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
  };

  const handleActivate = () => {
    if (selectedProfile) {
      setStep("decision");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDecisionText(suggestion);
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadedFile("strategic-proposal-2024.pdf");
    }, 2000);
  };

  const isInputValid =
    decisionText.trim().length > 0 || uploadedFile !== null;

  return (
    <section className="pt-32 pb-24 px-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-2 gap-20 items-start">
        {/* Left Side */}
        <div className="space-y-8 flex flex-col justify-center h-full">
          <div className="space-y-6">
            <h1 className="text-[3.5rem] font-bold leading-[1.15] text-gray-900 tracking-tight">
              AI가 제안한 결정,
              <br />
              '우리 회사 규칙'에
              <br />
              맞는지 체크하세요
            </h1>
            <p className="text-xl leading-relaxed text-gray-600 font-medium max-w-xl">
              회사의 결재 순서와 업무 지침을 그대로 적용해,
              <br />
              AI의 결정이 안전한지 실시간으로 확인합니다.
            </p>
          </div>
        </div>

        {/* Right Side - Governance Profile Selector or Active Dashboard */}
        <div className="relative min-w-[600px]">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 via-gray-500/10 to-gray-600/10 blur-3xl -z-10"></div>

          {step === "industry" ? (
            /* Industry Selection Interface */
            <div
              id="governance-framework-selector"
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 space-y-8"
            >
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  어떤 분야의 의사결정을 도와드릴까요?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  선택하신 분야에 딱 맞는 업무 규정과 결재
                  라인을 자동으로 불러옵니다.
                </p>
              </div>

              {/* Confirmation Badge (shown after selection) */}
              {selectedIndustry && (
                <div className="flex items-center justify-center -mt-4 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      선택 완료:{" "}
                      {
                        industries.find(
                          (p) => p.id === selectedIndustry,
                        )?.name
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Company Cards */}
              <div className="space-y-4">
                {industries.map((profile) => {
                  const Icon = profile.icon;
                  const isSelected =
                    selectedIndustry === profile.id;

                  return (
                    <button
                      key={profile.id}
                      onClick={() =>
                        handleIndustrySelect(profile.id)
                      }
                      className={`relative w-full text-left p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                        isSelected
                          ? "border-gray-900 bg-gray-50 shadow-md"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-gray-900"
                              : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600"}`}
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">
                            {profile.name}
                          </h4>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-gray-900" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Continue Button */}
              <div className="space-y-2">
                <button
                  onClick={() => setStep("company")}
                  disabled={!selectedIndustry}
                  className={`w-full py-5 px-6 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    selectedIndustry
                      ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {selectedIndustry ? (
                    <>
                      다음
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    "산업을 선택해주세요 →"
                  )}
                </button>

                {/* Microcopy below button */}
                <p className="text-xs text-center text-gray-500">
                  본 환경은 Enterprise Governance 시나리오를
                  기반으로 구성된 Simulation Workspace입니다.
                </p>
              </div>
            </div>
          ) : step === "company" ? (
            /* Profile Selection Interface */
            <div
              id="governance-framework-selector"
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 space-y-8"
            >
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  STEP 2 OF 3 · GOVERNANCE CONTEXT
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  어떤 조직으로 분석해드릴까요?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  선택한 조직의 Governance 구조와 정책이
                  자동으로 로드되어 즉시 분석이 시작됩니다.
                </p>
                <p className="text-xs text-gray-500 italic pt-1">
                  각 조직은 실제 Enterprise 환경을 기반으로
                  설계된 Governance 모델입니다.
                </p>
              </div>

              {/* Industry Context Card */}
              {selectedIndustry && (() => {
                const industry = industries.find(i => i.id === selectedIndustry);
                const Icon = industry?.icon;
                return industry ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                        {Icon && <Icon className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="font-bold text-base text-gray-900">
                          {industry.name}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {industry.description}
                        </p>
                        <div className="space-y-1.5 pt-2 border-t border-gray-300">
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-gray-900 font-semibold">✔</span>
                            <span>{industry.rules}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-gray-900 font-semibold">✔</span>
                            <span>
                              <span className="font-semibold text-gray-700">
                                Approval Chain:
                              </span>{" "}
                              {industry.approvers}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Confirmation Badge (shown after selection) */}
              {selectedProfile && (
                <div className="flex items-center justify-center -mt-4 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      Governance Context 준비 완료:{" "}
                      {
                        profiles.find(
                          (p) => p.id === selectedProfile,
                        )?.name
                      }{" "}
                      —{" "}
                      {
                        profiles.find(
                          (p) => p.id === selectedProfile,
                        )?.subtitle
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Company Cards */}
              <div className="space-y-4">
                {profiles
                  .filter(
                    (p) => p.industry === selectedIndustry,
                  )
                  .map((profile) => {
                    const Icon = profile.icon;
                    const isSelected =
                      selectedProfile === profile.id;

                    return (
                      <button
                        key={profile.id}
                        onClick={() =>
                          handleProfileSelect(profile.id)
                        }
                        className={`relative w-full text-left p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                          isSelected
                            ? "border-gray-900 bg-gray-50 shadow-md"
                            : "border-gray-200 hover:border-gray-400 bg-white"
                        }`}
                      >
                        {/* Badge */}
                        {profile.badge && (
                          <div className="absolute top-4 right-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                profile.badgeColor === "emerald"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : profile.badgeColor ===
                                      "blue"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {profile.badge}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-gray-900"
                                : "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600"}`}
                            />
                          </div>

                          <div className="flex-1 space-y-3 pr-28">
                            {/* Company Name & Subtitle */}
                            <div className="space-y-1">
                              <h4 className="font-bold text-lg text-gray-900">
                                {profile.name}
                              </h4>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {profile.subtitle}
                              </p>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {profile.description}
                            </p>

                            {/* Metadata Row */}
                            <div className="space-y-1.5 pt-2 border-t border-gray-200">
                              <div className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-gray-900 font-semibold">
                                  ✔
                                </span>
                                <span>{profile.rules}</span>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-gray-900 font-semibold">
                                  ✔
                                </span>
                                <span>
                                  <span className="font-semibold text-gray-700">
                                    Approval Chain:
                                  </span>{" "}
                                  {profile.approvers}
                                </span>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-gray-900 font-semibold">
                                  ✔
                                </span>
                                <span>
                                  <span className="font-semibold text-gray-700">
                                    {profile.id === "nexus"
                                      ? "Strategic Goals"
                                      : "Focus Areas"}
                                    :
                                  </span>{" "}
                                  {profile.focus}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute bottom-6 right-6">
                              <CheckCircle2 className="w-6 h-6 text-gray-900" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Continue Button */}
              <div className="space-y-2">
                <button
                  onClick={handleActivate}
                  disabled={!selectedProfile}
                  className={`w-full py-5 px-6 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    selectedProfile
                      ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {selectedProfile ? (
                    <>
                      다음
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    "기업을 선택해주세요 →"
                  )}
                </button>

                {/* Microcopy below button */}
                <p className="text-xs text-center text-gray-500">
                  본 환경은 Enterprise Governance 시나리오를
                  기반으로 구성된 Simulation Workspace입니다.
                </p>
              </div>

              {/* Back Button */}
              <button
                onClick={() => {
                  setStep("industry");
                  setSelectedProfile(null);
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700 font-medium pt-2 font-[Actor]"
              >
                ← Back
              </button>
            </div>
          ) : (
            /* Step 2 - Decision Input Interface */
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 space-y-8">
              {/* Governance Context Badge */}
              <div className="flex items-center justify-center pb-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold text-green-700">
                    Governance Context 로드 완료:{" "}
                    {
                      profiles.find(
                        (p) => p.id === selectedProfile,
                      )?.name
                    }
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-gray-200 text-center">
                <h3 className="text-3xl font-bold text-gray-900">
                  결정하고 싶은 내용을 알려주세요
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  기획안을 직접 쓰거나 문서를 올려주세요.
                  <br />
                  AI가 회사의 규칙과 비교하여 검토 결과를
                  준비합니다.
                </p>
              </div>

              {/* Connected Workspace Badge */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowEnterprisePopup(true)}
                  className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full hover:border-gray-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                        <Slack className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-300 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-500">+2</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                      워크스페이스 연결
                    </p>
                    <p className="text-xs text-gray-500">
                      5개 툴 연동 가능
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-center gap-3 pb-4">
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === "text"
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  텍스트 입력
                </button>
                <button
                  onClick={() => setActiveTab("pdf")}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === "pdf"
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  PDF 업로드
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "text" ? (
                <div className="space-y-4">
                  {/* Textarea without integrated button */}
                  <textarea
                    placeholder="예시: 다음 분기 제품 가격을 20% 인상하여 EU 시장에서 매출 성장을 가속화한다."
                    className="w-full h-48 bg-gray-50 rounded-xl p-5 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none"
                    value={decisionText}
                    onChange={(e) =>
                      setDecisionText(e.target.value)
                    }
                  />

                  {/* Suggested Decisions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      추천 의사결정
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedDecisions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() =>
                            handleSuggestionClick(suggestion)
                          }
                          className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-900 hover:text-white transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PDF Upload Zone */}
                  <div
                    onClick={
                      !isUploading && !uploadedFile
                        ? handleFileUpload
                        : undefined
                    }
                    className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center space-y-4 transition-all ${
                      isUploading || uploadedFile
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 animate-pulse" />
                        <div className="text-center space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            업로드 중…
                          </p>
                          <p className="text-xs text-gray-500">
                            의사결정 항목 추출 중…
                          </p>
                          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
                            <div
                              className="h-full bg-gray-900 rounded-full animate-[progress_2s_ease-in-out]"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <FileText className="w-12 h-12 text-green-600" />
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {uploadedFile}
                          </p>
                          <p className="text-xs text-gray-500">
                            분석 준비 완료
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          파일 제거
                        </button>
                      </>
                    ) : (
                      <>
                        <FileText className="w-12 h-12 text-gray-400" />
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-gray-700">
                            제안서를 드래그하거나
                          </p>
                          <p className="text-xs text-gray-500">
                            클릭하여 PDF 업로드
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          지원 포맷: PDF · 최대 20MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Primary CTA Button */}
              <button
                disabled={!isInputValid}
                onClick={() => {
                  if (isInputValid) {
                    navigate("/console");
                  }
                }}
                className={`w-full py-5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  isInputValid
                    ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg cursor-pointer"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                Governance Console 열기
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Microcopy */}
              <p className="text-xs text-center text-gray-500 -mt-4">
                업로드한 의사결정이 조직 기준에 맞는지 AI가
                자동으로 확인합니다.
              </p>

              {/* Change Profile Link */}
              <button
                onClick={() => {
                  setStep("company");
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700 font-medium pt-2 font-[Actor]"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enterprise Popup */}
      {showEnterprisePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Enterprise 플랜 전용 기능입니다.
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              이 기능은 Enterprise 플랜에만 제공됩니다.
              <br />
              Enterprise 플랜으로 업그레이드하시면 더 많은
              기능을 이용하실 수 있습니다.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowEnterprisePopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}