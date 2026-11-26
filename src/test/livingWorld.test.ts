import { describe, expect, it, vi } from "vitest";
import { newGame, hireCompanion, depositComp, withdrawComp, drillComp, upgradeCompSkill, pickClass, computeClass, classIdByName, massXp, addXp, xpForLevel, claimTutor, enterDungeon, startCombat, combatTurn, captureBlock, makeMonster, moveMonsters } from "@/game/engine";
import { compLevel } from "@/game/guild";
import { massGain } from "@/game/pacing";
import { habitOf, isFlyer } from "@/game/habits";
import { townThemeOf } from "@/game/townTheme";
import { VILLAGE_MAP } from "@/game/data";
const fresh = () => { const s = newGame({ name: "Tester", race: "human", gender: "Male", bg: "farmer" }); s.gold = 1e8; return s; };
describe("living world rules", () => {
 it.each(["naga", "mimic", "bat", "slime"])("%s chases at exactly three tiles, even when randomness would previously idle it", (id) => {
  const s = fresh(); enterDungeon(s, 1); const d = s.dungeon; if (!d) throw Error("Missing dungeon");
  d.tiles = Array.from({ length: 8 }, () => "........");
  const m = makeMonster(1, 2, 2); m.def = id; m.boss = 0; d.monsters = [m]; s.pos = { x: 5, y: 2 }; s.step = 10;
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  try { moveMonsters(s); expect(m.x).toBe(3); expect(m.y).toBe(2); expect(m.movedAt).toBe(10); } finally { random.mockRestore(); }
 });
 it("monsters attack when adjacent after approaching", () => {
  const s = fresh(); enterDungeon(s, 1); const d = s.dungeon; if (!d) throw Error("Missing dungeon");
  const m = makeMonster(1, 2, 2); m.def = "bat"; d.monsters = [m]; s.pos = { x: 3, y: 2 };
  expect(moveMonsters(s)).toBe(m);
 });
 it("distant ambushers remain stationary instead of chasing across the floor", () => {
  const s = fresh(); enterDungeon(s, 1); const d = s.dungeon; if (!d) throw Error("Missing dungeon");
  const m = makeMonster(1, 2, 2); m.def = "mimic"; m.boss = 0; d.monsters = [m]; s.pos = { x: 6, y: 2 };
  moveMonsters(s); expect(m.x).toBe(2); expect(m.y).toBe(2);
 });
 it("captures go into Prison even with an empty party", () => {
  const s = fresh(); enterDungeon(s, 1); const m = s.dungeon?.monsters.find((x) => !x.boss); if (!m) throw Error("Missing foe");
  startCombat(s, m); if (!s.combat) throw Error("Missing combat"); s.combat.mon.hp = 1; expect(captureBlock(s)).toBeNull();
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  try { combatTurn(s, "capture"); expect(s.prison).toHaveLength(1); expect(s.companions ?? []).toHaveLength(0); } finally { random.mockRestore(); }
 });
 it("permanent recruits move between cells and party without losing identity", () => {
  const s = fresh(); hireCompanion(s, "warrior", true); const c = s.companions?.[0]; if (!c) throw Error("Missing recruit");
  expect(depositComp(s, c.id)).toBe(true); expect(s.prison?.[0]).toBe(c); expect(withdrawComp(s, c.id)).toBe(true); expect(s.companions?.[0]).toBe(c);
 });
 it("rented recruits cannot be deposited", () => {
  const s = fresh(); hireCompanion(s, "warrior", false); const c = s.companions?.[0]; if (!c) throw Error("Missing recruit"); expect(depositComp(s, c.id)).toBe(false);
 });
 it("prison training raises levels and companion skill bonuses", () => {
  const s = fresh(); hireCompanion(s, "warrior", true); const c = s.companions?.[0]; if (!c) throw Error("Missing recruit"); s.xp = 1e7;
  const before = compLevel(c.xp); expect(drillComp(s, c.id)).toBe(true); expect(compLevel(c.xp)).toBe(before + 1);
  expect(upgradeCompSkill(s, c.id, "power")).toBe(true); expect(c.skills?.power).toBe(1);
 });
 it("non-ascended heroes can select discovered classes but not undiscovered ones", () => {
  const s = fresh(); s.classesSeen.push("Pyromancer"); const id = classIdByName("Pyromancer"); if (!id) throw Error("Missing class");
  expect(pickClass(s, id)).toBe(true); expect(computeClass(s).name).toBe("Pyromancer"); expect(pickClass(s, "water:1")).toBe(false);
 });
 it("ascended race ladders forbid manual class selection", () => {
  const s = fresh(); s.char.race = "vampire"; s.classesSeen.push("Pyromancer"); expect(pickClass(s, "fire:1")).toBe(false); expect(computeClass(s).race).toBe("vampire");
 });
 it("mass actions give slower affinity and diminish outgrown low-tier work", () => {
  const s = fresh(), normal = fresh(); s.aff = {}; normal.aff = {}; massXp(s, "mining", 10, 0); addXp(normal, "mining", 10);
  expect(s.aff["earth"]).toBe((normal.aff["earth"] ?? 0) / 2); expect(massGain(50, 0)).toBe(0.05); expect(massGain(50, 5)).toBe(1);
  s.skills["mining"] = xpForLevel(50); const before = s.skills["mining"]; massXp(s, "mining", 10, 0); expect(s.skills["mining"] - before).toBeCloseTo(0.55);
 });
 it("tutorial missions require their action before paying out", () => {
  const s = fresh(); expect(claimTutor(s)).toBe(false); s.stats["treesCut"] = 5; const before = s.gold; expect(claimTutor(s)).toBe(true); expect(s.gold).toBe(before + 40); expect(s.tutor).toBe(1); expect(claimTutor(s)).toBe(false);
 });
 it("monsters have distinct habits and undead races have an undead town", () => {
  expect(habitOf("mimic")).toBe("ambush"); expect(habitOf("bat")).toBe("skittish"); expect(habitOf("skeleton")).toBe("patrol"); expect(isFlyer("bat")).toBe(true); expect(townThemeOf("vampire")).toBe("undead");
 });
 it("prison occupies four aligned map cells", () => {
  expect(VILLAGE_MAP.every((r) => r.length === 20)).toBe(true); expect(VILLAGE_MAP.join("").split("C").length - 1).toBe(4);
 });
});
