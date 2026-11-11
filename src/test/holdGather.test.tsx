import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { GatherPanel, HOLD_DELAY_MS, HOLD_EVERY_MS } from "@/game/VillagePanels";
import { newGame, type GameState } from "@/game/engine";

function Harness({ sta, onAction }: { sta: number; onAction: () => void }) {
  const [s, setS] = useState<GameState>(() => { const g = newGame({ name: "T", gender: "male", race: "human", bg: "farmer" }); g.sta = sta; return g; });
  return <GatherPanel s={s} spot="mine" onClose={() => {}} onUpgrade={() => {}}
    onGather={() => { onAction(); setS((p) => ({ ...p, sta: p.sta - 2 })); }} />;
}
const mineButton = () => screen.getAllByRole("button").find((b) => /Mine|Too tired/.test(b.textContent ?? ""))!;

describe("hold to keep gathering", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps mining while held and stops when released", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    render(<Harness sta={200} onAction={onAction} />);
    fireEvent.pointerDown(mineButton(), { button: 0, pointerId: 1 });
    expect(onAction).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(HOLD_DELAY_MS); });
    for (let i = 0; i < 4; i++) act(() => { vi.advanceTimersByTime(HOLD_EVERY_MS); });
    expect(onAction).toHaveBeenCalledTimes(5);
    fireEvent.pointerUp(mineButton(), { button: 0, pointerId: 1 });
    act(() => { vi.advanceTimersByTime(HOLD_EVERY_MS * 10); });
    expect(onAction).toHaveBeenCalledTimes(5);
  });

  it("stops by itself when stamina runs out", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    render(<Harness sta={7} onAction={onAction} />); // enough for 3 actions at 2 stamina each
    fireEvent.pointerDown(mineButton(), { button: 0, pointerId: 1 });
    // advance one beat at a time so the screen updates between actions, as it does in the browser
    act(() => { vi.advanceTimersByTime(HOLD_DELAY_MS); });
    for (let i = 0; i < 20; i++) act(() => { vi.advanceTimersByTime(HOLD_EVERY_MS); });
    expect(onAction).toHaveBeenCalledTimes(3);
  });
});
