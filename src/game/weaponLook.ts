// Presentation-only: derives how an equipped weapon looks from its materials, tier and id.
// The top material (the one the weapon is named after) sets the head colour and family,
// tier sets the quality style (crude → fine → ornate → majestic) and the gear id seeds
// small shape variations so two weapons of the same recipe still differ.
import { getMat, matRole, type MatRole } from "./data";
import type { Gear } from "./engine";

export type WeaponQuality = 0 | 1 | 2 | 3;
export interface WeaponLook {
  fam: MatRole; mat: string; tier: number; q: WeaponQuality;
  head: string; dark: string; grip: string; accent: string; glow?: string | undefined; seed: number;
}

const EL: Record<string, string> = { fire: "#ff7a2a", water: "#4ac0ff", wind: "#9af0d0", earth: "#c08a3a", light: "#fff2a0", dark: "#b060ff", nature: "#7ae05a", void: "#ff4ad8" };
/** [head, shade] per material key (ore/log family). */
const PALETTE: Record<string, [string, string]> = {
  // metals
  copper: ["#d88a52", "#8a4a26"], iron: ["#a9b1bb", "#5c646e"], silver: ["#e6ebf1", "#8a96a4"], gold: ["#ffd24a", "#a8761a"],
  mithril: ["#a6dcff", "#3f7fb0"], adamant: ["#72d08c", "#2c7a44"], cobalt: ["#5f8eff", "#23408f"], runite: ["#b47cff", "#5a2e9a"],
  orichalcum: ["#ff9a3a", "#a8481a"], aetherium: ["#eefaff", "#78bfe8"], voidite: ["#56307a", "#1a0c2a"],
  // woods
  oak: ["#a8733f", "#6a4424"], birch: ["#eadfc4", "#a8957a"], ironwood: ["#5e4e3e", "#2e241a"], elder: ["#e8d8a0", "#a8945a"],
  maple: ["#c86a2c", "#7a3a14"], yew: ["#7a4430", "#3e1e14"], bloodwood: ["#a82e2e", "#5a1212"], ghostwood: ["#c2d0de", "#6a7a8a"],
  frostpine: ["#b0e0ee", "#5a98aa"], worldtree: ["#7a9a40", "#3e5a1a"], aether: ["#c2b2ff", "#6a5ab8"], primordial: ["#567a30", "#26401a"],
  // others
  stone: ["#9a9893", "#5a5854"], obsidian: ["#3a3446", "#16121e"],
};
const FAM: Record<MatRole, [string, string]> = {
  wood: ["#a8733f", "#6a4424"], metal: ["#b8bec8", "#5c646e"], stone: ["#9a9893", "#5a5854"], bone: ["#f1e6c8", "#a8957a"],
  gem: ["#9ad8ff", "#3a78a8"], hide: ["#9a7a5a", "#5a4026"], other: ["#b0a090", "#6a5a4a"],
};

export const matKey = (id: string) => id.replace(/^carved_/, "").split("_")[0]!;
export const qualityOf = (tier: number): WeaponQuality => (tier <= 2 ? 0 : tier <= 5 ? 1 : tier <= 8 ? 2 : 3);
export function hashSeed(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }

/** The material the weapon is named after (the name's first word), else the heaviest by qty × tier. */
export function topMaterial(g: Pick<Gear, "name" | "materials">) {
  const first = g.name.split(" ")[0]?.toLowerCase();
  const named = g.materials.find((x) => getMat(x.id).name.split(" ")[0]!.toLowerCase() === first);
  return named ?? g.materials.slice().sort((a, b) => b.qty * 1.6 ** getMat(b.id).tier - a.qty * 1.6 ** getMat(a.id).tier)[0];
}

export function weaponLook(g: Pick<Gear, "id" | "name" | "materials" | "avgTier" | "element"> & { ench?: { el: string } | undefined }): WeaponLook {
  const top = topMaterial(g);
  const tm = top ? getMat(top.id) : undefined;
  const fam: MatRole = top ? matRole(top.id) : "metal";
  const tier = Math.max(tm?.tier ?? 0, Math.round(g.avgTier ?? 0));
  const q = qualityOf(tier);
  const el = g.ench?.el ?? (g.element !== "none" ? g.element : tm?.element);
  const elc = el ? EL[el] : undefined;
  const pal = (top && PALETTE[matKey(top.id)]) ?? (fam === "gem" && elc ? [elc, "#2a3a5a"] as [string, string] : FAM[fam]);
  const woodPart = g.materials.find((x) => x.id !== top?.id && matRole(x.id) === "wood");
  const grip = q === 3 ? "#3a2a5a" : woodPart ? (PALETTE[matKey(woodPart.id)] ?? FAM.wood)[1] : fam === "wood" ? pal[1] : "#6a4424";
  const accent = q === 0 ? (fam === "wood" ? pal[1] : "#7a6a5a") : q === 1 ? "#b08a4a" : q === 2 ? "#d8a83a" : "#ffe27a";
  const glow = q >= 2 || tier >= 4 ? (elc ?? (q === 3 ? "#fff2a0" : undefined)) : undefined;
  return { fam, mat: top?.id ?? "", tier, q, head: pal[0], dark: pal[1], grip, accent, glow, seed: hashSeed(g.id) };
}
