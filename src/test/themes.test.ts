import { describe, expect, it } from "vitest";
import { themeFor, themeIndex } from "@/game/themes";
describe("dungeon themes", () => {
  it("changes every 6 floors", () => {
    expect(themeFor(1).name).toBe("Vampire Castle");
    expect(themeFor(6).name).toBe("Vampire Castle");
    expect(themeFor(7).name).toBe("Haunted Cemetery");
    expect(themeFor(85).name).toBe("Frozen Ice Cavern");
  });
  it("cycles back after the 15th theme", () => { expect(themeIndex(91)).toBe(0); });
});
