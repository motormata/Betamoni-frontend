import { cn } from "@/lib/utils";

type SummaryTone = "primary" | "success" | "warning" | "danger" | "info";

const SUMMARY_TONES: Record<SummaryTone, { surface: string; text: string }> = {
  primary: { surface: "bg-primary/10", text: "text-primary" },
  success: { surface: "bg-success/10", text: "text-success" },
  warning: { surface: "bg-warning/10", text: "text-warning" },
  danger: { surface: "bg-danger/10", text: "text-danger" },
  info: { surface: "bg-info/10", text: "text-info" },
};

// ── Summary Card ───────────────────────────────────────────────────
// Unified from identical definitions in AgentOverviewDashboard and SupervisorOverviewDashboard

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: SummaryTone;
  fullWidth?: boolean;
}

export function SummaryCard({ icon: Icon, label, value, tone, fullWidth }: SummaryCardProps) {
  const styles = SUMMARY_TONES[tone];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 flex items-start gap-3 shadow-sm",
        fullWidth && "col-span-2",
      )}
    >
      <div className={cn("h-9 w-9 shrink-0 rounded-lg flex items-center justify-center", styles.surface)}>
        <Icon className={cn("h-4.5 w-4.5", styles.text)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={cn("text-lg font-bold mt-0.5 truncate", styles.text)}>{value}</p>
      </div>
    </div>
  );
}
