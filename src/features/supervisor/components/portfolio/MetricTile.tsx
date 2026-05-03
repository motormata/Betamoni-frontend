import { cn } from "@/lib/utils";

type MetricTone = "primary" | "success" | "warning" | "danger" | "info";

export interface MetricItem {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: MetricTone;
}

const ICON_TONES: Record<MetricTone, { surface: string; icon: string }> = {
  primary: { surface: "bg-primary/10", icon: "text-primary" },
  success: { surface: "bg-success/10", icon: "text-success" },
  warning: { surface: "bg-warning/10", icon: "text-warning" },
  danger: { surface: "bg-danger/10", icon: "text-danger" },
  info: { surface: "bg-info/10", icon: "text-info" },
};

interface MetricTileProps {
  metric: MetricItem;
  variant?: "compact" | "spacious";
}

export function MetricTile({ metric, variant = "compact" }: MetricTileProps) {
  const { icon: Icon, label, value, tone } = metric;
  const toneStyles = ICON_TONES[tone];
  const isAlert = tone === "danger";
  const spacious = variant === "spacious";

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/60 bg-card/80 transition-colors",
        spacious ? "p-5" : "p-3.5",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-lg",
          toneStyles.surface,
          spacious ? "h-10 w-10" : "h-8 w-8",
        )}
      >
        <Icon
          className={cn(
            toneStyles.icon,
            spacious ? "h-[18px] w-[18px]" : "h-4 w-4",
          )}
        />
      </div>

      {/* Label */}
      <p
        className={cn(
          "font-medium uppercase tracking-wide text-muted-foreground",
          spacious ? "mt-4 text-[11px] tracking-[0.14em]" : "mt-2.5 text-[10px] tracking-[0.12em]",
        )}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className={cn(
          "mt-1 truncate font-bold leading-tight",
          isAlert ? "text-danger" : "text-foreground",
          spacious ? "text-2xl" : "text-lg",
        )}
      >
        {value}
      </p>
    </div>
  );
}
