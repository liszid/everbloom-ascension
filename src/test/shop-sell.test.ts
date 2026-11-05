import { describe, expect, it } from "vitest";
import { newGame, sellableList } from "@/game/engine";

const state = () => {
  const s = newGame({ name: "Test", gender: "male", race: "human", bg: "smith" });
  s.inv = { stone: 9, dragon_scale: 2, wolf_pelt: 1, copper_ore: 5, iron_ore: 3 };
  return s;
};

describe("shop sell list", () => {
  it("lists every stack with its material tier", () => {
    const rows = sellableList(state());
    expect(rows.map((r) => [r.id, r.qty, r.tier])).toEqual([
      ["dragon_scale", 2, 8],
      ["iron_ore", 3, 1],
      ["wolf_pelt", 1, 1],
      ["copper_ore", 5, 0],
      ["stone", 9, 0],
    ]);
  });
  it("skips empty stacks", () => {
    const s = state();
    s.inv.stone = 0;
    expect(sellableList(s).map((r) => r.id)).not.toContain("stone");
  });
});
