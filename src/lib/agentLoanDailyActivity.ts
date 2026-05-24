import type { UUID } from "@/types/common.types";

const STORAGE_PREFIX = "betamoni:agent-loan-daily-activity";

export type AgentLoanDailyActivityStatus = "unopened" | "opened" | "paid";

export interface AgentLoanDailyActivityEntry {
  openedAt?: string;
  paidAt?: string;
}

export type AgentLoanDailyActivity = Record<UUID, AgentLoanDailyActivityEntry>;

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isRepayableAgentLoanStatus(status: string | null | undefined): boolean {
  const normalized = status?.toLowerCase().trim();
  return normalized === "active" || normalized === "disbursed" || normalized === "defaulted";
}

export function readAgentLoanDailyActivity(
  agentId: UUID | null | undefined,
  dateKey = getLocalDateKey(),
): AgentLoanDailyActivity {
  if (!agentId) return {};

  try {
    const raw = localStorage.getItem(getStorageKey(agentId, dateKey));
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return isActivityMap(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getAgentLoanDailyActivityStatus(
  activity: AgentLoanDailyActivity,
  loanId: UUID,
): AgentLoanDailyActivityStatus {
  const entry = activity[loanId];

  if (entry?.paidAt) return "paid";
  if (entry?.openedAt) return "opened";
  return "unopened";
}

export function markAgentLoanOpened(
  agentId: UUID | null | undefined,
  loanId: UUID,
  dateKey = getLocalDateKey(),
): void {
  updateActivity(agentId, loanId, dateKey, (entry, timestamp) => ({
    ...entry,
    openedAt: entry.openedAt ?? timestamp,
  }));
}

export function markAgentLoanPaid(
  agentId: UUID | null | undefined,
  loanId: UUID,
  dateKey = getLocalDateKey(),
): void {
  updateActivity(agentId, loanId, dateKey, (entry, timestamp) => ({
    ...entry,
    openedAt: entry.openedAt ?? timestamp,
    paidAt: timestamp,
  }));
}

function updateActivity(
  agentId: UUID | null | undefined,
  loanId: UUID,
  dateKey: string,
  updateEntry: (
    entry: AgentLoanDailyActivityEntry,
    timestamp: string,
  ) => AgentLoanDailyActivityEntry,
): void {
  if (!agentId) return;

  try {
    const activity = readAgentLoanDailyActivity(agentId, dateKey);
    activity[loanId] = updateEntry(activity[loanId] ?? {}, new Date().toISOString());
    localStorage.setItem(getStorageKey(agentId, dateKey), JSON.stringify(activity));
  } catch {
    // Local daily markers are a UX aid; payment recording must not depend on storage.
  }
}

function getStorageKey(agentId: UUID, dateKey: string): string {
  return `${STORAGE_PREFIX}:${agentId}:${dateKey}`;
}

function isActivityMap(value: unknown): value is AgentLoanDailyActivity {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
