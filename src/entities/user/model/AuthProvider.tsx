import { useState, useCallback, useEffect, type ReactNode, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { removeAuthToken, getAuthHeader, isTokenExpired } from "./token";
import { setOnUnauthorizedHandler } from "@/shared/api/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../api/usersApi";

const AUTO_LOGIN_ROLE = "ROLE_HRD_EVALUATION";
const AUTO_LOGIN_FULL_NAME = "HRD Оценка (авто-вход)";
const AUTO_LOGIN_USERNAME = "auto_hrd";

/**
 * Безопасный моковый JWT-токен (100% ASCII, валидный формат).
 * Избегаем btoa() с кириллицей, которая ломает бразуер на старте.
 */
const AUTO_LOGIN_MOCK_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRvX2hyZCIsInJvbGUiOiJST0xFX0hSRF9FVkFMVUFUSU9OIiwiZnVsbE5hbWUiOiJIUkQgRXZhbCIsImV4cCI6MTkwMDAwMDAwMCwiaWF0IjoxNzAwMDAwMDAwfQ.dGVzdC1zaWduYXR1cmU";

/**
 * Определяет начальное состояние аутентификации.
 * Если токена нет — автоматически создаёт сессию авто-входа.
 */
function getInitialAuthState(): {
  authenticated: boolean;
  role: string | null;
  fullName: string | null;
} {
  const token = getAuthHeader();
  if (token) {
    const jwtToken = token.replace("Bearer ", "");
    if (isTokenExpired(jwtToken)) {
      return { authenticated: false, role: null, fullName: null };
    }
    return {
      authenticated: true,
      role: localStorage.getItem("role"),
      fullName: localStorage.getItem("fullName"),
    };
  }

  // Авто-вход: сохраняем безопасный ASCII-токен в localStorage
  localStorage.setItem("jwt_token", AUTO_LOGIN_MOCK_JWT);
  localStorage.setItem("username", AUTO_LOGIN_USERNAME);
  localStorage.setItem("role", AUTO_LOGIN_ROLE);
  localStorage.setItem("fullName", AUTO_LOGIN_FULL_NAME);

  return {
    authenticated: true,
    role: AUTO_LOGIN_ROLE,
    fullName: AUTO_LOGIN_FULL_NAME,
  };
}

/** Очистка локального состояния без запроса к бэкенду */
function clearLocalAuth(queryClient: ReturnType<typeof useQueryClient>): void {
  removeAuthToken();
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("fullName");
  queryClient.clear();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialAuthState();

  const [authenticated, setAuthenticated] = useState<boolean>(initialState.authenticated);
  const [role, setRole] = useState<string | null>(initialState.role);
  const [fullName, setFullName] = useState<string | null>(initialState.fullName);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const logoutRef = useRef<() => Promise<void>>(async () => {});

  const login = useCallback((data: { token: string; username: string; role: string; fullName?: string }) => {
    localStorage.setItem("jwt_token", data.token);
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