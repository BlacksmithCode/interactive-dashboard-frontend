import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth, ROLES } from "@/entities/user";
import { PanelSwitcher, type PanelOption } from "@/shared/ui/PanelSwitcher";

type PanelType = "summary" | "leaders";

const DASHBOARD_TABS: [PanelOption<PanelType>, PanelOption<PanelType>] = [
  { value: "summary", label: "Сводная статистика" },
  { value: "leaders", label: "Руководители и преемники" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const activePanel: PanelType = location.pathname.includes("leaders")
    ? "leaders"
    : "summary";

  useEffect(() => {
    // Если это Менеджер и он на вкладке "Сводная статистика" (которая у него скрыта),
    // принудительно кидаем его на таблицу руководителей.
    if (role === ROLES.MANAGER && activePanel === "summary") {
      navigate("leaders", { replace: true });
    }
  }, [role, activePanel, navigate]);

  // Блокируем рендер вкладки "Сводная статистика" для менеджера, 
  // чтобы хуки не успели отправить запросы, на которые бэкенд вернет 403.
  if (role === ROLES.MANAGER && activePanel === "summary") {
    return null;
  }

  const handleToggle = (newPanel: PanelType) => {
    if (activePanel !== newPanel) {
      navigate(newPanel);
    }
  };

  return (
    <Box>
      {role !== ROLES.MANAGER && (
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <PanelSwitcher
            options={DASHBOARD_TABS}
            activeValue={activePanel}
            onChange={handleToggle}
          />
        </Box>
      )}
      <Outlet />
    </Box>
  );
}
