// Town look by the hero's race family — pure data. Game.tsx adds the theme class; styles.css draws each mood.
export type TownTheme = "citadel" | "undead" | "sylvan" | "celestial" | "infernal" | "forge" | "tide" | "arcane";
export const TOWN_THEMES: Record<TownTheme, { name: string; icon: string; desc: string }> = {
  citadel: { name: "Thornvale", icon: "🏰", desc: "A bright, busy human market town." },
  undead: { name: "Gravemoor", icon: "🪦", desc: "Withered grass, cold fog and soulfire lanterns." },
  sylvan: { name: "Leafhollow", icon: "🌿", desc: "Lush moss, fireflies and living wood." },
  celestial: { name: "Dawnspire", icon: "✨", desc: "Sun-washed marble and drifting motes of light." },
  infernal: { name: "Cinderhold", icon: "🔥", desc: "Ash-dusted ground, glowing embers and a red sky." },
  forge: { name: "Ironhearth", icon: "⚒️", desc: "Granite, soot and the warm glow of furnaces." },
  tide: { name: "Saltmere", icon: "🌊", desc: "Sea mist, wet stone and rippling light." },
  arcane: { name: "Starhaven", icon: "🔮", desc: "Violet dusk and floating arcane sparks." },
};
const BY_RACE: Record<string, TownTheme> = {
  vampire: "undead", ghost: "undead", lich: "undead", zombie: "undead", ghoul: "undead", arch_lich: "undead",
  elf: "sylvan", halfling: "sylvan", werewolf: "sylvan", fey: "sylvan", firbolg: "sylvan", dryad: "sylvan", satyr: "sylvan", shifter: "sylvan", tabaxi: "sylvan", centaur: "sylvan",
  aasimar: "celestial", angel: "celestial", valkyrie: "celestial", aarakocra: "celestial", githzerai: "celestial",
  tiefling: "infernal", dragonborn: "infernal", dragonkin: "infernal", archdemon: "infernal", scale_lord: "infernal", drow: "infernal", yuan_ti: "infernal", githyanki: "infernal",
  dwarf: "forge", gnome: "forge", orc: "forge", halforc: "forge", colossus: "forge", goliath: "forge", warforged: "forge", minotaur: "forge", hobgoblin: "forge", orc_god: "forge",
  abyssal: "tide", triton: "tide", sahuagin: "tide", tortle: "tide",
  archmage: "arcane", transmuter: "arcane", djinn: "arcane", chronoborn: "arcane", mind_flayer: "arcane", kenku: "arcane", changeling: "arcane",
};
export const townThemeOf = (race: string): TownTheme => BY_RACE[race] ?? "citadel";
