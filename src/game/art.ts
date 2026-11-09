// Cartoon icon lookup for map items; gameplay keeps emoji ids, art is presentation only.
const ICONS = import.meta.glob("../assets/art/i_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const icon = (id: string): string | undefined => ICONS[`../assets/art/i_${id}.webp`];

const DECO: Record<string, string> = {
  "🗿": "moai", "🏆": "trophy", "🪓": "axe", "⛲": "fountain", "⚱️": "urn", "🗽": "liberty", "🌟": "star", "🔨": "hammer",
  "🌲": "pine", "💎": "diamond", "🌻": "sunflower", "⛵": "boat", "🐎": "horse", "🍰": "cake", "📚": "books", "🎭": "masks",
  "👑": "crown", "💰": "moneybag",
};
export const decoArt = (emoji: string) => (DECO[emoji] ? icon(DECO[emoji]!) : undefined);

const OBJ = import.meta.glob("../assets/art/o_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const objArt = (id: string): string | undefined => OBJ[`../assets/art/o_${id}.webp`];
const SCENES = import.meta.glob("../assets/art/s_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const sceneArt = (id: string): string | undefined => SCENES[`../assets/art/s_${id}.webp`];
const EMOJI_ART: Record<string, () => string | undefined> = {
  "🌲": () => icon("pine"), "🌳": () => objArt("T"), "🪨": () => objArt("R"), "💎": () => icon("diamond"), "🌾": () => icon("wheat"),
  "🐄": () => objArt("w"), "🐔": () => objArt("c"), "🐑": () => objArt("s"), "🌻": () => icon("sunflower"), "🌼": () => objArt("F"),
  "🪓": () => icon("axe"), "⛏️": () => icon("hammer"), "🐟": () => icon("fish"),
};
export const emojiArt = (e: string) => EMOJI_ART[e]?.();
