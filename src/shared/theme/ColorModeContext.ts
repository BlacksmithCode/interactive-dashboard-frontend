import { createContext } from "react";

export interface ColorModeContextProps {
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextProps>({ toggleColorMode: () => {} });