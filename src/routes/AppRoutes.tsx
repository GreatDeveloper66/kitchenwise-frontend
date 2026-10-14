// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage/LoginPage';
// ...other imports

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* ... */}
    </Routes>
  );
}
