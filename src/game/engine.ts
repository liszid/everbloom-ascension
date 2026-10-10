import {
  ANIMALS, ELEMENT_ICON, FLOWERS, FLOWER_SEEDS, GRADES, GRADE_ADJ, MONSTERS, ORES, POND, SKILLS,
  STAT_KEYS, TREES, VEINS, VILLAGE_MAP, WEAPON_INFO, getMat, tierMult,
  type Element, type Stats, type StatKey, type Trait, type WeaponType,
} from "./data";

export type Slot = "weapon" | "armor" | "charm";
export interface Gear {
  id: string; name: string; slot: Slot; wtype?: WeaponType; grade: string; gradeIdx: number;
  stats: Stats; elements: Element[]; traits: { t: Trait; v: number }[]; materials: { id: string; qty: number }[];
}
export interface Food { name: string; icon: string; heal: number; qty: number }
export interface Mon {
  uid: string; def: string; name: string; icon: string; x: number; y: number; hp: number; maxHp: number;
  atk: number; defn: number; spd: number; weak: Element; tier: number; boss: boolean; drops: string[];
}
export interface Dungeon {
  floor: number; w: number; h: number; tiles: string[]; monsters: Mon[]; veins: string[]; stairs: { x: number; y: number }; bossAlive: boolean;
}
export interface Combat { mon: string; log: string[]; dots: { burn: number; poison: number } }
export interface GameState {
  v: 1; step: number; inv: Record<string, number>; foods: Food[]; gear: Gear[];
  equip: Partial<Record<Slot, string>>; skills: Record<string, number>; hp: number; maxFloor: number;
  loc: "village" | "dungeon"; pos: { x: number; y: number };
  village: { nodes: Record<string, number>; plots: Record<string, { crop: string; readyAt: number }>; animals: Record<string, number> };
  dungeon?: Dungeon; bag: Record<string, number>; combat?: Combat; log: string[]; kills: number; won?: boolean;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const ri = (a: number, b: number) => Math.floor(rand(a, b + 1));
const key = (x: number, y: number) => `${x},${y}`;
function pickWeighted<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [it, w] of items) { r -= w; if (r <= 0) return it; }
  return items[items.length - 1]![0];
}

export const VILLAGE = VILLAGE_MAP.map((r) => r.padEnd(20, ".").slice(0, 20));
export const VILLAGE_START = { x: 5, y: 4 };

export function newGame(): GameState {
  return {
    v: 1, step: 0, inv: { wheat_seed: 3, carrot_seed: 2, herb_seed: 1 }, foods: [{ name: "Traveler's Bread", icon: "🍞", heal: 30, qty: 3 }],
    gear: [], equip: {}, skills: {}, hp: 100, maxFloor: 0, loc: "village", pos: { ...VILLAGE_START },
    village: { nodes: {}, plots: {}, animals: {} }, bag: {}, log: ["Welcome to Thornvale. The Tower looms to the south."], kills: 0,
  };
}

// ---------- skills ----------
export const levelOf = (xp: number) => Math.floor(Math.sqrt((xp ?? 0) / 8)) + 1;
export const xpFor = (lvl: number) => 8 * (lvl - 1) * (lvl - 1);
export const lvl = (s: GameState, k: string) => levelOf(s.skills[k] ?? 0);
export function addXp(s: GameState, k: string, amt: number) {
  const before = s.skills[k];
  const oldL = levelOf(before ?? 0);
  s.skills[k] = (before ?? 0) + amt;
  const newL = levelOf(s.skills[k]!);
  const info = SKILLS[k];
  if (before === undefined && info) log(s, `✨ New skill discovered: ${info.name}!`);
  else if (newL > oldL && info) log(s, `⬆️ ${info.name} reached level ${newL}!`);
}
export function log(s: GameState, msg: string) {
  s.log = [msg, ...s.log].slice(0, 30);
}

// ---------- inventory ----------
export function addMat(s: GameState, id: string, qty: number, toBag = false) {
  const target = toBag ? s.bag : s.inv;
  target[id] = (target[id] ?? 0) + qty;
}
export function takeMat(s: GameState, id: string, qty: number) {
  const have = s.inv[id] ?? 0;
  if (have < qty) return false;
  if (have === qty) delete s.inv[id]; else s.inv[id] = have - qty;
  return true;
}

// ---------- player stats ----------
export interface PStats { atk: number; def: number; spd: number; mag: number; maxHp: number; crit: number; dodge: number; elements: Element[]; traits: Record<Trait, number>; wtype?: WeaponType }
export function playerStats(s: GameState): PStats {
  const tot: Stats = { atk: 0, def: 0, spd: 0, mag: 0, hp: 0, crit: 0 };
  const traits = { lifesteal: 0, burn: 0, poison: 0, thorns: 0, regen: 0, keen: 0, swift: 0, guard: 0 } as Record<Trait, number>;
  const elements = new Set<Element>();
  let wtype: WeaponType | undefined;
  for (const slot of ["weapon", "armor", "charm"] as Slot[]) {
    const g = s.gear.find((x) => x.id === s.equip[slot]);
    if (!g) continue;
    if (slot === "weapon") { wtype = g.wtype; g.elements.forEach((e) => elements.add(e)); }
    for (const k of STAT_KEYS) tot[k] += g.stats[k];
    for (const t of g.traits) traits[t.t] += t.v;
  }
  const mastery = lvl(s, wtype ?? "brawling");
  const defL = lvl(s, "defense");
  const atk = (5 + tot.atk) * (1 + (mastery - 1) * 0.04);
  const def = (2 + tot.def) * (1 + (defL - 1) * 0.03);
  const maxHp = Math.round(100 + tot.hp * 3 + (defL - 1) * 4);
  const crit = Math.min(0.6, 0.05 + tot.crit * 0.004 + traits.keen * 0.1);
  const dodge = Math.min(0.5, (lvl(s, "movement") - 1) * 0.01 + tot.spd * 0.002 + traits.swift * 0.1);
  return { atk, def, spd: 5 + tot.spd, mag: tot.mag, maxHp, crit, dodge, elements: [...elements], traits, wtype };
}

// ---------- crafting ----------
const SLOT_W: Record<Slot, Stats> = {
  weapon: { atk: 1.3, def: 0.2, spd: 0.6, mag: 0.7, hp: 0.2, crit: 1 },
  armor: { atk: 0.15, def: 1.3, spd: 0.4, mag: 0.4, hp: 1.4, crit: 0.2 },
  charm: { atk: 0.5, def: 0.5, spd: 0.9, mag: 1.2, hp: 0.8, crit: 1 },
};
const SLOT_NOUN: Record<Slot, string[]> = { weapon: [], armor: ["Mail", "Plate", "Garb", "Vest"], charm: ["Charm", "Amulet", "Talisman", "Sigil"] };

export function craftPreview(mats: { id: string; qty: number }[], slot: Slot, wtype: WeaponType, craftLvl: number) {
  const list = mats.filter((x) => x.qty > 0);
  const stats: Stats = { atk: 0, def: 0, spd: 0, mag: 0, hp: 0, crit: 0 };
  const elW: Partial<Record<Element, number>> = {};
  const trW: Partial<Record<Trait, number>> = {};
  let totalQty = 0, tierSum = 0, weightSum = 0, top = { id: "", w: 0 };
  for (const { id, qty } of list) {
    const mat = getMat(id);
    const tm = tierMult(mat.tier);
    const q = Math.pow(qty, 0.65);
    let w = 0;
    for (const k of STAT_KEYS) { const v = mat.stats[k] * tm * q; stats[k] += v; w += v; }
    if (mat.element !== "none") elW[mat.element] = (elW[mat.element] ?? 0) + w;
    if (mat.trait) trW[mat.trait] = (trW[mat.trait] ?? 0) + qty * (1 + mat.tier * 0.3);
    totalQty += qty; tierSum += mat.tier * qty; weightSum += w;
    if (w > top.w) top = { id, w };
  }
  const kinds = list.length;
  const avgTier = totalQty ? tierSum / totalQty : 0;
  const score = kinds * 1.6 + Math.log2(totalQty + 1) * 2.2 + avgTier * 0.8 + (craftLvl - 1) * 0.2;
  const gradeIdx = Math.max(0, Math.min(9, Math.floor((score - 3) / 3)));
  const gradeMult = 1 + gradeIdx * 0.3;
  const craftMult = 1 + (craftLvl - 1) * 0.02;
  const mod = slot === "weapon" ? WEAPON_INFO[wtype].mod : {};
  const out: Stats = { atk: 0, def: 0, spd: 0, mag: 0, hp: 0, crit: 0 };
  for (const k of STAT_KEYS) out[k] = stats[k] * SLOT_W[slot][k] * (mod[k as StatKey] ?? 1) * gradeMult * craftMult;
  const elTotal = Object.values(elW).reduce((a, b) => a + (b ?? 0), 0);
  const elements = (Object.entries(elW) as [Element, number][])
    .filter(([, v]) => elTotal > 0 && v / elTotal >= 0.25).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([e]) => e);
  const trTotal = Object.values(trW).reduce((a, b) => a + (b ?? 0), 0);
  const traits = (Object.entries(trW) as [Trait, number][])
    .filter(([, v]) => v / Math.max(trTotal, totalQty * 0.6) >= 0.2).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([t, v]) => ({ t, v: Math.round(Math.min(1.5, (v / Math.max(1, totalQty)) * (1 + gradeIdx * 0.1)) * 100) / 100 }));
  return { stats: out, elements, traits, gradeIdx, grade: GRADES[gradeIdx]!, kinds, totalQty, topMat: top.id, weightSum };
}

export function craftGear(s: GameState, mats: { id: string; qty: number }[], slot: Slot, wtype: WeaponType): Gear | null {
  const list = mats.filter((x) => x.qty > 0);
  if (!list.length) return null;
  for (const { id, qty } of list) if ((s.inv[id] ?? 0) < qty) return null;
  const p = craftPreview(list, slot, wtype, lvl(s, "crafting"));
  for (const { id, qty } of list) takeMat(s, id, qty);
  const stats = { ...p.stats };
  for (const k of STAT_KEYS) stats[k] = Math.round(stats[k] * rand(0.88, 1.15) * 10) / 10;
  const topName = getMat(p.topMat).name.split(" ")[0];
  const noun = slot === "weapon" ? WEAPON_INFO[wtype].name : SLOT_NOUN[slot][ri(0, 3)];
  const elName = p.elements.length === 2 ? `${cap(p.elements[0]!)}-${cap(p.elements[1]!)} ` : "";
  const suffix = p.traits[0] ? ` of ${traitNoun(p.traits[0].t)}` : "";
  const gear: Gear = {
    id: uid(), name: `${GRADE_ADJ[p.gradeIdx]} ${elName}${topName} ${noun}${suffix}`, slot, wtype: slot === "weapon" ? wtype : undefined,
    grade: p.grade, gradeIdx: p.gradeIdx, stats, elements: p.elements, traits: p.traits, materials: list,
  };
  s.gear.push(gear);
  addXp(s, "crafting", Math.round(p.totalQty * 2 + p.kinds * 4 + p.gradeIdx * 5));
  log(s, `⚒️ Forged [${gear.grade}] ${gear.name}!`);
  return gear;
}
const cap = (x: string) => x[0]!.toUpperCase() + x.slice(1);
function traitNoun(t: Trait) {
  return ({ lifesteal: "Hunger", burn: "Embers", poison: "Venom", thorns: "Thorns", regen: "Renewal", keen: "Precision", swift: "the Wind", guard: "the Bulwark" } as Record<Trait, string>)[t];
}
export const elementLabel = (els: Element[]) => els.map((e) => `${ELEMENT_ICON[e]} ${cap(e)}`).join(" + ");

// ---------- cooking ----------
export function cookPreview(mats: { id: string; qty: number }[], cookLvl: number) {
  const list = mats.filter((x) => x.qty > 0 && getMat(x.id).food);
  let total = 0, qty = 0, top = { id: "", v: 0 };
  for (const x of list) {
    const f = getMat(x.id).food! * Math.pow(x.qty, 0.9);
    total += f; qty += x.qty;
    if (f > top.v) top = { id: x.id, v: f };
  }
  const portions = Math.max(1, Math.floor(qty / 3));
  const bonus = (1 + (cookLvl - 1) * 0.05) * (1 + (list.length - 1) * 0.2);
  const heal = Math.round((total / portions) * bonus * 1.5);
  const dish = list.length >= 4 ? "Feast" : list.length === 3 ? "Stew" : list.length === 2 ? "Skillet" : "Roast";
  return { heal, portions, name: top.id ? `${getMat(top.id).name} ${dish}` : "", kinds: list.length, qty };
}
export function cook(s: GameState, mats: { id: string; qty: number }[]) {
  const p = cookPreview(mats, lvl(s, "cooking"));
  if (!p.qty) return;
  for (const x of mats) if (x.qty > 0) takeMat(s, x.id, x.qty);
  const icon = p.kinds >= 3 ? "🍲" : p.kinds === 2 ? "🍳" : "🍖";
  const ex = s.foods.find((f) => f.name === p.name && f.heal === p.heal);
  if (ex) ex.qty += p.portions; else s.foods.push({ name: p.name, icon, heal: p.heal, qty: p.portions });
  addXp(s, "cooking", p.qty * 3 + p.kinds * 3);
  log(s, `🍳 Cooked ${p.portions}× ${p.name} (+${p.heal} HP each)`);
}

// ---------- refining ----------
export function refine(s: GameState, id: string, times: number, station: "carve" | "smelt") {
  const mat = getMat(id);
  if (!mat.refine || mat.refine.station !== station) return;
  const n = Math.min(times, Math.floor((s.inv[id] ?? 0) / 2));
  if (n <= 0) return;
  takeMat(s, id, n * 2);
  addMat(s, mat.refine.to, n);
  const sk = station === "carve" ? "carving" : "smelting";
  addXp(s, sk, n * (3 + mat.tier * 3));
  log(s, `${station === "carve" ? "🪚" : "🔥"} Made ${n}× ${getMat(mat.refine.to).name}`);
}

// ---------- village interactions ----------
export const PLOT_GROW = 60, NODE_RESPAWN = 35, ANIMAL_CD = 45;
export function villageTile(x: number, y: number) { return VILLAGE[y]?.[x] ?? "#"; }

export function gather(s: GameState, x: number, y: number): string | null {
  const t = villageTile(x, y);
  const k = key(x, y);
  const depleted = (s.village.nodes[k] ?? 0) > s.step;
  if (TREES[t]) {
    const tr = TREES[t]!;
    if (depleted) return "This tree needs time to regrow.";
    const L = lvl(s, "woodcutting");
    if (L < tr.lvl) return `${tr.name} needs Woodcutting ${tr.lvl}.`;
    const q = 1 + Math.floor(Math.random() * (1 + L / 10));
    addMat(s, tr.mat, q); s.village.nodes[k] = s.step + NODE_RESPAWN;
    addXp(s, "woodcutting", 4 + getMat(tr.mat).tier * 4);
    return `🪓 Chopped ${q}× ${getMat(tr.mat).name}`;
  }
  if (t === "R") {
    if (depleted) return "This rock is exhausted for now.";
    const L = lvl(s, "mining");
    const id = pickWeighted(ORES.filter(([, l]) => L >= l).map(([i, , w]) => [i, w] as [string, number]));
    const q = 1 + Math.floor(Math.random() * (1 + L / 12));
    addMat(s, id, q); s.village.nodes[k] = s.step + NODE_RESPAWN;
    addXp(s, "mining", 4 + getMat(id).tier * 4);
    return `⛏️ Mined ${q}× ${getMat(id).name}`;
  }
  if (t === "F") {
    if (depleted) return "Nothing left to pick here yet.";
    const L = lvl(s, "herbalism");
    const id = pickWeighted(FLOWERS.filter(([, l]) => L >= l).map(([i, , w]) => [i, w] as [string, number]));
    const q = 1 + Math.floor(Math.random() * (1 + L / 10));
    addMat(s, id, q); s.village.nodes[k] = s.step + NODE_RESPAWN;
    addXp(s, "herbalism", 4 + getMat(id).tier * 4);
    let msg = `🌼 Picked ${q}× ${getMat(id).name}`;
    if (Math.random() < 0.35 + L * 0.01) { const sd = pickWeighted(FLOWER_SEEDS); addMat(s, sd, 1); msg += ` + ${getMat(sd).name}`; }
    return msg;
  }
  if (t === "W") {
    if (depleted) return "The fish have scattered. Try another spot.";
    const L = lvl(s, "fishing");
    const id = pickWeighted(POND.filter(([, l]) => L >= l).map(([i, , w]) => [i, w] as [string, number]));
    addMat(s, id, 1); s.village.nodes[k] = s.step + 20;
    addXp(s, "fishing", 5 + getMat(id).tier * 4);
    return `🎣 Caught ${getMat(id).name}`;
  }
  if (ANIMALS[t]) {
    const a = ANIMALS[t]!;
    if ((s.village.animals[k] ?? 0) > s.step) return `The ${a.name.toLowerCase()} has nothing for you yet.`;
    const L = lvl(s, "husbandry");
    const id = pickWeighted(a.drops);
    const q = 1 + Math.floor(Math.random() * (1 + L / 8));
    addMat(s, id, q); s.village.animals[k] = s.step + ANIMAL_CD;
    addXp(s, "husbandry", 6);
    return `${a.icon} Got ${q}× ${getMat(id).name}`;
  }
  return null;
}

export function plant(s: GameState, x: number, y: number, seed: string) {
  const mat = getMat(seed);
  if (!mat.seedOf || !takeMat(s, seed, 1)) return;
  s.village.plots[key(x, y)] = { crop: mat.seedOf, readyAt: s.step + PLOT_GROW };
  addXp(s, "farming", 3);
  log(s, `🌱 Planted ${mat.name}`);
}
export function harvest(s: GameState, x: number, y: number) {
  const k = key(x, y);
  const p = s.village.plots[k];
  if (!p || p.readyAt > s.step) return;
  const L = lvl(s, "farming");
  const q = 2 + Math.floor(Math.random() * (2 + L / 5));
  addMat(s, p.crop, q);
  const seed = Object.values({ wheat: "wheat_seed", carrot: "carrot_seed", herb_leaf: "herb_seed", pumpkin: "pumpkin_seed" } as Record<string, string>)[["wheat", "carrot", "herb_leaf", "pumpkin"].indexOf(p.crop)];
  const seeds = 1 + (Math.random() < 0.5 ? 1 : 0);
  if (seed) addMat(s, seed, seeds);
  delete s.village.plots[k];
  addXp(s, "farming", 8 + q * 2);
  log(s, `🧺 Harvested ${q}× ${getMat(p.crop).name} and ${seeds} seed(s)`);
}

// ---------- dungeon ----------
export const DW = 21, DH = 15;
const power = (f: number) => 1 + f / 8;
export const floorTier = (f: number) => Math.min(10, Math.floor((f - 1) / 100));

export function makeMonster(f: number, x: number, y: number, boss = false): Mon {
  const t = floorTier(f);
  const pool = MONSTERS.filter((m) => m.tier === t && m.id !== "sovereign");
  const lower = MONSTERS.filter((m) => m.tier === Math.max(0, t - 1) && m.id !== "sovereign");
  let d = pool[0]!;
  if (f === 1000 && boss) d = MONSTERS.find((m) => m.id === "sovereign")!;
  else { const src = Math.random() < 0.2 && t > 0 ? lower : pool; d = src[ri(0, src.length - 1)] ?? pool[0]!; }
  const P = power(f) * rand(0.9, 1.1);
  const bm = boss ? (f === 1000 ? 6 : 3) : 1;
  const hp = Math.round(30 * P * bm);
  return {
    uid: uid(), def: d.id, name: (boss ? "Guardian " : "") + d.name, icon: d.icon, x, y, hp, maxHp: hp,
    atk: 6 * P * (boss ? 1.4 : 1), defn: 2.5 * P, spd: 4 + P * 0.6, weak: d.weak, tier: d.tier, boss, drops: d.drops,
  };
}

export function genDungeon(f: number): { d: Dungeon; start: { x: number; y: number } } {
  const g: string[][] = Array.from({ length: DH }, () => Array(DW).fill("#"));
  const start = { x: Math.floor(DW / 2), y: DH - 2 };
  let cx = start.x, cy = start.y;
  const target = Math.floor(DW * DH * 0.42);
  let carved = 0, guard = 0;
  while (carved < target && guard++ < 20000) {
    if (g[cy]![cx] === "#") { g[cy]![cx] = "."; carved++; }
    const dir = ri(0, 3);
    const nx = cx + [1, -1, 0, 0][dir]!, ny = cy + [0, 0, 1, -1][dir]!;
    if (nx > 0 && ny > 0 && nx < DW - 1 && ny < DH - 1) { cx = nx; cy = ny; }
  }
  // BFS farthest for stairs
  const dist: Record<string, number> = { [key(start.x, start.y)]: 0 };
  const q = [start]; let far = start;
  while (q.length) {
    const c = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = c.x + dx, ny = c.y + dy, k = key(nx, ny);
      if (g[ny]?.[nx] === "." && dist[k] === undefined) {
        dist[k] = dist[key(c.x, c.y)]! + 1; q.push({ x: nx, y: ny });
        if (dist[k]! > dist[key(far.x, far.y)]!) far = { x: nx, y: ny };
      }
    }
  }
  const floors = Object.keys(dist).filter((k) => dist[k]! > 3 && k !== key(far.x, far.y)).map((k) => { const [x, y] = k.split(",").map(Number); return { x: x!, y: y! }; });
  const shuffle = floors.sort(() => Math.random() - 0.5);
  const monsters: Mon[] = [];
  const isBoss = f % 10 === 0;
  const count = Math.min(9, 3 + Math.floor(f / 60));
  for (let i = 0; i < count && shuffle.length; i++) { const p = shuffle.pop()!; monsters.push(makeMonster(f, p.x, p.y)); }
  if (isBoss) {
    const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: far.x + dx!, y: far.y + dy! })).find((p) => g[p.y]?.[p.x] === "." && !monsters.some((m) => m.x === p.x && m.y === p.y));
    const bp = adj ?? far;
    monsters.push(makeMonster(f, bp.x, bp.y, true));
  }
  const veins: string[] = [];
  for (let i = 0; i < 2 && shuffle.length; i++) { const p = shuffle.pop()!; g[p.y]![p.x] = "V"; veins.push(key(p.x, p.y)); }
  g[far.y]![far.x] = ">";
  return { d: { floor: f, w: DW, h: DH, tiles: g.map((r) => r.join("")), monsters, veins, stairs: far, bossAlive: isBoss }, start };
}

export function enterDungeon(s: GameState, f: number) {
  const { d, start } = genDungeon(f);
  s.dungeon = d; s.loc = "dungeon"; s.pos = start; s.bag = {};
  log(s, `🗼 Entered Floor ${f}${f % 10 === 0 ? " — a Guardian awaits!" : ""}`);
}
export function leaveDungeon(s: GameState, keepLoot: boolean) {
  if (keepLoot) for (const [id, q] of Object.entries(s.bag)) addMat(s, id, q);
  s.bag = {}; s.dungeon = undefined; s.combat = undefined; s.loc = "village";
  s.pos = { x: 14, y: 12 };
}

export function mineVein(s: GameState, x: number, y: number) {
  const d = s.dungeon!;
  const t = floorTier(d.floor);
  const pool = VEINS.filter((id) => getMat(id).tier <= Math.max(1, t + 1));
  const id = pool[ri(Math.max(0, pool.length - 3), pool.length - 1)]!;
  const q = 1 + Math.floor(Math.random() * (1 + lvl(s, "mining") / 10));
  addMat(s, id, q, true);
  addXp(s, "mining", 6 + getMat(id).tier * 4);
  const row = d.tiles[y]!.split(""); row[x] = "."; d.tiles[y] = row.join("");
  d.veins = d.veins.filter((k) => k !== key(x, y));
  log(s, `💎 Mined ${q}× ${getMat(id).name}`);
}

export function moveMonsters(s: GameState): Mon | null {
  const d = s.dungeon!;
  for (const m of d.monsters) {
    const dx = s.pos.x - m.x, dy = s.pos.y - m.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist === 1) return m;
    if (m.boss || dist > 6) continue;
    const opts = Math.abs(dx) > Math.abs(dy) ? [[Math.sign(dx), 0], [0, Math.sign(dy)]] : [[0, Math.sign(dy)], [Math.sign(dx), 0]];
    for (const [ox, oy] of opts) {
      if (!ox && !oy) continue;
      const nx = m.x + ox!, ny = m.y + oy!;
      const t = d.tiles[ny]?.[nx];
      if (t !== "." || d.monsters.some((o) => o !== m && o.x === nx && o.y === ny) || (nx === s.pos.x && ny === s.pos.y)) continue;
      m.x = nx; m.y = ny; break;
    }
    if (Math.abs(s.pos.x - m.x) + Math.abs(s.pos.y - m.y) === 1 && Math.random() < 0.5) return m;
  }
  return null;
}

// ---------- combat ----------
function dmgCalc(atk: number, def: number) { return Math.max(1, atk * rand(0.85, 1.15) - def * 0.5); }

export function startCombat(s: GameState, m: Mon) {
  s.combat = { mon: m.uid, log: [`${m.icon} ${m.name} attacks!`], dots: { burn: 0, poison: 0 } };
}
export const combatMon = (s: GameState) => s.dungeon?.monsters.find((m) => m.uid === s.combat?.mon);

export type CombatAct = "attack" | "defend" | "flee" | { eat: number };
export function combatTurn(s: GameState, act: CombatAct): "win" | "lose" | "fled" | null {
  const c = s.combat!; const m = combatMon(s)!; const p = playerStats(s);
  const L = (t: string) => { c.log = [t, ...c.log].slice(0, 8); };
  let defending = false;
  if (act === "attack") {
    let dmg = dmgCalc(p.atk, m.defn);
    if (p.mag > 0) dmg += p.mag * 0.4 * rand(0.8, 1.2);
    const weak = p.elements.includes(m.weak);
    if (weak) dmg *= 1.5;
    const crit = Math.random() < p.crit;
    if (crit) dmg *= 1.8;
    dmg = Math.round(dmg);
    m.hp -= dmg;
    L(`You hit for ${dmg}${crit ? " (CRIT!)" : ""}${weak ? " — super effective!" : ""}`);
    addXp(s, p.wtype ?? "brawling", 3 + m.tier * 2);
    if (p.traits.lifesteal) { const h = Math.round(dmg * 0.12 * p.traits.lifesteal); s.hp = Math.min(p.maxHp, s.hp + h); if (h) L(`🩸 Drained ${h} HP`); }
    if (p.traits.burn) c.dots.burn = 3;
    if (p.traits.poison) c.dots.poison = 4;
  } else if (act === "defend") {
    defending = true; L("You raise your guard.");
    addXp(s, "defense", 2);
  } else if (act === "flee") {
    if (m.boss) { L("You can't flee from a Guardian!"); }
    else if (Math.random() < 0.4 + (p.spd - m.spd) * 0.02 + p.dodge) { s.combat = undefined; log(s, "🏃 You escaped."); addXp(s, "movement", 5); return "fled"; }
    else L("You failed to escape!");
  } else {
    const f = s.foods[act.eat];
    if (f) { s.hp = Math.min(p.maxHp, s.hp + f.heal); f.qty--; if (f.qty <= 0) s.foods.splice(act.eat, 1); L(`You eat ${f.name} (+${f.heal} HP)`); }
  }
  // dots
  if (m.hp > 0 && c.dots.burn > 0) { const d = Math.round(p.atk * 0.15 * p.traits.burn + 1); m.hp -= d; c.dots.burn--; L(`🔥 Burn deals ${d}`); }
  if (m.hp > 0 && c.dots.poison > 0) { const d = Math.round(m.maxHp * 0.03 * p.traits.poison + 1); m.hp -= d; c.dots.poison--; L(`☠️ Poison deals ${d}`); }
  if (m.hp <= 0) return winCombat(s, m);
  // monster turn
  if (Math.random() < p.dodge) { L(`You dodge ${m.name}'s attack!`); addXp(s, "movement", 2); }
  else {
    let dmg = dmgCalc(m.atk, p.def);
    if (defending) dmg *= 0.4;
    if (p.traits.guard) dmg *= Math.max(0.4, 1 - 0.15 * p.traits.guard);
    dmg = Math.round(dmg);
    s.hp -= dmg; L(`${m.icon} ${m.name} hits you for ${dmg}`);
    addXp(s, "defense", 1 + m.tier);
    if (p.traits.thorns) { const r = Math.round(dmg * 0.25 * p.traits.thorns); m.hp -= r; if (r) L(`🌹 Thorns reflect ${r}`); }
  }
  if (p.traits.regen && s.hp > 0) { const h = Math.round(p.maxHp * 0.03 * p.traits.regen); s.hp = Math.min(p.maxHp, s.hp + h); }
  if (m.hp <= 0) return winCombat(s, m);
  if (s.hp <= 0) {
    s.hp = 1; s.combat = undefined;
    log(s, `💀 You were defeated on Floor ${s.dungeon!.floor}. Your loot bag was lost.`);
    leaveDungeon(s, false); s.hp = Math.round(p.maxHp * 0.5);
    return "lose";
  }
  return null;
}
function winCombat(s: GameState, m: Mon): "win" {
  const d = s.dungeon!;
  d.monsters = d.monsters.filter((x) => x.uid !== m.uid);
  if (m.boss) d.bossAlive = false;
  s.kills++;
  const drops: string[] = [];
  const n = (m.boss ? 4 : 1) + ri(0, 1);
  for (let i = 0; i < n; i++) { const id = m.drops[ri(0, m.drops.length - 1)]!; addMat(s, id, 1, true); drops.push(getMat(id).name); }
  s.combat = undefined;
  log(s, `🏆 Defeated ${m.name}! Loot: ${drops.join(", ")}`);
  return "win";
}

export function clearFloor(s: GameState) {
  const f = s.dungeon!.floor;
  if (f > s.maxFloor) s.maxFloor = f;
  leaveDungeon(s, true);
  if (f >= 1000) { s.won = true; log(s, "👑 You conquered the 1000th floor! Thornvale sings your name forever."); }
  else log(s, `🎉 Floor ${f} cleared! Loot stored. You return to the village.`);
}

export function restAtHome(s: GameState) {
  s.hp = playerStats(s).maxHp;
  log(s, "🏠 You rest and feel fully restored.");
}
