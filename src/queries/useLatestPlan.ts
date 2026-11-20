import { useQuery } from '@tanstack/react-query';
import { getLatestPlan } from '../services/planStorageService';
import { queryKeys } from './queryKeys';

/** The signed-in user's newest saved meal plan. `data` is null if they have none. */
export function useLatestPlan() {
  return useQuery({ queryKey: queryKeys.latestPlan, queryFn: getLatestPlan });
}
