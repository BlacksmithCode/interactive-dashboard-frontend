import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth, ROLES } from "@/entities/user";
import { PanelSwitcher, type PanelOption } from "@/shared/ui/PanelSwitcher";
import { SummaryStats } from "@/features/summary-stats";
import { LeadersSuccessors } from "@/features/leaders-successors";

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
    if (role === ROLES.MANAGER && activePanel === "summary") {
      navigate("leaders", { replace: true });
    }
  }, [role, activePanel, navigate]);

  if (role === ROLES.MANAGER && activePanel === "summary") {
    return null;
  }

  const handleToggle = (newPanel: PanelType) => {
    if (activePanel !== newPanel) {
      navigate(newPanel === "summary" ? "/dashboard" : "/dashboard/leaders");
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
      {activePanel === "summary" ? <SummaryStats /> : <LeadersSuccessors />}
    </Box>
  );
}
