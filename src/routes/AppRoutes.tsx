import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { PlaceholderPage } from '../pages/PlaceHolderPage/PlaceHolderPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated: guard first, then the shared nav layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plan" element={<PlaceholderPage title="Meal plan" />} />
          <Route path="/grocery" element={<PlaceholderPage title="Grocery" />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}