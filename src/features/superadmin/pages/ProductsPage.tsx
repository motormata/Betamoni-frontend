import { useState } from "react";
import { Package, Plus, CheckCircle2, XCircle, Banknote, Clock, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useGetAdminProductsQuery,
  useCreateLoanProductMutation,
} from "@/api/endpoints/productsApi";
import type { LoanProduct } from "@/types/product.types";
import type { RepaymentFrequency } from "@/types/agent.types";
import { formatCurrency } from "@/lib/formatters";

// ── Products Page ──────────────────────────────────────────────────

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: res, isLoading, isError } = useGetAdminProductsQuery();
  const products = res?.data ?? [];
  const activeCount = products.filter((p) => p.is_active).length;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Package}
        title="Loan Deals"
        description="Define product templates that agents use to issue loans"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Deal
          </button>
        }
      />

      {/* Summary strip */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {activeCount} active
          </span>
          <span className="inline-flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            {products.length - activeCount} inactive
          </span>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <CreateProductForm onSuccess={() => setShowForm(false)} />
      )}

      {/* Products Grid */}
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load loan deals" />}
      {!isLoading && !isError && products.length === 0 && (
        <EmptyState message="No loan deals yet. Create your first one above." />
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────

function ProductCard({ product }: { product: LoanProduct }) {
  const freqLabel: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-Weekly",
    monthly: "Monthly",
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <StatusBadge status={product.is_active ? "active" : "inactive"} />
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/40 p-2 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-1">
            <Banknote className="h-3 w-3" /> Principal
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {formatCurrency(product.principal_amount)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" /> Rate
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {product.interest_rate}%
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Days
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {product.duration_days}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
        <span>{freqLabel[product.repayment_frequency] ?? product.repayment_frequency} repayment</span>
      </div>
    </div>
  );
}

// ── Create Product Form ────────────────────────────────────────────

const FREQUENCIES: { value: RepaymentFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
];

function CreateProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [create, { isLoading, isError, error }] = useCreateLoanProductMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState<RepaymentFrequency | "">("");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!frequency) return;

    const result = await create({
      name: name.trim(),
      description: description.trim() || undefined,
      principal_amount: Number(principal),
      interest_rate: Number(rate),
      duration_days: Number(duration),
      repayment_frequency: frequency,
      is_active: isActive,
    });

    if ("data" in result) {
      onSuccess();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">New Loan Deal</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Deal Name *</label>
          <input
            type="text"
            placeholder="e.g. 10k Weekly Deal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <input
            type="text"
            placeholder="e.g. Standard 10,000 package"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Principal (₦) *</label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Interest Rate (%) *</label>
          <input
            type="number"
            placeholder="e.g. 10"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="input-field mt-1"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Duration (Days) *</label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Repayment Frequency *</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RepaymentFrequency)}
            className="input-field mt-1"
            required
          >
            <option value="">Select</option>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
          <span className="text-xs font-medium text-muted-foreground">
            {isActive ? "Active — agents can use this deal" : "Inactive — hidden from agents"}
          </span>
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to create loan deal"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating…" : "Create Loan Deal"}
      </button>
    </form>
  );
}
