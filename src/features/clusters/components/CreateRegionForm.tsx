import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCreateRegionMutation } from "@/api/endpoints/clustersApi";

// ── Create Region Form ─────────────────────────────────────────────

export function CreateRegionForm() {
  const [createRegion, { isLoading }] = useCreateRegionMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isFormValid = name.trim() && code.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    try {
      const res = await createRegion({
        name: name.trim(),
        code: code.trim().toUpperCase(),
      }).unwrap();

      setResult({
        type: "success",
        message: `Region "${res.data?.name ?? name}" created successfully!`,
      });

      setName("");
      setCode("");
    } catch (err: any) {
      const errorData = err?.data;
      if (errorData?.errors) {
        const messages = Object.values(errorData.errors).flat().join(", ");
        setResult({ type: "error", message: messages });
      } else {
        setResult({
          type: "error",
          message: errorData?.message ?? "Failed to create region. Please try again.",
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

      {/* Region Name */}
      <FieldGroup label="Region Name" required>
        <input
          type="text"
          placeholder="e.g. Lagos State"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
        />
      </FieldGroup>

      {/* Region Code */}
      <FieldGroup label="Region Code" required>
        <input
          type="text"
          placeholder="e.g. LOS"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input-field uppercase"
          maxLength={10}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Short, unique identifier for this region (auto-uppercased).
        </p>
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
          <MapPin className="h-4 w-4" />
        )}
        {isLoading ? "Creating…" : "Create Region"}
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
