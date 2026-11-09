// Presentation-only look of each dungeon theme (index matches THEMES in themes.ts).
// Floor art spans FLOOR_SPAN tiles so it never repeats per tile; trims hug the walls.
import type { CSSProperties } from "react";
import { dungeonArt } from "./art";

type Trim = { style: "band" | "soft" | "line"; color: string; edge?: string };
type Look = { trim: Trim; cap: string; amb?: string };
export const LOOKS: Look[] = [
  { trim: { style: "band", color: "#d4a94e", edge: "#231c26" }, cap: "#2b2630" },   // Vampire Castle: red carpet, gold trim, black marble edge
  { trim: { style: "soft", color: "#3a4436" }, cap: "#3c403f", amb: "fog" },       // Haunted Cemetery
  { trim: { style: "soft", color: "#c99a34" }, cap: "#221e1e", amb: "embers" },    // Dragon's Lair: treasure heaped along walls
  { trim: { style: "line", color: "#6fa3d8" }, cap: "#2f2d35" },                   // Dwarven City: rune-steel border
  { trim: { style: "soft", color: "#e6e2ea" }, cap: "#26242a" },                   // Spider Temple: webs gather at walls
  { trim: { style: "soft", color: "#cdbb85" }, cap: "#16302f", amb: "caustics" },  // Sunken Temple: sand drifts
  { trim: { style: "soft", color: "#ff6a1f" }, cap: "#181314", amb: "embers" },    // Infernal Fortress: lava seams
  { trim: { style: "line", color: "#8fe0ff" }, cap: "#2a2245", amb: "sparkle" },   // Wizard Tower: glowing sigil border
  { trim: { style: "soft", color: "#f2a9dc" }, cap: "#18361f", amb: "sparkle" },   // Feywild Grove: flowers along hedges
  { trim: { style: "soft", color: "#b46cff" }, cap: "#2a1630", amb: "pulse" },     // Mind Flayer Hive
  { trim: { style: "line", color: "#5ae58f" }, cap: "#222828", amb: "mist" },      // Necromancer's Crypt
  { trim: { style: "soft", color: "#0f2a2e" }, cap: "#141a16", amb: "mist" },      // Aboleth Ruins: black water at walls
  { trim: { style: "soft", color: "#3e2a16" }, cap: "#2e1e10" },                   // Goblin Warren
  { trim: { style: "soft", color: "#4d7a2c" }, cap: "#38361e" },                   // Jungle Temple: moss at walls
  { trim: { style: "soft", color: "#f4fbff" }, cap: "#3b6584", amb: "snow" },      // Frozen Ice Cavern
];
export const FLOOR_SPAN = 4, WALL_SPAN = 2;
const pos = (v: number, span: number) => `${((v % span) / (span - 1)) * 100}%`;
const SIDE = { n: "to bottom", s: "to top", w: "to right", e: "to left" } as const;

/** isWall(x,y) answers for the current floor; returns the tile's inline background. */
export function dungeonTileStyle(theme: number, x: number, y: number, isWall: (x: number, y: number) => boolean): CSSProperties {
  const look = LOOKS[theme] ?? LOOKS[0]!;
  if (isWall(x, y)) {
    const tex = `url(${dungeonArt(theme, true)}) ${pos(x, WALL_SPAN)} ${pos(y, WALL_SPAN)} / ${WALL_SPAN * 100}% ${WALL_SPAN * 100}%`;
    if (isWall(x, y + 1)) // wall top seen from above: dark cap, lighter rim where it meets a lit face or floor
      return { background: `linear-gradient(${look.cap}c4, ${look.cap}c4), ${tex}`, boxShadow: `inset 0 0 0 1px rgba(0,0,0,.3)` };
    // wall face: brick front with a stone cap and a dark base line
    return { background: `linear-gradient(to bottom, ${look.cap} 0 22%, rgba(0,0,0,.6) 22% 26%, transparent 26% 88%, rgba(0,0,0,.45) 88%), ${tex}` };
  }
  const layers: string[] = [];
  if (isWall(x, y - 1)) layers.push("linear-gradient(to bottom, rgba(0,0,0,.45), transparent 38%)"); // wall shadow
  for (const [k, dx, dy] of [["n", 0, -1], ["s", 0, 1], ["w", -1, 0], ["e", 1, 0]] as const) {
    if (!isWall(x + dx, y + dy)) continue;
    const dir = SIDE[k], t = look.trim;
    if (t.style === "band") layers.push(`linear-gradient(${dir}, ${t.edge} 0 16%, ${t.color} 16% 24%, transparent 24%)`);
    else if (t.style === "line") layers.push(`linear-gradient(${dir}, transparent 0 8%, ${t.color} 8% 13%, transparent 13%)`);
    else layers.push(`linear-gradient(${dir}, ${t.color}cc 0, ${t.color}55 18%, transparent 34%)`);
  }
  layers.push(`url(${dungeonArt(theme, false)}) ${pos(x, FLOOR_SPAN)} ${pos(y, FLOOR_SPAN)} / ${FLOOR_SPAN * 100}% ${FLOOR_SPAN * 100}%`);
  return { background: layers.join(", ") };
}
export const ambience = (theme: number) => LOOKS[theme]?.amb;
