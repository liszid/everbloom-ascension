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
