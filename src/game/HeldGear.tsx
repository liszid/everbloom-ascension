// Presentation-only overlay drawing the hero's equipped main-hand weapon and off-hand item.
import type { GameState } from "./engine";
import { TOOL } from "./items";

export type WeaponShape = "sword" | "dagger" | "mace" | "wand" | "great" | "hammer" | "halberd" | "staff";
export interface Held {
  main?: { shape: WeaponShape; two: boolean; el: string; grade: number } | undefined;
  off?: { kind: "shield"; grade: number; el: string } | { kind: "torch"; id: string } | { kind: "ranged"; id: string } | undefined;
}

const EL: Record<string, string> = { fire: "#ff7a2a", water: "#4ac0ff", wind: "#9af0d0", earth: "#c08a3a", light: "#fff2a0", dark: "#b060ff", nature: "#7ae05a", void: "#ff4ad8" };
const GRADE_METAL = ["#b8bec8", "#cfd8e2", "#9fd0ff", "#c99cff", "#ffd36a", "#ff8a6a", "#7affd8", "#ffffff"];
const FLAME: Record<string, string> = { torch: "#ff9a2a", alluring_torch: "#ff7ac8", siphon_torch: "#e0203a", blinding_torch: "#fff07a", witch_torch: "#7ae05a", frost_torch: "#7ae0ff", soul_torch: "#b0a0ff", dragon_torch: "#ff4a1a" };

function shapeOf(name: string, two: boolean): WeaponShape {
  const n = name.toLowerCase();
  if (two) return /hammer/.test(n) ? "hammer" : /halberd|spear|pike/.test(n) ? "halberd" : /staff/.test(n) ? "staff" : "great";
  return /mace|club/.test(n) ? "mace" : /wand|rod/.test(n) ? "wand" : /dagger|knife/.test(n) ? "dagger" : "sword";
}

/** Reads what the hero visibly holds from their equipment. */
export function heldGearOf(s: GameState): Held {
  const g = (id?: string) => (id ? s.gear.find((x) => x.id === id) : undefined);
  const two = g(s.equip.two_hand), one = g(s.equip.one_hand), sh = g(s.equip.shield);
  const w = two ?? one;
  const el = (x?: { ench?: { el: string } | undefined; element: string }) => x?.ench?.el ?? x?.element ?? "none";
  const held: Held = {};
  if (w) held.main = { shape: shapeOf(w.name, !!two), two: !!two, el: el(w), grade: w.grade };
  if (sh) held.off = { kind: "shield", grade: sh.grade, el: el(sh) };
  else if (s.ranged && TOOL[s.ranged]) held.off = TOOL[s.ranged]!.kind === "torch" ? { kind: "torch", id: s.ranged } : { kind: "ranged", id: s.ranged };
  return held;
}

function Weapon({ m }: { m: NonNullable<Held["main"]> }) {
  const metal = GRADE_METAL[m.grade] ?? GRADE_METAL[0]!, glow = EL[m.el];
  const wood = "#6a4424", gold = "#d8a83a", ink = "#2a1c14";
  const st = { stroke: ink, strokeWidth: 1.4, strokeLinejoin: "round" as const };
  let body;
  switch (m.shape) {
    case "dagger": body = <><path d="M0 -20 L3 -4 L-3 -4 Z" fill={metal} {...st} /><rect x={-6} y={-4} width={12} height={3} rx={1} fill={gold} {...st} /><rect x={-1.6} y={-1} width={3.2} height={8} fill={wood} {...st} /></>; break;
    case "mace": body = <><rect x={-1.8} y={-18} width={3.6} height={26} fill={wood} {...st} /><circle cx={0} cy={-22} r={6} fill={metal} {...st} /><path d="M0 -31 L0 -28 M-9 -22 L-6 -22 M9 -22 L6 -22" {...st} /></>; break;
    case "wand": body = <><rect x={-1.4} y={-22} width={2.8} height={28} rx={1} fill={wood} {...st} /><circle cx={0} cy={-24} r={3.6} fill={glow ?? "#d0a0ff"} {...st} /></>; break;
    case "staff": body = <><rect x={-1.8} y={-38} width={3.6} height={50} rx={1.5} fill={wood} {...st} /><circle cx={0} cy={-40} r={5.5} fill={glow ?? "#9ad0ff"} {...st} /></>; break;
    case "hammer": body = <><rect x={-1.8} y={-30} width={3.6} height={42} fill={wood} {...st} /><rect x={-10} y={-40} width={20} height={11} rx={2} fill={metal} {...st} /></>; break;
    case "halberd": body = <><rect x={-1.6} y={-38} width={3.2} height={50} fill={wood} {...st} /><path d="M0 -48 L3 -38 L-3 -38 Z" fill={metal} {...st} /><path d="M1.6 -36 Q12 -32 10 -22 L1.6 -26 Z" fill={metal} {...st} /></>; break;
    case "great": body = <><path d="M-3.4 -40 L0 -46 L3.4 -40 L3.4 -2 L-3.4 -2 Z" fill={metal} {...st} /><rect x={-9} y={-3} width={18} height={4} rx={1.5} fill={gold} {...st} /><rect x={-1.8} y={1} width={3.6} height={10} fill={wood} {...st} /></>; break;
    default: body = <><path d="M-2.6 -28 L0 -33 L2.6 -28 L2.6 -3 L-2.6 -3 Z" fill={metal} {...st} /><rect x={-7.5} y={-4} width={15} height={3.5} rx={1.4} fill={gold} {...st} /><rect x={-1.6} y={-0.5} width={3.2} height={8} fill={wood} {...st} /></>;
  }
  return <g>{glow && m.grade >= 2 && <circle cx={0} cy={m.two ? -24 : -16} r={m.two ? 16 : 11} fill={glow} opacity={0.28} className="held-glow" />}{body}</g>;
}

function Offhand({ o }: { o: NonNullable<Held["off"]> }) {
  const ink = "#2a1c14", st = { stroke: ink, strokeWidth: 1.4, strokeLinejoin: "round" as const };
  if (o.kind === "shield") {
    const rim = GRADE_METAL[o.grade] ?? GRADE_METAL[0]!, face = EL[o.el] ?? "#7a5236";
    return o.grade >= 3
      ? <g><path d="M-11 -14 L11 -14 L10 2 Q0 14 0 14 Q0 14 -10 2 Z" fill={face} {...st} /><path d="M-11 -14 L11 -14 L10 2 Q0 14 0 14 Q0 14 -10 2 Z" fill="none" stroke={rim} strokeWidth={2.6} /><path d="M0 -10 L0 8 M-6 -4 L6 -4" stroke={rim} strokeWidth={2} /></g>
      : <g><circle r={11} fill={face} {...st} /><circle r={11} fill="none" stroke={rim} strokeWidth={2.4} /><circle r={3} fill={rim} {...st} /></g>;
  }
  if (o.kind === "torch") {
    const f = FLAME[o.id] ?? FLAME["torch"]!;
    return <g><rect x={-2} y={-6} width={4} height={18} rx={1} fill="#6a4424" {...st} /><rect x={-3.2} y={-8} width={6.4} height={4} rx={1} fill="#8a6a4a" {...st} />
      <circle cx={0} cy={-15} r={10} fill={f} opacity={0.25} className="held-glow" />
      <path className="held-flame" d="M0 -26 Q6 -16 3 -9 L-3 -9 Q-6 -16 0 -26 Z" fill={f} stroke={ink} strokeWidth={1} /><path className="held-flame" d="M0 -20 Q3 -14 1.5 -10 L-1.5 -10 Q-3 -14 0 -20 Z" fill="#fff6c8" /></g>;
  }
  const t = TOOL[o.id];
  if (t?.uses === "arrow") return <g><path d="M3 -24 Q-10 0 3 24" fill="none" stroke="#7a5228" strokeWidth={3.4} strokeLinecap="round" /><path d="M3 -24 L3 24" stroke="#f0ead8" strokeWidth={1} /></g>;
  if (t?.uses === "bolt") return <g><rect x={-12} y={-2} width={24} height={4} rx={1} fill="#6a4424" {...st} /><path d="M-8 -12 Q-14 0 -8 12" fill="none" stroke="#8a929e" strokeWidth={3} /><path d="M-8 -12 L-8 12" stroke="#f0ead8" strokeWidth={0.8} /></g>;
  const cell = t?.uses === "cell";
  return <g><rect x={-4} y={-3} width={t?.two ? 24 : 16} height={6} rx={1.5} fill={cell ? "#c8d4e8" : "#5a5f68"} {...st} /><rect x={-6} y={0} width={6} height={10} rx={1.5} fill="#6a4424" {...st} />{cell && <circle cx={t?.two ? 21 : 13} cy={0} r={2.4} fill="#7ae0ff" />}</g>;
}

/** SVG layer laid over the cartoon avatar (100×100 box). Facing flips/positions the hands. */
export function HeldGear({ held, dir = "d" }: { held: Held; dir?: "d" | "u" | "l" | "r" }) {
  if (!held.main && !held.off) return null;
  const back = dir === "u";
  // Hero's right hand sits on the viewer's left when facing us; mirrored from behind.
  const mainX = back ? 74 : 24, offX = back ? 26 : 76;
  return (
    <svg className={`held-gear ${back ? "held-back" : ""}`} viewBox="0 0 100 100" aria-hidden>
      {held.off && <g transform={`translate(${offX} 66)`}><Offhand o={held.off} /></g>}
      {held.main && <g transform={`translate(${mainX} 70) rotate(${held.main.two ? -14 : -8})`}><Weapon m={held.main} /></g>}
    </svg>
  );
}
