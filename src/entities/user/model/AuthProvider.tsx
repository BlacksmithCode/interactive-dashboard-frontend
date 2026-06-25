import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { removeAuthToken, isLoggedIn, setAuthToken, getAuthHeader } from "./token";
import { setOnUnauthorizedHandler, setTokenProvider } from "@/shared/api/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../api/usersApi";

// Привязываем функцию получения токена к глобальному API-клиенту
setTokenProvider(getAuthHeader);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isLoggedIn());
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("role"));
  const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem("fullName"));
  const queryClient = useQueryClient();

  const login = useCallback((data: { token: string; username: string; role: string; fullName?: string }) => {
    setAuthToken(data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);
    if (data.fullName) {
      localStorage.setItem("fullName", data.fullName);
      setFullName(data.fullName);
    }
    
    setAuthenticated(true);
    setRole(data.role);
  }, []);

  const logout = useCallback(async () => {
    // Отправляем запрос на бэкенд для логирования выхода
    await logoutUser();
    
    removeAuthToken();
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    setAuthenticated(false);
    setRole(null);
    setFullName(null);
    queryClient.clear(); // Полностью очищаем кэш данных при выходе
  }, [queryClient]);

  // Подписка на событие 401 от apiClient — разруливает жёсткую связку
  // между HTTP-клиентом и роутингом (раньше был window.location.href)
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      logout();
      window.location.href = "/login";
    });
    return () => setOnUnauthorizedHandler(null);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: authenticated, role, fullName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};