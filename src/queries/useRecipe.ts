import { useQuery } from '@tanstack/react-query';
import { getRecipe } from '../services/recipeService';
import type { Meal } from '../services/types';
import { queryKeys } from './queryKeys';

/**
 * The recipe for one meal. It only runs when `requested` is true, because generating a recipe
 * is a slow, billable AI call. Once made it stays in memory for the session, so reopening the
 * meal shows it straight away (any cached recipe is returned even while `requested` is false).
 * Failed requests aren't retried automatically for the same reason: the user retries on purpose.
 */
export function useRecipe(meal: Meal | undefined, requested: boolean) {
  return useQuery({
    queryKey: queryKeys.recipe(meal?.id ?? ''),
    queryFn: () => {
      if (!meal) throw new Error('Meal not found.');
      return getRecipe(meal);
    },
    enabled: requested && meal !== undefined,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });
}
