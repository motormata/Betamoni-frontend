import { useState } from "react";
import { MoreVertical, ArrowRightLeft } from "lucide-react";
import type { StaffUser, StaffRole } from "@/types/staff.types";
import { MoveAgentModal } from "./MoveAgentModal";

// ── Tab Definitions ────────────────────────────────────────────────

const TABS: { role: StaffRole; label: string }[] = [
  { role: "super-admin", label: "Super Admins" },
  { role: "supervisor", label: "Supervisors" },
  { role: "agent", label: "Agents" },
];

// ── Props ──────────────────────────────────────────────────────────

interface UserListTabsProps {
  users: StaffUser[];
}

// ── Component ──────────────────────────────────────────────────────

export function UserListTabs({ users }: UserListTabsProps) {
  const [activeRole, setActiveRole] = useState<StaffRole>("super-admin");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [moveAgent, setMoveAgent] = useState<StaffUser | null>(null);

  const filtered = users.filter((u) => u.role === activeRole);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map(({ role, label }) => {
          return (
            <button
              key={role}
              onClick={() => {
                setActiveRole(role);
                setActionMenuId(null);
              }}
              className={`flex-1 py-4 px-2 text-xs font-semibold border-b-2 transition-colors ${
                activeRole === role
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* User list */}
      <div className="divide-y">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No {TABS.find((t) => t.role === activeRole)?.label.toLowerCase()} found.
          </div>
        ) : (
          filtered.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isMenuOpen={actionMenuId === user.id}
              onMenuToggle={() =>
                setActionMenuId((prev) => (prev === user.id ? null : user.id))
              }
              onMoveAgent={() => {
                setMoveAgent(user);
                setActionMenuId(null);
              }}
            />
          ))
        )}
      </div>

      {/* Move Agent Modal */}
      {moveAgent && (
        <MoveAgentModal
          agent={moveAgent}
          onClose={() => setMoveAgent(null)}
        />
      )}
    </div>
  );
}

// ── User Row ───────────────────────────────────────────────────────

interface UserRowProps {
  user: StaffUser;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMoveAgent: () => void;
}

function UserRow({ user, isMenuOpen, onMenuToggle, onMoveAgent }: UserRowProps) {
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const roleColors: Record<StaffUser["role"], string> = {
    "super-admin": "bg-violet-500/20 text-violet-600",
    supervisor: "bg-sky-500/20 text-sky-600",
    agent: "bg-emerald-500/20 text-emerald-600",
  };

  const hasActions = user.role === "agent";

  return (
    <div className="flex items-center gap-3 px-4 py-3 relative">
      {/* Avatar */}
      <div
        className={`h-9 w-9 rounded-full ${roleColors[user.role]} flex items-center justify-center shrink-0 text-sm font-bold`}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{user.name}</p>
          {user.is_active === 0 && (
            <span className="text-[9px] font-semibold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded shrink-0">
              Inactive
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {user.market ?? (
            <span className="text-amber-500 font-medium">Unassigned</span>
          )}
          {user.agent_code && (
            <span className="ml-2 font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
              {user.agent_code}
            </span>
          )}
        </p>
      </div>

      {/* Action button — only for agents */}
      {hasActions && (
        <div className="relative shrink-0">
          <button
            onClick={onMenuToggle}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Agent actions"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border bg-card shadow-lg overflow-hidden">
              <button
                onClick={onMoveAgent}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
              >
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Move Agent
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
