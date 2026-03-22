import { useState } from "react";
import { LayoutGrid, MapPin, Store, Plus } from "lucide-react";
import { RegionsListPanel } from "../components/RegionsListPanel";
import { MarketsListPanel } from "../components/MarketsListPanel";
import { CreateRegionForm } from "../components/CreateRegionForm";
import { CreateMarketForm } from "../components/CreateMarketForm";
import { AgentPageHeader } from "@/features/agent/components/AgentPageHeader";
import { useGetRegionsQuery, useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";

// ── Tab type ───────────────────────────────────────────────────────

type Tab = "regions" | "markets";

// ── Clusters Page ──────────────────────────────────────────────────

export function ClustersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("regions");
  const [showForm, setShowForm] = useState(false);

  const { data: regionsRes } = useGetRegionsQuery();
  const { data: marketsRes } = useGetClusterMarketsQuery();

  const isRegions = activeTab === "regions";
  const regionCount = regionsRes?.data?.length ?? 0;
  const marketCount = marketsRes?.data?.length ?? 0;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <AgentPageHeader
        icon={LayoutGrid}
        title="Clusters"
        description="Manage regions and markets across your network"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {isRegions ? "Region" : "Market"}
          </button>
        }
      />

      {/* Toggle Tabs */}
      <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
        <TabButton
          label="Regions"
          icon={<MapPin className="h-4 w-4" />}
          active={isRegions}
          onClick={() => {
            setActiveTab("regions");
            setShowForm(false);
          }}
        />
        <TabButton
          label="Markets"
          icon={<Store className="h-4 w-4" />}
          active={!isRegions}
          onClick={() => {
            setActiveTab("markets");
            setShowForm(false);
          }}
        />
      </div>

      {/* Create Form (expandable) */}
      {showForm && (
        isRegions
          ? <CreateRegionForm onSuccess={() => setShowForm(false)} />
          : <CreateMarketForm onSuccess={() => setShowForm(false)} />
      )}

      {/* List Card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isRegions ? <RegionsListPanel /> : <MarketsListPanel />}
        </div>

        {/* Simple count footer */}
        <div className="px-4 py-2 border-t text-xs text-muted-foreground">
          Showing {isRegions ? regionCount : marketCount} {isRegions ? "regions" : "markets"}
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
