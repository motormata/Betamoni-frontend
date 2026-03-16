import { TrendingUp } from "lucide-react";

// ── KPI Cards (Placeholder) ────────────────────────────────────────
// Endpoint /api/dashboard currently errors — using placeholder data

interface KpiItem {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

const placeholderKpis: KpiItem[] = [
  { label: "Total Clusters", value: "—", change: "—", positive: true },
  { label: "Borrowers", value: "—", change: "—", positive: true },
  { label: "Active Loans", value: "—", change: "—", positive: true },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {placeholderKpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border bg-card p-4 space-y-1.5"
        >
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {kpi.label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-muted-foreground">{kpi.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
