# kitchenwise-frontend

The React frontend for KitchenWise, an AI-powered meal planning app with grocery-aware recipes. It talks to the KitchenWise backend microservices for authentication, diet profiles, meal plans, recipes, and grocery store discovery.

---

## Tech Stack

- **Build:** Vite
- **UI:** React + TypeScript
- **Routing:** React Router
- **Data:** axios, TanStack Query
- **Styling:** CSS Modules with design tokens as CSS variables

---

## Project Structure

```
src/
  components/   Reusable UI (AppLayout, LoginForm, RegisterForm, MealCard, CalorieSummary, ProtectedRoute)
  pages/        Route-level pages (Login, Register, Dashboard)
  routes/       Route definitions
  services/     API clients, one axios client per backend service
  hooks/        Shared hooks (useMediaQuery)
  styles/       theme.css (design tokens) and breakpoints.ts
```

## Conventions

- All colors and fonts live in `src/styles/theme.css` as CSS variables; components never hardcode hex values or font names.
- Breakpoints are 768 / 1024 / 1440 (mobile-first), mirrored in `src/styles/breakpoints.ts`.
- Form components take an `onSubmit` prop; pages own what happens after submit.
- API calls live in `src/services/`.

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Getting Started

```bash
git clone https://github.com/GreatDeveloper66/kitchenwise-frontend.git
cd kitchenwise-frontend
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

---

## Status

Built: login, registration, and the dashboard layout (with placeholder meal data). In progress: plan, grocery, profile, and recipe detail pages.

---

## Project Architecture

This repository is one of seven components in the KitchenWise application (six backend microservices plus the React frontend):

| Repository | Responsibility |
|---------|---------------|
| **[kitchenwise-frontend](https://github.com/GreatDeveloper66/kitchenwise-frontend)** | React + TypeScript frontend |
| [user-auth-service](https://github.com/GreatDeveloper66/user-auth-service) | Authentication & JWT management |
| [kitchenwise-diet-profile-service](https://github.com/GreatDeveloper66/kitchenwise-diet-profile-service) | Diet profile storage & management |
| [kitchenwise-meal-plan-service](https://github.com/GreatDeveloper66/kitchenwise-meal-plan-service) | AI-powered meal plan generation |
| [kitchenwise-plan-storage-service](https://github.com/GreatDeveloper66/kitchenwise-plan-storage-service) | User meal plan storage |
| [kitchenwise-grocery-service](https://github.com/GreatDeveloper66/kitchenwise-grocery-service) | Grocery store discovery by location (Google Places) |
| [kitchenwise-recipe-service](https://github.com/GreatDeveloper66/kitchenwise-recipe-service) | AI recipe generation |
