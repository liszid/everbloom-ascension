import { useEffect, useState } from "react";

export interface Settings {
  fullscreen: boolean; resScale: number; shake: boolean; dmgNumbers: boolean; lootToasts: boolean; detailedLog: boolean; uiScale: "small" | "medium" | "large";
  master: number; music: number; sfx: number; ambient: number; ui: number; musicOn: boolean; sfxOn: boolean;
  promptSpeed: Speed; dialogueSpeed: Speed; combatSpeed: Speed;
  autoLoot: boolean; autoSellCommon: boolean; confirmRareSell: boolean; confirmNextFloor: boolean;
  largeText: boolean; colorblind: boolean; highContrast: boolean; reducedMotion: boolean;
}
export type Speed = "slow" | "normal" | "fast" | "instant";
export const SPEED_MS: Record<Speed, number> = { slow: 4500, normal: 3000, fast: 1600, instant: 700 };
export const DEFAULT_SETTINGS: Settings = {
  fullscreen: false, resScale: 100, shake: true, dmgNumbers: true, lootToasts: true, detailedLog: true, uiScale: "medium",
  master: 70, music: 40, sfx: 70, ambient: 40, ui: 60, musicOn: false, sfxOn: true,
  promptSpeed: "normal", dialogueSpeed: "normal", combatSpeed: "normal",
  autoLoot: true, autoSellCommon: false, confirmRareSell: true, confirmNextFloor: true,
  largeText: false, colorblind: false, highContrast: false, reducedMotion: false,
};
const KEY = "thornvale-settings";
let current: Settings = DEFAULT_SETTINGS;
const subs = new Set<(s: Settings) => void>();
let watchingFullscreen = false;
export function loadSettings() {
  try { const raw = localStorage.getItem(KEY); if (raw) current = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }; } catch { /* ignore */ }
  if (!watchingFullscreen) {
    watchingFullscreen = true;
    document.addEventListener("fullscreenchange", () => {
      current = { ...current, fullscreen: !!document.fullscreenElement };
      try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
      subs.forEach((f) => f(current));
    });
  }
  current = { ...current, fullscreen: !!document.fullscreenElement };
  applySettings(current); subs.forEach((f) => f(current)); return current;
}
export function getSettings() { return current; }
export function updateSettings(p: Partial<Settings>) {
  current = { ...current, ...p };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
  applySettings(current); subs.forEach((f) => f(current));
  if ("fullscreen" in p) {
    if (p.fullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => updateSettings({ fullscreen: false }));
    if (!p.fullscreen && document.fullscreenElement) void document.exitFullscreen?.();
  }
}
export function useSettings(): Settings {
  const [s, set] = useState(current);
  useEffect(() => { subs.add(set); return () => { subs.delete(set); }; }, []);
  return s;
}
function applySettings(s: Settings) {
  if (typeof document === "undefined") return;
  const base = { small: 16, medium: 19, large: 22 }[s.uiScale] + (s.largeText ? 3 : 0);
  const r = document.documentElement;
  r.style.fontSize = `${base}px`;
  r.style.setProperty("--tile-scale", String(s.resScale / 100));
  r.classList.toggle("hc", s.highContrast); r.classList.toggle("cb", s.colorblind); r.classList.toggle("rm", s.reducedMotion);
  music.toggle(s.musicOn);
}

// ---------------- audio (WebAudio, no assets) ----------------
let ctx: AudioContext | null = null;
function ac() { if (!ctx) { try { ctx = new AudioContext(); } catch { return null; } } return ctx; }
type Sfx = "hit" | "crit" | "hurt" | "ui" | "loot" | "level" | "evolve" | "fail" | "coin";
const TONES: Record<Sfx, [number, number, OscillatorType][]> = {
  hit: [[220, 0.06, "square"]], crit: [[330, 0.05, "square"], [660, 0.08, "square"]], hurt: [[110, 0.12, "sawtooth"]],
  ui: [[880, 0.03, "triangle"]], loot: [[660, 0.06, "triangle"], [990, 0.08, "triangle"]], coin: [[1200, 0.05, "square"], [1600, 0.06, "square"]],
  level: [[523, 0.1, "triangle"], [659, 0.1, "triangle"], [784, 0.18, "triangle"]],
  evolve: [[392, 0.14, "triangle"], [523, 0.14, "triangle"], [659, 0.14, "triangle"], [1046, 0.4, "triangle"]],
  fail: [[200, 0.1, "sawtooth"], [140, 0.2, "sawtooth"]],
};
export function sfx(kind: Sfx) {
  const s = current; if (!s.sfxOn) return;
  const vol = (s.master / 100) * ((kind === "ui" ? s.ui : s.sfx) / 100) * 0.15; if (vol <= 0) return;
  const a = ac(); if (!a) return;
  let t = a.currentTime;
  for (const [f, d, type] of TONES[kind]) {
    const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d); t += d * 0.9;
  }
}
const music = (() => {
  let timer: ReturnType<typeof setInterval> | null = null; let i = 0;
  const notes = [262, 330, 392, 330, 294, 349, 440, 349, 262, 330, 392, 523, 494, 392, 330, 294];
  return {
    toggle(on: boolean) {
      if (on && !timer) timer = setInterval(() => {
        const s = current; const a = ctx; if (!a || a.state !== "running") return;
        const vol = (s.master / 100) * (s.music / 100) * 0.05; if (!vol) return;
        const o = a.createOscillator(), g = a.createGain(); o.type = "triangle"; o.frequency.value = notes[i++ % notes.length]!;
        const t = a.currentTime; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.5);
      }, 420);
      if (!on && timer) { clearInterval(timer); timer = null; }
    },
  };
})();
export function unlockAudio() { const a = ac(); if (a && a.state === "suspended") void a.resume(); }
