export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50/50">
      <div className="max-w-[1440px] mx-auto px-16 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-8 bg-gradient-to-b from-gray-800 to-gray-700 rounded-sm"></div>
              <div className="w-2 h-8 bg-gradient-to-b from-gray-700 to-gray-600 rounded-sm mt-1"></div>
              <div className="w-2 h-8 bg-gradient-to-b from-gray-600 to-gray-500 rounded-sm"></div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                DecisionGovernance AI
              </span>
              <p className="text-xs text-gray-400">
                Enterprise governance layer for AI decision-making
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            &copy; 2026 DecisionGovernance AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
