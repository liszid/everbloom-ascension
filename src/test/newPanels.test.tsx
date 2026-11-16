import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ForgePanel, KitchenPanel } from "@/game/Panels";
import { CrafteryPanel, GatherPanel } from "@/game/VillagePanels";
import { craftTool, newGame } from "@/game/engine";

const fresh = () => { const s = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" }); s.gold = 1e9; return s; };
const noop = () => {};

describe("new crafting panels render", () => {
  it("Forge shows the weapon type for the chosen materials", () => {
    const s = fresh(); s.inv = { oak_log: 4, iron_ingot: 2 };
    render(<ForgePanel s={s} onClose={noop} onCraft={noop} onEnhance={noop} onRepair={noop} onUpgrade={noop} />);
    const alls = screen.getAllByRole("button", { name: "All" }); for (const b of alls) fireEvent.click(b);
    expect(screen.getAllByText(/Axe/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Closest mixes/)).toBeTruthy();
  });
  it("Kitchen opens on the recipe book", () => {
    render(<KitchenPanel s={fresh()} onClose={noop} onCook={noop} onRecipe={noop} />);
    expect(screen.getByText("Hearty Fish Stew")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Cook & eat" }).length).toBeGreaterThan(5);
  });
  it("Craftery shows the grade and upgrade of an owned torch", () => {
    const s = fresh(); s.inv = { oak_log: 2, hide: 1 }; craftTool(s, "torch");
    render(<CrafteryPanel s={s} onClose={noop} onCraft={noop} onRanged={noop} onUpgrade={noop} onBrew={noop} onUsePotion={noop} />);
    fireEvent.click(screen.getByRole("button", { name: /Torch/ }));
    expect(screen.getByRole("button", { name: /Upgrade to Uncommon/ })).toBeTruthy();
  });
  it("Gathering window lists the Lv 100 materials", () => {
    render(<GatherPanel s={fresh()} spot="mine" onClose={noop} onGather={noop} onUpgrade={noop} />);
    expect(screen.getByText("Voidite Ore")).toBeTruthy();
    expect(screen.getByText("Lv 100")).toBeTruthy();
  });
});
