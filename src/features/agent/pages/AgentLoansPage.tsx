import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Banknote,
  ChevronRight,
  Clock,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import {
  useCreateAgentLoanMutation,
  useGetAgentBorrowersQuery,
  useGetAgentLoansQuery,
} from "@/api/endpoints/agentApi";
import { useGetAgentProductsQuery } from "@/api/endpoints/productsApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/FeedbackStates";
import { formatCurrency } from "@/lib/formatters";
import { parsePageSearchParam, updateSearchParams } from "@/lib/listSearchParams";
import {
  getAgentLoanDailyActivityStatus,
  isRepayableAgentLoanStatus,
  readAgentLoanDailyActivity,
  type AgentLoanDailyActivity,
  type AgentLoanDailyActivityStatus,
} from "@/lib/agentLoanDailyActivity";
import { useAppSelector } from "@/store/hooks";
import type { AgentLoan } from "@/types/agent.types";
import type { LoanProduct } from "@/types/product.types";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

export function AgentLoansPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageSearchParam(searchParams.get("page"));
  const { data: res, isLoading, isError } = useGetAgentLoansQuery(page);
  const navigate = useNavigate();
  const location = useLocation();
  const agentId = useAppSelector((state) => state.auth.user?.id);

  const loans = res?.data?.data ?? [];
  const pagination = res?.data;
  const dailyActivity = useMemo(
    () => readAgentLoanDailyActivity(agentId),
    [agentId, loans],
  );

  function handlePageChange(nextPage: number) {
    setSearchParams(updateSearchParams(searchParams, { page: nextPage }));
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Loans"
        description="Manage your loan portfolio"
        action={
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Loan
          </button>
        }
      />

      {showForm && <CreateLoanForm onSuccess={() => setShowForm(false)} />}

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load loans" />}
        {!isLoading && !isError && loans.length === 0 && (
          <EmptyState message="No loans yet. Create your first loan above." />
        )}

        {loans.length > 0 && (
          <div className="custom-scrollbar max-h-[60vh] overflow-y-auto">
            <SealLegend />
            <ul className="divide-y divide-border">
              {loans.map((loan) => {
                const sealGradient = getLoanSealGradient(
                  dailyActivity,
                  loan,
                );
                return (
                  <li
                    key={loan.id}
                    onClick={() =>
                      navigate({
                        pathname: `/loans/${loan.id}`,
                        search: location.search,
                      })
                    }
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-all hover:brightness-95"
                    style={sealGradient}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <p className="truncate text-sm font-bold">
                          {getLoanTitle(loan)}
                        </p>
                        <span className="text-sm text-muted-foreground/60 font-normal">—</span>
                        <p className="truncate text-sm font-bold text-foreground/85">
                          {getLoanBorrowerLabel(loan)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {loan.repayment_frequency} · {loan.duration_days}d · {loan.interest_rate}%
                        {loan.due_date ? ` · Due ${fmtShortDate(loan.due_date)}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusBadge status={loan.status} />
                      <LoanDueBadge loan={loan} />
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </li>
                );
              })}
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
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getLoanTitle(loan: AgentLoan): string {
  return (loan as AgentLoan & { product?: { name?: string } }).product?.name
    ? (loan as AgentLoan & { product?: { name?: string } }).product?.name ?? ""
    : formatCurrency(loan.principal_amount);
}

function getLoanBorrowerLabel(loan: AgentLoan): string {
  return (
    loan.borrower?.full_name ??
    (loan.borrower ? `${loan.borrower.first_name} ${loan.borrower.last_name}` : null) ??
    "Borrower details unavailable"
  );
}

function fmtShortDate(value: string): string {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function LoanDueBadge({ loan }: { loan: AgentLoan }) {
  const normalizedStatus = loan.status.toLowerCase().trim();
  if (normalizedStatus === "completed" || normalizedStatus === "defaulted") {
    return null;
  }

  if (!loan.due_date) return null;

  const dueDate = loan.due_date.includes("T")
    ? new Date(loan.due_date)
    : new Date(`${loan.due_date}T00:00:00`);
  if (Number.isNaN(dueDate.getTime())) return null;

  const today = new Date();
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  if (due === current) {
    return (
      <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning ring-1 ring-inset ring-warning/20">
        Due today
      </span>
    );
  }

  if (due < current && normalizedStatus !== "overdue") {
    return (
      <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger ring-1 ring-inset ring-danger/20">
        Past due
      </span>
    );
  }

  return null;
}

const SEAL_GRADIENTS: Record<
  AgentLoanDailyActivityStatus,
  { background: string; title: string }
> = {
  unopened: {
    background: "linear-gradient(90deg, hsl(38 92% 50% / 0.22) 0%, transparent 55%)",
    title: "Loan has not been opened today",
  },
  opened: {
    background: "linear-gradient(90deg, hsl(210 100% 56% / 0.20) 0%, transparent 55%)",
    title: "Loan has been opened today",
  },
  paid: {
    background: "linear-gradient(90deg, hsl(142 71% 45% / 0.22) 0%, transparent 55%)",
    title: "Payment has been recorded today",
  },
};

function getLoanSealGradient(
  activity: AgentLoanDailyActivity,
  loan: AgentLoan,
): React.CSSProperties | undefined {
  if (!isRepayableAgentLoanStatus(loan.status)) return undefined;
  const status = getAgentLoanDailyActivityStatus(activity, loan.id);
  return { background: SEAL_GRADIENTS[status].background };
}

function SealLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/30 px-4 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Today’s Activity:
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "linear-gradient(90deg, hsl(38 92% 50% / 0.35), hsl(38 92% 50% / 0.08))" }}
        />
        <span className="text-[11px] text-muted-foreground">Unopened</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "linear-gradient(90deg, hsl(210 100% 56% / 0.35), hsl(210 100% 56% / 0.08))" }}
        />
        <span className="text-[11px] text-muted-foreground">Opened</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "linear-gradient(90deg, hsl(142 71% 45% / 0.40), hsl(142 71% 45% / 0.10))" }}
        />
        <span className="text-[11px] text-muted-foreground">Paid</span>
      </div>
    </div>
  );
}

function CreateLoanForm({ onSuccess }: { onSuccess: () => void }) {
  const [createLoan, { isLoading, isError, error }] = useCreateAgentLoanMutation();
  const { data: borrowersRes, isLoading: borrowersLoading } = useGetAgentBorrowersQuery();
  const { data: productsRes, isLoading: productsLoading } = useGetAgentProductsQuery();
  const { toast } = useToast();

  const borrowers = borrowersRes?.data?.data ?? [];
  const products = productsRes?.data ?? [];
  const activeProducts = products.filter((product) => product.is_active);

  const [borrowerId, setBorrowerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const selectedProduct = activeProducts.find((product) => product.id === productId) as
    | LoanProduct
    | undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!borrowerId || !productId) return;

    try {
      await createLoan({
        borrower_id: borrowerId,
        loan_product_id: productId,
        quantity: Number(quantity),
      }).unwrap();

      toast({
        title: "Loan created",
        description: `${selectedProduct?.name ?? "Loan"} has been issued successfully.`,
      });
      setBorrowerId("");
      setProductId("");
      setQuantity("1");
      onSuccess();
    } catch {
      // Inline error text keeps the fix in context.
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
      className="animate-in slide-in-from-top-2 rounded-xl border bg-card p-4 space-y-4 duration-200"
    >
      <p className="text-sm font-semibold">Issue Loan</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Borrower *</label>
          <select
            value={borrowerId}
            onChange={(event) => setBorrowerId(event.target.value)}
            className="input-field mt-1"
            required
            disabled={borrowersLoading}
          >
            <option value="">
              {borrowersLoading ? "Loading..." : "Select a borrower"}
            </option>
            {borrowers.map((borrower) => (
              <option key={borrower.id} value={borrower.id}>
                {borrower.first_name} {borrower.last_name} — {borrower.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Loan Deal *</label>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="input-field mt-1"
            required
            disabled={productsLoading}
          >
            <option value="">{productsLoading ? "Loading..." : "Select a deal"}</option>
            {activeProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatCurrency(product.principal_amount)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>
      </div>

      {selectedProduct && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deal Preview
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{selectedProduct.interest_rate}% interest</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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
          {getApiErrorMessage(error, "Failed to create loan")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !borrowerId || !productId}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Issue Loan"}
      </button>
    </form>
  );
}
