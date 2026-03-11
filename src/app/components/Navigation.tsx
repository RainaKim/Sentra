import { useState } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";
import { AuthModal } from "./AuthModal";

export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const { lang, setLang } = useLang();

  const initials = (() => {
    if (!user) return null;
    const name = user.name ?? user.email ?? "?";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  })();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
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
            DecisionGovernance AI
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <button
              onClick={() => setLang("ko")}
              className={`px-2 py-1 rounded transition-colors ${lang === "ko" ? "text-gray-900 bg-gray-100" : "hover:text-gray-700"}`}
            >
              KO
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded transition-colors ${lang === "en" ? "text-gray-900 bg-gray-100" : "hover:text-gray-700"}`}
            >
              EN
            </button>
          </div>

          {/* Profile Icon */}
          <button
            onClick={() => { isAuthenticated ? navigate("/profile") : setShowAuthModal(true); }}
            className="flex items-center justify-center w-9 h-9 bg-gray-700 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            {isAuthenticated && initials ? initials : <User className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </nav>

    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
    />
    </>
  );
}