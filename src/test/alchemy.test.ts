import { describe, expect, it } from "vitest";
import { POTIONS, OIL_BATTLES, TONIC_FLOORS } from "@/game/alchemy";
import { MATERIALS } from "@/game/data";
import { brewPotion, usePotion, newGame, playerStats, combatTurn, startCombat, makeMonster, enterDungeon, climbUp } from "@/game/engine";

const fresh = () => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" }); s.gold = 100000; s.bldg = { craftery: 10 }; return s; };

describe("alchemy", () => {
  it("every recipe uses real materials", () => {
    for (const p of POTIONS) for (const [m] of p.recipe) expect(MATERIALS[m], `${p.id} needs ${m}`).toBeDefined();
  });
  it("brewing spends materials and counts toward potionsBrewed", () => {
    const s = fresh(); s.inv = { herb_leaf: 4, daisy: 2 };
    expect(brewPotion(s, "elixir_hp_1", 5)).toBe(true);
    expect(s.potions?.["elixir_hp_1"]).toBe(4); expect(s.stats["potionsBrewed"]).toBe(4); expect(s.inv["herb_leaf"] ?? 0).toBe(0);
  });
  it("recipes are locked behind the Craftery level", () => {
    const s = fresh(); s.bldg = { craftery: 1 }; s.inv = { starblossom: 1, phoenix_ash: 1 };
    expect(brewPotion(s, "panacea")).toBe(false);
  });
  it("a health elixir restores 30% of max HP", () => {
    const s = fresh(); const p = playerStats(s); s.hp = 1; s.potions = { elixir_hp_1: 1 };
    expect(usePotion(s, "elixir_hp_1")).toBe(true);
    expect(s.hp).toBe(1 + Math.round(p.hp * 0.3));
  });
  it("oils last 3 battles and tonics 8 floors", () => {
    const s = fresh(); s.potions = { oil_flame: 1, tonic_berserk: 1 };
    usePotion(s, "oil_flame"); usePotion(s, "tonic_berserk");
    expect(s.oil).toEqual({ id: "oil_flame", left: OIL_BATTLES }); expect(s.tonic?.floors).toBe(TONIC_FLOORS);
    expect(playerStats(s).element).toBe("fire");
    enterDungeon(s, 1); s.hp = 1e9;
    for (let i = 0; i < 3; i++) { const m = makeMonster(1, 1, 1); m.hp = 1; m.maxHp = 1; m.dodge = -1000; startCombat(s, m); combatTurn(s, "attack"); s.result = undefined; }
    expect(s.oil).toBeUndefined();
    s.dungeon!.bossAlive = false; climbUp(s);
    expect(s.tonic?.floors).toBe(TONIC_FLOORS - 1);
  });
});
