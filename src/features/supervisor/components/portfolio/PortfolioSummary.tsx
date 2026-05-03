import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioToggle, type PortfolioTab } from "./PortfolioToggle";
import { CountsPanel } from "./CountsPanel";
import { VolumesPanel } from "./VolumesPanel";
import type { MetricItem } from "./MetricTile";

interface PortfolioSummaryProps {
  counts: MetricItem[];
  volumes: MetricItem[];
}

const TAB_INDEX: Record<PortfolioTab, number> = { counts: 0, volumes: 1 };

const DESCRIPTIONS: Record<PortfolioTab, string> = {
  counts: "Portfolio totals and status mix",
  volumes: "Money flow across managed portfolio",
};

export function PortfolioSummary({ counts, volumes }: PortfolioSummaryProps) {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("counts");
  const prevTabRef = useRef<PortfolioTab>("counts");

  const direction =
    TAB_INDEX[activeTab] > TAB_INDEX[prevTabRef.current] ? 1 : -1;

  function handleTabChange(tab: PortfolioTab) {
    prevTabRef.current = activeTab;
    setActiveTab(tab);
  }

  return (
    <section aria-label="Supervisor Portfolio Summary">
      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Portfolio Summary
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {DESCRIPTIONS[activeTab]}
          </p>
        </div>
        <PortfolioToggle activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Animated panel */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {activeTab === "counts" ? (
              <CountsPanel metrics={counts} />
            ) : (
              <VolumesPanel metrics={volumes} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
