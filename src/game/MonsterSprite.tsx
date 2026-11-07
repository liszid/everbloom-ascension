import { useEffect, useState } from "react";
import type { Facing } from "./Avatar";

type Pixel = [number, number, number, number, string];
export function MonsterSprite({ kind, name, dir = "d", moving = false, boss = 0 }: { kind: string; name?: string; dir?: Facing; moving?: boolean; boss?: number }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => { if (!moving) { setFrame(0); return; } const timer = setInterval(() => setFrame((f) => 1 - f), 140); return () => clearInterval(timer); }, [moving]);
  const pixels: Pixel[] = [];
  const p = (x: number, y: number, w: number, h: number, c: string) => pixels.push([x, y, w, h, `var(--sprite-${c})`]);
  const back = dir === "u", side = dir === "l" || dir === "r";
  const eyes = (x = 5, y = 5, gap = 5) => { if (!back) { p(x, y, 1, 2, "eye"); if (!side) p(x + gap, y, 1, 2, "eye"); } };
  const feet = (c: string, y = 13) => { p(4, y - frame, 3, 2, c); p(9, y - (1 - frame), 3, 2, c); };
  if (kind === "slime") {
    p(4, 5 + frame, 8, 8 - frame, "moss"); p(2, 8, 12, 5, "moss"); p(3, 12, 10, 2, "leaf"); p(5, 6, 3, 1, "mint"); eyes(5, 9, 4);
  } else if (["rat", "wolf", "titan"].includes(kind)) {
    const c = kind === "rat" ? "stone" : kind === "wolf" ? "silver" : "wood";
    p(3, 6, 10, 6, c); p(2, 3, 5, 6, c); p(2, 2, 2, 2, "ink"); p(6, 2, 2, 2, "ink"); p(1, 7, 4, 2, "ink"); p(13, 5, 2, 5, c); feet(c, 12); eyes(3, 5, 3);
    if (kind === "titan") { p(1, 8, 2, 5, "bone"); p(7, 8, 2, 4, "bone"); }
  } else if (["bat", "harpy", "phoenix", "seraph"].includes(kind)) {
    const c = kind === "phoenix" ? "flame" : kind === "seraph" ? "bone" : "violet";
    p(6, 4, 4, 8, c); p(0, 4 + frame * 2, 5, 3, c); p(3, 6 + frame, 3, 3, c); p(11, 4 + frame * 2, 5, 3, c); p(10, 6 + frame, 3, 3, c); p(7, 2, 2, 3, c); feet(c); eyes(6, 5, 3);
    if (kind === "phoenix") { p(7, 11, 2, 4, "gold"); p(7, 1, 1, 2, "gold"); } if (kind === "seraph") p(5, 0, 6, 1, "gold");
  } else if (kind === "spider") {
    p(5, 6, 6, 6, "violet"); for (let i = 0; i < 4; i++) { p(1 + (i % 2), 4 + i * 3 - frame, 4, 1, "stone"); p(11, 4 + i * 3 - (1 - frame), 4, 1, "stone"); } eyes(6, 7, 3); p(6, 11, 1, 2, "bone"); p(9, 11, 1, 2, "bone");
  } else if (["wraith", "frost", "starspawn", "horror"].includes(kind)) {
    const c = kind === "frost" ? "ice" : kind === "starspawn" ? "gold" : "violet";
    p(5, 2, 6, 3, c); p(3, 5, 10, 6, c); p(4, 11, 2, 3 - frame, c); p(7, 11, 2, 4, c); p(10, 11, 2, 3 + frame, c);
    if (kind === "horror") { p(5, 5, 6, 4, "bone"); p(7, 5, 2, 4, "ink"); } else eyes(5, 6, 5);
  } else if (["naga", "wyvern", "dragon"].includes(kind)) {
    const c = kind === "dragon" ? "flame" : "teal";
    p(5, 3, 7, 5, c); p(5, 8, 6, 5, c); p(11, 11, 4, 2, c); p(13, 8, 2, 4, c); p(6, 8, 3, 4, "gold"); eyes(6, 5, 4);
    if (kind === "naga") { p(2, 13, 11, 2, c); p(2, 11, 2, 3, c); } else { feet(c); p(0, 4 + frame, 4, 5, c); p(12, 3 + frame, 4, 5, c); p(5, 1, 1, 3, "bone"); p(11, 1, 1, 3, "bone"); }
  } else {
    const c = ["skeleton", "lich"].includes(kind) ? "bone" : ["orc", "goblin", "troll"].includes(kind) ? "moss" : ["imp", "demon"].includes(kind) ? "flame" : "stone";
    const bulky = ["golem", "troll", "orc", "demon"].includes(kind);
    p(5, 2, 6, 6, c); p(bulky ? 3 : 4, 8, bulky ? 10 : 8, 5, kind === "lich" || kind === "vampire" ? "violet" : c);
    p(2, 8 + frame, 2, 4, c); p(12, 9 - frame, 2, 4, c); feet(c); eyes();
    if (kind === "skeleton" || kind === "lich") { p(6, 7, 4, 1, "ink"); p(7, 9, 2, 3, "ink"); }
    if (["imp", "demon"].includes(kind)) { p(4, 0, 2, 3, "bone"); p(10, 0, 2, 3, "bone"); p(14, 10, 1, 4, "flame"); }
    if (kind === "goblin") { p(2, 3, 3, 2, c); p(11, 3, 3, 2, c); p(13, 6, 1, 8, "silver"); }
    if (kind === "golem") { p(6, 9, 4, 3, "ice"); p(3, 3, 2, 4, "stone"); p(11, 3, 2, 4, "stone"); }
    if (kind === "vampire") { p(4, 1, 8, 2, "ink"); p(6, 7, 1, 2, "bone"); p(9, 7, 1, 2, "bone"); }
    if (kind === "lich") { p(4, 0, 8, 2, "violet"); p(14, 2, 1, 12, "wood"); p(13, 1, 3, 3, "ice"); }
    if (kind === "sovereign") { p(4, 1, 8, 2, "gold"); p(4, 0, 1, 2, "gold"); p(7, 0, 2, 2, "gold"); p(11, 0, 1, 2, "gold"); p(6, 9, 4, 3, "violet"); }
  }
  return <span className={`monster-art ${moving ? "monster-moving" : "monster-resting"} ${boss >= 2 ? "monster-warden" : boss ? "monster-guardian" : ""}`}>
    <svg viewBox="-2 -2 20 20" role="img" aria-label={name ?? kind} shapeRendering="crispEdges" data-facing={dir} data-frame={frame}>
      <g transform={dir === "r" ? "translate(16 0) scale(-1 1)" : undefined}>{pixels.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}</g>
    </svg>
  </span>;
}