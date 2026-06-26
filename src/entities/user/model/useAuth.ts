import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextProps } from "./AuthContext";

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return ctx;
}   