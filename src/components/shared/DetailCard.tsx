// ── Detail Card ────────────────────────────────────────────────────
// Unified from duplicates in AgentLoanDetailPage and SupervisorLoanDetailPage

interface DetailCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  fullWidth?: boolean;
}

export function DetailCard({ icon: Icon, label, value, mono, fullWidth }: DetailCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-3 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-sm font-semibold truncate ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
