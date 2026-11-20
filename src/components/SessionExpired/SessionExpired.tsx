import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageStatus } from '../PageStatus/PageStatus';

/**
 * Rendered when a protected service answers 401 (token expired or invalid).
 * Signing out sets the user to null, and ProtectedRoute then redirects to the login page.
 */
export function SessionExpired() {
  const { signOut } = useAuth();

  useEffect(() => {
    void signOut();
  }, [signOut]);

  return <PageStatus message="Your session has expired. Please log in again." busy />;
}
