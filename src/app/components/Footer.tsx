import { useLang } from '../contexts/LangContext';

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-[1440px] mx-auto px-16 py-16">
        <div className="flex flex-col items-center mb-12 text-center">
          {/* Company Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              <div className="w-2 h-8 bg-gradient-to-b from-gray-800 to-gray-700 rounded-sm"></div>
              <div className="w-2 h-8 bg-gradient-to-b from-gray-700 to-gray-600 rounded-sm mt-1"></div>
              <div className="w-2 h-8 bg-gradient-to-b from-gray-600 to-gray-500 rounded-sm"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">DecisionGovernance AI</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            © 2026 DecisionGovernance AI. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
