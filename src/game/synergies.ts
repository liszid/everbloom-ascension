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
];
export const evaluateSynergies = (b: BuildInput) => SYNERGIES.filter((x) => x.check(b));
