import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { AppBar, Toolbar, Box, CssBaseline, IconButton, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../../app/providers/ColorModeContext";
import { Logo } from "../../shared/ui/logo/Logo";

export default function Layout() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: "background.paper", boxShadow: 1, transition: "background-color 0.4s" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Logo type="short" height={35} />
          </Box>
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
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}