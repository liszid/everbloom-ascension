// Pacing for mass actions (tap-to-gather, refining, crafting, cooking) — pure functions.
// Low-tier materials teach less once a skill has outgrown them, so stamina loops can't skip progression.

/** Affinity from mass actions grows at this share of the normal rate. */
export const MASS_AFF = 0.5;
/** Material tier a skill level is expected to work with (spots unlock a tier every 10 levels). */
export const expectedTier = (skillLv: number) => Math.min(10, Math.floor(skillLv / 10));
/** Gain multiplier for working a material of `tier` at `skillLv`: full at or above the expected tier, halving for each tier below (min 5%). */
export const massGain = (skillLv: number, tier: number) => Math.max(0.05, Math.pow(0.5, Math.max(0, expectedTier(skillLv) - Math.max(0, tier))));
