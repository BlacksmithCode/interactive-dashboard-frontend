import { Box, Typography, useTheme } from "@mui/material";
import { colors, transitions } from "@/shared/theme/tokens";

export interface PanelOption<T extends string> {
  value: T;
  label: string;
}

interface PanelSwitcherProps<T extends string> {
  options: [PanelOption<T>, PanelOption<T>];
  activeValue: T;
  onChange: (value: T) => void;
}

export function PanelSwitcher<T extends string>({
  options,
  activeValue,
  onChange,
}: PanelSwitcherProps<T>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isFirstActive = activeValue === options[0].value;

  return (
    <Box
      sx={{
        display: "inline-grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        background: isDark ? colors.gradientDark : colors.gradientPrimary,
        borderRadius: "32px",
        p: "5px",
        boxShadow: colors.glowPrimary,
      }}
    >
      {/* Анимированный ползунок */}
      <Box
        sx={{
          position: "absolute",
          top: 5,
          bottom: 5,
          left: 5,
          width: "calc(50% - 5px)",
          background: isDark ? 'linear-gradient(135deg, #303352 0%, #1e2038 100%)' : colors.gradientSecondary,
          borderRadius: "28px",
          transition: "transform 0.3s ease-in-out",
          transform: isFirstActive ? "translateX(0)" : "translateX(100%)",
          zIndex: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />

      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <Box
            key={option.value}
            onClick={() => onChange(option.value)}
            sx={{ px: 3, py: 1.2, cursor: "pointer", zIndex: 1, textAlign: "center" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isActive ? colors.white : "rgba(255, 255, 255, 0.75)",
                fontWeight: isActive ? 700 : 500,
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                letterSpacing: "0.02em",
                fontSize: "0.85rem",
                transition: transitions.normal,
                "&::after": {
                  content: `"${option.label}"`,
                  fontWeight: 600,
                  visibility: "hidden",
                  height: 0,
                },
              }}
            >
              {option.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
