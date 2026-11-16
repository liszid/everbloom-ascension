import { describe, expect, it } from "vitest";
import { ascensionProgress, newGame, pathCloseness, pathState, type GameState } from "@/game/engine";

const fresh = () => newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" });
const path = (s: GameState, race: string) => ascensionProgress(s).find((a) => a.race === race)!;
const state = (s: GameState, race: string) => pathState(s, path(s, race));

describe("ritual filter states", () => {
  it("Vampire is locked while Blood Magic is still undiscovered", () => {
    expect(state(fresh(), "vampire")).toBe("locked");
  });
  it("learning the school makes the race available to unlock", () => {
    const s = fresh(); s.magic = { blood: 0 };
    expect(state(s, "vampire")).toBe("open");
  });
  it("meeting every condition unlocks the race", () => {
    const s = fresh(); s.magic = { transformation: 0 }; s.classesSeen = Array.from({ length: 15 }, (_, i) => `C${i}`);
    expect(state(s, "changeling")).toBe("ready");
  });
  it("the hero's own race is shown as current, never as an ascension offer", () => {
    const s = fresh(); s.char = { ...s.char, race: "vampire" };
    expect(state(s, "vampire")).toBe("current");
  });
  it("an exact-count path that overshoots is closed", () => {
    const s = fresh(); s.magic = { soul: 0 }; s.stats["soulDeaths"] = 2;
    expect(state(s, "ghost")).toBe("closed");
  });
  it("closeness is the mean of capped requirement progress", () => {
    const s = fresh(); s.stats["bloodKills"] = 100; s.stats["lifestealHeal"] = 0;
    expect(pathCloseness(path(s, "vampire"))).toBe(0.25);
    s.stats["bloodKills"] = 500; s.stats["lifestealHeal"] = 99999;
    expect(pathCloseness(path(s, "vampire"))).toBe(1);
  });
});
