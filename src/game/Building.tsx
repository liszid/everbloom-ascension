import type { ReactNode } from "react";

// All facades share a 32-pixel footprint but have their own architecture and signs.
const ART = import.meta.glob("../assets/art/b_*.webp", { eager: true, import: "default" }) as Record<string, string>;
const artFor = (k: string) => ART[`../assets/art/b_${k}.webp`];

export function Building({ kind, name, stage = 0 }: { kind: string; name: string; stage?: number }) {
  const art = artFor(kind);
  if (art) return <span className="building-art building-cartoon" data-stage={stage}><img src={art} alt={name} width={256} height={256} loading="lazy" draggable={false} /></span>;
  const shapes: ReactNode[] = [];
  const r = (x: number, y: number, w: number, h: number, c: string) => shapes.push(<rect key={shapes.length} x={x} y={y} width={w} height={h} fill={`var(--sprite-${c})`} />);
  const roof = (points: string, c: string) => shapes.push(<polygon key={shapes.length} points={points} fill={`var(--sprite-${c})`} />);
  const window = (x: number, y: number) => { r(x, y, 5, 5, "ink"); r(x + 1, y + 1, 3, 3, "gold"); r(x + 2, y, 1, 5, "wood"); };
  const door = (x = 14, w = 5) => { r(x, 22, w, 8, "ink"); r(x + 1, 23, w - 2, 7, "wood"); r(x + w - 2, 26, 1, 1, "gold"); };
  const tree = (x: number, y: number, c = "leaf") => { r(x + 2, y + 6, 2, 4, "wood"); r(x, y + 2, 6, 5, c); r(x + 1, y, 4, 2, c); r(x + 1, y + 2, 1, 1, "mint"); };
  const spot = kind === "L" || kind === "O" || kind === "P" || kind === "Y";
  if (!spot) r(2, 29, 28, 2, "stone");
  switch (kind) {
    case "J": // church: white nave, tall belfry with bell, rose window, cross
      r(4, 14, 24, 16, "bone"); roof("2,15 10,7 22,7 30,15", "teal"); r(13, 2, 6, 14, "bone"); roof("12,3 16,-1 20,3", "teal");
      r(15, -3, 2, 4, "gold"); r(14, -2, 4, 1, "gold"); r(15, 5, 2, 3, "gold"); r(13, 17, 6, 6, "ink"); r(14, 18, 4, 4, "violet"); r(15, 19, 2, 2, "rose");
      door(13, 6); r(6, 18, 3, 6, "ink"); r(7, 19, 1, 4, "ice"); r(23, 18, 3, 6, "ink"); r(24, 19, 1, 4, "ice"); break;
    case "Z": // magic tower: slim violet spire, glowing orb, star windows
      r(9, 8, 14, 22, "violet"); r(8, 26, 16, 4, "stone"); roof("7,9 16,-3 25,9", "ink"); r(15, -5, 2, 2, "ice"); r(14, -4, 4, 1, "ice");
      r(12, 11, 3, 4, "ink"); r(13, 12, 1, 2, "ice"); r(18, 15, 3, 4, "ink"); r(19, 16, 1, 2, "ice"); r(10, 9, 12, 1, "gold");
      r(13, 22, 6, 8, "ink"); r(14, 23, 4, 7, "teal"); r(16, 25, 1, 1, "gold"); r(4, 20, 3, 3, "ice"); r(26, 14, 2, 2, "rose"); break;
    case "V": // craftery: workshop with hanging trap, crossed darts, crates of arrows
      r(4, 14, 24, 16, "wood"); roof("2,15 6,8 26,8 30,15", "brick"); r(4, 16, 24, 1, "ink"); door(6);
      r(13, 18, 8, 6, "ink"); r(14, 19, 6, 4, "stone"); for (let x = 14; x < 20; x += 2) r(x, 22, 1, 1, "silver"); r(16, 17, 2, 2, "silver");
      r(23, 23, 6, 6, "wood"); r(24, 20, 1, 4, "bone"); r(26, 20, 1, 4, "bone"); r(28, 20, 1, 4, "bone"); r(24, 19, 1, 1, "flame"); r(26, 19, 1, 1, "flame"); r(28, 19, 1, 1, "flame"); break;
    case "L": // forest: more and older trees as the spot levels up
      r(0, 0, 32, 32, "moss"); tree(2, 14); tree(18, 16); tree(10, 4);
      if (stage >= 1) { tree(22, 2, "teal"); r(12, 24, 6, 3, "wood"); r(13, 24, 4, 1, "bone"); }
      if (stage >= 2) { tree(2, 0); r(26, 26, 3, 3, "rose"); }
      if (stage >= 3) { tree(13, 18, "violet"); r(16, 17, 1, 1, "gold"); r(6, 12, 1, 1, "gold"); } break;
    case "O": // mine: rock face with timbered entrance, richer veins at higher levels
      r(0, 4, 32, 28, "stone"); roof("0,8 8,0 20,2 32,6 32,10 0,10", "stone"); r(10, 14, 12, 16, "ink"); r(9, 12, 14, 3, "wood"); r(9, 14, 2, 16, "wood"); r(21, 14, 2, 16, "wood");
      r(3, 18, 2, 2, "brick"); r(26, 12, 2, 2, "brick");
      if (stage >= 1) { r(4, 24, 2, 2, "silver"); r(25, 20, 2, 2, "silver"); r(12, 27, 8, 2, "wood"); }
      if (stage >= 2) { r(6, 10, 2, 2, "gold"); r(27, 26, 2, 2, "gold"); r(14, 22, 4, 3, "stone"); }
      if (stage >= 3) { r(2, 12, 2, 2, "ice"); r(28, 16, 2, 2, "ice"); r(15, 16, 2, 2, "flame"); } break;
    case "P": // pond: water with reeds, dock and lily pads that grow with level
      r(0, 0, 32, 32, "moss"); r(3, 5, 26, 22, "teal"); r(5, 3, 22, 26, "teal"); r(7, 8, 6, 1, "ice"); r(17, 18, 8, 1, "ice");
      r(1, 10, 1, 4, "leaf"); r(29, 18, 1, 5, "leaf");
      if (stage >= 1) { r(20, 6, 3, 2, "mint"); r(9, 20, 3, 2, "mint"); }
      if (stage >= 2) { r(0, 24, 12, 3, "wood"); r(2, 27, 1, 4, "wood"); r(9, 27, 1, 4, "wood"); }
      if (stage >= 3) { r(21, 6, 1, 1, "rose"); r(10, 20, 1, 1, "rose"); r(24, 12, 2, 1, "gold"); } break;
    case "Y": // animal farm: barn, fence and animals multiply with level
      r(0, 0, 32, 32, "moss"); r(2, 8, 14, 14, "brick"); roof("1,9 9,2 17,9", "wood"); r(6, 14, 6, 8, "wood"); r(6, 14, 6, 1, "bone"); r(6, 14, 1, 8, "bone"); r(11, 14, 1, 8, "bone");
      r(0, 27, 32, 1, "wood"); for (let x = 1; x < 32; x += 5) r(x, 25, 1, 5, "wood");
      r(20, 14, 4, 3, "bone"); r(23, 13, 2, 2, "bone"); r(20, 17, 1, 1, "ink"); r(23, 17, 1, 1, "ink");
      if (stage >= 1) { r(26, 20, 3, 3, "bone"); r(28, 19, 2, 2, "ink"); }
      if (stage >= 2) { r(19, 4, 5, 4, "bone"); r(20, 5, 2, 2, "ink"); r(23, 3, 2, 2, "bone"); }
      if (stage >= 3) { r(3, 2, 2, 7, "stone"); r(2, 1, 4, 2, "gold"); } break;
    case "H":
      r(4, 14, 24, 16, "wood"); r(23, 3, 4, 13, "stone"); roof("2,15 16,3 30,15", "teal"); r(5, 16, 22, 1, "bone"); window(6, 20); window(22, 20); door(); r(5, 25, 7, 2, "moss"); r(6, 24, 2, 1, "rose"); r(9, 24, 2, 1, "gold"); break;
    case "A":
      r(3, 13, 26, 17, "stone"); roof("1,14 7,7 27,7 30,14", "ink"); r(23, 1, 5, 13, "ink"); r(24, 0, 3, 2, "silver"); r(4, 20, 10, 9, "ink"); r(6, 24, 6, 5, "flame"); r(8, 25, 2, 4, "gold"); door(21); r(15, 17, 10, 1, "wood"); r(16, 18, 1, 4, "wood"); r(14, 21, 7, 2, "silver"); r(16, 23, 3, 2, "silver"); break;
    case "K":
      r(4, 14, 24, 16, "brick"); for (let y = 16; y < 29; y += 4) r(4, y, 24, 1, "wood"); roof("1,15 8,6 24,6 31,15", "flame"); r(7, 1, 4, 10, "brick"); window(7, 20); door(21); r(14, 18, 6, 6, "bone"); r(15, 21, 4, 2, "wood"); r(16, 20, 2, 1, "gold"); break;
    case "C":
      r(4, 15, 24, 15, "wood"); for (let x = 5; x < 28; x += 4) r(x, 15, 1, 14, "ink"); roof("2,16 2,10 26,5 30,16", "moss"); door(19); r(4, 25, 9, 5, "wood"); r(5, 26, 2, 2, "gold"); r(9, 26, 2, 2, "gold"); r(7, 18, 9, 1, "silver"); r(7, 19, 1, 2, "silver"); r(10, 19, 1, 2, "silver"); r(13, 19, 1, 2, "silver"); break;
    case "U":
      r(5, 9, 22, 21, "ink"); r(9, 2, 14, 8, "stone"); r(11, 0, 10, 3, "ink"); r(7, 12, 18, 2, "stone"); r(7, 18, 18, 2, "stone"); r(10, 23, 12, 7, "brick"); r(12, 24, 8, 6, "flame"); r(14, 26, 4, 4, "gold"); r(7, 15, 2, 2, "flame"); r(23, 15, 2, 2, "flame"); break;
    case "$":
      r(4, 14, 24, 16, "bone"); r(3, 9, 26, 6, "teal"); for (let x = 5; x < 29; x += 6) r(x, 9, 3, 8, "gold"); r(3, 15, 26, 2, "ink"); window(7, 20); door(17); r(25, 25, 5, 5, "wood"); r(26, 26, 3, 1, "gold"); r(5, 2, 12, 5, "wood"); r(8, 4, 6, 1, "gold"); r(11, 3, 1, 3, "gold"); break;
    case "M":
      r(3, 14, 2, 16, "wood"); r(27, 14, 2, 16, "wood"); roof("1,15 8,5 24,5 31,15", "rose"); r(5, 12, 22, 3, "bone"); r(4, 23, 24, 6, "wood"); r(6, 21, 4, 3, "moss"); r(11, 21, 4, 3, "flame"); r(23, 21, 3, 3, "gold"); r(19, 16, 1, 7, "gold"); r(16, 17, 7, 1, "gold"); r(16, 19, 2, 1, "gold"); r(22, 19, 2, 1, "gold"); break;
    case "N":
      r(3, 14, 26, 16, "bone"); roof("1,15 8,4 23,4 31,15", "gold"); r(3, 15, 26, 2, "wood"); r(3, 23, 26, 2, "wood"); r(8, 15, 2, 15, "wood"); r(21, 15, 2, 15, "wood"); window(11, 18); door(13); r(26, 17, 5, 1, "ink"); r(28, 18, 1, 2, "ink"); r(25, 20, 6, 6, "wood"); r(26, 21, 3, 4, "gold"); r(29, 22, 1, 2, "gold"); break;
    case "X":
      r(4, 12, 24, 18, "violet"); roof("2,13 8,4 24,4 30,13", "ink"); r(4, 13, 24, 1, "gold"); r(5, 14, 2, 16, "gold"); r(25, 14, 2, 16, "gold"); door(13, 7); r(11, 16, 11, 5, "gold"); r(12, 17, 4, 3, "bone"); r(17, 17, 4, 3, "bone"); r(13, 18, 1, 1, "ink"); r(18, 18, 2, 1, "ink"); window(7, 22); window(21, 22); break;
    case "Q":
      r(3, 12, 26, 18, "teal"); roof("1,13 9,4 23,4 31,13", "stone"); for (let x = 5; x < 29; x += 3) r(x, 14, 1, 15, "wood"); r(11, 20, 12, 10, "wood"); r(16, 20, 1, 10, "ink"); r(7, 14, 22, 2, "ink"); r(27, 15, 1, 6, "gold"); r(25, 21, 5, 6, "wood"); r(25, 22, 5, 1, "silver"); r(2, 25, 6, 5, "wood"); r(2, 26, 6, 1, "silver"); break;
    case "D":
      r(7, 6, 18, 24, "stone"); r(4, 8, 5, 22, "ink"); r(23, 8, 5, 22, "ink"); roof("9,7 16,0 23,7", "violet"); r(4, 5, 2, 4, "stone"); r(7, 5, 2, 4, "stone"); r(23, 5, 2, 4, "stone"); r(26, 5, 2, 4, "stone"); r(12, 21, 8, 9, "ink"); r(13, 22, 6, 1, "ice"); r(12, 23, 1, 7, "ice"); r(19, 23, 1, 7, "ice"); r(14, 9, 4, 3, "ice"); r(6, 13, 3, 6, "violet"); r(23, 13, 3, 6, "violet"); break;
  }
  return <svg className="building-art" viewBox="0 0 32 32" role="img" aria-label={name} shapeRendering="crispEdges">{shapes}</svg>;
}