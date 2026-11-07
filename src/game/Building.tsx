import type { ReactNode } from "react";

// All facades share a 32-pixel footprint but have their own architecture and signs.
export function Building({ kind, name }: { kind: string; name: string }) {
  const shapes: ReactNode[] = [];
  const r = (x: number, y: number, w: number, h: number, c: string) => shapes.push(<rect key={shapes.length} x={x} y={y} width={w} height={h} fill={`var(--sprite-${c})`} />);
  const roof = (points: string, c: string) => shapes.push(<polygon key={shapes.length} points={points} fill={`var(--sprite-${c})`} />);
  const window = (x: number, y: number) => { r(x, y, 5, 5, "ink"); r(x + 1, y + 1, 3, 3, "gold"); r(x + 2, y, 1, 5, "wood"); };
  const door = (x = 14, w = 5) => { r(x, 22, w, 8, "ink"); r(x + 1, 23, w - 2, 7, "wood"); r(x + w - 2, 26, 1, 1, "gold"); };
  r(2, 29, 28, 2, "stone");
  switch (kind) {
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