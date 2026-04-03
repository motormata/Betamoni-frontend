import type { LucideIcon } from "lucide-react";

// ── Reusable Page Header ───────────────────────────────────────────

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
