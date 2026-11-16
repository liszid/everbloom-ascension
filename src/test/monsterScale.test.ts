import { describe, it, expect } from "vitest";
import { monScale } from "@/game/engine";

describe("monster floor scaling", () => {
  it("floor 1 is the baseline", () => {
    expect(monScale(1)).toEqual({ hp: 1, atk: 1, def: 1 });
  });
  it("each floor is 5% stronger than the previous one", () => {
    for (const f of [2, 10, 41, 500]) {
      const a = monScale(f - 1), b = monScale(f);
      expect(b.hp / a.hp).toBeCloseTo(1.05, 10);
      expect(b.atk / a.atk).toBeCloseTo(1.05, 10);
      expect(b.def / a.def).toBeCloseTo(1.05, 10);
    }
  });
});

import { monXp, killXp, makeMonster, charXpFor } from "@/game/engine";

describe("monster XP follows the floor", () => {
  it("a floor 160 enemy gives far more XP than a floor 10 enemy", () => {
    expect(monXp(160) / monXp(10)).toBeGreaterThan(50);
  });
  it("XP rises on every deeper floor", () => {
    for (const f of [1, 10, 50, 160, 500, 999]) expect(monXp(f + 1)).toBeGreaterThan(monXp(f) - 1);
    expect(monXp(1000)).toBeGreaterThan(monXp(500));
  });
  it("floor 1 stays close to the old starting reward", () => {
    expect(monXp(1)).toBeGreaterThanOrEqual(5);
    expect(monXp(1)).toBeLessThanOrEqual(8);
  });
  it("a plain kill is about 1/20 of a level at the floor's matching level", () => {
    const f = 300, L = Math.round(1 + 0.3 * f);
    const perLevel = charXpFor(L + 1) - charXpFor(L);
    expect(perLevel / monXp(f)).toBeGreaterThan(15);
    expect(perLevel / monXp(f)).toBeLessThan(25);
  });
  it("bosses and elites keep their multipliers", () => {
    expect(monXp(100, 2)).toBeGreaterThan(monXp(100) * 24);
    expect(monXp(100, 1)).toBeGreaterThan(monXp(100) * 7);
    expect(monXp(100, 0, true)).toBeGreaterThan(monXp(100) * 1.9);
  });
  it("monsters saved with the old flat XP are lifted to the new curve", () => {
    const m = makeMonster(160, 0, 0); m.xp = 27; m.affix = undefined;
    expect(killXp(m, 160)).toBe(monXp(160));
  });
});
