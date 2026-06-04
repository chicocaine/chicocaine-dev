export type ThemeId =
  | "terminal"
  | "dracula"
  | "monokai"
  | "gruvbox"
  | "nord"
  | "kanagawa";

export interface Theme {
  id: ThemeId;
  name: string;
}

const THEMES: Record<ThemeId, Theme> = {
  terminal: { id: "terminal", name: "Terminal" },
  dracula:  { id: "dracula",  name: "Dracula" },
  monokai:  { id: "monokai",  name: "Monokai" },
  gruvbox:  { id: "gruvbox",  name: "Gruvbox" },
  nord:     { id: "nord",     name: "Nord" },
  kanagawa: { id: "kanagawa", name: "Kanagawa" },
};

const THEME_ORDER: ThemeId[] = [
  "terminal",
  "dracula",
  "monokai",
  "gruvbox",
  "nord",
  "kanagawa",
];

const STORAGE_KEY = "theme";

export function getAllThemes(): Theme[] {
  return Object.values(THEMES);
}

export function getTheme(): Theme {
  const current = document.documentElement.dataset.theme as ThemeId | undefined;
  return current && THEMES[current] ? THEMES[current] : THEMES["terminal"];
}

export function setTheme(id: ThemeId): Theme {
  document.documentElement.dataset.theme = id;
  localStorage.setItem(STORAGE_KEY, id);
  return THEMES[id];
}

export function cycleTheme(): Theme {
  const current = getTheme().id;
  const idx = THEME_ORDER.indexOf(current);
  const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  return setTheme(next);
}

export function initTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  const id = stored && THEMES[stored] ? stored : "terminal";
  return setTheme(id);
}
