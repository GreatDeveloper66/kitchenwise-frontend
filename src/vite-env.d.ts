/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_DIET_PROFILE_API_URL: string;
  readonly VITE_MEAL_PLAN_API_URL: string;
  readonly VITE_PLAN_STORAGE_API_URL: string;
  readonly VITE_GROCERY_API_URL: string;
  readonly VITE_RECIPE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
