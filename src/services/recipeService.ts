// Client for kitchenwise-recipe-service (OpenAI). Route: POST /api/get-recipe in src/index.ts,
// schemas: src/schemas/recipeSchemas.ts. No auth. Errors are { error, details? }.
import { recipeApi, toApiError } from './api';
import type { Meal } from './types';

export const UNITS = ['g', 'ml', 'oz', 'lb', 'each', 'tsp', 'tbsp', 'cup', 'slice'] as const;
export type Unit = (typeof UNITS)[number];

export interface Ingredient {
  name: string;
  /** Matches a name in the grocery price list, or null when there's no match (price unavailable). */
  standardName: string | null;
  quantity: number;
  unit: Unit;
  preparation: string | null;
  /** Human-readable line, e.g. "2 large eggs, scrambled". */
  display: string;
}

export interface Recipe {
  title: string;
  servings: number;
  /** Minutes */
  prepTime: number;
  /** Minutes */
  cookTime: number;
  description: string;
  ingredients: Ingredient[];
  directions: string[];
}

const AI_TIMEOUT_MS = 90_000;

/** Generates a recipe for one meal from a meal plan. The meal needs at least one food. */
export async function getRecipe(meal: Meal): Promise<Recipe> {
  // The service takes only id, name, and foods
  const { id, name, foods } = meal;
  try {
    const { data } = await recipeApi.post<Recipe>(
      '/get-recipe',
      { id, name, foods },
      { timeout: AI_TIMEOUT_MS }
    );
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not generate a recipe. Please try again.');
  }
}
