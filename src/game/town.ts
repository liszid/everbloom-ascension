// Town expansion rules as pure data: Training Ground, Arena, floor skipping, badges and player-market prices.
import { ACHIEVEMENTS } from "./data";

// ---- Training Ground ----
/** Gold for one affinity session at affinity level l (a little dearer than skill sessions). */
export const affTrainCost = (l: number) => Math.round(60 * Math.pow(l + 1, 1.6));
/** A successful session grants this share of the gap to the next level (same as skill training). */
export const TRAIN_GAIN = 0.5;
/** Each Training Ground level above 1 adds this much success chance. */
export const TRAIN_BLDG_BONUS = 0.03;

// ---- Arena ----
export const ARENA_WAVES = 5;
export const ARENA_MIN_FLOOR = 10;
/** Guardians for every wave, an Arch-Warden for the last one. */
export const arenaBossKind = (wave: number): 1 | 2 => (wave >= ARENA_WAVES ? 2 : 1);
/** Each wave's champion fights as if two floors deeper than the last. */
export const arenaWaveFloor = (floor: number, wave: number) => floor + (wave - 1) * 2;
/** Arena brackets: every Guardian floor (multiple of 10) you have already cleared. */
export const arenaFloors = (maxFloor: number) => {
  const top = Math.floor(Math.min(1000, maxFloor) / 10) * 10;
  return Array.from({ length: Math.max(0, top / 10) }, (_, i) => top - i * 10);
};
export const arenaFee = (floor: number) => Math.round(60 * Math.pow(1.1, floor / 10));
/** Runs allowed per Tower expedition (refreshes when you come back from the Tower). */
export const ARENA_RUNS_PER_TRIP = 1;
/** Waves that also award a piece of equipment. */
export const ARENA_GEAR_WAVES = [3, 5];
/** Prize for clearing a wave: rare materials grow with the wave, gold with the bracket and wave. */
export const arenaPrize = (floor: number, wave: number, bldgLvl = 1) => {
  const boost = 1 + (bldgLvl - 1) * 0.05;
  return {
    rare: Math.round((wave + 1) * boost),
    gold: Math.round(40 * Math.pow(1.1, floor / 10) * wave * boost),
    gear: ARENA_GEAR_WAVES.includes(wave),
  };
};

// ---- Tower floor skipping ----
/** The next Guardian floor above your best (capped at 1000). */
export const nextBossFloor = (maxFloor: number) => Math.min(1000, Math.ceil((maxFloor + 1) / 10) * 10);
/** Skipping only makes sense when the next Guardian is more than one floor away. */
export const canSkipTo = (maxFloor: number) => nextBossFloor(maxFloor) > maxFloor + 1;
export const SKIP_WARNING = "The shortest path doesn't lead to your goal.";

// ---- Badges (formerly village decorations) ----
export interface Badge { emoji: string; ach: string; achName: string; tier: number; label: string }
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
/** Every badge an achievement can award, in achievement order. */
export const BADGES: Badge[] = ACHIEVEMENTS.flatMap((a) => a.rewards.flatMap((r, i) => r.deco ? [{ emoji: r.deco, ach: a.id, achName: a.name, tier: i, label: `${a.name} ${ROMAN[i] ?? i + 1}` }] : []));
/** A badge is earned once its achievement tier is reached, so badges never go missing. */
export const badgeEarned = (ach: Record<string, number>, b: Badge) => (ach[b.ach] ?? 0) > b.tier;

// ---- Player market ----
export type ListingKind = "mat" | "gear" | "monster";
/** Market price multiplier over a material's base value (the shop pays 0.5×). */
export const MARKET_MAT_MULT = 1;
/** Market price multiplier over a gear piece's sell value. */
export const MARKET_GEAR_MULT = 2;
/** Captured monster price from its level and base strength. */
export const monsterMarketValue = (level: number, base: { hp: number; atk: number; def: number }) =>
  Math.max(50, Math.round(120 * Math.pow(level, 1.4) * (base.hp + base.atk + base.def)));
