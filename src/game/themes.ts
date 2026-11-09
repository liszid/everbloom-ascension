// Dungeon floor themes: pure data, rotating every THEME_SPAN floors. Art lookup lives in art.ts.
export const THEME_SPAN = 6;
export const THEMES = [
  { name: "Vampire Castle", icon: "🧛", desc: "A gothic fortress beneath a blood-red moon, full of decaying nobility and hidden menace." },
  { name: "Haunted Cemetery", icon: "🪦", desc: "Crooked tombstones in rolling fog, dead trees and whispers on the cold wind." },
  { name: "Dragon's Lair", icon: "🐉", desc: "A cavern glittering with treasure, scorched rock and massive claw marks." },
  { name: "Forgotten Dwarven City", icon: "⚒️", desc: "Rune-carved halls, broken bridges and silent forges deep beneath the mountains." },
  { name: "Spider Temple", icon: "🕷️", desc: "Web-smothered corridors where cocoons sway and unseen things skitter." },
  { name: "Sunken Temple", icon: "🌊", desc: "Marble ruins beneath shimmering water, hidden behind coral and seaweed." },
  { name: "Infernal Fortress", icon: "🔥", desc: "An iron citadel above rivers of lava, choked with smoke and ash." },
  { name: "Abandoned Wizard Tower", icon: "🔮", desc: "Twisting stairs, floating books and glowing sigils where reality is unstable." },
  { name: "Feywild Grove", icon: "🍄", desc: "Luminous flowers and giant mushrooms; every path shifts when unwatched." },
  { name: "Mind Flayer Hive", icon: "🧠", desc: "Pulsing organic tunnels in eerie violet light, echoing with psychic whispers." },
  { name: "Necromancer's Crypt", icon: "💀", desc: "Cold vaults lit by ghostly green flames, bones and half-finished rituals." },
  { name: "Aboleth Ruins", icon: "👁️", desc: "Cyclopean structures rising from black water, something ancient watching below." },
  { name: "Goblin Warren", icon: "👺", desc: "Cramped tunnels of damp earth, crude traps and smoky campfires." },
  { name: "Ancient Jungle Temple", icon: "🌿", desc: "A temple swallowed by roots and vines, moss-covered statues and hidden chambers." },
  { name: "Frozen Ice Cavern", icon: "🧊", desc: "Crystal walls of pale blue light and endless echoes in the bitter cold." },
] as const;
export const themeIndex = (floor: number) => Math.floor((Math.max(1, floor) - 1) / THEME_SPAN) % THEMES.length;
export const themeFor = (floor: number) => THEMES[themeIndex(floor)]!;
