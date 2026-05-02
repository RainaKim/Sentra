const categories = [
  {
    label: "Communication",
    tools: ["Slack", "Microsoft Teams", "Google Workspace"],
  },
  {
    label: "Docs & Knowledge",
    tools: ["Confluence", "Notion", "SharePoint"],
  },
  {
    label: "Project & Dev",
    tools: ["Jira", "GitHub"],
  },
  {
    label: "Business Systems",
    tools: ["Salesforce", "ServiceNow", "SAP", "Workday"],
  },
];

export function IntegrationStrip() {
  return (
    <section className="bg-white py-16 px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "#6366F1" }}>
              Works with Your Stack
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Governance decisions surface inside the tools your teams already work in
            </p>
          </div>
          <p className="text-[11px] text-slate-400 text-right max-w-xs">
            Don't see your platform? We connect to any tool your team uses via our integration layer.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
          {categories.map((cat) => (
            <div key={cat.label} className="bg-white px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">
                {cat.label}
              </p>
              <div className="flex flex-col gap-2">
                {cat.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[13px] font-medium text-slate-700"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
