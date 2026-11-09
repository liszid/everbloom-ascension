// Magic Tower schools, spells and ascended (undead / cursed) races — pure data, no engine imports.
import type { Element, Race } from "./data";

export type SchoolId = "fire" | "water" | "wind" | "earth" | "light" | "dark" | "herbal" | "summoning" | "soul" | "transformation"
  | "blood" | "necromancy" | "plague" | "storm" | "magma";
export interface School { id: SchoolId; name: string; icon: string; el: Element; matk: number; gold: number; desc: string; combo?: [SchoolId, SchoolId] }
export const SCHOOLS: School[] = [
  { id: "fire", name: "Pyromancy", icon: "🔥", el: "fire", matk: 10, gold: 200, desc: "Raw destructive flame." },
  { id: "water", name: "Hydromancy", icon: "🌊", el: "water", matk: 10, gold: 200, desc: "Tides, frost and cleansing." },
  { id: "wind", name: "Aeromancy", icon: "🌪️", el: "wind", matk: 10, gold: 200, desc: "Swift cutting gales." },
  { id: "earth", name: "Geomancy", icon: "🪨", el: "earth", matk: 10, gold: 200, desc: "Stone skin and quakes." },
  { id: "light", name: "Holy Light", icon: "✨", el: "light", matk: 12, gold: 250, desc: "Radiance that mends and smites." },
  { id: "dark", name: "Shadow Arts", icon: "🌑", el: "dark", matk: 12, gold: 250, desc: "Forbidden shadow." },
  { id: "herbal", name: "Herbalism", icon: "🌿", el: "nature", matk: 8, gold: 180, desc: "The living green — healing and venom." },
  { id: "summoning", name: "Summoning", icon: "🌀", el: "none", matk: 30, gold: 500, desc: "Call allies from beyond." },
  { id: "soul", name: "Soul Binding", icon: "👁️", el: "dark", matk: 40, gold: 700, desc: "Tether your soul to this world." },
  { id: "transformation", name: "Transformation", icon: "🐾", el: "nature", matk: 35, gold: 600, desc: "Reshape the flesh into the beast." },
  { id: "blood", name: "Blood Magic", icon: "🩸", el: "dark", matk: 60, gold: 1500, desc: "Herbal life-force bound by water.", combo: ["herbal", "water"] },
  { id: "necromancy", name: "Necromancy", icon: "💀", el: "dark", matk: 80, gold: 2000, desc: "Summon the dead with shadow.", combo: ["summoning", "dark"] },
  { id: "plague", name: "Plague Craft", icon: "🦠", el: "dark", matk: 60, gold: 1500, desc: "Rot born of venom and shadow.", combo: ["herbal", "dark"] },
  { id: "storm", name: "Tempest", icon: "⛈️", el: "wind", matk: 70, gold: 1800, desc: "Wind and water become lightning.", combo: ["wind", "water"] },
  { id: "magma", name: "Magma Lore", icon: "🌋", el: "fire", matk: 70, gold: 1800, desc: "Fire melts the earth itself.", combo: ["fire", "earth"] },
];
export const SCHOOL: Record<SchoolId, School> = Object.fromEntries(SCHOOLS.map((x) => [x.id, x])) as Record<SchoolId, School>;
/** Both parent schools must reach this level before a combined magic can be discovered. */
export const COMBO_LEVEL = 5;
export const SCHOOL_MAX = 20;
export const schoolLevel = (xp: number) => Math.min(SCHOOL_MAX, 1 + Math.floor(Math.sqrt(xp / 25)));
export const studyCost = (lvl: number) => 100 * lvl * lvl;
export const STUDY_XP = 40;

export type SpellKind = "mag" | "heal" | "guard" | "lock" | "drain" | "phys";
export interface Spell { id: string; name: string; school: SchoolId; lvl: number; matk: number; kind: SpellKind; mult: number; cost: number; el?: Element | undefined }
const T: [SchoolId, [string, SpellKind, number][]][] = [
  ["fire", [["Ember", "mag", 1.4], ["Fireball", "mag", 2.2], ["Inferno", "mag", 3.4]]],
  ["water", [["Water Jet", "mag", 1.3], ["Mending Tide", "heal", 0.3], ["Glacier Lance", "mag", 3.2]]],
  ["wind", [["Gust", "mag", 1.3], ["Wind Blade", "mag", 2.1], ["Cyclone", "mag", 3.3]]],
  ["earth", [["Stone Shot", "mag", 1.3], ["Stoneskin", "guard", 1], ["Earthquake", "mag", 3.3]]],
  ["light", [["Smite", "mag", 1.5], ["Heal", "heal", 0.35], ["Judgement", "mag", 3.5]]],
  ["dark", [["Shadow Bolt", "mag", 1.5], ["Life Tap", "drain", 1.6], ["Oblivion", "mag", 3.6]]],
  ["herbal", [["Regrowth", "heal", 0.25], ["Thorn Lash", "mag", 1.8], ["Verdant Bloom", "heal", 0.5]]],
  ["summoning", [["Spirit Wolf", "mag", 1.7], ["Arcane Golem", "guard", 1], ["Eidolon", "mag", 3.6]]],
  ["soul", [["Soul Rend", "mag", 1.8], ["Soul Anchor", "lock", 2], ["Soulstorm", "mag", 3.8]]],
  ["transformation", [["Feral Claws", "phys", 1.9], ["Ironhide", "guard", 1], ["Beast Rampage", "phys", 3.6]]],
  ["blood", [["Blood Siphon", "drain", 1.9], ["Crimson Pact", "heal", 0.45], ["Exsanguinate", "drain", 3.8]]],
  ["necromancy", [["Raise Dead", "mag", 2.2], ["Bone Wall", "guard", 1], ["Army of the Dead", "mag", 4.2]]],
  ["plague", [["Rot Touch", "drain", 1.7], ["Miasma", "mag", 2.6], ["Pestilence", "mag", 4]]],
  ["storm", [["Chain Lightning", "mag", 2.4], ["Thunderclap", "mag", 3], ["Wrath of Heaven", "mag", 4.3]]],
  ["magma", [["Lava Burst", "mag", 2.4], ["Obsidian Skin", "guard", 1], ["Eruption", "mag", 4.3]]],
];
const LV = [1, 5, 12], MREQ = [1, 10, 30];
export const SPELLS: Spell[] = T.flatMap(([sc, list]) => list.map(([name, kind, mult], i) => ({
  id: `${sc}_${i}`, name, school: sc, lvl: LV[i]!, matk: SCHOOL[sc].matk * MREQ[i]!, kind, mult,
  cost: Math.round((8 + i * 10) * (SCHOOL[sc].combo ? 1.5 : 1)), el: kind === "phys" || SCHOOL[sc].el === "none" ? undefined : SCHOOL[sc].el,
})));
export const SPELL: Record<string, Spell> = Object.fromEntries(SPELLS.map((x) => [x.id, x]));

// ---- ascended races ----
export interface AscRace extends Race { fx: Partial<Record<"lifesteal" | "regen" | "guard" | "pierce" | "haste" | "bleed" | "burn" | "manaflow", number>>; poisonImmune?: boolean }
export const ASC_RACES: AscRace[] = [
  { id: "vampire", name: "Vampire", icon: "🧛", desc: "Ageless predator sustained by blood.", mods: { patk: 0.15, matk: 0.15, spd: 0.1 }, growth: { dark: 1.4 }, fx: { lifesteal: 10 },
    passive: { name: "Thirst", desc: "+10% life steal." }, active: { id: "bloodfeast", name: "Blood Feast", desc: "Dark strike ×2.4 healing 60% of damage." } },
  { id: "ghost", name: "Ghost", icon: "👻", desc: "A soul that refused to pass on.", mods: { dodge: 0.15, matk: 0.2, hp: -0.15 }, growth: { dark: 1.3, arcane: 1.3 }, fx: { manaflow: 4 },
    passive: { name: "Incorporeal", desc: "+15% dodge, mana flows back." }, active: { id: "phase", name: "Phase Out", desc: "Take 80% less damage for 3 turns." } },
  { id: "werewolf", name: "Werewolf", icon: "🐺", desc: "Cursed by the moon, mighty in the hunt.", mods: { patk: 0.25, hp: 0.15, spd: 0.15 }, growth: { might: 1.3, hunting: 1.4 }, fx: { bleed: 10, regen: 2 },
    passive: { name: "Lycanthropy", desc: "Bleeding claws and regeneration." }, active: { id: "howl", name: "Moon Howl", desc: "Savage ×2.8 strike and foe falters." } },
  { id: "lich", name: "Lich", icon: "☠️", desc: "Undying sorcerer bound to a phylactery.", mods: { matk: 0.35, mp: 0.3, hp: -0.1 }, growth: { arcane: 1.5, dark: 1.4 }, fx: { manaflow: 6, pierce: 10 },
    passive: { name: "Phylactery", desc: "Huge mana and spell power." }, active: { id: "deathbolt", name: "Death Bolt", desc: "Dark spell ×3.2." } },
  { id: "zombie", name: "Zombie", icon: "🧟", desc: "Rotting flesh that refuses to fall.", mods: { hp: 0.35, pdef: 0.2, spd: -0.15 }, growth: { might: 1.2, endurance: 1.3 }, fx: { guard: 10 }, poisonImmune: true,
    passive: { name: "Already Dead", desc: "Immune to poison, +10% guard." }, active: { id: "rot", name: "Undying Rot", desc: "Lock HP for 3 turns." } },
  { id: "ghoul", name: "Ghoul", icon: "🫥", desc: "Corpse-eater with a ravenous hunger.", mods: { patk: 0.2, crit: 0.08, hp: 0.1 }, growth: { hunting: 1.4 }, fx: { lifesteal: 5, haste: 8 },
    passive: { name: "Ravenous", desc: "Life steal and extra strikes." }, active: { id: "devour", name: "Devour", desc: "×2.2 strike healing 40% of damage." } },
];
export interface AscCond { race: string; school: SchoolId; reqs: { stat: string; label: string; need: number; exact?: boolean }[] }
/** Fixed lore conditions; progress counters are tracked in GameState.stats after the school is learned. */
export const ASCENSIONS: AscCond[] = [
  { race: "vampire", school: "blood", reqs: [{ stat: "bloodKills", label: "Monsters drained with Blood Magic", need: 200 }, { stat: "lifestealHeal", label: "HP regained through life steal", need: 10000 }] },
  { race: "ghost", school: "soul", reqs: [{ stat: "soulDeaths", label: "Die exactly once after binding your soul", need: 1, exact: true }] },
  { race: "werewolf", school: "transformation", reqs: [{ stat: "wolfBites", label: "Bitten by wolves", need: 100 }] },
  { race: "lich", school: "necromancy", reqs: [{ stat: "undeadKills", label: "Undead destroyed with Necromancy learned", need: 300 }, { stat: "maxFloor", label: "Highest floor reached", need: 100 }] },
  { race: "zombie", school: "plague", reqs: [{ stat: "poisonDeaths", label: "Die while poisoned", need: 3 }] },
  { race: "ghoul", school: "plague", reqs: [{ stat: "plagueKills", label: "Corpses devoured with Plague Craft", need: 150 }] },
];
export const UNDEAD = new Set(["skeleton", "wraith", "lich", "vampire"]);
