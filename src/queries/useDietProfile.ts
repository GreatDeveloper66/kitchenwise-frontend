import { useQuery } from '@tanstack/react-query';
import { getDietProfile } from '../services/dietProfileService';
import { queryKeys } from './queryKeys';

/** The signed-in user's diet profile. `data` is null if they haven't created one. */
export function useDietProfile() {
  return useQuery({ queryKey: queryKeys.dietProfile, queryFn: getDietProfile });
}
