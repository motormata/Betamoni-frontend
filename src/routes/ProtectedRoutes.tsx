import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/auth.types";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional: restrict access to specific roles */
  allowedRoles?: UserRole[];
}

/**
 * Route guard that checks Redux auth state.
 * - No token → redirect to /login
 * - If allowedRoles is specified, checks user's role
 * - Unauthorized role → redirect to /unauthorized (or /dashboard as fallback)
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Not authenticated → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check (if roles are specified)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
