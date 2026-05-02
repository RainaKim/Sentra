import { Link } from "react-router";
import { googleAuthUrl } from "../../config";
import Logo from "./Logo";

export function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0B0F1A" }}
    >
      {/* Single card — logo + form in one aligned block */}
      <div
        className="w-full max-w-sm rounded-2xl"
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Top: logo */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link to="/">
            <Logo variant="dark" />
          </Link>
        </div>

        {/* Bottom: sign-in content */}
        <div className="px-8 py-8">
          <h1
            className="text-lg font-bold text-white mb-1 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            Sign in to your workspace
          </h1>
          <p className="text-sm text-slate-500 mb-7">
            Access your governance console and decision history.
          </p>

          {/* Google OAuth button */}
          <a
            href={googleAuthUrl}
            className="flex items-center justify-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: "#fff",
              color: "#1F2937",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {/* Google "G" logo */}
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
