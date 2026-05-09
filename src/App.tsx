import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SummaryStats from "./pages/panels/SummaryStats";
import LeadersSuccessors from "./pages/panels/LeadersSuccessors";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          {/* Дашборд с вложенными панелями */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="summary" replace />} />
            <Route path="summary" element={<SummaryStats />} />
            <Route path="leaders" element={<LeadersSuccessors />} />
          </Route>
        </Route>
        {/* Редирект с корня на дашборд */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;