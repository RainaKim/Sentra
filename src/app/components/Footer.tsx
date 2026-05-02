import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#0B0F1A] border-t py-12 px-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Column 1: Brand */}
          <div>
            <Logo variant="dark" className="mb-3" />
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Enterprise AI governance infrastructure. Validates AI decisions before execution — audit trail, compliance, approval workflows.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="/#problem-pipeline" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">How It Works</a></li>
              <li><a href="/#why-us" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Why Us</a></li>
              <li><a href="/#product-modules" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Product Modules</a></li>
              <li><a href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Console</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="mailto:contact@decisiongovernance.ai" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Contact</a></li>
              <li><a href="mailto:contact@decisiongovernance.ai?subject=Security%20Overview" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Security</a></li>
              <li><a href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} DecisionGovernance AI. All rights reserved.</p>
          <p className="text-xs text-gray-400">Built for enterprise AI governance.</p>
        </div>
      </div>
    </footer>
  );
}
