import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/Login";
import { ProtectedRoute } from "./ProtectedRoutes";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

// ── Temporary Dashboard ────────────────────────────────────────────
// This will be replaced with the real dashboard layout module

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">BetaMoni Dashboard</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
        <LogoutButton />
      </header>
      <main className="p-8">
        <p className="text-lg">You're logged in! 🎉</p>
        <p className="text-muted-foreground mt-2">
          Dashboard features coming soon.
        </p>
      </main>
    </div>
  );
}

// ── Route Definitions ──────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
]);
