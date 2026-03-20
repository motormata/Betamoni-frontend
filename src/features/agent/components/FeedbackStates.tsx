import { Loader2, AlertCircle, Inbox } from "lucide-react";

// ── Empty State ────────────────────────────────────────────────────

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "No records found" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-10 w-10 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Loading State ──────────────────────────────────────────────────

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

// ── Error State ────────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = "Something went wrong" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-destructive">
      <AlertCircle className="h-8 w-8 mb-2 opacity-60" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
