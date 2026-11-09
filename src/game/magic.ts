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
const base: Spell[] = T.flatMap(([sc, list]) => list.map(([name, kind, mult], i) => ({
  id: `${sc}_${i}`, name, school: sc, lvl: LV[i]!, matk: SCHOOL[sc].matk * MREQ[i]!, kind, mult,
  cost: Math.round((8 + i * 10) * (SCHOOL[sc].combo ? 1.5 : 1)), el: kind === "phys" || SCHOOL[sc].el === "none" ? undefined : SCHOOL[sc].el,
})));

/** Every school teaches this many spells; the last ones unlock at school level 20. */
export const SPELLS_PER_SCHOOL = 24;
/** School levels for the 21 advanced spells (the 3 original spells sit at levels 1, 5 and 12). */
const ADV_LV = [1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 20];
const K: Record<string, SpellKind> = { m: "mag", h: "heal", g: "guard", l: "lock", d: "drain", p: "phys" };
// "Name:kind" in unlock order (m damage, h heal, g guard, l HP lock, d drain, p physical strike)
const ADV: Record<SchoolId, string> = {
  fire: "Spark:m|Flame Ward:g|Fire Lash:m|Cauterize:h|Blazing Arrow:m|Scorch:m|Flame Wall:g|Phoenix Feather:h|Meteor Shard:m|Burning Hands:m|Heat Drain:d|Pyroclasm:m|Firestorm:m|Rebirth Flame:l|Solar Flare:m|Hellfire:m|Phoenix Dive:m|Ember Soul:d|Supernova:m|Sunfall:m|Primordial Blaze:m",
  water: "Frost Bite:m|Bubble Shield:g|Ice Shard:m|Cleansing Rain:h|Tidal Lash:m|Frost Nova:m|Ice Barrier:g|Riptide:d|Hailstorm:m|Healing Spring:h|Whirlpool:m|Frozen Tomb:l|Tsunami:m|Abyssal Pressure:m|Sea's Embrace:h|Blizzard:m|Leviathan's Call:m|Drown:d|Absolute Zero:m|Deluge:m|Ocean's Wrath:m",
  wind: "Breeze Cut:m|Wind Wall:g|Air Slash:m|Second Wind:h|Gale Arrow:m|Updraft:m|Mirage Veil:g|Vacuum Pull:d|Razor Wind:m|Zephyr Mend:h|Tornado:m|Eye of the Storm:l|Sky Piercer:m|Downburst:m|Wind Walk:g|Hurricane:m|Thousand Blades:m|Breath Steal:d|Sky Sunder:m|Typhoon:m|Heaven's Gale:m",
  earth: "Pebble Toss:m|Mud Wall:g|Rock Spike:m|Mountain Heart:h|Sand Blast:m|Boulder:m|Granite Guard:g|Quicksand:d|Fissure:m|Crystal Mend:h|Landslide:m|Living Statue:l|Tectonic Slam:m|Iron Core:g|Stalagmite Rain:m|Seismic Wave:m|Avalanche:m|Earth's Hunger:d|Meteor Strike:m|Continental Drift:m|World Breaker:m",
  light: "Glimmer:m|Holy Shield:g|Radiant Ray:m|Blessing:h|Sacred Flame:m|Divine Light:h|Sanctuary:g|Sun Lance:m|Purify:h|Holy Nova:m|Prism Beam:m|Divine Aegis:l|Celestial Strike:m|Light's Grace:d|Seraph Wings:g|Radiance:m|Mass Restoration:h|Holy Wrath:m|Angel's Descent:m|Dawnbreaker:m|Heaven's Light:m",
  dark: "Shade:m|Dark Veil:g|Curse:m|Soul Siphon:d|Night Spear:m|Hex:m|Umbral Cloak:g|Nightmare:m|Void Grasp:d|Shadow Mend:h|Eclipse:m|Pact of Night:l|Abyssal Blade:m|Dread:m|Black Hole:d|Shadowstorm:m|Void Rift:m|Soul Eater:d|Endless Night:m|Annihilation:m|Abyss:m",
  herbal: "Bramble:m|Bark Skin:g|Poison Ivy:m|Healing Herbs:h|Vine Whip:m|Sap Leech:d|Spore Cloud:m|Lifebloom:h|Entangle:m|Ironwood:g|Toxic Bloom:m|Nature's Embrace:l|Thornstorm:m|Rejuvenation:h|Briar Prison:m|Wild Growth:h|Forest Wrath:m|Root Drain:d|World Tree's Gift:h|Gaia's Fury:m|Eternal Spring:h",
  summoning: "Imp:m|Spirit Shield:g|Fire Sprite:m|Fairy Healer:h|Stone Guardian:g|Shadow Hound:m|Thunderbird:m|Unicorn:h|Wyvern:m|Spirit Vampire:d|Treant:m|Guardian Angel:l|Griffin:m|Kraken:m|Djinn:m|Behemoth:m|Phoenix:h|Hydra:m|Titan:m|Elder Dragon:m|Celestial Avatar:m",
  soul: "Soul Spark:m|Spirit Ward:g|Soul Lash:m|Soul Mend:h|Spirit Arrow:m|Soul Drain:d|Ethereal Form:g|Mind Shatter:m|Soul Chain:m|Spirit Link:h|Wraith Touch:d|Phylactery Seal:l|Spirit Bomb:m|Soul Prison:m|Ghost March:m|Reaping:d|Soul Harvest:m|Undying Will:l|Oblivion Gate:m|Soul Cataclysm:m|Eternity:m",
  transformation: "Bear Paw:p|Turtle Shell:g|Viper Fang:p|Troll Blood:h|Eagle Talon:p|Wolf Bite:d|Rhino Charge:p|Chameleon Skin:g|Lion Roar:p|Hydra Regrowth:h|Mantis Strike:p|Stone Golem:l|Gorilla Smash:p|Shark Frenzy:d|Wyvern Wings:p|Minotaur Rush:p|Behemoth Form:g|Vampire Bat:d|Chimera Form:p|Dragon Form:p|Primal Avatar:p",
  blood: "Blood Drop:d|Blood Ward:g|Hemorrhage:m|Transfusion:h|Blood Spear:m|Vein Rip:d|Crimson Shield:g|Blood Rite:h|Boil Blood:m|Sanguine Thirst:d|Blood Moon:m|Blood Oath:l|Crimson Tide:m|Heart Rend:d|Blood Rain:m|Scarlet Feast:d|Blood Golem:m|Vital Surge:h|Red Death:m|Crimson Apocalypse:d|Blood God's Wrath:m",
  necromancy: "Bone Spear:m|Corpse Shield:g|Skeletal Hand:m|Death Coil:d|Ghoul Swarm:m|Grave Mend:h|Bone Armor:g|Wight Lord:m|Corpse Explosion:m|Life Siphon:d|Bone Prison:m|Deathless:l|Death Knight:m|Plague of Bones:m|Soul Reap:d|Lich Touch:m|Bone Dragon:m|Dark Ritual:h|Death's Door:m|Legion of Doom:m|Eternal Undeath:l",
  plague: "Fester:m|Rot Ward:g|Blight:m|Rotting Feast:d|Spore Burst:m|Mutagen:h|Carrion Swarm:m|Fever:d|Black Death:m|Corruption:m|Plague Rats:m|Undying Sickness:l|Contagion:m|Decay:d|Locust Swarm:m|Wasting:d|Rot Bloom:m|Pandemic:m|Necrosis:d|Apocalypse:m|Endless Blight:m",
  storm: "Static Shock:m|Static Field:g|Lightning Bolt:m|Rain of Renewal:h|Ball Lightning:m|Thunder Lance:m|Storm Shield:g|Arc Drain:d|Storm Call:m|Monsoon Mend:h|Plasma Strike:m|Eye of the Tempest:l|Thunderstorm:m|Lightning Spear:m|Ion Storm:m|Supercell:m|Thor's Hammer:m|Voltaic Drain:d|Maelstrom:m|Ragnarok Storm:m|Sky Father's Fury:m",
  magma: "Cinder:m|Basalt Wall:g|Lava Whip:m|Magma Heart:h|Molten Spear:m|Ash Cloud:m|Pumice Armor:g|Heat Siphon:d|Pyroclastic Flow:m|Volcanic Mend:h|Lava Lake:m|Obsidian Statue:l|Caldera:m|Meteor Swarm:m|Magma Golem:m|Lava Titan:m|Volcano's Heart:d|Hellforge:m|Core Rupture:m|Earthshatter:m|Primordial Fire:m",
};
/** M.Atk needed: ramps with school level, never above what the level-12 spell asks. */
const advMreq = (lvl: number) => (lvl <= 1 ? 1 : Math.min(30, Math.round(lvl * 2.5)));
const advMult = (kind: SpellKind, lvl: number, combo: boolean) => {
  const dmg = (1.25 + lvl * 0.17) * (combo ? 1.12 : 1);
  return kind === "heal" ? +(0.2 + lvl * 0.02).toFixed(2) : kind === "guard" ? 1 : kind === "lock" ? (lvl >= 12 ? 3 : 2) : kind === "drain" ? +(dmg * 0.85).toFixed(2) : +dmg.toFixed(2);
};
const advanced: Spell[] = SCHOOLS.flatMap((sc) => ADV[sc.id].split("|").map((e, j) => {
  const [name, k] = e.split(":") as [string, string]; const kind = K[k]!; const lvl = ADV_LV[j]!;
  return { id: `${sc.id}_${3 + j}`, name, school: sc.id, lvl, matk: sc.matk * advMreq(lvl), kind, mult: advMult(kind, lvl, !!sc.combo),
    cost: Math.round((6 + lvl * 1.6) * (sc.combo ? 1.5 : 1)), el: kind === "phys" || sc.el === "none" ? undefined : sc.el };
}));
/** All spells, grouped by school and ordered by the school level that unlocks them. */
export const SPELLS: Spell[] = SCHOOLS.flatMap((sc) => [...base, ...advanced].filter((x) => x.school === sc.id).sort((a, b) => a.lvl - b.lvl));
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
