import { useEffect, useState, type ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import { useLazyGetCurrentUserQuery } from "@/api/endpoints/authApi";

// ── Loading Splash Screen ──────────────────────────────────────────

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative">
          {/* Animated spinner */}
          <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-primary mx-auto" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Loading BetaMoni...
        </p>
      </div>
    </div>
  );
}

// ── Auth Provider ──────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app and rehydrates auth state on mount.
 * - If a token exists in localStorage (loaded into Redux by authSlice initial state),
 *   it calls GET /api/me to validate the token and fetch user data.
 * - Shows a loading screen while the auth check is in progress.
 * - If the token is invalid, authApi.getCurrentUser's onQueryStarted
 *   will dispatch clearCredentials automatically.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isChecking, setIsChecking] = useState(true);
  const token = useAppSelector((state) => state.auth.token);
  const [triggerGetUser] = useLazyGetCurrentUserQuery();

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Validate token by fetching current user
          await triggerGetUser().unwrap();
        } catch {
          // Token invalid — clearCredentials dispatched by onQueryStarted
        }
      }
      setIsChecking(false);
    };

    checkAuth();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isChecking) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
