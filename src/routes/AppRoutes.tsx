import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { OnboardingPage } from '../pages/OnboardingPage/OnboardingPage';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { RequireSetup } from '../components/RequireSetup/RequireSetup';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { PlaceholderPage } from '../pages/PlaceHolderPage/PlaceHolderPage';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';
// ...


export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        {/* First-run setup: no nav, since the rest of the app needs a profile and plan */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Main app: only once setup is complete, then the shared nav layout */}
        <Route element={<RequireSetup />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/plan" element={<PlaceholderPage title="Meal plan" />} />
            <Route path="/grocery" element={<PlaceholderPage title="Grocery" />} />
            {/* <Route path="/profile" element={<PlaceholderPage title="Profile" />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
