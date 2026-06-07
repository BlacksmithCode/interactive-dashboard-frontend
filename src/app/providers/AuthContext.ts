import { createContext } from "react";

export interface AuthContextProps {
  isAuthenticated: boolean;
  role: string | null;
  fullName: string | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);