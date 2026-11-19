// Client for kitchenwise-plan-storage-service. Routes: src/app.ts,
// schema: src/schemas/Schemas.ts. All /api routes need the user-auth token.
// A user can save many plans; get, update, and delete act on the newest one.
import { planStorageApi, toApiError } from './api';
import type { MealPlan } from './types';

/** Request body for create and update. */
export interface SavePlanValues {
  /** ISO date string the plan is for. */
  date: string;
  mealPlan: MealPlan;
}

/** The stored Mongo document. */
export interface SavedPlan extends SavePlanValues {
  _id: string;
  userId: string;
}

export async function savePlan(values: SavePlanValues): Promise<SavedPlan> {
  try {
    const { data } = await planStorageApi.post<SavedPlan>('/create-user-meal-plan', values);
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not save your meal plan.');
  }
}

/** The newest saved plan, or null if the user has none (the server returns 200 with null). */
export async function getLatestPlan(): Promise<SavedPlan | null> {
  try {
    const { data } = await planStorageApi.get<SavedPlan | null>('/get-user-meal-plan');
    return data ?? null;
  } catch (err) {
    throw toApiError(err, 'Could not load your meal plan.');
  }
}

/**
 * Replaces the newest saved plan. The server echoes back the body it was sent, not the stored
 * document, and returns 200 even when the user has no plan to update.
 */
export async function updateLatestPlan(values: SavePlanValues): Promise<SavePlanValues> {
  try {
    const { data } = await planStorageApi.patch<SavePlanValues>('/update-user-meal-plan', values);
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not update your meal plan.');
  }
}

/** Deletes the newest saved plan. Returns false if there was none. */
export async function deleteLatestPlan(): Promise<boolean> {
  try {
    const { data } = await planStorageApi.delete<{ acknowledged: boolean; deletedCount: number }>(
      '/delete-user-meal-plan'
    );
    return data.deletedCount > 0;
  } catch (err) {
    throw toApiError(err, 'Could not delete your meal plan.');
  }
}
