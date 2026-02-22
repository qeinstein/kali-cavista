export const Colors = {
  // Backgrounds
  bg: "#1A1A2E",
  bgLight: "#F8F9FA",
  card: "#16213E",
  cardAlt: "#0F3460",
  border: "#2A2A4A",

  // Accent — Forest Green
  green: "#1E8449",
  greenLight: "#27AE60",
  greenDim: "rgba(30,132,73,0.18)",
  greenBright: "#2ECC71",

  // Teal kept as secondary (used in existing main screens)
  teal: "#00D4AA",
  tealDim: "rgba(0,212,170,0.15)",
  tealDark: "#009E7F",

  // Semantic
  warning: "#E67E22",
  warningDim: "rgba(230,126,34,0.15)",
  danger: "#E74C3C",
  dangerDim: "rgba(231,76,60,0.15)",
  success: "#1E8449",
  successDim: "rgba(30,132,73,0.15)",

  // Text on dark
  textPrimary: "#F0F4FF",
  textSecondary: "#8891A5",
  textMuted: "#4A526B",

  // Text on light (onboarding)
  textDark: "#1A1A2E",
  textDarkSecondary: "#4A5568",
  textDarkMuted: "#9AA5B4",

  // Misc
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(26,26,46,0.85)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
};

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};
