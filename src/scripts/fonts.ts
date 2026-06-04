export type FontId =
  | "0x-proto"
  | "big-blue-term"
  | "big-blue-term-plus"
  | "departure";

export interface Font {
  id: FontId;
  name: string;
}

const FONTS: Record<FontId, Font> = {
  "0x-proto":           { id: "0x-proto",           name: "0x Proto" },
  "big-blue-term":      { id: "big-blue-term",      name: "Big Blue Term" },
  "big-blue-term-plus": { id: "big-blue-term-plus", name: "Big Blue Term+" },
  departure:            { id: "departure",          name: "Departure Mono" },
};

const FONT_ORDER: FontId[] = [
  "0x-proto",
  "big-blue-term",
  "big-blue-term-plus",
  "departure",
];

const STORAGE_KEY = "font";

export function getAllFonts(): Font[] {
  return Object.values(FONTS);
}

export function getFont(): Font {
  const current = document.documentElement.dataset.font as FontId | undefined;
  return current && FONTS[current] ? FONTS[current] : FONTS["0x-proto"];
}

export function setFont(id: FontId): Font {
  document.documentElement.dataset.font = id;
  localStorage.setItem(STORAGE_KEY, id);
  return FONTS[id];
}

export function cycleFont(): Font {
  const current = getFont().id;
  const idx = FONT_ORDER.indexOf(current);
  const next = FONT_ORDER[(idx + 1) % FONT_ORDER.length];
  return setFont(next);
}

export function initFont(): Font {
  const stored = localStorage.getItem(STORAGE_KEY) as FontId | null;
  const id = stored && FONTS[stored] ? stored : "0x-proto";
  return setFont(id);
}
