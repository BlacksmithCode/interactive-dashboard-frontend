import { useState, useCallback, useEffect, type ReactNode, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { removeAuthToken, setAuthToken, getAuthHeader, isTokenExpired } from "./token";
import { setOnUnauthorizedHandler, setTokenProvider } from "@/shared/api/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../api/usersApi";

setTokenProvider(getAuthHeader);

/** Очистка локального состояния без запроса к бэкенду */
function clearLocalAuth(queryClient: ReturnType<typeof useQueryClient>): void {
  removeAuthToken();
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("fullName");
  queryClient.clear();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    const token = getAuthHeader();
    return !!(token && !isTokenExpired(token.replace("Bearer ", "")));
  });
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("role"));
  const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem("fullName"));
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const logoutRef = useRef<() => Promise<void>>(async () => {});

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
    await logoutUser();
    clearLocalAuth(queryClient);
    setAuthenticated(false);
    setRole(null);
    setFullName(null);
  }, [queryClient]);

  // Очистка локального состояния без запроса к бэкенду (для истёкших токенов)
  const clearAuth = useCallback(() => {
    clearLocalAuth(queryClient);
    setAuthenticated(false);
    setRole(null);
    setFullName(null);
  }, [queryClient]);

  // Сохраняем ссылку на logout для использования в useEffect без зависимости
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Подписка на событие 401 от apiClient
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      logoutRef.current();
      window.location.href = "/login";
    });
    return () => setOnUnauthorizedHandler(null);
  }, []);

  // Проверка валидности токена при загрузке страницы
  useEffect(() => {
    const validateToken = async () => {
      const token = getAuthHeader();
      if (token) {
        const jwtToken = token.replace("Bearer ", "");
        if (isTokenExpired(jwtToken)) {
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: authenticated, role, fullName, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};