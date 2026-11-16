import { describe, expect, it } from "vitest";
import { BESTIARY, DND_MONSTERS, MON_DEF, themePool } from "@/game/bestiary";
import { MATERIALS } from "@/game/data";
import { THEMES, themeFor } from "@/game/themes";
import { floorTier, makeMonster } from "@/game/engine";

const THEME_NAMES = THEMES.map((t) => t.name as string);

describe("bestiary", () => {
  it("adds the D&D monsters with unique ids next to the originals", () => {
    expect(DND_MONSTERS.length).toBe(92);
    expect(new Set(BESTIARY.map((m) => m.id)).size).toBe(BESTIARY.length);
    expect(BESTIARY.length).toBeGreaterThanOrEqual(100);
  });
  it("every monster drops real materials and lives in real dungeon themes", () => {
    for (const m of BESTIARY) {
      for (const d of m.drops) expect(MATERIALS[d], `${m.id} drop ${d}`).toBeDefined();
      for (const e of m.envs ?? []) expect(THEME_NAMES, `${m.id} env ${e}`).toContain(e);
    }
  });
  it("drops never exceed the monster's tier by more than one", () => {
    for (const m of DND_MONSTERS) for (const d of m.drops) expect(MATERIALS[d]!.tier, `${m.id} → ${d}`).toBeLessThanOrEqual(m.tier + 1);
  });
  it("Tower floors spawn monsters native to the floor's theme", () => {
    for (const f of [1, 7, 13, 25, 61, 150, 333, 610, 905]) {
      const theme = themeFor(f).name; const pool = themePool(theme, floorTier(f));
      if (!pool.length) continue;
      for (let i = 0; i < 30; i++) expect(MON_DEF[makeMonster(f, 0, 0).def]!.envs, `floor ${f} (${theme})`).toContain(theme);
    }
  });
  it("the Mind Flayer lives in the Mind Flayer Hive and Treants in the Feywild", () => {
    expect(MON_DEF["mind_flayer"]!.envs).toContain("Mind Flayer Hive");
    expect(MON_DEF["treant"]!.envs).toContain("Feywild Grove");
  });
});
