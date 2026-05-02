/**
 * API Base URL Configuration
 *
 * To point to a deployed backend, set this environment variable BEFORE building:
 *
 *   # .env (local dev)
 *   VITE_API_BASE_URL=http://localhost:8000
 *
 *   # production / CI
 *   VITE_API_BASE_URL=https://api.your-deployed-backend.com
 *
 * Only variables prefixed with VITE_ are exposed to the browser bundle.
 * Changing this single value is the ONLY thing needed to switch environments.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000";

/**
 * The frontend origin to redirect back to after OAuth.
 * In dev this is e.g. http://localhost:5173; in prod it's the deployed app URL.
 * Override with VITE_APP_URL if the automatic detection is not correct.
 */
export const APP_URL: string =
  (import.meta.env.VITE_APP_URL as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");

/** Full Google OAuth URL including the redirect_uri so the backend knows where to send the user back. */
export const googleAuthUrl: string =
  `${API_BASE_URL}/v1/auth/google?redirect_uri=${encodeURIComponent(`${APP_URL}/auth/callback`)}`;
