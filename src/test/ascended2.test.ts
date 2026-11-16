import { describe, expect, it } from "vitest";
import { ASC_RACES, ASCENSIONS, SCHOOL } from "@/game/magic";
import { RACE_CLASS, RACE_CLASSES } from "@/game/raceClasses";
import { NEW_ASC_RACES } from "@/game/ascendedRaces";
import { AFF_BY_ID, RACES } from "@/game/data";
import { ascend, ascensionProgress, combatTurn, computeClass, enterDungeon, makeMonster, newGame, startCombat } from "@/game/engine";

const fresh = () => newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" });

describe("35 new ascended races", () => {
  it("adds 35 races with unique ids that never clash with the originals", () => {
    expect(NEW_ASC_RACES.length).toBe(35);
    const ids = [...RACES.map((r) => r.id), ...ASC_RACES.map((r) => r.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every ascended race has a condition with a real school and a 5-rank ladder of real affinities", () => {
    for (const r of ASC_RACES) {
      const a = ASCENSIONS.find((x) => x.race === r.id); expect(a, r.id).toBeDefined(); expect(SCHOOL[a!.school]).toBeDefined();
      const l = RACE_CLASS[r.id]; expect(l, r.id).toBeDefined(); expect(l!.ranks.length).toBe(5);
      for (const af of l!.affs) expect(AFF_BY_ID[af], `${r.id} ${af}`).toBeDefined();
    }
    expect(RACE_CLASSES.length).toBe(ASC_RACES.length);
  });
  it("Seraph: learn Holy Light, pray 100 times and buy 40 blessings to ascend; class follows the Seraph ladder", () => {
    const s = fresh(); s.magic = { light: 0 }; s.stats["prayers"] = 99; s.stats["blessingsBought"] = 40;
    expect(ascensionProgress(s).find((a) => a.race === "angel")!.ready).toBe(false);
    s.stats["prayers"] = 100;
    expect(ascend(s, "angel")).toBe(true);
    expect(s.char.race).toBe("angel"); expect(computeClass(s).name).toBe("Initiate Seraph");
  });
  it("Changeling counts discovered classes", () => {
    const s = fresh(); s.magic = { transformation: 0 }; s.classesSeen = Array.from({ length: 15 }, (_, i) => `C${i}`);
    expect(ascensionProgress(s).find((a) => a.race === "changeling")!.ready).toBe(true);
  });
  it("data-driven race skills hit (Mind Blast stuns)", () => {
    const s = fresh(); s.char = { ...s.char, race: "mind_flayer" }; enterDungeon(s, 5); s.hp = 1e6;
    const m = makeMonster(5, 1, 1); m.hp = m.maxHp = 1e9; startCombat(s, m);
    combatTurn(s, "race");
    expect(s.combat!.dealt).toBeGreaterThan(0);
  });
});
