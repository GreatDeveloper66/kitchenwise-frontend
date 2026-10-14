// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
// ...other imports

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* ... */}
    </Routes>
  );
}
