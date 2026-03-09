import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { AppHeader } from "./AppHeader";
import { BottomMenuBar } from "./BottomMenuBar";

// ── App Layout Shell ───────────────────────────────────────────────

/**
 * Primary layout for all authenticated pages.
 *
 * Structure:
 * ┌──────────────────────────┐
 * │  AppHeader (sticky top)  │
 * ├──────────────────────────┤
 * │  <Outlet />  (scrolls)   │
 * ├──────────────────────────┤
 * │  BottomMenuBar (fixed)   │
 * └──────────────────────────┘
 */
export function AppLayout() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header — sticky top */}
      <AppHeader />

      {/* Content — scrollable, padded from bottom bar */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Menu — fixed bottom */}
      <BottomMenuBar role={user?.role} />
    </div>
  );
}
