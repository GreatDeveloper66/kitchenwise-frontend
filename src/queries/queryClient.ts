import { QueryClient } from '@tanstack/react-query';
import { errorStatus } from '../services/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Profile and plan only change when this app changes them, and those mutations
      // update the cache directly, so there's no need to refetch on every page or focus.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // Retry network blips once, but not auth or validation failures
      retry: (failureCount, error) => {
        const status = errorStatus(error);
        if (status !== undefined && status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});
