import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Box, CssBaseline, IconButton, useTheme, Typography, Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "@/shared/theme/useColorMode";
import { Logo } from "@/shared/ui/logo/Logo";
import { useAuth, RoleGuard, ROLES } from "@/entities/user";
import { colors, transitions } from "@/shared/theme/tokens";

const formatRole = (role: string) => {
  switch (role) {
    case "ROLE_ADMIN": return "Администратор";
    case "ROLE_HRD_EVALUATION": return "HRD Оценка";
    case "ROLE_HRD_DOMAIN": return "HRD Домен";
    case "ROLE_MANAGER": return "Руководитель";
    default: return role;
  }
};

export default function Layout() {
  const theme = useTheme();
  const colorMode = useColorMode();
  const { logout, role, fullName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith("/admin");

  const displayFullName = fullName || localStorage.getItem("username") || "Пользователь";
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="static"
        sx={{
          background: isDark ? colors.appbarDark : colors.surfaceLight,
          boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)",
          borderBottom: isDark ? `1px solid ${colors.grey700}` : `1px solid ${colors.grey100}`,
          transition: transitions.normal,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: { xs: 56, sm: 64 } }}>
          {/* Левая часть - Логотип */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Logo type="short" height={35} />
          </Box>

          {/* Центральная часть - Профиль */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", lineHeight: 1.3 }}>
              {displayFullName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "lowercase",
                fontSize: "0.7rem",
                letterSpacing: "0.04em",
              }}
            >
              {formatRole(role || "")}
            </Typography>
          </Box>

          {/* Правая часть - Кнопки */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5 }}>
            <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          {isAdminPanel ? (
            <Button
              variant="text"
              onClick={() => navigate("/dashboard")}
              sx={{
                fontWeight: 700,
                color: isDark ? colors.primaryLight : colors.primary,
                "&:hover": { background: isDark ? "rgba(87,113,255,0.12)" : "rgba(87,113,255,0.08)" },
              }}
            >
              Дашборд
            </Button>
          ) : (
            <Button
              variant="text"
              onClick={() => navigate("/admin")}
              sx={{
                fontWeight: 700,
                color: isDark ? colors.primaryLight : colors.primary,
                "&:hover": { background: isDark ? "rgba(87,113,255,0.12)" : "rgba(87,113,255,0.08)" },
              }}
            >
              Админ-панель
            </Button>
          )}
            </RoleGuard>
            <IconButton
              onClick={colorMode.toggleColorMode}
              color="inherit"
              sx={{
                transition: transitions.spring,
                transform: isDark ? "rotate(180deg)" : "rotate(0deg)",
                color: "text.primary",
                "&:hover": {
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                },
              }}
            >
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button
              variant="text"
              onClick={logout}
              sx={{
                fontWeight: 700,
                color: isDark ? colors.primaryLight : colors.primary,
                borderRadius: 1,
                "&:hover": {
                  background: isDark ? "rgba(87,113,255,0.12)" : "rgba(87,113,255,0.08)",
                },
              }}
            >
              Выход
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}