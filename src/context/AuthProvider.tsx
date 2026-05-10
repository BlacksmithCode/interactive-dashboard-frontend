import { createContext, useContext, useState, type ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, isLoggedIn } from "../api/auth";

export interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

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

export const useAuth = (): AuthContextProps => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
