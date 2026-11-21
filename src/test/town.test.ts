import { describe, expect, it, vi } from "vitest";
import { VILLAGE_MAP, ACHIEVEMENTS } from "@/game/data";
import {
  arenaCashOut, arenaFight, arenaGear, arenaLock, combatTurn, enterDungeon, leaveDungeon, marketValue, migrateSave, newGame, receiveListing,
  restAtHome, skipToBoss, startArena, takeForListing, trainAffinity, affLevel, gearValue, type GameState,
} from "@/game/engine";
import { ARENA_WAVES, BADGES, SKIP_WARNING, arenaBossKind, arenaFloors, badgeEarned, canSkipTo, nextBossFloor } from "@/game/town";

const fresh = (): GameState => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmer" }); s.gold = 1e9; return s; };

describe("town map", () => {
  it("has a Training Ground and an Arena, every row the same width, and no decoration spots", () => {
    const w = VILLAGE_MAP[0]!.length;
    expect(VILLAGE_MAP.every((r) => r.length === w)).toBe(true);
    expect(VILLAGE_MAP.join("").split("K").length - 1).toBe(4);
    expect(VILLAGE_MAP.join("").split("U").length - 1).toBe(4);
    expect(VILLAGE_MAP.join("")).not.toContain("o");
  });
});

describe("badges", () => {
  it("every decoration reward is a badge, earned from the achievement tier even if the old list missed it", () => {
    expect(BADGES.length).toBe(ACHIEVEMENTS.flatMap((a) => a.rewards.filter((r) => r.deco)).length);
    const trophy = BADGES.find((b) => b.emoji === "🏆")!; // Guardian Breaker tier III
    expect(badgeEarned({ bosses: 2 }, trophy)).toBe(false);
    expect(badgeEarned({ bosses: 3 }, trophy)).toBe(true);
  });
});

describe("floor skipping", () => {
  it("jumps only to the next Guardian floor", () => {
    expect(nextBossFloor(0)).toBe(10);
    expect(nextBossFloor(23)).toBe(30);
    expect(canSkipTo(9)).toBe(false); // floor 10 is already the next floor
    expect(canSkipTo(995)).toBe(true);
    expect(nextBossFloor(999)).toBe(1000);
    expect(SKIP_WARNING).toBe("The shortest path doesn't lead to your goal.");
    const s = fresh(); s.maxFloor = 23;
    expect(skipToBoss(s)).toBe(true);
    expect(s.dungeon!.floor).toBe(30);
  });
});

describe("training ground", () => {
  it("affinity training costs gold and a success adds half a level", () => {
    const s = fresh(); s.aff["fire"] = 8 * 4 * 4; // Lv 4
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const g = s.gold; expect(trainAffinity(s, "fire")).toBe(true); spy.mockRestore();
    expect(s.gold).toBeLessThan(g);
    expect(s.aff["fire"]).toBe(128 + (200 - 128) / 2);
    expect(affLevel(s.aff["fire"]!)).toBe(4);
  });
  it("old guild upgrades carry over to the Training Ground", () => {
    const s = fresh(); s.bldg = { guild: 4 };
    migrateSave(s); expect(s.bldg.training).toBe(4);
  });
});

describe("arena", () => {
  it("opens after floor 10, brackets are cleared Guardian floors, 4 Guardians then an Arch-Warden", () => {
    const s = fresh(); s.maxFloor = 9;
    expect(arenaLock(s)).not.toBeNull();
    expect(arenaFloors(37)).toEqual([30, 20, 10]);
    expect([1, 2, 3, 4, 5].map(arenaBossKind)).toEqual([1, 1, 1, 1, 2]);
    expect(ARENA_WAVES).toBe(5);
  });
  it("one run per Tower expedition; winning waves banks prizes, falling loses them, no resting mid-run", () => {
    const s = fresh(); s.maxFloor = 50; s.hp = 1e12; s.xp = 1e12;
    expect(startArena(s, 50)).toBe(true);
    expect(s.combat?.mon.boss).toBe(1);
    s.combat!.mon.hp = 1; for (let i = 0; i < 50 && s.combat; i++) combatTurn(s, "attack");
    expect(s.arena?.wave).toBe(1);
    expect(s.arena!.prize.gold).toBeGreaterThan(0);
    const hp = s.hp; restAtHome(s); expect(s.hp).toBe(hp);
    // a second run is refused until the next Tower trip
    const before = s.gold; arenaCashOut(s); expect(s.gold).toBeGreaterThan(before);
    expect(startArena(s, 50)).toBe(false);
    enterDungeon(s, 1); leaveDungeon(s, true);
    expect(arenaLock(s)).toBeNull();
    // falling loses held prizes
    expect(startArena(s, 10)).toBe(true);
    s.combat!.mon.hp = 1; for (let i = 0; i < 50 && s.combat; i++) combatTurn(s, "attack");
    expect(arenaFight(s)).toBe(true);
    s.hp = 0; s.combat!.mon.atk = 1e15; for (let i = 0; i < 50 && s.combat; i++) combatTurn(s, "defend");
    expect(s.arena).toBeUndefined();
  });
});

describe("player market", () => {
  it("prices come from market value and listing moves the item out of the save", () => {
    const s = fresh(); s.inv["iron_ore"] = 10;
    const d = takeForListing(s, "mat", "iron_ore", 4)!;
    expect(d.qty).toBe(4); expect(d.price).toBe(marketValue({ ...s, inv: { iron_ore: 4 } }, "mat", "iron_ore", 4));
    expect(s.inv["iron_ore"]).toBe(6);
    receiveListing(s, "mat", d.item, d.qty); expect(s.inv["iron_ore"]).toBe(10);
  });
  it("gear sells at twice its shop value; equipped gear can't be listed", () => {
    const s = fresh(); const g = arenaGear(s, 50); s.gear.push(g);
    expect(marketValue(s, "gear", g.id)).toBe(Math.max(1, gearValue(g) * 2));
    s.equip[g.slot] = g.id;
    expect(takeForListing(s, "gear", g.id)).toBeNull();
    s.equip[g.slot] = undefined;
    expect(takeForListing(s, "gear", g.id)?.price).toBe(Math.max(1, gearValue(g) * 2));
    expect(s.gear.some((x) => x.id === g.id)).toBe(false);
  });
});
