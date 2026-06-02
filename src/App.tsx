import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import { SummaryStats, LeadersSuccessors } from "./features/dashboard/widgets";
import Login from "./pages/Login";
import { ErrorBoundary } from "./components/ErrorBoundary";

const theme = createTheme({
  typography: {
    fontFamily: '"als_hauss", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,    // Будет использовать als_hauss_light
    fontWeightRegular: 400,  // Будет использовать als_hauss_regular
    fontWeightMedium: 500,   // Будет использовать als_hauss_medium
    fontWeightBold: 700,     // Будет использовать als_hauss_bold
    // Задействуем экстра-жирный als_hauss_black (900) для главных заголовков
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
          </Route>
          {/* Редиректы по умолчанию на страницу авторизации */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
