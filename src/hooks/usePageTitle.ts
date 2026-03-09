import { useLocation } from "react-router-dom";
import { pageTitleMap } from "@/config/navigation.config";

/**
 * Returns the human-readable page title for the current route.
 * Falls back to "BetaMoni" if the route isn't in the map.
 */
export function usePageTitle(): string {
  const { pathname } = useLocation();
  return pageTitleMap[pathname] ?? "BetaMoni";
}
