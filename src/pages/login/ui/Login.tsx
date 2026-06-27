import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { TextField, Button, Box, Typography, Alert, Paper, AppBar, Toolbar, IconButton, InputAdornment, useTheme } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "@/shared/theme/useColorMode";
import { Logo } from "@/shared/ui/logo/Logo";
import { loginUser, normalizeErrorMessage } from "@/entities/user";
import { colors, transitions } from "@/shared/theme/tokens";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === "dark";

  // Если пользователь уже аутентифицирован — перенаправляем на дашборд
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
        
        const backendError = error.message || '';
        
        if (backendError.includes('Доступ запрещен') || backendError.includes('disabled') || backendError.includes('Disabled')) {
          setError("Доступ запрещен");
        } else if (backendError.includes('Неверный логин или пароль')) {
          setError("Неверный логин или пароль");
        } else if (backendError) {
          // Нормализуем любую неожиданную ошибку от бэкенда
          setError(normalizeErrorMessage(backendError));
        } else if (error.statusCode === 403) {
          setError("Доступ запрещен");
        } else if (error.statusCode === 401) {
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
        transition: transitions.normal,
      }}
    >
      {/* Шапка с логотипом и переключателем темы */}
      <AppBar
        position="static"
        sx={{
          background: isDark ? colors.gradientDark : colors.surfaceLight,
          boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)",
          borderBottom: isDark ? `1px solid ${colors.grey700}` : `1px solid ${colors.grey100}`,
          transition: transitions.normal,
        }}
      >
        <Toolbar sx={{ position: "relative", justifyContent: "center" }}>
          <Logo type="full" height={40} />
          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            sx={{
              position: "absolute",
              right: 16,
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
        </Toolbar>
      </AppBar>

      {/* Контейнер формы */}
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Paper
          elevation={isDark ? 4 : 2}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 400,
            borderRadius: 3,
            border: isDark ? `1px solid ${colors.grey700}` : `1px solid ${colors.grey100}`,
            background: isDark ? colors.gradientCard : colors.surfaceLight,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: colors.gradientPrimary,
            },
          }}
        >
          <Typography variant="h5" component="h1" align="center" sx={{ fontWeight: 900, mb: 3, letterSpacing: "-0.02em" }}>
            Вход в систему
          </Typography>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, "& .MuiAlert-icon": { color: colors.error } }}
            >
              {error}
            </Alert>
          )}
          <TextField
            label="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
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
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            type="submit"
            disabled={isLoading}
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 2,
              background: colors.gradientPrimary,
              "&:hover": {
                background: colors.gradientSecondary,
                boxShadow: colors.glowPrimaryHover,
              },
            }}
          >
            {isLoading ? "Вход..." : "Войти"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
