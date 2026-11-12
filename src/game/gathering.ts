// Village gathering spots: each spot has a level that unlocks higher-tier materials.
export type SpotId = "forest" | "mine" | "pond" | "ranch" | "field";
export interface SpotDef { name: string; icon: string; verb: string; skill: string; stat: string; mats: [string, number][] }
// Every spot climbs one material tier at a time, reaching a tier-9 material at SPOT_MAX.
// Unlock levels only ever move earlier, so existing saves never lose access.
export const SPOTS: Record<SpotId, SpotDef> = {
  forest: { name: "Forest", icon: "🌲", verb: "Chop", skill: "woodcutting", stat: "treesCut", mats: [
    ["oak_log", 1], ["birch_log", 3], ["maple_log", 4], ["ironwood_log", 6], ["yew_log", 8], ["elder_log", 10],
    ["bloodwood_log", 13], ["ghostwood_log", 16], ["frostpine_log", 20], ["worldtree_log", 25], ["aether_log", 30]] },
  mine: { name: "Mine", icon: "⛏️", verb: "Mine", skill: "mining", stat: "oresMined", mats: [
    ["stone", 1], ["copper_ore", 3], ["iron_ore", 5], ["silver_ore", 10], ["gold_ore", 13], ["cobalt_ore", 16],
    ["mithril_ore", 19], ["runite_ore", 22], ["adamant_ore", 25], ["orichalcum_ore", 28], ["aetherium_ore", 30]] },
  pond: { name: "Pond", icon: "🎣", verb: "Fish", skill: "fishing", stat: "fishCaught", mats: [
    ["fish", 1], ["shell", 2], ["crayfish", 4], ["pearl", 6], ["eel", 9], ["golden_carp", 12],
    ["abyss_squid", 15], ["moonfin", 18], ["kraken_tentacle", 22], ["dragon_koi", 26], ["leviathan_fillet", 30]] },
  ranch: { name: "Animal Farm", icon: "🐄", verb: "Tend", skill: "husbandry", stat: "animalsTended", mats: [
    ["egg", 1], ["feather", 1], ["wool", 3], ["milk", 5], ["hide", 5], ["honey", 7], ["alpaca_fleece", 9],
    ["silk_cocoon", 12], ["griffin_egg", 15], ["drake_hide", 18], ["unicorn_milk", 21], ["pegasus_down", 24],
    ["golden_fleece", 27], ["roc_egg", 30]] },
  field: { name: "Field", icon: "🌼", verb: "Forage", skill: "herbalism", stat: "plantsHarvested", mats: [
    ["daisy", 1], ["rose", 1], ["bluebell", 3], ["nightshade", 7], ["moonpetal", 12], ["sunbloom", 15],
    ["frostlily", 18], ["mandrake", 21], ["starblossom", 24], ["dragon_orchid", 27], ["void_lotus", 30]] },
};
export const SPOT_MAX = 30;
export const spotLevel = (spots: Record<string, number> | undefined, id: SpotId) => spots?.[id] ?? 1;
export const spotMats = (id: SpotId, level: number) => SPOTS[id].mats.filter(([, l]) => level >= l).map(([m]) => m);
export const nextUnlock = (id: SpotId, level: number) => SPOTS[id].mats.find(([, l]) => l > level);
/** Gold + material cost to go from `level` to `level + 1`. */
export function spotUpgradeCost(id: SpotId, level: number): { gold: number; mat: string; qty: number } {
  const mats = spotMats(id, level);
  return { gold: 60 * level * level, mat: mats[mats.length - 1]!, qty: level * 3 };
}
/** Visual richness stage (0-3) used by the map art. */
export const spotStage = (level: number) => (level >= 20 ? 3 : level >= 10 ? 2 : level >= 5 ? 1 : 0);
// Map tiles that open each spot's window.
export const SPOT_TILES: Record<string, SpotId> = { L: "forest", T: "forest", B: "forest", I: "forest", E: "forest", O: "mine", R: "mine", P: "pond", W: "pond", Y: "ranch", c: "ranch", s: "ranch", w: "ranch", F: "field" };
