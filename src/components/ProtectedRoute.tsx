import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

/**
 * Компонент‑обёртка для защищённых маршрутов.
 * Если пользователь не аутентифицирован – перенаправляем на страницу входа.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
