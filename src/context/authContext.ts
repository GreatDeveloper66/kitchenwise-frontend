import { createContext } from 'react';
import type { AuthUser, LoginResponse } from '../services/authService';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Stores the token and user from /login or /register. */
  signIn: (auth: LoginResponse) => void;
  /** Logs out through user-auth, clears the session, and drops every cached query. */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
