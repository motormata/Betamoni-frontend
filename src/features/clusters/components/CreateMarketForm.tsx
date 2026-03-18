import { useState } from "react";
import { Store, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCreateMarketMutation, useGetRegionsQuery } from "@/api/endpoints/clustersApi";

// ── Create Market Form ─────────────────────────────────────────────

export function CreateMarketForm() {
  const [createMarket, { isLoading }] = useCreateMarketMutation();
  const { data: regionsRes, isLoading: regionsLoading } = useGetRegionsQuery();
  const regions = regionsRes?.data ?? [];

  const [regionId, setRegionId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isFormValid = regionId && name.trim() && code.trim() && address.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    try {
      const res = await createMarket({
        region_id: regionId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
      }).unwrap();

      setResult({
        type: "success",
        message: `Market "${res.data?.name ?? name}" created successfully!`,
      });

      setRegionId("");
      setName("");
      setCode("");
      setAddress("");
    } catch (err: any) {
      const errorData = err?.data;
      if (errorData?.errors) {
        const messages = Object.values(errorData.errors).flat().join(", ");
        setResult({ type: "error", message: messages });
      } else {
        setResult({
          type: "error",
          message: errorData?.message ?? "Failed to create market. Please try again.",
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Result Banner */}
      {result && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
            result.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <p>{result.message}</p>
        </div>
      )}

      {/* Region Select */}
      <FieldGroup label="Region" required>
        <select
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          className="input-field"
          required
          disabled={regionsLoading}
        >
          <option value="">
            {regionsLoading ? "Loading regions…" : "Select a region"}
          </option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name} ({region.code})
            </option>
          ))}
        </select>
      </FieldGroup>

      {/* Market Name */}
      <FieldGroup label="Market Name" required>
        <input
          type="text"
          placeholder="e.g. Oshodi Market"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
        />
      </FieldGroup>

      {/* Market Code */}
      <FieldGroup label="Market Code" required>
        <input
          type="text"
          placeholder="e.g. OSH-01"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input-field uppercase"
          maxLength={20}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Short, unique code for this market (auto-uppercased).
        </p>
      </FieldGroup>

      {/* Address */}
      <FieldGroup label="Address" required>
        <input
          type="text"
          placeholder="e.g. Oshodi Bus Stop, Lagos"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field"
          required
        />
      </FieldGroup>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Store className="h-4 w-4" />
        )}
        {isLoading ? "Creating…" : "Create Market"}
      </button>
    </form>
  );
}

// ── Field Group ────────────────────────────────────────────────────

function FieldGroup({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
