import { Loader2, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

export interface EndpointResult {
  data?: unknown;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isSuccess: boolean;
  isUninitialized: boolean;
}

interface EndpointCardProps {
  method: "GET" | "POST";
  path: string;
  description?: string;
  result: EndpointResult;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  children?: React.ReactNode;
}

// ── Endpoint Card ──────────────────────────────────────────────────

export function EndpointCard({
  method,
  path,
  description,
  result,
  onSubmit,
  submitLabel = "Send Request",
  children,
}: EndpointCardProps) {
  const hasResponse = !result.isUninitialized;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Card Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b bg-muted/30">
        <MethodBadge method={method} />
        <div className="min-w-0">
          <code className="text-sm font-mono font-semibold text-foreground break-all">
            {path}
          </code>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="p-4 space-y-4">
        {children}
        <button
          type="submit"
          disabled={result.isLoading}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {result.isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{method === "GET" ? "Fetching…" : "Sending…"}</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </form>

      {/* Response Viewer */}
      {hasResponse && (
        <div className="border-t">
          <ResponseViewer result={result} />
        </div>
      )}
    </div>
  );
}

// ── Method Badge ───────────────────────────────────────────────────

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  const isGet = method === "GET";
  return (
    <span
      className={`shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold font-mono tracking-wider ${
        isGet
          ? "bg-blue-100 text-blue-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {method}
    </span>
  );
}

// ── Response Viewer ────────────────────────────────────────────────

function ResponseViewer({ result }: { result: EndpointResult }) {
  const { data, isLoading, isError, isSuccess, error } = result;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Waiting for response…</span>
      </div>
    );
  }

  const payload = isError ? extractErrorPayload(error) : data;
  const jsonString = formatJson(payload);

  return (
    <div className="p-4 space-y-2">
      {/* Status row */}
      <div className="flex items-center gap-2">
        {isSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        )}
        {isError && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
            <AlertCircle className="h-3 w-3" />
            Error
          </span>
        )}
        <span className="text-xs text-muted-foreground">Response</span>
      </div>

      {/* JSON block */}
      <div
        className={`rounded-lg border text-xs font-mono overflow-auto max-h-72 p-3 leading-relaxed whitespace-pre ${
          isError
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-muted/50 border-border text-foreground"
        }`}
      >
        {jsonString}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function extractErrorPayload(error: unknown): unknown {
  if (error && typeof error === "object") {
    // FetchBaseQueryError with data envelope
    if ("data" in error && error.data !== undefined) return error.data;
    // FetchBaseQueryError with plain error string
    if ("error" in error) return { error: (error as { error: string }).error };
  }
  return error ?? { error: "Unknown error" };
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// ── Field Group (re-exported for page use) ─────────────────────────

interface FieldGroupProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FieldGroup({ label, required, hint, children }: FieldGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── No-children GET card helper ────────────────────────────────────

export function EmptyNotice() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
      <Clock className="h-3.5 w-3.5" />
      <span>No parameters required — click Send Request to fetch.</span>
    </div>
  );
}
