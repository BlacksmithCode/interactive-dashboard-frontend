import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { Layout } from "@/widgets/layout";
import { ProtectedRoute } from "@/shared/ui/ProtectedRoute";
import { Dashboard } from "@/pages/dashboard";
import { AdminPanel } from "@/pages/admin";
import { Login } from "@/pages/login";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { ColorModeProvider } from "@/shared/theme/ColorModeProvider";

const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard/*",
        element: (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        ),
      },
      {
        path: "/admin",
        element: <AdminPanel />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

function App() {
  return (
    <ColorModeProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ColorModeProvider>
  );
}

export default App;
