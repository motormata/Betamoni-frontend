import { Users2 } from "lucide-react";
import { AgentPageHeader } from "@/features/agent/components/AgentPageHeader";

// ── Supervisor Agents Page (Placeholder) ───────────────────────────

export function SupervisorAgentsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <AgentPageHeader
        icon={Users2}
        title="Agents"
        description="View and manage agents under your supervision"
      />

      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Users2 className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-semibold text-foreground">Coming Soon</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Agent management features are currently in development. Once available,
          you'll be able to view agent performance, manage assignments, and more.
        </p>
      </div>
    </div>
  );
}
