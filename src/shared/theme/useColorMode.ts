import { useContext } from "react";
import { ColorModeContext, type ColorModeContextProps } from "./ColorModeContext";

export function useColorMode(): ColorModeContextProps {
  const context = useContext(ColorModeContext);
  if (context === undefined) {
    throw new Error("useColorMode должен использоваться внутри ColorModeProvider");
  }
  return context;
}