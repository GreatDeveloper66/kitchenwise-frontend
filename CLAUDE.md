# kitchenwise-frontend

React frontend for KitchenWise. Branch: `main`. Not deployed yet.

## Stack

Vite, React, TypeScript, React Router, axios, TanStack Query, CSS Modules.

Commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

## Structure

```
src/
  components/   AppLayout, LoginForm, RegisterForm, DietProfileForm, MealCard, CalorieSummary,
                ProtectedRoute, RequireSetup, PageStatus, SessionExpired
  pages/        Login, Register, Onboarding, Dashboard, Placeholder
  routes/       Route definitions
  context/      AuthContext + AuthProvider (the session: user, signIn, signOut)
  queries/      QueryClient config, query keys, useDietProfile, useLatestPlan (TanStack Query)
  services/     api.ts (one axios client per backend, ApiError with HTTP status), one *Service.ts per
                backend, planSetupService.ts (generate + save a plan), types.ts (shared meal plan shapes)
  hooks/        useAuth, useMediaQuery
  utils/        units.ts (lb/kg and ft-in/cm conversion)
  styles/       theme.css (design tokens), breakpoints.ts
```

## State

- Session (user, token): `AuthContext`, read with `useAuth()`. Nothing else reads the session from localStorage.
- Server data (diet profile, saved plan): TanStack Query via the hooks in `src/queries/`. Don't copy it into
  Context or component state. After a mutation, update the cache with `queryClient.setQueryData` using `queryKeys`.
- The query cache is cleared on sign-in and sign-out, so one user's data never shows for another.

## Onboarding flow

Register signs the user in and goes to `/onboarding`. `RequireSetup` guards the main app and sends anyone
without a diet profile or a saved plan to `/onboarding`. Onboarding creates the diet profile, generates a
priced plan (`/meal-plan-with-price`), and saves it to plan-storage. A failed step retries only that step.
A new plan is generated only when the diet profile changes, never on login. A plan is one day
(breakfast, lunch, dinner); `planSetupService` keeps only the first of each if the AI returns more.

Meal pictures: `useMealImages` (called in `RequireSetup`) fills in missing images in the background, at most
once per plan per page load, and skips plans with more than 3 meals. It calls `/meal-plan-images`, which
returns permanent Vercel Blob URLs, then saves them into the plan with `updateLatestPlan`. Links that aren't
on `*.public.blob.vercel-storage.com` (an old deployment's expiring DALL-E links) are refused, not saved.

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

Built: LoginForm/LoginPage, RegisterForm/RegisterPage (auto sign-in), OnboardingPage with DietProfileForm
(lb/kg and ft-in/cm, converted to kg/cm), RequireSetup guard, AuthContext, TanStack Query, dashboard layout and
page (shows the saved plan: meal cards built from the food list, calories, price, and image; the summary card
shows planned totals because intake tracking doesn't exist).
Not built: Plan, Grocery, Profile (diet profile editing; reuse DietProfileForm with `initialValues`), recipe detail pages.

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
