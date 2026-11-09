import { describe, expect, it } from "vitest";
import { combatTurn, craftTool, enterDungeon, equipGear, equipRanged, newGame, sightRadius, startCombat } from "@/game/engine";
import { SLOT_INFO, MATERIALS } from "@/game/data";
import { TOOLS, BASE_SIGHT } from "@/game/items";

const fresh = () => { const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" }); s.gold = 1e6; s.inv = { oak_log: 20, hide: 5, rose: 10, slime_gel: 5 }; return s; };
const fight = (s: ReturnType<typeof fresh>) => { enterDungeon(s, 1); const m = s.dungeon!.monsters.find((x) => !x.boss)!; m.hp = m.maxHp = 1e7; startCombat(s, m); return m; };

describe("off-hand & torches", () => {
  it("the shield slot is called Off-hand", () => { expect(SLOT_INFO.shield.name).toBe("Off-hand"); });
  it("every torch recipe uses real materials", () => {
    for (const t of TOOLS.filter((x) => x.kind === "torch")) for (const [m] of t.recipe) expect(MATERIALS[m], `${t.id}:${m}`).toBeDefined();
  });
  it("a torch widens dungeon sight", () => {
    const s = fresh(); expect(sightRadius(s)).toBe(BASE_SIGHT);
    craftTool(s, "torch"); equipRanged(s, "torch"); expect(sightRadius(s)).toBe(BASE_SIGHT + 1);
  });
  it("attacking with a torch adds a fire strike", () => {
    const s = fresh(); craftTool(s, "torch"); equipRanged(s, "torch"); fight(s);
    combatTurn(s, "attack"); expect(s.combat!.log.some((l) => l.startsWith("Torch hits"))).toBe(true);
  });
  it("defending with a torch scorches the attacker", () => {
    const s = fresh(); craftTool(s, "torch"); equipRanged(s, "torch"); fight(s);
    let hit = false; for (let i = 0; i < 20 && !hit; i++) { s.hp = 1e6; combatTurn(s, "defend"); hit = s.combat!.log.some((l) => l.startsWith("Torch scorches")); }
    expect(hit).toBe(true);
  });
  it("equipping a shield puts the torch away", () => {
    const s = fresh(); craftTool(s, "torch"); equipRanged(s, "torch");
    s.gear.push({ ...s.gear[0]!, id: "sh1", slot: "shield" } as never); equipGear(s, "sh1");
    expect(s.ranged).toBeUndefined();
  });
});
