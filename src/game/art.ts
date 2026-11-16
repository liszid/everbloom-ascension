// Cartoon icon lookup for map items; gameplay keeps emoji ids, art is presentation only.
const ICONS = import.meta.glob("../assets/art/i_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const icon = (id: string): string | undefined => ICONS[`../assets/art/i_${id}.webp`];

const DECO: Record<string, string> = {
  "🗿": "moai", "🏆": "trophy", "🪓": "axe", "⛲": "fountain", "⚱️": "urn", "🗽": "liberty", "🌟": "star", "🔨": "hammer",
  "🌲": "pine", "💎": "diamond", "🌻": "sunflower", "⛵": "boat", "🐎": "horse", "🍰": "cake", "📚": "books", "🎭": "masks",
  "👑": "crown", "💰": "moneybag",
};
export const decoArt = (emoji: string) => (DECO[emoji] ? icon(DECO[emoji]!) : undefined);

const OBJ = import.meta.glob("../assets/art/o_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const objArt = (id: string): string | undefined => OBJ[`../assets/art/o_${id}.webp`];
const SCENES = import.meta.glob("../assets/art/s_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const sceneArt = (id: string): string | undefined => SCENES[`../assets/art/s_${id}.webp`];
const EMOJI_ART: Record<string, () => string | undefined> = {
  "🌲": () => icon("pine"), "🌳": () => objArt("T"), "🪨": () => objArt("R"), "💎": () => icon("diamond"), "🌾": () => icon("wheat"),
  "🐄": () => objArt("w"), "🐔": () => objArt("c"), "🐑": () => objArt("s"), "🌻": () => icon("sunflower"), "🌼": () => objArt("F"),
  "🪓": () => icon("axe"), "⛏️": () => icon("hammer"), "🐟": () => icon("fish"),
};
export const emojiArt = (e: string) => EMOJI_ART[e]?.();
const DUN = import.meta.glob("../assets/art/d_*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const dungeonArt = (i: number, wall: boolean) => DUN[`../assets/art/d_${i}${wall ? "_w" : ""}.webp`];
Object.assign(EMOJI_ART, { "🎣": () => icon("rod"), "🧺": () => icon("basket"), "🪷": () => icon("lotus"), "🌷": () => icon("tulip"), "🌸": () => icon("blossom") });

/** Bestiary monsters without their own artwork borrow the closest original look (tinted per monster). */
export const MONSTER_LOOK: Record<string, string> = { hobgoblin: "orc", bugbear: "troll", kobold: "goblin", bandit: "goblin", cultist: "lich", zombie: "skeleton", ghoul: "skeleton", ghast: "skeleton", wight: "skeleton", specter: "wraith", shadow: "wraith", ghost: "wraith", banshee: "wraith", vampire_spawn: "vampire", werewolf: "wolf", wererat: "rat", werebear: "troll", dire_wolf: "wolf", worg: "wolf", giant_rat: "rat", giant_spider: "spider", swarm_rats: "rat", swarm_bats: "bat", swarm_insects: "spider", owlbear: "troll", brown_bear: "troll", black_bear: "troll", boar: "troll", giant_boar: "troll", giant_eagle: "harpy", griffin: "harpy", hippogriff: "harpy", pegasus: "seraph", cockatrice: "harpy", basilisk: "naga", medusa: "naga", minotaur: "orc", centaur: "orc", satyr: "goblin", dryad: "seraph", treant: "troll", animated_armor: "golem", flying_sword: "golem", rug_of_smothering: "golem", mimic: "golem", gelatinous_cube: "slime", ochre_jelly: "slime", black_pudding: "slime", gray_ooze: "slime", rust_monster: "spider", carrion_crawler: "spider", ankheg: "spider", bulette: "troll", umber_hulk: "spider", ettercap: "spider", displacer_beast: "wolf", blink_dog: "wolf", hell_hound: "wolf", winter_wolf: "wolf", manticore: "demon", chimera: "dragon", hydra: "naga", remorhaz: "naga", young_red_dragon: "dragon", adult_red_dragon: "dragon", ancient_red_dragon: "dragon", young_blue_dragon: "dragon", green_dragon: "dragon", black_dragon: "dragon", white_dragon: "dragon", copper_dragon: "dragon", silver_dragon: "dragon", gold_dragon: "dragon", demilich: "lich", beholder: "horror", death_tyrant: "horror", mind_flayer: "horror", intellect_devourer: "horror", aboleth: "naga", kraken: "naga", sahuagin: "naga", merrow: "naga", yuan_ti_pureblood: "naga", yuan_ti_malison: "naga", devil_imp: "imp", barbed_devil: "demon", pit_fiend: "demon", quasit: "imp", vrock: "harpy", hezrou: "troll", balor: "demon", tarrasque: "titan" };
export function monsterLook(kind: string): { base: string; hue: number } {
  const base = MONSTER_LOOK[kind]; if (!base) return { base: kind, hue: 0 };
  let h = 0; for (const ch of kind) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return { base, hue: (h % 9 - 4) * 22 || 30 };
}
