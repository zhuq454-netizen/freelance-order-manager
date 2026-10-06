export const tokens = {
  "color": {
    "brand": {
      "primary": "#4F6BFF",
      "hover": "#4058E8",
      "active": "#3549C9",
      "soft": "#EEF2FF"
    },
    "tech": {
      "blue": "#3B82F6",
      "cyan": "#22D3EE"
    },
    "page": "#F7F9FC",
    "surface": "#FFFFFF",
    "surfaceSubtle": "#F8FAFC",
    "surfaceHover": "#F1F5F9",
    "border": "#E2E8F0",
    "borderStrong": "#CBD5E1",
    "text": {
      "primary": "#0F172A",
      "secondary": "#475569",
      "muted": "#64748B",
      "disabled": "#94A3B8"
    },
    "business": {
      "video": "#F59E0B",
      "it": "#06B6D4",
      "drone": "#10B981"
    },
    "status": {
      "success": "#047857",
      "successSoft": "#ECFDF5",
      "info": "#1D4ED8",
      "infoSoft": "#EFF6FF",
      "warning": "#B45309",
      "warningSoft": "#FFFBEB",
      "error": "#B91C1C",
      "errorSoft": "#FEF2F2",
      "neutral": "#475569",
      "neutralSoft": "#F1F5F9"
    },
    "overlay": "rgba(15, 23, 42, 0.36)",
    "focusRing": "rgba(79, 107, 255, 0.28)"
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "12": "48px"
  },
  "radius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "pill": "999px"
  },
  "shadow": {
    "card": "0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px rgba(15, 23, 42, 0.04)",
    "popover": "0 12px 36px rgba(15, 23, 42, 0.12)"
  },
  "motion": {
    "fast": "140ms",
    "normal": "220ms"
  },
  "font": {
    "family": "Inter, HarmonyOS Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif",
    "size": {
      "xs": "12px",
      "sm": "13px",
      "base": "14px",
      "lg": "16px",
      "xl": "20px",
      "title": "28px"
    }
  }
} as const;

export type DesignTokens = typeof tokens;
