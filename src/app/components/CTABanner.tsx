import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

export function CTABanner() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
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
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section ref={ref} className="py-24 px-16 max-w-[1440px] mx-auto">
        <div
          className="relative overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.98)",
            transition: "all 0.7s ease-out",
          }}
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,120,120,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(80,80,80,0.1),transparent_50%)]"></div>

          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>

          <div className="relative px-16 py-20 text-center space-y-8">
            <div className="space-y-5">
              <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                AI doesn't just need intelligence.
                <br />
                It needs governance.
              </h2>
              <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Turn autonomous AI decisions into accountable, auditable enterprise
                workflows.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={() =>
                  isAuthenticated
                    ? navigate("/workspace")
                    : setShowAuthModal(true)
                }
                className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all hover:shadow-2xl text-sm font-bold inline-flex items-center gap-2.5"
              >
                {isAuthenticated ? "Go to Workspace" : "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mt-6 tracking-wide">
              Deterministic governance &middot; Evidence traceability &middot;
              Approval-ready artifacts
            </p>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
