import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/api/endpoints/authApi";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-errors";

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
  const { toast } = useToast();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast({
        title: "Signed out",
        description: "Your session has been closed on this device.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signed out locally",
        description: getApiErrorMessage(
          error,
          "We could not confirm logout with the server, but your local session was cleared.",
        ),
      });
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
