import {
  LayoutDashboard,
  Banknote,
  Users,
  Users2,
  UserCog,
  CreditCard,
  ShieldCheck,
  Package,
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
    icon: Package,
    label: "Deals",
    path: "/products",
    allowedRoles: ["super-admin"],
  },
  {
    icon: Banknote,
    label: "Finance",
    path: "/finance",
    allowedRoles: ["super-admin"],
  },
  {
    icon: Banknote,
    label: "Loans",
    path: "/loans",
    allowedRoles: ["supervisor", "agent"],
  },
  {
    icon: Users2,
    label: "Borrowers",
    path: "/borrowers",
    allowedRoles: ["agent"],
  },
  {
    icon: CreditCard,
    label: "Payments",
    path: "/payments",
    allowedRoles: ["agent"],
  },
  {
    icon: ShieldCheck,
    label: "Agents",
    path: "/agents",
    allowedRoles: ["supervisor"],
  },
  {
    icon: Users,
    label: "Clusters",
    path: "/clusters",
    allowedRoles: ["super-admin"],
  },
  {
    icon: UserCog,
    label: "Staff",
    path: "/staff",
    allowedRoles: ["super-admin"],
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
  "/finance": "Finance",
  "/products": "Loan Deals",
  "/loans": "Loans",
  "/borrowers": "Borrowers",
  "/payments": "Payments",
  "/agents": "Agents",
  "/clusters": "Clusters",
  "/staff": "Staff",
  "/settings": "Settings",
};
