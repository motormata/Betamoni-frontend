import { useState } from "react";
import { useCreateRegionMutation } from "@/api/endpoints/clustersApi";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

// ── Create Region Form ─────────────────────────────────────────────

export function CreateRegionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createRegion, { isLoading, isError, error }] = useCreateRegionMutation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createRegion({
        name: name.trim(),
        code: code.trim().toUpperCase(),
      }).unwrap();

      toast({
        title: "Region created",
        description: `${name.trim()} is now available for market setup.`,
      });
      setName("");
      setCode("");
      onSuccess?.();
    } catch {
      // Inline error text keeps the fix close to the form.
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
          {getApiErrorMessage(error, "Failed to create region")}
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
