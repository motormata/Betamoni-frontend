import { Menu, EllipsisVertical, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAppSelector } from "@/store/hooks";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ── App Header ─────────────────────────────────────────────────────

interface AppHeaderProps {
  /** Callback when options (three-dot) button is tapped */
  onOptionsOpen?: () => void;
}

export function AppHeader({ onOptionsOpen }: AppHeaderProps) {
  const pageTitle = usePageTitle();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Left — Hamburger Menu (Side Drawer) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[80vw] sm:max-w-sm flex flex-col p-0"
        >
          <SheetHeader className="p-6 pb-2 text-left border-b bg-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <SheetTitle className="text-base font-semibold leading-none">
                  {user?.name || "Admin User"}
                </SheetTitle>
                <span className="text-sm text-muted-foreground mt-1 truncate max-w-[200px]">
                  {user?.email}
                </span>
                <span className="text-xs font-medium text-primary mt-1 capitalize bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                  {user?.role_name || user?.role}
                </span>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 p-6 space-y-4">
            {/* Additional menu items could go here in the future */}
          </div>

          <div className="p-6 pt-0 mt-auto border-t bg-muted/10">
            <LogoutButton className="w-full justify-start mt-4 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Center — Page Title */}
      <h1 className="text-base font-semibold leading-none tracking-tight">
        {pageTitle}
      </h1>

      {/* Right — Options */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onOptionsOpen}
        aria-label="More options"
      >
        <EllipsisVertical className="h-5 w-5" />
      </Button>
    </header>
  );
}
