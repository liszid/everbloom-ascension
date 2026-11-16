import { describe, expect, it } from "vitest";
import { SPEC, specRank } from "@/game/specializations";
import { activeSynergies, newGame, playerStats, setSpec } from "@/game/engine";

const fresh = () => newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" });

describe("specializations", () => {
  it("Faith path: 10 prayers unlock Acolyte, 30 unlock Priest", () => {
    const t = SPEC["faith"]!;
    expect(specRank(t, { prayers: 9 })).toBe(-1);
    expect(t.ranks[specRank(t, { prayers: 10 })]!.name).toBe("Acolyte");
    expect(t.ranks[specRank(t, { prayers: 30 })]!.name).toBe("Priest");
  });
  it("a locked path cannot be chosen; an unlocked one adds its bonus", () => {
    const s = fresh();
    expect(setSpec(s, "faith")).toBe(false);
    const mp = playerStats(s).mp; s.stats["prayers"] = 10;
    expect(setSpec(s, "faith")).toBe(true);
    expect(playerStats(s).mp).toBeGreaterThan(mp);
  });
});

describe("synergies", () => {
  it("Caldera Sovereign: a Tiefling holding a torch gets +35% fire damage", () => {
    const s = newGame({ name: "T", gender: "Male", race: "tiefling", bg: "farmhand" });
    expect(activeSynergies(s).map((x) => x.id)).not.toContain("caldera");
    s.tools = { torch: 1 }; s.ranged = "torch";
    expect(activeSynergies(s).map((x) => x.id)).toContain("caldera");
    expect(playerStats(s).synEl.fire).toBeCloseTo(0.35);
  });
});
