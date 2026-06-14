import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/widgets/layout";
import { ProtectedRoute } from "@/shared/ui/ProtectedRoute";
import { Dashboard } from "@/pages/dashboard";
import { AdminPanel } from "@/pages/admin";
import { SummaryStats } from "@/widgets/summary-stats";
import { LeadersSuccessors } from "@/widgets/leaders-successors";
import { Login } from "@/pages/login";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { ColorModeProvider } from "@/shared/theme/ColorModeProvider";

function App() {
  return (
    <ColorModeProvider>
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
    </ColorModeProvider>
  );
}

export default App;
