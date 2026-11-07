import { describe, expect, it, vi } from "vitest";
import { getSettings, loadSettings, updateSettings } from "@/game/settings";

describe("fullscreen state", () => {
  it("stays enabled until the browser actually exits fullscreen", () => {
    let element: Element | null = document.documentElement;
    Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => element });
    loadSettings();
    updateSettings({ lootToasts: false });
    expect(getSettings().fullscreen).toBe(true);
    element = null;
    document.dispatchEvent(new Event("fullscreenchange"));
    expect(getSettings().fullscreen).toBe(false);
  });
  it("requests fullscreen on the stable document root", () => {
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });
    const request = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, "requestFullscreen", { configurable: true, value: request });
    updateSettings({ fullscreen: true });
    expect(request).toHaveBeenCalledTimes(1);
  });
});