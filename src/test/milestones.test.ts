import { describe, expect, it } from "vitest";
import { checkAchievements, newGame, pray, playDice } from "@/game/engine";
import { TITLE_DEFS, TITLE_THEMES, titleKit } from "@/game/titles";

const fresh = () => newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" });

describe("milestone titles", () => {
  it("every title points at a real 5-skill theme", () => {
    for (const [t, [theme]] of Object.entries(TITLE_DEFS)) expect(TITLE_THEMES[theme]?.length, t).toBe(5);
  });
  it("praying counts prayers; 10 prayers earn 'Devout' and 100 earn 'Pope'", () => {
    const s = fresh(); pray(s); expect(s.stats["prayers"]).toBe(1);
    s.stats["prayers"] = 10; checkAchievements(s); expect(s.titles).toContain("Devout");
    s.stats["prayers"] = 100; checkAchievements(s); expect(s.titles).toContain("Pope");
  });
  it("Pope starts at 4 stars with the Apostle kit", () => {
    const k = titleKit("Pope", 0); expect(k.stars).toBe(4); expect(k.skills.map((x) => x.name)).toContain("Judgment Ray");
  });
  it("casino wins are counted", () => {
    const s = fresh(); s.gold = 1e6; let wins = 0;
    for (let i = 0; i < 40; i++) { s.casinoPlays = 0; if (playDice(s, 10, true)?.win) wins++; }
    expect(s.stats["casinoWins"] ?? 0).toBe(wins);
  });
  it("50000 HP of life steal earns 'Sanguine Lord'", () => {
    const s = fresh(); s.stats["lifestealHeal"] = 50000; checkAchievements(s); expect(s.titles).toContain("Sanguine Lord");
  });
});
