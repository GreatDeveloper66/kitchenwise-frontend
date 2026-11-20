// Turns a diet profile into a saved meal plan: generate with kitchenwise-meal-plan-service,
// then store with kitchenwise-plan-storage-service. Used by onboarding now, and by
// profile editing later (a new plan is generated only when the profile changes).
//
// Simplification: the browser orchestrates two services in a row. If the tab closes between
// the two calls, the generated plan is lost and has to be generated again.
import {
  generateMealPlanImages,
  generateMealPlanWithPrice,
  type MealPlanRequest,
} from './mealPlanService';
import { savePlan, updateLatestPlan, type SavedPlan } from './planStorageService';
import type { Meal, MealName, MealPlan } from './types';

const MEAL_ORDER: MealName[] = ['breakfast', 'lunch', 'dinner'];

// Where kitchenwise-meal-plan-service stores meal images (Vercel Blob, public store)
const PERMANENT_IMAGE_HOST = '.public.blob.vercel-storage.com';

/** Today's date as YYYY-MM-DD in the user's own time zone. */
function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function toPrice(value: unknown): number | undefined {
  const price = typeof value === 'string' ? Number(value) : value;
  return typeof price === 'number' && Number.isFinite(price) ? price : undefined;
}

/**
 * The plan comes straight from the AI, so its id, date, and prices aren't guaranteed to be
 * in the shape plan-storage validates (for example "date": "string"). Fill in what's missing
 * so the save doesn't fail on a 400.
 */
function prepareForStorage(plan: MealPlan, date: string): MealPlan {
  // A plan is one day. If the AI returns extra meals anyway, keep the first of each kind.
  const oneDay = MEAL_ORDER.map((name) => plan.meals.find((meal) => meal.name === name)).filter(
    (meal): meal is Meal => meal !== undefined
  );

  return {
    id: plan.id || crypto.randomUUID(),
    date,
    meals: oneDay.map((meal) => ({
      id: meal.id || crypto.randomUUID(),
      name: meal.name,
      foods: meal.foods,
      price: toPrice(meal.price),
    })),
  };
}

/** Generates a priced plan for the profile. Slow (AI call) and billable. */
export async function generatePlan(profile: MealPlanRequest): Promise<MealPlan> {
  const plan = await generateMealPlanWithPrice(profile);
  return prepareForStorage(plan, todayIsoDate());
}

/** Saves a plan from generatePlan() as the user's newest plan. */
export function storePlan(plan: MealPlan): Promise<SavedPlan> {
  return savePlan({ date: plan.date, mealPlan: plan });
}

/**
 * Generates one picture per meal and saves the permanent URLs into the user's newest plan.
 * Slow (one DALL-E image per meal) and billable, so callers must not repeat it needlessly.
 * Returns the plan with images filled in.
 */
export async function addImagesToPlan(saved: SavedPlan): Promise<SavedPlan> {
  const { MealPlanImagesUrls } = await generateMealPlanImages(saved.mealPlan);

  // The meal-plan service stores images in Vercel Blob and returns permanent links. An older
  // deployment returns DALL-E links that expire in about an hour; saving those would leave
  // broken pictures that are never regenerated, so refuse them.
  const allPermanent = MealPlanImagesUrls.every(({ mealImageUrl }) => {
    try {
      return new URL(mealImageUrl).hostname.endsWith(PERMANENT_IMAGE_HOST);
    } catch {
      return false;
    }
  });
  if (!allPermanent) {
    throw new Error('The meal-plan service returned temporary image links. Deploy the Blob storage change.');
  }

  const mealPlan: MealPlan = {
    ...saved.mealPlan,
    meals: saved.mealPlan.meals.map((meal, index) => ({
      ...meal,
      image: MealPlanImagesUrls[index]?.mealImageUrl ?? meal.image,
    })),
  };
  await updateLatestPlan({ date: saved.date, mealPlan });
  return { ...saved, mealPlan };
}
