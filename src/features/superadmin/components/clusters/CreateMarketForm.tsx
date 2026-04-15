import { useState } from "react";
import { useCreateMarketMutation, useGetRegionsQuery } from "@/api/endpoints/clustersApi";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

// ── Create Market Form ─────────────────────────────────────────────

export function CreateMarketForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createMarket, { isLoading, isError, error }] = useCreateMarketMutation();
  const { data: regionsRes, isLoading: regionsLoading } = useGetRegionsQuery();
  const { toast } = useToast();
  const regions = regionsRes?.data ?? [];

  const [regionId, setRegionId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createMarket({
        region_id: regionId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
      }).unwrap();

      toast({
        title: "Market created",
        description: `${name.trim()} is ready for staffing and borrower assignments.`,
      });
      setRegionId("");
      setName("");
      setCode("");
      setAddress("");
      onSuccess?.();
    } catch {
      // Inline error text handles recoverable form failures.
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Create New Market</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Region *</label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="input-field mt-1"
            required
            disabled={regionsLoading}
          >
            <option value="">
              {regionsLoading ? "Loading…" : "Select a region"}
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name} ({region.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Market Name *</label>
          <input
            type="text"
            placeholder="e.g. Oshodi Market"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Market Code *</label>
          <input
            type="text"
            placeholder="e.g. OSH-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field mt-1 uppercase"
            maxLength={20}
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Address *</label>
          <input
            type="text"
            placeholder="e.g. Oshodi Bus Stop, Lagos"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(error, "Failed to create market")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating…" : "Create Market"}
      </button>
    </form>
  );
}
