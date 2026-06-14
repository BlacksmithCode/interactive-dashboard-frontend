import { createContext } from "react";

export interface AuthContextProps {
  isAuthenticated: boolean;
  role: string | null;
  fullName: string | null;
  login: (data: { token: string; username: string; role: string; fullName?: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);