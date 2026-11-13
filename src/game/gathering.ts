// Village gathering spots: each spot has a level that unlocks higher-tier materials.
import { getMat } from "./data";

export type SpotId = "forest" | "mine" | "pond" | "ranch" | "field";
export interface SpotDef { name: string; icon: string; verb: string; skill: string; stat: string; mats: [string, number][] }
export const SPOT_MAX = 100;
/** A material of tier T unlocks at spot level T×10 (tier 0 from the start): one new tier every 10 levels. */
export const unlockAt = (tier: number) => Math.max(1, Math.round(tier * 10));
const spot = (name: string, icon: string, verb: string, skill: string, stat: string, mats: string[]): SpotDef =>
  ({ name, icon, verb, skill, stat, mats: mats.map((m) => [m, unlockAt(getMat(m).tier)] as [string, number]) });
export const SPOTS: Record<SpotId, SpotDef> = {
  forest: spot("Forest", "🌲", "Chop", "woodcutting", "treesCut", ["oak_log", "birch_log", "maple_log", "ironwood_log", "yew_log", "elder_log",
    "bloodwood_log", "ghostwood_log", "frostpine_log", "worldtree_log", "aether_log", "primordial_log"]),
  mine: spot("Mine", "⛏️", "Mine", "mining", "oresMined", ["stone", "copper_ore", "iron_ore", "silver_ore", "gold_ore", "cobalt_ore",
    "mithril_ore", "runite_ore", "adamant_ore", "orichalcum_ore", "aetherium_ore", "voidite_ore"]),
  pond: spot("Pond", "🎣", "Fish", "fishing", "fishCaught", ["fish", "shell", "crayfish", "pearl", "eel", "golden_carp",
    "abyss_squid", "moonfin", "kraken_tentacle", "dragon_koi", "leviathan_fillet", "leviathan_pearl"]),
  ranch: spot("Animal Farm", "🐄", "Tend", "husbandry", "animalsTended", ["egg", "feather", "wool", "milk", "hide", "honey", "alpaca_fleece",
    "silk_cocoon", "griffin_egg", "drake_hide", "unicorn_milk", "pegasus_down", "golden_fleece", "roc_egg", "roc_feather"]),
  field: spot("Field", "🌼", "Forage", "herbalism", "plantsHarvested", ["daisy", "rose", "bluebell", "nightshade", "moonpetal", "sunbloom",
    "frostlily", "mandrake", "starblossom", "dragon_orchid", "void_lotus", "worldbloom"]),
};
/** Unlock levels before spots went to Lv 100. Saves keep anything they had already unlocked under these. */
export const LEGACY_UNLOCKS: Record<SpotId, [string, number][]> = {
  forest: [["oak_log", 1], ["birch_log", 3], ["maple_log", 4], ["ironwood_log", 6], ["yew_log", 8], ["elder_log", 10], ["bloodwood_log", 13], ["ghostwood_log", 16], ["frostpine_log", 20], ["worldtree_log", 25], ["aether_log", 30]],
  mine: [["stone", 1], ["copper_ore", 3], ["iron_ore", 5], ["silver_ore", 10], ["gold_ore", 13], ["cobalt_ore", 16], ["mithril_ore", 19], ["runite_ore", 22], ["adamant_ore", 25], ["orichalcum_ore", 28], ["aetherium_ore", 30]],
  pond: [["fish", 1], ["shell", 2], ["crayfish", 4], ["pearl", 6], ["eel", 9], ["golden_carp", 12], ["abyss_squid", 15], ["moonfin", 18], ["kraken_tentacle", 22], ["dragon_koi", 26], ["leviathan_fillet", 30]],
  ranch: [["egg", 1], ["feather", 1], ["wool", 3], ["milk", 5], ["hide", 5], ["honey", 7], ["alpaca_fleece", 9], ["silk_cocoon", 12], ["griffin_egg", 15], ["drake_hide", 18], ["unicorn_milk", 21], ["pegasus_down", 24], ["golden_fleece", 27], ["roc_egg", 30]],
  field: [["daisy", 1], ["rose", 1], ["bluebell", 3], ["nightshade", 7], ["moonpetal", 12], ["sunbloom", 15], ["frostlily", 18], ["mandrake", 21], ["starblossom", 24], ["dragon_orchid", 27], ["void_lotus", 30]],
};
/** Materials a save had unlocked under the old levels that the new levels would lock again. */
export function legacyKeep(id: SpotId, level: number): string[] {
  return LEGACY_UNLOCKS[id].filter(([m, l]) => level >= l && !spotMats(id, level).includes(m)).map(([m]) => m);
}
export const spotLevel = (spots: Record<string, number> | undefined, id: SpotId) => spots?.[id] ?? 1;
/** Materials open at `level`, plus any grandfathered ones (`keep`) from older saves. */
export const spotMats = (id: SpotId, level: number, keep: string[] = []) =>
  SPOTS[id].mats.filter(([m, l]) => level >= l || keep.includes(m)).map(([m]) => m);
export const nextUnlock = (id: SpotId, level: number) => SPOTS[id].mats.find(([, l]) => l > level);
/** Gold + material cost to go from `level` to `level + 1`: grows smoothly so Lv 100 stays reachable. */
export function spotUpgradeCost(id: SpotId, level: number): { gold: number; mat: string; qty: number } {
  const mats = spotMats(id, level);
  return { gold: Math.round(40 * Math.pow(level, 1.7)), mat: mats[mats.length - 1]!, qty: 3 + Math.floor(level * 1.2) };
}
/** Visual richness stage (0-4) used by the map art: richer at Lv 25, 50, 75 and 100. */
export const spotStage = (level: number) => (level >= 100 ? 4 : level >= 75 ? 3 : level >= 50 ? 2 : level >= 25 ? 1 : 0);
// Map tiles that open each spot's window.
export const SPOT_TILES: Record<string, SpotId> = { L: "forest", T: "forest", B: "forest", I: "forest", E: "forest", O: "mine", R: "mine", P: "pond", W: "pond", Y: "ranch", c: "ranch", s: "ranch", w: "ranch", F: "field" };
