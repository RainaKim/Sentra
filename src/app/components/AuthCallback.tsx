import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { getMe } from "../../api/client";

/**
 * AuthCallback — handles the OAuth redirect from the backend.
 *
 * The backend redirects to /auth/callback?token=<jwt> after Google OAuth.
 * This component:
 *   1. Reads the token from the URL query param
 *   2. Immediately removes it from the URL (history.replaceState)
 *   3. Verifies it via GET /v1/me
 *   4. Stores auth state and routes the user to /workspace (or /profile if incomplete)
 *   5. On failure, redirects to /login
 */
export function AuthCallback() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Remove token from URL immediately — before any async work
    window.history.replaceState({}, "", "/auth/callback");

    getMe(token)
      .then((user) => {
        setAuth(user, token);
        if (!user.name || !user.company_id) {
          navigate("/profile?edit=true", { replace: true });
        } else {
          navigate("/workspace", { replace: true });
        }
      })
      .catch((err) => {
        console.error("[AuthCallback] Token verification failed:", err);
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0B0F1A" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"
        />
        <p className="text-sm text-slate-500">Signing you in…</p>
      </div>
    </div>
  );
}
