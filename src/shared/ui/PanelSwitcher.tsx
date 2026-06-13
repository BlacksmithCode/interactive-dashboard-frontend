import { Box, Typography } from "@mui/material";

export interface PanelOption<T extends string> {
  value: T;
  label: string;
}

interface PanelSwitcherProps<T extends string> {
  options: [PanelOption<T>, PanelOption<T>]; // Строго 2 опции для корректной работы анимации
  activeValue: T;
  onChange: (value: T) => void;
}

export function PanelSwitcher<T extends string>({
  options,
  activeValue,
  onChange,
}: PanelSwitcherProps<T>) {
  const isFirstActive = activeValue === options[0].value;

  return (
    <Box
      sx={{
        display: "inline-grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        backgroundColor: "#1DAFF7", // Фон подложки
        borderRadius: "28px",       // Скругление капсулой
        p: "4px",                   // Внутренний отступ
      }}
    >
      {/* Анимированный ползунок (фон активной кнопки) */}
      <Box
        sx={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4,
          width: "calc(50% - 4px)",
          backgroundColor: "#0088FF", // Фон активного элемента
          borderRadius: "24px",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Плавная анимация (easing)
          transform: isFirstActive ? "translateX(0)" : "translateX(100%)",
          zIndex: 0,
        }}
      />

      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <Box
            key={option.value}
            onClick={() => onChange(option.value)}
            sx={{ px: 3, py: 1, cursor: "pointer", zIndex: 1, textAlign: "center" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                fontWeight: isActive ? 600 : 400,
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
