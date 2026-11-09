import { describe, expect, it } from "vitest";
import { combatTurn, captureBlock, enterDungeon, hireCompanion, leaveDungeon, newGame, startCombat, trainSkill, learnTech } from "@/game/engine";
import { RENT_FLOORS, MAX_COMPANIONS } from "@/game/guild";

const fresh = () => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmer" }); s.gold = 1e8; return s; };

describe("guild", () => {
  it("allows at most 4 companions", () => {
    const s = fresh();
    for (let i = 0; i < 6; i++) hireCompanion(s, "warrior", true);
    expect(s.companions!.length).toBe(MAX_COMPANIONS);
  });
  it("rented companions leave after their expeditions", () => {
    const s = fresh(); hireCompanion(s, "archer", false);
    for (let i = 0; i < RENT_FLOORS; i++) { enterDungeon(s, 1); leaveDungeon(s, true); }
    expect(s.companions!.length).toBe(0);
  });
  it("capture needs the foe below 30% HP and not a boss", () => {
    const s = fresh(); enterDungeon(s, 1);
    const m = s.dungeon!.monsters.find((x) => !x.boss)!; startCombat(s, m);
    expect(captureBlock(s)).toMatch(/30%/);
    s.combat!.mon.hp = 1; expect(captureBlock(s)).toBeNull();
    for (let i = 0; i < 40 && s.combat; i++) combatTurn(s, "capture");
    expect(s.companions?.some((c) => c.kind === "monster")).toBe(true);
  });
  it("training costs gold; specialists need top-2 affinity", () => {
    const s = fresh(); const g = s.gold; trainSkill(s, "mining"); expect(s.gold).toBeLessThan(g);
    s.aff = { fire: 10000, water: 5000, earth: 1 };
    expect(learnTech(s, "earth", "passive")).toBe(false);
    expect(learnTech(s, "fire", "active")).toBe(true);
  });
});
