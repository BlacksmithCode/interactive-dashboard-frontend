import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { logout as apiLogout, isLoggedIn } from "../../shared/api/auth";
import { setOnUnauthorizedHandler } from "../../shared/api/apiClient";
import { useQueryClient } from "@tanstack/react-query";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isLoggedIn());
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("role"));
  const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem("fullName"));
  const queryClient = useQueryClient();

  const login = useCallback(() => {
    setAuthenticated(true);
    setRole(localStorage.getItem("role"));
    setFullName(localStorage.getItem("fullName"));
  }, []);

  const logout = useCallback(() => {
    apiLogout();
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