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
  services/     One axios client per backend service
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

## Open questions (ask Adam before changing)

- `.env` has a single `VITE_API_BASE_URL`, but each backend service has its own host. Per-service base URLs will likely be needed.
- Token storage: if tokens are kept in localStorage, say so plainly as a simplification.
