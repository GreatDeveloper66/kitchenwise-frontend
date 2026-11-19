// Client for kitchenwise-meal-plan-service (OpenAI). Routes: src/server.ts,
// handlers: src/controllers/Controllers.ts. No auth.
// Responses are wrapped as { success, data?, error? }.
import { mealPlanApi, toApiError } from './api';
import type { DietProfileValues } from './dietProfileService';
import type { MealPlan, MealPlanWithPrice } from './types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** One image URL per meal, in the same order as the plan's meals. */
export interface MealPlanImages {
  MealPlanImagesUrls: { mealImageUrl: string }[];
}

/**
 * The generator needs every profile field, including dietaryPreferences.
 * Pass the diet profile from getDietProfile(); extra fields like _id are ignored.
 */
export type MealPlanRequest = Required<DietProfileValues>;

// AI generation can take a while; fail after 90 seconds instead of hanging
const AI_TIMEOUT_MS = 90_000;

function unwrap<T>(body: ApiResponse<T>, fallback: string): T {
  if (!body.success || !body.data) {
    throw new Error(body.error ?? fallback);
  }
  return body.data;
}

function toRequest(profile: MealPlanRequest): MealPlanRequest {
  // Send only the fields the service validates, not the stored document's _id/userId
  const { age, sex, weight, height, activityLevel, dietaryPreferences, budgetLevel } = profile;
  return { age, sex, weight, height, activityLevel, dietaryPreferences, budgetLevel };
}

export async function generateMealPlan(profile: MealPlanRequest): Promise<MealPlan> {
  const fallback = 'Could not generate a meal plan. Please try again.';
  try {
    const { data } = await mealPlanApi.post<ApiResponse<MealPlan>>('/meal-plan', toRequest(profile), {
      timeout: AI_TIMEOUT_MS,
    });
    return unwrap(data, fallback);
  } catch (err) {
    throw toApiError(err, fallback);
  }
}

export async function generateMealPlanWithPrice(profile: MealPlanRequest): Promise<MealPlanWithPrice> {
  const fallback = 'Could not generate a priced meal plan. Please try again.';
  try {
    const { data } = await mealPlanApi.post<ApiResponse<MealPlanWithPrice>>(
      '/meal-plan-with-price',
      toRequest(profile),
      { timeout: AI_TIMEOUT_MS }
    );
    return unwrap(data, fallback);
  } catch (err) {
    throw toApiError(err, fallback);
  }
}

/**
 * Generates one DALL-E image per meal. Slow and billable (one image per meal).
 * The URLs expire after about an hour, so display them; don't treat them as permanent.
 */
export async function generateMealPlanImages(plan: MealPlan): Promise<MealPlanImages> {
  const fallback = 'Could not generate meal images.';
  // The service validates meals strictly; strip frontend-only fields before sending
  const body: MealPlan = {
    id: plan.id,
    date: plan.date,
    meals: plan.meals.map(({ id, name, foods }) => ({ id, name, foods })),
  };
  try {
    const { data } = await mealPlanApi.post<ApiResponse<MealPlanImages>>('/meal-plan-images', body, {
      timeout: AI_TIMEOUT_MS,
    });
    return unwrap(data, fallback);
  } catch (err) {
    throw toApiError(err, fallback);
  }
}
