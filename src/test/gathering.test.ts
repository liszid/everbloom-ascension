import { describe, expect, it } from "vitest";
import { spotMats } from "@/game/gathering";

describe("gathering spot levels", () => {
  it("mine gives stone at L1, copper at L3, iron at L5, silver at L10", () => {
    expect(spotMats("mine", 1)).toEqual(["stone"]);
    expect(spotMats("mine", 2)).not.toContain("copper_ore");
    expect(spotMats("mine", 3)).toContain("copper_ore");
    expect(spotMats("mine", 4)).not.toContain("iron_ore");
    expect(spotMats("mine", 5)).toContain("iron_ore");
    expect(spotMats("mine", 9)).not.toContain("silver_ore");
    expect(spotMats("mine", 10)).toContain("silver_ore");
  });
});
