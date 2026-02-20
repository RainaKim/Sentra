export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-[1440px] mx-auto px-16 py-16">
        <div className="grid grid-cols-4 gap-12 mb-12">
          {/* Company */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                <div className="w-2 h-8 bg-gradient-to-b from-gray-800 to-gray-700 rounded-sm"></div>
                <div className="w-2 h-8 bg-gradient-to-b from-gray-700 to-gray-600 rounded-sm mt-1"></div>
                <div className="w-2 h-8 bg-gradient-to-b from-gray-600 to-gray-500 rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">DecisionGovernance AI</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              AI 의사결정을 위한<br />
              엔터프라이즈 거버넌스 레이어
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  제품 소개
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  기능
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  가격
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  데모
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  회사 소개
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  팀
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  채용
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  블로그
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  문서
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  지원센터
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  커뮤니티
                </a>
              </li>
            </ul>
          </div>
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
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}