import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { login as apiLogin, logout as apiLogout, isLoggedIn } from "../api/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isLoggedIn());

  const login = (username: string, password: string) => {
    apiLogin(username, password);
    setAuthenticated(true);
  };

  const logout = () => {
    apiLogout();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};