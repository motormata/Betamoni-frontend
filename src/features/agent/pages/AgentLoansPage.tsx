import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Plus, ChevronRight, Package, TrendingUp, Clock } from "lucide-react";
import {
  useGetAgentLoansQuery,
  useGetAgentBorrowersQuery,
  useCreateAgentLoanMutation,
} from "@/api/endpoints/agentApi";
import { useGetAgentProductsQuery } from "@/api/endpoints/productsApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";
import { CopyButton } from "@/components/shared/CopyButton";
import { formatCurrency } from "@/lib/formatters";
import type { LoanProduct } from "@/types/product.types";

// ── Agent Loans Page ───────────────────────────────────────────────

export function AgentLoansPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data: res, isLoading, isError } = useGetAgentLoansQuery(page);
  const navigate = useNavigate();

  const loans = res?.data?.data ?? [];
  const pagination = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Loans"
        description="Manage your loan portfolio"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Loan
          </button>
        }
      />

      {showForm && (
        <CreateLoanForm onSuccess={() => setShowForm(false)} />
      )}

      {/* Loans List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load loans" />}
        {!isLoading && !isError && loans.length === 0 && (
          <EmptyState message="No loans yet. Create your first loan above." />
        )}

        {loans.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-border">
              {loans.map((loan) => (
                <li
                  key={loan.id}
                  onClick={() => navigate(`/loans/${loan.id}`)}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {/* Show product name if available, else fall back to amount */}
                        {(loan as any).product?.name
                          ? (loan as any).product.name
                          : `₦${Number(loan.principal_amount).toLocaleString()}`}
                      </p>
                      <StatusBadge status={loan.status} />
                      <CopyButton text={loan.id} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {loan.repayment_frequency} · {loan.duration_days}d · {loan.interest_rate}%
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && (
          <div className="px-4 pb-3">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              totalItems={pagination.total}
              fromItem={pagination.from}
              toItem={pagination.to}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Loan Form ───────────────────────────────────────────────

function CreateLoanForm({ onSuccess }: { onSuccess: () => void }) {
  const [createLoan, { isLoading, isError, error }] = useCreateAgentLoanMutation();
  const { data: borrowersRes, isLoading: borrowersLoading } = useGetAgentBorrowersQuery();
  const { data: productsRes, isLoading: productsLoading } = useGetAgentProductsQuery();

  const borrowers = borrowersRes?.data?.data ?? [];
  const products = productsRes?.data ?? [];
  const activeProducts = products.filter((p) => p.is_active);

  const [borrowerId, setBorrowerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");

  // Selected product preview
  const selectedProduct = activeProducts.find((p) => p.id === productId) as LoanProduct | undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrowerId || !productId) return;

    const result = await createLoan({
      borrower_id: borrowerId,
      loan_product_id: productId,
      quantity: Number(quantity),
    });

    if ("data" in result) {
      setBorrowerId("");
      setProductId("");
      setQuantity("1");
      onSuccess();
    }
  }

  const freqLabel: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-Weekly",
    monthly: "Monthly",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Issue Loan</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Borrower select */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Borrower *</label>
          <select
            value={borrowerId}
            onChange={(e) => setBorrowerId(e.target.value)}
            className="input-field mt-1"
            required
            disabled={borrowersLoading}
          >
            <option value="">
              {borrowersLoading ? "Loading…" : "Select a borrower"}
            </option>
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.first_name} {b.last_name} — {b.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Product select */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Loan Deal *</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="input-field mt-1"
            required
            disabled={productsLoading}
          >
            <option value="">
              {productsLoading ? "Loading…" : "Select a deal"}
            </option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(p.principal_amount)}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>
      </div>

      {/* Product preview */}
      {selectedProduct && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Deal Preview
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{selectedProduct.interest_rate}% interest</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{selectedProduct.duration_days} days</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {freqLabel[selectedProduct.repayment_frequency]} repayment ·{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(selectedProduct.principal_amount * Number(quantity || 1))} total
            </span>
          </p>
        </div>
      )}

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to create loan"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !borrowerId || !productId}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating…" : "Issue Loan"}
      </button>
    </form>
  );
}
