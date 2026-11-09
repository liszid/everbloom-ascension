// ===================== Thornvale — data-driven content =====================
// Everything here is plain data. Engine systems read it generically, so new
// materials / races / monsters / affinities can be appended without code changes.

export type Element = "none" | "fire" | "water" | "wind" | "earth" | "light" | "dark" | "nature" | "void";

// ---------- material science ----------
export type Prop = "hard" | "dens" | "sharp" | "flex" | "cond" | "magic" | "dura" | "weight";
export const PROPS: Prop[] = ["hard", "dens", "sharp", "flex", "cond", "magic", "dura", "weight"];
export const PROP_LABEL: Record<Prop, string> = {
  hard: "Hardness", dens: "Density", sharp: "Sharpness", flex: "Flexibility",
  cond: "Conductivity", magic: "Magic Affinity", dura: "Durability", weight: "Weight",
};
export type MatSource = "monster" | "mining" | "tree" | "plant" | "farm" | "fishing" | "hunting" | "boss" | "refined" | "casino";

export interface Material {
  id: string; name: string; icon: string;
  tier: number;            // quality 0..10
  props: Record<Prop, number>; // 0..10
  element: Element; src: MatSource;
  food?: number; refine?: { to: string; station: "carve" | "smelt" }; seedOf?: string;
  catalyst?: boolean;      // counts toward EX discoveries
  value: number;           // base gold value
}

// [hard, dens, sharp, flex, cond, magic, dura, weight]
type P8 = [number, number, number, number, number, number, number, number];
function m(id: string, name: string, icon: string, tier: number, p: P8, element: Element, src: MatSource, extra: Partial<Material> = {}): Material {
  const props = Object.fromEntries(PROPS.map((k, i) => [k, p[i]!])) as Record<Prop, number>;
  return { id, name, icon, tier, props, element, src, value: Math.round(4 * Math.pow(2.1, tier)), ...extra };
}

const LIST: Material[] = [
  // trees
  m("oak_log", "Oak Log", "🪵", 0, [3, 4, 1, 4, 1, 1, 4, 4], "nature", "tree", { refine: { to: "carved_oak", station: "carve" } }),
  m("carved_oak", "Carved Oak", "🪓", 1, [4, 4, 2, 5, 1, 2, 5, 3], "nature", "refined"),
  m("birch_log", "Birch Log", "🪵", 0, [2, 2, 2, 7, 1, 2, 3, 2], "wind", "tree", { refine: { to: "carved_birch", station: "carve" } }),
  m("carved_birch", "Carved Birch", "🏹", 1, [3, 2, 3, 8, 2, 3, 4, 2], "wind", "refined"),
  m("ironwood_log", "Ironwood Log", "🪵", 2, [6, 7, 1, 3, 1, 1, 7, 6], "earth", "tree", { refine: { to: "carved_ironwood", station: "carve" } }),
  m("carved_ironwood", "Carved Ironwood", "🛡️", 3, [7, 7, 2, 4, 1, 2, 8, 5], "earth", "refined"),
  m("elder_log", "Elder Log", "🪵", 4, [3, 3, 1, 5, 6, 8, 5, 3], "light", "tree", { refine: { to: "carved_elder", station: "carve" } }),
  m("carved_elder", "Carved Elder", "🪄", 5, [4, 3, 2, 6, 7, 9, 6, 2], "light", "refined"),
  // ores
  m("stone", "Stone", "🪨", 0, [4, 6, 1, 0, 0, 0, 3, 7], "earth", "mining"),
  m("copper_ore", "Copper Ore", "🟠", 0, [3, 5, 2, 2, 7, 1, 3, 5], "none", "mining", { refine: { to: "copper_ingot", station: "smelt" } }),
  m("copper_ingot", "Copper Ingot", "🟧", 1, [4, 5, 3, 3, 8, 2, 4, 5], "none", "refined"),
  m("iron_ore", "Iron Ore", "⚫", 1, [6, 7, 4, 1, 3, 0, 5, 7], "none", "mining", { refine: { to: "iron_ingot", station: "smelt" } }),
  m("iron_ingot", "Iron Ingot", "⬛", 2, [7, 7, 6, 2, 3, 0, 7, 7], "none", "refined"),
  m("silver_ore", "Silver Ore", "⚪", 2, [4, 6, 4, 3, 8, 6, 4, 5], "light", "mining", { refine: { to: "silver_ingot", station: "smelt" } }),
  m("silver_ingot", "Silver Ingot", "⬜", 3, [5, 6, 5, 3, 9, 7, 5, 5], "light", "refined"),
  m("gold_ore", "Gold Ore", "🟡", 3, [2, 9, 2, 4, 9, 6, 3, 9], "light", "mining", { refine: { to: "gold_ingot", station: "smelt" } }),
  m("gold_ingot", "Gold Ingot", "🟨", 4, [3, 9, 3, 4, 10, 7, 4, 9], "light", "refined"),
  m("mithril_ore", "Mithril Ore", "🔷", 5, [7, 3, 7, 7, 7, 6, 7, 1], "wind", "mining", { refine: { to: "mithril_ingot", station: "smelt" } }),
  m("mithril_ingot", "Mithril Ingot", "🟦", 6, [8, 3, 8, 8, 8, 7, 8, 1], "wind", "refined"),
  m("adamant_ore", "Adamant Ore", "🟩", 7, [10, 9, 6, 1, 2, 2, 10, 9], "earth", "mining", { refine: { to: "adamant_ingot", station: "smelt" } }),
  m("adamant_ingot", "Adamant Ingot", "🟢", 8, [10, 9, 8, 2, 3, 3, 10, 8], "earth", "refined"),
  // plants
  m("daisy", "Daisy", "🌼", 0, [0, 1, 0, 6, 2, 4, 1, 0], "nature", "plant"),
  m("rose", "Rose", "🌹", 0, [1, 1, 4, 4, 2, 3, 1, 0], "fire", "plant"),
  m("bluebell", "Bluebell", "🪻", 1, [0, 1, 0, 5, 4, 6, 1, 0], "water", "plant"),
  m("nightshade", "Nightshade", "🥀", 2, [1, 1, 5, 4, 4, 6, 2, 0], "dark", "plant"),
  m("moonpetal", "Moonpetal", "🌸", 3, [1, 2, 1, 6, 6, 9, 2, 0], "light", "plant"),
  // farm
  m("wheat_seed", "Wheat Seed", "🌾", 0, [0, 1, 0, 2, 0, 1, 0, 0], "nature", "farm", { seedOf: "wheat" }),
  m("carrot_seed", "Carrot Seed", "🥕", 0, [0, 1, 0, 2, 0, 1, 0, 0], "nature", "farm", { seedOf: "carrot" }),
  m("herb_seed", "Herb Seed", "🌿", 0, [0, 1, 0, 2, 0, 2, 0, 0], "nature", "farm", { seedOf: "herb_leaf" }),
  m("pumpkin_seed", "Pumpkin Seed", "🎃", 1, [0, 1, 0, 2, 0, 1, 0, 0], "nature", "farm", { seedOf: "pumpkin" }),
  m("wheat", "Wheat", "🌾", 0, [0, 2, 0, 4, 0, 1, 1, 1], "nature", "farm", { food: 10 }),
  m("carrot", "Carrot", "🥕", 0, [1, 3, 0, 3, 0, 1, 1, 1], "nature", "farm", { food: 9 }),
  m("herb_leaf", "Herb Leaf", "🌿", 0, [0, 1, 0, 5, 2, 4, 1, 0], "nature", "farm", { food: 6 }),
  m("pumpkin", "Pumpkin", "🎃", 1, [2, 5, 0, 2, 0, 2, 3, 4], "nature", "farm", { food: 22 }),
  m("egg", "Egg", "🥚", 0, [2, 3, 0, 1, 1, 2, 1, 1], "none", "farm", { food: 8 }),
  m("feather", "Feather", "🪶", 0, [0, 0, 2, 9, 1, 3, 1, 0], "wind", "farm"),
  m("wool", "Wool", "🧶", 0, [0, 4, 0, 8, 0, 2, 4, 2], "none", "farm"),
  m("milk", "Milk", "🥛", 0, [0, 2, 0, 1, 1, 2, 0, 2], "none", "farm", { food: 9 }),
  // hunting
  m("hide", "Hide", "🟫", 1, [3, 5, 0, 6, 0, 1, 6, 3], "earth", "hunting"),
  m("antler", "Antler", "🦌", 1, [5, 4, 6, 3, 1, 3, 5, 3], "nature", "hunting"),
  // fishing
  m("fish", "Fish", "🐟", 0, [1, 2, 1, 4, 2, 2, 1, 1], "water", "fishing", { food: 15 }),
  m("shell", "Shell", "🐚", 0, [6, 5, 3, 0, 1, 2, 4, 3], "water", "fishing"),
  m("pearl", "Pearl", "🫧", 2, [5, 6, 0, 0, 6, 8, 5, 2], "water", "fishing"),
  m("eel", "Storm Eel", "🐍", 3, [2, 3, 2, 8, 10, 6, 3, 2], "wind", "fishing", { food: 30 }),
  // dungeon veins
  m("mana_crystal", "Mana Crystal", "🔮", 2, [5, 3, 3, 1, 9, 10, 3, 2], "void", "mining"),
  m("obsidian", "Obsidian", "🖤", 4, [8, 7, 10, 0, 2, 4, 3, 6], "fire", "mining"),
  m("starmetal", "Starmetal", "🌠", 8, [9, 6, 9, 6, 9, 9, 9, 3], "light", "mining", { catalyst: true }),
  m("void_ore", "Void Ore", "🕳️", 10, [10, 8, 10, 7, 10, 10, 10, 2], "void", "mining", { catalyst: true }),
  // monster drops
  m("slime_gel", "Slime Gel", "🟢", 0, [0, 3, 0, 9, 3, 4, 2, 2], "water", "monster"),
  m("rat_fang", "Rat Fang", "🦷", 0, [4, 2, 6, 1, 0, 1, 2, 1], "none", "monster"),
  m("bat_wing", "Bat Wing", "🦇", 0, [0, 1, 2, 8, 1, 4, 1, 0], "dark", "monster"),
  m("bone", "Bone", "🦴", 1, [6, 5, 4, 1, 0, 2, 4, 3], "dark", "monster"),
  m("wolf_pelt", "Wolf Pelt", "🐺", 1, [2, 4, 1, 7, 0, 2, 6, 2], "nature", "monster"),
  m("goblin_tooth", "Goblin Tooth", "🦷", 1, [5, 3, 7, 1, 0, 1, 3, 1], "earth", "monster"),
  m("spider_silk", "Spider Silk", "🕸️", 1, [1, 1, 3, 10, 2, 4, 6, 0], "dark", "monster"),
  m("venom_sac", "Venom Sac", "🧪", 1, [0, 2, 5, 3, 3, 6, 1, 1], "nature", "monster"),
  m("orc_tusk", "Orc Tusk", "🐗", 2, [8, 6, 7, 1, 0, 1, 6, 5], "earth", "monster"),
  m("troll_blood", "Troll Blood", "🩸", 2, [0, 5, 0, 4, 3, 6, 8, 2], "nature", "monster"),
  m("cursed_bone", "Cursed Bone", "☠️", 2, [6, 5, 6, 1, 4, 7, 4, 3], "dark", "monster"),
  m("wraith_essence", "Wraith Essence", "👻", 3, [0, 0, 4, 9, 8, 10, 2, 0], "dark", "monster"),
  m("fire_core", "Fire Core", "🔥", 3, [5, 4, 6, 2, 8, 8, 4, 2], "fire", "monster"),
  m("frost_shard", "Frost Shard", "❄️", 3, [7, 6, 7, 1, 5, 7, 4, 3], "water", "monster"),
  m("golem_heart", "Golem Heart", "🗿", 4, [10, 10, 2, 0, 3, 4, 10, 10], "earth", "monster"),
  m("harpy_plume", "Harpy Plume", "🪽", 4, [1, 1, 5, 10, 4, 5, 3, 0], "wind", "monster"),
  m("vampire_fang", "Vampire Fang", "🧛", 5, [7, 4, 9, 3, 4, 8, 5, 1], "dark", "monster"),
  m("naga_scale", "Naga Scale", "🐍", 5, [8, 7, 3, 6, 4, 6, 8, 4], "water", "monster"),
  m("demon_horn", "Demon Horn", "😈", 6, [9, 6, 9, 2, 6, 8, 6, 4], "fire", "monster"),
  m("wyvern_scale", "Wyvern Scale", "🦎", 6, [9, 7, 4, 6, 3, 5, 9, 4], "wind", "monster"),
  m("angel_feather", "Angel Feather", "🤍", 7, [3, 2, 4, 10, 9, 10, 6, 0], "light", "monster"),
  m("lich_dust", "Lich Dust", "⚱️", 7, [2, 3, 6, 5, 10, 10, 3, 1], "dark", "monster"),
  m("dragon_scale", "Dragon Scale", "🐉", 8, [10, 9, 6, 5, 6, 8, 10, 5], "fire", "monster"),
  m("phoenix_ash", "Phoenix Ash", "🪶", 8, [3, 3, 5, 8, 10, 10, 7, 0], "fire", "monster"),
  m("titan_bone", "Titan Bone", "🦣", 9, [10, 10, 7, 2, 4, 5, 10, 9], "earth", "monster"),
  m("star_shard", "Star Shard", "⭐", 9, [8, 5, 10, 6, 10, 10, 8, 1], "light", "monster", { catalyst: true }),
  m("abyss_eye", "Abyss Eye", "👁️", 10, [7, 6, 9, 7, 10, 10, 8, 1], "void", "monster", { catalyst: true }),
  // boss relics
  m("guardian_sigil", "Guardian Sigil", "🔱", 2, [6, 6, 6, 6, 6, 6, 8, 3], "none", "boss"),
  m("warden_crest", "Warden Crest", "🏵️", 5, [8, 7, 8, 7, 8, 8, 9, 3], "none", "boss"),
  m("eternity_core", "Eternity Core", "💠", 10, [10, 10, 10, 10, 10, 10, 10, 1], "void", "boss", { catalyst: true }),
  m("ancient_schematic", "Ancient Schematic", "📜", 6, [0, 0, 0, 0, 5, 5, 0, 0], "none", "boss", { catalyst: true }),
  // casino
  m("lucky_clover", "Lucky Clover", "🍀", 3, [1, 1, 3, 7, 5, 8, 3, 0], "nature", "casino"),
];

export const MATERIALS: Record<string, Material> = Object.fromEntries(LIST.map((x) => [x.id, x]));
export const getMat = (id: string): Material => MATERIALS[id] ?? LIST[0]!;
export const tierMult = (t: number) => Math.pow(2.25, t);

// ---------- village resources ----------
export const TREES: Record<string, { mat: string; lvl: number; icon: string; name: string }> = {
  T: { mat: "oak_log", lvl: 1, icon: "🌳", name: "Oak" },
  B: { mat: "birch_log", lvl: 4, icon: "🌲", name: "Birch" },
  I: { mat: "ironwood_log", lvl: 18, icon: "🌴", name: "Ironwood" },
  E: { mat: "elder_log", lvl: 40, icon: "🎄", name: "Elder Tree" },
};
export const ORES: [string, number, number][] = [
  ["stone", 1, 10], ["copper_ore", 1, 8], ["iron_ore", 8, 6], ["silver_ore", 20, 4],
  ["gold_ore", 32, 3], ["mithril_ore", 50, 2], ["adamant_ore", 72, 1],
];
export const FLOWERS: [string, number, number][] = [
  ["daisy", 1, 10], ["rose", 1, 7], ["bluebell", 6, 5], ["nightshade", 15, 3], ["moonpetal", 28, 2],
];
export const FLOWER_SEEDS: [string, number][] = [["wheat_seed", 3], ["carrot_seed", 3], ["herb_seed", 2], ["pumpkin_seed", 1]];
export const POND: [string, number, number][] = [["fish", 1, 10], ["shell", 1, 5], ["pearl", 15, 1], ["eel", 30, 1]];
export const ANIMALS: Record<string, { name: string; icon: string; drops: [string, number][] }> = {
  c: { name: "Chicken", icon: "🐔", drops: [["egg", 3], ["feather", 2]] },
  s: { name: "Sheep", icon: "🐑", drops: [["wool", 1]] },
  w: { name: "Cow", icon: "🐄", drops: [["milk", 2], ["hide", 1]] },
};
export const VEINS: string[] = ["iron_ore", "silver_ore", "mana_crystal", "gold_ore", "obsidian", "mithril_ore", "adamant_ore", "starmetal", "void_ore"];

// ---------- monsters ----------
export interface MonsterDef {
  id: string; name: string; icon: string; tier: number; weak: Element; element: Element; drops: string[];
  hp: number; atk: number; def: number; // archetype multipliers
  ability?: "heavy" | "drain" | "poison" | "shield" | "frenzy";
}
export const MONSTERS: MonsterDef[] = [
  { id: "slime", name: "Slime", icon: "🟢", tier: 0, weak: "fire", element: "water", drops: ["slime_gel"], hp: 1.1, atk: 0.8, def: 0.6 },
  { id: "rat", name: "Giant Rat", icon: "🐀", tier: 0, weak: "nature", element: "none", drops: ["rat_fang", "hide"], hp: 0.8, atk: 1.1, def: 0.8 },
  { id: "bat", name: "Cave Bat", icon: "🦇", tier: 0, weak: "light", element: "dark", drops: ["bat_wing"], hp: 0.7, atk: 1, def: 0.6, ability: "drain" },
  { id: "wolf", name: "Dire Wolf", icon: "🐺", tier: 1, weak: "fire", element: "nature", drops: ["wolf_pelt", "bone", "antler"], hp: 1, atk: 1.2, def: 0.9, ability: "frenzy" },
  { id: "goblin", name: "Goblin", icon: "👺", tier: 1, weak: "light", element: "earth", drops: ["goblin_tooth", "copper_ore"], hp: 0.9, atk: 1.1, def: 1 },
  { id: "spider", name: "Tomb Spider", icon: "🕷️", tier: 1, weak: "fire", element: "dark", drops: ["spider_silk", "venom_sac"], hp: 0.9, atk: 1, def: 0.8, ability: "poison" },
  { id: "skeleton", name: "Skeleton", icon: "💀", tier: 2, weak: "light", element: "dark", drops: ["bone", "cursed_bone"], hp: 0.9, atk: 1.1, def: 1.3 },
  { id: "orc", name: "Orc Brute", icon: "👹", tier: 2, weak: "water", element: "earth", drops: ["orc_tusk", "iron_ore"], hp: 1.3, atk: 1.3, def: 1, ability: "heavy" },
  { id: "troll", name: "Bog Troll", icon: "🧌", tier: 2, weak: "fire", element: "nature", drops: ["troll_blood"], hp: 1.6, atk: 1, def: 1 },
  { id: "wraith", name: "Wraith", icon: "👻", tier: 3, weak: "light", element: "dark", drops: ["wraith_essence"], hp: 0.9, atk: 1.2, def: 0.7, ability: "drain" },
  { id: "imp", name: "Fire Imp", icon: "😈", tier: 3, weak: "water", element: "fire", drops: ["fire_core"], hp: 0.8, atk: 1.4, def: 0.8 },
  { id: "frost", name: "Frost Wisp", icon: "❄️", tier: 3, weak: "fire", element: "water", drops: ["frost_shard"], hp: 0.9, atk: 1.2, def: 1.1 },
  { id: "golem", name: "Stone Golem", icon: "🗿", tier: 4, weak: "water", element: "earth", drops: ["golem_heart", "stone"], hp: 1.8, atk: 1, def: 1.8, ability: "shield" },
  { id: "harpy", name: "Harpy", icon: "🦅", tier: 4, weak: "earth", element: "wind", drops: ["harpy_plume"], hp: 0.9, atk: 1.3, def: 0.8, ability: "frenzy" },
  { id: "vampire", name: "Vampire", icon: "🧛", tier: 5, weak: "light", element: "dark", drops: ["vampire_fang"], hp: 1.1, atk: 1.3, def: 1, ability: "drain" },
  { id: "naga", name: "Naga", icon: "🐍", tier: 5, weak: "earth", element: "water", drops: ["naga_scale", "pearl"], hp: 1.2, atk: 1.2, def: 1.2, ability: "poison" },
  { id: "demon", name: "Demon", icon: "👿", tier: 6, weak: "light", element: "fire", drops: ["demon_horn"], hp: 1.2, atk: 1.5, def: 1, ability: "heavy" },
  { id: "wyvern", name: "Wyvern", icon: "🦎", tier: 6, weak: "earth", element: "wind", drops: ["wyvern_scale"], hp: 1.3, atk: 1.3, def: 1.3 },
  { id: "seraph", name: "Fallen Seraph", icon: "😇", tier: 7, weak: "dark", element: "light", drops: ["angel_feather"], hp: 1.1, atk: 1.4, def: 1.1, ability: "shield" },
  { id: "lich", name: "Lich", icon: "☠️", tier: 7, weak: "light", element: "dark", drops: ["lich_dust", "mana_crystal"], hp: 1, atk: 1.6, def: 0.9, ability: "drain" },
  { id: "dragon", name: "Elder Dragon", icon: "🐲", tier: 8, weak: "water", element: "fire", drops: ["dragon_scale"], hp: 1.6, atk: 1.5, def: 1.4, ability: "heavy" },
  { id: "phoenix", name: "Phoenix", icon: "🐦‍🔥", tier: 8, weak: "water", element: "fire", drops: ["phoenix_ash"], hp: 1.2, atk: 1.5, def: 1, ability: "frenzy" },
  { id: "titan", name: "Titan", icon: "🦣", tier: 9, weak: "wind", element: "earth", drops: ["titan_bone"], hp: 2, atk: 1.4, def: 1.6, ability: "heavy" },
  { id: "starspawn", name: "Star Spawn", icon: "🌟", tier: 9, weak: "void", element: "light", drops: ["star_shard"], hp: 1.2, atk: 1.6, def: 1.2 },
  { id: "horror", name: "Void Horror", icon: "👁️", tier: 10, weak: "light", element: "void", drops: ["abyss_eye", "void_ore"], hp: 1.5, atk: 1.7, def: 1.3, ability: "drain" },
  { id: "sovereign", name: "Eternal Warden", icon: "👑", tier: 10, weak: "void", element: "void", drops: ["eternity_core"], hp: 3, atk: 2, def: 2, ability: "heavy" },
];
export const ELITE_AFFIX = ["Savage", "Armored", "Vampiric", "Venomous", "Swift", "Colossal"];

// ---------- equipment ----------
export type Slot = "one_hand" | "two_hand" | "shield" | "helm" | "chest" | "shoulders" | "gloves" | "pants" | "boots" | "ring" | "charm";
export const SLOTS: Slot[] = ["one_hand", "two_hand", "shield", "helm", "chest", "shoulders", "gloves", "pants", "boots", "ring", "charm"];
export type StatKey = "hp" | "mp" | "sta" | "patk" | "matk" | "pdef" | "mdef" | "crit" | "critDmg" | "dodge" | "acc" | "spd" | "luck";
export const STAT_KEYS: StatKey[] = ["hp", "mp", "sta", "patk", "matk", "pdef", "mdef", "crit", "critDmg", "dodge", "acc", "spd", "luck"];
export const STAT_LABEL: Record<StatKey, string> = {
  hp: "Health", mp: "Mana", sta: "Stamina", patk: "P.Attack", matk: "M.Attack", pdef: "P.Defense", mdef: "M.Defense",
  crit: "Crit %", critDmg: "Crit Dmg %", dodge: "Dodge %", acc: "Accuracy %", spd: "Move Speed", luck: "Luck",
};
export const PCT_STATS: StatKey[] = ["crit", "critDmg", "dodge", "acc", "spd", "luck"];
export type Stats = Record<StatKey, number>;
export const zeroStats = (): Stats => Object.fromEntries(STAT_KEYS.map((k) => [k, 0])) as Stats;

// How each slot converts material properties into stats. Magnitude stats scale with tier; % stats don't.
export const SLOT_INFO: Record<Slot, { name: string; icon: string; nouns: string[]; w: Partial<Record<StatKey, number>> }> = {
  one_hand: { name: "One-Handed Weapon", icon: "🗡️", nouns: ["Blade", "Sabre", "Mace", "Wand", "Falchion"], w: { patk: 1, matk: 0.7, crit: 1, critDmg: 1, acc: 1 } },
  two_hand: { name: "Two-Handed Weapon", icon: "⚔️", nouns: ["Greatsword", "Warhammer", "Halberd", "Greatstaff", "Claymore"], w: { patk: 1.7, matk: 1.2, crit: 0.8, critDmg: 1.6, acc: 0.6 } },
  shield: { name: "Shield", icon: "🛡️", nouns: ["Buckler", "Kite Shield", "Tower Shield", "Aegis"], w: { pdef: 1.4, mdef: 0.9, hp: 0.6 } },
  helm: { name: "Helm", icon: "⛑️", nouns: ["Helm", "Coif", "Circlet", "Visor"], w: { pdef: 0.6, mdef: 0.8, mp: 1, acc: 0.6 } },
  chest: { name: "Chest", icon: "🦺", nouns: ["Cuirass", "Hauberk", "Robe", "Brigandine"], w: { pdef: 1.1, mdef: 0.8, hp: 1.4 } },
  shoulders: { name: "Shoulders", icon: "🎽", nouns: ["Pauldrons", "Spaulders", "Mantle"], w: { pdef: 0.6, mdef: 0.5, hp: 0.6, patk: 0.25 } },
  gloves: { name: "Gloves", icon: "🧤", nouns: ["Gauntlets", "Grips", "Handwraps"], w: { patk: 0.3, matk: 0.2, crit: 0.8, acc: 0.8, pdef: 0.3 } },
  pants: { name: "Pants", icon: "👖", nouns: ["Greaves", "Leggings", "Tassets"], w: { pdef: 0.8, mdef: 0.5, hp: 0.8, sta: 0.8 } },
  boots: { name: "Boots", icon: "🥾", nouns: ["Boots", "Sabatons", "Striders"], w: { pdef: 0.4, dodge: 1.2, spd: 1.4, sta: 0.6 } },
  ring: { name: "Ring", icon: "💍", nouns: ["Band", "Signet", "Loop"], w: { matk: 0.4, patk: 0.2, crit: 0.6, luck: 1.4, mp: 0.6 } },
  charm: { name: "Charm", icon: "🧿", nouns: ["Charm", "Amulet", "Talisman", "Sigil"], w: { mdef: 0.6, hp: 0.5, mp: 0.8, luck: 0.8, dodge: 0.5 } },
};

export const GRADES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Relic", "EX"];
export const GRADE_MULT = [1, 1.18, 1.4, 1.7, 2.05, 2.5, 3.05, 3.8];
// Hard gates per grade: [weighted avg tier, forge level, crafting skill]
export const GRADE_GATES: [number, number, number][] = [
  [0, 1, 0], [0.8, 1, 5], [1.8, 2, 15], [3, 3, 28], [4.5, 4, 42], [6, 5, 58], [7.2, 6, 72], [8.5, 7, 88],
];

// ---------- races ----------
export interface Race {
  id: string; name: string; icon: string; desc: string;
  mods: Partial<Record<StatKey, number>>;        // multiplicative (+0.1 = +10%)
  growth: Partial<Record<string, number>>;       // affinity growth multipliers
  passive: { name: string; desc: string };
  active: { id: string; name: string; desc: string };
}
export const RACES: Race[] = [
  { id: "human", name: "Human", icon: "🧑", desc: "Adaptable. Learns every skill a little faster.", mods: { luck: 0.1 }, growth: { all: 1.1 },
    passive: { name: "Versatile", desc: "+10% skill XP for every skill." }, active: { id: "rally", name: "Second Wind", desc: "Restore 30% stamina and 15% HP." } },
  { id: "elf", name: "Elf", icon: "🧝", desc: "Graceful and arcane; frail but precise.", mods: { hp: -0.1, matk: 0.15, acc: 0.1, dodge: 0.05 }, growth: { arcane: 1.3, nature: 1.3, wind: 1.2 },
    passive: { name: "Keen Senses", desc: "+20% item find rate." }, active: { id: "starshot", name: "Starfall Arrow", desc: "Light damage ×2.2 that never misses." } },
  { id: "dwarf", name: "Dwarf", icon: "🧔", desc: "Stout forge-masters of the deep.", mods: { hp: 0.15, pdef: 0.15, spd: -0.1 }, growth: { crafting: 1.35, earth: 1.3, shield: 1.2 },
    passive: { name: "Stonecunning", desc: "+25% mining yield, +1 forge grade roll." }, active: { id: "stoneskin", name: "Stoneskin", desc: "Halve damage for 3 turns." } },
  { id: "halfling", name: "Halfling", icon: "🧒", desc: "Small, lucky and impossible to pin down.", mods: { hp: -0.1, dodge: 0.1, luck: 0.3 }, growth: { culinary: 1.4, nature: 1.2, agility: 1.2 },
    passive: { name: "Lucky", desc: "Bonus luck; meals heal 20% more." }, active: { id: "slip", name: "Lucky Escape", desc: "Guaranteed escape from non-boss fights." } },
  { id: "gnome", name: "Gnome", icon: "🧙", desc: "Tinkerers who coax power from strange alloys.", mods: { matk: 0.1, mp: 0.2, hp: -0.05 }, growth: { crafting: 1.25, arcane: 1.25 },
    passive: { name: "Tinker", desc: "Enhancement success +8%." }, active: { id: "gadget", name: "Spark Gadget", desc: "Wind damage ×1.8 and stun 1 turn." } },
  { id: "orc", name: "Orc", icon: "👹", desc: "Brutal strength, little finesse.", mods: { patk: 0.2, hp: 0.1, matk: -0.15, acc: -0.05 }, growth: { might: 1.4, hunting: 1.2 },
    passive: { name: "Bloodlust", desc: "+15% damage below 50% HP." }, active: { id: "rampage", name: "Rampage", desc: "Physical ×2.5 hit, take 10% recoil." } },
  { id: "halforc", name: "Half-Orc", icon: "🧌", desc: "Endurance of orcs, wits of humans.", mods: { patk: 0.1, hp: 0.1, sta: 0.15 }, growth: { might: 1.2, sword: 1.2, hunting: 1.2 },
    passive: { name: "Relentless", desc: "Once per floor, survive a lethal blow at 1 HP." }, active: { id: "roar", name: "Savage Roar", desc: "Enemy ATK −25% for 3 turns." } },
  { id: "tiefling", name: "Tiefling", icon: "😈", desc: "Infernal heritage, fire in the veins.", mods: { matk: 0.15, mdef: 0.1, luck: 0.05 }, growth: { fire: 1.4, dark: 1.3 },
    passive: { name: "Hellish Resistance", desc: "−30% fire damage taken." }, active: { id: "hellfire", name: "Hellish Rebuke", desc: "Fire damage ×2.3, burns 3 turns." } },
  { id: "dragonborn", name: "Dragonborn", icon: "🐲", desc: "Scaled heirs of dragons.", mods: { patk: 0.1, matk: 0.1, pdef: 0.1, dodge: -0.05 }, growth: { fire: 1.2, might: 1.2, earth: 1.1 },
    passive: { name: "Draconic Scales", desc: "+10% P.Def and M.Def." }, active: { id: "breath", name: "Dragon Breath", desc: "Elemental damage ×2.6 from M.Attack." } },
  { id: "aasimar", name: "Aasimar", icon: "😇", desc: "Touched by the celestial.", mods: { mdef: 0.15, mp: 0.1, hp: 0.05 }, growth: { light: 1.4, shield: 1.2 },
    passive: { name: "Celestial Ward", desc: "−30% dark damage taken." }, active: { id: "radiance", name: "Healing Radiance", desc: "Heal 25% HP (once per fight)." } },
];
export const GENDERS = ["Male", "Female", "Non-binary"];
export interface Background { id: string; name: string; icon: string; desc: string; gold: number; inv: Record<string, number>; aff: Record<string, number> }
export const BACKGROUNDS: Background[] = [
  { id: "smith", name: "Smith's Apprentice", icon: "⚒️", desc: "Starts with ores and Crafting affinity.", gold: 60, inv: { copper_ore: 6, iron_ore: 2, stone: 4 }, aff: { crafting: 60 } },
  { id: "merc", name: "Wandering Mercenary", icon: "🗡️", desc: "Sword and Might affinity, extra gold.", gold: 150, inv: { rat_fang: 3, hide: 2 }, aff: { sword: 50, might: 30 } },
  { id: "farmhand", name: "Village Farmhand", icon: "🌾", desc: "Seeds aplenty, Nature & Culinary affinity.", gold: 50, inv: { wheat_seed: 6, carrot_seed: 5, herb_seed: 3, pumpkin_seed: 2 }, aff: { nature: 40, culinary: 40 } },
  { id: "hedge", name: "Hedge Wizard", icon: "🔮", desc: "Arcane affinity and a mana crystal.", gold: 70, inv: { mana_crystal: 1, bluebell: 3, daisy: 4 }, aff: { arcane: 70 } },
  { id: "scav", name: "Tower Scavenger", icon: "🎒", desc: "Agility & Hunting, monster scraps.", gold: 90, inv: { slime_gel: 4, bat_wing: 3, bone: 2 }, aff: { agility: 40, hunting: 40 } },
  { id: "noble", name: "Exiled Noble", icon: "👑", desc: "Lots of gold, Light affinity, nothing else.", gold: 400, inv: {}, aff: { light: 50 } },
];

// ---------- affinities (drive class evolution) ----------
export interface AffinityDef { id: string; name: string; icon: string; element?: Element; titles: string[]; active: { name: string; kind: "phys" | "mag" | "guard" | "heal" | "buff"; mult: number; cost: number; res: "mp" | "sta"; el?: Element } ; passive: Partial<Record<StatKey, number>> }
export const AFFINITIES: AffinityDef[] = [
  { id: "fire", name: "Fire", icon: "🔥", element: "fire", titles: ["Ember Initiate", "Pyromancer", "Flame Lord", "Inferno Sovereign"], active: { name: "Fireball", kind: "mag", mult: 1.8, cost: 12, res: "mp", el: "fire" }, passive: { matk: 0.06 } },
  { id: "water", name: "Water", icon: "💧", element: "water", titles: ["Tide Caller", "Hydromancer", "Wave Master", "Ocean Sovereign"], active: { name: "Tidal Lance", kind: "mag", mult: 1.6, cost: 10, res: "mp", el: "water" }, passive: { mdef: 0.06, mp: 0.05 } },
  { id: "wind", name: "Wind", icon: "🌪️", element: "wind", titles: ["Breeze Runner", "Aeromancer", "Storm Lord", "Tempest Sovereign"], active: { name: "Gale Blades", kind: "mag", mult: 1.5, cost: 9, res: "mp", el: "wind" }, passive: { dodge: 0.04, spd: 0.05 } },
  { id: "earth", name: "Earth", icon: "⛰️", element: "earth", titles: ["Stone Warden", "Geomancer", "Mountain Lord", "Terra Sovereign"], active: { name: "Quake", kind: "mag", mult: 1.7, cost: 12, res: "mp", el: "earth" }, passive: { pdef: 0.06, hp: 0.04 } },
  { id: "light", name: "Light", icon: "✨", element: "light", titles: ["Acolyte", "Cleric", "Lightbringer", "Seraphic Sovereign"], active: { name: "Holy Mend", kind: "heal", mult: 0.22, cost: 18, res: "mp", el: "light" }, passive: { mdef: 0.05, hp: 0.04 } },
  { id: "dark", name: "Darkness", icon: "🌑", element: "dark", titles: ["Shade", "Warlock", "Shadow Lord", "Abyssal Sovereign"], active: { name: "Soul Drain", kind: "mag", mult: 1.5, cost: 12, res: "mp", el: "dark" }, passive: { matk: 0.04, crit: 0.02 } },
  { id: "sword", name: "Sword", icon: "🗡️", titles: ["Sword Apprentice", "Swordsman", "Blade Master", "Sword Saint"], active: { name: "Power Slash", kind: "phys", mult: 1.9, cost: 14, res: "sta" }, passive: { patk: 0.06, crit: 0.02 } },
  { id: "might", name: "Might", icon: "💪", titles: ["Brawler", "Berserker", "Warlord", "Titan-Breaker"], active: { name: "Crushing Blow", kind: "phys", mult: 2.3, cost: 20, res: "sta" }, passive: { patk: 0.08, critDmg: 0.1 } },
  { id: "shield", name: "Shield", icon: "🛡️", titles: ["Shieldbearer", "Guardian", "Bulwark", "Aegis Eternal"], active: { name: "Shield Wall", kind: "guard", mult: 0.25, cost: 12, res: "sta" }, passive: { pdef: 0.08, hp: 0.05 } },
  { id: "agility", name: "Agility", icon: "👣", titles: ["Runner", "Scout", "Shadowstep", "Phantom"], active: { name: "Quickstrike", kind: "phys", mult: 1.4, cost: 8, res: "sta" }, passive: { dodge: 0.05, spd: 0.08 } },
  { id: "arcane", name: "Arcane", icon: "🔮", titles: ["Apprentice", "Mage", "Archmage", "Arcanum"], active: { name: "Arcane Bolt", kind: "mag", mult: 2, cost: 15, res: "mp" }, passive: { matk: 0.08, mp: 0.1 } },
  { id: "crafting", name: "Crafting", icon: "⚒️", titles: ["Tinkerer", "Artisan", "Master Smith", "Runeforger"], active: { name: "Field Repair", kind: "buff", mult: 0.2, cost: 10, res: "sta" }, passive: { pdef: 0.03, luck: 0.05 } },
  { id: "nature", name: "Nature", icon: "🍃", element: "nature", titles: ["Forager", "Druid", "Grove Keeper", "Worldroot"], active: { name: "Thornlash", kind: "mag", mult: 1.5, cost: 10, res: "mp", el: "nature" }, passive: { hp: 0.05, sta: 0.05 } },
  { id: "hunting", name: "Hunting", icon: "🏹", titles: ["Trapper", "Hunter", "Beastslayer", "Apex Predator"], active: { name: "Weakpoint Shot", kind: "phys", mult: 1.6, cost: 10, res: "sta" }, passive: { acc: 0.06, crit: 0.03 } },
  { id: "fortune", name: "Fortune", icon: "🎲", titles: ["Gambler", "High Roller", "Fortune's Favored", "Lady Luck's Chosen"], active: { name: "Lucky Strike", kind: "phys", mult: 1.7, cost: 10, res: "sta" }, passive: { luck: 0.1, crit: 0.03 } },
  { id: "culinary", name: "Culinary", icon: "🍳", titles: ["Kitchen Hand", "Chef", "Master Chef", "Gourmet Legend"], active: { name: "Hearty Snack", kind: "heal", mult: 0.12, cost: 14, res: "sta" }, passive: { hp: 0.04, sta: 0.08 } },
];
export const AFF_BY_ID: Record<string, AffinityDef> = Object.fromEntries(AFFINITIES.map((a) => [a.id, a]));

// ---------- skills (learned by use) ----------
export const SKILLS: Record<string, { name: string; icon: string; desc: string; aff: string }> = {
  mobility: { name: "Mobility", icon: "👣", desc: "Walking. +dodge & speed.", aff: "agility" },
  evasion: { name: "Evasion", icon: "💨", desc: "Dodging attacks.", aff: "agility" },
  defense: { name: "Defense", icon: "🛡️", desc: "Blocking & guarding.", aff: "shield" },
  endurance: { name: "Endurance", icon: "❤️", desc: "Taking hits. +max HP.", aff: "shield" },
  one_hand: { name: "One-Hand Mastery", icon: "🗡️", desc: "One-handed weapon attacks.", aff: "sword" },
  two_hand: { name: "Two-Hand Mastery", icon: "⚔️", desc: "Two-handed weapon attacks.", aff: "might" },
  unarmed: { name: "Brawling", icon: "👊", desc: "Fighting bare-handed.", aff: "might" },
  spellcasting: { name: "Spellcasting", icon: "🔮", desc: "Casting spells.", aff: "arcane" },
  hunting: { name: "Monster Hunting", icon: "🏹", desc: "Slaying monsters.", aff: "hunting" },
  woodcutting: { name: "Woodcutting", icon: "🪓", desc: "Chopping trees.", aff: "nature" },
  mining: { name: "Mining", icon: "⛏️", desc: "Mining ores.", aff: "earth" },
  herbalism: { name: "Herbalism", icon: "🌼", desc: "Picking flowers.", aff: "nature" },
  farming: { name: "Farming", icon: "🌱", desc: "Growing crops.", aff: "nature" },
  husbandry: { name: "Husbandry", icon: "🐑", desc: "Tending animals.", aff: "nature" },
  fishing: { name: "Fishing", icon: "🎣", desc: "Fishing.", aff: "water" },
  cooking: { name: "Cooking", icon: "🍳", desc: "Cooking meals.", aff: "culinary" },
  carving: { name: "Carving", icon: "🪚", desc: "Carving wood.", aff: "crafting" },
  smelting: { name: "Smelting", icon: "🔥", desc: "Smelting ingots.", aff: "crafting" },
  smithing: { name: "Smithing", icon: "⚒️", desc: "Crafting gear. Gates grades.", aff: "crafting" },
  enhancing: { name: "Enhancing", icon: "✨", desc: "Upgrading gear.", aff: "crafting" },
  trading: { name: "Trading", icon: "💰", desc: "Buying & selling. Better prices.", aff: "crafting" },
  gambling: { name: "Gambling", icon: "🎲", desc: "Casino games.", aff: "fortune" },
};

// ---------- village ----------
// # fence , path . grass | T B I E trees | R rock | F flower | W water | G plot | c s w animals | o decoration spot
// Buildings occupy 2x2 tiles: H home M market A forge J church Z magic tower V craftery N guild X casino D tower
// Gathering spots (2x2): L forest O mine P pond Y animal farm; G crop field plots
export const BUILDINGS: Record<string, { name: string; icon: string }> = {
  H: { name: "Home", icon: "🏠" }, M: { name: "Market", icon: "⚖️" }, A: { name: "Forge", icon: "⚒️" },
  J: { name: "Church", icon: "⛪" }, Z: { name: "Magic Tower", icon: "🔮" }, V: { name: "Craftery", icon: "🪤" },
  N: { name: "Adventurers Guild", icon: "🛡️" }, X: { name: "Casino", icon: "🎰" }, D: { name: "Tower", icon: "🗼" },
  L: { name: "Forest", icon: "🌲" }, O: { name: "Mine", icon: "⛏️" }, P: { name: "Pond", icon: "🎣" }, Y: { name: "Animal Farm", icon: "🐄" },
};
export const VILLAGE_MAP = [
  "####################",
  "#TBLL..HH..JJ..OOR.#",
  "#TTLL..HH..JJ..OORR#",
  "#T.,,,,,,,,,,,,,,,.#",
  "#..,MM.AA.ZZ.VV,F..#",
  "#F.,MM.AA.ZZ.VV,.F.#",
  "#...,,,,,,,,,,,,,,.#",
  "#GGG,.NN.XX.o..,YY.#",
  "#GGG,.NN.XX....,YYc#",
  "#GGG,,,,,,,,,,,,,.s#",
  "#WPP.F..o..DD.o,...#",
  "#WPP....F..DD..,.F.#",
  "#WW.,,,,,,,,,,,,,..#",
  "#.F...o.......,,...#",
  "####################",
];

export const ELEMENT_ICON: Record<Element, string> = {
  none: "", fire: "🔥", water: "💧", earth: "⛰️", wind: "🌪️", light: "✨", dark: "🌑", nature: "🍃", void: "🌀",
};

// ---------- achievements (data-driven thresholds over lifetime stats) ----------
export type Reward = { title?: string; gold?: number; mat?: [string, number]; deco?: string };
export interface AchDef { id: string; name: string; stat: string; tiers: number[]; rewards: Reward[]; cat: "combat" | "equipment" | "gathering" | "skill" | "lifetime" }
export const ACHIEVEMENTS: AchDef[] = [
  { id: "kills", name: "Monster Slayer", stat: "kills", cat: "combat", tiers: [10, 100, 1000, 10000], rewards: [{ gold: 50 }, { title: "Slayer", gold: 300 }, { title: "Exterminator", mat: ["warden_crest", 1] }, { title: "Death Incarnate", deco: "🗿" }] },
  { id: "bosses", name: "Guardian Breaker", stat: "bosses", cat: "combat", tiers: [1, 10, 50, 100], rewards: [{ gold: 100 }, { title: "Guardian Breaker", mat: ["guardian_sigil", 2] }, { deco: "🏆", mat: ["ancient_schematic", 1] }, { title: "Tower Bane", mat: ["eternity_core", 1] }] },
  { id: "highhit", name: "Heavy Hitter", stat: "highestHit", cat: "combat", tiers: [50, 500, 5000, 100000], rewards: [{ gold: 50 }, { title: "Heavy Hitter" }, { deco: "🪓" }, { title: "Worldsplitter" }] },
  { id: "streak", name: "Survivor", stat: "bestStreak", cat: "combat", tiers: [10, 50, 200], rewards: [{ gold: 80 }, { title: "Survivor" }, { title: "Undying", deco: "⛲" }] },
  { id: "crafted", name: "Maker", stat: "crafted", cat: "equipment", tiers: [1, 25, 150, 600], rewards: [{ gold: 30 }, { title: "Artisan" }, { mat: ["ancient_schematic", 1] }, { title: "Grand Artificer", deco: "⚱️" }] },
  { id: "legend", name: "Legend Forger", stat: "craftedLegendary", cat: "equipment", tiers: [1, 10], rewards: [{ title: "Legend Forger", gold: 500 }, { deco: "🗽" }] },
  { id: "relic", name: "Relic Keeper", stat: "craftedRelic", cat: "equipment", tiers: [1], rewards: [{ title: "Relic Keeper", mat: ["ancient_schematic", 1] }] },
  { id: "ex", name: "Beyond Grades", stat: "craftedEX", cat: "equipment", tiers: [1], rewards: [{ title: "The Transcendent", deco: "🌟" }] },
  { id: "upgrades", name: "Enhancer", stat: "upgrades", cat: "equipment", tiers: [10, 100, 500], rewards: [{ gold: 100 }, { title: "Enhancer" }, { deco: "🔨" }] },
  { id: "trees", name: "Lumberjack", stat: "treesCut", cat: "gathering", tiers: [25, 250, 2500], rewards: [{ gold: 40 }, { title: "Lumberjack" }, { deco: "🌲" }] },
  { id: "ores", name: "Prospector", stat: "oresMined", cat: "gathering", tiers: [25, 250, 2500], rewards: [{ gold: 40 }, { title: "Prospector" }, { deco: "💎" }] },
  { id: "plants", name: "Green Thumb", stat: "plantsHarvested", cat: "gathering", tiers: [25, 250, 2500], rewards: [{ gold: 40 }, { title: "Green Thumb" }, { deco: "🌻" }] },
  { id: "fish", name: "Angler", stat: "fishCaught", cat: "gathering", tiers: [20, 200, 2000], rewards: [{ gold: 40 }, { title: "Angler" }, { deco: "⛵" }] },
  { id: "animals", name: "Rancher", stat: "animalsTended", cat: "gathering", tiers: [20, 200, 2000], rewards: [{ gold: 40 }, { title: "Rancher" }, { deco: "🐎" }] },
  { id: "food", name: "Cook", stat: "foodCooked", cat: "gathering", tiers: [10, 100, 1000], rewards: [{ gold: 40 }, { title: "Chef" }, { deco: "🍰" }] },
  { id: "skills", name: "Polymath", stat: "skillsLearned", cat: "skill", tiers: [5, 12, 20], rewards: [{ gold: 60 }, { title: "Polymath" }, { title: "Savant", deco: "📚" }] },
  { id: "classes", name: "Many Paths", stat: "classesDiscovered", cat: "skill", tiers: [3, 10, 30], rewards: [{ gold: 80 }, { title: "Pathfinder" }, { title: "Thousand Faces", deco: "🎭" }] },
  { id: "floors", name: "Climber", stat: "maxFloor", cat: "lifetime", tiers: [10, 50, 100, 300, 500, 1000], rewards: [{ gold: 100 }, { title: "Climber" }, { title: "Centurion", mat: ["ancient_schematic", 1] }, { title: "Skybreaker" }, { title: "Halfway to Heaven" }, { title: "Tower Conqueror", deco: "👑" }] },
  { id: "earned", name: "Wealthy", stat: "goldEarned", cat: "lifetime", tiers: [1000, 25000, 1000000], rewards: [{ gold: 50 }, { title: "Merchant Prince" }, { title: "Golden", deco: "💰" }] },
];
