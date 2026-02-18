import { useState } from "react";

export function Navigation() {
  const [language, setLanguage] = useState<"KR" | "EN">("KR");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ivory-50/90 backdrop-blur-xl border-b border-gray-300/50">
      <div className="max-w-[1440px] mx-auto px-16 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-8 bg-gradient-to-b from-gray-800 to-gray-700 rounded-sm"></div>
            <div className="w-2 h-8 bg-gradient-to-b from-gray-700 to-gray-600 rounded-sm mt-1"></div>
            <div className="w-2 h-8 bg-gradient-to-b from-gray-600 to-gray-500 rounded-sm"></div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            SENTRA
          </span>
        </div>

        {/* Middle Navigation */}
        <div className="flex items-center gap-8">
          <a
            href="#value"
            className="text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            작동 원리
          </a>
          <a
            href="#product"
            className="text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            제품
          </a>
          <a
            href="#demo"
            className="text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            데모
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setLanguage("EN")}
              className={`px-2 py-1 rounded transition-colors ${
                language === "EN"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              EN
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setLanguage("KR")}
              className={`px-2 py-1 rounded transition-colors ${
                language === "KR"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              KR
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}