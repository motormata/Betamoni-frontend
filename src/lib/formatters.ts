// ── Shared formatting utilities ────────────────────────────────────
// Extracted from duplicate definitions across overview dashboards

/** Format a number as Nigerian Naira */
export function fmt(value: number): string {
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

/** Format a numeric input value with thousands separators while typing. */
export function formatAmountInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

/** Parse a formatted amount input back into the number sent to the API. */
export function parseAmountInput(value: unknown): number {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

/** Safely cast an unknown summary value to string | number */
export function val(v: unknown): string | number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return v;
  return "—";
}

/** Format unknown value as Nigerian Naira currency string */
export function formatCurrency(value: unknown): string {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}
