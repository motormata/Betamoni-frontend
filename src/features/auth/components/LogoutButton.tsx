import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/api/endpoints/authApi";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  /** Show as icon-only button */
  iconOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function LogoutButton({
  iconOnly = false,
  className,
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // clearCredentials is dispatched optimistically by authApi
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={isLoading}
        className={className}
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
