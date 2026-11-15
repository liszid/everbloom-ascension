import { describe, expect, it } from "vitest";
import { compEquip, compGear, compStats, dismissCompanion, enterDungeon, equipGear, GEAR_CAP, hireCompanion, leaveDungeon, migrateSave, newGame, pathGains, startCombat, type Gear, type GameState } from "@/game/engine";
import { RENT_FLOORS } from "@/game/guild";

const fresh = () => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmer" }); s.gold = 1e8; return s; };
let n = 0;
const gear = (slot: Gear["slot"] = "one_hand"): Gear => ({
  id: `g${++n}`, name: `Blade ${n}`, slot, grade: 3, base: { hp: 0, mp: 0, sta: 0, patk: 50, matk: 0, pdef: 0, mdef: 0, crit: 0, critDmg: 0, dodge: 0, acc: 0, spd: 0, luck: 0 } as Gear["base"],
  element: "none", effects: [], materials: [], avgTier: 1, dura: 10, maxDura: 10, enh: 0, crafted: 0,
});
const withComp = (s: GameState, buy = true) => { hireCompanion(s, "warrior", buy); return s.companions![0]!; };

describe("companion gear leaves and returns to the bag", () => {
  it("giving gear removes it from the hero's bag and the companion carries it", () => {
    const s = fresh(); const c = withComp(s); const g = gear(); s.gear.push(g);
    const before = compStats(s, c).atk;
    expect(compEquip(s, c.id, g.id, "one_hand")).toBe(true);
    expect(s.gear.some((x) => x.id === g.id)).toBe(false);
    expect(compGear(c, "one_hand")?.id).toBe(g.id);
    expect(compStats(s, c).atk).toBeGreaterThan(before);
  });
  it("removing gear puts it back in the bag", () => {
    const s = fresh(); const c = withComp(s); const g = gear(); s.gear.push(g);
    compEquip(s, c.id, g.id, "one_hand"); compEquip(s, c.id, undefined, "one_hand");
    expect(s.gear.some((x) => x.id === g.id)).toBe(true);
    expect(compGear(c, "one_hand")).toBeUndefined();
  });
  it("swapping returns the old piece to the bag", () => {
    const s = fresh(); const c = withComp(s); const a = gear(), b = gear(); s.gear.push(a, b);
    compEquip(s, c.id, a.id, "one_hand"); compEquip(s, c.id, b.id, "one_hand");
    expect(s.gear.map((x) => x.id)).toEqual([a.id]);
    expect(compGear(c, "one_hand")?.id).toBe(b.id);
  });
  it("cannot take gear back into a full bag", () => {
    const s = fresh(); const c = withComp(s); const g = gear(); s.gear.push(g);
    compEquip(s, c.id, g.id, "one_hand");
    while (s.gear.length < GEAR_CAP) s.gear.push(gear("helm"));
    expect(compEquip(s, c.id, undefined, "one_hand")).toBe(false);
    expect(compGear(c, "one_hand")?.id).toBe(g.id);
  });
  it("gear the hero wears cannot be given away", () => {
    const s = fresh(); const c = withComp(s); const g = gear(); s.gear.push(g); equipGear(s, g.id);
    expect(compEquip(s, c.id, g.id, "one_hand")).toBe(false);
  });
  it("dismissing a companion returns everything they carry", () => {
    const s = fresh(); const c = withComp(s); const g = gear(); s.gear.push(g);
    compEquip(s, c.id, g.id, "one_hand"); dismissCompanion(s, c.id);
    expect(s.gear.some((x) => x.id === g.id)).toBe(true);
  });
  it("a rental ending returns their gear", () => {
    const s = fresh(); const c = withComp(s, false); const g = gear(); s.gear.push(g);
    compEquip(s, c.id, g.id, "one_hand");
    for (let i = 0; i < RENT_FLOORS; i++) { enterDungeon(s, 1); leaveDungeon(s, true); }
    expect(s.companions!.length).toBe(0);
    expect(s.gear.some((x) => x.id === g.id)).toBe(true);
  });
  it("old saves move companion-equipped gear out of the bag", () => {
    const s = fresh(); const c = withComp(s); const g = gear(); s.gear.push(g);
    c.equip = { one_hand: g.id }; c.held = undefined;
    expect(migrateSave(s)).toBe(true);
    expect(s.gear.some((x) => x.id === g.id)).toBe(false);
    expect(compGear(c, "one_hand")?.id).toBe(g.id);
    expect(migrateSave(s)).toBe(false);
  });
});

describe("race path progress in battle results", () => {
  it("reports life drained this battle against the Vampire condition", () => {
    const s = fresh(); enterDungeon(s, 1);
    startCombat(s, s.dungeon!.monsters.find((m) => !m.boss)!);
    const st0 = s.combat!.st0!; s.stats["lifestealHeal"] = (s.stats["lifestealHeal"] ?? 0) + 120;
    const g = pathGains(s, st0).find((x) => x.label.includes("life steal"));
    expect(g).toMatchObject({ add: 120, need: 10000 });
  });
});
