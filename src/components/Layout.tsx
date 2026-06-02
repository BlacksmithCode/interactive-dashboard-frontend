import { Outlet } from "react-router-dom";
import { AppBar, Toolbar, Box, CssBaseline } from "@mui/material";

export default function Layout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: "white", boxShadow: 1 }}>
        <Toolbar>
          <img 
            src="/Version=Logo%20T1,%20Format=Logo,%20Color=Blue-Black.svg" 
            alt="Логотип" 
            style={{ height: 35, width: "auto", objectFit: "contain" }} 
          />
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}