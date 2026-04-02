export const ACCENT_IDS = ["lime", "blue", "emerald", "amber", "coral", "graphite", "indigo"] as const;

export type ThemeMode = "dark" | "light";
export type AccentId = (typeof ACCENT_IDS)[number];

export const DEFAULT_THEME: ThemeMode = "dark";
export const DEFAULT_ACCENT: AccentId = "lime";
export const LIGHT_MODE_ACCENT: AccentId = "lime";

function sanitizeTheme(value: string | null): ThemeMode {
  return value === "light" ? "light" : "dark";
}

function sanitizeAccent(value: string | null): AccentId {
  return (ACCENT_IDS as readonly string[]).includes(value ?? "") ? (value as AccentId) : DEFAULT_ACCENT;
}

export function normalizeAccentForTheme(_theme: ThemeMode, accent: AccentId): AccentId {
  return accent;
}

export function readThemeState(): { theme: ThemeMode; accent: AccentId } {
  const theme = sanitizeTheme(localStorage.getItem("resumeai_theme"));
  const accent = normalizeAccentForTheme(theme, sanitizeAccent(localStorage.getItem("resumeai_accent")));
  return { theme, accent };
}

export function applyThemeState(theme: ThemeMode, accent: AccentId): { theme: ThemeMode; accent: AccentId } {
  const normalizedAccent = normalizeAccentForTheme(theme, accent);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-accent", normalizedAccent);
  localStorage.setItem("resumeai_theme", theme);
  localStorage.setItem("resumeai_accent", normalizedAccent);
  return { theme, accent: normalizedAccent };
}

export function applyAccentSelection(theme: ThemeMode, accent: AccentId): { theme: ThemeMode; accent: AccentId } {
  return applyThemeState(theme, accent);
}
