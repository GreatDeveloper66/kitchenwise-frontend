import type { Meal } from '../services/types';

export type Nutrient = 'calories' | 'protein' | 'carbs' | 'fat';

/** Total of one nutrient across every food in the given meals, rounded to a whole number. */
export function sumFoods(meals: Meal[], field: Nutrient): number {
  return Math.round(
    meals.reduce((total, meal) => total + meal.foods.reduce((sum, food) => sum + food[field], 0), 0)
  );
}

/** Total price of the meals that have one, or undefined if none do (an unpriced plan). */
export function sumPrices(meals: Meal[]): number | undefined {
  const priced = meals.filter((meal) => meal.price !== undefined);
  if (priced.length === 0) return undefined;
  return priced.reduce((total, meal) => total + (meal.price ?? 0), 0);
}

/** Grams for display, rounded to a whole number. */
export function formatGrams(value: number): string {
  return `${Math.round(value)}g`;
}
