import { describe, expect, it } from "vitest";
import { checkClass, computeClass, newGame, xpForLevel } from "@/game/engine";
import { RACE_CLASS, RACE_CLASSES } from "@/game/raceClasses";

const fresh = (race = "human") => newGame({ name: "T", gender: "Male", race, bg: "farmer" });

describe("race-locked classes", () => {
  it("a freshly ascended vampire becomes a Fledgling Vampire, even with merchant-like skills", () => {
    const s = fresh(); s.skills.trading = xpForLevel(150); s.aff.crafting = 50000; s.aff.fortune = 50000;
    expect(computeClass(s).name).not.toMatch(/Vampire/);
    s.char = { ...s.char, race: "vampire" };
    expect(computeClass(s).name).toBe("Fledgling Vampire");
  });

  it("every ascended race only ever gets classes from its own ladder", () => {
    for (const line of RACE_CLASSES) {
      const s = fresh(line.race); s.skills.farming = xpForLevel(200); s.aff.nature = 1e6; s.title = "Green Thumb";
      expect(line.ranks).toContain(computeClass(s).name);
    }
  });

  it("the vampire ranks up only as blood, shadow, skills and feeding grow", () => {
    const s = fresh("vampire");
    s.magic = { blood: 25 * 19 * 19, dark: 25 * 19 * 19 }; // both schools Lv 20
    s.aff.dark = 40 * 40 * 8; // Darkness affinity 40
    expect(computeClass(s).name).toBe("Vampire Lord"); // 3 of 7 sources maxed ≈ 43%
    s.skills.spellcasting = xpForLevel(100); s.skills.evasion = xpForLevel(100);
    s.stats.lifestealHeal = 250000; s.stats.bloodKills = 3000;
    expect(computeClass(s).name).toBe("Vampire Progenitor");
  });

  it("ascending records the change into the race class", () => {
    const s = fresh(); s.skills.one_hand = xpForLevel(60); checkClass(s);
    s.char = { ...s.char, race: "lich" }; checkClass(s);
    expect(s.className).toBe(RACE_CLASS["lich"]!.ranks[0]);
    expect(s.classHistory.at(-1)!.to).toBe("Hollow Lich");
  });
});
