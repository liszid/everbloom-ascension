import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PartyPanel } from "@/game/GuildPanels";
import { ResultView } from "@/game/Combat";
import { ProfilePanel } from "@/game/Profile";
import { compEquip, hireCompanion, learnSchool, newGame, type Gear } from "@/game/engine";

const fresh = () => { const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" }); s.gold = 1e9; return s; };
const noop = () => {};

describe("companion and race-path screens", () => {
  it("Party equipment tab shows the gear a companion carries", () => {
    const s = fresh(); hireCompanion(s, "warrior", true); const c = s.companions![0]!;
    const g = { id: "gx", name: "Ember Fang", slot: "one_hand", grade: 4, base: { patk: 40 }, element: "fire", effects: [], materials: [], avgTier: 1, dura: 9, maxDura: 9, enh: 0, crafted: 0 } as unknown as Gear;
    s.gear.push(g); compEquip(s, c.id, g.id, "one_hand");
    const { container } = render(<PartyPanel s={s} onClose={noop} onEquip={noop} onTitle={noop} onDismiss={noop} />);
    expect(container.querySelector(".held-wrap")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Equipment/ }));
    expect(screen.getByText("Ember Fang")).toBeTruthy();
    expect(screen.getByText(/leaves your bag/)).toBeTruthy();
  });
  it("battle result lists race-path progress", () => {
    const s = fresh();
    s.result = { won: true, name: "Wolf", icon: "🐺", boss: 0, floor: 3, dealt: 1, taken: 1, turns: 1, xp: 1, gold: 1, loot: [], gains: [], hp: 1, maxHp: 1, sold: 0, collected: true,
      paths: [{ icon: "🧛", label: "HP regained through life steal", add: 120, cur: 4320, need: 10000 }] };
    render(<ResultView s={s} onCollect={noop} onContinue={noop} />);
    expect(screen.getByText("Race path progress")).toBeTruthy();
    expect(screen.getByText(/\+120/)).toBeTruthy();
  });
  it("Profile › Classes shows started race paths with how they are earned", () => {
    const s = fresh(); s.stats["lifestealHeal"] = 500; learnSchool(s, "herbal");
    render(<ProfilePanel s={s} onClose={noop} onTitle={noop} onEquip={noop} />);
    fireEvent.click(screen.getByRole("button", { name: "Classes" }));
    expect(screen.getByText("Race paths")).toBeTruthy();
    expect(screen.getByText(/Counts even before you learn Blood Magic/)).toBeTruthy();
  });
});
