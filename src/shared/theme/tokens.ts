/**
 * Цветовая палитра бренда Т1 (реальные цвета с сайта т1.рф).
 *
 * Основной акцент — #1daff7 (яркий синий)
 * Градиенты, свечения и 3D-эффекты создают технологичный стиль.
 */

export const colors = {
  // ── Основные акценты Т1 (реальные цвета с сайта) ────
  primary: "#1daff7",
  primaryDark: "#1a9ff8",
  primaryHover: "#008acd",
  primaryLight: "#4fc3f7",

  // ── Градиенты (использовать через background) ────────
  gradientPrimary: "linear-gradient(135deg, #1daff7 0%, #00aae6 100%)",
  gradientSecondary: "linear-gradient(135deg, #4fc3f7 0%, #1daff7 100%)",
  gradientAccent: "linear-gradient(135deg, #1daff7 0%, #008acd 100%)",
  gradientDark: "linear-gradient(135deg, #030125 0%, #272942 100%)",
  gradientCard: "linear-gradient(145deg, #272942 0%, #1e2038 100%)",

  // ── Фоновые цвета (светлая тема) ─────────────────────
  backgroundLight: "#f5f5f5",
  surfaceLight: "#ffffff",
  surfaceHoverLight: "#dddee0",
  surfaceHoverLightAccent: "#f4f4f4",

  // ── Фоновые цвета (тёмная тема) ──────────────────────
  backgroundDark: "#030125",
  surfaceDark: "#272942",
  surfaceVariantDark: "#303352",
  surfaceHoverDark: "#3a3c5a",
  appbarDark: "#151730",

  // ── Текстовые цвета ────────────────────────────────────
  textPrimary: "#2a2d30",
  textSecondary: "#35383a",
  textDark: "#e0e0e0",
  textSecondaryDark: "#b0b0b0",

  // ── Семантические акценты (светлая тема) ────────────
  success: "#2f9d76",
  successLight: "rgba(47, 157, 118, 0.12)",
  warning: "#ff953f",
  warningLight: "rgba(255, 149, 63, 0.12)",
  error: "#ee5d48",
  errorLight: "rgba(238, 93, 72, 0.12)",
  info: "#1daff7",
  infoLight: "rgba(29, 175, 247, 0.12)",

  // ── Яркие цвета для графиков и диаграмм ────────────
  chartGreen: "#00d25b",
  chartRed: "#ff4757",

  // ── Семантические акценты (тёмная тема) ──────────────
  successDark: "#217d5e",
  successDarkLight: "rgba(33, 125, 94, 0.15)",
  warningDark: "#c77a2f",
  warningDarkLight: "rgba(199, 122, 47, 0.15)",
  errorDark: "#b54535",
  errorDarkLight: "rgba(181, 69, 53, 0.15)",

  // ── Нейтральные / текстовые ──────────────────────────
  white: "#ffffff",
  grey50: "#f8f9fc",
  grey100: "#e9ecf3",
  grey200: "#d1d6e3",
  grey300: "#aeb4c6",
  grey400: "#8a90a8",
  grey500: "#6b7189",
  grey600: "#4d5369",
  grey700: "#363b4f",
  grey800: "#222638",
  grey900: "#121529",
  black: "#080a1a",

  // ── Тени и свечения ──────────────────────────────────
  shadowSm: "0 1px 3px rgba(0, 0, 0, 0.08)",
  shadowMd: "0 4px 12px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 8px 30px rgba(0, 0, 0, 0.12)",
  glowPrimary: "0 0 20px rgba(29, 175, 247, 0.25)",
  glowPrimaryHover: "0 0 30px rgba(29, 175, 247, 0.4)",
} as const;

export const transitions = {
  fast: "all 0.15s ease",
  normal: "all 0.3s ease",
  slow: "all 0.5s ease",
  spring: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
