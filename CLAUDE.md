# kitchenwise-frontend

React frontend for KitchenWise. Branch: `main`. Not deployed yet.

## Stack

Vite, React, TypeScript, React Router, axios, TanStack Query, CSS Modules.

Commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

## Structure

```
src/
  components/   AppLayout, LoginForm, RegisterForm, MealCard, CalorieSummary, ProtectedRoute
  pages/        Login, Register, Dashboard
  routes/       Route definitions
  services/     api.ts (one axios client per backend + toApiError), one *Service.ts per backend, types.ts (shared meal plan shapes)
  hooks/        useMediaQuery
  styles/       theme.css (design tokens), breakpoints.ts
```

## Rules

- All colors and fonts are CSS variables in `src/styles/theme.css`. Components never hardcode hex values or font names. Add a token if one is missing.
- Palette: deep green `#1B4332` (primary) on cream `#FAF6EE`. Gold `#C9A227` is reserved for the single main action on each screen.
- Fonts: Manrope for headings, Inter for body. Weights 400 and 500 only.
- Breakpoints: 768 / 1024 / 1440, mobile-first. Keep `src/styles/breakpoints.ts` and the CSS media queries in sync.
- Dashboard nav: bottom tab bar on mobile, left sidebar at 1024px and up.
- Form components take an `onSubmit` prop. Pages own what happens after submit.
- All API calls live in `src/services/`, one axios client per backend service. Components and pages never call axios directly.
- Before writing a service client, read that service's routes in its sibling folder and match the contract exactly.

## Status

Built: LoginForm/LoginPage, RegisterForm/RegisterPage, dashboard layout and page (hardcoded placeholder meal data).
Not built: Plan, Grocery, Profile, recipe detail pages.

## Service clients

Each backend has its own base URL env var ending in `/api` (see `.env.example`): `VITE_AUTH_API_URL`, `VITE_DIET_PROFILE_API_URL`, `VITE_MEAL_PLAN_API_URL`, `VITE_PLAN_STORAGE_API_URL`, `VITE_GROCERY_API_URL`, `VITE_RECIPE_API_URL`. Only auth, diet-profile, and plan-storage clients attach the Bearer token.

- authService: login, register, login codes, forgot/reset password, profile get/update, delete account, logout.
- dietProfileService: create/get/update/delete. `getDietProfile()` returns null on 404.
- mealPlanService: generateMealPlan, generateMealPlanWithPrice, generateMealPlanImages (unwraps `{ success, data }`).
- planStorageService: savePlan, getLatestPlan (null if none), updateLatestPlan, deleteLatestPlan.
- groceryService: findGroceryStores (radius in meters, max 50,000).
- recipeService: getRecipe(meal).

Meal names from the backends are lowercase (`breakfast | lunch | dinner`); `MealCard`'s `MealType` is capitalized, so map between them when wiring pages.

## Open questions (ask Adam before changing)

- Token storage: tokens are kept in localStorage (a simplification; any script on the page can read them).
