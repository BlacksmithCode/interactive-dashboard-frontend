import { Box, useTheme } from "@mui/material";
import logoFullLight from "../../assets/logo-full-light.svg";
import logoFullDark from "../../assets/logo-full-dark.svg";
import logoShortLight from "../../assets/logo-short-light.svg";
import logoShortDark from "../../assets/logo-short-dark.svg";

interface LogoProps {
  type?: "full" | "short";
  height?: number;
  alt?: string;
}

export const Logo = ({ type = "full", height = 40, alt = "Логотип" }: LogoProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const lightSrc = type === "full" ? logoFullLight : logoShortLight;
  const darkSrc = type === "full" ? logoFullDark : logoShortDark;

  return (
    <Box sx={{ position: "relative", height, display: "inline-flex" }}>
      {/* Светлый логотип */}
      <img
        src={lightSrc}
        alt={alt}
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          opacity: isDark ? 0 : 1,
          transition: "opacity 0.4s ease-in-out",
        }}
      />
      {/* Темный логотип (накладывается поверх) */}
      <img
        src={darkSrc}
        alt={`${alt} Dark`}
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: isDark ? 1 : 0,
          transition: "opacity 0.4s ease-in-out",
        }}
      />
    </Box>
  );
};