import { describe, expect, it } from "vitest";
import { DEFEND_TAKEN, combatTurn, defendMode, enterDungeon, mainSpell, newGame, startCombat } from "@/game/engine";
import { SPELLS } from "@/game/magic";

const fresh = () => newGame({ name: "T", gender: "male", race: "human", bg: "farmer" });
const fireSpells = SPELLS.filter((x) => x.school === "fire").slice(0, 3).map((x) => x.id);

describe("battle buttons", () => {
  it("no equipped spell means no quick-cast spell", () => {
    expect(mainSpell(fresh())).toBeNull();
  });
  it("quick-cast uses the first equipped spell when levels are equal", () => {
    const s = fresh(); s.spells = [...fireSpells]; s.spellSlots = [fireSpells[1]!, fireSpells[0]!];
    expect(mainSpell(s)!.skill.spellId).toBe(fireSpells[1]);
  });
  it("quick-cast prefers the highest-level equipped spell", () => {
    const s = fresh(); s.spells = [...fireSpells]; s.spellSlots = [fireSpells[0]!, fireSpells[1]!, fireSpells[2]!];
    s.spellLv = { [fireSpells[2]!]: 4, [fireSpells[1]!]: 2 };
    expect(mainSpell(s)!.skill.spellId).toBe(fireSpells[2]);
  });
  it("a learned but unequipped spell is never the quick-cast", () => {
    const s = fresh(); s.spells = [...fireSpells]; s.spellSlots = [fireSpells[0]!]; s.spellLv = { [fireSpells[2]!]: 9 };
    expect(mainSpell(s)!.skill.spellId).toBe(fireSpells[0]);
  });
  it("defend uses the off-hand: shield, torch, or a plain brace", () => {
    const s = fresh(); expect(defendMode(s)).toBe("brace");
    s.ranged = "torch"; expect(defendMode(s)).toBe("torch");
    s.ranged = undefined; s.equip.shield = "sh1"; expect(defendMode(s)).toBe("shield");
  });
  it("a shield block takes 30% damage instead of 50%", () => {
    expect(DEFEND_TAKEN.brace).toBe(0.5); expect(DEFEND_TAKEN.shield).toBe(0.3);
    const s = fresh(); s.equip.shield = "sh1"; enterDungeon(s, 1);
    const m = s.dungeon!.monsters.find((x) => !x.boss)!; m.hp = m.maxHp = 1e7; startCombat(s, m);
    combatTurn(s, "defend"); expect(s.combat!.log.some((l) => l.includes("raise your shield"))).toBe(true);
  });
});
