// Craftery Alchemy: elixirs, weapon oils, throwing flasks and stat tonics — pure data, no engine imports.
// Brewed potions are stackable counts in GameState.potions; engine.ts applies their effects.
import type { Element, StatKey } from "./data";

export type PotionCat = "elixir" | "oil" | "flask" | "tonic";
export type OilFx = "poison" | "bleed" | "burn" | "chill" | "holy";
export interface Potion {
  id: string; name: string; icon: string; cat: PotionCat; desc: string;
  /** Craftery level needed. */ lvl: number; gold: number; recipe: [string, number][]; makes: number;
  /** Elixir: share of max HP / MP / stamina restored. */ heal?: { hp?: number; mp?: number; sta?: number };
  /** Oil: element given to weapon hits, the effect and its % chance per hit. Lasts OIL_BATTLES battles. */ oil?: { el?: Element; fx: OilFx; chance: number; power: number };
  /** Flask: sure-hit damage multiplier, element, defense shred (0–1), blind / stun turns, burn share. */
  flask?: { mult: number; el?: Element; shred?: number; blind?: number; stun?: number; burn?: number };
  /** Tonic: stat modifiers (+0.1 = +10%; crit/dodge/acc 0.05 = +5 points) for TONIC_FLOORS Tower floors. */ tonic?: Partial<Record<StatKey, number>>;
}
export const OIL_BATTLES = 3;
export const TONIC_FLOORS = 8;
/** Elixirs you can drink in one battle. */
export const DRINKS_PER_FIGHT = 3;

export const POTIONS: Potion[] = [
  // ---- recovery elixirs ----
  { id: "elixir_hp_1", name: "Lesser Health Elixir", icon: "🧪", cat: "elixir", desc: "Restores 30% HP", lvl: 1, gold: 15, recipe: [["herb_leaf", 2], ["daisy", 1]], makes: 2, heal: { hp: 0.3 } },
  { id: "elixir_mp_1", name: "Lesser Mana Draught", icon: "🔷", cat: "elixir", desc: "Restores 30% MP", lvl: 1, gold: 20, recipe: [["bluebell", 2], ["slime_gel", 1]], makes: 2, heal: { mp: 0.3 } },
  { id: "elixir_sta_1", name: "Vigor Tonic", icon: "⚡", cat: "elixir", desc: "Restores 50% stamina", lvl: 1, gold: 15, recipe: [["honey", 1], ["carrot", 2]], makes: 2, heal: { sta: 0.5 } },
  { id: "elixir_hp_2", name: "Health Elixir", icon: "🧪", cat: "elixir", desc: "Restores 55% HP", lvl: 2, gold: 60, recipe: [["troll_blood", 1], ["bluebell", 2]], makes: 2, heal: { hp: 0.55 } },
  { id: "elixir_mp_2", name: "Mana Draught", icon: "🔷", cat: "elixir", desc: "Restores 60% MP", lvl: 3, gold: 90, recipe: [["moonpetal", 1], ["mana_crystal", 1]], makes: 2, heal: { mp: 0.6 } },
  { id: "elixir_hp_3", name: "Greater Health Elixir", icon: "❤️‍🩹", cat: "elixir", desc: "Restores 80% HP", lvl: 4, gold: 200, recipe: [["mandrake", 1], ["troll_blood", 2]], makes: 2, heal: { hp: 0.8 } },
  { id: "elixir_sta_2", name: "Titan's Vigor", icon: "⚡", cat: "elixir", desc: "Fully restores stamina", lvl: 4, gold: 150, recipe: [["mandrake", 1], ["golem_heart", 1]], makes: 2, heal: { sta: 1 } },
  { id: "panacea", name: "Pure Panacea", icon: "✨", cat: "elixir", desc: "Restores 50% HP, MP and stamina", lvl: 6, gold: 600, recipe: [["starblossom", 1], ["phoenix_ash", 1]], makes: 2, heal: { hp: 0.5, mp: 0.5, sta: 0.5 } },
  // ---- weapon oils (3 battles) ----
  { id: "oil_poison", name: "Serpent Venom Oil", icon: "🐍", cat: "oil", desc: "35% per hit to poison (heavy damage over time)", lvl: 1, gold: 40, recipe: [["venom_sac", 1], ["slime_gel", 1]], makes: 1, oil: { fx: "poison", chance: 35, power: 40 } },
  { id: "oil_bleed", name: "Barbed Razor Oil", icon: "🩸", cat: "oil", desc: "30% per hit to cause a deep bleed", lvl: 2, gold: 90, recipe: [["rat_fang", 2], ["goblin_tooth", 1]], makes: 1, oil: { fx: "bleed", chance: 30, power: 60 } },
  { id: "oil_frost", name: "Glacial Rime Oil", icon: "❄️", cat: "oil", desc: "Water hits; 40% to chill the foe (its blows weaken)", lvl: 3, gold: 110, recipe: [["frost_shard", 2]], makes: 1, oil: { el: "water", fx: "chill", chance: 40, power: 0 } },
  { id: "oil_flame", name: "Infernal Napalm Oil", icon: "🔥", cat: "oil", desc: "Fire hits; 40% to set the foe ablaze", lvl: 3, gold: 160, recipe: [["fire_core", 2], ["oak_log", 1]], makes: 1, oil: { el: "fire", fx: "burn", chance: 40, power: 50 } },
  { id: "oil_holy", name: "Sanctified Light Oil", icon: "🌟", cat: "oil", desc: "Light hits, +30% damage to undead and fiends", lvl: 4, gold: 200, recipe: [["silver_ore", 2], ["daisy", 2]], makes: 1, oil: { el: "light", fx: "holy", chance: 100, power: 30 } },
  // ---- throwing flasks ----
  { id: "flask_blind", name: "Flash Blinding Dust", icon: "🌟", cat: "flask", desc: "Light 1×, blinds the foe for 3 turns", lvl: 1, gold: 30, recipe: [["daisy", 3], ["copper_ore", 1]], makes: 2, flask: { mult: 1, el: "light", blind: 3 } },
  { id: "flask_acid", name: "Corrosive Acid Flask", icon: "🧫", cat: "flask", desc: "Sure 1.6× hit, melts 25% of the foe's defense for the fight", lvl: 2, gold: 50, recipe: [["acid_gland", 1], ["slime_gel", 1]], makes: 2, flask: { mult: 1.6, shred: 0.25 } },
  { id: "flask_frost", name: "Glacial Flask", icon: "🧊", cat: "flask", desc: "Water 2.4×, freezes the foe for 1 turn", lvl: 4, gold: 120, recipe: [["frost_shard", 2], ["shell", 1]], makes: 2, flask: { mult: 2.4, el: "water", stun: 1 } },
  { id: "flask_wild", name: "Wildfire Bomb", icon: "💣", cat: "flask", desc: "Fire 3.2× and heavy burn", lvl: 5, gold: 140, recipe: [["fire_core", 1], ["rose", 3]], makes: 2, flask: { mult: 3.2, el: "fire", burn: 0.3 } },
  // ---- stat tonics (8 floors) ----
  { id: "tonic_ironhide", name: "Ironhide Draught", icon: "🛡️", cat: "tonic", desc: "+20% P.Def", lvl: 2, gold: 120, recipe: [["carved_ironwood", 1], ["iron_ingot", 1]], makes: 1, tonic: { pdef: 0.2 } },
  { id: "tonic_berserk", name: "Bloodfury Tonic", icon: "⚔️", cat: "tonic", desc: "+18% P.Atk, +6% crit", lvl: 3, gold: 160, recipe: [["troll_blood", 2], ["rose", 2]], makes: 1, tonic: { patk: 0.18, crit: 0.06 } },
  { id: "tonic_mind", name: "Aether Mind Infusion", icon: "🔮", cat: "tonic", desc: "+22% M.Atk, +15% MP", lvl: 3, gold: 170, recipe: [["mana_crystal", 2], ["moonpetal", 1]], makes: 1, tonic: { matk: 0.22, mp: 0.15 } },
  { id: "tonic_ward", name: "Spellward Tonic", icon: "🪬", cat: "tonic", desc: "+20% M.Def", lvl: 3, gold: 150, recipe: [["silver_ingot", 1], ["bluebell", 2]], makes: 1, tonic: { mdef: 0.2 } },
  { id: "tonic_swift", name: "Quicksilver Tonic", icon: "🪶", cat: "tonic", desc: "+6% dodge, +10% speed", lvl: 4, gold: 180, recipe: [["harpy_plume", 1], ["feather", 3]], makes: 1, tonic: { dodge: 0.06, spd: 0.1 } },
];
export const POTION: Record<string, Potion> = Object.fromEntries(POTIONS.map((p) => [p.id, p]));
export const POTION_CAT_LABEL: Record<PotionCat, string> = { elixir: "🧪 Elixirs", oil: "🛢️ Oils", flask: "🏺 Flasks", tonic: "🥤 Tonics" };
