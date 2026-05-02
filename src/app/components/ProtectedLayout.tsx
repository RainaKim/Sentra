import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * ProtectedLayout — auth guard for all product routes.
 *
 * Wraps routes that require authentication. If the user is not authenticated,
 * redirects to /login with the current location saved in state so the user
 * can be returned here after sign-in.
 *
 * Usage in router: nest product routes as children of this layout.
 */
export function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
