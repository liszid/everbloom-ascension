// Cartoon icon lookup for map items; gameplay keeps emoji ids, art is presentation only.
const ICONS = import.meta.glob("../assets/art/i_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const icon = (id: string): string | undefined => ICONS[`../assets/art/i_${id}.webp`];

const DECO: Record<string, string> = {
  "🗿": "moai", "🏆": "trophy", "🪓": "axe", "⛲": "fountain", "⚱️": "urn", "🗽": "liberty", "🌟": "star", "🔨": "hammer",
  "🌲": "pine", "💎": "diamond", "🌻": "sunflower", "⛵": "boat", "🐎": "horse", "🍰": "cake", "📚": "books", "🎭": "masks",
  "👑": "crown", "💰": "moneybag",
};
export const decoArt = (emoji: string) => (DECO[emoji] ? icon(DECO[emoji]!) : undefined);
