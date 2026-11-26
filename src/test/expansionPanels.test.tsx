import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CrafteryPanel } from "@/game/VillagePanels";
import { ProfilePanel } from "@/game/Profile";
import { newGame, xpForLevel } from "@/game/engine";

const fresh = () => { const s = newGame({ name: "T", gender: "Male", race: "human", bg: "farmhand" }); s.gold = 1e6; return s; };
const noop = () => {};

describe("expansion screens", () => {
  it("Craftery › Alchemy lists elixirs and lets you brew when you have the herbs", () => {
    const s = fresh(); s.inv = { herb_leaf: 2, daisy: 1 };
    render(<CrafteryPanel s={s} onClose={noop} onCraft={noop} onRanged={noop} onUpgrade={noop} onBrew={noop} onUsePotion={noop} />);
    fireEvent.click(screen.getByRole("button", { name: /Alchemy/ }));
    expect(screen.getByText(/Lesser Health Elixir/)).toBeTruthy();
    expect((screen.getAllByRole("button", { name: "Brew" })[0] as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /Oils/ }));
    expect(screen.getByText(/Serpent Venom Oil/)).toBeTruthy();
  });
  it("Profile › Classes shows the playstyle class, specializations, synergies and the codex", () => {
    const s = fresh(); s.aff = {}; s.skills["farming"] = xpForLevel(30); s.skills["two_hand"] = xpForLevel(28); s.magic = { transformation: 25 * 81 };
    render(<ProfilePanel s={s} onClose={noop} onTitle={noop} onEquip={noop} />);
    fireEvent.click(screen.getByRole("button", { name: "Classes" }));
    expect(screen.getByText("Playstyle class")).toBeTruthy();
    expect(screen.getAllByText("Druid").length).toBeGreaterThan(0);
    expect(screen.getByText("Specializations")).toBeTruthy();
    expect(screen.getByText("Build synergies")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Class codex/ }));
    expect(screen.getByText(/Phantom Assassin/)).toBeTruthy();
  });
});
