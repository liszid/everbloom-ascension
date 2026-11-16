// Bestiary: every monster with its creature family and the dungeon themes it naturally lives in — pure data.
// The original MONSTERS keep their ids (saves, captured companions, art); D&D additions are appended here.
import { MONSTERS, type MonsterCategory, type MonsterDef } from "./data";

/** Home themes and families for the original monsters (names must match themes.ts). */
const NATIVE: Record<string, [MonsterCategory, string[]]> = {
  slime: ["ooze", ["Sunken Temple", "Forgotten Dwarven City", "Goblin Warren"]],
  rat: ["beast", ["Goblin Warren", "Forgotten Dwarven City", "Haunted Cemetery"]],
  bat: ["beast", ["Vampire Castle", "Haunted Cemetery", "Frozen Ice Cavern"]],
  wolf: ["beast", ["Goblin Warren", "Feywild Grove", "Frozen Ice Cavern"]],
  goblin: ["humanoid", ["Goblin Warren"]],
  spider: ["beast", ["Spider Temple", "Ancient Jungle Temple"]],
  skeleton: ["undead", ["Haunted Cemetery", "Necromancer's Crypt", "Vampire Castle"]],
  orc: ["humanoid", ["Goblin Warren", "Forgotten Dwarven City"]],
  troll: ["giant", ["Ancient Jungle Temple", "Feywild Grove", "Frozen Ice Cavern"]],
  wraith: ["undead", ["Haunted Cemetery", "Necromancer's Crypt", "Vampire Castle"]],
  imp: ["fiend", ["Infernal Fortress", "Abandoned Wizard Tower"]],
  frost: ["elemental", ["Frozen Ice Cavern"]],
  golem: ["construct", ["Forgotten Dwarven City", "Abandoned Wizard Tower"]],
  harpy: ["monstrosity", ["Abandoned Wizard Tower", "Ancient Jungle Temple", "Frozen Ice Cavern"]],
  vampire: ["undead", ["Vampire Castle"]],
  naga: ["monstrosity", ["Sunken Temple", "Aboleth Ruins", "Spider Temple"]],
  demon: ["fiend", ["Infernal Fortress"]],
  wyvern: ["dragon", ["Dragon's Lair", "Ancient Jungle Temple", "Frozen Ice Cavern"]],
  seraph: ["celestial", ["Vampire Castle", "Abandoned Wizard Tower", "Spider Temple"]],
  lich: ["undead", ["Necromancer's Crypt", "Abandoned Wizard Tower", "Haunted Cemetery"]],
  dragon: ["dragon", ["Dragon's Lair", "Infernal Fortress"]],
  phoenix: ["elemental", ["Infernal Fortress", "Dragon's Lair", "Feywild Grove"]],
  titan: ["giant", ["Forgotten Dwarven City", "Frozen Ice Cavern", "Aboleth Ruins"]],
  starspawn: ["aberration", ["Mind Flayer Hive", "Aboleth Ruins", "Abandoned Wizard Tower"]],
  horror: ["aberration", ["Mind Flayer Hive", "Aboleth Ruins", "Spider Temple"]],
  sovereign: ["construct", []], // the floor-1000 Eternal Warden never spawns as a native
};
const ORIGINAL_MAGIC = new Set(["bat", "wraith", "imp", "frost", "lich", "seraph", "phoenix", "starspawn", "horror", "naga"]);

/** 92 D&D monsters (Goblin, Orc, Skeleton, Vampire, Wolf, Harpy, Wyvern and Lich reuse the originals above). */
export const DND_MONSTERS: MonsterDef[] = [
  { id: "hobgoblin", name: "Hobgoblin", icon: "🧌", tier: 2, cat: "humanoid", envs: ["Goblin Warren", "Forgotten Dwarven City"], weak: "water", element: "earth", drops: ["iron_ore", "bone"], hp: 1.2, atk: 1.25, def: 1.3, ability: "shield" },
  { id: "bugbear", name: "Bugbear", icon: "👹", tier: 2, cat: "humanoid", envs: ["Goblin Warren"], weak: "fire", element: "earth", drops: ["hide", "iron_ore"], hp: 1.35, atk: 1.4, def: 1, ability: "heavy" },
  { id: "kobold", name: "Kobold", icon: "🦎", tier: 0, cat: "humanoid", envs: ["Goblin Warren", "Dragon's Lair"], weak: "water", element: "fire", drops: ["copper_ore", "hide"], hp: 0.75, atk: 1.05, def: 0.7 },
  { id: "bandit", name: "Bandit", icon: "🗡️", tier: 0, cat: "humanoid", envs: ["Goblin Warren", "Ancient Jungle Temple"], weak: "dark", element: "none", drops: ["hide", "copper_ore"], hp: 0.9, atk: 1.1, def: 0.9 },
  { id: "cultist", name: "Occult Cultist", icon: "🧙", tier: 1, cat: "humanoid", envs: ["Necromancer's Crypt", "Abandoned Wizard Tower", "Mind Flayer Hive"], weak: "light", element: "dark", drops: ["mana_crystal", "cursed_bone"], hp: 0.85, atk: 1.2, def: 0.8, magical: true },
  { id: "zombie", name: "Zombie", icon: "🧟", tier: 1, cat: "undead", envs: ["Haunted Cemetery", "Necromancer's Crypt"], weak: "fire", element: "earth", drops: ["cursed_bone", "hide"], hp: 1.4, atk: 0.9, def: 0.8 },
  { id: "ghoul", name: "Ghoul", icon: "🧟‍♂️", tier: 2, cat: "undead", envs: ["Haunted Cemetery", "Necromancer's Crypt"], weak: "light", element: "dark", drops: ["cursed_bone"], hp: 1.1, atk: 1.25, def: 0.9, ability: "poison" },
  { id: "ghast", name: "Ghast", icon: "🧟‍♀️", tier: 3, cat: "undead", envs: ["Haunted Cemetery", "Necromancer's Crypt"], weak: "light", element: "dark", drops: ["cursed_bone", "wraith_essence"], hp: 1.2, atk: 1.35, def: 1, ability: "poison" },
  { id: "wight", name: "Wight", icon: "⚔️", tier: 3, cat: "undead", envs: ["Haunted Cemetery", "Vampire Castle", "Necromancer's Crypt"], weak: "light", element: "dark", drops: ["iron_ore", "cursed_bone"], hp: 1.3, atk: 1.3, def: 1.2, ability: "drain" },
  { id: "specter", name: "Specter", icon: "👻", tier: 2, cat: "undead", envs: ["Haunted Cemetery", "Abandoned Wizard Tower"], weak: "light", element: "dark", drops: ["wraith_essence"], hp: 0.8, atk: 1.3, def: 0.7, ability: "drain", magical: true },
  { id: "shadow", name: "Shadow", icon: "👤", tier: 2, cat: "undead", envs: ["Haunted Cemetery", "Necromancer's Crypt"], weak: "light", element: "dark", drops: ["wraith_essence"], hp: 0.75, atk: 1.35, def: 0.6, ability: "drain" },
  { id: "ghost", name: "Ghost", icon: "🌫️", tier: 3, cat: "undead", envs: ["Haunted Cemetery", "Vampire Castle"], weak: "light", element: "dark", drops: ["wraith_essence"], hp: 0.9, atk: 1.2, def: 0.7, ability: "drain", magical: true },
  { id: "banshee", name: "Banshee", icon: "👰", tier: 4, cat: "undead", envs: ["Haunted Cemetery", "Feywild Grove"], weak: "light", element: "wind", drops: ["wraith_essence", "silver_ore"], hp: 1, atk: 1.5, def: 0.8, magical: true },
  { id: "vampire_spawn", name: "Vampire Spawn", icon: "🧛‍♂️", tier: 4, cat: "undead", envs: ["Vampire Castle"], weak: "light", element: "dark", drops: ["vampire_fang"], hp: 1.15, atk: 1.3, def: 1, ability: "drain" },
  { id: "werewolf", name: "Werewolf", icon: "🐺", tier: 3, cat: "humanoid", envs: ["Vampire Castle", "Feywild Grove"], weak: "light", element: "nature", drops: ["wolf_pelt", "hide"], hp: 1.3, atk: 1.4, def: 1, ability: "frenzy" },
  { id: "wererat", name: "Wererat", icon: "🐀", tier: 2, cat: "humanoid", envs: ["Goblin Warren", "Forgotten Dwarven City"], weak: "light", element: "dark", drops: ["rat_fang", "hide"], hp: 1, atk: 1.2, def: 0.9, ability: "poison" },
  { id: "werebear", name: "Werebear", icon: "🐻", tier: 4, cat: "humanoid", envs: ["Frozen Ice Cavern", "Feywild Grove"], weak: "fire", element: "earth", drops: ["hide", "bone"], hp: 1.6, atk: 1.45, def: 1.3, ability: "heavy" },
  { id: "dire_wolf", name: "Dire Wolf", icon: "🐺", tier: 1, cat: "beast", envs: ["Goblin Warren", "Haunted Cemetery"], weak: "fire", element: "nature", drops: ["wolf_pelt", "bone"], hp: 1.1, atk: 1.25, def: 0.9, ability: "frenzy" },
  { id: "worg", name: "Worg", icon: "👹", tier: 2, cat: "monstrosity", envs: ["Goblin Warren"], weak: "fire", element: "dark", drops: ["wolf_pelt", "bone"], hp: 1.2, atk: 1.3, def: 1, ability: "frenzy" },
  { id: "giant_rat", name: "Giant Rat", icon: "🐀", tier: 0, cat: "beast", envs: ["Goblin Warren", "Forgotten Dwarven City"], weak: "nature", element: "none", drops: ["rat_fang", "hide"], hp: 0.8, atk: 1.05, def: 0.7 },
  { id: "giant_spider", name: "Giant Spider", icon: "🕷️", tier: 1, cat: "beast", envs: ["Spider Temple", "Goblin Warren"], weak: "fire", element: "dark", drops: ["spider_silk", "venom_sac"], hp: 0.95, atk: 1.2, def: 0.8, ability: "poison" },
  { id: "swarm_rats", name: "Swarm of Rats", icon: "🐀", tier: 0, cat: "beast", envs: ["Goblin Warren", "Necromancer's Crypt"], weak: "fire", element: "none", drops: ["rat_fang"], hp: 0.8, atk: 1.1, def: 0.6, ability: "frenzy" },
  { id: "swarm_bats", name: "Swarm of Bats", icon: "🦇", tier: 0, cat: "beast", envs: ["Vampire Castle", "Haunted Cemetery"], weak: "light", element: "dark", drops: ["bat_wing"], hp: 0.75, atk: 1, def: 0.6, ability: "drain" },
  { id: "swarm_insects", name: "Swarm of Insects", icon: "🪲", tier: 0, cat: "beast", envs: ["Spider Temple", "Ancient Jungle Temple"], weak: "fire", element: "nature", drops: ["venom_sac"], hp: 0.8, atk: 1.1, def: 0.6, ability: "poison" },
  { id: "owlbear", name: "Owlbear", icon: "🦉", tier: 3, cat: "monstrosity", envs: ["Feywild Grove", "Ancient Jungle Temple"], weak: "fire", element: "nature", drops: ["hide", "feather", "bone"], hp: 1.45, atk: 1.4, def: 1.1, ability: "heavy" },
  { id: "brown_bear", name: "Brown Bear", icon: "🐻", tier: 1, cat: "beast", envs: ["Feywild Grove", "Ancient Jungle Temple"], weak: "fire", element: "nature", drops: ["hide", "bone"], hp: 1.3, atk: 1.2, def: 1, ability: "heavy" },
  { id: "black_bear", name: "Black Bear", icon: "🐻", tier: 1, cat: "beast", envs: ["Feywild Grove"], weak: "fire", element: "nature", drops: ["hide"], hp: 1.15, atk: 1.15, def: 0.9 },
  { id: "boar", name: "Wild Boar", icon: "🐗", tier: 0, cat: "beast", envs: ["Ancient Jungle Temple", "Feywild Grove"], weak: "nature", element: "earth", drops: ["hide", "bone"], hp: 1, atk: 1.1, def: 0.9 },
  { id: "giant_boar", name: "Giant Boar", icon: "🐗", tier: 2, cat: "beast", envs: ["Ancient Jungle Temple"], weak: "fire", element: "earth", drops: ["hide", "bone"], hp: 1.35, atk: 1.3, def: 1, ability: "heavy" },
  { id: "giant_eagle", name: "Giant Eagle", icon: "🦅", tier: 2, cat: "beast", envs: ["Feywild Grove", "Abandoned Wizard Tower"], weak: "earth", element: "wind", drops: ["feather"], hp: 1, atk: 1.3, def: 0.85, ability: "frenzy" },
  { id: "griffin", name: "Griffin", icon: "🦅", tier: 3, cat: "monstrosity", envs: ["Abandoned Wizard Tower", "Feywild Grove"], weak: "earth", element: "wind", drops: ["feather", "gold_ore"], hp: 1.3, atk: 1.35, def: 1 },
  { id: "hippogriff", name: "Hippogriff", icon: "🐎", tier: 2, cat: "monstrosity", envs: ["Abandoned Wizard Tower", "Feywild Grove"], weak: "earth", element: "wind", drops: ["feather"], hp: 1.15, atk: 1.2, def: 0.9 },
  { id: "pegasus", name: "Pegasus", icon: "🦄", tier: 3, cat: "fey", envs: ["Feywild Grove"], weak: "dark", element: "light", drops: ["feather", "harpy_plume"], hp: 1.2, atk: 1.25, def: 1, magical: true },
  { id: "cockatrice", name: "Cockatrice", icon: "🐓", tier: 2, cat: "monstrosity", envs: ["Ancient Jungle Temple", "Feywild Grove"], weak: "fire", element: "earth", drops: ["feather", "stone"], hp: 0.8, atk: 1.35, def: 0.8, ability: "poison" },
  { id: "basilisk", name: "Basilisk", icon: "🦎", tier: 3, cat: "monstrosity", envs: ["Ancient Jungle Temple", "Forgotten Dwarven City"], weak: "water", element: "earth", drops: ["stone", "venom_sac"], hp: 1.3, atk: 1.3, def: 1.3, ability: "shield" },
  { id: "medusa", name: "Medusa", icon: "🐍", tier: 5, cat: "monstrosity", envs: ["Ancient Jungle Temple", "Spider Temple"], weak: "light", element: "earth", drops: ["stone", "venom_sac", "gold_ore"], hp: 1.2, atk: 1.45, def: 1.1, ability: "poison" },
  { id: "minotaur", name: "Minotaur", icon: "🐂", tier: 3, cat: "monstrosity", envs: ["Forgotten Dwarven City", "Goblin Warren"], weak: "water", element: "earth", drops: ["bone", "iron_ore"], hp: 1.5, atk: 1.4, def: 1.15, ability: "heavy" },
  { id: "centaur", name: "Centaur", icon: "🏹", tier: 2, cat: "monstrosity", envs: ["Feywild Grove"], weak: "fire", element: "nature", drops: ["oak_log", "bone"], hp: 1.2, atk: 1.3, def: 1 },
  { id: "satyr", name: "Satyr", icon: "🐐", tier: 1, cat: "fey", envs: ["Feywild Grove"], weak: "fire", element: "nature", drops: ["oak_log", "antler"], hp: 0.95, atk: 1.1, def: 0.9, magical: true },
  { id: "dryad", name: "Dryad", icon: "🌸", tier: 2, cat: "fey", envs: ["Feywild Grove"], weak: "fire", element: "nature", drops: ["oak_log", "mana_crystal"], hp: 1, atk: 1.2, def: 0.95, magical: true },
  { id: "treant", name: "Treant", icon: "🌳", tier: 6, cat: "fey", envs: ["Feywild Grove"], weak: "fire", element: "nature", drops: ["oak_log", "ironwood_log"], hp: 2.1, atk: 1.4, def: 1.6, ability: "heavy" },
  { id: "animated_armor", name: "Animated Armor", icon: "🛡️", tier: 2, cat: "construct", envs: ["Abandoned Wizard Tower", "Forgotten Dwarven City", "Vampire Castle"], weak: "water", element: "earth", drops: ["iron_ore"], hp: 1.25, atk: 1.15, def: 1.6, ability: "shield" },
  { id: "flying_sword", name: "Flying Sword", icon: "🗡️", tier: 1, cat: "construct", envs: ["Abandoned Wizard Tower", "Vampire Castle"], weak: "fire", element: "wind", drops: ["copper_ore", "iron_ore"], hp: 0.75, atk: 1.35, def: 1.2 },
  { id: "rug_of_smothering", name: "Rug of Smothering", icon: "🧣", tier: 2, cat: "construct", envs: ["Abandoned Wizard Tower", "Vampire Castle"], weak: "fire", element: "dark", drops: ["wool"], hp: 1.1, atk: 1.2, def: 0.9, ability: "shield" },
  { id: "mimic", name: "Mimic", icon: "📦", tier: 3, cat: "monstrosity", envs: ["Abandoned Wizard Tower", "Forgotten Dwarven City", "Dragon's Lair"], weak: "light", element: "dark", drops: ["gold_ore", "slime_gel"], hp: 1.4, atk: 1.35, def: 1.2, ability: "heavy" },
  { id: "gelatinous_cube", name: "Gelatinous Cube", icon: "🟩", tier: 2, cat: "ooze", envs: ["Necromancer's Crypt", "Abandoned Wizard Tower"], weak: "fire", element: "water", drops: ["slime_gel"], hp: 1.8, atk: 1.1, def: 0.6, ability: "poison" },
  { id: "ochre_jelly", name: "Ochre Jelly", icon: "🟡", tier: 2, cat: "ooze", envs: ["Forgotten Dwarven City", "Goblin Warren"], weak: "water", element: "earth", drops: ["slime_gel"], hp: 1.5, atk: 1.15, def: 0.7 },
  { id: "black_pudding", name: "Black Pudding", icon: "⬛", tier: 4, cat: "ooze", envs: ["Necromancer's Crypt", "Aboleth Ruins"], weak: "fire", element: "dark", drops: ["slime_gel", "cursed_bone"], hp: 1.9, atk: 1.35, def: 0.65, ability: "poison" },
  { id: "gray_ooze", name: "Gray Ooze", icon: "🔘", tier: 1, cat: "ooze", envs: ["Forgotten Dwarven City", "Sunken Temple"], weak: "fire", element: "earth", drops: ["slime_gel"], hp: 1.3, atk: 1.1, def: 0.7 },
  { id: "rust_monster", name: "Rust Monster", icon: "🦗", tier: 2, cat: "monstrosity", envs: ["Forgotten Dwarven City", "Goblin Warren"], weak: "nature", element: "earth", drops: ["iron_ore"], hp: 1.1, atk: 1.2, def: 1.25 },
  { id: "carrion_crawler", name: "Carrion Crawler", icon: "🐛", tier: 2, cat: "monstrosity", envs: ["Spider Temple", "Necromancer's Crypt"], weak: "fire", element: "dark", drops: ["venom_sac", "bone"], hp: 1.3, atk: 1.2, def: 1, ability: "poison" },
  { id: "ankheg", name: "Ankheg", icon: "🦂", tier: 2, cat: "monstrosity", envs: ["Goblin Warren", "Ancient Jungle Temple"], weak: "water", element: "earth", drops: ["chitin", "acid_gland"], hp: 1.25, atk: 1.25, def: 1.3, ability: "poison" },
  { id: "bulette", name: "Bulette", icon: "🦏", tier: 4, cat: "monstrosity", envs: ["Forgotten Dwarven City", "Ancient Jungle Temple"], weak: "wind", element: "earth", drops: ["bone", "stone"], hp: 1.7, atk: 1.45, def: 1.45, ability: "heavy" },
  { id: "umber_hulk", name: "Umber Hulk", icon: "🪲", tier: 5, cat: "monstrosity", envs: ["Forgotten Dwarven City", "Mind Flayer Hive"], weak: "water", element: "earth", drops: ["chitin", "stone"], hp: 1.6, atk: 1.45, def: 1.5, ability: "heavy" },
  { id: "ettercap", name: "Ettercap", icon: "🕷️", tier: 2, cat: "monstrosity", envs: ["Spider Temple"], weak: "fire", element: "nature", drops: ["spider_silk", "venom_sac"], hp: 1.1, atk: 1.2, def: 0.95, ability: "poison" },
  { id: "displacer_beast", name: "Displacer Beast", icon: "🐆", tier: 3, cat: "monstrosity", envs: ["Feywild Grove", "Mind Flayer Hive"], weak: "light", element: "dark", drops: ["hide"], hp: 1.25, atk: 1.35, def: 1, ability: "frenzy" },
  { id: "blink_dog", name: "Blink Dog", icon: "🐕", tier: 1, cat: "fey", envs: ["Feywild Grove"], weak: "dark", element: "light", drops: ["hide"], hp: 0.85, atk: 1.15, def: 0.8 },
  { id: "hell_hound", name: "Hell Hound", icon: "🐕‍🦺", tier: 3, cat: "fiend", envs: ["Infernal Fortress"], weak: "water", element: "fire", drops: ["fire_core", "bone"], hp: 1.2, atk: 1.35, def: 1, ability: "frenzy" },
  { id: "winter_wolf", name: "Winter Wolf", icon: "🐺", tier: 3, cat: "monstrosity", envs: ["Frozen Ice Cavern"], weak: "fire", element: "water", drops: ["frost_shard", "wolf_pelt"], hp: 1.3, atk: 1.3, def: 1.1 },
  { id: "manticore", name: "Manticore", icon: "🦁", tier: 4, cat: "monstrosity", envs: ["Dragon's Lair", "Abandoned Wizard Tower"], weak: "earth", element: "wind", drops: ["lion_mane", "venom_sac"], hp: 1.35, atk: 1.4, def: 1, ability: "poison" },
  { id: "chimera", name: "Chimera", icon: "🐐", tier: 5, cat: "monstrosity", envs: ["Dragon's Lair", "Abandoned Wizard Tower"], weak: "water", element: "fire", drops: ["fire_core", "wyvern_scale"], hp: 1.5, atk: 1.5, def: 1.2, ability: "frenzy" },
  { id: "hydra", name: "Hydra", icon: "🐉", tier: 6, cat: "monstrosity", envs: ["Sunken Temple", "Ancient Jungle Temple"], weak: "fire", element: "water", drops: ["naga_scale", "hydra_heart"], hp: 1.9, atk: 1.45, def: 1.2, ability: "frenzy" },
  { id: "remorhaz", name: "Remorhaz", icon: "🐛", tier: 6, cat: "monstrosity", envs: ["Frozen Ice Cavern"], weak: "water", element: "fire", drops: ["frost_shard", "fire_core"], hp: 1.8, atk: 1.55, def: 1.35, ability: "heavy" },
  { id: "young_red_dragon", name: "Young Red Dragon", icon: "🐲", tier: 5, cat: "dragon", envs: ["Dragon's Lair"], weak: "water", element: "fire", drops: ["wyvern_scale", "fire_core"], hp: 1.6, atk: 1.5, def: 1.35, ability: "heavy" },
  { id: "adult_red_dragon", name: "Adult Red Dragon", icon: "🐲", tier: 8, cat: "dragon", envs: ["Dragon's Lair"], weak: "water", element: "fire", drops: ["dragon_scale", "fire_core", "gold_ore"], hp: 2.2, atk: 1.8, def: 1.6, ability: "heavy" },
  { id: "ancient_red_dragon", name: "Ancient Red Dragon", icon: "🐲", tier: 9, cat: "dragon", envs: ["Dragon's Lair"], weak: "water", element: "fire", drops: ["dragon_scale", "star_shard", "gold_ore"], hp: 2.8, atk: 2, def: 1.8, ability: "heavy" },
  { id: "young_blue_dragon", name: "Young Blue Dragon", icon: "🐉", tier: 5, cat: "dragon", envs: ["Dragon's Lair", "Abandoned Wizard Tower"], weak: "earth", element: "wind", drops: ["wyvern_scale", "mana_crystal"], hp: 1.55, atk: 1.5, def: 1.3 },
  { id: "green_dragon", name: "Adult Green Dragon", icon: "🐉", tier: 7, cat: "dragon", envs: ["Ancient Jungle Temple", "Feywild Grove"], weak: "fire", element: "nature", drops: ["dragon_scale", "venom_sac"], hp: 2, atk: 1.65, def: 1.5, ability: "poison" },
  { id: "black_dragon", name: "Adult Black Dragon", icon: "🐉", tier: 7, cat: "dragon", envs: ["Sunken Temple", "Necromancer's Crypt"], weak: "light", element: "dark", drops: ["dragon_scale", "cursed_bone"], hp: 1.9, atk: 1.7, def: 1.5, ability: "drain" },
  { id: "white_dragon", name: "Adult White Dragon", icon: "🐉", tier: 7, cat: "dragon", envs: ["Frozen Ice Cavern"], weak: "fire", element: "water", drops: ["dragon_scale", "frost_shard"], hp: 2.1, atk: 1.6, def: 1.5, ability: "frenzy" },
  { id: "copper_dragon", name: "Copper Dragon", icon: "🐉", tier: 6, cat: "dragon", envs: ["Dragon's Lair", "Forgotten Dwarven City"], weak: "water", element: "earth", drops: ["copper_ore", "wyvern_scale"], hp: 1.8, atk: 1.5, def: 1.5 },
  { id: "silver_dragon", name: "Silver Dragon", icon: "🐉", tier: 8, cat: "dragon", envs: ["Frozen Ice Cavern", "Abandoned Wizard Tower"], weak: "fire", element: "light", drops: ["silver_ore", "dragon_scale"], hp: 2.3, atk: 1.7, def: 1.7, ability: "shield" },
  { id: "gold_dragon", name: "Gold Dragon", icon: "🐉", tier: 9, cat: "dragon", envs: ["Dragon's Lair", "Abandoned Wizard Tower"], weak: "dark", element: "light", drops: ["gold_ore", "dragon_scale", "star_shard"], hp: 2.6, atk: 1.9, def: 1.8, ability: "shield" },
  { id: "demilich", name: "Demilich", icon: "💀", tier: 9, cat: "undead", envs: ["Necromancer's Crypt"], weak: "light", element: "void", drops: ["lich_dust", "void_ore"], hp: 1.2, atk: 2, def: 1.8, ability: "drain", magical: true },
  { id: "beholder", name: "Beholder", icon: "👁️", tier: 7, cat: "aberration", envs: ["Mind Flayer Hive", "Abandoned Wizard Tower"], weak: "light", element: "void", drops: ["lich_dust", "mana_crystal"], hp: 1.7, atk: 1.9, def: 1.4, magical: true },
  { id: "death_tyrant", name: "Death Tyrant", icon: "💀", tier: 8, cat: "undead", envs: ["Mind Flayer Hive", "Necromancer's Crypt"], weak: "light", element: "dark", drops: ["lich_dust", "cursed_bone"], hp: 1.8, atk: 2, def: 1.45, ability: "drain", magical: true },
  { id: "mind_flayer", name: "Mind Flayer", icon: "🦑", tier: 6, cat: "aberration", envs: ["Mind Flayer Hive", "Aboleth Ruins"], weak: "light", element: "dark", drops: ["lich_dust", "mana_crystal"], hp: 1.3, atk: 1.7, def: 1.15, ability: "drain", magical: true },
  { id: "intellect_devourer", name: "Intellect Devourer", icon: "🧠", tier: 3, cat: "aberration", envs: ["Mind Flayer Hive"], weak: "light", element: "dark", drops: ["wraith_essence"], hp: 0.9, atk: 1.4, def: 0.85, ability: "drain" },
  { id: "aboleth", name: "Aboleth", icon: "🐟", tier: 8, cat: "aberration", envs: ["Aboleth Ruins", "Sunken Temple"], weak: "light", element: "water", drops: ["lich_dust", "pearl", "mana_crystal"], hp: 2.2, atk: 1.8, def: 1.5, ability: "drain", magical: true },
  { id: "kraken", name: "Kraken", icon: "🐙", tier: 9, cat: "monstrosity", envs: ["Sunken Temple", "Aboleth Ruins"], weak: "wind", element: "water", drops: ["pearl", "star_shard"], hp: 2.9, atk: 1.95, def: 1.7, ability: "heavy" },
  { id: "sahuagin", name: "Sahuagin Hunter", icon: "🧜‍♂️", tier: 2, cat: "humanoid", envs: ["Sunken Temple"], weak: "fire", element: "water", drops: ["shell", "pearl"], hp: 1.05, atk: 1.25, def: 0.95, ability: "frenzy" },
  { id: "merrow", name: "Merrow Reaver", icon: "🧜", tier: 3, cat: "monstrosity", envs: ["Sunken Temple"], weak: "fire", element: "water", drops: ["shell", "bone"], hp: 1.3, atk: 1.3, def: 1.1 },
  { id: "yuan_ti_pureblood", name: "Yuan-ti Pureblood", icon: "🐍", tier: 2, cat: "humanoid", envs: ["Ancient Jungle Temple"], weak: "light", element: "nature", drops: ["venom_sac", "hide"], hp: 1, atk: 1.25, def: 1, ability: "poison" },
  { id: "yuan_ti_malison", name: "Yuan-ti Malison", icon: "🐍", tier: 4, cat: "monstrosity", envs: ["Ancient Jungle Temple"], weak: "light", element: "nature", drops: ["venom_sac", "naga_scale"], hp: 1.3, atk: 1.4, def: 1.15, ability: "poison" },
  { id: "devil_imp", name: "Imp", icon: "😈", tier: 2, cat: "fiend", envs: ["Infernal Fortress", "Abandoned Wizard Tower"], weak: "water", element: "fire", drops: ["fire_core"], hp: 0.8, atk: 1.3, def: 0.8, ability: "poison", magical: true },
  { id: "barbed_devil", name: "Barbed Devil", icon: "👹", tier: 4, cat: "fiend", envs: ["Infernal Fortress"], weak: "water", element: "fire", drops: ["fire_core"], hp: 1.4, atk: 1.4, def: 1.3 },
  { id: "pit_fiend", name: "Pit Fiend", icon: "👿", tier: 9, cat: "fiend", envs: ["Infernal Fortress"], weak: "light", element: "fire", drops: ["fire_core", "demon_horn", "star_shard"], hp: 2.7, atk: 2, def: 1.8, ability: "heavy" },
  { id: "quasit", name: "Quasit", icon: "👺", tier: 2, cat: "fiend", envs: ["Infernal Fortress"], weak: "light", element: "dark", drops: ["fire_core"], hp: 0.8, atk: 1.25, def: 0.75, ability: "poison" },
  { id: "vrock", name: "Vrock", icon: "🦅", tier: 5, cat: "fiend", envs: ["Infernal Fortress"], weak: "light", element: "dark", drops: ["feather", "demon_horn"], hp: 1.5, atk: 1.45, def: 1.2, ability: "poison" },
  { id: "hezrou", name: "Hezrou", icon: "🧌", tier: 6, cat: "fiend", envs: ["Infernal Fortress"], weak: "light", element: "earth", drops: ["demon_horn", "slime_gel"], hp: 1.7, atk: 1.5, def: 1.35, ability: "heavy" },
  { id: "balor", name: "Balor", icon: "🔥", tier: 9, cat: "fiend", envs: ["Infernal Fortress"], weak: "water", element: "fire", drops: ["fire_core", "demon_horn", "star_shard"], hp: 2.8, atk: 2, def: 1.7, ability: "frenzy" },
  { id: "tarrasque", name: "The Tarrasque", icon: "🦖", tier: 10, cat: "monstrosity", envs: ["Forgotten Dwarven City", "Infernal Fortress", "Aboleth Ruins"], weak: "void", element: "earth", drops: ["titan_bone", "star_shard", "void_ore"], hp: 3, atk: 2, def: 2, ability: "heavy" },
];

export const BESTIARY: MonsterDef[] = [
  ...MONSTERS.map((m) => ({ ...m, cat: NATIVE[m.id]?.[0], envs: NATIVE[m.id]?.[1] ?? [], magical: ORIGINAL_MAGIC.has(m.id) })),
  ...DND_MONSTERS.map((m) => ({ ...m, magical: m.magical ?? (m.cat === "undead" || m.cat === "aberration" || m.cat === "fiend" || m.cat === "fey") })),
];
export const MON_DEF: Record<string, MonsterDef> = Object.fromEntries(BESTIARY.map((m) => [m.id, m]));
export const monDef = (id: string): MonsterDef | undefined => MON_DEF[id];
export const isUndead = (id: string) => MON_DEF[id]?.cat === "undead";

/**
 * Monsters native to a theme for a floor tier: natives of tier t or t−1 first, then natives up to 3 tiers weaker.
 * Empty when the theme has no suitable natives (callers fall back to the global tier pool).
 */
export function themePool(theme: string, tier: number): MonsterDef[] {
  const natives = BESTIARY.filter((m) => m.id !== "sovereign" && m.envs?.includes(theme));
  const near = natives.filter((m) => m.tier === tier || m.tier === tier - 1);
  if (near.length) return near;
  return natives.filter((m) => m.tier <= tier && m.tier >= tier - 3);
}
