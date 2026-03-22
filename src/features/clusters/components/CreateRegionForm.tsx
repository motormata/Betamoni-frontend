import { useState } from "react";
import { useCreateRegionMutation } from "@/api/endpoints/clustersApi";

// ── Create Region Form ─────────────────────────────────────────────

export function CreateRegionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createRegion, { isLoading, isError, error }] = useCreateRegionMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await createRegion({
      name: name.trim(),
      code: code.trim().toUpperCase(),
    });

    if ("data" in result) {
      setName("");
      setCode("");
      onSuccess?.();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Create New Region</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Region Name *</label>
          <input
            type="text"
            placeholder="e.g. Lagos State"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Region Code *</label>
          <input
            type="text"
            placeholder="e.g. LOS"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field mt-1 uppercase"
            maxLength={10}
            required
          />
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to create region"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating…" : "Create Region"}
      </button>
    </form>
  );
}
