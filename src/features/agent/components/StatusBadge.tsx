// ── Status Badge ───────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  approved:  "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  pending:   "bg-amber-500/10   text-amber-600   ring-amber-500/20",
  rejected:  "bg-red-500/10     text-red-500      ring-red-500/20",
  defaulted: "bg-red-500/10     text-red-500      ring-red-500/20",
  completed: "bg-sky-500/10     text-sky-600      ring-sky-500/20",
  disbursed: "bg-violet-500/10  text-violet-600   ring-violet-500/20",
  paid:      "bg-emerald-500/10 text-emerald-600  ring-emerald-500/20",
  overdue:   "bg-red-500/10     text-red-500      ring-red-500/20",
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
