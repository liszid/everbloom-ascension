import { describe, expect, it } from "vitest";
import { ascend, ascensionProgress, learnSchool, newGame, schoolLock, spellLock, playerStats } from "@/game/engine";
import { SCHOOLS, SCHOOL_MAX, SPELLS } from "@/game/magic";

const fresh = () => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmer" }); s.gold = 1e7; return s; };

describe("magic tower", () => {
  it("Fireball needs 100 M.Atk", () => {
    expect(SPELLS.find((x) => x.name === "Fireball")!.matk).toBe(100);
  });
  it("blood magic stays undiscovered until herbal and water reach Lv 5", () => {
    const s = fresh(); s.xp = 1e9;
    expect(schoolLock(s, "blood")).toMatch(/Undiscovered/);
    s.magic = { herbal: 400, water: 400 };
    expect(learnSchool(s, "blood")).toBe(true);
  });
  it("spells need school level", () => {
    const s = fresh(); s.xp = 1e9; learnSchool(s, "fire");
    expect(s.spells).toContain("fire_0");
    expect(spellLock(s, "fire_1")).toMatch(/Lv 5/);
    expect(playerStats(s).matk).toBeGreaterThan(0);
  });
  it("every school offers 24 spells, all learnable by school Lv 20", () => {
    for (const sc of SCHOOLS) {
      const list = SPELLS.filter((x) => x.school === sc.id);
      expect(list.length).toBe(24);
      expect(Math.max(...list.map((x) => x.lvl))).toBe(SCHOOL_MAX);
    }
    const s = fresh(); s.magic = { fire: 1e7 };
    const fire = SPELLS.filter((x) => x.school === "fire");
    expect(fire.filter((x) => spellLock(s, x.id, 1e6) === null).length).toBe(24);
  });
  it("a school at Lv 19 cannot yet learn its Lv 20 spells", () => {
    const s = fresh(); s.magic = { fire: 25 * 18 * 18 }; // exactly Lv 19
    expect(spellLock(s, SPELLS.filter((x) => x.school === "fire").at(-1)!.id, 1e6)).toMatch(/Lv 20/);
  });
});

describe("race ascension", () => {
  it("vampire needs blood magic, 200 drained, 10000 life steal", () => {
    const s = fresh(); s.magic = { blood: 0 }; s.stats["bloodKills"] = 199; s.stats["lifestealHeal"] = 10000;
    expect(ascend(s, "vampire")).toBe(false);
    s.stats["bloodKills"] = 200;
    expect(ascend(s, "vampire")).toBe(true);
    expect(s.char.race).toBe("vampire"); expect(s.char.origin).toBe("human");
  });
  it("ghost requires dying exactly once after soul binding", () => {
    const s = fresh(); s.magic = { soul: 0 }; s.stats["soulDeaths"] = 2;
    expect(ascensionProgress(s).find((a) => a.race === "ghost")!.failed).toBe(true);
    s.stats["soulDeaths"] = 1; expect(ascend(s, "ghost")).toBe(true);
  });
  it("werewolf needs 100 wolf bites", () => {
    const s = fresh(); s.magic = { transformation: 0 }; s.stats["wolfBites"] = 100;
    expect(ascend(s, "werewolf")).toBe(true);
  });
});
