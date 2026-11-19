// Meal plan shapes shared by kitchenwise-meal-plan-service (generates them),
// kitchenwise-plan-storage-service (saves them), and kitchenwise-recipe-service (takes one meal).
// Source: kitchenwise-meal-plan-service/src/data_types/index.ts and
// kitchenwise-plan-storage-service/src/schemas/Schemas.ts.

export type MealName = 'breakfast' | 'lunch' | 'dinner';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: string;
}

export interface Meal {
  id: string;
  name: MealName;
  foods: FoodItem[];
  /** Set by the frontend before saving; plan-storage accepts it, meal-plan never returns it. */
  image?: string;
  /** Present on plans from /meal-plan-with-price. */
  price?: number;
}

export interface MealPlan {
  id: string;
  /** ISO date string */
  date: string;
  meals: Meal[];
}

export type MealWithPrice = Meal & { price: number };

export interface MealPlanWithPrice extends MealPlan {
  meals: MealWithPrice[];
}
