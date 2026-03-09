import {
  LayoutDashboard,
  Banknote,
  Users,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/auth.types";

// ── Menu Item Definition ───────────────────────────────────────────

export interface MenuItem {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Display label */
  label: string;
  /** Route path */
  path: string;
  /** Roles that can see this item */
  allowedRoles: UserRole[];
}

// ── All Navigation Items ───────────────────────────────────────────

const allMenuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    path: "/dashboard",
    allowedRoles: ["super-admin", "supervisor", "agent"],
  },
  {
    icon: Banknote,
    label: "Loans",
    path: "/loans",
    allowedRoles: ["super-admin", "supervisor", "agent"],
  },
  {
    icon: Users,
    label: "Clusters",
    path: "/clusters",
    allowedRoles: ["super-admin", "supervisor"],
  },
  {
    icon: UserCog,
    label: "Staff",
    path: "/staff",
    allowedRoles: ["super-admin"],
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    allowedRoles: ["super-admin", "supervisor", "agent"],
  },
];

// ── Filtered Menu Items by Role ────────────────────────────────────

/**
 * Returns the menu items visible to a given role.
 * If no role is provided, returns all items (for layout fallback).
 */
export function getMenuItems(role?: UserRole | null): MenuItem[] {
  if (!role) return allMenuItems;
  return allMenuItems.filter((item) => item.allowedRoles.includes(role));
}

// ── Page Title Map ─────────────────────────────────────────────────

/**
 * Maps route paths to human-readable page titles.
 * Used by the AppHeader to display the current page name.
 */
export const pageTitleMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/loans": "Loans",
  "/clusters": "Clusters",
  "/staff": "Staff",
  "/settings": "Settings",
};
