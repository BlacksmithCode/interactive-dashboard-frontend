import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../app/providers/useAuth";

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
