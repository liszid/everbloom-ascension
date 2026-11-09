import { describe, expect, it } from "vitest";
import { ascend, ascensionProgress, learnSchool, newGame, schoolLock, spellLock, playerStats } from "@/game/engine";
import { SPELLS } from "@/game/magic";

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
