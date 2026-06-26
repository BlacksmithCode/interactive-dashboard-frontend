import { useState, useMemo, type ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ColorModeContext } from "./ColorModeContext";
import { colors } from "./tokens";

/* ---------- общие настройки типографики ---------- */
const typography = {
  fontFamily: '"als_hauss", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: { fontWeight: 900, fontSize: "2.5rem", lineHeight: 1.2 },
  h2: { fontWeight: 900, fontSize: "2rem", lineHeight: 1.25 },
  h3: { fontWeight: 700, fontSize: "1.75rem", lineHeight: 1.3 },
  h4: { fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.35 },
  h5: { fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.4 },
  h6: { fontWeight: 700, fontSize: "1rem", lineHeight: 1.4 },
  subtitle1: { fontWeight: 600, fontSize: "1rem" },
  subtitle2: { fontWeight: 600, fontSize: "0.875rem" },
  body1: { fontSize: "1rem", lineHeight: 1.6 },
  body2: { fontSize: "0.875rem", lineHeight: 1.6 },
  caption: { fontSize: "0.75rem", lineHeight: 1.5 },
} as const;

/* ---------- общие переопределения MUI-компонентов ---------- */
const commonComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: "background-color 0.4s ease, color 0.4s ease",
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: "all 0.3s ease",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        textTransform: "none" as const,
        fontWeight: 600,
        padding: "8px 20px",
      },
      contained: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: colors.glowPrimary,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        transition: "all 0.3s ease",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none", // убираем дефолтный overlay MUI
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        "& .MuiTableCell-head": {
          fontWeight: 700,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: "1px solid",
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }: { theme: { palette: { mode: string } } }) => ({
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: "0.8rem",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(0,0,0,0.85)"
            : "rgba(255,255,255,0.95)",
        color: theme.palette.mode === "dark" ? "#fff" : "#000",
        border:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.1)",
      }),
    },
  },
};

/** Тема для светлого режима в стиле Т1 */
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.success,
      contrastText: colors.white,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    success: {
      main: colors.success,
    },
    background: {
      default: colors.backgroundLight,
      paper: colors.surfaceLight,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.grey300,
    },
    divider: colors.grey100,
    action: {
      hover: colors.surfaceHoverLight,
      selected: "rgba(29, 175, 247, 0.08)",
    },
  },
  typography,
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    colors.shadowSm,
    colors.shadowSm,
    colors.shadowSm,
    colors.shadowMd,
    colors.shadowMd,
    colors.shadowMd,
    colors.shadowMd,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
    colors.shadowLg,
  ],
  components: {
    ...commonComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.3s ease",
          border: `1px solid ${colors.grey100}`,
          "&:hover": {
            boxShadow: colors.shadowMd,
            borderColor: colors.primaryLight,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.grey100}`,
        },
      },
    },
  },
});

/** Тема для тёмного режима в стиле Т1 */
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primaryDark,
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.success,
      contrastText: colors.white,
    },
    error: {
      main: colors.errorDark,
    },
    warning: {
      main: colors.warningDark,
    },
    info: {
      main: colors.primaryDark,
    },
    success: {
      main: colors.successDark,
    },
    background: {
      default: colors.backgroundDark,
      paper: colors.surfaceDark,
    },
    text: {
      primary: colors.textDark,
      secondary: colors.textSecondaryDark,
      disabled: colors.grey500,
    },
    divider: colors.grey700,
    action: {
      hover: colors.surfaceHoverDark,
      selected: "rgba(29, 175, 247, 0.15)",
    },
  },
  typography,
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 1px 3px rgba(0, 0, 0, 0.3)",
    "0 1px 3px rgba(0, 0, 0, 0.3)",
    "0 1px 3px rgba(0, 0, 0, 0.3)",
    "0 4px 12px rgba(0, 0, 0, 0.4)",
    "0 4px 12px rgba(0, 0, 0, 0.4)",
    "0 4px 12px rgba(0, 0, 0, 0.4)",
    "0 4px 12px rgba(0, 0, 0, 0.4)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
    "0 8px 30px rgba(0, 0, 0, 0.5)",
  ],
  components: {
    ...commonComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.3s ease",
          border: `1px solid ${colors.grey700}`,
          background: colors.gradientCard,
          "&:hover": {
            boxShadow: colors.glowPrimary,
            borderColor: colors.primary,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.grey700}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
