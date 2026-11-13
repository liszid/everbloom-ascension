// Kitchen recipe book — pure data. Cooking a recipe gives a meal buff that lasts a number of Tower floors.
import type { Element, StatKey } from "./data";

export interface Recipe {
  id: string; name: string; icon: string; ing: [string, number][]; cook: number; floors: number;
  /** Fractions (+0.1 = +10%); crit/dodge/acc are added as % points ×100. */
  mods: Partial<Record<StatKey, number>>;
  /** % of max HP restored each battle turn. */ regen?: number; /** % of max mana restored each battle turn. */ mana?: number;
  ward?: { el: Element; pct: number }; desc: string;
}
export const RECIPES: Recipe[] = [
  { id: "fish_stew", name: "Hearty Fish Stew", icon: "🍲", ing: [["fish", 3], ["carrot", 2]], cook: 1, floors: 3, mods: { hp: 0.1 }, desc: "+10% max HP" },
  { id: "honey_roast", name: "Honey-Glazed Roast", icon: "🍖", ing: [["egg", 2], ["honey", 2], ["wheat", 2]], cook: 3, floors: 3, mods: { patk: 0.08, sta: 0.1 }, desc: "+8% P.Attack, +10% stamina" },
  { id: "crayfish_boil", name: "Crayfish Boil", icon: "🦞", ing: [["crayfish", 3], ["herb_leaf", 2]], cook: 5, floors: 3, mods: { pdef: 0.1 }, desc: "+10% P.Defense" },
  { id: "eel_skewers", name: "Storm Eel Skewers", icon: "🍢", ing: [["eel", 3], ["pumpkin", 1]], cook: 8, floors: 4, mods: { crit: 0.04, dodge: 0.02 }, desc: "+4% crit, +2% dodge" },
  { id: "carp_fillet", name: "Golden Carp Fillet", icon: "🐠", ing: [["golden_carp", 2], ["milk", 2], ["herb_leaf", 2]], cook: 10, floors: 4, mods: { matk: 0.12, mp: 0.1 }, desc: "+12% M.Attack, +10% mana" },
  { id: "bouillabaisse", name: "Bouillabaisse", icon: "🥘", ing: [["fish", 2], ["shell", 2], ["crayfish", 2], ["pearl", 1]], cook: 14, floors: 5, mods: { hp: 0.1 }, regen: 2, desc: "+10% max HP, heals 2% HP every turn" },
  { id: "squid_risotto", name: "Abyssal Ink Risotto", icon: "🦑", ing: [["abyss_squid", 2], ["wheat", 3]], cook: 18, floors: 5, mods: { mdef: 0.12 }, ward: { el: "dark", pct: 25 }, desc: "+12% M.Defense, −25% dark damage taken" },
  { id: "griffin_omelette", name: "Griffin Omelette", icon: "🍳", ing: [["griffin_egg", 2], ["milk", 2], ["herb_leaf", 2]], cook: 22, floors: 5, mods: { hp: 0.15, sta: 0.15 }, desc: "+15% max HP and stamina" },
  { id: "chilled_moonfin", name: "Frost-Chilled Moonfin", icon: "🐡", ing: [["moonfin", 2], ["frostlily", 1]], cook: 26, floors: 6, mods: { mdef: 0.08 }, ward: { el: "fire", pct: 30 }, desc: "+8% M.Defense, −30% fire damage taken" },
  { id: "unicorn_pudding", name: "Unicorn Cream Pudding", icon: "🍮", ing: [["unicorn_milk", 2], ["honey", 2], ["egg", 2]], cook: 30, floors: 6, mods: { mp: 0.2 }, regen: 3, mana: 3, desc: "+20% mana, heals 3% HP and 3% mana every turn" },
  { id: "kraken_calamari", name: "Kraken Calamari", icon: "🐙", ing: [["kraken_tentacle", 2], ["egg", 2], ["wheat", 2]], cook: 35, floors: 6, mods: { patk: 0.15, pdef: 0.1 }, desc: "+15% P.Attack, +10% P.Defense" },
  { id: "koi_steak", name: "Dragon Koi Steak", icon: "🎏", ing: [["dragon_koi", 2], ["sunbloom", 1], ["honey", 2]], cook: 40, floors: 7, mods: { patk: 0.18, matk: 0.18 }, ward: { el: "fire", pct: 20 }, desc: "+18% P. and M.Attack, −20% fire damage taken" },
  { id: "aether_roast", name: "Aetherwood Smoked Roast", icon: "🔥", ing: [["leviathan_fillet", 2], ["roc_egg", 1], ["aether_log", 1]], cook: 50, floors: 8, mods: { patk: 0.15, matk: 0.15, pdef: 0.15, mdef: 0.15, hp: 0.15 }, regen: 2, desc: "+15% attack, defense and max HP, heals 2% HP every turn" },
  { id: "leviathan_feast", name: "Leviathan Feast", icon: "🐋", ing: [["leviathan_pearl", 1], ["leviathan_fillet", 2], ["dragon_orchid", 1], ["worldbloom", 1]], cook: 60, floors: 10, mods: { patk: 0.25, matk: 0.25, pdef: 0.2, mdef: 0.2, hp: 0.2 }, regen: 3, desc: "+25% attack, +20% defense and max HP, heals 3% HP every turn" },
];
export const RECIPE: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
