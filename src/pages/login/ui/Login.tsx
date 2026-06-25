// src/pages/Login.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { TextField, Button, Box, Typography, Alert, Paper, AppBar, Toolbar, IconButton, InputAdornment, useTheme } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "@/shared/theme/useColorMode";
import { Logo } from "@/shared/ui/logo/Logo";
import { loginUser } from "@/entities/user";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (username && password) {
      try {
        setIsLoading(true);
        const response = await loginUser(username, password);
        login(response);
        navigate("/dashboard");
      } catch (err) {
        const error = err as { message?: string; statusCode?: number };
        
        // Маппинг ошибок от бэкенда к пользовательским сообщениям
        const backendError = error.message || '';
        if (
          backendError.includes('disabled') ||
          backendError.includes('Disabled') ||
          backendError.includes('заблокирован') ||
          backendError.includes('Заблокирован')
        ) {
          setError("Доступ запрещен");
        } else if (backendError) {
          // Показываем реальное сообщение с бэкенда
          setError(backendError);
        } else if (error.statusCode === 403 || error.statusCode === 401) {
          setError("Неверный логин или пароль");
        } else {
          setError("Ошибка при входе");
        }
      } finally {
        setIsLoading(false);
      }
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
            onClick={toggleColorMode}
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
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      <Button type="submit" disabled={isLoading} variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}>
        {isLoading ? "Вход..." : "Войти"}
        </Button>
      </Paper>
      </Box>
    </Box>
  );
}
