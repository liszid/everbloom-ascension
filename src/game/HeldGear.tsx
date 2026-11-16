// Presentation-only overlay drawing the equipped main-hand weapon and off-hand item of the hero or a companion.
import type { GameState, Gear } from "./engine";
import type { Companion } from "./guild";
import { TOOL } from "./items";
import { weaponLook, type WeaponLook } from "./weaponLook";

export type WeaponShape = "sword" | "dagger" | "mace" | "wand" | "great" | "hammer" | "halberd" | "staff" | "axe" | "scythe" | "spear";
export interface Held {
  main?: { shape: WeaponShape; two: boolean; el: string; grade: number; look?: WeaponLook | undefined } | undefined;
  off?: { kind: "shield"; grade: number; el: string } | { kind: "torch"; id: string } | { kind: "ranged"; id: string } | undefined;
}

const EL: Record<string, string> = { fire: "#ff7a2a", water: "#4ac0ff", wind: "#9af0d0", earth: "#c08a3a", light: "#fff2a0", dark: "#b060ff", nature: "#7ae05a", void: "#ff4ad8" };
const GRADE_METAL = ["#b8bec8", "#cfd8e2", "#9fd0ff", "#c99cff", "#ffd36a", "#ff8a6a", "#7affd8", "#ffffff"];
const FLAME: Record<string, string> = { torch: "#ff9a2a", alluring_torch: "#ff7ac8", siphon_torch: "#e0203a", blinding_torch: "#fff07a", witch_torch: "#7ae05a", frost_torch: "#7ae0ff", soul_torch: "#b0a0ff", dragon_torch: "#ff4a1a" };

const ARCH_SHAPE: Record<string, [WeaponShape, WeaponShape]> = {
  sword: ["sword", "great"], axe: ["axe", "axe"], scythe: ["scythe", "scythe"], hammer: ["mace", "hammer"], spear: ["spear", "halberd"], staff: ["wand", "staff"], dagger: ["dagger", "dagger"],
};
function shapeOf(name: string, two: boolean, arch?: string): WeaponShape {
  const a = arch ? ARCH_SHAPE[arch] : undefined; if (a) return two ? a[1] : a[0];
  const n = name.toLowerCase();
  if (/axe/.test(n)) return "axe";
  if (/scythe|sickle/.test(n)) return "scythe";
  if (two) return /hammer/.test(n) ? "hammer" : /halberd|spear|pike/.test(n) ? "halberd" : /staff/.test(n) ? "staff" : "great";
  return /mace|club/.test(n) ? "mace" : /wand|rod/.test(n) ? "wand" : /dagger|knife/.test(n) ? "dagger" : "sword";
}

/** Reads what the hero visibly holds from their equipment. */
export function heldGearOf(s: GameState): Held {
  return heldFrom((id) => (id ? s.gear.find((x) => x.id === id) : undefined), s.equip, s.ranged);
}
/** Reads what a companion visibly holds from the gear they carry. */
export function heldGearOfComp(c: Companion): Held {
  return heldFrom((id) => (id ? c.held?.find((x) => x.id === id) : undefined), c.equip);
}
function heldFrom(g: (id?: string) => Gear | undefined, equip: GameState["equip"], ranged?: string): Held {
  const two = g(equip.two_hand), one = g(equip.one_hand), sh = g(equip.shield);
  const w = two ?? one;
  const el = (x?: { ench?: { el: string } | undefined; element: string }) => x?.ench?.el ?? x?.element ?? "none";
  const held: Held = {};
  if (w) held.main = { shape: shapeOf(w.name, !!two, w.arch), two: !!two, el: el(w), grade: w.grade, look: weaponLook(w) };
  if (sh) held.off = { kind: "shield", grade: sh.grade, el: el(sh) };
  else if (ranged && TOOL[ranged]) held.off = TOOL[ranged]!.kind === "torch" ? { kind: "torch", id: ranged } : { kind: "ranged", id: ranged };
  return held;
}

type St = { stroke: string; strokeWidth: number; strokeLinejoin: "round" };
const INK = "#2a1c14";
const rnd = (seed: number, k: number) => ((seed >>> (k * 3)) & 7) / 7; // 0..1 per slot
/** Surface detail by material family: wood grain, stone speckles, bone notches, gem/metal shine. */
function Surface({ L, x0, x1, l }: { L: [number, number]; x0: number; x1: number; l: WeaponLook }) {
  const [y0, y1] = L, mid = (x0 + x1) / 2, w = x1 - x0;
  if (l.fam === "wood") return <g stroke={l.dark} strokeWidth={0.7} opacity={0.7} fill="none"><path d={`M${mid - w * 0.2} ${y0} Q${mid} ${(y0 + y1) / 2} ${mid - w * 0.15} ${y1}`} /><path d={`M${mid + w * 0.22} ${y0 + 2} Q${mid + w * 0.05} ${(y0 + y1) / 2} ${mid + w * 0.2} ${y1}`} /></g>;
  if (l.fam === "stone") return <g fill={l.dark} opacity={0.7}><circle cx={mid - w * 0.2} cy={y0 + (y1 - y0) * 0.3} r={0.8} /><circle cx={mid + w * 0.15} cy={y0 + (y1 - y0) * 0.6} r={1} /><circle cx={mid} cy={y0 + (y1 - y0) * 0.8} r={0.6} /></g>;
  if (l.fam === "bone") return <g stroke={l.dark} strokeWidth={0.8} opacity={0.8}><path d={`M${x0} ${y0 + (y1 - y0) * 0.35} l${w * 0.3} 0.6`} /><path d={`M${x1} ${y0 + (y1 - y0) * 0.6} l${-w * 0.3} 0.6`} /></g>;
  return l.q >= 1 ? <path d={`M${mid - w * 0.18} ${y1 - 1} L${mid - w * 0.18} ${y0 + 2}`} stroke="#ffffff" strokeWidth={0.9} opacity={l.fam === "gem" ? 0.75 : 0.5} /> : null;
}
function Rope({ y, n = 3 }: { y: number; n?: number }) {
  return <g stroke="#c8a870" strokeWidth={1.1}>{Array.from({ length: n }, (_, i) => <path key={i} d={`M-2.4 ${y + i * 2.2} L2.4 ${y + i * 2.2 + 1}`} />)}</g>;
}
function Grip({ l, len = 8, st }: { l: WeaponLook; len?: number; st: St }) {
  return <>
    <rect x={-1.6} y={-0.5} width={3.2} height={len} rx={0.8} fill={l.grip} {...st} />
    {l.q === 0 && <Rope y={0.8} n={Math.max(2, Math.round(len / 3))} />}
    {l.q === 3 && <path d={`M-1.6 1 L1.6 3 M-1.6 4 L1.6 6`} stroke={l.accent} strokeWidth={1} />}
    {l.q >= 1 && <circle cx={0} cy={len + 0.5} r={l.q >= 2 ? 2.4 : 1.8} fill={l.q >= 2 ? (l.glow ?? l.accent) : l.accent} {...st} />}
  </>;
}
function Guard({ l, w, st }: { l: WeaponLook; w: number; st: St }) {
  if (l.q === 0) return <rect x={-w * 0.35} y={-3.5} width={w * 0.7} height={2.6} rx={0.6} fill={l.grip} {...st} />;
  if (l.q === 1) return <rect x={-w / 2} y={-4} width={w} height={3.4} rx={1.4} fill={l.accent} {...st} />;
  if (l.q === 2) return <><path d={`M${-w / 2 - 1} -1 Q${-w / 3} -6 0 -3.6 Q${w / 3} -6 ${w / 2 + 1} -1 L${w / 2 - 1} 0 Q${w / 4} -2.6 0 -0.6 Q${-w / 4} -2.6 ${-w / 2 + 1} 0 Z`} fill={l.accent} {...st} /><circle cx={0} cy={-2.4} r={1.8} fill={l.glow ?? "#e03a5a"} {...st} /></>;
  return <><path d={`M0 -3 Q${-w * 0.5} -11 ${-w * 0.95} -10 Q${-w * 0.7} -5 ${-w * 0.8} -1 Q${-w * 0.4} -1.5 0 0 Q${w * 0.4} -1.5 ${w * 0.8} -1 Q${w * 0.7} -5 ${w * 0.95} -10 Q${w * 0.5} -11 0 -3 Z`} fill={l.accent} {...st} /><circle cx={0} cy={-2.4} r={2.4} fill={l.glow ?? "#7ae0ff"} {...st} /></>;
}
/** Blade outline: width/tip vary with the seed, crude blades get a chipped edge. */
function bladePath(hw: number, L: number, l: WeaponLook) {
  const tip = l.seed % 3, base = -3;
  const chip = l.q === 0 ? ` L${hw} ${-L * 0.45} L${hw - 1.2} ${-L * 0.5} L${hw} ${-L * 0.56}` : "";
  if (tip === 1) return `M${-hw} ${base} L${-hw} ${-L + 2} L${hw * 0.2} ${-L} L${hw} ${-L + 7}${chip.replace(/ L/g, " L")} L${hw} ${base} Z`;
  if (tip === 2) return `M${-hw} ${base} Q${-hw * 1.5} ${-L * 0.55} 0 ${-L} Q${hw * 1.5} ${-L * 0.55} ${hw} ${base} Z`;
  return `M${-hw} ${base} L${-hw} ${-L + 5} L0 ${-L} L${hw} ${-L + 5}${chip ? ` L${hw} ${-L * 0.56} L${hw - 1.2} ${-L * 0.5} L${hw} ${-L * 0.45}` : ""} L${hw} ${base} Z`;
}
function Runes({ L, l }: { L: number; l: WeaponLook }) {
  if (l.q < 2) return null;
  return <g>
    <path d={`M0 -6 L0 ${-L + 8}`} stroke={l.dark} strokeWidth={1} opacity={0.8} />
    {l.q === 3 && [0.3, 0.5, 0.7].map((f) => <circle key={f} cx={0} cy={-L * f} r={0.9} fill={l.glow ?? "#fff2a0"} className="held-glow" />)}
  </g>;
}

function Weapon({ m }: { m: NonNullable<Held["main"]> }) {
  const l: WeaponLook = m.look ?? { fam: "metal", mat: "", tier: m.grade, q: (Math.min(3, Math.floor(m.grade / 2)) as WeaponLook["q"]), head: GRADE_METAL[m.grade] ?? GRADE_METAL[0]!, dark: "#5c646e", grip: "#6a4424", accent: "#d8a83a", glow: EL[m.el], seed: 0 };
  const st: St = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: "round" };
  const wm = 0.85 + rnd(l.seed, 1) * 0.35, big = l.q === 3 ? 1.12 : 1;
  const head = { fill: l.head, ...st };
  let body;
  switch (m.shape) {
    case "dagger": {
      const L = 20 * big, hw = 3 * wm;
      body = l.q === 2
        ? <><path d={`M${-hw} -3 Q${-hw - 3} -10 ${-hw + 1} ${-L * 0.6} Q0 ${-L * 0.8} 0 ${-L} Q${hw + 3} ${-L * 0.6} ${hw} -3 Z`} {...head} /><Runes L={L} l={l} /><Guard l={l} w={11} st={st} /><Grip l={l} len={7} st={st} /></>
        : <><path d={l.q === 0 ? `M${-hw} -3 L${-hw * 0.6} ${-L * 0.7} L${hw * 0.4} ${-L} L${hw} ${-L * 0.5} L${hw * 0.6} ${-L * 0.45} L${hw} -3 Z` : bladePath(hw, L, l)} {...head} /><Surface L={[-L + 4, -4]} x0={-hw} x1={hw} l={l} /><Runes L={L} l={l} /><Guard l={l} w={11} st={st} /><Grip l={l} len={7} st={st} /></>;
      break;
    }
    case "mace": {
      const r = (5 + l.q * 0.6) * wm;
      const headEl = l.q === 0
        ? <path d={`M-1.8 -8 L-4.5 -26 Q0 -31 4.5 -26 L1.8 -8 Z`} {...head} />
        : l.q === 1 ? <circle cx={0} cy={-22} r={r} {...head} />
        : <path d={Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? r : r * 1.45; return `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)} ${(-22 + Math.sin(a) * rr).toFixed(1)}`; }).join(" ") + " Z"} {...head} />;
      body = <><rect x={-1.8} y={-18} width={3.6} height={26} rx={1} fill={l.grip} {...st} />{headEl}<Surface L={[-27, -17]} x0={-4} x1={4} l={l} />
        {l.q === 0 && <Rope y={2} />}{l.q >= 2 && <circle cx={0} cy={-22} r={2} fill={l.glow ?? l.accent} {...st} />}
        {l.q === 3 && <path d="M0 -30 L-2 -36 L0 -40 L2 -36 Z" fill={l.accent} {...st} />}</>;
      break;
    }
    case "wand": case "staff": {
      const staff = m.shape === "staff", top = staff ? -38 : -22, len = staff ? 50 : 28;
      const orb = l.glow ?? (l.fam === "gem" ? l.head : "#d0a0ff"), r = (staff ? 5.5 : 3.6) * (l.q === 3 ? 1.3 : 1);
      const shaft = l.q === 0
        ? <path d={`M-1.6 ${top + len - 12} Q-3 ${top + len * 0.6} -1 ${top + len * 0.35} Q1.5 ${top + len * 0.15} -0.6 ${top}`} stroke={INK} strokeWidth={4.6} strokeLinecap="round" fill="none" />
        : <rect x={-1.8} y={top} width={3.6} height={len} rx={1.5} fill={l.grip} {...st} />;
      body = <>{shaft}{l.q === 0 && <path d={`M-1.6 ${top + len - 12} Q-3 ${top + len * 0.6} -1 ${top + len * 0.35} Q1.5 ${top + len * 0.15} -0.6 ${top}`} stroke={l.fam === "wood" ? l.head : l.grip} strokeWidth={2.4} strokeLinecap="round" fill="none" />}
        {l.q >= 2 && <path d={`M-1.8 ${top + 2} Q${-r - 3} ${top - r * 0.5} ${-r * 0.6} ${top - r * 1.6} M1.8 ${top + 2} Q${r + 3} ${top - r * 0.5} ${r * 0.6} ${top - r * 1.6}`} stroke={l.q === 3 ? l.accent : l.head} strokeWidth={2.2} fill="none" strokeLinecap="round" />}
        {l.q === 3 && <path d={`M${-r * 1.7} ${top - r} Q0 ${top - r * 3.6} ${r * 1.7} ${top - r} Q0 ${top - r * 2.6} ${-r * 1.7} ${top - r} Z`} fill={l.accent} {...st} />}
        <circle cx={0} cy={top - (l.q >= 2 ? r * 0.7 : 2)} r={l.q === 0 ? r * 0.7 : r} fill={orb} {...st} />
        <circle cx={-r * 0.3} cy={top - (l.q >= 2 ? r * 0.7 : 2) - r * 0.3} r={r * 0.28} fill="#ffffff" opacity={0.7} />
        {l.q === 3 && [0, 1, 2].map((i) => <circle key={i} className="held-sparkle" style={{ animationDelay: `${i * 0.4}s` }} cx={Math.cos(i * 2.1) * r * 2} cy={top - r * 0.7 + Math.sin(i * 2.1) * r * 1.6} r={1.1} fill={orb} />)}</>;
      break;
    }
    case "hammer": {
      const w = (18 + l.q * 2) * wm;
      body = <><rect x={-1.8} y={-30} width={3.6} height={42} rx={1} fill={l.grip} {...st} />
        {l.q === 0 ? <path d={`M${-w / 2} -38 L${w / 2 - 2} -40 L${w / 2} -30 L${-w / 2 + 1} -29 Z`} {...head} /> : <rect x={-w / 2} y={-40} width={w} height={11} rx={2} {...head} />}
        <Surface L={[-39, -30]} x0={-w / 2} x1={w / 2} l={l} />
        {l.q === 0 && <Rope y={-28} />}
        {l.q >= 2 && <><rect x={-w / 2 + 2.5} y={-40} width={2.4} height={11} fill={l.accent} {...st} /><rect x={w / 2 - 4.9} y={-40} width={2.4} height={11} fill={l.accent} {...st} /><path d="M0 -40 L-2 -46 L2 -46 Z" fill={l.head} {...st} /></>}
        {l.q === 3 && <circle cx={0} cy={-34.5} r={2.6} fill={l.glow ?? "#7ae0ff"} {...st} />}</>;
      break;
    }
    case "halberd": case "spear": {
      const pole = m.shape === "halberd", top = pole ? -38 : -32, len = pole ? 50 : 42, tl = (10 + l.q * 1.5) * big, tw = (3.4 + l.q * 0.4) * wm;
      body = <><rect x={-1.5} y={top} width={3} height={len} rx={1} fill={l.grip} {...st} />
        <path d={l.q === 0 ? `M0 ${top - tl} L${tw} ${top - 2} L${tw * 0.4} ${top + 1} L${-tw} ${top} Z` : l.q >= 2 ? `M0 ${top - tl} Q${tw * 1.6} ${top - tl * 0.4} ${tw * 0.6} ${top} L${-tw * 0.6} ${top} Q${-tw * 1.6} ${top - tl * 0.4} 0 ${top - tl} Z` : `M0 ${top - tl} L${tw} ${top} L${-tw} ${top} Z`} {...head} />
        {l.q === 0 && <Rope y={top + 1} />}
        {pole && <path d={`M1.5 ${top + 2} Q${12 + l.q * 2} ${top + 6} ${10 + l.q} ${top + 16} L1.5 ${top + 12} Z`} {...head} />}
        {l.q >= 2 && <path d={`M-1.5 ${top + 2} L-6 ${top - 2} L-5 ${top + 4} Z M1.5 ${top + 2} L6 ${top - 2} L5 ${top + 4} Z`} fill={l.accent} {...st} />}
        {l.q === 3 && <path className="held-flame" d={`M-1.5 ${top + 4} Q-10 ${top + 10} -6 ${top + 18}`} stroke={l.glow ?? "#e03a5a"} strokeWidth={2} fill="none" />}</>;
      break;
    }
    case "axe": {
      const s = (m.two ? 1.25 : 1) * big, ext = 13 + l.q * 1.5;
      const blade = l.q === 0 ? `M1.8 -27 L${ext - 2} -25 L${ext - 3} -15 L1.8 -17 Z`
        : l.q === 1 ? `M1.8 -28 Q${ext + 2} -27 ${ext + 1} -13 Q${ext - 5} -16 1.8 -16 Z`
        : `M1.8 -29 Q${ext + 1} -33 ${ext + 3} -22 Q${ext + 3} -10 ${ext - 2} -6 Q${ext - 7} -14 1.8 -15 Z`;
      body = <g transform={`scale(${s})`}><rect x={-1.8} y={-30} width={3.6} height={40} rx={1} fill={l.grip} {...st} />
        <path d={blade} {...head} /><Surface L={[-26, -17]} x0={2} x1={ext - 1} l={l} />
        {l.q === 0 && <path d="M-2.4 -26 L2.4 -18 M2.4 -26 L-2.4 -18" stroke="#c8a870" strokeWidth={1.2} />}
        {l.q === 2 && <path d="M-1.8 -26 L-7 -24 L-1.8 -20 Z" {...head} />}
        {l.q === 3 && <><path d={`M-1.8 -29 Q${-ext - 1} -33 ${-ext - 3} -22 Q${-ext - 3} -10 ${-ext + 2} -6 Q${-ext + 7} -14 -1.8 -15 Z`} {...head} /><circle cx={0} cy={-22} r={2.6} fill={l.glow ?? "#7ae0ff"} {...st} /><path d="M0 -30 L-2 -36 L0 -39 L2 -36 Z" fill={l.accent} {...st} /></>}
        {l.q >= 1 && <circle cx={0} cy={10.5} r={1.8} fill={l.accent} {...st} />}</g>;
      break;
    }
    case "scythe": {
      const y0 = m.two ? -40 : -24, len = m.two ? 52 : 34, reach = (m.two ? 27 : 17) * (1 + l.q * 0.06) * big;
      body = <><rect x={-1.6} y={y0} width={3.2} height={len} rx={1} fill={l.grip} {...st} />
        <path d={l.q === 0 ? `M0 ${y0} L${-reach} ${y0 + 6} L${-reach * 0.5} ${y0 + 4} L0 ${y0 + 6} Z` : `M0 ${y0} Q${-reach * 0.8} ${y0 - 4} ${-reach} ${y0 + 14} Q${-reach * 0.6} ${y0 + 4} 0 ${y0 + 6} Z`} {...head} />
        {l.q >= 2 && <path d={`M0 ${y0 + 2} Q${-reach * 0.6} ${y0} ${-reach * 0.85} ${y0 + 10}`} stroke={l.glow ?? l.dark} strokeWidth={1} fill="none" />}
        {l.q === 0 && <Rope y={y0 + 4} />}
        {l.q === 3 && <><circle cx={0} cy={y0 + 3} r={2.6} fill={l.glow ?? "#b060ff"} {...st} /><path d={`M0 ${y0} L-2 ${y0 - 6} L0 ${y0 - 9} L2 ${y0 - 6} Z`} fill={l.accent} {...st} /></>}</>;
      break;
    }
    default: {
      const great = m.shape === "great", L = (great ? 44 : 31) * big, hw = (great ? 3.6 : 2.6) * wm;
      body = <><path d={bladePath(hw, L, l)} {...head} /><Surface L={[-L + 6, -5]} x0={-hw} x1={hw} l={l} /><Runes L={L} l={l} />
        <Guard l={l} w={great ? 18 : 15} st={st} /><Grip l={l} len={great ? 11 : 8} st={st} /></>;
    }
  }
  const glowY = m.two ? -24 : -16;
  return <g>
    {l.glow && <circle cx={0} cy={glowY} r={(m.two ? 16 : 11) * (l.q === 3 ? 1.35 : 1)} fill={l.glow} opacity={0.28} className="held-glow" />}
    {body}
    {l.q === 3 && m.shape !== "wand" && m.shape !== "staff" && [0, 1].map((i) => <path key={i} className="held-sparkle" style={{ animationDelay: `${i * 0.7}s` }} d={`M${i ? 6 : -6} ${glowY - 8 + i * 10} l1 -2.5 l1 2.5 l2.5 1 l-2.5 1 l-1 2.5 l-1 -2.5 l-2.5 -1 Z`} fill="#fffbe0" />)}
  </g>;
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
  const back = dir === "u", side = dir === "l" || dir === "r";
  // Hero's right hand sits on the viewer's left when facing us; mirrored from behind.
  // Side views (drawn facing right, flipped for left) hold the weapon in the leading hand.
  const mainX = side ? 60 : back ? 74 : 24, offX = side ? 42 : back ? 26 : 76;
  return (
    <svg className={`held-gear ${back ? "held-back" : ""}`} viewBox="0 0 100 100" aria-hidden>
      {held.off && <g transform={`translate(${offX} 66)`} opacity={side ? 0.9 : 1}><Offhand o={held.off} /></g>}
      {held.main && <g transform={`translate(${mainX} 70) rotate(${held.main.two ? -14 : -8})`}><Weapon m={held.main} /></g>}
    </svg>
  );
}
