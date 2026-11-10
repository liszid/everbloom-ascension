// Layered pixel-art avatar: race (skin, ears, horns, tusks...), gender (hair/beard/silhouette)
// and emergent class (outfit colour, held item, tier flourishes) combine into a unique sprite.
import { HeldGear, type Held } from "./HeldGear";
type Px = [number, number, number, number, string];

const SKIN: Record<string, string> = {
  human: "#e8b48a", elf: "#f4d6b4", dwarf: "#d99c74", halfling: "#e9b48c", gnome: "#f2c49e",
  orc: "#6f9a4a", halforc: "#93ad6c", tiefling: "#c4473c", dragonborn: "#3f8f7a", aasimar: "#f8e6cc",
  vampire: "#ece4ea", ghost: "#cfe6ff", werewolf: "#8a6a4a", lich: "#d8d2b8", zombie: "#8fae7a", ghoul: "#9a9a8a",
};
const HAIR: Record<string, string> = {
  human: "#6b4226", elf: "#f0dc8a", dwarf: "#a8461f", halfling: "#8a5a2b", gnome: "#e070b0",
  orc: "#1e1e1e", halforc: "#3a2a1a", tiefling: "#2a1630", dragonborn: "#2b6b5a", aasimar: "#f4f4f4",
  vampire: "#140a14", ghost: "#e8f4ff", werewolf: "#5a3e26", lich: "#3a2a4a", zombie: "#3a3a28", ghoul: "#2a2a2a",
};
const OUTFIT: Record<string, [string, string]> = {
  fire: ["#b8321e", "#f2a03a"], water: ["#2563a8", "#8fd3f0"], wind: ["#4fa38a", "#d6f5e8"], earth: ["#7a5a32", "#c9a46a"],
  light: ["#f0e6c8", "#e8c44a"], dark: ["#3a2350", "#9a5ad0"], sword: ["#8a96a8", "#d8dee8"], might: ["#6a2a1e", "#b0b0b0"],
  shield: ["#5a6a80", "#d8b04a"], agility: ["#2e4a2e", "#7a9a5a"], arcane: ["#4a2a8a", "#c8a0f0"], crafting: ["#7a4a2a", "#e0a050"],
  nature: ["#3a7a2a", "#a8d870"], hunting: ["#5a4a2a", "#8a7a4a"], culinary: ["#f0f0f0", "#d04040"], fortune: ["#1a5a3a", "#f0c040"],
  none: ["#8a6a4a", "#c8a87a"],
};
const ORB: Record<string, string> = { fire: "#ff7a2a", water: "#4ac0ff", wind: "#9af0d0", earth: "#c08a3a", light: "#fff2a0", dark: "#b060ff", nature: "#7ae05a", arcane: "#d0a0ff" };

export function parseClass(classId: string) {
  if (!classId || !classId.includes(":")) return { p: "none", q: undefined as string | undefined, tier: -1 };
  const [a, t] = classId.split(":"); const [p, q] = (a ?? "").split("+");
  return { p: p || "none", q, tier: Number(t) };
}

export type Facing = "d" | "u" | "l" | "r";
const ART = import.meta.glob("../assets/art/a_*.webp", { eager: true, import: "default" }) as Record<string, string>;
const artFor = (race: string, gender: string) => ART[`../assets/art/a_${race}_${gender === "Female" ? "f" : "m"}.webp`];

export function Avatar(props: { race: string; gender: string; classId: string; size?: number | string; dir?: Facing; frame?: 0 | 1 | undefined; held?: Held | undefined }) {
  const { race, gender, classId, size = "100%", dir = "d", frame, held } = props;
  const src = artFor(race, gender);
  if (!src) return <PixelAvatar {...props} />;
  const { p, tier } = parseClass(classId);
  const [main, trim] = OUTFIT[p] ?? OUTFIT["none"]!;
  const step = frame === undefined ? 0 : frame === 0 ? -4 : 4;
  return (
    <span className="avatar-cartoon" style={{ width: size, height: size, opacity: race === "ghost" ? 0.8 : 1 }} aria-label={`${gender} ${race}`}>
      <img src={src} alt={`${gender} ${race}`} draggable={false} loading="lazy" width={256} height={256}
        style={{ transform: `${dir === "l" ? "scaleX(-1)" : ""} rotate(${step}deg)`, filter: dir === "u" ? "brightness(0.8)" : undefined }} />
      {held && <span className="held-wrap" style={{ transform: `${dir === "l" ? "scaleX(-1)" : ""} rotate(${step}deg)` }}><HeldGear held={held} dir={dir} /></span>}
      {p !== "none" && <span className="avatar-badge" style={{ background: main, borderColor: trim }}>{tier >= 3 ? "★" : ""}</span>}
    </span>
  );
}

function PixelAvatar({ race, gender, classId, size = "100%", dir = "d", frame }: { race: string; gender: string; classId: string; size?: number | string; dir?: Facing; frame?: 0 | 1 | undefined }) {
  const back = dir === "u", side = dir === "l" || dir === "r";
  const { p, q, tier } = parseClass(classId);
  const skin = SKIN[race] ?? SKIN["human"]!, hair = HAIR[race] ?? HAIR["human"]!;
  const [main, trim0] = OUTFIT[p] ?? OUTFIT["none"]!;
  const trim = q ? (OUTFIT[q]?.[0] ?? trim0) : trim0;
  const fem = gender === "Female", nb = gender === "Non-binary";
  const r: Px[] = [];
  const px = (x: number, y: number, w: number, h: number, c: string) => r.push([x, y, w, h, c]);

  // cape for evolved classes (drawn first, behind)
  if (tier >= 2) px(4, 8, 8, 6, trim);
  // tiefling tail
  if (race === "tiefling") { px(12, 12, 1, 2, skin); px(13, 11, 1, 1, skin); px(14, 10, 1, 1, "#7a1a1a"); }
  // legs & boots
  // walk cycle: alternate which leg is lifted
  const lA = frame === 1 ? 1 : 0, lB = frame === 0 ? 1 : 0;
  px(5, 13, 2, 2 - lA, "#3a2a20"); px(9, 13, 2, 2 - lB, "#3a2a20"); px(5, 15 - lA, 2, 1, "#1e1610"); px(9, 15 - lB, 2, 1, "#1e1610");
  // body / outfit (skirt-ish flare for female)
  px(4, 8, 8, 5, main); if (fem) px(3, 11, 10, 2, main);
  px(4, 10, 8, 1, trim); px(7, 8, 2, 2, trim);
  // arms
  const aA = frame === undefined ? 0 : frame === 0 ? -1 : 1;
  px(3, 8 + aA, 1, 4, main); px(12, 8 - aA, 1, 4, main); px(3, 12 + aA, 1, 1, skin); px(12, 12 - aA, 1, 1, skin);
  // long hair behind (female / nb)
  if (fem && race !== "dragonborn") px(4, 3, 8, 7, hair);
  if (nb && race !== "dragonborn") px(4, 3, 8, 5, hair);
  // head
  px(5, 2, 6, 6, skin);
  // eyes
  const eye = race === "vampire" ? "#e01a2a" : race === "lich" || race === "ghost" ? "#5af0ff" : race === "werewolf" ? "#ffb020" : race === "zombie" || race === "ghoul" ? "#d0e040" : race === "tiefling" ? "#ffd23a" : race === "aasimar" ? "#7ad8ff" : race === "dragonborn" ? "#ffcc33" : "#1a1a1a";
  if (!back) { if (side) px(6, 4, 1, 1, eye); else { px(6, 4, 1, 1, eye); px(9, 4, 1, 1, eye); } }
  if (fem && !back && !side) { px(6, 6, 1, 1, "#e08a8a"); px(9, 6, 1, 1, "#e08a8a"); }
  // race features
  if (race === "elf") { px(4, 3, 1, 2, skin); px(3, 2, 1, 2, skin); px(11, 3, 1, 2, skin); px(12, 2, 1, 2, skin); }
  if (race === "halfling") { px(4, 4, 1, 1, skin); px(11, 4, 1, 1, skin); }
  if (race === "gnome") { px(7, 5, 2, 1, "#e0907a"); px(4, 4, 1, 1, skin); px(11, 4, 1, 1, skin); }
  if (race === "orc" || race === "halforc") { px(6, 7, 1, 1, "#f4f0dc"); px(9, 7, 1, 1, "#f4f0dc"); if (race === "orc") { px(5, 6, 1, 1, "#f4f0dc"); px(10, 6, 1, 1, "#f4f0dc"); } }
  if (race === "dragonborn") { px(5, 6, 6, 2, "#2f7a66"); px(7, 7, 2, 1, "#e8d080"); px(4, 1, 1, 3, "#e8d080"); px(11, 1, 1, 3, "#e8d080"); px(5, 1, 6, 1, "#2b6b5a"); }
  if (race === "vampire") { px(6, 7, 1, 1, "#ffffff"); px(9, 7, 1, 1, "#ffffff"); }
  if (race === "werewolf") { px(4, 1, 1, 3, hair); px(11, 1, 1, 3, hair); px(6, 6, 4, 2, "#6a4a30"); px(7, 6, 2, 1, "#1a1a1a"); }
  if (race === "lich") { px(5, 0, 6, 1, "#c9a43a"); px(5, 0, 1, 1, "#7ad8ff"); px(10, 0, 1, 1, "#7ad8ff"); px(6, 7, 4, 1, "#9a9480"); }
  if (race === "zombie") { px(5, 4, 2, 1, "#5a7a4a"); px(9, 6, 2, 1, "#7a2a2a"); }
  if (race === "ghoul") { px(6, 7, 4, 1, "#5a1a1a"); px(5, 4, 1, 1, "#6a6a5a"); }
  if (race === "aasimar") { px(5, 0, 6, 1, "#ffe680"); px(4, 1, 1, 1, "#ffe680"); px(11, 1, 1, 1, "#ffe680"); }
  // hair top / fringe
  if (race !== "dragonborn") {
    px(5, 1, 6, 2, hair);
    if (!fem && !nb) px(5, 3, 1, 1, hair);
    if (fem) { px(4, 2, 1, 5, hair); px(11, 2, 1, 5, hair); }
  }
  // back view: hair (or scales) covers the face
  if (back) px(5, 1, 6, 6, race === "dragonborn" ? "#2b6b5a" : hair);
  if (back && race === "dragonborn") px(5, 7, 6, 1, "#2f7a66");
  // dwarf beard / braids
  if (race === "dwarf" && !back) { if (fem) { px(4, 7, 1, 3, hair); px(11, 7, 1, 3, hair); } else { px(5, 6, 6, 3, hair); px(6, 9, 4, 1, hair); } }
  if (race === "human" && gender === "Male" && !back) px(6, 7, 4, 1, hair);
  // class headgear
  if (p === "agility" || p === "hunting") { px(4, 1, 8, 2, main); px(4, 3, 1, 3, main); px(11, 3, 1, 3, main); }
  if (p === "arcane" || p === "dark") { px(5, -1, 6, 2, main); px(6, -2, 4, 1, main); px(7, -3, 2, 1, main); }
  if (p === "might" || p === "shield" || p === "sword") { if (tier >= 1) { px(5, 1, 6, 1, "#9aa4b4"); px(4, 2, 1, 2, "#9aa4b4"); px(11, 2, 1, 2, "#9aa4b4"); } }
  if (p === "culinary") { px(5, -1, 6, 2, "#f8f8f8"); px(6, -2, 4, 1, "#f8f8f8"); }
  if (p === "fortune") { px(4, 1, 8, 1, "#1a1a1a"); px(6, -1, 4, 2, "#1a1a1a"); px(6, 0, 4, 1, "#f0c040"); }
  if (race === "tiefling") { px(5, 0, 1, 2, "#3a1a1a"); px(10, 0, 1, 2, "#3a1a1a"); px(4, 0, 1, 1, "#3a1a1a"); px(11, 0, 1, 1, "#3a1a1a"); }
  if (tier >= 3) { px(6, -1, 1, 1, "#ffd23a"); px(8, -2, 1, 2, "#ffd23a"); px(10, -1, 1, 1, "#ffd23a"); }

  // held item (right hand at x=12..15)
  const it = (x: number, y: number, w: number, h: number, c: string) => px(x, y, w, h, c);
  if (p === "sword") { it(13, 4, 1, 7, "#e0e6f0"); it(12, 10, 3, 1, "#c8a040"); it(13, 11, 1, 2, "#5a3a20"); }
  else if (p === "might") { it(13, 3, 1, 10, "#6a4a2a"); it(13, 3, 3, 3, "#a0a8b4"); }
  else if (p === "shield") { it(0, 8, 3, 5, "#5a6a80"); it(1, 9, 1, 3, "#d8b04a"); it(13, 6, 1, 6, "#e0e6f0"); }
  else if (p === "agility") { it(13, 9, 1, 3, "#e0e6f0"); it(1, 9, 1, 3, "#e0e6f0"); }
  else if (p === "hunting") { it(13, 4, 1, 8, "#7a5a2a"); it(14, 3, 1, 1, "#7a5a2a"); it(14, 12, 1, 1, "#7a5a2a"); it(15, 4, 1, 8, "#e0e0e0"); }
  else if (p === "crafting") { it(13, 7, 1, 6, "#6a4a2a"); it(12, 6, 3, 2, "#7a808a"); }
  else if (p === "culinary") { it(13, 8, 1, 5, "#5a5a5a"); it(12, 6, 3, 2, "#3a3a3a"); }
  else if (p === "fortune") { it(13, 10, 2, 2, "#f0c040"); it(0, 10, 2, 2, "#f8f8f8"); it(0, 10, 1, 1, "#1a1a1a"); }
  else if (ORB[p]) { it(13, 3, 1, 10, "#6a4a2a"); it(12, 1, 3, 3, ORB[p]!); if (tier >= 1) it(13, 0, 1, 1, "#ffffff"); }

  // silhouette by race size
  const small = race === "halfling" || race === "gnome";
  const tf = small ? "translate(2.4 3.6) scale(0.72)" : race === "dwarf" ? "translate(-0.8 2) scale(1.1 0.88)" : race === "orc" || race === "dragonborn" ? "translate(-0.5 0) scale(1.06 1)" : "";
  return (
    <svg viewBox="0 -3 16 19" width={size} height={size} shapeRendering="crispEdges" style={{ display: "block", overflow: "visible", opacity: race === "ghost" ? 0.7 : 1 }} aria-label={`${gender} ${race}`}>
      <g transform={dir === "r" ? "translate(16 0) scale(-1 1)" : undefined}><g transform={tf}>{r.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}</g></g>
    </svg>
  );
}
