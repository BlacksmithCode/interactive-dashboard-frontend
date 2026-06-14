import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Box, CssBaseline, IconButton, useTheme, Typography, Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "@/shared/theme/useColorMode";
import { Logo } from "@/shared/ui/logo/Logo";
import { useAuth, RoleGuard, ROLES } from "@/entities/user";

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: "background.paper", boxShadow: 1, transition: "background-color 0.4s" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Левая часть - Логотип */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Logo type="short" height={35} />
          </Box>

          {/* Центральная часть - Профиль */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "baseline", justifyContent: "center", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {displayFullName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", position: "relative", top: "0.25em" }}>
              {formatRole(role || "")}
            </Typography>
          </Box>

          {/* Правая часть - Кнопки */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
            <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          {isAdminPanel ? (
            <Button variant="text" color="primary" onClick={() => navigate("/dashboard")} sx={{ fontWeight: 'bold' }}>
              Дашборд
            </Button>
          ) : (
            <Button variant="text" color="primary" onClick={() => navigate("/admin")} sx={{ fontWeight: 'bold' }}>
              Админ-панель
            </Button>
          )}
            </RoleGuard>
            <IconButton
              onClick={colorMode.toggleColorMode}
              color="inherit"
              sx={{
                transition: "transform 0.5s ease-in-out",
                transform: theme.palette.mode === "dark" ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon sx={{ color: "text.primary" }} />}
            </IconButton>
            <Button variant="outlined" color="inherit" onClick={logout} sx={{ color: "text.primary", borderColor: "divider" }}>
              Выход
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}