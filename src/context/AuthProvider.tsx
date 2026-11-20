import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getUser,
  isAuthenticated as hasStoredToken,
  logout,
  saveSession,
  type AuthUser,
  type LoginResponse,
} from '../services/authService';
import { AuthContext, type AuthContextValue } from './authContext';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Single source of truth for the session. Pages and components read the user from here
 * instead of reading localStorage themselves.
 * Simplification: the token still lives in localStorage (see services/api.ts).
 */
export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => (hasStoredToken() ? getUser() : null));

  const signIn = useCallback(
    (auth: LoginResponse) => {
      // A different user may have been signed in on this browser; never show their data
      queryClient.clear();
      saveSession(auth);
      setUser(auth.user);
    },
    [queryClient]
  );

  const signOut = useCallback(async () => {
    await logout();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
