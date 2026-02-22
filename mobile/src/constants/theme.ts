import { useColorScheme } from "react-native";
import { useAppStore } from "../store/useAppStore";

export const darkColors = {
  // Backgrounds
  bg: "#1A1A2E",
  bgLight: "#F8F9FA",
  card: "#16213E",
  cardAlt: "#0F3460",
  border: "#2A2A4A",

  // Accent — Forest Green
  green: "#1B4332",
  greenLight: "#2D6A4F",
  greenDim: "rgba(27,67,50,0.18)",
  greenBright: "#40916C",

  // Teal kept as secondary (used in existing main screens)
  teal: "#00D4AA",
  tealDim: "rgba(0,212,170,0.15)",
  tealDark: "#009E7F",

  // Semantic
  warning: "#E67E22",
  warningDim: "rgba(230,126,34,0.15)",
  danger: "#E74C3C",
  dangerDim: "rgba(231,76,60,0.15)",
  success: "#1B4332",
  successDim: "rgba(27,67,50,0.15)",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#E2E8F6",
  textMuted: "#A0AEC0",
  textInverse: "#1A1A2E", // for pills or backgrounds where text must invert

  // Misc
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.65)",
};

export const lightColors = {
  // Backgrounds
  bg: "#F4F7FF", // Subtle low-fade blue
  bgLight: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#EBF1FF", // slightly deeper subtle blue for cards
  border: "#E2E8F0",

  // Accent — Brand
  green: "#1B4332",
  greenLight: "#2D6A4F",
  greenDim: "rgba(27,67,50,0.08)",
  greenBright: "#40916C",

  // Teal
  teal: "#00D4AA",
  tealDim: "rgba(0,212,170,0.1)",
  tealDark: "#009E7F",

  // Semantic
  warning: "#E67E22",
  warningDim: "rgba(230,126,34,0.1)",
  danger: "#E74C3C",
  dangerDim: "rgba(231,76,60,0.1)",
  success: "#1B4332",
  successDim: "rgba(27,67,50,0.1)",

  // Text
  textPrimary: "#1A1A2E",
  textSecondary: "#4A5568",
  textMuted: "#9AA5B4",
  textInverse: "#FFFFFF",

  // Misc
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.45)",
};

// Backwards compatibility alias while we refactor files iteratively.
// This will eventually be removed once all components use `useThemeColor()`
export const Colors = darkColors;

export function useThemeColor() {
  const systemScheme = useColorScheme();
  const themePreference = useAppStore((s) => s.themePreference);

  const activeMode =
    themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  return activeMode === "dark" ? darkColors : lightColors;
}

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
