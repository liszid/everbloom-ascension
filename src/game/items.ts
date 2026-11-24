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
export const BLESS_BATTLES = 6; // base; Church level adds more
/** Price scales with progress so blessings stay meaningful later. */
export const servicePrice = (base: number, maxFloor: number) => Math.round(base * (1 + maxFloor / 15));

export const ENCHANT_ELEMENTS: Element[] = ["fire", "water", "wind", "earth", "light", "dark"];
export const ENCHANT_MAT: Partial<Record<Element, string>> = { fire: "fire_core", water: "frost_shard", wind: "harpy_plume", earth: "golem_heart", light: "moonpetal", dark: "nightshade" };
export const ENCHANT_ALT: Partial<Record<Element, string>> = { fire: "rose", water: "bluebell", wind: "feather", earth: "stone", light: "daisy", dark: "bat_wing" };
/** Weapons: +% damage and element override. Shields: −% damage from that element. */
export const enchantPower = (grade: number) => 10 + grade * 3;
export const enchantCost = (grade: number, maxFloor: number) => ({ gold: Math.round(150 * (grade + 1) * (1 + maxFloor / 20)), qty: 2 + grade });

export type ToolKind = "throw" | "trap" | "ammo" | "ranged" | "torch";
export type TorchFx = "sleep" | "siphon" | "blind" | "venom" | "chill" | "soul" | "burn";
export type RangedId = string;
export interface ToolDef {
  id: string; name: string; icon: string; kind: ToolKind; desc: string; makes: number;
  recipe: [string, number][]; gold: number;
  mult?: number; el?: Element; stun?: number; burn?: number; flee?: boolean; ammo?: RangedId; pct?: number;
  /** Craftery level needed. */ lvl?: number; /** Ranged: ammo item used, armor pierce %, two-handed. */ uses?: string; pierce?: number; two?: boolean;
  /** Torch: extra sight radius, fire strike multiplier, special effect and its % chance. */ sight?: number; fire?: number; fx?: TorchFx; chance?: number;
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
  { id: "poison_dart", name: "Venom Darts", icon: "🎯", kind: "throw", desc: "Sure 1.6× + heavy bleed", makes: 3, recipe: [["venom_sac", 1], ["feather", 2]], gold: 40, mult: 1.6, burn: 0.25, lvl: 3 },
  { id: "thunder_orb", name: "Thunder Orb", icon: "⚡", kind: "throw", desc: "3× wind magic, stuns 1", makes: 1, recipe: [["eel", 1], ["copper_ingot", 2]], gold: 120, mult: 3, el: "wind", stun: 1, lvl: 5 },
  { id: "dragon_bomb", name: "Dragonfire Bomb", icon: "☄️", kind: "throw", desc: "4.5× fire magic + burn", makes: 1, recipe: [["fire_core", 2], ["obsidian", 1]], gold: 400, mult: 4.5, el: "fire", burn: 0.2, lvl: 8 },
  { id: "frost_mine", name: "Frost Mine", icon: "❄️", kind: "trap", desc: "30% max HP, roots 6 steps, stuns 3", makes: 1, recipe: [["frost_shard", 2], ["iron_ingot", 1]], gold: 150, pct: 0.3, stun: 3, lvl: 5 },
  { id: "rune_trap", name: "Arcane Rune", icon: "🔯", kind: "trap", desc: "55% max HP", makes: 1, recipe: [["mana_crystal", 2], ["silver_ingot", 1]], gold: 400, pct: 0.55, lvl: 8 },
  { id: "arrow", name: "Arrows", icon: "➶", kind: "ammo", desc: "Ammo for bows", makes: 15, recipe: [["birch_log", 1], ["feather", 2]], gold: 5 },
  { id: "bolt", name: "Bolts", icon: "➹", kind: "ammo", desc: "Ammo for crossbows", makes: 12, recipe: [["oak_log", 1], ["iron_ore", 1]], gold: 8 },
  { id: "bullet", name: "Bullets", icon: "•", kind: "ammo", desc: "Ammo for firearms", makes: 10, recipe: [["copper_ore", 2], ["stone", 1]], gold: 12 },
  { id: "cell", name: "Energy Cells", icon: "🔋", kind: "ammo", desc: "Ammo for arcane-tech guns", makes: 8, recipe: [["mana_crystal", 1], ["silver_ingot", 1]], gold: 60, lvl: 9 },
  { id: "bow", name: "Hunting Bow", icon: "🏹", kind: "ranged", desc: "Shoot 1.4×", makes: 1, recipe: [["birch_log", 4], ["wool", 2]], gold: 120, mult: 1.4, uses: "arrow" },
  { id: "crossbow", name: "Crossbow", icon: "🎯", kind: "ranged", desc: "Shoot 1.8×, pierces armor", makes: 1, recipe: [["oak_log", 4], ["iron_ore", 4]], gold: 300, mult: 1.8, uses: "bolt", pierce: 40 },
  { id: "gun", name: "Flintlock", icon: "🔫", kind: "ranged", desc: "Shoot 2.4×", makes: 1, recipe: [["iron_ingot", 3], ["copper_ingot", 2]], gold: 800, mult: 2.4, uses: "bullet" },
  { id: "pistol", name: "Twin Pistol", icon: "🔫", kind: "ranged", desc: "Shoot 2.8×", makes: 1, recipe: [["iron_ingot", 4], ["silver_ingot", 2]], gold: 2500, mult: 2.8, uses: "bullet", lvl: 3 },
  { id: "longbow", name: "Elven Longbow", icon: "🏹", kind: "ranged", desc: "Two-handed · Shoot 3.4×", makes: 1, recipe: [["carved_elder", 3], ["spider_silk", 4]], gold: 3500, mult: 3.4, uses: "arrow", two: true, lvl: 4 },
  { id: "musket", name: "Musket", icon: "💥", kind: "ranged", desc: "Two-handed · Shoot 4×, pierces armor", makes: 1, recipe: [["iron_ingot", 6], ["carved_ironwood", 3]], gold: 6000, mult: 4, uses: "bullet", pierce: 30, two: true, lvl: 5 },
  { id: "repeater", name: "Repeating Crossbow", icon: "🎯", kind: "ranged", desc: "Shoot 3.2×, pierces armor", makes: 1, recipe: [["mithril_ingot", 2], ["carved_ironwood", 2]], gold: 9000, mult: 3.2, uses: "bolt", pierce: 45, lvl: 6 },
  { id: "cannon", name: "Hand Cannon", icon: "🧨", kind: "ranged", desc: "Two-handed · Shoot 5.5×", makes: 1, recipe: [["adamant_ingot", 2], ["gold_ingot", 3]], gold: 20000, mult: 5.5, uses: "bullet", two: true, lvl: 7 },
  { id: "laser", name: "Laser Gun", icon: "🔆", kind: "ranged", desc: "Shoot 6× light, pierces armor", makes: 1, recipe: [["starmetal", 1], ["mithril_ingot", 3]], gold: 50000, mult: 6, uses: "cell", pierce: 60, lvl: 9 },
  { id: "railgun", name: "Arcane Railgun", icon: "🛰️", kind: "ranged", desc: "Two-handed · Shoot 8×, ignores most armor", makes: 1, recipe: [["void_ore", 1], ["adamant_ingot", 3]], gold: 150000, mult: 8, uses: "cell", pierce: 80, two: true, lvl: 10 },
  { id: "torch", name: "Torch", icon: "🔥", kind: "torch", desc: "Light +1 · 0.3× fire strike when you attack or defend", makes: 1, recipe: [["oak_log", 2], ["hide", 1]], gold: 40, sight: 1, fire: 0.3 },
  { id: "alluring_torch", name: "Alluring Torch", icon: "💞", kind: "torch", desc: "Light +1 · 0.3× fire · 20% lulls the foe to sleep (2 turns)", makes: 1, recipe: [["oak_log", 2], ["rose", 3], ["slime_gel", 1]], gold: 200, sight: 1, fire: 0.3, fx: "sleep", chance: 20, lvl: 2 },
  { id: "siphon_torch", name: "Siphoning Torch", icon: "🩸", kind: "torch", desc: "Light +1 · 0.35× fire · heals you for 60% of its burn", makes: 1, recipe: [["birch_log", 2], ["bat_wing", 3], ["nightshade", 1]], gold: 450, sight: 1, fire: 0.35, fx: "siphon", chance: 100, lvl: 3 },
  { id: "blinding_torch", name: "Sunflare Torch", icon: "☀️", kind: "torch", desc: "Light +2.5 · 0.35× fire · 30% blinds the foe (half its attacks miss)", makes: 1, recipe: [["moonpetal", 2], ["daisy", 3], ["copper_ingot", 1]], gold: 900, sight: 2.5, fire: 0.35, fx: "blind", chance: 30, lvl: 4 },
  { id: "witch_torch", name: "Witchfire Torch", icon: "☠️", kind: "torch", desc: "Light +1 · 0.4× fire · 35% venom that keeps eating at the foe", makes: 1, recipe: [["venom_sac", 2], ["nightshade", 2], ["oak_log", 2]], gold: 1600, sight: 1, fire: 0.4, fx: "venom", chance: 35, lvl: 5 },
  { id: "frost_torch", name: "Frostflame Torch", icon: "❄️", kind: "torch", desc: "Light +1.5 · 0.45× fire · 35% chills the foe (−25% attack, 2 turns)", makes: 1, recipe: [["frost_shard", 2], ["iron_ingot", 1], ["oak_log", 2]], gold: 3000, sight: 1.5, fire: 0.45, fx: "chill", chance: 35, lvl: 6 },
  { id: "soul_torch", name: "Soulfire Torch", icon: "👻", kind: "torch", desc: "Light +2 · 0.55× fire · restores mana equal to half its burn", makes: 1, recipe: [["mana_crystal", 2], ["spider_silk", 2], ["silver_ingot", 1]], gold: 9000, sight: 2, fire: 0.55, fx: "soul", chance: 100, lvl: 8 },
  { id: "dragon_torch", name: "Dragonbreath Brand", icon: "🐉", kind: "torch", desc: "Light +3 · 0.9× fire · 50% sets the foe ablaze", makes: 1, recipe: [["fire_core", 3], ["obsidian", 2], ["gold_ingot", 1]], gold: 30000, sight: 3, fire: 0.9, fx: "burn", chance: 50, lvl: 10 },
];
export const TOOL: Record<string, ToolDef> = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
export const ammoFor = (r: RangedId) => TOOL[r]?.uses ?? "arrow";
export const TRAP_RANGE = 3;
/** Dungeon sight radius in tiles without a torch. */
export const BASE_SIGHT = 4;

// ---- village building levels ----
export type BldgId = "house" | "craftery" | "church" | "guild" | "market" | "training" | "arena" | "prison";
export const BLDG_MAX = 10;
export const BLDG_INFO: Record<BldgId, { name: string; perk: (l: number) => string }> = {
  house: { name: "Home", perk: (l) => `Storage ${storageCap(l)} slots · Rest heals ${restPct(l)}%` },
  craftery: { name: "Craftery", perk: (l) => `Unlocks recipes up to Lv ${l}` },
  church: { name: "Church", perk: (l) => `Blessings last ${blessBattles(l)} battles · services ${Math.round((1 - churchDisc(l)) * 100)}% cheaper` },
  guild: { name: "Adventurers Guild", perk: (l) => `Merchant pays ${guildMult(l).toFixed(2)}×` },
  market: { name: "Market", perk: (l) => `Shop sells for +${(l - 1) * 4}%` },
  training: { name: "Training Ground", perk: (l) => `Training +${(l - 1) * 3}% success` },
  arena: { name: "Arena", perk: (l) => `Arena prizes +${(l - 1) * 5}%` },
  prison: { name: "Prison", perk: (l) => `${6 + (l - 1) * 3} cells` },
};
export const bldgCost = (l: number) => Math.round(300 * l * l);
export const storageCap = (l: number) => 20 + (l - 1) * 10;
export const restPct = (l: number) => Math.min(100, 40 + (l - 1) * 10);
export const blessBattles = (l: number) => 6 + (l - 1);
export const churchDisc = (l: number) => 1 - (l - 1) * 0.03;
export const guildMult = (l: number) => 1.6 + (l - 1) * 0.05;

// ---- off-hand grades: torches and ranged weapons can be upgraded Common (0) → EX (7) at the Craftery ----
export const OFFHAND_MAX = 7;
export const isHeldTool = (t?: ToolDef) => !!t && (t.kind === "ranged" || t.kind === "torch");
/** Refined materials needed to reach each grade (index = target grade − 1): [ingot, carved wood]. */
const OFFHAND_UP_MATS: [string, string][] = [
  ["copper_ingot", "carved_oak"], ["iron_ingot", "carved_maple"], ["silver_ingot", "carved_ironwood"], ["gold_ingot", "carved_elder"],
  ["mithril_ingot", "carved_bloodwood"], ["adamant_ingot", "carved_ghostwood"], ["orichalcum_ingot", "carved_worldtree"],
];
/** Cost to raise an off-hand to grade `to`. Relic also takes Guardian Sigils, EX takes Warden Crests. */
export function offhandUpCost(t: ToolDef, to: number): { gold: number; mats: [string, number][]; lvl: number } {
  const [ing, wood] = OFFHAND_UP_MATS[Math.max(0, Math.min(6, to - 1))]!; const q = 2 + to * 2;
  const mats: [string, number][] = [[ing, q], [wood, q]];
  if (to === 6) mats.push(["guardian_sigil", 3]);
  if (to === 7) mats.push(["warden_crest", 2]);
  return { gold: Math.round(Math.max(200, t.gold) * 0.6 * Math.pow(to, 1.6)), mats, lvl: to + 1 };
}
/** How an off-hand's special numbers grow with its grade. */
export function offhandFx(t: ToolDef, g: number) {
  const base = t.chance ?? 100;
  return {
    chance: Math.min(100, Math.round(base + (100 - base) * (g / OFFHAND_MAX) * (t.fx === "burn" ? 1 : 0.5))),
    fire: (t.fire ?? 0) * (1 + g * 0.15),
    sight: (t.sight ?? 0) + g * 0.3,
    mult: (t.mult ?? 1.4) * (1 + g * 0.12),
    fireWard: t.kind === "torch" ? Math.round((30 * g) / OFFHAND_MAX) : 0,
  };
}
