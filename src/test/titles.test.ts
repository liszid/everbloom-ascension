import { describe, expect, it } from "vitest";
import { skillCount, titleKit, titleStars } from "@/game/titles";

describe("title kits", () => {
  it("rarity gives 3 to 5 skills", () => {
    expect(skillCount(1)).toBe(3);
    expect(skillCount(3)).toBe(4);
    expect(skillCount(5)).toBe(5);
  });
  it("stars only grow with equipped time", () => {
    expect(titleStars("Undying", 0)).toBe(3);
    expect(titleStars("Undying", 2 * 3600)).toBe(4);
  });
  it("Undying grants regen, extra health, a heal and an HP lock", () => {
    const k = titleKit("Undying", 8 * 3600);
    expect(k.effects.regen).toBeGreaterThan(0);
    expect(k.mods.hp).toBeGreaterThan(0);
    expect(k.actives.map((a) => a.kind)).toEqual(["heal", "lock"]);
  });
});
