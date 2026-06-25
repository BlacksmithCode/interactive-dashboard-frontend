import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/widgets/layout";
import { ProtectedRoute } from "@/shared/ui/ProtectedRoute";
import { Dashboard } from "@/pages/dashboard";
import { AdminPanel } from "@/pages/admin";
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
              <Route path="/dashboard/*" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ColorModeProvider>
  );
}

export default App;
