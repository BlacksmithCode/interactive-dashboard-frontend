// src/pages/Login.tsx
import { useState, useContext, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/useAuth";
import { TextField, Button, Box, Typography, Alert, Paper, AppBar, Toolbar, IconButton, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../app/providers/ColorModeContext";
import { Logo } from "../shared/ui/logo/Logo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (username && password) {
      login(username, password);
      navigate("/dashboard");
    } else {
      setError("Введите логин и пароль");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        transition: "background-color 0.4s",
      }}
    >
      {/* Белая шапка с центрированным логотипом */}
      <AppBar position="static" sx={{ backgroundColor: "background.paper", boxShadow: 1, transition: "background-color 0.4s" }}>
        <Toolbar sx={{ position: "relative", justifyContent: "center" }}>
          <Logo type="full" height={40} />
          <IconButton
            onClick={colorMode.toggleColorMode}
            color="inherit"
            sx={{
              position: "absolute",
              right: 16,
              transition: "transform 0.5s ease-in-out",
              transform: theme.palette.mode === "dark" ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon sx={{ color: "text.primary" }} />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Контейнер формы, занимающий оставшуюся высоту */}
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper
        elevation={3}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3, // Закругленные углы карточки
        }}
      >
        <Typography variant="h5" component="h1" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          Вход в систему
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}>
          Войти
        </Button>
      </Paper>
      </Box>
    </Box>
  );
}
