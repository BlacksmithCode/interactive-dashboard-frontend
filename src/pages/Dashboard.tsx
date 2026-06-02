// Dashboard.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";

type PanelType = "summary" | "leaders";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePanel: PanelType = location.pathname.includes("leaders")
    ? "leaders"
    : "summary";

  const handleToggle = (newPanel: PanelType) => {
    if (activePanel !== newPanel) {
      navigate(newPanel);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            display: "inline-grid",
            gridTemplateColumns: "1fr 1fr",
            position: "relative",
            backgroundColor: "#1DAFF7", // Фон подложки
            borderRadius: "28px",       // Скругление капсулой
            p: "4px",                   // Внутренний отступ
          }}
        >
          {/* Анимированный ползунок (фон активной кнопки) */}
          <Box
            sx={{
              position: "absolute",
              top: 4,
              bottom: 4,
              left: 4,
              width: "calc(50% - 4px)",
              backgroundColor: "#0088FF", // Фон активного элемента
              borderRadius: "24px",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Плавная анимация (easing)
              transform: activePanel === "summary" ? "translateX(0)" : "translateX(100%)",
              zIndex: 0,
            }}
          />

          {/* Кнопка "Сводная статистика" */}
          <Box
            onClick={() => handleToggle("summary")}
            sx={{ px: 3, py: 1, cursor: "pointer", zIndex: 1, textAlign: "center" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: activePanel === "summary" ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                fontWeight: activePanel === "summary" ? 600 : 400,
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                "&::after": {
                  content: '"Сводная статистика"',
                  fontWeight: 600,
                  visibility: "hidden",
                  height: 0,
                },
              }}
            >
              Сводная статистика
            </Typography>
          </Box>

          {/* Кнопка "Руководители и преемники" */}
          <Box
            onClick={() => handleToggle("leaders")}
            sx={{ px: 3, py: 1, cursor: "pointer", zIndex: 1, textAlign: "center" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: activePanel === "leaders" ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                fontWeight: activePanel === "leaders" ? 600 : 400,
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                "&::after": {
                  content: '"Руководители и преемники"',
                  fontWeight: 600,
                  visibility: "hidden",
                  height: 0,
                },
              }}
            >
              Руководители и преемники
            </Typography>
          </Box>
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
}
