import { describe, expect, it } from "vitest";
import { TRIAD_CLASSES, findTriad } from "@/game/playstyleClasses";
import { AFF_BY_ID } from "@/game/data";
import { SCHOOL } from "@/game/magic";
import { computeClass, newGame, playerStats, xpForLevel } from "@/game/engine";

const fresh = () => newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" });
const schoolXp = (lvl: number) => 25 * (lvl - 1) ** 2;

describe("playstyle classes", () => {
  it("has at least 100 unique three-aspect combinations built from real affinities and schools", () => {
    expect(TRIAD_CLASSES.length).toBeGreaterThanOrEqual(100);
    expect(new Set(TRIAD_CLASSES.map((c) => [...c.triad].sort().join("+"))).size).toBe(TRIAD_CLASSES.length);
    for (const c of TRIAD_CLASSES) for (const a of c.triad) expect(AFF_BY_ID[a] || SCHOOL[a as keyof typeof SCHOOL], `${c.id}: ${a}`).toBeTruthy();
  });
  it("Transformation + Nature + Might = Druid", () => {
    expect(findTriad("might", "transformation", "nature")?.name).toBe("Druid");
  });
  it("a hero with transformation mastery, nature and might becomes a Druid", () => {
    const s = fresh(); s.aff = {};
    s.skills["farming"] = xpForLevel(30); // nature
    s.skills["two_hand"] = xpForLevel(28); // might
    s.magic = { transformation: schoolXp(10) }; // 30 aspect points
    const c = computeClass(s);
    expect(c.name).toBe("Druid"); expect(c.triad).toBe("druid"); expect(c.tier).toBe(1);
  });
  it("mobility + off-hand defense + ranged hunting reads as an assassin-style class, defense-heavy as a tank", () => {
    expect(findTriad("hunting", "agility", "shield")?.name).toBe("Phantom Assassin");
    expect(findTriad("shield", "sword", "agility")?.role).toBe("tank");
    expect(findTriad("shield", "might", "earth")?.role).toBe("tank");
    expect(findTriad("dark", "sword", "agility")?.name).toBe("Shadow Assassin");
  });
  it("the triad class adds its stat bonus", () => {
    const s = fresh(); s.aff = {};
    s.skills["farming"] = xpForLevel(30); s.skills["two_hand"] = xpForLevel(28);
    const before = playerStats(s).hp;
    s.magic = { transformation: schoolXp(10) };
    expect(computeClass(s).triad).toBe("druid");
    expect(playerStats(s).hp).toBeGreaterThan(before);
  });
  it("too weak a third aspect keeps the regular class", () => {
    const s = fresh(); s.aff = {}; s.skills["farming"] = xpForLevel(30); s.skills["two_hand"] = xpForLevel(28);
    expect(computeClass(s).triad).toBeUndefined();
  });
});
