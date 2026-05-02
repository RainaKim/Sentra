import { Link } from "react-router";

export function CTABanner() {
  return (
    <section className="bg-[#0B0F1A] py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2
          style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
        >
          Enterprise teams go live in days, not months.
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          From document ingestion to governed AI decisions — without a configuration sprint.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="mailto:contact@decisiongovernance.ai"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
          >
            Request a Demo
          </a>
        </div>
        <Link
          to="/onboarding"
          onClick={() => window.scrollTo(0, 0)}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
        >
          See how onboarding works →
        </Link>

        <p className="text-xs text-gray-600 mt-2">
          Enterprise contracts, custom scoped to your decision volume and compliance requirements.
        </p>
        <p className="mt-6 text-xs text-gray-600">
          Enterprise inquiries:{" "}
          <a href="mailto:contact@decisiongovernance.ai" className="text-gray-500 hover:text-gray-300">
            contact@decisiongovernance.ai
          </a>
        </p>
      </div>
    </section>
  );
}
