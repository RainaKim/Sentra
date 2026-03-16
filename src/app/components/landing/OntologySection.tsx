import { useRef, useState, useEffect } from "react";

export function OntologySection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-24 px-16">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left column: text + comparison cards */}
          <div>
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.6s ease-out",
              }}
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
                Why ontology-lite
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                More than rules, prompts, or RAG
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-lg">
                Most AI decision systems rely on flat records, prompt heuristics,
                or retrieval alone. DecisionGovernance AI uses an ontology-lite model — a typed
                governance vocabulary of decisions, goals, risks, policies, and
                approvers — to reason over relationships, not just text.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Not just prompts",
                  desc: "Prompt-based systems can describe a decision, but they do not reliably encode why that decision conflicts with strategy, triggers policy, or requires specific approval.",
                  dark: false,
                },
                {
                  title: "Not just RAG",
                  desc: "Retrieval can surface documents, but it does not represent the structural chain between a decision, a policy rule, a strategic goal, a risk, and an approver.",
                  dark: false,
                },
                {
                  title: "Ontology-lite advantage",
                  desc: "Our ontology-lite approach gives the system a typed, traversable model of governance relationships — enough to explain, score, simulate, and audit decisions without requiring a heavy full enterprise ontology stack.",
                  dark: true,
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className={`border-l-2 rounded-lg p-4 ${
                    card.dark
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-16px)",
                    transition: `all 0.5s ease-out ${0.2 + i * 0.12}s`,
                  }}
                >
                  <h3
                    className={`text-sm font-bold mb-1 ${
                      card.dark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      card.dark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: ontology graph diagram */}
          <div
            className="flex items-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
              transition: "all 0.7s ease-out 0.3s",
            }}
          >
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 w-full">
              <div className="relative w-full" style={{ height: 320 }}>
                {/* Center node */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
                    Decision
                  </div>
                </div>

                {/* Top satellite: Goal Conflict */}
                <div className="absolute left-1/2 top-4 -translate-x-1/2 z-10">
                  <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                    Goal Conflict
                  </div>
                </div>

                {/* Right satellite: Policy Rule */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                    Policy Rule
                  </div>
                </div>

                {/* Bottom satellite: Approver */}
                <div className="absolute left-1/2 bottom-8 -translate-x-1/2 z-10">
                  <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                    Approver
                  </div>
                </div>

                {/* Left satellite: Risk */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                    Risk
                  </div>
                </div>

                {/* Edges */}
                <div
                  className="absolute left-1/2 top-12 w-px bg-gray-300"
                  style={{ height: "calc(50% - 48px)" }}
                />
                <div
                  className="absolute left-1/2 top-1/2 w-px bg-gray-300 mt-5"
                  style={{ height: "calc(50% - 64px)" }}
                />
                <div
                  className="absolute top-1/2 left-1/2 h-px bg-gray-300 ml-12"
                  style={{ width: "calc(50% - 80px)" }}
                />
                <div
                  className="absolute top-1/2 right-1/2 h-px bg-gray-300 mr-12"
                  style={{ width: "calc(50% - 56px)" }}
                />
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-2">
                Typed governance vocabulary &middot; Traversable relationship
                model
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
