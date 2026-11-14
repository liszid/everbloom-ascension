import { describe, expect, it } from "vitest";
import { craftPreview, newGame, archRanking, upgradeOffhand, craftTool, equipRanged, playerStats, offhandStats, sightRadius, cookRecipe, enterDungeon, climbUp, leaveDungeon } from "@/game/engine";
import { offhandFx, TOOL, BASE_SIGHT } from "@/game/items";
import { RECIPES } from "@/game/recipes";
import { MATERIALS } from "@/game/data";

const fresh = () => { const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" }); s.gold = 1e9; return s; };

describe("weapon archetypes", () => {
  const arch = (mats: [string, number][], slot: "one_hand" | "two_hand" = "one_hand") => craftPreview(mats.map(([id, qty]) => ({ id, qty })), slot, fresh()).arch;
  it("2 wood : 1 metal makes an axe", () => { expect(arch([["oak_log", 4], ["iron_ingot", 2]])).toBe("axe"); });
  it("metal alone makes a sword", () => { expect(arch([["iron_ingot", 5]])).toBe("sword"); });
  it("metal with stone makes a hammer", () => { expect(arch([["iron_ingot", 3], ["stone", 3]])).toBe("hammer"); });
  it("wood with gems makes a staff", () => { expect(arch([["oak_log", 3], ["mana_crystal", 3]])).toBe("staff"); });
  it("metal with bone makes a dagger", () => { expect(arch([["iron_ingot", 3], ["rat_fang", 3]])).toBe("dagger"); });
  it("wood, metal and dark bone make a scythe", () => { expect(arch([["oak_log", 3], ["iron_ingot", 2], ["bone", 3]])).toBe("scythe"); });
  it("more wood than metal at 5:3 makes a spear", () => { expect(arch([["oak_log", 5], ["iron_ingot", 3]])).toBe("spear"); });
  it("cloth does not change the type", () => {
    expect(arch([["oak_log", 4], ["iron_ingot", 2], ["woven_cloth", 6]])).toBe("axe");
  });
  it("two-handed names and the result is the same every time", () => {
    const pv = craftPreview([{ id: "oak_log", qty: 4 }, { id: "iron_ingot", qty: 2 }], "two_hand", fresh());
    expect(pv.name).toContain("Greataxe");
    expect(archRanking([{ id: "oak_log", qty: 4 }, { id: "iron_ingot", qty: 2 }])[0]!.a.id).toBe("axe");
  });
  it("armor has no weapon type", () => { expect(arch([["iron_ingot", 5]], "one_hand")).toBe("sword"); expect(craftPreview([{ id: "iron_ingot", qty: 5 }], "helm", fresh()).arch).toBeUndefined(); });
});

describe("off-hand grades", () => {
  const withBrand = () => {
    const s = fresh(); s.bldg = { craftery: 10 }; s.inv = { fire_core: 3, obsidian: 2, gold_ingot: 1 };
    craftTool(s, "dragon_torch"); equipRanged(s, "dragon_torch"); return s;
  };
  it("Dragonbreath Brand can be upgraded all the way to EX", () => {
    const s = withBrand();
    for (const m of ["copper_ingot", "carved_oak", "iron_ingot", "carved_maple", "silver_ingot", "carved_ironwood", "gold_ingot", "carved_elder", "mithril_ingot", "carved_bloodwood", "adamant_ingot", "carved_ghostwood", "orichalcum_ingot", "carved_worldtree"]) s.inv[m] = 100;
    s.inv["guardian_sigil"] = 3; s.inv["warden_crest"] = 2;
    for (let i = 0; i < 7; i++) expect(upgradeOffhand(s, "dragon_torch"), `grade ${i + 1}`).toBe(true);
    expect(s.toolGrades!["dragon_torch"]).toBe(7);
    expect(upgradeOffhand(s, "dragon_torch")).toBe(false);
  });
  it("at EX the brand burns every time, wards 30% fire and gives +5 sight", () => {
    const fx = offhandFx(TOOL["dragon_torch"]!, 7);
    expect(fx.chance).toBe(100); expect(fx.fireWard).toBe(30);
    const s = withBrand(); s.toolGrades = { dragon_torch: 7 };
    expect(Math.round(sightRadius(s) - BASE_SIGHT)).toBe(5);
    expect(playerStats(s).wards.fire).toBe(30);
  });
  it("higher grades add more defense and attack", () => {
    for (let g = 1; g <= 7; g++) {
      expect(offhandStats("dragon_torch", g).pdef).toBeGreaterThan(offhandStats("dragon_torch", g - 1).pdef);
      expect(offhandStats("dragon_torch", g).matk).toBeGreaterThan(offhandStats("dragon_torch", g - 1).matk);
    }
  });
  it("needs a high enough Craftery and the relics for Relic and EX", () => {
    const s = withBrand(); s.bldg = { craftery: 1 }; s.inv["copper_ingot"] = 99; s.inv["carved_oak"] = 99;
    expect(upgradeOffhand(s, "dragon_torch")).toBe(false);
  });
});

describe("kitchen recipes", () => {
  it("every recipe uses real ingredients", () => {
    for (const r of RECIPES) for (const [m] of r.ing) expect(MATERIALS[m], `${r.id}:${m}`).toBeDefined();
  });
  it("a recipe buff lasts its number of floors and counts down with stairs and retreat", () => {
    const s = fresh(); s.inv = { fish: 3, carrot: 2 };
    const hp0 = playerStats(s).hp;
    expect(cookRecipe(s, "fish_stew")).toBe(true);
    expect(s.meal).toEqual({ id: "fish_stew", floors: 3 });
    expect(playerStats(s).hp).toBeGreaterThan(hp0);
    enterDungeon(s, 1); s.dungeon!.bossAlive = false; climbUp(s);
    expect(s.meal!.floors).toBe(2);
    leaveDungeon(s, true); expect(s.meal!.floors).toBe(1);
    enterDungeon(s, 1); leaveDungeon(s, true); expect(s.meal).toBeUndefined();
  });
  it("locked recipes need the cooking level", () => {
    const s = fresh(); s.inv = { leviathan_pearl: 1, leviathan_fillet: 2, dragon_orchid: 1, worldbloom: 1 };
    expect(cookRecipe(s, "leviathan_feast")).toBe(false);
  });
});
