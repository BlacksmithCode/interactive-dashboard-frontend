import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { AppBar, Toolbar, Box, CssBaseline, IconButton, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../context/ColorModeContext";

export default function Layout() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: "background.paper", boxShadow: 1, transition: "background-color 0.4s" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <img 
              src="/Version=Logo%20T1,%20Format=Logo,%20Color=Blue-Black.svg" 
              alt="Логотип" 
              style={{ height: 35, width: "auto", objectFit: "contain", filter: theme.palette.mode === "dark" ? "brightness(0) invert(1)" : "none", transition: "filter 0.4s" }} 
            />
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