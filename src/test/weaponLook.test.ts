import { describe, expect, it } from "vitest";
import { weaponLook } from "@/game/weaponLook";

const g = (name: string, materials: { id: string; qty: number }[], avgTier: number, id = "w1") => ({ id, name, materials, avgTier, element: "none" as const });

describe("equipped weapon look follows its materials and tier", () => {
  it("an oak axe looks like a cheap wooden weapon", () => {
    const l = weaponLook(g("Oak Axe", [{ id: "oak_log", qty: 4 }, { id: "copper_ore", qty: 1 }], 0));
    expect(l.fam).toBe("wood");
    expect(l.q).toBe(0);
    expect(l.glow).toBeUndefined();
  });
  it("an aetherium blade (tier 10) gets the majestic style", () => {
    const l = weaponLook(g("Aetherium Blade", [{ id: "aetherium_ingot", qty: 6 }], 10));
    expect(l.fam).toBe("metal");
    expect(l.q).toBe(3);
    expect(l.glow).toBeDefined();
  });
  it("the named material sets the colour, so different metals look different", () => {
    const iron = weaponLook(g("Iron Blade", [{ id: "iron_ingot", qty: 5 }], 2));
    const gold = weaponLook(g("Gold Blade", [{ id: "gold_ingot", qty: 5 }], 4));
    expect(iron.head).not.toBe(gold.head);
    expect(iron.q).toBe(0);
    expect(gold.q).toBe(1);
  });
});
