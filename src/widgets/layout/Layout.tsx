import { useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Box, CssBaseline, IconButton, useTheme, Typography, Avatar, Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../../app/providers/ColorModeContext";
import { Logo } from "../../shared/ui/logo/Logo";
import { useAuth } from "../../app/providers/useAuth";
import { RoleGuard } from "../../shared/ui/RoleGuard";
import { ROLES } from "../../shared/ui/roles";

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
  const colorMode = useContext(ColorModeContext);
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith("/admin");

  const username = localStorage.getItem("username") || "Пользователь";

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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", lineHeight: 1.2, color: "text.primary" }}>
                {username}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatRole(role || "")}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: "1rem" }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
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