// Query keys in one place so mutations can update the same cache entries the pages read.
// The cache is cleared on sign-in and sign-out, so keys don't need the user ID.
export const queryKeys = {
  dietProfile: ['dietProfile'] as const,
  latestPlan: ['mealPlan', 'latest'] as const,
  recipe: (mealId: string) => ['recipe', mealId] as const,
};
