import { describe, expect, it } from "vitest";
import { addAilment, buyBlessing, craftTool, cureAilment, enterDungeon, newGame, placeTrap, playerStats, pray, startCombat, combatTurn, equipRanged } from "@/game/engine";

const fresh = () => { const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" }); s.gold = 100000; return s; };

describe("church", () => {
  it("weakened lowers attack by 15% and curing restores it", () => {
    const s = fresh(); const base = playerStats(s).patk;
    addAilment(s, "weakened");
    expect(playerStats(s).patk).toBeCloseTo(base * 0.85, 1);
    expect(cureAilment(s, "weakened")).toBe(true);
    expect(playerStats(s).patk).toBeCloseTo(base, 1);
  });
  it("blessing lasts 6 battles; prayer only once per climb", () => {
    const s = fresh(); buyBlessing(s, "might");
    expect(s.blessing).toEqual({ id: "might", left: 6 });
    expect(pray(s)).not.toBeNull();
    expect(pray(s)).toBeNull();
  });
});

describe("craftery", () => {
  it("crafts arrows and shooting consumes one", () => {
    const s = fresh(); s.inv = { birch_log: 10, feather: 10, wool: 5 };
    expect(craftTool(s, "arrow")).toBe(true); expect(s.tools!["arrow"]).toBe(15);
    craftTool(s, "bow"); expect(equipRanged(s, "bow")).toBe(true);
    enterDungeon(s, 1); startCombat(s, s.dungeon!.monsters.find((m) => !m.boss)!);
    combatTurn(s, "shoot"); expect(s.tools!["arrow"]).toBe(14);
  });
  it("traps only within 3 steps on empty floor", () => {
    const s = fresh(); s.tools = { spike_trap: 2 }; enterDungeon(s, 1);
    const d = s.dungeon!; d.monsters = [];
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([x, y]) => ({ x: s.pos.x + x!, y: s.pos.y + y! })).find((q) => d.tiles[q.y]?.[q.x] === ".")!;
    expect(placeTrap(s, "spike_trap", s.pos.x, s.pos.y)).toBe(false);
    expect(placeTrap(s, "spike_trap", near.x, near.y)).toBe(true);
    expect(placeTrap(s, "spike_trap", s.pos.x + 10, s.pos.y)).toBe(false);
  });
});
