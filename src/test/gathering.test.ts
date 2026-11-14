import { describe, expect, it } from "vitest";
import { SPOTS, SPOT_MAX, legacyKeep, spotMats, spotUpgradeCost, type SpotId } from "@/game/gathering";
import { MATERIALS, getMat } from "@/game/data";
import { gatherSpot, migrateSave, newGame, spotMatsFor } from "@/game/engine";

const ids = Object.keys(SPOTS) as SpotId[];

describe("gathering spot levels", () => {
  it("spots go up to level 100", () => { expect(SPOT_MAX).toBe(100); });

  it("a new tier opens every 10 levels: tier T unlocks at level T×10", () => {
    for (const id of ids) for (const [m, l] of SPOTS[id].mats) expect(l, m).toBe(Math.max(1, getMat(m).tier * 10));
    expect(spotMats("mine", 9)).not.toContain("iron_ore");
    expect(spotMats("mine", 10)).toContain("iron_ore");
    expect(spotMats("mine", 19)).not.toContain("silver_ore");
    expect(spotMats("mine", 20)).toContain("silver_ore");
  });

  it("every spot offers every tier from 0 to 9 by Lv 90 and the forest and mine reach tier 10 at Lv 100", () => {
    for (const id of ids) {
      for (const [m] of SPOTS[id].mats) expect(MATERIALS[m], `${id}: ${m}`).toBeDefined();
      const tiers = new Set(spotMats(id, 90).map((m) => getMat(m).tier));
      for (let t = 0; t <= 9; t++) expect(tiers.has(t), `${id} tier ${t}`).toBe(true);
    }
    expect(getMat(spotMats("forest", 100).at(-1)!).tier).toBe(10);
    expect(getMat(spotMats("mine", 100).at(-1)!).tier).toBe(10);
  });

  it("old saves keep materials they had unlocked under the old levels", () => {
    expect(legacyKeep("mine", 30)).toContain("aetherium_ore");
    const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" });
    delete s.spotKeep; s.spots = { mine: 10 };
    migrateSave(s);
    expect(spotMatsFor(s, "mine")).toEqual(expect.arrayContaining(["copper_ore", "iron_ore", "silver_ore"]));
    s.sta = 100; expect(gatherSpot(s, "mine", "silver_ore")).toBe(true);
    expect(gatherSpot(s, "mine", "gold_ore")).toBe(false);
  });

  it("new characters start with nothing grandfathered", () => {
    const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" });
    expect(migrateSave(s)).toBe(false);
    expect(spotMatsFor(s, "mine")).toEqual(["stone", "copper_ore"]);
  });

  it("upgrade cost grows smoothly to level 100", () => {
    expect(spotUpgradeCost("mine", 1).gold).toBe(40);
    expect(spotUpgradeCost("mine", 99).gold).toBeLessThan(200000);
    for (let l = 2; l < 100; l++) expect(spotUpgradeCost("mine", l).gold).toBeGreaterThan(spotUpgradeCost("mine", l - 1).gold);
  });

  it("everything caught at the pond can be cooked", () => {
    for (const [m] of SPOTS.pond.mats) expect(getMat(m).food, m).toBeGreaterThan(0);
  });

  it("every animal farm material is food or processes into a gear material at the Tannery", () => {
    for (const [m] of SPOTS.ranch.mats) {
      const mt = getMat(m);
      if (mt.food) continue;
      expect(mt.refine?.station, m).toBe("tan");
      expect(getMat(mt.refine!.to).tier, m).toBe(Math.min(10, mt.tier + 1));
    }
  });

  it("tier-9 Aetherwood and Aetherium refine into tier-10 materials", () => {
    expect(getMat(getMat("aether_log").refine!.to).tier).toBe(10);
    expect(getMat("aether_log").refine!.station).toBe("carve");
    expect(getMat(getMat("aetherium_ore").refine!.to).tier).toBe(10);
    expect(getMat("aetherium_ore").refine!.station).toBe("smelt");
    for (const id of ids) for (const [m] of SPOTS[id].mats) { const r = getMat(m).refine; if (r) expect(getMat(r.to).tier, m).toBeLessThanOrEqual(10); }
  });
});
