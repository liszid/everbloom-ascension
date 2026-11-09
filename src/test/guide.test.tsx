import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Guide } from "@/game/Guide";

describe("game guide", () => {
  it("opens every topic without errors and explains the 4-spell limit", () => {
    render(<Guide onBack={() => {}} />);
    const topics = screen.getAllByRole("button", { expanded: false });
    expect(topics.length).toBeGreaterThanOrEqual(12);
    for (const t of topics) fireEvent.click(t);
    // last opened topic is visible; reopen Magic Tower and check the spell cap text
    fireEvent.click(screen.getByRole("button", { name: /Magic Tower/ }));
    expect(screen.getByText(/equip up to/i).textContent).toMatch(/4 spells/);
  });
});
