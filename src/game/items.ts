// Church services and Craftery single-use items — pure data, no engine imports.
import type { Element } from "./data";

export type AilmentId = "poisoned" | "weakened" | "cursed" | "bleeding";
export const AILMENTS: Record<AilmentId, { name: string; icon: string; desc: string; cost: number }> = {
  poisoned: { name: "Poisoned", icon: "🤢", desc: "No natural healing while walking, −1 HP per dungeon step", cost: 30 },
  weakened: { name: "Weakened", icon: "🥀", desc: "−15% physical and magic attack", cost: 45 },
  cursed: { name: "Cursed", icon: "🌑", desc: "−10% defense, −10 luck, −5% crit", cost: 70 },
  bleeding: { name: "Bleeding", icon: "🩸", desc: "−10% max HP", cost: 35 },
};

export type BlessingId = "might" | "ward" | "vigor" | "fortune" | "swift";
export const BLESSINGS: Record<BlessingId, { name: string; icon: string; desc: string; cost: number; mods: Record<string, number> }> = {
  might: { name: "Blessing of Might", icon: "💪", desc: "+15% attack", cost: 80, mods: { patk: 0.15, matk: 0.15 } },
  ward: { name: "Holy Ward", icon: "🛡️", desc: "+18% defense", cost: 80, mods: { pdef: 0.18, mdef: 0.18 } },
  vigor: { name: "Vigor of Saints", icon: "❤️", desc: "+15% max HP", cost: 90, mods: { hp: 0.15 } },
  fortune: { name: "Fortune's Grace", icon: "🍀", desc: "+25 luck (better drops)", cost: 100, mods: { luck: 0.6 } },
  swift: { name: "Wind's Favor", icon: "🪶", desc: "+5% dodge, +4% crit", cost: 90, mods: { dodge: 0.05, crit: 0.04 } },
};
export const BLESS_BATTLES = 6;
/** Price scales with progress so blessings stay meaningful later. */
export const servicePrice = (base: number, maxFloor: number) => Math.round(base * (1 + maxFloor / 15));

export const ENCHANT_ELEMENTS: Element[] = ["fire", "water", "wind", "earth", "light", "dark"];
export const ENCHANT_MAT: Partial<Record<Element, string>> = { fire: "fire_core", water: "frost_shard", wind: "harpy_plume", earth: "golem_heart", light: "moonpetal", dark: "nightshade" };
export const ENCHANT_ALT: Partial<Record<Element, string>> = { fire: "rose", water: "bluebell", wind: "feather", earth: "stone", light: "daisy", dark: "bat_wing" };
/** Weapons: +% damage and element override. Shields: −% damage from that element. */
export const enchantPower = (grade: number) => 10 + grade * 3;
export const enchantCost = (grade: number, maxFloor: number) => ({ gold: Math.round(150 * (grade + 1) * (1 + maxFloor / 20)), qty: 2 + grade });

export type ToolKind = "throw" | "trap" | "ammo" | "ranged";
export type RangedId = "bow" | "crossbow" | "gun";
export interface ToolDef {
  id: string; name: string; icon: string; kind: ToolKind; desc: string; makes: number;
  recipe: [string, number][]; gold: number;
  mult?: number; el?: Element; stun?: number; burn?: number; flee?: boolean; ammo?: RangedId; pct?: number;
}
export const TOOLS: ToolDef[] = [
  { id: "throw_knife", name: "Throwing Knife", icon: "🔪", kind: "throw", desc: "Sure hit, 1.5× physical", makes: 3, recipe: [["iron_ore", 1], ["oak_log", 1]], gold: 10, mult: 1.5 },
  { id: "fire_flask", name: "Fire Flask", icon: "🧨", kind: "throw", desc: "1.8× fire magic + burn", makes: 2, recipe: [["rose", 2], ["slime_gel", 1]], gold: 15, mult: 1.8, el: "fire", burn: 0.15 },
  { id: "frost_bomb", name: "Frost Bomb", icon: "🧊", kind: "throw", desc: "1.5× water magic, stuns 1 turn", makes: 2, recipe: [["bluebell", 2], ["shell", 1]], gold: 20, mult: 1.5, el: "water", stun: 1 },
  { id: "holy_water", name: "Holy Water", icon: "💧", kind: "throw", desc: "2.2× light magic", makes: 2, recipe: [["daisy", 2], ["milk", 1]], gold: 20, mult: 2.2, el: "light" },
  { id: "net", name: "Weighted Net", icon: "🕸️", kind: "throw", desc: "Snares foe for 2 turns", makes: 2, recipe: [["wool", 2], ["stone", 1]], gold: 15, stun: 2 },
  { id: "smoke_bomb", name: "Smoke Bomb", icon: "💨", kind: "throw", desc: "Guaranteed escape (not bosses)", makes: 2, recipe: [["bat_wing", 1], ["wheat", 2]], gold: 10, flee: true },
  { id: "spike_trap", name: "Spike Trap", icon: "📍", kind: "trap", desc: "Deals 35% of a monster's max HP", makes: 2, recipe: [["iron_ore", 2], ["oak_log", 1]], gold: 25, pct: 0.35 },
  { id: "bear_trap", name: "Bear Trap", icon: "🪤", kind: "trap", desc: "20% max HP, roots 5 steps, stunned when fought", makes: 1, recipe: [["iron_ore", 3], ["hide", 1]], gold: 30, pct: 0.2, stun: 2 },
  { id: "fire_trap", name: "Fire Rune", icon: "🔥", kind: "trap", desc: "25% max HP and lingering burn", makes: 1, recipe: [["rose", 3], ["copper_ore", 2]], gold: 35, pct: 0.25, burn: 0.08 },
  { id: "arrow", name: "Arrows", icon: "➶", kind: "ammo", desc: "Ammo for bows", makes: 15, recipe: [["birch_log", 1], ["feather", 2]], gold: 5, ammo: "bow" },
  { id: "bolt", name: "Bolts", icon: "➹", kind: "ammo", desc: "Ammo for crossbows", makes: 12, recipe: [["oak_log", 1], ["iron_ore", 1]], gold: 8, ammo: "crossbow" },
  { id: "bullet", name: "Bullets", icon: "•", kind: "ammo", desc: "Ammo for guns", makes: 10, recipe: [["copper_ore", 2], ["stone", 1]], gold: 12, ammo: "gun" },
  { id: "bow", name: "Hunting Bow", icon: "🏹", kind: "ranged", desc: "Off-hand · Shoot 1.4× (uses arrows)", makes: 1, recipe: [["birch_log", 4], ["wool", 2]], gold: 120, mult: 1.4, ammo: "bow" },
  { id: "crossbow", name: "Crossbow", icon: "🎯", kind: "ranged", desc: "Off-hand · Shoot 1.8× ignores armor (uses bolts)", makes: 1, recipe: [["oak_log", 4], ["iron_ore", 4]], gold: 300, mult: 1.8, ammo: "crossbow" },
  { id: "gun", name: "Flintlock", icon: "🔫", kind: "ranged", desc: "Off-hand · Shoot 2.4× (uses bullets)", makes: 1, recipe: [["iron_ingot", 3], ["copper_ingot", 2]], gold: 800, mult: 2.4, ammo: "gun" },
];
export const TOOL: Record<string, ToolDef> = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
export const AMMO_FOR: Record<RangedId, string> = { bow: "arrow", crossbow: "bolt", gun: "bullet" };
export const TRAP_RANGE = 3;
