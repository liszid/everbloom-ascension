import { describe, expect, it } from "vitest";
import { climbDown, climbUp, enterDungeon, newGame } from "@/game/engine";

const fresh = () => newGame({ name: "T", gender: "Male", race: "human", bg: "farmer" });
const tileAt = (s: ReturnType<typeof fresh>, x: number, y: number) => s.dungeon!.tiles[y]![x];

describe("tower stairs", () => {
  it("stairs up take you to the next floor without returning to the village", () => {
    const s = fresh(); enterDungeon(s, 3); s.bag = { stone: 4 };
    expect(climbUp(s)).toBe(true);
    expect(s.loc).toBe("dungeon");
    expect(s.dungeon!.floor).toBe(4);
    expect(s.maxFloor).toBe(3);
    expect(s.bag).toEqual({ stone: 4 }); // loot stays in the bag until you retreat
  });

  it("every floor above 1 has stairs down; floor 1 has none", () => {
    const s = fresh(); enterDungeon(s, 1);
    expect(s.dungeon!.down).toBeUndefined();
    expect(s.dungeon!.tiles.join("")).not.toContain("<");
    enterDungeon(s, 2);
    const dn = s.dungeon!.down!;
    expect(tileAt(s, dn.x, dn.y)).toBe("<");
    expect(Math.abs(s.pos.x - dn.x) + Math.abs(s.pos.y - dn.y)).toBe(1);
  });

  it("stairs down go one floor lower, next to its stairs up", () => {
    const s = fresh(); enterDungeon(s, 5);
    expect(climbDown(s)).toBe(true);
    expect(s.loc).toBe("dungeon");
    expect(s.dungeon!.floor).toBe(4);
    const up = s.dungeon!.stairs;
    expect(Math.abs(s.pos.x - up.x) + Math.abs(s.pos.y - up.y)).toBe(1);
  });

  it("cannot go below floor 1", () => {
    const s = fresh(); enterDungeon(s, 1);
    expect(climbDown(s)).toBe(false);
    expect(s.dungeon!.floor).toBe(1);
  });

  it("a living boss locks the stairs up, but not when you came down onto its floor", () => {
    const s = fresh(); enterDungeon(s, 10);
    expect(climbUp(s)).toBe(false);
    expect(s.dungeon!.floor).toBe(10);
    enterDungeon(s, 11); climbDown(s);
    expect(s.dungeon!.floor).toBe(10);
    expect(climbUp(s)).toBe(true);
    expect(s.dungeon!.floor).toBe(11);
  });

  it("climbing back up a floor you came down onto gives no gold bonus", () => {
    const s = fresh(); s.maxFloor = 10; enterDungeon(s, 6); climbDown(s);
    const g = s.gold; climbUp(s);
    expect(s.gold).toBe(g);
  });
});
