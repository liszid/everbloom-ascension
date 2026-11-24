// Build synergies: race + class + title + weapon archetype + off-hand + specialization combinations — pure data.
// engine.activeSynergies builds the input; playerStats applies mods and per-element damage bonuses.
import type { Element, StatKey } from "./data";

export interface BuildInput {
  race: string; className: string; triad?: string | undefined; title?: string | undefined;
  arch?: string | undefined; offhand: "shield" | "torch" | "ranged" | "none"; spec?: string | undefined;
}
export interface Synergy {
  id: string; name: string; icon: string; desc: string; hint: string;
  check: (b: BuildInput) => boolean;
  /** +0.1 = +10%; crit/dodge/acc 0.05 = +5 points. */ mods: Partial<Record<StatKey, number>>;
  /** Extra damage share for hits of this element. */ el?: { el: Element; bonus: number } | undefined;
}
const inR = (b: BuildInput, ...ids: string[]) => ids.includes(b.race);
const cls = (b: BuildInput, re: RegExp) => re.test(b.className);
const ttl = (b: BuildInput, ...t: string[]) => !!b.title && t.includes(b.title);

export const SYNERGIES: Synergy[] = [
  { id: "sanguine_dynasty", name: "Sanguine Dynasty", icon: "🩸", desc: "Blood answers blood: stronger strikes and dark damage.", hint: "Vampire, Ghoul or Lich + a blood title, blood class or a scythe",
    check: (b) => inR(b, "vampire", "ghoul", "lich", "arch_lich") && (ttl(b, "Sanguine Lord", "Blood Drinker") || cls(b, /blood|hemo|sanguine|crimson/i) || b.arch === "scythe"),
    mods: { patk: 0.12, matk: 0.12, crit: 0.06, critDmg: 0.2 }, el: { el: "dark", bonus: 0.25 } },
  { id: "crusade", name: "Crusade of Radiance", icon: "✨", desc: "Consecrated arms: tougher wards and searing light.", hint: "Seraph, Aasimar, Valkyrie or the Faith path + a holy title, sword or staff",
    check: (b) => (inR(b, "angel", "aasimar", "valkyrie") || b.spec === "faith") && (ttl(b, "Pope", "Apostle of Light", "Devout") || b.arch === "sword" || b.arch === "staff"),
    mods: { mdef: 0.18, pdef: 0.1, matk: 0.15, hp: 0.1 }, el: { el: "light", bonus: 0.3 } },
  { id: "phantom_stalker", name: "Phantom Stalker", icon: "🏹", desc: "Silent, piercing, lethal.", hint: "Deadeye path or a hunter/assassin class + a marksman title, ranged off-hand or dagger",
    check: (b) => (b.spec === "ranged" || cls(b, /sniper|marksman|hunter|assassin|stalker|ranger|archer/i)) && (ttl(b, "Phantom Sniper", "Marksman") || b.offhand === "ranged" || b.arch === "dagger"),
    mods: { acc: 0.15, crit: 0.1, critDmg: 0.35, dodge: 0.08 } },
  { id: "caldera", name: "Caldera Sovereign", icon: "🔥", desc: "The flame burns so hot every blow ignites.", hint: "A fire-blooded race, Ember path or fire class + a torch or fire title",
    check: (b) => (inR(b, "dragonkin", "archdemon", "tiefling", "dragonborn", "scale_lord") || b.spec === "fire" || cls(b, /pyro|flame|fire|inferno|cinder|magma|ember|solar/i)) && (b.offhand === "torch" || ttl(b, "Pyrekeeper", "Torchbearer")),
    mods: { patk: 0.1, matk: 0.2, hp: 0.08 }, el: { el: "fire", bonus: 0.35 } },
  { id: "bastion_peaks", name: "Bastion of the Peaks", icon: "🛡️", desc: "An immovable mountain with a crushing swing.", hint: "Dwarf, Colossus, Goliath, Warforged or Tortle + hammer or axe + shield",
    check: (b) => inR(b, "dwarf", "colossus", "goliath", "warforged", "tortle") && (b.arch === "hammer" || b.arch === "axe") && b.offhand === "shield",
    mods: { pdef: 0.25, mdef: 0.15, hp: 0.25, sta: 0.2 }, el: { el: "earth", bonus: 0.2 } },
  { id: "high_roller", name: "High Roller's Gambit", icon: "🎲", desc: "Probability bends your way.", hint: "A fortune title + the Gambler path or a fortune class",
    check: (b) => ttl(b, "Loaded Dice", "Lucky Streak", "Golden", "Merchant Prince") && (b.spec === "fortune" || cls(b, /gambl|roller|fortune|lucky|fate|dice/i)),
    mods: { luck: 0.5, crit: 0.12, critDmg: 0.4, dodge: 0.1 } },
  { id: "grovekeeper", name: "Primordial Grovekeeper", icon: "🌿", desc: "The wild mends you and lashes your foes.", hint: "Elf, Fey, Dryad, Firbolg or Satyr + staff, scythe or a nature class",
    check: (b) => inR(b, "elf", "fey", "dryad", "firbolg", "satyr") && (b.arch === "staff" || b.arch === "scythe" || cls(b, /druid|grove|wild|nature|root|forager|verdant|bramble/i)),
    mods: { hp: 0.15, mp: 0.2, matk: 0.15 }, el: { el: "nature", bonus: 0.3 } },
  { id: "magnum_opus", name: "Master of the Great Work", icon: "⚗️", desc: "Reagents react with perfect precision.", hint: "An alchemist title + the Transmuter path, Grand Transmuter race or an alchemist class",
    check: (b) => ttl(b, "Grand Alchemist", "Brewer") && (b.spec === "alchemy" || inR(b, "transmuter") || cls(b, /alchem|chemist|brew|transmut|chymist/i)),
    mods: { matk: 0.12, mp: 0.18, luck: 0.25, hp: 0.08 } },
  { id: "moon_pack", name: "Moonlit Pack", icon: "🌕", desc: "The beast within runs with the pack.", hint: "Werewolf, Shifter or Tabaxi + a beast or shapeshifter class",
    check: (b) => inR(b, "werewolf", "shifter", "tabaxi") && cls(b, /beast|shapeshift|druid|predator|wild|feral|skinchanger|ravager/i),
    mods: { patk: 0.15, spd: 0.1, hp: 0.1, crit: 0.05 } },
  { id: "abyssal_tide", name: "Abyssal Tide", icon: "🌊", desc: "The deep surges through every strike.", hint: "Abyssal Siren, Triton or Sahuagin + a water class or a spear",
    check: (b) => inR(b, "abyssal", "triton", "sahuagin") && (cls(b, /tide|aqua|hydro|sea|harpoon|abyss|kraken|ocean|wave/i) || b.arch === "spear"),
    mods: { matk: 0.12, patk: 0.12, hp: 0.1 }, el: { el: "water", bonus: 0.25 } },
  { id: "undying_legion", name: "Undying Legion", icon: "💀", desc: "Death itself marches at your side.", hint: "Lich, Arch-Lich, Zombie or Ghost + a necromancy class",
    check: (b) => inR(b, "lich", "arch_lich", "zombie", "ghost") && cls(b, /necro|death knight|reaper|legion|rot|grave|bone/i),
    mods: { matk: 0.18, hp: 0.12, mdef: 0.12 }, el: { el: "dark", bonus: 0.2 } },
  { id: "storm_herald", name: "Storm Herald", icon: "⛈️", desc: "Wind and lightning obey your call.", hint: "Djinn, Aarakocra or Valkyrie + a storm or wind class",
    check: (b) => inR(b, "djinn", "aarakocra", "valkyrie") && cls(b, /storm|tempest|gale|wind|lightning|thunder|sky|zephyr|aero/i),
    mods: { spd: 0.12, matk: 0.12, dodge: 0.06 }, el: { el: "wind", bonus: 0.25 } },
  // ---- every remaining race gets its own combo ----
  { id: "folk_hero", name: "Folk Hero", icon: "🧑‍🌾", desc: "Ordinary folk, extraordinary resolve.", hint: "Human or Halfling + a chosen specialization + any title",
    check: (b) => inR(b, "human", "halfling") && !!b.spec && !!b.title, mods: { hp: 0.1, luck: 0.2, crit: 0.04, sta: 0.1 } },
  { id: "tinker_genius", name: "Tinker Genius", icon: "⚙️", desc: "Gadgets click into place mid-fight.", hint: "Gnome or Warforged + a crafting class or a ranged off-hand",
    check: (b) => inR(b, "gnome", "warforged") && (cls(b, /forge|smith|artific|rune|tinker|engineer|craft/i) || b.offhand === "ranged"), mods: { matk: 0.12, acc: 0.08, crit: 0.05, pdef: 0.08 } },
  { id: "warband", name: "Warband Fury", icon: "🪓", desc: "The war drums never stop.", hint: "Orc, Half-Orc, Orc War-God or Hobgoblin + axe or hammer",
    check: (b) => inR(b, "orc", "halforc", "orc_god", "hobgoblin") && (b.arch === "axe" || b.arch === "hammer"), mods: { patk: 0.18, hp: 0.12, critDmg: 0.2 } },
  { id: "arcane_supremacy", name: "Arcane Supremacy", icon: "🌌", desc: "Mind over matter, always.", hint: "Archmage, Chronoborn or Mind Flayer + a staff or caster class",
    check: (b) => inR(b, "archmage", "chronoborn", "mind_flayer") && (b.arch === "staff" || cls(b, /mage|magus|arcan|sorcer|wizard|psion|chrono|evoker|sage/i)), mods: { matk: 0.22, mp: 0.2, mdef: 0.08 } },
  { id: "astral_gish", name: "Astral Gish", icon: "🗡️", desc: "Silver blade and psychic edge as one.", hint: "Githyanki or Githzerai + a sword, or the Duelist / Arcane path",
    check: (b) => inR(b, "githyanki", "githzerai") && (b.arch === "sword" || b.spec === "duelist" || b.spec === "spellblade"), mods: { patk: 0.12, matk: 0.12, dodge: 0.06, acc: 0.06 } },
  { id: "serpent_cult", name: "Serpent Cult", icon: "🐍", desc: "Venom in the shadows.", hint: "Yuan-Ti or Drow + a dagger or a shadow/poison class",
    check: (b) => inR(b, "yuan_ti", "drow") && (b.arch === "dagger" || cls(b, /shadow|venom|poison|plague|assassin|night|dark/i)), mods: { crit: 0.08, critDmg: 0.25, dodge: 0.06 }, el: { el: "dark", bonus: 0.2 } },
  { id: "trickster", name: "Trickster's Gambit", icon: "🎭", desc: "Now you see them, now you don't.", hint: "Kenku or Changeling + a dagger or ranged off-hand",
    check: (b) => inR(b, "kenku", "changeling") && (b.arch === "dagger" || b.offhand === "ranged"), mods: { dodge: 0.1, luck: 0.2, crit: 0.06 } },
  { id: "stampede", name: "Stampede", icon: "🐂", desc: "Nothing stops the charge.", hint: "Centaur or Minotaur + a spear or axe",
    check: (b) => inR(b, "centaur", "minotaur") && (b.arch === "spear" || b.arch === "axe"), mods: { patk: 0.16, spd: 0.1, hp: 0.1 } },
  // ---- open to every race: class + equipment + specialization ----
  { id: "iron_wall", name: "Iron Wall", icon: "🧱", desc: "A guardian who never yields ground.", hint: "Any race: a tank class + shield + hammer or sword",
    check: (b) => cls(b, /guard|warden|knight|bastion|templar|sentinel|paladin|juggernaut|aegis|bulwark/i) && b.offhand === "shield" && (b.arch === "hammer" || b.arch === "sword"), mods: { pdef: 0.2, mdef: 0.12, hp: 0.15 } },
  { id: "beast_lord", name: "Beast Lord", icon: "🐺", desc: "Your monsters fight harder beside you.", hint: "Any race: the Beast Tamer path + a beast, hunter or druid class",
    check: (b) => b.spec === "tamer" && cls(b, /beast|tame|druid|ranger|hunter|stalker|wild/i), mods: { hp: 0.12, patk: 0.12, luck: 0.12 } },
  { id: "artisan_soul", name: "Artisan's Soul", icon: "🔨", desc: "Self-made gear fits like a second skin.", hint: "Any race: the Anvil path + a crafting class",
    check: (b) => b.spec === "smith" && cls(b, /forge|smith|artific|rune|craft|tinker/i), mods: { pdef: 0.15, patk: 0.1, crit: 0.04 } },
  { id: "harvest_heart", name: "Heart of the Harvest", icon: "🌻", desc: "The land feeds those who tend it.", hint: "Any race: the Harvest, Herdkeeper or Hearth path + a nature or culinary class",
    check: (b) => (b.spec === "farmer" || b.spec === "rancher" || b.spec === "chef") && cls(b, /nature|druid|grove|wild|chef|cook|feast|herb|verdant|harvest/i), mods: { hp: 0.18, sta: 0.2, mp: 0.08 } },
  { id: "deep_delver", name: "Deep Delver", icon: "⛰️", desc: "Stone-hard swings from the deep shafts.", hint: "Any race: the Deep Delvers path + a hammer or axe",
    check: (b) => b.spec === "miner" && (b.arch === "hammer" || b.arch === "axe"), mods: { patk: 0.12, pdef: 0.15 }, el: { el: "earth", bonus: 0.2 } },
  { id: "duel_master", name: "Duel Master", icon: "🤺", desc: "Every opening punished.", hint: "Any race: the Duelist path + a sword or dagger",
    check: (b) => b.spec === "duelist" && (b.arch === "sword" || b.arch === "dagger"), mods: { crit: 0.08, critDmg: 0.3, acc: 0.06 } },
  { id: "arcane_conduit", name: "Arcane Conduit", icon: "🪄", desc: "Your staff is a lightning rod for mana.", hint: "Any race: the Arcane path + a staff",
    check: (b) => b.spec === "spellblade" && b.arch === "staff", mods: { matk: 0.18, mp: 0.2 } },
];
export const evaluateSynergies = (b: BuildInput) => SYNERGIES.filter((x) => x.check(b));
