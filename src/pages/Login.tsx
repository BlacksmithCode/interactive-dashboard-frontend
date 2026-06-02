// src/pages/Login.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { TextField, Button, Box, Typography, Alert, Paper, AppBar, Toolbar } from "@mui/material";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

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
        bgcolor: "#f0f4f8", // Слегка затемненный серо-голубой фон всей страницы
      }}
    >
      {/* Белая шапка с центрированным логотипом */}
      <AppBar position="static" sx={{ backgroundColor: "white", boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <img 
            src="/Format=Logo-Description%20RUS,%20Color=Blue-Black.svg" 
            alt="Логотип Т1" 
            style={{ height: 40, width: "auto", objectFit: "contain" }} 
          />
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
