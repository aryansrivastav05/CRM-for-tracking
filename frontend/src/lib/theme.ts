export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  bg: string;
  headerBg: string;
  cardBg: string;
  cardBgSecondary: string;
  glassBackdrop: string;
  glassBorder: string;
  glassShadow: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentHover: string;
  accentBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  watermarkOpacity: number;
  tableHeaderBg: string;
  tableRowHover: string;
}

export const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    // Ultra-Luxe Ethereal Crystal Light
    bg: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.08), transparent 70%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    headerBg: "rgba(255, 255, 255, 0.88)",
    cardBg: "rgba(255, 255, 255, 0.82)",
    cardBgSecondary: "rgba(241, 245, 249, 0.92)",
    glassBackdrop: "blur(24px) saturate(190%)",
    glassBorder: "1px solid rgba(226, 232, 240, 0.9)",
    glassShadow: "0 12px 32px -6px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 1)",
    border: "rgba(226, 232, 240, 0.9)",
    borderSubtle: "rgba(203, 213, 225, 0.6)",
    textPrimary: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    accentPrimary: "#4f46e5",
    accentHover: "#4338ca",
    accentBg: "rgba(79, 70, 229, 0.08)",
    success: "#059669",
    successBg: "rgba(5, 150, 105, 0.10)",
    warning: "#d97706",
    warningBg: "rgba(217, 119, 6, 0.10)",
    danger: "#dc2626",
    dangerBg: "rgba(220, 38, 38, 0.08)",
    watermarkOpacity: 0.025,
    tableHeaderBg: "rgba(241, 245, 249, 0.85)",
    tableRowHover: "rgba(241, 245, 249, 0.70)"
  },
  dark: {
    // Sovereign Obsidian Midnight (Luxury Bloomberg/Linear Aesthetics)
    bg: "radial-gradient(ellipse 80% 45% at 50% -10%, rgba(99, 102, 241, 0.18), transparent 75%), radial-gradient(circle 600px at 90% 20%, rgba(245, 158, 11, 0.06), transparent 70%), linear-gradient(180deg, #070913 0%, #030408 100%)",
    headerBg: "rgba(10, 14, 26, 0.85)",
    cardBg: "rgba(13, 18, 35, 0.72)",
    cardBgSecondary: "rgba(19, 26, 52, 0.65)",
    glassBackdrop: "blur(24px) saturate(210%)",
    glassBorder: "1px solid rgba(255, 255, 255, 0.09)",
    glassShadow: "0 16px 40px -10px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
    border: "rgba(255, 255, 255, 0.08)",
    borderSubtle: "rgba(255, 255, 255, 0.05)",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",
    accentPrimary: "#6366f1",
    accentHover: "#4f46e5",
    accentBg: "rgba(99, 102, 241, 0.18)",
    success: "#10b981",
    successBg: "rgba(16, 185, 129, 0.16)",
    warning: "#f59e0b",
    warningBg: "rgba(245, 158, 11, 0.16)",
    danger: "#ef4444",
    dangerBg: "rgba(239, 68, 68, 0.18)",
    watermarkOpacity: 0.04,
    tableHeaderBg: "rgba(13, 18, 35, 0.90)",
    tableRowHover: "rgba(25, 34, 66, 0.55)"
  }
};
