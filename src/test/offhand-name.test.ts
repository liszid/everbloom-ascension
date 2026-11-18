import { describe, expect, it } from "vitest";
import { newGame, offhandName } from "@/game/engine";
import { TOOLS } from "@/game/items";

describe("crafted off-hand name", () => {
  it("shows the grade in braces before the name, e.g. {Relic}", () => {
    const s = newGame({ name: "Test", gender: "male", race: "human", bg: "smith" });
    const t = TOOLS.find((x) => x.kind === "torch")!;
    s.toolGrades = { [t.id]: 6 };
    expect(offhandName(s, t.id)).toBe(`{Relic} ${t.name}`);
    s.toolGrades = {};
    expect(offhandName(s, t.id)).toBe(`{Common} ${t.name}`);
  });
});