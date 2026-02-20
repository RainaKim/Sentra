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
