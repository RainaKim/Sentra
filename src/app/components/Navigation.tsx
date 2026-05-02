import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import Logo from "./Logo";
import { googleAuthUrl } from "../../config";
import { useAuth } from "../contexts/AuthContext";

function SignInModal({ onClose }: { onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl relative"
        style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo row */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" onClick={onClose}>
            <Logo variant="dark" />
          </Link>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <h2
            className="text-lg font-bold text-white mb-1 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            Sign in to your workspace
          </h2>
          <p className="text-sm text-slate-500 mb-7">
            Access your governance console and decision history.
          </p>

          <a
            href={googleAuthUrl}
            className="flex items-center justify-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "#fff", color: "#1F2937", border: "1px solid rgba(255,255,255,0.12)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-center text-xs text-slate-600">
            Not a customer?{" "}
            <a
              href="mailto:contact@decisiongovernance.ai"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Request access →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const initials = (() => {
    const name = user?.name ?? user?.email ?? "?";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  })();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 items-center h-16">
          <Link to="/" className="flex-shrink-0 justify-self-start" aria-label="DecisionGovernance AI home">
            <Logo variant="dark" />
          </Link>

          {/* Desktop nav links — truly centered */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 hover:text-white transition-colors duration-150">Overview</Link>
            <Link to="/onboarding" onClick={() => window.scrollTo(0, 0)} className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 hover:text-white transition-colors duration-150">Onboarding</Link>
            {isAuthenticated && (
              <Link to="/workspace" className="text-[0.7rem] font-semibold tracking-widest uppercase text-indigo-400 hover:text-indigo-300 transition-colors duration-150">Workspace</Link>
            )}
          </div>

          {/* Desktop Sign in / Avatar */}
          <div className="hidden md:flex items-center justify-end gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors"
                style={{ background: "#6366F1", color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4F46E5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#6366F1")}
                title="Go to profile"
              >
                {initials}
              </button>
            ) : (
              <button
                onClick={() => setSignInOpen(true)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-150"
                style={{ color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#E2E8F0";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94A3B8";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 5L5 17M5 5l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 11h16M3 6h16M3 16h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0B0F1A] border-t border-white/[0.06] px-6 py-5 flex flex-col gap-5">
            <Link to="/" className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 hover:text-white transition-colors" onClick={() => { setMobileOpen(false); window.scrollTo(0, 0); }}>Overview</Link>
            <Link to="/onboarding" className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 hover:text-white transition-colors" onClick={() => { setMobileOpen(false); window.scrollTo(0, 0); }}>Onboarding</Link>
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-white/5 text-[0.7rem] font-semibold tracking-widest uppercase justify-start"
                  onClick={() => { setMobileOpen(false); navigate("/workspace"); }}
                >
                  Workspace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-400 hover:text-white hover:bg-white/5 text-[0.7rem] font-semibold tracking-widest uppercase justify-start"
                  onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                >
                  Profile
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-400 hover:text-white hover:bg-white/5 text-[0.7rem] font-semibold tracking-widest uppercase justify-start"
                onClick={() => { setMobileOpen(false); setSignInOpen(true); }}
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </nav>

      {/* Sign in modal */}
      {signInOpen && <SignInModal onClose={() => setSignInOpen(false)} />}
    </>
  );
}
