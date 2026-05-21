import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import { SummaryStats, LeadersSuccessors } from "./features/dashboard/widgets";
import Login from "./pages/Login";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
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
          {/* Редирект с корня на дашборд */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

