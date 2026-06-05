import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { login as apiLogin, logout as apiLogout, isLoggedIn } from "../../shared/api/auth";
import { setOnUnauthorizedHandler } from "../../shared/api/apiClient";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isLoggedIn());

  const login = useCallback((username: string, password: string) => {
    apiLogin(username, password);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setAuthenticated(false);
  }, []);

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
    <AuthContext.Provider value={{ isAuthenticated: authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};