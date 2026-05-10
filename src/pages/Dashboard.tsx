import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DashboardFiltersProvider } from "../features/dashboard/context/DashboardFiltersProvider";
import { FiltersBar } from "../features/dashboard/components/FiltersBar";

type PanelType = "summary" | "leaders";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePanel: PanelType = location.pathname.includes("leaders")
    ? "leaders"
    : "summary";

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newPanel: PanelType | null
  ) => {
    if (newPanel) navigate(newPanel);
  };

  return (
    <DashboardFiltersProvider>
      <Box>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={activePanel}
            exclusive
            onChange={handleChange}
            aria-label="выбор дашборда"
          >
            <ToggleButton value="summary" sx={{ px: 3, py: 1 }}>
              Сводная статистика
            </ToggleButton>
            <ToggleButton value="leaders" sx={{ px: 3, py: 1 }}>
              Руководители и преемники
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Общая панель фильтров для всех вкладок */}
        <FiltersBar />

        <Outlet />
      </Box>
    </DashboardFiltersProvider>
  );
}
