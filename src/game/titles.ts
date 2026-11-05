// Title kits: every title belongs to a theme. Stars (rarity) decide how many of the theme's
// 5 skills are unlocked (3-5) and how strong they are. Stars grow while the title is equipped.
import type { StatKey, Element } from "./data";

export type TitleEffect = "burn" | "lifesteal" | "regen" | "guard" | "pierce" | "haste" | "holy" | "bleed" | "manaflow";
export type TitleSkill =
  | { type: "passive"; name: string; desc: string; mods?: Partial<Record<StatKey, number>> | undefined; effects?: Partial<Record<TitleEffect, number>> | undefined }
  | { type: "active"; name: string; desc: string; kind: "phys" | "mag" | "heal" | "guard" | "lock"; mult: number; cost: number; res: "mp" | "sta"; el?: Element | undefined };

const P = (name: string, desc: string, mods?: Partial<Record<StatKey, number>>, effects?: Partial<Record<TitleEffect, number>>): TitleSkill => ({ type: "passive", name, desc, mods, effects });
const A = (name: string, desc: string, kind: "phys" | "mag" | "heal" | "guard" | "lock", mult: number, cost: number, res: "mp" | "sta", el?: Element): TitleSkill => ({ type: "active", name, desc, kind, mult, cost, res, el });

export const TITLE_THEMES: Record<string, TitleSkill[]> = {
  undying: [
    P("Restoration", "Regenerate HP every turn.", undefined, { regen: 4 }),
    P("Iron Constitution", "Extra max HP.", { hp: 0.15 }),
    A("Second Breath", "Restore a chunk of HP.", "heal", 0.3, 20, "mp"),
    A("Deathless Ward", "Your HP cannot drop for a few turns.", "lock", 2, 30, "sta"),
    P("Last Stand", "Tougher defenses.", { pdef: 0.1, mdef: 0.1 }),
  ],
  slayer: [
    P("Killer Instinct", "Higher crit chance.", { crit: 0.04 }),
    P("Executioner's Edge", "Higher crit damage.", { critDmg: 0.2 }),
    A("Reaping Strike", "A brutal physical blow.", "phys", 2.2, 16, "sta"),
    P("Bloodletting", "Heal from damage dealt.", undefined, { lifesteal: 5 }),
    P("Butcher", "Physical attack up.", { patk: 0.08 }),
  ],
  climber: [
    P("Sure Footing", "Dodge up.", { dodge: 0.03 }),
    P("Altitude Lungs", "Stamina up.", { sta: 0.15 }),
    A("Skyward Strike", "A leaping strike.", "phys", 2.0, 14, "sta"),
    A("Summit Guard", "Brace and greatly reduce damage.", "guard", 1, 12, "sta"),
    P("Peak Form", "All-round power.", { hp: 0.08, patk: 0.05, matk: 0.05 }),
  ],
  bane: [
    P("Giant Killer", "Ignore part of enemy defense.", undefined, { pierce: 10 }),
    P("Warden's Bane", "Physical attack up.", { patk: 0.08 }),
    A("Sunder", "Crushing armor-breaking blow.", "phys", 2.4, 20, "sta"),
    A("Defiance", "Your HP cannot drop for a few turns.", "lock", 2, 35, "sta"),
    P("Relentless Hunt", "Accuracy up.", { acc: 0.06 }),
  ],
  artisan: [
    P("Tempered Body", "Physical defense up.", { pdef: 0.1 }),
    P("Steady Hands", "Accuracy up.", { acc: 0.05 }),
    A("Hammer Blow", "A smith's heavy swing.", "phys", 1.9, 14, "sta"),
    A("Riveted Plating", "Brace and greatly reduce damage.", "guard", 1, 12, "sta"),
    P("Masterwork Aura", "Luck and health up.", { luck: 0.1, hp: 0.05 }),
  ],
  nature: [
    P("Hearty", "Max HP up.", { hp: 0.1 }),
    P("Nourished", "Regenerate HP every turn.", undefined, { regen: 3 }),
    A("Thorn Burst", "Nature magic damage.", "mag", 1.8, 12, "mp", "nature"),
    A("Herbal Poultice", "Restore HP.", "heal", 0.25, 18, "mp"),
    P("Bountiful", "Stamina and luck up.", { sta: 0.1, luck: 0.05 }),
  ],
  fortune: [
    P("Lucky Star", "Luck up.", { luck: 0.2 }),
    P("Fortune's Edge", "Crit chance up.", { crit: 0.04 }),
    A("Coin Toss", "A risky, heavy strike.", "phys", 2.1, 14, "sta"),
    A("Gilded Ward", "Brace and greatly reduce damage.", "guard", 1, 12, "sta"),
    P("Jackpot", "Crit damage up.", { critDmg: 0.25 }),
  ],
  sage: [
    P("Wide Mind", "Mana up.", { mp: 0.15 }),
    P("Arcane Insight", "Magic attack up.", { matk: 0.08 }),
    A("Mind Lance", "Pure arcane damage.", "mag", 2.0, 14, "mp"),
    A("Mana Mend", "Restore HP.", "heal", 0.2, 16, "mp"),
    P("Focus", "Regenerate mana every turn.", undefined, { manaflow: 4 }),
  ],
};

// title -> [theme, base stars]
export const TITLE_DEFS: Record<string, [string, number]> = {
  Survivor: ["undying", 1], Undying: ["undying", 3],
  Slayer: ["slayer", 1], "Heavy Hitter": ["slayer", 1], Exterminator: ["slayer", 2], "Death Incarnate": ["slayer", 3], Worldsplitter: ["slayer", 3],
  Climber: ["climber", 1], Pathfinder: ["climber", 1], Centurion: ["climber", 2], Skybreaker: ["climber", 2], "Halfway to Heaven": ["climber", 3],
  "The Transcendent": ["climber", 3], "Tower Conqueror": ["climber", 4],
  "Guardian Breaker": ["bane", 2], "Tower Bane": ["bane", 3],
  Lumberjack: ["artisan", 1], Prospector: ["artisan", 1], Artisan: ["artisan", 1], Enhancer: ["artisan", 2], "Grand Artificer": ["artisan", 2],
  "Relic Keeper": ["artisan", 3], "Legend Forger": ["artisan", 3],
  "Green Thumb": ["nature", 1], Rancher: ["nature", 1], Angler: ["nature", 1], Chef: ["nature", 1],
  Golden: ["fortune", 2], "Merchant Prince": ["fortune", 2],
  Polymath: ["sage", 2], Savant: ["sage", 2], "Thousand Faces": ["sage", 3],
};
export const MAX_STARS = 5;
// Equipped hours needed for each star gained above the base: 2h, 6h, 18h, 54h (cumulative).
const STAR_HOURS = [2, 8, 26, 80];

export function titleDef(t: string): [string, number] { return TITLE_DEFS[t] ?? ["slayer", 1]; }
export function titleStars(t: string, secs: number) {
  const base = titleDef(t)[1];
  let gained = 0; while (gained < STAR_HOURS.length && secs >= STAR_HOURS[gained]! * 3600) gained++;
  return Math.min(MAX_STARS, base + gained);
}
/** Seconds of equipped time needed for the next star, or null if maxed. */
export function nextStarAt(t: string, secs: number) {
  const st = titleStars(t, secs); if (st >= MAX_STARS) return null;
  const base = titleDef(t)[1];
  return STAR_HOURS[st - base]! * 3600;
}
export const skillCount = (stars: number) => (stars >= 5 ? 5 : stars >= 3 ? 4 : 3);
export const starScale = (stars: number) => 0.7 + stars * 0.15;
export const lockTurns = (stars: number) => (stars >= 4 ? 3 : 2);

export function titleKit(t: string | undefined, secs: number) {
  const mods: Partial<Record<StatKey, number>> = {}; const effects: Partial<Record<TitleEffect, number>> = {};
  const actives: Extract<TitleSkill, { type: "active" }>[] = [];
  if (!t) return { stars: 0, skills: [] as TitleSkill[], locked: [] as TitleSkill[], mods, effects, actives };
  const stars = titleStars(t, secs); const k = starScale(stars);
  const all = TITLE_THEMES[titleDef(t)[0]]!; const n = skillCount(stars);
  const skills = all.slice(0, n); const locked = all.slice(n);
  for (const sk of skills) {
    if (sk.type === "passive") {
      for (const [m, v] of Object.entries(sk.mods ?? {})) mods[m as StatKey] = (mods[m as StatKey] ?? 0) + v * k;
      for (const [e, v] of Object.entries(sk.effects ?? {})) effects[e as TitleEffect] = (effects[e as TitleEffect] ?? 0) + v * k;
    } else {
      actives.push({ ...sk, mult: sk.kind === "lock" ? lockTurns(stars) : sk.kind === "guard" ? sk.mult : sk.mult * k });
    }
  }
  return { stars, skills, locked, mods, effects, actives };
}
export const starStr = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, MAX_STARS - n));
