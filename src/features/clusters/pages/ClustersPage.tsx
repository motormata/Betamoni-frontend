import { useState } from "react";
import { MapPin, Store, LayoutGrid } from "lucide-react";
import { RegionsListPanel } from "../components/RegionsListPanel";
import { MarketsListPanel } from "../components/MarketsListPanel";
import { CreateRegionForm } from "../components/CreateRegionForm";
import { CreateMarketForm } from "../components/CreateMarketForm";

// ── Tab type ───────────────────────────────────────────────────────

type Tab = "regions" | "markets";

// ── Clusters Page ──────────────────────────────────────────────────

export function ClustersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("regions");

  const isRegions = activeTab === "regions";

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Clusters</h2>
          <p className="text-sm text-muted-foreground">
            Manage regions and markets across your network
          </p>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
        <TabButton
          label="Regions"
          icon={<MapPin className="h-4 w-4" />}
          active={isRegions}
          onClick={() => setActiveTab("regions")}
        />
        <TabButton
          label="Markets"
          icon={<Store className="h-4 w-4" />}
          active={!isRegions}
          onClick={() => setActiveTab("markets")}
        />
      </div>

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Left Card: List & Counts ─────────────────────────── */}
        <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-1">
          {/* Card Header */}
          <div className="flex items-center gap-2 mb-4">
            {isRegions ? (
              <MapPin className="h-4 w-4 text-primary" />
            ) : (
              <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <h3 className="text-sm font-semibold">
              {isRegions ? "All Regions" : "All Markets"}
            </h3>
          </div>

          {/* Scrollable list area */}
          <div className="max-h-[480px] overflow-y-auto pr-1">
            {isRegions ? <RegionsListPanel /> : <MarketsListPanel />}
          </div>
        </div>

        {/* ── Right Card: Create Form ──────────────────────────── */}
        <div className="rounded-xl border bg-card p-5 sm:p-6">
          {/* Card Header */}
          <div className="flex items-center gap-2 mb-6">
            {isRegions ? (
              <MapPin className="h-4 w-4 text-primary" />
            ) : (
              <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <div>
              <h3 className="text-sm font-semibold">
                {isRegions ? "Create Region" : "Create Market"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRegions
                  ? "Add a new geographic region to the system"
                  : "Add a new market within an existing region"}
              </p>
            </div>
          </div>

          {isRegions ? <CreateRegionForm /> : <CreateMarketForm />}
        </div>
      </div>
    </div>
  );
}

// ── Tab Button ─────────────────────────────────────────────────────

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
