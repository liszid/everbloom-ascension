// Weapon archetypes — pure data. Each has an ideal material mix (role multipliers);
// the archetype whose mix is closest to the materials used decides the weapon type.
import type { MatRole, StatKey } from "./data";

export type ArchId = "sword" | "axe" | "scythe" | "hammer" | "spear" | "staff" | "dagger";
export type ArchDim = Exclude<MatRole, "hide" | "other"> | "dark";
export const ARCH_DIMS: ArchDim[] = ["wood", "metal", "stone", "bone", "gem", "dark"];
export interface Archetype {
  id: ArchId; icon: string; one: string; two: string; w: Partial<Record<ArchDim, number>>; trait: string;
  /** patk/matk/mp: +fraction of the item's value; crit/critDmg/acc/dodge: flat % points. */
  mods: Partial<Record<StatKey, number>>; effects?: { id: "bleed" | "lifesteal" | "pierce" | "manaflow"; v: number }[];
}
export const ARCHETYPES: Archetype[] = [
  { id: "sword", icon: "🗡️", one: "Blade", two: "Greatsword", w: { metal: 2.5, wood: 0.5 }, trait: "Balanced: +5% P.Attack, +3% crit, +4% accuracy", mods: { patk: 0.05, crit: 3, acc: 4 } },
  { id: "axe", icon: "🪓", one: "Axe", two: "Greataxe", w: { wood: 2, metal: 1, bone: 0.5 }, trait: "Heavy chops: +15% P.Attack, +15% crit damage", mods: { patk: 0.15, critDmg: 15 } },
  { id: "scythe", icon: "🌾", one: "Sickle", two: "Scythe", w: { wood: 2, metal: 1.5, bone: 2, dark: 2 }, trait: "Reaper's edge: +5% P.Attack, built-in bleed and life steal", mods: { patk: 0.05 }, effects: [{ id: "bleed", v: 3 }, { id: "lifesteal", v: 3 }] },
  { id: "hammer", icon: "🔨", one: "Mace", two: "Warhammer", w: { metal: 2.5, wood: 1, stone: 2 }, trait: "Crushing: +10% P.Attack, +25% crit damage, ignores 10% defense", mods: { patk: 0.1, critDmg: 25 }, effects: [{ id: "pierce", v: 10 }] },
  { id: "spear", icon: "🔱", one: "Spear", two: "Halberd", w: { wood: 2.5, metal: 1.5 }, trait: "Reach: +5% crit, +6% accuracy", mods: { crit: 5, acc: 6 } },
  { id: "staff", icon: "🪄", one: "Wand", two: "Greatstaff", w: { wood: 2.5, gem: 2.5, metal: 0.2 }, trait: "Arcane focus: +25% M.Attack, mana flow", mods: { matk: 0.25 }, effects: [{ id: "manaflow", v: 2 }] },
  { id: "dagger", icon: "🔪", one: "Dagger", two: "Twin Daggers", w: { metal: 1.8, bone: 1.5, wood: 0.2 }, trait: "Quick: +7% crit, +4% dodge", mods: { crit: 7, dodge: 4 } },
];
export const ARCH: Record<ArchId, Archetype> = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a])) as Record<ArchId, Archetype>;

/** Ranks archetypes by how closely the material mix matches each ideal mix (cosine match, 0–1). Ties keep list order. */
export function rankArchetypes(mix: Partial<Record<ArchDim, number>>): { a: Archetype; match: number }[] {
  const norm = (v: Partial<Record<ArchDim, number>>) => Math.sqrt(ARCH_DIMS.reduce((t, d) => t + (v[d] ?? 0) ** 2, 0));
  const nm = norm(mix); if (!nm) return [];
  return ARCHETYPES.map((a) => ({ a, match: ARCH_DIMS.reduce((t, d) => t + (mix[d] ?? 0) * (a.w[d] ?? 0), 0) / (nm * norm(a.w)) }))
    .sort((x, y) => y.match - x.match);
}
