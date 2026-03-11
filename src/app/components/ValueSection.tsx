import {
  Database,
  Shield,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useLang } from "../contexts/LangContext";

export function ValueSection() {
  const { t } = useLang();

  const phases = [
    {
      number: "01",
      titleKey: "value.phase1.title",
      icon: Database,
      statementKey: "value.phase1.statement",
      pointKeys: ["value.phase1.p1", "value.phase1.p2", "value.phase1.p3"],
    },
    {
      number: "02",
      titleKey: "value.phase2.title",
      icon: Shield,
      statementKey: "value.phase2.statement",
      pointKeys: ["value.phase2.p1", "value.phase2.p2", "value.phase2.p3"],
      emphasized: true,
    },
    {
      number: "03",
      titleKey: "value.phase3.title",
      icon: FileText,
      statementKey: "value.phase3.statement",
      pointKeys: ["value.phase3.p1", "value.phase3.p2", "value.phase3.p3"],
    },
  ];

  return (
    <section id="value" className="py-24 px-16 max-w-[1440px] mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16 space-y-5">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          {t('value.eyebrow')}
        </div>
        <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
          {t('value.title')}
        </h2>
        <p className="text-xl text-gray-600">
          {t('value.subtitle')}
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
                    {t(phase.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed border-l-2 border-gray-900 pl-3">
                    {t(phase.statementKey)}
                  </p>
                </div>

                {/* Capabilities */}
                <div className="space-y-2 pt-1">
                  {phase.pointKeys.map((key, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2.5 items-start"
                    >
                      <div className="w-1 h-1 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t(key)}
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
