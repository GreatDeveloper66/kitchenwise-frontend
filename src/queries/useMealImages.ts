import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addImagesToPlan } from '../services/planSetupService';
import type { SavedPlan } from '../services/planStorageService';
import { queryKeys } from './queryKeys';

// A plan is one day. Older plans from the 21-meal prompt are skipped rather than
// paying for 21 images.
const MAX_MEALS_FOR_IMAGES = 3;

// Plans already tried in this page load. Module-level, so StrictMode's double effect
// and remounts can't start a second (billable) image request for the same plan.
const attemptedPlanIds = new Set<string>();

/**
 * Fills in meal pictures for the saved plan in the background, if any are missing.
 * Runs at most once per plan per page load. If it fails, the meal cards keep their
 * placeholder and it tries again on the next visit; it never retries in a loop.
 * This also covers plans whose images were interrupted (tab closed, server error).
 */
export function useMealImages(saved: SavedPlan | null | undefined): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!saved) return;
    const meals = saved.mealPlan.meals;
    if (meals.length === 0 || meals.length > MAX_MEALS_FOR_IMAGES) return;
    if (meals.every((meal) => meal.image)) return;
    if (attemptedPlanIds.has(saved._id)) return;
    attemptedPlanIds.add(saved._id);

    addImagesToPlan(saved)
      .then((updated) => {
        // Only update the cache if it still holds this plan (the user may have logged out)
        const current = queryClient.getQueryData<SavedPlan | null>(queryKeys.latestPlan);
        if (current?._id === saved._id) {
          queryClient.setQueryData(queryKeys.latestPlan, updated);
        }
      })
      .catch((err: unknown) => {
        // Pictures are optional; the cards show a placeholder instead
        console.warn('Could not add meal images:', err instanceof Error ? err.message : err);
      });
  }, [saved, queryClient]);
}
