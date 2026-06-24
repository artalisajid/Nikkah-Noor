import { Platform } from "react-native";

export const colors = {
  bg: "#0D0D0D",
  bgOne: "#141418",
  bgTwo: "#1A1A2E",
  bgThree: "#2A2A2A",
  surface: "#1A1A1A",
  surfaceTwo: "#222225",
  text: "#FFFFFF",
  textSoft: "#A8A8A8",
  textFaint: "#6D6D6D",
  gold: "#D4AF37",
  goldTwo: "#C9A961",
  copper: "#B87333",
  emerald: "#2C5F4F",
  success: "#2ECC71",
  warning: "#F39C12",
  error: "#8B1538",
  info: "#3498DB",
  purple: "#6B2D5C",
  burgundy: "#8B1538",
  teal: "#1B4D5F",
  navy: "#2C3E50",
  border: "rgba(255,255,255,0.09)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 7 },
    web: { boxShadow: "0 4px 20px rgba(0,0,0,0.4)" },
    default: {},
  }),
  glow: Platform.select({
    ios: {
      shadowColor: colors.gold,
      shadowOpacity: 0.3,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
    },
    android: { elevation: 9 },
    web: { boxShadow: "0 0 20px rgba(212,175,55,0.32)" },
    default: {},
  }),
};

export const type = {
  h1: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: 0,
  },
  h2: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: 0,
  },
  h3: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: 0,
  },
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  small: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
};
