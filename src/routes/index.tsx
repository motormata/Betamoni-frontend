import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/Login";
import { ProtectedRoute } from "./ProtectedRoutes";
import { AppLayout } from "@/components/layout/AppLayout";
import { OverviewPage } from "@/features/dashboard/pages/OverviewPage";
import { LoansPage } from "@/features/loans/pages/LoansPage";
import { ClustersPage } from "@/features/clusters/pages/ClustersPage";
import { StaffPage } from "@/features/staff/pages/StaffPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";

// ── Route Definitions ──────────────────────────────────────────────

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Protected routes — wrapped in AppLayout shell
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <OverviewPage />,
      },
      {
        path: "loans",
        element: <LoansPage />,
      },
      {
        path: "clusters",
        element: <ClustersPage />,
      },
      {
        path: "staff",
        element: <StaffPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },

  // Catch-all redirect
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
