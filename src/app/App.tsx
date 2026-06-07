import { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Layout from "../widgets/layout/Layout";
import { ProtectedRoute } from "../shared/ui/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import AdminPanel from "../pages/AdminPanel";
import { SummaryStats, LeadersSuccessors } from "../widgets";
import Login from "../pages/Login";
import { ErrorBoundary } from "../shared/ui/ErrorBoundary";
import { ColorModeContext } from "./providers/ColorModeContext";

function App() {
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
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
            {/* Дашборд с вложенными панелями */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="summary" replace />} />
              <Route
                path="summary"
                element={
                  <ErrorBoundary>
                    <SummaryStats />
                  </ErrorBoundary>
                }
              />
              <Route
                path="leaders"
                element={
                  <ErrorBoundary>
                    <LeadersSuccessors />
                  </ErrorBoundary>
                }
              />
            </Route>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
          {/* Редиректы по умолчанию на страницу авторизации */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
