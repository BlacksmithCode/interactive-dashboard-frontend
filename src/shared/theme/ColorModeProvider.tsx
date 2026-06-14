import { useState, useMemo, type ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ColorModeContext } from "./ColorModeContext";

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#0f172a", // Мягкий глубокий фон (темный сланцево-синий)
                  paper: "#1e293b",   // Фон для блоков и панелей (чуть светлее)
                },
              }
            : {
                background: {
                  default: "#f0f4f8",
                  paper: "#ffffff",
                },
              }),
        },
        typography: {
          fontFamily: '"als_hauss", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeightLight: 300,
          fontWeightRegular: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
          h1: { fontWeight: 900 },
          h2: { fontWeight: 900 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "background-color 0.4s ease, color 0.4s ease",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
