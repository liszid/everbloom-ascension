import { describe, expect, it } from "vitest";
import { craftTool, learnSpells, newGame, playerStats, restAtHome, storageMax, toggleSpell, upgradeBldg, equippedSpells } from "@/game/engine";

const fresh = () => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmer" }); s.gold = 1e8; return s; };

describe("building levels", () => {
  it("home storage starts at 20 and grows by 10 per level", () => {
    const s = fresh(); expect(storageMax(s)).toBe(20);
    upgradeBldg(s, "house"); expect(storageMax(s)).toBe(30);
  });
  it("rest heals based on home level", () => {
    const s = fresh(); const max = playerStats(s).hp; s.hp = 1; restAtHome(s);
    expect(s.hp).toBe(1 + Math.round(max * 0.4));
  });
  it("advanced off-hands need higher Craftery level", () => {
    const s = fresh(); s.inv = { iron_ingot: 20, silver_ingot: 20 };
    expect(craftTool(s, "pistol")).toBe(false);
    upgradeBldg(s, "craftery"); upgradeBldg(s, "craftery");
    expect(craftTool(s, "pistol")).toBe(true);
  });
});

describe("spell slots", () => {
  it("at most 4 Magic Tower spells equipped", () => {
    const s = fresh(); s.xp = 1e9;
    s.magic = { fire: 1e6, water: 1e6, wind: 1e6 }; learnSpells(s);
    expect(s.spells!.length).toBeGreaterThan(4);
    expect(equippedSpells(s).length).toBe(4);
    const extra = s.spells!.find((x) => !equippedSpells(s).includes(x))!;
    expect(toggleSpell(s, extra)).toBe(false);
  });
});
