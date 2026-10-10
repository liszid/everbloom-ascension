export type Element = "none" | "fire" | "water" | "earth" | "air" | "light" | "dark" | "nature" | "void";
export type Trait = "lifesteal" | "burn" | "poison" | "thorns" | "regen" | "keen" | "swift" | "guard";
export type StatKey = "atk" | "def" | "spd" | "mag" | "hp" | "crit";
export type Stats = Record<StatKey, number>;
export const STAT_KEYS: StatKey[] = ["atk", "def", "spd", "mag", "hp", "crit"];
export const STAT_LABEL: Record<StatKey, string> = {
  atk: "ATK", def: "DEF", spd: "SPD", mag: "MAG", hp: "HP", crit: "CRIT",
};

export interface Material {
  id: string;
  name: string;
  icon: string;
  tier: number;
  stats: Stats;
  element: Element;
  trait?: Trait;
  food?: number;
  refine?: { to: string; station: "carve" | "smelt" };
  seedOf?: string;
}

function m(
  id: string, name: string, icon: string, tier: number,
  s: [number, number, number, number, number, number],
  element: Element = "none", extra: Partial<Material> = {},
): Material {
  const [atk, def, spd, mag, hp, crit] = s;
  return { id, name, icon, tier, stats: { atk, def, spd, mag, hp, crit }, element, ...extra };
}

const LIST: Material[] = [
  // woods
  m("oak_log", "Oak Log", "🪵", 0, [2, 1, 1, 0, 2, 0], "nature", { refine: { to: "carved_oak", station: "carve" } }),
  m("carved_oak", "Carved Oak", "🪓", 1, [3, 2, 1, 1, 2, 0], "nature"),
  m("birch_log", "Birch Log", "🪵", 0, [1, 0, 3, 1, 1, 1], "air", { refine: { to: "carved_birch", station: "carve" } }),
  m("carved_birch", "Carved Birch", "🏹", 1, [2, 0, 4, 2, 1, 2], "air", { trait: "swift" }),
  m("ironwood_log", "Ironwood Log", "🪵", 2, [2, 4, 0, 0, 3, 0], "earth", { trait: "guard", refine: { to: "carved_ironwood", station: "carve" } }),
  m("carved_ironwood", "Carved Ironwood", "🛡️", 3, [3, 5, 0, 1, 4, 0], "earth", { trait: "guard" }),
  m("elder_log", "Elder Log", "🪵", 4, [1, 1, 1, 5, 4, 0], "light", { trait: "regen", refine: { to: "carved_elder", station: "carve" } }),
  m("carved_elder", "Carved Elder", "🪄", 5, [2, 2, 2, 6, 5, 1], "light", { trait: "regen" }),
  // stone & ores
  m("stone", "Stone", "🪨", 0, [1, 2, 0, 0, 1, 0], "earth"),
  m("copper_ore", "Copper Ore", "🟠", 0, [2, 1, 0, 1, 0, 0], "none", { refine: { to: "copper_ingot", station: "smelt" } }),
  m("copper_ingot", "Copper Ingot", "🟧", 1, [3, 2, 0, 1, 0, 1], "none"),
  m("iron_ore", "Iron Ore", "⚫", 1, [3, 3, 0, 0, 0, 0], "none", { refine: { to: "iron_ingot", station: "smelt" } }),
  m("iron_ingot", "Iron Ingot", "⬛", 2, [4, 4, 0, 0, 1, 1], "none"),
  m("silver_ore", "Silver Ore", "⚪", 2, [2, 1, 1, 3, 0, 1], "light", { refine: { to: "silver_ingot", station: "smelt" } }),
  m("silver_ingot", "Silver Ingot", "⬜", 3, [3, 2, 1, 4, 0, 2], "light"),
  m("gold_ore", "Gold Ore", "🟡", 3, [1, 1, 0, 3, 3, 2], "light", { refine: { to: "gold_ingot", station: "smelt" } }),
  m("gold_ingot", "Gold Ingot", "🟨", 4, [2, 1, 0, 4, 4, 3], "light", { trait: "keen" }),
  m("mithril_ore", "Mithril Ore", "🔷", 5, [3, 3, 4, 2, 0, 1], "air", { refine: { to: "mithril_ingot", station: "smelt" } }),
  m("mithril_ingot", "Mithril Ingot", "🟦", 6, [4, 4, 5, 3, 1, 2], "air", { trait: "swift" }),
  m("adamant_ore", "Adamant Ore", "🟩", 7, [5, 6, 0, 0, 2, 0], "earth", { refine: { to: "adamant_ingot", station: "smelt" } }),
  m("adamant_ingot", "Adamant Ingot", "🟢", 8, [6, 7, 0, 1, 3, 1], "earth", { trait: "guard" }),
  // flowers
  m("daisy", "Daisy", "🌼", 0, [0, 0, 1, 1, 2, 0], "nature", { trait: "regen" }),
  m("rose", "Rose", "🌹", 0, [1, 0, 0, 1, 0, 2], "fire", { trait: "thorns" }),
  m("bluebell", "Bluebell", "🪻", 1, [0, 0, 1, 3, 1, 0], "water"),
  m("nightshade", "Nightshade", "🥀", 2, [2, 0, 1, 2, 0, 1], "dark", { trait: "poison" }),
  m("moonpetal", "Moonpetal", "🌸", 3, [0, 1, 1, 5, 2, 1], "light"),
  // garden
  m("wheat_seed", "Wheat Seed", "🌾", 0, [0, 0, 1, 0, 1, 0], "nature", { seedOf: "wheat" }),
  m("carrot_seed", "Carrot Seed", "🥕", 0, [0, 0, 1, 0, 1, 0], "nature", { seedOf: "carrot" }),
  m("herb_seed", "Herb Seed", "🌿", 0, [0, 0, 0, 1, 1, 0], "nature", { seedOf: "herb_leaf" }),
  m("pumpkin_seed", "Pumpkin Seed", "🎃", 1, [0, 1, 0, 0, 1, 0], "nature", { seedOf: "pumpkin" }),
  m("wheat", "Wheat", "🌾", 0, [0, 0, 1, 0, 2, 0], "nature", { food: 14 }),
  m("carrot", "Carrot", "🥕", 0, [0, 0, 2, 0, 1, 1], "nature", { food: 12 }),
  m("herb_leaf", "Herb Leaf", "🌿", 0, [0, 0, 0, 2, 3, 0], "nature", { food: 8, trait: "regen" }),
  m("pumpkin", "Pumpkin", "🎃", 1, [0, 2, 0, 1, 4, 0], "nature", { food: 30 }),
  // animals
  m("egg", "Egg", "🥚", 0, [0, 1, 0, 1, 2, 0], "none", { food: 10 }),
  m("feather", "Feather", "🪶", 0, [0, 0, 4, 1, 0, 1], "air", { trait: "swift" }),
  m("wool", "Wool", "🧶", 0, [0, 3, 0, 0, 3, 0], "none"),
  m("milk", "Milk", "🥛", 0, [0, 0, 0, 1, 3, 0], "none", { food: 12 }),
  m("hide", "Hide", "🟫", 1, [0, 4, 0, 0, 2, 0], "earth"),
  // pond
  m("fish", "Fish", "🐟", 0, [1, 0, 1, 1, 1, 0], "water", { food: 20 }),
  m("shell", "Shell", "🐚", 0, [0, 3, 0, 1, 0, 0], "water", { trait: "thorns" }),
  m("pearl", "Pearl", "🫧", 2, [0, 1, 0, 4, 1, 2], "water"),
  // dungeon veins
  m("mana_crystal", "Mana Crystal", "🔮", 2, [0, 0, 1, 6, 1, 1], "void"),
  m("obsidian", "Obsidian", "🖤", 4, [5, 3, 0, 1, 0, 3], "fire", { trait: "keen" }),
  m("starmetal", "Starmetal", "🌠", 8, [6, 5, 3, 4, 2, 2], "light"),
  m("void_ore", "Void Ore", "🕳️", 10, [7, 5, 4, 7, 3, 3], "void"),
  // monster drops
  m("slime_gel", "Slime Gel", "🟢", 0, [0, 1, 0, 1, 3, 0], "water", { trait: "regen" }),
  m("rat_fang", "Rat Fang", "🦷", 0, [2, 0, 1, 0, 0, 2], "none", { trait: "keen" }),
  m("bat_wing", "Bat Wing", "🦇", 0, [0, 0, 3, 1, 0, 1], "dark", { trait: "lifesteal" }),
  m("bone", "Bone", "🦴", 1, [3, 2, 0, 0, 0, 1], "dark"),
  m("wolf_pelt", "Wolf Pelt", "🐺", 1, [1, 3, 2, 0, 2, 0], "nature"),
  m("goblin_tooth", "Goblin Tooth", "🦷", 1, [3, 0, 1, 0, 0, 2], "earth"),
  m("spider_silk", "Spider Silk", "🕸️", 1, [0, 1, 3, 1, 0, 2], "dark", { trait: "swift" }),
  m("venom_sac", "Venom Sac", "🧪", 1, [2, 0, 0, 2, 0, 1], "nature", { trait: "poison" }),
  m("orc_tusk", "Orc Tusk", "🐗", 2, [5, 1, 0, 0, 1, 1], "earth"),
  m("troll_blood", "Troll Blood", "🩸", 2, [1, 1, 0, 1, 5, 0], "nature", { trait: "regen" }),
  m("cursed_bone", "Cursed Bone", "☠️", 2, [4, 1, 0, 3, 0, 1], "dark", { trait: "lifesteal" }),
  m("wraith_essence", "Wraith Essence", "👻", 3, [1, 0, 3, 5, 0, 1], "dark", { trait: "lifesteal" }),
  m("fire_core", "Fire Core", "🔥", 3, [4, 0, 1, 4, 0, 2], "fire", { trait: "burn" }),
  m("frost_shard", "Frost Shard", "❄️", 3, [3, 3, 0, 3, 0, 1], "water"),
  m("golem_heart", "Golem Heart", "🗿", 4, [2, 7, 0, 1, 5, 0], "earth", { trait: "guard" }),
  m("harpy_plume", "Harpy Plume", "🪽", 4, [2, 0, 7, 2, 0, 2], "air", { trait: "swift" }),
  m("vampire_fang", "Vampire Fang", "🧛", 5, [5, 0, 2, 3, 1, 3], "dark", { trait: "lifesteal" }),
  m("naga_scale", "Naga Scale", "🐍", 5, [2, 6, 2, 2, 2, 0], "water", { trait: "poison" }),
  m("demon_horn", "Demon Horn", "😈", 6, [7, 1, 1, 4, 0, 3], "fire", { trait: "burn" }),
  m("wyvern_scale", "Wyvern Scale", "🦎", 6, [2, 7, 3, 1, 3, 0], "air"),
  m("angel_feather", "Angel Feather", "🤍", 7, [2, 2, 5, 7, 3, 1], "light", { trait: "regen" }),
  m("lich_dust", "Lich Dust", "⚱️", 7, [3, 1, 1, 8, 0, 2], "dark", { trait: "lifesteal" }),
  m("dragon_scale", "Dragon Scale", "🐉", 8, [4, 8, 2, 3, 5, 1], "fire", { trait: "thorns" }),
  m("phoenix_ash", "Phoenix Ash", "🪶", 8, [3, 2, 3, 6, 6, 1], "fire", { trait: "regen" }),
  m("titan_bone", "Titan Bone", "🦣", 9, [8, 8, 0, 1, 7, 1], "earth", { trait: "guard" }),
  m("star_shard", "Star Shard", "⭐", 9, [5, 2, 4, 8, 2, 4], "light", { trait: "keen" }),
  m("abyss_eye", "Abyss Eye", "👁️", 10, [6, 3, 3, 10, 2, 4], "void", { trait: "lifesteal" }),
  m("eternity_core", "Eternity Core", "💠", 10, [9, 9, 5, 9, 9, 3], "void", { trait: "regen" }),
];

export const MATERIALS: Record<string, Material> = Object.fromEntries(LIST.map((x) => [x.id, x]));
export const getMat = (id: string): Material => MATERIALS[id] ?? LIST[0]!;

export const tierMult = (t: number) => Math.pow(1.6, t);

// gather unlock tables: [materialId, requiredLevel, weight]
export const TREES: Record<string, { mat: string; lvl: number; icon: string; name: string }> = {
  T: { mat: "oak_log", lvl: 1, icon: "🌳", name: "Oak" },
  B: { mat: "birch_log", lvl: 3, icon: "🌲", name: "Birch" },
  I: { mat: "ironwood_log", lvl: 12, icon: "🌴", name: "Ironwood" },
  E: { mat: "elder_log", lvl: 25, icon: "🎄", name: "Elder Tree" },
};
export const ORES: [string, number, number][] = [
  ["stone", 1, 10], ["copper_ore", 1, 8], ["iron_ore", 5, 6], ["silver_ore", 12, 4],
  ["gold_ore", 20, 3], ["mithril_ore", 30, 2], ["adamant_ore", 42, 1],
];
export const FLOWERS: [string, number, number][] = [
  ["daisy", 1, 10], ["rose", 1, 7], ["bluebell", 4, 5], ["nightshade", 8, 3], ["moonpetal", 15, 2],
];
export const FLOWER_SEEDS: [string, number][] = [["wheat_seed", 3], ["carrot_seed", 3], ["herb_seed", 2], ["pumpkin_seed", 1]];
export const POND: [string, number, number][] = [["fish", 1, 10], ["shell", 1, 5], ["pearl", 10, 1]];
export const ANIMALS: Record<string, { name: string; icon: string; drops: [string, number][] }> = {
  c: { name: "Chicken", icon: "🐔", drops: [["egg", 3], ["feather", 2]] },
  s: { name: "Sheep", icon: "🐑", drops: [["wool", 1]] },
  w: { name: "Cow", icon: "🐄", drops: [["milk", 2], ["hide", 1]] },
};
export const VEINS: string[] = ["iron_ore", "silver_ore", "mana_crystal", "gold_ore", "obsidian", "mithril_ore", "adamant_ore", "starmetal", "void_ore"];

export interface MonsterDef {
  id: string; name: string; icon: string; tier: number; weak: Element; drops: string[];
}
export const MONSTERS: MonsterDef[] = [
  { id: "slime", name: "Slime", icon: "🟢", tier: 0, weak: "fire", drops: ["slime_gel"] },
  { id: "rat", name: "Giant Rat", icon: "🐀", tier: 0, weak: "nature", drops: ["rat_fang", "hide"] },
  { id: "bat", name: "Cave Bat", icon: "🦇", tier: 0, weak: "light", drops: ["bat_wing"] },
  { id: "wolf", name: "Dire Wolf", icon: "🐺", tier: 1, weak: "fire", drops: ["wolf_pelt", "bone"] },
  { id: "goblin", name: "Goblin", icon: "👺", tier: 1, weak: "light", drops: ["goblin_tooth", "copper_ore"] },
  { id: "spider", name: "Tomb Spider", icon: "🕷️", tier: 1, weak: "fire", drops: ["spider_silk", "venom_sac"] },
  { id: "skeleton", name: "Skeleton", icon: "💀", tier: 2, weak: "light", drops: ["bone", "cursed_bone"] },
  { id: "orc", name: "Orc Brute", icon: "👹", tier: 2, weak: "water", drops: ["orc_tusk", "iron_ore"] },
  { id: "troll", name: "Bog Troll", icon: "🧌", tier: 2, weak: "fire", drops: ["troll_blood"] },
  { id: "wraith", name: "Wraith", icon: "👻", tier: 3, weak: "light", drops: ["wraith_essence"] },
  { id: "imp", name: "Fire Imp", icon: "😈", tier: 3, weak: "water", drops: ["fire_core"] },
  { id: "frost", name: "Frost Wisp", icon: "❄️", tier: 3, weak: "fire", drops: ["frost_shard"] },
  { id: "golem", name: "Stone Golem", icon: "🗿", tier: 4, weak: "water", drops: ["golem_heart", "stone"] },
  { id: "harpy", name: "Harpy", icon: "🦅", tier: 4, weak: "earth", drops: ["harpy_plume"] },
  { id: "vampire", name: "Vampire", icon: "🧛", tier: 5, weak: "light", drops: ["vampire_fang"] },
  { id: "naga", name: "Naga", icon: "🐍", tier: 5, weak: "earth", drops: ["naga_scale", "pearl"] },
  { id: "demon", name: "Demon", icon: "👿", tier: 6, weak: "light", drops: ["demon_horn"] },
  { id: "wyvern", name: "Wyvern", icon: "🦎", tier: 6, weak: "earth", drops: ["wyvern_scale"] },
  { id: "seraph", name: "Fallen Seraph", icon: "😇", tier: 7, weak: "dark", drops: ["angel_feather"] },
  { id: "lich", name: "Lich", icon: "☠️", tier: 7, weak: "light", drops: ["lich_dust", "mana_crystal"] },
  { id: "dragon", name: "Elder Dragon", icon: "🐲", tier: 8, weak: "water", drops: ["dragon_scale"] },
  { id: "phoenix", name: "Phoenix", icon: "🐦‍🔥", tier: 8, weak: "water", drops: ["phoenix_ash"] },
  { id: "titan", name: "Titan", icon: "🦣", tier: 9, weak: "air", drops: ["titan_bone"] },
  { id: "starspawn", name: "Star Spawn", icon: "🌟", tier: 9, weak: "void", drops: ["star_shard"] },
  { id: "horror", name: "Void Horror", icon: "👁️", tier: 10, weak: "light", drops: ["abyss_eye", "void_ore"] },
  { id: "sovereign", name: "Eternal Warden", icon: "👑", tier: 10, weak: "void", drops: ["eternity_core"] },
];

export const WEAPON_TYPES = ["sword", "axe", "mace", "dagger", "staff", "bow"] as const;
export type WeaponType = (typeof WEAPON_TYPES)[number];
export const WEAPON_INFO: Record<WeaponType, { name: string; icon: string; mod: Partial<Stats> }> = {
  sword: { name: "Sword", icon: "🗡️", mod: { atk: 1.1, spd: 1.0, crit: 1.1 } },
  axe: { name: "Axe", icon: "🪓", mod: { atk: 1.35, spd: 0.7, crit: 1.0 } },
  mace: { name: "Mace", icon: "🔨", mod: { atk: 1.2, def: 1.4, spd: 0.8 } },
  dagger: { name: "Dagger", icon: "🔪", mod: { atk: 0.85, spd: 1.5, crit: 1.6 } },
  staff: { name: "Staff", icon: "🪄", mod: { atk: 0.6, mag: 1.7, hp: 1.2 } },
  bow: { name: "Bow", icon: "🏹", mod: { atk: 1.0, spd: 1.3, crit: 1.3 } },
};

export const SKILLS: Record<string, { name: string; icon: string; desc: string }> = {
  movement: { name: "Movement", icon: "👣", desc: "Walk around. +1% dodge per level." },
  woodcutting: { name: "Woodcutting", icon: "🪓", desc: "Chop trees. Unlocks rarer woods." },
  mining: { name: "Mining", icon: "⛏️", desc: "Mine rocks. Unlocks rarer ores." },
  herbalism: { name: "Herbalism", icon: "🌼", desc: "Pick flowers. Rarer flowers, more seeds." },
  farming: { name: "Farming", icon: "🌱", desc: "Grow crops. Bigger harvests." },
  husbandry: { name: "Husbandry", icon: "🐑", desc: "Tend animals. More produce." },
  fishing: { name: "Fishing", icon: "🎣", desc: "Fish the pond. Pearls at higher levels." },
  cooking: { name: "Cooking", icon: "🍳", desc: "Cook meals. +5% healing per level." },
  carving: { name: "Carving", icon: "🪚", desc: "Carve wood into stronger materials." },
  smelting: { name: "Smelting", icon: "🔥", desc: "Smelt ore into ingots." },
  crafting: { name: "Crafting", icon: "⚒️", desc: "Forge gear. Better grades and stats." },
  defense: { name: "Defense", icon: "🛡️", desc: "Get hit. +3% DEF and +4 HP per level." },
  brawling: { name: "Brawling", icon: "👊", desc: "Fight bare-handed." },
  sword: { name: "Sword Mastery", icon: "🗡️", desc: "+4% ATK with swords per level." },
  axe: { name: "Axe Mastery", icon: "🪓", desc: "+4% ATK with axes per level." },
  mace: { name: "Mace Mastery", icon: "🔨", desc: "+4% ATK with maces per level." },
  dagger: { name: "Dagger Mastery", icon: "🔪", desc: "+4% ATK with daggers per level." },
  staff: { name: "Staff Mastery", icon: "🪄", desc: "+4% ATK with staves per level." },
  bow: { name: "Bow Mastery", icon: "🏹", desc: "+4% ATK with bows per level." },
};

export const GRADES = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "EX"];
export const GRADE_ADJ = ["Crude", "Rough", "Plain", "Sturdy", "Fine", "Superior", "Masterwork", "Legendary", "Mythic", "Transcendent"];

export const ELEMENT_ICON: Record<Element, string> = {
  none: "", fire: "🔥", water: "💧", earth: "⛰️", air: "🌪️", light: "✨", dark: "🌑", nature: "🍃", void: "🌀",
};
export const TRAIT_INFO: Record<Trait, string> = {
  lifesteal: "Heals you for part of damage dealt",
  burn: "Sets foes ablaze each turn",
  poison: "Poisons foes each turn",
  thorns: "Reflects damage back",
  regen: "Restores HP each turn",
  keen: "Higher critical chance",
  swift: "Higher dodge chance",
  guard: "Reduces damage taken",
};

// 20 x 15 village
export const VILLAGE_MAP = [
  "####################",
  "#TTBTT.F.F..WWWW.TI#",
  "#TT.,,,,,,,,WWWW..E#",
  "#B..,H...K.,WWW..TB#",
  "#T..,....,.,......T#",
  "#..F,,A,,C,,U,,,,..#",
  "#.F.,.........,..RR#",
  "#GGG,.cc..ss..,..RR#",
  "#GGG,.c...s...,.R.R#",
  "#GGG,.........,....#",
  "#...,,,,,,,,,,,,,..#",
  "#F.F...ww.....,.F..#",
  "#.F....w......,..F.#",
  "#..F.........,D,...#",
  "####################",
];
