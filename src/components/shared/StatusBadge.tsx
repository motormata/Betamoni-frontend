// ── Status Badge ───────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success ring-success/20",
  approved: "bg-success/10 text-success ring-success/20",
  pending: "bg-warning/10 text-warning ring-warning/20",
  rejected: "bg-danger/10 text-danger ring-danger/20",
  defaulted: "bg-danger/10 text-danger ring-danger/20",
  completed: "bg-info/10 text-info ring-info/20",
  disbursed: "bg-info/10 text-info ring-info/20",
  paid: "bg-success/10 text-success ring-success/20",
  overdue: "bg-danger/10 text-danger ring-danger/20",
};

const DEFAULT_STYLE = "bg-muted text-muted-foreground ring-border";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();
  const style = STATUS_STYLES[normalized] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-full ring-1 ring-inset ${style} ${className}`}
    >
      {status}
    </span>
  );
}
