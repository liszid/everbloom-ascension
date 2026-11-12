import { describe, expect, it } from "vitest";
import { SPOTS, SPOT_MAX, spotMats, type SpotId } from "@/game/gathering";
import { MATERIALS, getMat } from "@/game/data";

const ids = Object.keys(SPOTS) as SpotId[];

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

  it("every spot offers every tier from 0 to 9 by max level, unlocking in tier order", () => {
    for (const id of ids) {
      const mats = SPOTS[id].mats;
      for (const [m] of mats) expect(MATERIALS[m], `${id}: ${m}`).toBeDefined();
      const tiers = new Set(spotMats(id, SPOT_MAX).map((m) => getMat(m).tier));
      for (let t = 0; t <= 9; t++) expect(tiers.has(t), `${id} tier ${t}`).toBe(true);
      const byLevel = [...mats].sort((a, b) => a[1] - b[1]).map(([m]) => getMat(m).tier);
      expect(byLevel, id).toEqual([...byLevel].sort((a, b) => a - b));
      expect(Math.max(...mats.map(([, l]) => l)), id).toBeLessThanOrEqual(SPOT_MAX);
    }
  });

  it("existing unlocks never moved later than before", () => {
    const old: Record<string, number> = { birch_log: 3, ironwood_log: 6, elder_log: 10, copper_ore: 3, iron_ore: 5, silver_ore: 10, gold_ore: 15, mithril_ore: 22, adamant_ore: 30, shell: 2, pearl: 6, eel: 12, wool: 3, milk: 5, hide: 5, bluebell: 3, nightshade: 7, moonpetal: 12 };
    for (const id of ids) for (const [m, l] of SPOTS[id].mats) if (old[m]) expect(l, m).toBeLessThanOrEqual(old[m]!);
  });

  it("everything caught at the pond can be cooked", () => {
    for (const [m] of SPOTS.pond.mats) expect(getMat(m).food, m).toBeGreaterThan(0);
  });

  it("every animal farm material is food or processes into a gear material at the Tannery", () => {
    for (const [m] of SPOTS.ranch.mats) {
      const mt = getMat(m);
      if (mt.food) continue;
      expect(mt.refine?.station, m).toBe("tan");
      expect(getMat(mt.refine!.to).tier, m).toBe(mt.tier + 1);
    }
  });

  it("the forest's best wood is tier 9 and refined woods never exceed tier 9", () => {
    const top = spotMats("forest", SPOT_MAX).at(-1)!;
    expect(getMat(top).tier).toBe(9);
    for (const id of ids) for (const [m] of SPOTS[id].mats) { const r = getMat(m).refine; if (r) expect(getMat(r.to).tier, m).toBeLessThanOrEqual(9); }
  });
});
