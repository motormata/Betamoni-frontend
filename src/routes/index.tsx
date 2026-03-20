import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/Login";
import { ProtectedRoute } from "./ProtectedRoutes";
import { AppLayout } from "@/components/layout/AppLayout";
import { OverviewPage } from "@/features/dashboard/pages/OverviewPage";
import { LoansPage } from "@/features/loans/pages/LoansPage";
import { ClustersPage } from "@/features/clusters/pages/ClustersPage";
import { StaffPage } from "@/features/staff/pages/StaffPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { useAppSelector } from "@/store/hooks";

// Agent feature pages
import { AgentOverviewDashboard } from "@/features/agent/pages/AgentOverviewDashboard";
import { AgentLoansPage } from "@/features/agent/pages/AgentLoansPage";
import { AgentLoanDetailPage } from "@/features/agent/pages/AgentLoanDetailPage";
import { AgentBorrowersPage } from "@/features/agent/pages/AgentBorrowersPage";
import { AgentBorrowerDetailPage } from "@/features/agent/pages/AgentBorrowerDetailPage";
import { AgentPaymentsPage } from "@/features/agent/pages/AgentPaymentsPage";

// Supervisor feature pages
import { SupervisorOverviewDashboard } from "@/features/supervisor/pages/SupervisorOverviewDashboard";
import { SupervisorLoansPage } from "@/features/supervisor/pages/SupervisorLoansPage";
import { SupervisorLoanDetailPage } from "@/features/supervisor/pages/SupervisorLoanDetailPage";
import { SupervisorAgentsPage } from "@/features/supervisor/pages/SupervisorAgentsPage";

// ── Role-Based Dashboard ───────────────────────────────────────────

function RoleBasedDashboard() {
  const role = useAppSelector((state) => state.auth.user?.role);
  if (role === "agent") return <AgentOverviewDashboard />;
  if (role === "supervisor") return <SupervisorOverviewDashboard />;
  return <OverviewPage />;
}

// ── Role-Based Loans Page ──────────────────────────────────────────

function RoleBasedLoansPage() {
  const role = useAppSelector((state) => state.auth.user?.role);
  if (role === "agent") return <AgentLoansPage />;
  if (role === "supervisor") return <SupervisorLoansPage />;
  return <LoansPage />;
}

// ── Role-Based Loan Detail ─────────────────────────────────────────

function RoleBasedLoanDetail() {
  const role = useAppSelector((state) => state.auth.user?.role);
  if (role === "supervisor") return <SupervisorLoanDetailPage />;
  return <AgentLoanDetailPage />;
}

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
        element: <RoleBasedDashboard />,
      },
      {
        path: "loans",
        element: <RoleBasedLoansPage />,
      },
      {
        path: "loans/:id",
        element: <RoleBasedLoanDetail />,
      },
      {
        path: "borrowers",
        element: <AgentBorrowersPage />,
      },
      {
        path: "borrowers/:id",
        element: <AgentBorrowerDetailPage />,
      },
      {
        path: "payments",
        element: <AgentPaymentsPage />,
      },
      {
        path: "agents",
        element: <SupervisorAgentsPage />,
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
