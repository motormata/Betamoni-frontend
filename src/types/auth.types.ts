// ── User & Role Types ──────────────────────────────────────────────

export type UserRole = "superadmin" | "supervisor" | "agent";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// ── Auth Request/Response Types ────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// ── Redux Auth State ───────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
