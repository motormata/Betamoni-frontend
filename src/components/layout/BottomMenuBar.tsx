import { NavLink } from "react-router-dom";
import { getMenuItems } from "@/config/navigation.config";
import type { UserRole } from "@/types/auth.types";

// ── Bottom Menu Bar ────────────────────────────────────────────────

interface BottomMenuBarProps {
  /** Current user's role — used to filter visible tabs */
  role?: UserRole | null;
}

export function BottomMenuBar({ role }: BottomMenuBarProps) {
  const items = getMenuItems(role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-center justify-around h-16">
        {items.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-5 w-5 transition-transform ${
                      isActive ? "scale-110" : ""
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
