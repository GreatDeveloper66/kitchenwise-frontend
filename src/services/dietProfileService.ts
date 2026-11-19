// Client for kitchenwise-diet-profile-service. Routes: src/server.js,
// model: models/nutritionalProfile.js. All routes need the user-auth token.
// One profile per user: create returns 409 if one exists, so use update after that.
import { dietProfileApi, errorStatus, toApiError } from './api';

export const SEX_OPTIONS = ['male', 'female'] as const;
export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very active'] as const;
export const DIETARY_PREFERENCES = ['Normal', 'Keto', 'High Protein', 'Vegetarian', 'Vegan'] as const;
export const BUDGET_LEVELS = ['Minimal', 'Normal', 'Premium'] as const;

export type Sex = (typeof SEX_OPTIONS)[number];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type DietaryPreference = (typeof DIETARY_PREFERENCES)[number];
export type BudgetLevel = (typeof BUDGET_LEVELS)[number];

/** Request body for create and update. Weight in kg, height in cm. */
export interface DietProfileValues {
  age: number;
  sex: Sex;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
  /** Server defaults to ['Normal'] if omitted. */
  dietaryPreferences?: DietaryPreference[];
  budgetLevel: BudgetLevel;
}

/** The stored Mongo document. */
export interface DietProfile extends DietProfileValues {
  _id: string;
  userId: string;
  dietaryPreferences: DietaryPreference[];
  createdAt: string;
}

export async function createDietProfile(values: DietProfileValues): Promise<DietProfile> {
  try {
    const { data } = await dietProfileApi.post<DietProfile>('/create-nutritional-profile', values);
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not save your diet profile.');
  }
}

/** Returns null if the user hasn't created a profile yet (server 404). */
export async function getDietProfile(): Promise<DietProfile | null> {
  try {
    const { data } = await dietProfileApi.get<DietProfile>('/get-nutritional-profile');
    return data;
  } catch (err) {
    if (errorStatus(err) === 404) return null;
    throw toApiError(err, 'Could not load your diet profile.');
  }
}

/** Partial update: only fields present in `values` change. */
export async function updateDietProfile(values: Partial<DietProfileValues>): Promise<DietProfile> {
  try {
    const { data } = await dietProfileApi.patch<DietProfile>('/update-nutritional-profile', values);
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not update your diet profile.');
  }
}

export async function deleteDietProfile(): Promise<void> {
  try {
    await dietProfileApi.delete('/delete-nutritional-profile');
  } catch (err) {
    throw toApiError(err, 'Could not delete your diet profile.');
  }
}
