// ── Summary Card ───────────────────────────────────────────────────
// Unified from identical definitions in AgentOverviewDashboard and SupervisorOverviewDashboard

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  fullWidth?: boolean;
}

export function SummaryCard({ icon: Icon, label, value, color, bgColor, fullWidth }: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 flex items-start gap-3 ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <div className={`h-9 w-9 shrink-0 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-lg font-bold ${color} mt-0.5 truncate`}>{value}</p>
      </div>
    </div>
  );
}
