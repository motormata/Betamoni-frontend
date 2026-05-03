import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type PortfolioTab = "counts" | "volumes";

interface PortfolioToggleProps {
  activeTab: PortfolioTab;
  onTabChange: (tab: PortfolioTab) => void;
}

const TABS: { key: PortfolioTab; label: string }[] = [
  { key: "counts", label: "Counts" },
  { key: "volumes", label: "Volumes" },
];

export function PortfolioToggle({ activeTab, onTabChange }: PortfolioToggleProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const activeButton = track.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`,
    );
    if (!activeButton) return;

    setIndicator({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    });
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={trackRef}
      role="tablist"
      className="relative inline-flex rounded-lg bg-muted/70 p-1"
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-md bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
        aria-hidden
      />

      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          data-tab={tab.key}
          aria-selected={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "relative z-10 rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200",
            activeTab === tab.key
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
