import { titleKit } from "./titles";
import { RACE_CLASS, raceMastery } from "./raceClasses";
import { CAPTURE_HP, HIRELINGS, MAX_COMPANIONS, RENT_FLOORS, TECH_REQ, buyPrice, compLevel, rentPrice, techGold, techId, trainChance, trainCost, type CompRole, type Companion } from "./guild";
import { ASCENSIONS, ASC_RACES, COMBO_LEVEL, SCHOOL, SPELL, SPELLS, STUDY_XP, UNDEAD, schoolLevel, studyCost, type SchoolId } from "./magic";
import { BLDG_MAX, bldgCost, blessBattles, churchDisc, guildMult, restPct, storageCap, ammoFor, type BldgId, AILMENTS, BLESSINGS, ENCHANT_ALT, ENCHANT_MAT, TOOL, TRAP_RANGE, BASE_SIGHT, enchantCost, enchantPower, servicePrice, type AilmentId, type BlessingId, type RangedId } from "./items";
import { SPOTS, SPOT_MAX, legacyKeep, spotLevel, spotMats, spotUpgradeCost, type SpotId } from "./gathering";
import { ARCH, rankArchetypes, type ArchDim, type ArchId } from "./archetypes";
import { RECIPE } from "./recipes";
import { DRINKS_PER_FIGHT, OIL_BATTLES, POTION, TONIC_FLOORS } from "./alchemy";
import { MON_DEF, isUndead, themePool } from "./bestiary";
import { themeFor } from "./themes";
import { OFFHAND_MAX, isHeldTool, offhandFx, offhandUpCost } from "./items";
import {
  ACHIEVEMENTS, AFFINITIES, AFF_BY_ID, ANIMALS, BACKGROUNDS, ELITE_AFFIX, FLOWERS, FLOWER_SEEDS, GRADES, GRADE_GATES, GRADE_MULT,
  MONSTERS, ORES, PCT_STATS, POND, PROPS, RACES, SKILLS, SLOTS, SLOT_INFO, STAT_KEYS, TREES, VEINS, VILLAGE_MAP, MATERIALS,
  getMat, matRole, tierMult, zeroStats,
  type Element, type MonsterDef, type Prop, type RefineStation, type Slot, type StatKey, type Stats,
} from "./data";

// ======================= types =======================
export type EffectId = "burn" | "lifesteal" | "regen" | "guard" | "pierce" | "haste" | "holy" | "bleed" | "manaflow";
export const EFFECT_INFO: Record<EffectId, string> = {
  burn: "Burns foes for % of hit each turn", lifesteal: "Heals % of damage dealt", regen: "Restores % max HP each turn (combat)",
  guard: "Reduces damage taken by %", pierce: "Ignores % of enemy defense", haste: "% chance to strike twice",
  holy: "+% damage vs dark monsters", bleed: "Bleeds foes for % of hit", manaflow: "Restores % mana each turn",
};
export interface Gear {
  id: string; name: string; slot: Slot; grade: number; base: Stats; element: Element;
  effects: { id: EffectId; v: number }[]; materials: { id: string; qty: number }[]; avgTier: number;
  dura: number; maxDura: number; enh: number; crafted: number; ench?: { el: Element; v: number } | undefined;
  /** Weapon archetype picked from the material mix (weapons only). */ arch?: ArchId | undefined;
}
export interface Food { name: string; icon: string; heal: number; qty: number; tier: number }
export interface Mon {
  face?: "l" | "r" | "u" | "d" | undefined; movedAt?: number | undefined; rooted?: number | undefined; trapStun?: number | undefined; trapBurn?: number | undefined;
  uid: string; def: string; name: string; icon: string; x: number; y: number; hp: number; maxHp: number;
  atk: number; defn: number; weak: Element; element: Element; tier: number; boss: 0 | 1 | 2 | 3; magical: boolean;
  ability?: MonsterDef["ability"] | undefined; affix?: string | undefined; xp: number; drops: string[]; dodge: number;
}
export interface Dungeon { floor: number; w: number; h: number; tiles: string[]; monsters: Mon[]; stairs: { x: number; y: number }; down?: { x: number; y: number } | undefined; fromAbove?: boolean | undefined; bossAlive: boolean; traps?: { x: number; y: number; id: string }[] | undefined }
export interface Combat {
  mon: Mon; log: string[]; turn: number; dealt: number; taken: number; xp0: Record<string, number>; charXp0: number; gold0: number;
  stoneskin: number; guardT: number; roar: number; stun: number; monBurn: number; monBleed: number; pPoison: number;
  blind?: number; block?: boolean; lockT: number; lockHp: number; charging: boolean; shieldT: number; frenzy: number; raceUsed: boolean; eats: number; healed: number; school?: SchoolId | undefined;
  /** Race-path counters when the battle started, for the result screen. */ st0?: Record<string, number> | undefined;
  /** Share of the foe's defense melted by acid (0–1). */ shred?: number | undefined; /** Elixirs drunk this fight. */ drinks?: number | undefined;
}
export interface BattleResult {
  won: boolean; fled?: boolean | undefined; died?: boolean | undefined; name: string; icon: string; boss: number; floor: number;
  dealt: number; taken: number; turns: number; xp: number; gold: number; loot: { id: string; qty: number }[];
  gains: { k: string; xp: number; from: number; to: number }[]; hp: number; maxHp: number; sold: number; collected: boolean;
  /** Race-path counters that went up this battle. */ paths?: PathGain[] | undefined;
  /** Monster id for the result art. */ kind?: string | undefined;
}
export interface PathGain { icon: string; label: string; add: number; cur: number; need: number }
export interface Quest { id: string; kind: "kill" | "gather" | "floor" | "craft"; target: string; need: number; base: number; gold: number; tokens: number; text: string }
export interface ClassInfo { id: string; name: string; tier: number; primary?: string | undefined; secondary?: string | undefined; race?: string | undefined }
export interface Evo { from: string; to: string; tier: number; bonuses: string[]; skills: string[]; delta: { k: StatKey; d: number }[]; major: boolean }
export interface GameState {
  v: 2;
  char: { name: string; gender: string; race: string; bg: string; origin?: string | undefined };
  step: number; gold: number; tokens: number;
  inv: Record<string, number>; wh: Record<string, number>; whGear: Gear[]; foods: Food[]; gear: Gear[];
  equip: Partial<Record<Slot, string | undefined>>;
  skills: Record<string, number>; aff: Record<string, number>; xp: number;
  hp: number; mp: number; sta: number; maxFloor: number; forgeLvl: number;
  loc: "village" | "dungeon"; pos: { x: number; y: number };
  village: { nodes: Record<string, number>; plots: Record<string, { crop: string; readyAt: number }>; animals: Record<string, number> };
  dungeon?: Dungeon | undefined; bag: Record<string, number>; combat?: Combat | undefined; result?: BattleResult | undefined;
  log: string[]; notes: string[];
  stats: Record<string, number>; usage: { weapon: Record<string, number>; skill: Record<string, number>; mat: Record<string, number>; monster: Record<string, number> };
  ach: Record<string, number>; titles: string[]; title?: string | undefined; titleTime?: Record<string, number> | undefined; decos: string[];
  classId: string; className: string; classHistory: { from: string; to: string; floor: number; at: number }[]; classesSeen: string[];
  pendingEvo?: Evo | undefined; quests: Quest[]; marketSeed: number; casinoPlays: number; agiFix?: boolean;
  relentlessUsed: boolean; playTime: number; createdAt: number; won?: boolean | undefined;
  spots?: Record<string, number> | undefined;
  ailments?: Partial<Record<AilmentId, number>> | undefined; blessing?: { id: BlessingId; left: number } | undefined;
  bldg?: Partial<Record<BldgId, number>> | undefined; spellSlots?: string[] | undefined; spellLv?: Record<string, number> | undefined;
  companions?: Companion[] | undefined; techs?: string[] | undefined;
  magic?: Partial<Record<SchoolId, number>> | undefined; spells?: string[] | undefined;
  tools?: Record<string, number> | undefined; ranged?: RangedId | undefined; prayed?: boolean | undefined; faith?: number | undefined;
  /** Gathering materials unlocked under the old (pre-Lv 100) spot levels, kept so saves never lose access. */
  spotKeep?: Partial<Record<SpotId, string[]>> | undefined;
  /** Grade (0 Common … 7 EX) of each Craftery torch / ranged weapon. */ toolGrades?: Record<string, number> | undefined;
  /** Active Kitchen recipe buff and how many more floors it lasts. */ meal?: { id: string; floors: number } | undefined;
  /** Brewed Alchemy potions (stackable counts). */ potions?: Record<string, number> | undefined;
  /** Weapon oil coating and battles left. */ oil?: { id: string; left: number } | undefined;
  /** Alchemy stat tonic and floors left. */ tonic?: { id: string; floors: number } | undefined;
}

/** One-time save upgrades for older saves. Returns true when something changed. */
export function migrateSave(s: GameState): boolean {
  let changed = false;
  if (!s.spotKeep) {
    const keep: Partial<Record<SpotId, string[]>> = {};
    for (const id of Object.keys(SPOTS) as SpotId[]) { const k = legacyKeep(id, spotLevel(s.spots, id)); if (k.length) keep[id] = k; }
    s.spotKeep = keep; changed = true;
  }
  // Companion gear used to stay in the hero's bag; move it onto the companion who holds it.
  for (const c of s.companions ?? []) for (const sl of SLOTS) {
    const id = c.equip[sl]; if (!id || c.held?.some((g) => g.id === id)) continue;
    const g = s.gear.find((x) => x.id === id);
    if (!g || Object.values(s.equip).includes(id)) { c.equip = { ...c.equip, [sl]: undefined }; changed = true; continue; }
    s.gear = s.gear.filter((x) => x.id !== id); c.held = [...(c.held ?? []), g]; changed = true;
  }
  return changed;
}
/** Materials the player can gather at a spot right now. */
export const spotMatsFor = (s: GameState, id: SpotId) => spotMats(id, spotLevel(s.spots, id), s.spotKeep?.[id]);
export const toolGrade = (s: GameState, id: string) => Math.max(0, Math.min(OFFHAND_MAX, s.toolGrades?.[id] ?? 0));

// ======================= utils =======================
export const uid = () => Math.random().toString(36).slice(2, 10);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const ri = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const key = (x: number, y: number) => `${x},${y}`;
export function pickWeighted<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [it, w] of items) { r -= w; if (r <= 0) return it; }
  return items[items.length - 1]![0];
}
function seeded(seed: number) { let x = seed % 2147483647 || 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
export const VILLAGE = VILLAGE_MAP;
export const VW_ = 20, VH_ = 15;
export const VILLAGE_START = { x: 12, y: 12 };
export const villageTile = (x: number, y: number) => VILLAGE[y]?.[x] ?? "#";
export const WALKABLE_V = new Set([".", ",", "o"]);
export function log(s: GameState, msg: string) { s.log = [msg, ...s.log].slice(0, 40); }
export function note(s: GameState, msg: string) { s.notes = [...s.notes, msg].slice(-6); }
export const bump = (s: GameState, k: string, n = 1) => { s.stats[k] = (s.stats[k] ?? 0) + n; };
const use = (m: Record<string, number>, k: string, n = 1) => { m[k] = (m[k] ?? 0) + n; };

// ======================= progression curves =======================
// Skill XP: 1→20 fast, 20→50 moderate, 50→100 slow, 100+ brutal.
const SKILL_CUM: number[] = [0, 0];
for (let l = 1; l < 200; l++) {
  const need = 6 * Math.pow(l, 1.45) * (l >= 20 ? 1.8 : 1) * (l >= 50 ? 2.4 : 1) * (l >= 100 ? 5 : 1);
  SKILL_CUM.push(SKILL_CUM[l]! + need);
}
export const MAX_SKILL = 200;
export function levelOf(xp: number) { let l = 1; while (l < MAX_SKILL && SKILL_CUM[l + 1]! <= xp) l++; return l; }
export const xpForLevel = (l: number) => SKILL_CUM[Math.min(MAX_SKILL, l)] ?? Infinity;
export const lvl = (s: GameState, k: string) => levelOf(s.skills[k] ?? 0);
const CHAR_CUM: number[] = [0, 0];
for (let l = 1; l < 300; l++) CHAR_CUM.push(CHAR_CUM[l]! + 30 * Math.pow(l, 1.75));
export function charLevel(xp: number) { let l = 1; while (l < 299 && CHAR_CUM[l + 1]! <= xp) l++; return l; }
export const charXpFor = (l: number) => CHAR_CUM[l] ?? Infinity;
export const affLevel = (pts: number) => Math.floor(Math.sqrt((pts ?? 0) / 8));
export const race = (s: GameState) => RACES.find((r) => r.id === s.char.race) ?? ASC_RACES.find((r) => r.id === s.char.race) ?? RACES[0]!;

function growth(s: GameState, aff: string) {
  const g = race(s).growth;
  return (g[aff] ?? 1) * (g["all"] ?? 1);
}
// Agility is fed by constant walking, so it grows on a much stricter curve than other affinities.
export function addAff(s: GameState, a: string, pts: number) { s.aff[a] = (s.aff[a] ?? 0) + pts * growth(s, a) * (a === "agility" ? 0.4 : 1); }
const AFF_RATE: Record<string, number> = { mobility: 0.03, gambling: 1.5 };
export function addXp(s: GameState, k: string, amt: number) {
  const info = SKILLS[k];
  const aff = info?.aff ?? "agility";
  const mult = growth(s, aff) * (1 + affLevel(s.aff[aff] ?? 0) / 40);
  const before = s.skills[k];
  const oldL = levelOf(before ?? 0);
  s.skills[k] = (before ?? 0) + amt * mult;
  const newL = levelOf(s.skills[k]!);
  addAff(s, aff, amt * (AFF_RATE[k] ?? 0.35));
  if (before === undefined && info) { log(s, `✨ New skill learned: ${info.name}!`); note(s, `✨ Learned ${info.name}`); }
  else if (newL > oldL && info) log(s, `⬆️ ${info.name} → Lv ${newL}`);
}
export function addCharXp(s: GameState, n: number) {
  const before = charLevel(s.xp); s.xp += n; const after = charLevel(s.xp);
  if (after > before) { log(s, `🌟 Character level ${after}!`); note(s, `🌟 Level ${after}!`); }
}

// ======================= classes (emergent) =======================
const HYBRID_PREFIX: Record<string, string> = {
  fire: "Flame", water: "Tide", wind: "Storm", earth: "Stone", light: "Holy", dark: "Shadow", sword: "Blade", might: "Iron",
  shield: "Bastion", agility: "Swift", arcane: "Arcane", crafting: "Forged", nature: "Wild", hunting: "Stalker", culinary: "Feast", fortune: "Lucky",
};
// Class = top 5 skills (by level) + top 2 affinities + equipped title. Each feeds a score per affinity.
const TIER_SCORES = [8, 25, 55, 100];
const TITLE_AFF: [RegExp, string][] = [
  [/sanguine|blood/i, "dark"], [/pope|apostle|devout/i, "light"], [/sniper|marksman/i, "hunting"], [/pyre|torch/i, "fire"],
  [/dice|streak/i, "fortune"], [/alchem|brewer/i, "crafting"], [/deathless|unbroken|eternal/i, "shield"],
  [/guardian|bastion|shield|bulwark/i, "shield"], [/bane|breaker|slayer|hunt/i, "hunting"], [/climb|centurion|sky|heaven|conquer/i, "agility"],
  [/smith|forge|craft|artisan/i, "crafting"], [/chef|cook|feast/i, "culinary"], [/lucky|fortune|gambl|roller/i, "fortune"],
  [/sword|blade/i, "sword"], [/mage|arcan/i, "arcane"], [/green|farm|grove|nature/i, "nature"],
];
export function titleAffinity(t?: string) { if (!t) return undefined; return TITLE_AFF.find(([r]) => r.test(t))?.[1] ?? "might"; }
export function classInputs(s: GameState) {
  const skills = Object.keys(s.skills).map((k) => ({ k, l: lvl(s, k) })).sort((a, b) => b.l - a.l).slice(0, 5);
  const affs = AFFINITIES.map((a) => ({ id: a.id, l: affLevel(s.aff[a.id] ?? 0) })).filter((a) => a.l > 0).sort((a, b) => b.l - a.l).slice(0, 2);
  return { skills, affs, title: s.title, titleAff: titleAffinity(s.title) };
}
/** Race mastery for an ascended hero (undefined for mortal races). */
export function raceClassProgress(s: GameState) {
  const line = RACE_CLASS[s.char.race]; if (!line) return undefined;
  const m = raceMastery(line, {
    school: (id) => knowsSchool(s, id) ? schoolLevel(s.magic![id]!) : 0,
    skill: (id) => s.skills[id] !== undefined ? lvl(s, id) : 0,
    aff: (id) => affLevel(s.aff[id] ?? 0),
    stat: (id) => s.stats[id] ?? 0,
  });
  return { line, ...m };
}
export function computeClass(s: GameState): ClassInfo {
  const rc = raceClassProgress(s);
  // Ascended races are lore-locked: the class follows the race ladder, ranking up with race mastery only.
  if (rc) { const [p, q] = rc.line.affs; return { id: `${p}+${q}:${rc.rank}:${rc.line.race}`, name: rc.line.ranks[rc.rank]!, tier: rc.rank, primary: p, secondary: q, race: rc.line.race }; }
  const inp = classInputs(s);
  const score: Record<string, number> = {};
  for (const sk of inp.skills) { const a = SKILLS[sk.k]?.aff; if (a) score[a] = (score[a] ?? 0) + sk.l; }
  for (const a of inp.affs) score[a.id] = (score[a.id] ?? 0) + a.l * 2;
  if (inp.titleAff) score[inp.titleAff] = (score[inp.titleAff] ?? 0) * 1.25 + 10;
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const [pId, pS] = ranked[0] ?? ["", 0]; const q = ranked[1];
  let tier = -1; TIER_SCORES.forEach((t, i) => { if (pS >= t) tier = i; });
  if (tier < 0 || !AFF_BY_ID[pId]) return { id: "adventurer", name: "Adventurer", tier: -1 };
  const base = AFF_BY_ID[pId]!.titles[tier]!;
  if (q && q[1] >= 8 && q[1] >= pS * 0.5) return { id: `${pId}+${q[0]}:${tier}`, name: `${HYBRID_PREFIX[q[0]]} ${base}`, tier, primary: pId, secondary: q[0] };
  return { id: `${pId}:${tier}`, name: base, tier, primary: pId };
}
type ActiveRow = ReturnType<typeof classActives>[number] & { spellId?: string; spellLv?: number };
export type ActiveSkill = ActiveRow;
/** Battle quick-cast: the highest-level equipped Magic Tower spell; ties go to the first equipped one. Returns its combatActives index. */
export function mainSpell(s: GameState): { index: number; skill: ActiveSkill } | null {
  const acts = combatActives(s); let best = -1;
  acts.forEach((a, i) => { if (a.spellId && (best < 0 || (a.spellLv ?? 1) > (acts[best]!.spellLv ?? 1))) best = i; });
  return best < 0 ? null : { index: best, skill: acts[best]! };
}
/** What Defend does with the off-hand: a shield blocks harder, a torch counter-burns, anything else is a plain brace. */
export function defendMode(s: GameState): "shield" | "torch" | "brace" {
  if (s.equip.shield) return "shield";
  return heldTorch(s) ? "torch" : "brace";
}
export const DEFEND_TAKEN = { brace: 0.5, shield: 0.3 } as const;
/** Skills usable in combat: class skills followed by equipped-title skills. */
export function combatActives(s: GameState): ActiveSkill[] {
  const kit = titleKit(s.title, s.titleTime?.[s.title ?? ""] ?? 0);
  const spells = equippedSpells(s).map((id) => SPELL[id]).filter((x) => !!x).map((sp) => {
    const L = schoolLevel(s.magic?.[sp!.school] ?? 0);
    const sl = s.spellLv?.[sp!.id] ?? 1; const lm = 1 + (sl - 1) * SPELL_LV_BONUS;
    return { aff: "none", name: sl > 1 ? `${sp!.name} +${sl - 1}` : sp!.name, kind: sp!.kind as string, mult: sp!.kind === "heal" ? sp!.mult * lm : sp!.kind === "guard" || sp!.kind === "lock" ? sp!.mult : sp!.mult * (1 + (L - 1) * 0.04) * lm, cost: Math.round(sp!.cost * (1 + (sl - 1) * 0.05)), res: "mp" as const, el: sp!.el, school: sp!.school, spellId: sp!.id, spellLv: sl };
  });
  const techs = (s.techs ?? []).filter((t) => t.endsWith(":active")).map((t) => { const a = t.split(":")[0]!; const d = AFF_BY_ID[a]!;
    return { aff: a, name: `${d.titles[1]} Art`, kind: d.active.kind as string, mult: d.active.kind === "heal" || d.active.kind === "guard" || d.active.kind === "buff" ? d.active.mult * 1.3 : d.active.mult * 1.6, cost: Math.round(d.active.cost * 1.3), res: d.active.res, el: d.active.el, school: undefined as SchoolId | undefined }; });
  return [...classActives(computeClass(s)) as ActiveRow[], ...techs, ...kit.actives.map((a) => ({ aff: "none", name: a.name, kind: a.kind as string, mult: a.mult, cost: a.cost, res: a.res, el: a.el, school: undefined as SchoolId | undefined })), ...spells];
}
export function classActives(c: ClassInfo) {
  const out = [] as { aff: string; name: string; kind: string; mult: number; cost: number; res: "mp" | "sta"; el?: Element | undefined; school?: SchoolId | undefined }[];
  for (const a of [c.primary, c.secondary]) {
    if (!a) continue;
    const d = AFF_BY_ID[a]!; const scale = 1 + Math.max(0, c.tier) * 0.15;
    out.push({ aff: a, name: d.active.name, kind: d.active.kind, mult: d.active.kind === "heal" || d.active.kind === "guard" || d.active.kind === "buff" ? d.active.mult : d.active.mult * scale, cost: d.active.cost, res: d.active.res, el: d.active.el });
  }
  if (!out.length) out.push({ aff: "none", name: "Heavy Strike", kind: "phys", mult: 1.5, cost: 12, res: "sta" });
  return out;
}
function classPassives(c: ClassInfo): Partial<Record<StatKey, number>> {
  const out: Partial<Record<StatKey, number>> = {};
  const add = (a: string | undefined, w: number) => {
    if (!a) return;
    for (const [k, v] of Object.entries(AFF_BY_ID[a]!.passive)) out[k as StatKey] = (out[k as StatKey] ?? 0) + v * w * (1 + c.tier);
  };
  add(c.primary, 1); add(c.secondary, 0.5);
  return out;
}
export function describePassives(c: ClassInfo) {
  return Object.entries(classPassives(c)).map(([k, v]) => `+${Math.round(v * 100)}% ${k}`);
}

// ======================= new game =======================
export function newGame(char: GameState["char"]): GameState {
  const bg = BACKGROUNDS.find((b) => b.id === char.bg) ?? BACKGROUNDS[0]!;
  const s: GameState = {
    v: 2, char, step: 0, gold: bg.gold, tokens: 0, inv: { wheat_seed: 3, carrot_seed: 2, ...bg.inv }, wh: {}, whGear: [],
    foods: [{ name: "Traveler's Bread", icon: "🍞", heal: 30, qty: 3, tier: 0 }], gear: [], equip: {},
    skills: {}, aff: { ...bg.aff }, xp: 0, hp: 1, mp: 1, sta: 1, maxFloor: 0, forgeLvl: 1,
    loc: "village", pos: { ...VILLAGE_START }, village: { nodes: {}, plots: {}, animals: {} }, bag: {},
    log: [`Welcome to Thornvale, ${char.name}. The Tower looms to the south.`], notes: [],
    stats: {}, usage: { weapon: {}, skill: {}, mat: {}, monster: {} }, ach: {}, titles: [], decos: [],
    classId: "adventurer", className: "Adventurer", classHistory: [], classesSeen: ["Adventurer"],
    quests: [], marketSeed: Date.now(), casinoPlays: 0, agiFix: true, relentlessUsed: false, playTime: 0, createdAt: Date.now(), spotKeep: {},
  };
  const c = computeClass(s); s.classId = c.id; s.className = c.name; s.classesSeen = [c.name];
  const p = playerStats(s); s.hp = p.hp; s.mp = p.mp; s.sta = p.sta;
  rerollQuests(s);
  return s;
}

// ======================= player stats =======================
export interface PStats extends Stats {
  element: Element; effects: Record<EffectId, number>; weaponSkill: string; magicWeapon: boolean;
  craftEff: number; gatherEff: number; itemFind: number; rareDrop: number; level: number;
  enchDmg: number; wardEl: Element; wardV: number; wards: Partial<Record<Element, number>>;
}
export const gearStats = (g: Gear): Stats => {
  const m = (1 + g.enh * 0.08) * (g.dura <= 0 ? 0.5 : 1);
  const out = zeroStats();
  for (const k of STAT_KEYS) out[k] = g.base[k] * (PCT_STATS.includes(k) ? 1 + g.enh * 0.02 : m);
  return out;
};
export const equipped = (s: GameState) => SLOTS.map((sl) => s.gear.find((g) => g.id === s.equip[sl])).filter((g): g is Gear => !!g);

/**
 * Stats a Craftery torch or ranged weapon adds at a grade. Modelled on a crafted item of matching tier and grade
 * (about 75% of a shield's defense plus some attack), so holding one instead of a shield costs little.
 */
export function offhandStats(id: string, g: number): Stats {
  const t = TOOL[id]; const out = zeroStats(); if (!t || !isHeldTool(t)) return out;
  const gg = Math.max(0, Math.min(OFFHAND_MAX, g));
  const tier = Math.min(10, Math.max(((t.lvl ?? 1) - 1) * 0.5, GRADE_GATES[gg]![0]) + 0.5);
  const P = 23.4 * tierMult(tier) * GRADE_MULT[gg]!; const torch = t.kind === "torch";
  out.pdef = 0.495 * P * 1.05; out.mdef = 0.36 * P * 0.68; out.hp = 5.06 * P * 0.45;
  out.patk = 1.15 * P * (torch ? 0.25 : 0.4); out.matk = 1.05 * P * (torch ? 0.4 : 0.15);
  return out;
}
export function playerStats(s: GameState, classOverride?: ClassInfo): PStats {
  const L = charLevel(s.xp);
  const st: Stats = {
    hp: 80 + L * 10, mp: 30 + L * 3, sta: 50 + L * 3, patk: 4 + L * 1.2, matk: 3 + L * 1.1, pdef: 2 + L * 0.8, mdef: 2 + L * 0.7,
    crit: 5, critDmg: 150, dodge: 3, acc: 92, spd: 100, luck: 5,
  };
  const effects = { burn: 0, lifesteal: 0, regen: 0, guard: 0, pierce: 0, haste: 0, holy: 0, bleed: 0, manaflow: 0 } as Record<EffectId, number>;
  let element: Element = "none";
  let weaponSkill = "unarmed"; let magicWeapon = false; let enchDmg = 0; let wardEl: Element = "none"; let wardV = 0;
  for (const g of equipped(s)) {
    const gs = gearStats(g);
    for (const k of STAT_KEYS) st[k] += gs[k];
    for (const e of g.effects) effects[e.id] += e.v * (1 + Math.floor(g.enh / 5) * 0.25);
    if (g.slot === "one_hand" || g.slot === "two_hand") {
      weaponSkill = g.slot; element = g.element; magicWeapon = g.base.matk > g.base.patk;
      if (g.ench) { element = g.ench.el; enchDmg = g.ench.v; }
    }
    if (g.slot === "shield" && g.ench) { wardEl = g.ench.el; wardV = Math.min(50, g.ench.v * 2); st.pdef *= 1.05; st.mdef *= 1.05; }
  }
  const wards: Partial<Record<Element, number>> = {};
  if (s.ranged && isHeldTool(TOOL[s.ranged])) {
    const g = toolGrade(s, s.ranged); const os = offhandStats(s.ranged, g);
    for (const k of STAT_KEYS) st[k] += os[k];
    const fw = offhandFx(TOOL[s.ranged]!, g).fireWard; if (fw) wards.fire = (wards.fire ?? 0) + fw;
  }
  const sk = (k: string) => lvl(s, k) - 1;
  st.patk *= 1 + sk(weaponSkill) * 0.015;
  st.matk *= 1 + sk("spellcasting") * 0.015;
  st.hp *= 1 + sk("endurance") * 0.012;
  st.pdef *= 1 + sk("defense") * 0.01; st.mdef *= 1 + sk("defense") * 0.008;
  st.dodge += sk("evasion") * 0.12 + sk("mobility") * 0.05; st.spd += sk("mobility") * 0.5;
  st.crit += sk("hunting") * 0.05;
  const applyMods = (mods: Partial<Record<StatKey, number>>) => {
    for (const [k, v] of Object.entries(mods)) {
      const kk = k as StatKey;
      if (kk === "crit" || kk === "dodge" || kk === "acc") st[kk] += v * 100;
      else st[kk] *= 1 + v;
    }
  };
  applyMods(race(s).mods);
  applyMods(classPassives(classOverride ?? computeClass(s)));
  const kit = titleKit(s.title, s.titleTime?.[s.title ?? ""] ?? 0);
  applyMods(kit.mods);
  for (const t of s.techs ?? []) { const [a, k] = t.split(":"); if (k === "passive" && AFF_BY_ID[a!]) applyMods(Object.fromEntries(Object.entries(AFF_BY_ID[a!]!.passive).map(([kk, v]) => [kk, v * 2]))); }
  const asc = ASC_RACES.find((r) => r.id === s.char.race); if (asc) for (const [e, v] of Object.entries(asc.fx)) effects[e as EffectId] += v;
  for (const [e, v] of Object.entries(kit.effects)) effects[e as EffectId] += v;
  if (s.blessing && s.blessing.left > 0) { const b = BLESSINGS[s.blessing.id]; const { luck, ...rest } = b.mods; applyMods(rest); if (luck) st.luck += 25; }
  const meal = s.meal ? RECIPE[s.meal.id] : undefined;
  if (meal) {
    applyMods(meal.mods);
    if (meal.regen) effects.regen += meal.regen * 2; // effects.regen heals half its value per turn
    if (meal.mana) effects.manaflow += meal.mana;
    if (meal.ward) wards[meal.ward.el] = (wards[meal.ward.el] ?? 0) + meal.ward.pct;
  }
  const tonic = s.tonic ? POTION[s.tonic.id]?.tonic : undefined; if (tonic) applyMods(tonic);
  const oil = s.oil ? POTION[s.oil.id]?.oil : undefined; if (oil?.el) element = oil.el;
  const ail = s.ailments ?? {};
  if (ail.weakened) { st.patk *= 0.85; st.matk *= 0.85; }
  if (ail.cursed) { st.pdef *= 0.9; st.mdef *= 0.9; st.luck -= 10; st.crit -= 5; }
  if (ail.bleeding) st.hp *= 0.9;
  if (s.char.race === "dragonborn") { st.pdef *= 1.1; st.mdef *= 1.1; }
  if (s.char.race === "halfling") st.luck += 10;
  st.crit = Math.min(75, st.crit); st.dodge = Math.max(0, Math.min(60, st.dodge)); effects.guard = Math.min(50, effects.guard);
  for (const k of ["hp", "mp", "sta"] as StatKey[]) st[k] = Math.round(st[k]);
  return {
    ...st, element, effects, weaponSkill, magicWeapon, level: L, enchDmg, wardEl, wardV, wards,
    craftEff: 1 + sk("smithing") * 0.01 + affLevel(s.aff["crafting"] ?? 0) * 0.01,
    gatherEff: 1 + affLevel(s.aff["nature"] ?? 0) * 0.01 + (s.char.race === "dwarf" ? 0.1 : 0),
    itemFind: 1 + st.luck / 200 + (s.char.race === "elf" ? 0.2 : 0),
    rareDrop: 0.03 + st.luck / 4000,
  };
}
export function clampVitals(s: GameState) {
  const p = playerStats(s);
  s.hp = Math.min(s.hp, p.hp); s.mp = Math.min(s.mp, p.mp); s.sta = Math.min(s.sta, p.sta);
}

// ======================= inventory =======================
export const GEAR_CAP = 24;
export function addMat(s: GameState, id: string, qty: number, toBag = false) {
  const t = toBag ? s.bag : s.inv; t[id] = (t[id] ?? 0) + qty;
}
export function takeMat(s: GameState, id: string, qty: number, from: "inv" | "wh" = "inv") {
  const t = from === "inv" ? s.inv : s.wh;
  const have = t[id] ?? 0; if (have < qty) return false;
  if (have === qty) delete t[id]; else t[id] = have - qty; return true;
}
export function earn(s: GameState, n: number) { s.gold += n; bump(s, "goldEarned", n); }
export function spend(s: GameState, n: number) { if (s.gold < n) return false; s.gold -= n; bump(s, "goldSpent", n); return true; }

// ======================= crafting =======================
const PROP_IDX = (np: Record<Prop, number>) => PROPS.slice().sort((a, b) => np[b] - np[a]);
const EL_EFFECT: Partial<Record<Element, EffectId>> = { fire: "burn", dark: "lifesteal", nature: "regen", earth: "guard", void: "pierce", wind: "haste", light: "holy", water: "manaflow" };

/** Material mix by weapon role (quantity of each role; dark-element materials also count as "dark"). */
export function archMix(mats: { id: string; qty: number }[]): Partial<Record<ArchDim, number>> {
  const mix: Partial<Record<ArchDim, number>> = {};
  for (const { id, qty } of mats) {
    if (qty <= 0) continue;
    const r = matRole(id); if (r !== "hide" && r !== "other") mix[r] = (mix[r] ?? 0) + qty;
    if (getMat(id).element === "dark") mix.dark = (mix.dark ?? 0) + qty;
  }
  return mix;
}
export const archRanking = (mats: { id: string; qty: number }[]) => rankArchetypes(archMix(mats));
export function craftPreview(mats: { id: string; qty: number }[], slot: Slot, s: GameState) {
  const list = mats.filter((x) => x.qty > 0);
  const qty = list.reduce((a, b) => a + b.qty, 0);
  const kinds = list.length;
  const power = Object.fromEntries(PROPS.map((p) => [p, 0])) as Record<Prop, number>;
  const np = Object.fromEntries(PROPS.map((p) => [p, 0])) as Record<Prop, number>;
  const elW: Partial<Record<Element, number>> = {};
  let tierSum = 0;
  for (const { id, qty: q } of list) {
    const mt = getMat(id); const tm = tierMult(mt.tier) * Math.pow(q, 0.6) * 0.12;
    for (const p of PROPS) { power[p] += mt.props[p] * tm; np[p] += mt.props[p] * q; }
    tierSum += mt.tier * q;
    if (mt.element !== "none") elW[mt.element] = (elW[mt.element] ?? 0) + q * (1 + mt.props.magic / 5) * tierMult(mt.tier);
  }
  if (qty) for (const p of PROPS) np[p] /= qty;
  const avgTier = qty ? tierSum / qty : 0;
  const smith = lvl(s, "smithing");
  // ---- grade ----
  const score = Math.min(kinds, 10) * 0.45 + Math.log2(qty + 1) * 0.55 + smith * 0.03 + s.forgeLvl * 0.25 + (s.char.race === "dwarf" ? 0.5 : 0);
  const scoreIdx = Math.max(0, Math.min(7, Math.floor(score / 1.4)));
  let cap = 0; const reasons: string[] = [];
  for (let i = 1; i < GRADE_GATES.length; i++) {
    const [t, f, k] = GRADE_GATES[i]!;
    if (avgTier >= t && s.forgeLvl >= f && smith >= k) cap = i;
    else { if (i === cap + 1) { if (avgTier < t) reasons.push(`avg material tier ${t}+`); if (s.forgeLvl < f) reasons.push(`Forge Lv ${f}`); if (smith < k) reasons.push(`Smithing ${k}`); } break; }
  }
  const hasCatalyst = list.some((x) => getMat(x.id).catalyst && x.id !== "ancient_schematic");
  const hasSchematic = list.some((x) => x.id === "ancient_schematic");
  if (cap === 7 && !(hasCatalyst && hasSchematic)) { cap = 6; reasons.push("an Ancient Schematic + a catalyst material"); }
  const grade = Math.min(scoreIdx, cap);
  const needMore = scoreIdx < cap ? "more kinds / quantity of materials" : "";
  // ---- stats ----
  const w = SLOT_INFO[slot].w;
  const gm = GRADE_MULT[grade]! * (1 + (smith - 1) * 0.004);
  const mag: Partial<Record<StatKey, number>> = {
    patk: power.sharp * 0.6 + power.hard * 0.4 + power.dens * 0.15,
    matk: power.magic * 0.6 + power.cond * 0.45,
    pdef: (power.hard * 0.5 + power.dens * 0.4 + power.dura * 0.2) * 0.45,
    mdef: (power.magic * 0.35 + power.cond * 0.25 + power.dens * 0.2) * 0.45,
    hp: (power.dens + power.dura + power.flex * 0.3) * 2.2,
    mp: (power.magic + power.cond) * 1.1,
    sta: (power.flex + power.dura) * 0.9,
  };
  const pct: Partial<Record<StatKey, number>> = {
    crit: np.sharp * 0.7, critDmg: np.sharp * 3 + np.hard * 2, dodge: np.flex * 0.55 - np.weight * 0.25,
    acc: (np.flex + np.sharp) * 0.35, spd: np.flex * 1.2 - np.weight * 0.7, luck: np.magic * 0.4 + (hasCatalyst ? 4 : 0),
  };
  const base = zeroStats();
  for (const k of STAT_KEYS) {
    const wk = w[k] ?? 0; if (!wk) continue;
    base[k] = PCT_STATS.includes(k) ? (pct[k] ?? 0) * wk * (1 + grade * 0.1) : (mag[k] ?? 0) * wk * gm;
  }
  // heavy armor slows you
  if (np.weight > 6 && slot !== "ring" && slot !== "charm") base.spd -= (np.weight - 6) * 1.5;
  const element = (Object.entries(elW).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none") as Element;
  const effects: Gear["effects"] = [];
  if (grade >= 2) {
    const e = EL_EFFECT[element]; if (e) effects.push({ id: e, v: 2 + grade * 1.5 });
  }
  if (grade >= 3 && np.sharp >= 6 && (slot === "one_hand" || slot === "two_hand")) effects.push({ id: "bleed", v: 2 + grade });
  if (grade >= 4 && np.cond >= 7) effects.push({ id: "manaflow", v: 1 + grade * 0.5 });
  const maxDura = Math.round((np.dura * 10 + np.hard * 4 + 20) * (1 + grade * 0.2));
  const top = list.slice().sort((a, b) => b.qty * tierMult(getMat(b.id).tier) - a.qty * tierMult(getMat(a.id).tier))[0];
  const weapon = slot === "one_hand" || slot === "two_hand";
  const ranks = weapon ? archRanking(list) : [];
  const arch: ArchId | undefined = weapon ? ranks[0]?.a.id ?? (np.magic >= 5 ? "staff" : "sword") : undefined;
  if (arch) {
    const a = ARCH[arch];
    for (const [k, v] of Object.entries(a.mods) as [StatKey, number][]) {
      if (k === "patk" || k === "matk" || k === "mp" || k === "hp") base[k] *= 1 + v; else base[k] += v;
    }
    for (const e of a.effects ?? []) { const ex = effects.find((x) => x.id === e.id); if (ex) ex.v += e.v; else effects.push({ ...e }); }
  }
  const nouns = SLOT_INFO[slot].nouns;
  const noun = arch ? (slot === "two_hand" ? ARCH[arch].two : ARCH[arch].one) : nouns[PROPS.indexOf(PROP_IDX(np)[0]!) % nouns.length]!;
  const name = top ? `${getMat(top.id).name.split(" ")[0]} ${noun}` : noun;
  return { name, grade, scoreIdx, cap, reasons, needMore, base, element, effects, maxDura, avgTier, qty, kinds, hasSchematic, arch, ranks };
}

export function craftGear(s: GameState, mats: { id: string; qty: number }[], slot: Slot) {
  const list = mats.filter((x) => x.qty > 0 && (s.inv[x.id] ?? 0) >= x.qty);
  if (!list.length) return null;
  if (s.gear.length >= GEAR_CAP) { log(s, "🎒 Gear bag full — store gear in the Warehouse."); return null; }
  const pv = craftPreview(list, slot, s);
  const used = pv.grade === 7 ? list : list.filter((x) => x.id !== "ancient_schematic");
  for (const { id, qty } of used) { takeMat(s, id, qty); use(s.usage.mat, id, qty); }
  const base = zeroStats();
  for (const k of STAT_KEYS) base[k] = pv.base[k] * rand(0.9, 1.1);
  const g: Gear = { id: uid(), name: pv.name, slot, grade: pv.grade, base, element: pv.element, effects: pv.effects,
    materials: list.map((x) => ({ ...x })), avgTier: pv.avgTier, dura: pv.maxDura, maxDura: pv.maxDura, enh: 0, crafted: Date.now(), arch: pv.arch };
  s.gear.push(g);
  bump(s, "crafted"); if (slot !== "one_hand" && slot !== "two_hand") bump(s, "armorCrafted"); if (g.grade >= 4) bump(s, "craftedLegendary"); if (g.grade >= 6) bump(s, "craftedRelic"); if (g.grade >= 7) bump(s, "craftedEX");
  addXp(s, "smithing", (4 + pv.qty) * (1 + g.grade * 0.6) * (1 + pv.avgTier * 0.3));
  addAff(s, "crafting", 3 + pv.qty);
  if (pv.element !== "none") { const a = pv.element === "wind" ? "wind" : pv.element; if (AFF_BY_ID[a]) addAff(s, a, 2); }
  log(s, `⚒️ Forged ${GRADES[g.grade]} ${g.name}!`);
  if (g.grade >= 4) note(s, `🌟 ${GRADES[g.grade]} item forged: ${g.name}!`);
  return g;
}

// ---- enhancement ----
export function enhanceCost(g: Gear) {
  const gold = Math.round(25 * Math.pow(1.55, g.enh) * (g.grade + 1) * (1 + g.avgTier));
  const mat = g.materials.slice().sort((a, b) => getMat(b.id).tier - getMat(a.id).tier)[0]!.id;
  return { gold, mat, qty: 1 + Math.floor(g.enh / 2) };
}
export function enhanceChance(s: GameState, g: Gear) {
  return Math.max(0.08, Math.min(0.97, 0.97 - g.enh * 0.055 + (s.char.race === "gnome" ? 0.08 : 0) + lvl(s, "enhancing") * 0.002));
}
export function enhance(s: GameState, id: string) {
  const g = s.gear.find((x) => x.id === id); if (!g || g.enh >= 20) return;
  const c = enhanceCost(g);
  if (s.gold < c.gold || (s.inv[c.mat] ?? 0) < c.qty) { log(s, "Not enough gold or materials."); return; }
  spend(s, c.gold); takeMat(s, c.mat, c.qty); bump(s, "upgrades");
  addXp(s, "enhancing", 5 + g.enh * 3);
  if (Math.random() < enhanceChance(s, g)) {
    g.enh++; g.maxDura = Math.round(g.maxDura * 1.04); g.dura = g.maxDura;
    log(s, `✨ ${g.name} enhanced to +${g.enh}!`); if (g.enh % 5 === 0) note(s, `✨ ${g.name} reached +${g.enh}! Effects empowered.`);
  } else {
    let msg = `💥 Enhancement failed`;
    if (g.enh >= 5) { g.enh--; msg += ` — dropped to +${g.enh}`; }
    if (g.enh >= 10) { g.dura = Math.round(g.dura * 0.7); msg += ", durability cracked"; }
    log(s, msg + ".");
  }
}
export const repairCost = (g: Gear) => Math.ceil((g.maxDura - g.dura) * (1 + g.avgTier) * (1 + g.grade * 0.3) * 0.5);
export function repair(s: GameState, id: string) {
  const g = s.gear.find((x) => x.id === id); if (!g) return;
  const c = repairCost(g); if (!spend(s, c)) { log(s, "Not enough gold."); return; }
  g.dura = g.maxDura; log(s, `🔧 Repaired ${g.name}.`);
}
export function forgeUpgradeCost(lvl_: number) {
  const n = lvl_ + 1;
  const mats: [string, number][] = [];
  if (n >= 2 && n <= 4) mats.push(["guardian_sigil", [0, 0, 2, 5, 10][n]!]);
  if (n >= 4) mats.push(["warden_crest", [0, 0, 0, 0, 1, 2, 4, 8][n]!]);
  return { gold: Math.round(250 * Math.pow(4, n - 2)), mats };
}
export function upgradeForge(s: GameState) {
  if (s.forgeLvl >= 7) return;
  const c = forgeUpgradeCost(s.forgeLvl);
  if (s.gold < c.gold || c.mats.some(([id, q]) => (s.inv[id] ?? 0) < q)) { log(s, "Missing gold or boss relics for the forge upgrade."); return; }
  spend(s, c.gold); c.mats.forEach(([id, q]) => takeMat(s, id, q));
  s.forgeLvl++; log(s, `🔥 Forge upgraded to Lv ${s.forgeLvl}!`); note(s, `🔥 Forge Lv ${s.forgeLvl} — higher grades unlocked`);
}
export function equipGear(s: GameState, id: string) {
  const g = s.gear.find((x) => x.id === id); if (!g) return;
  if (s.equip[g.slot] === id) { s.equip[g.slot] = undefined; clampVitals(s); return; }
  s.equip[g.slot] = id;
  for (const c of s.companions ?? []) for (const k of Object.keys(c.equip) as Slot[]) if (c.equip[k] === id) c.equip[k] = undefined;
  if (g.slot === "two_hand") { s.equip.one_hand = undefined; s.equip.shield = undefined; }
  if (g.slot === "one_hand" || g.slot === "shield") s.equip.two_hand = undefined;
  if (g.slot === "shield" || g.slot === "two_hand" || (g.slot === "one_hand" && s.ranged && TOOL[s.ranged]?.two)) s.ranged = undefined;
  clampVitals(s); learnSpells(s);
}
export function gearValue(g: Gear) { return Math.round(g.materials.reduce((a, m) => a + getMat(m.id).value * m.qty, 0) * 0.4 * (1 + g.grade * 0.5) * (1 + g.enh * 0.15)); }
export function sellGear(s: GameState, id: string) {
  const g = s.gear.find((x) => x.id === id); if (!g) return;
  SLOTS.forEach((sl) => { if (s.equip[sl] === id) s.equip[sl] = undefined; for (const c of s.companions ?? []) if (c.equip[sl] === id) c.equip[sl] = undefined; });
  s.gear = s.gear.filter((x) => x.id !== id);
  const v = Math.round(gearValue(g) * (1 + lvl(s, "trading") * 0.005)); earn(s, v); addXp(s, "trading", 2 + g.grade);
  log(s, `💰 Sold ${g.name} for ${v}g.`); clampVitals(s);
}

// ======================= cooking & refining =======================
export function cookPreview(mats: { id: string; qty: number }[], s: GameState) {
  const list = mats.filter((x) => x.qty > 0 && getMat(x.id).food);
  const kinds = list.length; const qty = list.reduce((a, b) => a + b.qty, 0);
  const raw = list.reduce((a, b) => a + (getMat(b.id).food ?? 0) * b.qty * tierMult(getMat(b.id).tier) * 0.6, 0);
  const tier = qty ? Math.round(list.reduce((a, b) => a + getMat(b.id).tier * b.qty, 0) / qty) : 0;
  const heal = Math.round(raw * (1 + (kinds - 1) * 0.25) * (1 + (lvl(s, "cooking") - 1) * 0.04) * (s.char.race === "halfling" ? 1.2 : 1));
  const names = ["Stew", "Pie", "Roast", "Feast", "Banquet"];
  const icon = ["🍲", "🥧", "🍖", "🍱", "🍛"][Math.min(4, kinds - 1)] ?? "🍲";
  const name = kinds ? `${getMat(list[0]!.id).name} ${names[Math.min(4, kinds - 1)]}` : "";
  return { heal, name, icon, kinds, qty, tier, servings: Math.max(1, Math.floor(qty / 2)) };
}
export function cook(s: GameState, mats: { id: string; qty: number }[]) {
  const pv = cookPreview(mats, s); if (!pv.kinds) return;
  for (const { id, qty } of mats) if (qty > 0) takeMat(s, id, qty);
  const ex = s.foods.find((f) => f.name === pv.name && f.heal === pv.heal);
  if (ex) ex.qty += pv.servings; else s.foods.push({ name: pv.name, icon: pv.icon, heal: pv.heal, qty: pv.servings, tier: pv.tier });
  bump(s, "foodCooked", pv.servings); addXp(s, "cooking", 4 + pv.qty * 2); addAff(s, "culinary", 2 + pv.kinds);
  log(s, `🍳 Cooked ${pv.servings}× ${pv.name} (+${pv.heal} HP).`);
}
/** Cook a Kitchen recipe and eat it straight away: its buff replaces any current meal and lasts its number of floors. */
export function cookRecipe(s: GameState, id: string): boolean {
  const r = RECIPE[id]; if (!r) return false;
  if (lvl(s, "cooking") < r.cook) { log(s, `❌ Needs Cooking Lv ${r.cook}.`); return false; }
  if (r.ing.some(([m, q]) => (s.inv[m] ?? 0) < q)) { log(s, `❌ Missing ingredients for ${r.name}.`); return false; }
  for (const [m, q] of r.ing) takeMat(s, m, q);
  s.meal = { id, floors: r.floors };
  const p = playerStats(s); s.hp = Math.min(p.hp, s.hp + Math.round(p.hp * 0.3)); s.sta = Math.min(p.sta, s.sta + Math.round(p.sta * 0.3));
  const n = r.ing.reduce((a, [, q]) => a + q, 0);
  bump(s, "foodCooked"); addXp(s, "cooking", 6 + n * 2); addAff(s, "culinary", 3 + r.ing.length);
  log(s, `${r.icon} You cook and eat ${r.name} — ${r.desc} for ${r.floors} floors.`); return true;
}
/** A floor of the Tower has passed: meal buffs count down. */
function tickMeal(s: GameState) {
  if (s.tonic) { s.tonic = { ...s.tonic, floors: s.tonic.floors - 1 }; if (s.tonic.floors <= 0) { log(s, `🥤 ${POTION[s.tonic.id]?.name ?? "Your tonic"} wore off.`); s.tonic = undefined; } }
  if (!s.meal) return;
  s.meal = { ...s.meal, floors: s.meal.floors - 1 };
  if (s.meal.floors <= 0) { log(s, `🍽️ ${RECIPE[s.meal.id]?.name ?? "Your meal"} wore off.`); s.meal = undefined; }
}
export function eatFood(s: GameState, idx: number) {
  const f = s.foods[idx]; if (!f) return 0;
  const p = playerStats(s);
  const heal = Math.min(f.heal, Math.round(p.hp * 0.45));
  s.hp = Math.min(p.hp, s.hp + heal); s.sta = Math.min(p.sta, s.sta + Math.round(p.sta * 0.25));
  f.qty--; if (f.qty <= 0) s.foods.splice(idx, 1);
  bump(s, "healing", heal);
  return heal;
}
const STATION_SKILL: Record<RefineStation, [string, string]> = { carve: ["carving", "🪚"], smelt: ["smelting", "🔥"], tan: ["tailoring", "🧵"] };
export function refine(s: GameState, id: string, times: number, station: RefineStation) {
  const mt = getMat(id); if (!mt.refine || mt.refine.station !== station) return;
  const n = Math.min(times, Math.floor((s.inv[id] ?? 0) / 2)); if (n <= 0) return;
  takeMat(s, id, n * 2); addMat(s, mt.refine.to, n); if (station === "smelt") bump(s, "ingotsSmelted", n);
  const [skill, ico] = STATION_SKILL[station];
  addXp(s, skill, n * (3 + mt.tier * 2)); addAff(s, "crafting", n);
  log(s, `${ico} Made ${n}× ${getMat(mt.refine.to).name}.`);
}

// ======================= village gathering =======================
const REGROW = 30;
export function gather(s: GameState, x: number, y: number): boolean {
  const t = villageTile(x, y); const k = key(x, y);
  const p = playerStats(s);
  if (TREES[t] || t === "R" || t === "F" || t === "W" || ANIMALS[t]) {
    if (ANIMALS[t] ? (s.village.animals[k] ?? 0) > s.step : (s.village.nodes[k] ?? 0) > s.step) {
      log(s, "⏳ Not ready yet — explore or rest to let it recover."); return false;
    }
    if (s.sta < 2) { log(s, "😮‍💨 Too tired. Eat or rest at home."); return false; }
    s.sta -= 2;
  }
  const yieldN = (lv: number) => Math.max(1, Math.floor((1 + Math.random() * (1 + lv / 15)) * p.gatherEff));
  if (TREES[t]) {
    const tr = TREES[t]!; const L = lvl(s, "woodcutting");
    if (L < tr.lvl) { log(s, `🪓 Need Woodcutting ${tr.lvl} for ${tr.name}.`); s.sta += 2; return false; }
    const q = yieldN(L); addMat(s, tr.mat, q); addXp(s, "woodcutting", 4 + getMat(tr.mat).tier * 4); bump(s, "treesCut"); bump(s, "g:" + tr.mat, q);
    s.village.nodes[k] = s.step + REGROW; log(s, `🪓 +${q} ${getMat(tr.mat).name}`); return true;
  }
  if (t === "R") {
    const L = lvl(s, "mining"); const id = pickWeighted(ORES.filter(([, l]) => L >= l).map(([i, , w]) => [i, w] as [string, number]));
    const q = Math.ceil(yieldN(L) * (s.char.race === "dwarf" ? 1.25 : 1)); addMat(s, id, q); addXp(s, "mining", 4 + getMat(id).tier * 4); bump(s, "oresMined"); bump(s, "g:" + id, q);
    s.village.nodes[k] = s.step + REGROW; log(s, `⛏️ +${q} ${getMat(id).name}`); return true;
  }
  if (t === "F") {
    const L = lvl(s, "herbalism"); const id = pickWeighted(FLOWERS.filter(([, l]) => L >= l).map(([i, , w]) => [i, w] as [string, number]));
    addMat(s, id, 1); let msg = `🌼 +1 ${getMat(id).name}`;
    if (Math.random() < 0.3 + L * 0.01) { const sd = pickWeighted(FLOWER_SEEDS); addMat(s, sd, 1); msg += `, +1 ${getMat(sd).name}`; }
    addXp(s, "herbalism", 4 + getMat(id).tier * 4); bump(s, "plantsHarvested"); bump(s, "g:" + id);
    s.village.nodes[k] = s.step + REGROW; log(s, msg); return true;
  }
  if (t === "W") {
    const L = lvl(s, "fishing"); const id = pickWeighted(POND.filter(([, l]) => L >= l).map(([i, , w]) => [i, w] as [string, number]));
    addMat(s, id, 1); addXp(s, "fishing", 5 + getMat(id).tier * 4); addAff(s, "water", 1); bump(s, "fishCaught"); bump(s, "g:" + id);
    s.village.nodes[k] = s.step + 12; log(s, `🎣 Caught ${getMat(id).name}!`); return true;
  }
  if (ANIMALS[t]) {
    const a = ANIMALS[t]!; const L = lvl(s, "husbandry"); const [id, n] = a.drops[ri(0, a.drops.length - 1)]!;
    const q = Math.max(1, Math.round(n * (1 + L / 25) * Math.random() + 0.5)); addMat(s, id, q);
    addXp(s, "husbandry", 5); bump(s, "animalsTended"); bump(s, "g:" + id, q);
    s.village.animals[k] = s.step + 40; log(s, `${a.icon} +${q} ${getMat(id).name}`); return true;
  }
  return false;
}
/** One repeatable gathering action at a village spot. Costs stamina, no cooldown. */
export function gatherSpot(s: GameState, id: SpotId, mat: string): boolean {
  const L = spotLevel(s.spots, id);
  if (!spotMatsFor(s, id).includes(mat)) { log(s, `🔒 Upgrade the ${SPOTS[id].name} to gather that.`); return false; }
  if (s.sta < 2) { log(s, "😮‍💨 Too tired. Eat or rest at home."); return false; }
  s.sta -= 2; s.step++;
  const def = SPOTS[id]; const sk = lvl(s, def.skill); const tier = getMat(mat).tier;
  const base = Math.max(1, Math.floor((1 + Math.random() * (1 + sk / 15)) * playerStats(s).gatherEff * (1 + L / 40)));
  const q = id === "mine" && s.char.race === "dwarf" ? Math.ceil(base * 1.25) : base;
  addMat(s, mat, q); addXp(s, def.skill, 4 + tier * 4); bump(s, def.stat); bump(s, "g:" + mat, q);
  if (id === "pond") addAff(s, "water", 1);
  if (id === "field" && Math.random() < 0.25 + sk * 0.01) { const sd = pickWeighted(FLOWER_SEEDS); addMat(s, sd, 1); }
  log(s, `${def.icon} +${q} ${getMat(mat).name}`); return true;
}
export function upgradeSpot(s: GameState, id: SpotId): boolean {
  const L = spotLevel(s.spots, id); if (L >= SPOT_MAX) return false;
  migrateSave(s);
  const c = spotUpgradeCost(id, L);
  if (s.gold < c.gold || (s.inv[c.mat] ?? 0) < c.qty) { log(s, `❌ Need ${c.gold.toLocaleString()}g and ${c.qty}× ${getMat(c.mat).name}.`); return false; }
  spend(s, c.gold); takeMat(s, c.mat, c.qty);
  s.spots = { ...s.spots, [id]: L + 1 };
  const un = SPOTS[id].mats.find(([, l]) => l === L + 1);
  log(s, `⬆️ ${SPOTS[id].name} reached level ${L + 1}${un ? ` — ${getMat(un[0]).name} unlocked!` : ""}`); return true;
}
// ---- village building levels ----
export const bldgLvl = (s: GameState, b: BldgId) => s.bldg?.[b] ?? 1;
export function upgradeBldg(s: GameState, b: BldgId): boolean {
  const L = bldgLvl(s, b); if (L >= BLDG_MAX) return false;
  if (!spend(s, bldgCost(L))) { log(s, "❌ Not enough gold."); return false; }
  s.bldg = { ...s.bldg, [b]: L + 1 }; log(s, `🏗️ Building upgraded to Lv ${L + 1}!`); return true;
}
export const storageUsed = (s: GameState) => s.whGear.length + Object.values(s.wh).filter((q) => q > 0).length;
export const storageMax = (s: GameState) => storageCap(bldgLvl(s, "house"));
export const marketMult = (s: GameState) => 1 + (bldgLvl(s, "market") - 1) * 0.04;
export const guildSellMult = (s: GameState) => guildMult(bldgLvl(s, "guild"));
export function storeGear(s: GameState, id: string): boolean {
  const g = s.gear.find((x) => x.id === id); if (!g) return false;
  if (storageUsed(s) >= storageMax(s)) { log(s, "📦 Storage is full — upgrade your Home."); return false; }
  s.gear = s.gear.filter((x) => x.id !== id); SLOTS.forEach((sl) => { if (s.equip[sl] === id) s.equip[sl] = undefined; }); s.whGear.push(g); return true;
}
export function storeAll(s: GameState) {
  let full = false;
  for (const [id, q] of Object.entries(s.inv)) {
    if (!q) continue;
    if (!s.wh[id] && storageUsed(s) >= storageMax(s)) { full = true; continue; }
    s.wh[id] = (s.wh[id] ?? 0) + q; delete s.inv[id];
  }
  if (full) log(s, "📦 Storage is full — some items stayed in your bag.");
}

// ---- church services ----
export const ailmentCost = (s: GameState, id: AilmentId) => Math.round(servicePrice(AILMENTS[id].cost, s.maxFloor) * churchDisc(bldgLvl(s, "church")));
export const blessingCost = (s: GameState, id: BlessingId) => Math.round(servicePrice(BLESSINGS[id].cost, s.maxFloor) * (1 - Math.min(0.3, (s.faith ?? 0) * 0.01)) * churchDisc(bldgLvl(s, "church")));
export function addAilment(s: GameState, id: AilmentId) { if (s.ailments?.[id]) return false; s.ailments = { ...s.ailments, [id]: 1 }; return true; }
export function cureAilment(s: GameState, id: AilmentId): boolean {
  if (!s.ailments?.[id]) return false;
  if (!spend(s, ailmentCost(s, id))) { log(s, "❌ Not enough gold for the cure."); return false; }
  const a = { ...s.ailments }; delete a[id]; s.ailments = a; clampVitals(s); log(s, `⛪ ${AILMENTS[id].name} cured.`); return true;
}
export function buyBlessing(s: GameState, id: BlessingId): boolean {
  if (!spend(s, blessingCost(s, id))) { log(s, "❌ Not enough gold for the blessing."); return false; }
  const n = blessBattles(bldgLvl(s, "church")); s.blessing = { id, left: n }; bump(s, "blessingsBought"); log(s, `✨ ${BLESSINGS[id].name} lasts ${n} battles.`); return true;
}
/** Free prayer once per return from the tower: builds faith (cheaper blessings) and grants a short random blessing. */
export function pray(s: GameState): BlessingId | null {
  if (s.prayed) return null;
  s.prayed = true; s.faith = (s.faith ?? 0) + 1; addAff(s, "light", 3); bump(s, "prayers");
  const ids = Object.keys(BLESSINGS) as BlessingId[]; const id = ids[ri(0, ids.length - 1)]!;
  if (!s.blessing || s.blessing.left < 3) s.blessing = { id, left: 3 };
  log(s, `🙏 You pray. Faith ${s.faith}. ${BLESSINGS[id].name} settles on you.`); return id;
}
export function enchantGear(s: GameState, gid: string, el: Element): boolean {
  const g = s.gear.find((x) => x.id === gid);
  if (!g || !["one_hand", "two_hand", "shield"].includes(g.slot)) return false;
  const c = enchantCost(g.grade, s.maxFloor);
  const mat = (s.inv[ENCHANT_MAT[el]!] ?? 0) >= c.qty ? ENCHANT_MAT[el]! : ENCHANT_ALT[el]!;
  const qty = mat === ENCHANT_MAT[el] ? c.qty : c.qty * 3;
  if (s.gold < c.gold || (s.inv[mat] ?? 0) < qty) { log(s, `❌ Need ${c.gold}g and ${qty}× ${getMat(mat).name}.`); return false; }
  spend(s, c.gold); takeMat(s, mat, qty);
  g.ench = { el, v: enchantPower(g.grade) + (mat === ENCHANT_MAT[el] ? 5 : 0) };
  log(s, `🌟 ${g.name} blessed with ${el}.`); return true;
}
export function enchantMatFor(s: GameState, g: Gear, el: Element) {
  const c = enchantCost(g.grade, s.maxFloor);
  return (s.inv[ENCHANT_MAT[el]!] ?? 0) >= c.qty ? { mat: ENCHANT_MAT[el]!, qty: c.qty, gold: c.gold } : { mat: ENCHANT_ALT[el]!, qty: c.qty * 3, gold: c.gold };
}

// ---- adventurers guild ----
const d0 = (s: GameState) => s.dungeon?.floor ?? Math.max(1, s.maxFloor);
export function captureBlock(s: GameState): string | null {
  const m = s.combat?.mon; if (!m) return "No target";
  if (m.boss) return "Guardians cannot be captured.";
  if ((s.companions?.length ?? 0) >= MAX_COMPANIONS) return `Party full (${MAX_COMPANIONS}).`;
  if (m.hp > m.maxHp * CAPTURE_HP) return `Weaken it below ${CAPTURE_HP * 100}% HP first.`;
  return null;
}
/** The gear a companion is holding in a slot (companion gear lives on the companion, not in the hero's bag). */
export const compGear = (c: Companion, sl: Slot) => (c.equip[sl] ? c.held?.find((g) => g.id === c.equip[sl]) : undefined);
/** Hands every piece a companion holds back to the hero's bag (used when they leave the party). */
function returnCompGear(s: GameState, c: Companion) {
  const back = c.held ?? []; if (!back.length) return;
  s.gear = [...s.gear, ...back]; c.held = []; c.equip = {};
  log(s, `🎒 ${c.name} returned ${back.map((g) => g.name).join(", ")} to your bag.`);
}
export function compStats(s: GameState, c: Companion) {
  const L = compLevel(c.xp);
  let hp = (60 + L * 12) * c.base.hp, atk = (5 + L * 1.3) * c.base.atk, def = (3 + L * 0.9) * c.base.def;
  for (const sl of SLOTS) { const g = compGear(c, sl); if (!g) continue; const gs = gearStats(g); hp += gs.hp; atk += c.base.magic ? gs.matk : gs.patk; def += c.base.magic ? gs.mdef : gs.pdef; }
  const kit = titleKit(c.title, c.titleTime?.[c.title ?? ""] ?? 0);
  hp *= 1 + (kit.mods.hp ?? 0); atk *= 1 + (c.base.magic ? kit.mods.matk ?? 0 : kit.mods.patk ?? 0); def *= 1 + (kit.mods.pdef ?? 0);
  return { level: L, hp: Math.round(hp), atk: Math.round(atk), def: Math.round(def), stars: kit.stars };
}
function companionsAct(s: GameState, c: Combat, p: PStats) {
  for (const cp of s.companions ?? []) {
    if (c.mon.hp <= 0) return;
    const st = compStats(s, cp);
    if (cp.role === "cleric" && c.turn % 2 === 0) { const h = Math.min(p.hp - s.hp, Math.round(st.atk * 2 + p.hp * 0.05)); if (h > 0) { s.hp += h; c.healed += h; clog(c, `✨ ${cp.name} heals you for ${h}.`); continue; } }
    const hits = cp.role === "archer" && Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < hits; i++) {
      const dmg = Math.max(1, Math.round(dmgFormula(st.atk, c.mon.defn * (cp.base.magic ? 0.75 : 1)) * rand(0.85, 1.15)));
      c.mon.hp -= dmg; c.dealt += dmg; clog(c, `🤝 ${cp.name} hits for ${dmg}`);
    }
    if (cp.title) cp.titleTime = { ...cp.titleTime, [cp.title]: (cp.titleTime?.[cp.title] ?? 0) + 6 };
  }
}
function tickRentals(s: GameState) {
  if (!s.companions?.length) return;
  for (const c of s.companions) if (c.rentLeft !== undefined) c.rentLeft--;
  const gone = s.companions.filter((c) => c.rentLeft !== undefined && c.rentLeft <= 0);
  if (gone.length) { gone.forEach((g) => returnCompGear(s, g)); s.companions = s.companions.filter((c) => !gone.includes(c)); log(s, `👋 ${gone.map((g) => g.name).join(", ")}'s contract ended.`); }
}
export function hireCompanion(s: GameState, role: CompRole, buy: boolean): boolean {
  const h = HIRELINGS.find((x) => x.role === role); if (!h) return false;
  if ((s.companions?.length ?? 0) >= MAX_COMPANIONS) { log(s, `❌ Party is full (${MAX_COMPANIONS}).`); return false; }
  const price = buy ? buyPrice(s.maxFloor) : rentPrice(s.maxFloor);
  if (!spend(s, price)) { log(s, "❌ Not enough gold."); return false; }
  const L = Math.max(1, Math.round(s.maxFloor * 0.9) || 1);
  const n = (s.companions ?? []).filter((c) => c.name.startsWith(h.name)).length;
  s.companions = [...(s.companions ?? []), { id: uid(), name: n ? `${h.name} ${n + 1}` : h.name, kind: "human", role, race: h.race, gender: h.gender, xp: 15 * (L - 1) ** 2,
    base: { hp: h.hp, atk: h.atk, def: h.def, magic: h.magic }, equip: {}, rentLeft: buy ? undefined : RENT_FLOORS }];
  log(s, `🤝 ${h.name} ${buy ? "joins you for good" : `is hired for ${RENT_FLOORS} floors`}.`); return true;
}
export function dismissCompanion(s: GameState, id: string) {
  const c = s.companions?.find((x) => x.id === id); if (c) returnCompGear(s, c);
  s.companions = (s.companions ?? []).filter((x) => x.id !== id);
}
/** Gear in the hero's bag that the hero is not wearing. */
export function freeGear(s: GameState) {
  const used = new Set(Object.values(s.equip).filter(Boolean));
  return s.gear.filter((g) => !used.has(g.id));
}
/** Give a spare bag item to a companion (it leaves the bag), or take one back (it returns to the bag). */
export function compEquip(s: GameState, cid: string, gid: string | undefined, slot: Slot): boolean {
  const c = s.companions?.find((x) => x.id === cid); if (!c) return false;
  const old = compGear(c, slot);
  if (gid) {
    const g = freeGear(s).find((x) => x.id === gid && x.slot === slot); if (!g) return false;
    s.gear = s.gear.filter((x) => x.id !== gid);
    if (old) s.gear.push(old);
    c.held = [...(c.held ?? []).filter((x) => x.id !== old?.id), g]; c.equip = { ...c.equip, [slot]: gid };
    log(s, `🤝 ${c.name} takes ${g.name}${old ? `; ${old.name} goes back to your bag` : ""}.`); return true;
  }
  if (old) {
    if (s.gear.length >= GEAR_CAP) { log(s, "🎒 Gear bag full — make room before taking gear back."); return false; }
    s.gear.push(old); c.held = (c.held ?? []).filter((x) => x.id !== old.id);
    log(s, `🎒 ${old.name} is back in your bag.`);
  }
  c.equip = { ...c.equip, [slot]: undefined }; return true;
}
export function compTitle(s: GameState, cid: string, t: string | undefined) {
  const c = s.companions?.find((x) => x.id === cid); if (!c) return;
  if (t && !s.titles.includes(t)) return; c.title = t;
}
export function trainSkill(s: GameState, k: string): boolean | null {
  const L = lvl(s, k); if (L >= MAX_SKILL) return null;
  if (!spend(s, trainCost(L))) { log(s, "❌ Not enough gold for training."); return null; }
  if (Math.random() < trainChance(L) + (bldgLvl(s, "guild") - 1) * 0.03) {
    s.skills[k] = (s.skills[k] ?? 0) + (xpForLevel(L + 1) - xpForLevel(L)) * 0.5;
    log(s, `🏋️ Training paid off! ${k} ${L} → ${lvl(s, k)}`); return true;
  }
  log(s, `🏋️ Training went poorly — no progress on ${k}.`); return false;
}
export function specAffinities(s: GameState) { return Object.entries(s.aff).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([a]) => a).filter((a) => AFF_BY_ID[a]); }
export function techLock(s: GameState, aff: string, kind: "passive" | "active"): string | null {
  if ((s.techs ?? []).includes(techId(aff, kind))) return "Learned";
  if (!specAffinities(s).includes(aff)) return "Not your specialization";
  if (affLevel(s.aff[aff] ?? 0) < TECH_REQ[kind]) return `Affinity Lv ${TECH_REQ[kind]}`;
  return null;
}
export function learnTech(s: GameState, aff: string, kind: "passive" | "active"): boolean {
  if (techLock(s, aff, kind)) return false;
  if (!spend(s, techGold(kind))) { log(s, "❌ Not enough gold."); return false; }
  s.techs = [...(s.techs ?? []), techId(aff, kind)]; log(s, `📖 Learned a ${AFF_BY_ID[aff]!.name} ${kind} technique!`); return true;
}

// ---- magic tower ----
export const knowsSchool = (s: GameState, id: SchoolId) => s.magic?.[id] !== undefined;
export function schoolLock(s: GameState, id: SchoolId): string | null {
  const sc = SCHOOL[id];
  if (sc.combo) { const [a, b] = sc.combo; if (schoolLevel(s.magic?.[a] ?? -1) < COMBO_LEVEL || !knowsSchool(s, a) || schoolLevel(s.magic?.[b] ?? -1) < COMBO_LEVEL || !knowsSchool(s, b)) return `Undiscovered — reach Lv ${COMBO_LEVEL} in ${SCHOOL[a].name} and ${SCHOOL[b].name}`; }
  if (playerStats(s).matk < sc.matk) return `Needs ${sc.matk} M.Atk`;
  return null;
}
export function learnSchool(s: GameState, id: SchoolId): boolean {
  if (knowsSchool(s, id) || schoolLock(s, id)) return false;
  if (!spend(s, SCHOOL[id].gold)) { log(s, "❌ Not enough gold for tuition."); return false; }
  s.magic = { ...s.magic, [id]: 0 }; log(s, `🔮 You ${SCHOOL[id].combo ? "discovered" : "began studying"} ${SCHOOL[id].name}!`); learnSpells(s); return true;
}
export function studySchool(s: GameState, id: SchoolId): boolean {
  if (!knowsSchool(s, id)) return false;
  const L = schoolLevel(s.magic![id]!); if (!spend(s, studyCost(L))) { log(s, "❌ Not enough gold to study."); return false; }
  s.magic = { ...s.magic, [id]: s.magic![id]! + STUDY_XP }; addXp(s, "spellcasting", 6); addAff(s, "arcane", 1);
  const nl = schoolLevel(s.magic[id]!); if (nl > L) log(s, `📘 ${SCHOOL[id].name} reached Lv ${nl}.`);
  learnSpells(s); return true;
}
export function spellLock(s: GameState, id: string, matk = playerStats(s).matk): string | null {
  const sp = SPELL[id]!; if (!knowsSchool(s, sp.school)) return "School not learned";
  if (schoolLevel(s.magic![sp.school]!) < sp.lvl) return `${SCHOOL[sp.school].name} Lv ${sp.lvl}`;
  if (matk < sp.matk) return `${sp.matk} M.Atk`;
  return null;
}
/** Auto-learns every spell whose school level and M.Atk requirements are met. */
export function learnSpells(s: GameState) {
  if (!s.magic) return;
  const have = new Set(s.spells ?? []); const matk = playerStats(s).matk;
  for (const sp of SPELLS) if (!have.has(sp.id) && !spellLock(s, sp.id, matk)) { have.add(sp.id); log(s, `✨ New spell: ${sp.name}!`); }
  s.spells = [...have];
  if (!s.spellSlots) s.spellSlots = [...have].slice(0, MAX_SPELL_SLOTS);
  for (const id of have) if (s.spellSlots.length < MAX_SPELL_SLOTS && !s.spellSlots.includes(id)) s.spellSlots = [...s.spellSlots, id];
}
export const MAX_SPELL_SLOTS = 4; export const SPELL_MAX_LV = 10; export const SPELL_LV_BONUS = 0.12;
export function equippedSpells(s: GameState) { return (s.spellSlots ?? (s.spells ?? []).slice(0, MAX_SPELL_SLOTS)).filter((id) => s.spells?.includes(id)); }
export function toggleSpell(s: GameState, id: string): boolean {
  if (!s.spells?.includes(id)) return false;
  const cur = equippedSpells(s);
  if (cur.includes(id)) { s.spellSlots = cur.filter((x) => x !== id); return true; }
  if (cur.length >= MAX_SPELL_SLOTS) { log(s, `❌ Only ${MAX_SPELL_SLOTS} Magic Tower spells can be equipped.`); return false; }
  s.spellSlots = [...cur, id]; return true;
}
/** Upgrade price grows with the spell's level and with how advanced the spell is (school level that unlocks it). */
export const spellUpCost = (id: string, lv: number) => Math.round(150 * lv * lv * (1 + SPELL[id]!.lvl / 6) * (SCHOOL[SPELL[id]!.school].combo ? 2 : 1));
export function levelSpell(s: GameState, id: string): boolean {
  if (!s.spells?.includes(id)) return false;
  const lv = s.spellLv?.[id] ?? 1; if (lv >= SPELL_MAX_LV) return false;
  if (!spend(s, spellUpCost(id, lv))) { log(s, "❌ Not enough gold."); return false; }
  s.spellLv = { ...s.spellLv, [id]: lv + 1 }; addXp(s, "spellcasting", 5); log(s, `📈 ${SPELL[id]!.name} reached Lv ${lv + 1}.`); return true;
}
export function ascensionProgress(s: GameState) {
  return ASCENSIONS.map((a) => {
    const reqs = a.reqs.map((r) => { const cur = r.stat === "maxFloor" ? s.maxFloor : s.stats[r.stat] ?? 0; return { ...r, cur, ok: r.exact ? cur === r.need : cur >= r.need, failed: !!r.exact && cur > r.need }; });
    const learned = knowsSchool(s, a.school);
    return { ...a, learned, reqs, ready: learned && reqs.every((r) => r.ok) && s.char.race !== a.race, failed: reqs.some((r) => r.failed) };
  });
}
export function ascend(s: GameState, raceId: string): boolean {
  const a = ascensionProgress(s).find((x) => x.race === raceId); if (!a?.ready) return false;
  s.char = { ...s.char, origin: s.char.origin ?? s.char.race, race: raceId };
  if (s.ailments?.poisoned && ASC_RACES.find((r) => r.id === raceId)?.poisonImmune) { const x = { ...s.ailments }; delete x.poisoned; s.ailments = x; }
  clampVitals(s); note(s, `🌑 You have become a ${ASC_RACES.find((r) => r.id === raceId)!.name}!`); log(s, `🌑 Ascended into a ${raceId}.`); return true;
}

// ---- craftery ----
export function craftTool(s: GameState, id: string, times = 1): boolean {
  const t = TOOL[id]; if (!t) return false;
  if ((t.lvl ?? 1) > bldgLvl(s, "craftery")) { log(s, `❌ Needs Craftery Lv ${t.lvl}.`); return false; }
  let made = 0;
  for (let i = 0; i < times; i++) {
    if ((t.kind === "ranged" || t.kind === "torch") && (s.tools?.[id] ?? 0) > 0) break;
    if (s.gold < t.gold || t.recipe.some(([m, q]) => (s.inv[m] ?? 0) < q)) break;
    spend(s, t.gold); for (const [m, q] of t.recipe) takeMat(s, m, q);
    s.tools = { ...s.tools, [id]: (s.tools?.[id] ?? 0) + t.makes }; made++;
    addXp(s, "smithing", 2); addAff(s, "crafting", 0.5);
  }
  if (!made) { log(s, `❌ Missing materials or gold for ${t.name}.`); return false; }
  log(s, `🪤 Crafted ${t.makes * made}× ${t.name}.`); return true;
}
// ---- alchemy ----
/** Brew a Craftery Alchemy recipe `times` times (stops when gold or materials run out). */
export function brewPotion(s: GameState, id: string, times = 1): boolean {
  const pt = POTION[id]; if (!pt) return false;
  if (pt.lvl > bldgLvl(s, "craftery")) { log(s, `❌ Needs Craftery Lv ${pt.lvl}.`); return false; }
  let made = 0;
  for (let i = 0; i < times; i++) {
    if (s.gold < pt.gold || pt.recipe.some(([m, q]) => (s.inv[m] ?? 0) < q)) break;
    spend(s, pt.gold); for (const [m, q] of pt.recipe) takeMat(s, m, q);
    s.potions = { ...s.potions, [id]: (s.potions?.[id] ?? 0) + pt.makes }; made++;
    bump(s, "potionsBrewed", pt.makes); addXp(s, "smithing", 2); addAff(s, "crafting", 0.6); addAff(s, "nature", 0.3);
  }
  if (!made) { log(s, `❌ Missing materials or gold for ${pt.name}.`); return false; }
  log(s, `⚗️ Brewed ${pt.makes * made}× ${pt.name}.`); return true;
}
/** Effect of drinking an elixir, coating your weapon with an oil or drinking a tonic. Returns HP restored. */
function applyPotion(s: GameState, id: string, p = playerStats(s)): number {
  const pt = POTION[id]!; let healed = 0;
  if (pt.heal) {
    const h = pt.heal;
    if (h.hp) { const before = s.hp; s.hp = Math.min(p.hp, s.hp + Math.round(p.hp * h.hp)); healed = s.hp - before; }
    if (h.mp) s.mp = Math.min(p.mp, s.mp + Math.round(p.mp * h.mp));
    if (h.sta) s.sta = Math.min(p.sta, s.sta + Math.round(p.sta * h.sta));
    bump(s, "elixirsDrunk");
  }
  if (pt.oil) { s.oil = { id, left: OIL_BATTLES }; bump(s, "oilsApplied"); log(s, `🛢️ ${pt.name} coats your weapon for ${OIL_BATTLES} battles.`); }
  if (pt.tonic) { s.tonic = { id, floors: TONIC_FLOORS }; log(s, `🥤 ${pt.name}: ${pt.desc} for ${TONIC_FLOORS} floors.`); }
  return healed;
}
/** Use a potion outside battle (flasks can only be thrown in battle). */
export function usePotion(s: GameState, id: string): boolean {
  const pt = POTION[id]; if (!pt || pt.flask || !(s.potions?.[id] ?? 0)) return false;
  s.potions = { ...s.potions, [id]: s.potions![id]! - 1 };
  const h = applyPotion(s, id); if (pt.heal) log(s, `${pt.icon} ${pt.name}${h ? ` restores ${h} HP` : ""}.`);
  return true;
}
/** Raise a crafted torch or ranged weapon one grade (Common → EX). */
export function upgradeOffhand(s: GameState, id: string): boolean {
  const t = TOOL[id]; if (!t || !isHeldTool(t) || !(s.tools?.[id] ?? 0)) return false;
  const g = toolGrade(s, id); if (g >= OFFHAND_MAX) return false;
  const c = offhandUpCost(t, g + 1);
  if (bldgLvl(s, "craftery") < c.lvl) { log(s, `❌ Needs Craftery Lv ${c.lvl}.`); return false; }
  if (s.gold < c.gold || c.mats.some(([m, q]) => (s.inv[m] ?? 0) < q)) { log(s, `❌ Missing gold or materials to upgrade ${t.name}.`); return false; }
  spend(s, c.gold); for (const [m, q] of c.mats) takeMat(s, m, q);
  s.toolGrades = { ...s.toolGrades, [id]: g + 1 };
  addXp(s, "smithing", 10 * (g + 1)); addAff(s, "crafting", 2 + g);
  log(s, `⬆️ ${t.name} is now ${GRADES[g + 1]}!`); if (g + 1 >= 4) note(s, `🌟 ${t.name} reached ${GRADES[g + 1]}!`);
  return true;
}
export function equipRanged(s: GameState, id: RangedId | undefined) {
  if (id && !(s.tools?.[id] ?? 0)) return false;
  if (id && s.equip.two_hand) { log(s, "❌ Two-handed weapons leave no hand free."); return false; }
  if (id && s.equip.shield) s.equip.shield = undefined;
  if (id && TOOL[id]?.two && s.equip.one_hand) { s.equip.one_hand = undefined; log(s, "Your one-handed weapon was stowed — this needs both hands."); }
  s.ranged = id; log(s, id ? `${TOOL[id]!.kind === "torch" ? "🔥" : "🏹"} ${TOOL[id]!.name} readied in your off-hand.` : "Off-hand cleared."); return true;
}
/** Torch held in the off-hand, if any (torches share the off-hand with shields and ranged weapons). */
export const heldTorch = (s: GameState) => (s.ranged && TOOL[s.ranged]?.kind === "torch" ? TOOL[s.ranged] : undefined);
export const sightRadius = (s: GameState) => { const t = heldTorch(s); return BASE_SIGHT + (t ? offhandFx(t, toolGrade(s, t.id)).sight : 0); };
export function placeTrap(s: GameState, id: string, x: number, y: number): boolean {
  const d = s.dungeon; const t = TOOL[id];
  if (!d || !t || t.kind !== "trap" || !(s.tools?.[id] ?? 0)) return false;
  if (Math.abs(s.pos.x - x) + Math.abs(s.pos.y - y) > TRAP_RANGE || d.tiles[y]?.[x] !== "." || (x === s.pos.x && y === s.pos.y)) return false;
  if (d.monsters.some((m) => m.x === x && m.y === y) || d.traps?.some((q) => q.x === x && q.y === y)) return false;
  s.tools = { ...s.tools, [id]: s.tools![id]! - 1 }; d.traps = [...(d.traps ?? []), { x, y, id }];
  addXp(s, "hunting", 2); log(s, `${t.icon} ${t.name} set.`); return true;
}
function triggerTrap(s: GameState, m: Mon) {
  const d = s.dungeon!; const tr = d.traps?.find((q) => q.x === m.x && q.y === m.y); if (!tr) return;
  const t = TOOL[tr.id]!; d.traps = d.traps!.filter((q) => q !== tr); bump(s, "trapsSprung");
  const dmg = Math.round(m.maxHp * (t.pct ?? 0) * (m.boss ? 0.4 : 1));
  m.hp -= dmg; bump(s, "dmgDealt", dmg); addXp(s, "hunting", 3);
  if (t.stun) { m.rooted = 5; m.trapStun = t.stun; }
  if (t.burn) m.trapBurn = Math.round(m.maxHp * t.burn);
  if (m.hp <= 0) {
    d.monsters = d.monsters.filter((x) => x !== m); bump(s, "kills"); addCharXp(s, m.xp);
    const id = m.drops[ri(0, m.drops.length - 1)]!; addMat(s, id, 1, true);
    log(s, `${t.icon} ${m.name} died in your ${t.name}! +${getMat(id).name}`);
  } else log(s, `${t.icon} ${m.name} triggered your ${t.name} (−${dmg}).`);
}
/** Per-step ailment ticks while exploring. */
export function stepAilments(s: GameState) { bump(s, "dungeonSteps"); if (s.ailments?.poisoned && s.hp > 1) s.hp -= 1; }

export function churchHealCost(s: GameState) { return 10 + Math.floor(s.maxFloor * 2); }
export function churchHeal(s: GameState): boolean {
  if (!spend(s, churchHealCost(s))) { log(s, "❌ Not enough gold for the offering."); return false; }
  const p = playerStats(s); s.hp = p.hp; s.mp = p.mp; log(s, "⛪ The priest's blessing restores you."); return true;
}
export function plant(s: GameState, x: number, y: number, seed: string) {
  const mt = getMat(seed); if (!mt.seedOf || !takeMat(s, seed, 1)) return;
  const L = lvl(s, "farming");
  s.village.plots[key(x, y)] = { crop: mt.seedOf, readyAt: s.step + Math.max(12, 40 - L) };
  addXp(s, "farming", 3); bump(s, "seedsPlanted"); log(s, `🌱 Planted ${getMat(mt.seedOf).name}.`);
}
export function harvest(s: GameState, x: number, y: number) {
  const k = key(x, y); const p = s.village.plots[k]; if (!p || p.readyAt > s.step) return;
  const L = lvl(s, "farming"); const q = 2 + Math.floor(Math.random() * (2 + L / 8));
  addMat(s, p.crop, q); const seed = Object.values(MATERIALS).find((m) => m.seedOf === p.crop)?.id;
  if (seed && Math.random() < 0.7) addMat(s, seed, 1 + (Math.random() < L / 50 ? 1 : 0));
  delete s.village.plots[k]; addXp(s, "farming", 8 + q); addAff(s, "nature", 2); bump(s, "plantsHarvested", q); bump(s, "g:" + p.crop, q);
  log(s, `🧺 Harvested ${q} ${getMat(p.crop).name}.`);
}
export function restAtHome(s: GameState) {
  const p = playerStats(s); const k = restPct(bldgLvl(s, "house")) / 100; bump(s, "rests");
  s.hp = Math.min(p.hp, s.hp + Math.round(p.hp * k)); s.mp = Math.min(p.mp, s.mp + Math.round(p.mp * k)); s.sta = Math.min(p.sta, s.sta + Math.round(p.sta * k)); s.step += 60;
  log(s, `🛌 You rest and recover ${Math.round(k * 100)}%. The village grows a little.`);
}

// ======================= dungeon =======================
export const DW = 21, DH = 15;
export const floorTier = (f: number) => Math.min(10, Math.floor(11 * Math.pow(f / 1000, 0.6)));
// Enemy curve: every floor is MON_GROWTH× stronger than the floor below (HP, ATK and DEF); floor 1 is the baseline.
export const MON_GROWTH = 1.05;
export const monScale = (f: number) => { const m = Math.pow(MON_GROWTH, Math.max(0, f - 1)); return { hp: m, atk: m, def: m }; };
const MAGICAL = new Set(["bat", "wraith", "imp", "frost", "lich", "seraph", "phoenix", "starspawn", "horror", "naga"]);

export function makeMonster(f: number, x: number, y: number, boss: 0 | 1 | 2 | 3 = 0): Mon {
  const t = floorTier(f);
  let def: MonsterDef;
  if (boss === 3) def = MONSTERS.find((m) => m.id === "sovereign")!;
  else {
    // Monsters live in their natural environment: prefer natives of this floor's theme, else the global tier pool.
    const native = themePool(themeFor(f).name, t);
    if (native.length) def = native[ri(0, native.length - 1)]!;
    else {
      const tierPick = Math.random() < 0.7 || t === 0 ? t : t - 1;
      const pool = MONSTERS.filter((m) => m.tier === tierPick && m.id !== "sovereign");
      def = pool[ri(0, pool.length - 1)] ?? MONSTERS[0]!;
    }
  }
  const sc = monScale(f);
  let hp = 40 * def.hp * sc.hp, atk = 7 * def.atk * sc.atk, defn = 3 * def.def * sc.def, dodge = 4;
  let name = def.name, affix: string | undefined, ability = def.ability;
  if (boss === 1) { hp *= 6; atk *= 1.4; defn *= 1.3; name = `Guardian ${def.name}`; ability = ability ?? "heavy"; }
  if (boss === 2) { hp *= 14; atk *= 1.7; defn *= 1.5; name = `Arch-Warden ${def.name}`; ability = "heavy"; }
  if (boss === 3) { hp *= 25; atk *= 2; defn *= 1.6; }
  if (!boss && Math.random() < 0.08 + Math.min(0.2, f / 2500)) {
    affix = ELITE_AFFIX[ri(0, ELITE_AFFIX.length - 1)]!; name = `${affix} ${def.name}`;
    if (affix === "Savage") atk *= 1.4; if (affix === "Armored") defn *= 1.7; if (affix === "Colossal") hp *= 2.2;
    if (affix === "Swift") dodge = 18; if (affix === "Vampiric") ability = "drain"; if (affix === "Venomous") ability = "poison";
    hp *= 1.3;
  }
  const xp = Math.round(6 * Math.pow(1.1, f / 10) * (boss === 3 ? 60 : boss === 2 ? 25 : boss === 1 ? 8 : affix ? 2 : 1));
  return {
    uid: uid(), def: def.id, name, icon: def.icon, x, y, hp: Math.round(hp), maxHp: Math.round(hp), atk, defn, weak: def.weak, element: def.element,
    tier: def.tier, boss, magical: MON_DEF[def.id]?.magical ?? MAGICAL.has(def.id), ability, affix, xp, drops: def.drops, dodge,
  };
}
export function genDungeon(f: number): { d: Dungeon; start: { x: number; y: number } } {
  const g: string[][] = Array.from({ length: DH }, () => Array(DW).fill("#"));
  const start = { x: Math.floor(DW / 2), y: DH - 2 };
  let cx = start.x, cy = start.y, carved = 0, guard = 0;
  const target = Math.floor(DW * DH * 0.42);
  while (carved < target && guard++ < 20000) {
    if (g[cy]![cx] === "#") { g[cy]![cx] = "."; carved++; }
    const dir = ri(0, 3); const nx = cx + [1, -1, 0, 0][dir]!, ny = cy + [0, 0, 1, -1][dir]!;
    if (nx > 0 && ny > 0 && nx < DW - 1 && ny < DH - 1) { cx = nx; cy = ny; }
  }
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
  const spots = Object.keys(dist).filter((k) => dist[k]! > 3 && k !== key(far.x, far.y))
    .map((k) => { const [x, y] = k.split(",").map(Number); return { x: x!, y: y! }; }).sort(() => Math.random() - 0.5);
  const monsters: Mon[] = [];
  const bossKind: 0 | 1 | 2 | 3 = f === 1000 ? 3 : f % 100 === 0 ? 2 : f % 10 === 0 ? 1 : 0;
  const count = Math.min(10, 4 + Math.floor(f / 50));
  for (let i = 0; i < count && spots.length; i++) { const p = spots.pop()!; monsters.push(makeMonster(f, p.x, p.y)); }
  if (bossKind) {
    const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: far.x + dx!, y: far.y + dy! }))
      .find((p) => g[p.y]?.[p.x] === "." && !monsters.some((m) => m.x === p.x && m.y === p.y));
    const bp = adj ?? far; monsters.push(makeMonster(f, bp.x, bp.y, bossKind));
  }
  for (let i = 0; i < 2 && spots.length; i++) { const p = spots.pop()!; g[p.y]![p.x] = "V"; }
  if (Math.random() < 0.6 && spots.length) { const p = spots.pop()!; g[p.y]![p.x] = "$"; }
  g[far.y]![far.x] = ">";
  // stairs down sit where you arrive; you step off them onto a free neighbour (floor 1 has none — retreat leads home)
  let spawn = start, down: { x: number; y: number } | undefined;
  if (f > 1) {
    const nb = [[0, -1], [1, 0], [-1, 0], [0, 1]].map(([dx, dy]) => ({ x: start.x + dx!, y: start.y + dy! })).find((q) => g[q.y]?.[q.x] === ".");
    if (nb) { down = start; g[start.y]![start.x] = "<"; spawn = nb; }
  }
  return { d: { floor: f, w: DW, h: DH, tiles: g.map((r) => r.join("")), monsters, stairs: far, down, bossAlive: !!bossKind }, start: spawn };
}
/** Free floor tile next to (x, y), used to place the hero beside a staircase. */
function besideTile(d: Dungeon, x: number, y: number) {
  return [[0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dy]) => ({ x: x + dx!, y: y + dy! }))
    .find((q) => d.tiles[q.y]?.[q.x] === "." && !d.monsters.some((m) => m.x === q.x && m.y === q.y));
}
const bossNote = (f: number) => f === 1000 ? "the Eternal Warden waits!" : f % 100 === 0 ? "an Arch-Warden guards this floor!" : f % 10 === 0 ? "a Guardian awaits!" : "";
export function enterDungeon(s: GameState, f: number) {
  const { d, start } = genDungeon(f);
  s.dungeon = d; s.loc = "dungeon"; s.pos = start; s.bag = {}; s.relentlessUsed = false;
  const bk = bossNote(f);
  log(s, `🗼 Entered Floor ${f}${bk ? " — " + bk : ""}`);
}
/** Move to another floor without leaving the Tower; the expedition bag stays with you. */
function changeFloor(s: GameState, f: number, fromAbove: boolean) {
  tickRentals(s); tickMeal(s);
  const { d, start } = genDungeon(f);
  s.dungeon = d; s.combat = undefined; s.relentlessUsed = false; s.step += 60; learnSpells(s);
  if (fromAbove) {
    // coming down: you arrive beside the up stairs; the floor's boss no longer bars the way back up
    d.fromAbove = true; d.bossAlive = false;
    s.pos = besideTile(d, d.stairs.x, d.stairs.y) ?? start;
  } else s.pos = start;
}
/** Take the stairs up: clears the current floor (bonus unless you came down onto it) and climbs to the next one. */
export function climbUp(s: GameState) {
  const d = s.dungeon!; const f = d.floor;
  if (d.bossAlive) return false;
  const first = f > s.maxFloor;
  if (first) { s.maxFloor = f; bump(s, "floorsCleared"); }
  if (!d.fromAbove) { bump(s, `floors:${themeFor(f).name}`); bump(s, "floorStreak"); s.stats["bestFloorStreak"] = Math.max(s.stats["bestFloorStreak"] ?? 0, s.stats["floorStreak"] ?? 0); }
  let msg = `🏁 Floor ${f} cleared${first ? " for the first time" : ""}!`;
  if (!d.fromAbove) {
    const bonus = Math.round(10 * Math.pow(1.1, f / 10) * (first ? 3 : 1)); earn(s, bonus); addCharXp(s, Math.round(10 * Math.pow(1.1, f / 10)));
    msg += ` +${bonus}g.`;
  }
  if (first && f % 10 === 0) note(s, `🏁 Floor ${f} conquered!`);
  if (f >= 1000) { leaveDungeon(s, true); log(s, `${msg} You stand atop the Tower and return to Thornvale.`); return true; }
  changeFloor(s, f + 1, false);
  const bk = bossNote(f + 1);
  log(s, `${msg} ⬆️ Up to Floor ${f + 1}${bk ? " — " + bk : ""}`);
  return true;
}
/** Take the stairs down to the floor below, arriving beside its up stairs. */
export function climbDown(s: GameState) {
  const f = s.dungeon!.floor; if (f <= 1) return false;
  changeFloor(s, f - 1, true);
  log(s, `⬇️ Down to Floor ${f - 1}.`);
  return true;
}
export function leaveDungeon(s: GameState, keepLoot: boolean) {
  if (s.dungeon) tickMeal(s);
  if (keepLoot) for (const [id, q] of Object.entries(s.bag)) addMat(s, id, q);
  s.bag = {}; s.dungeon = undefined; s.combat = undefined; s.loc = "village"; s.pos = { ...VILLAGE_START };
  s.step += 120; s.marketSeed = Date.now(); s.casinoPlays = 0; s.prayed = false; learnSpells(s); tickRentals(s); rerollQuestsIfDone(s);
}
function setTile(d: Dungeon, x: number, y: number, c: string) { const r = d.tiles[y]!; d.tiles[y] = r.slice(0, x) + c + r.slice(x + 1); }
export function mineVein(s: GameState, x: number, y: number) {
  const d = s.dungeon!; const t = floorTier(d.floor);
  const pool = VEINS.filter((id) => getMat(id).tier <= Math.max(1, t + 1));
  const id = pool[ri(Math.max(0, pool.length - 3), pool.length - 1)]!;
  const q = 1 + Math.floor(Math.random() * (1 + lvl(s, "mining") / 12));
  addMat(s, id, q, true); addXp(s, "mining", 6 + getMat(id).tier * 4); bump(s, "oresMined");
  setTile(d, x, y, "."); log(s, `💎 Mined ${q}× ${getMat(id).name}`);
}
export function openChest(s: GameState, x: number, y: number) {
  const d = s.dungeon!; const p = playerStats(s);
  const gold = Math.round(20 * Math.pow(1.1, d.floor / 10) * rand(0.8, 1.6) * p.itemFind); earn(s, gold);
  const t = floorTier(d.floor);
  const pool = Object.values(MATERIALS).filter((m) => (m.src === "monster" || m.src === "mining") && m.tier <= t + 1 && m.tier >= Math.max(0, t - 1) && !m.catalyst);
  const mt = pool[ri(0, pool.length - 1)]; if (mt) addMat(s, mt.id, ri(1, 3), true);
  setTile(d, x, y, "."); bump(s, "treasures");
  log(s, `🧰 Treasure! +${gold}g${mt ? ` and ${mt.name}` : ""}`);
}
export function moveMonsters(s: GameState): Mon | null {
  const d = s.dungeon!; let attacker: Mon | null = null;
  for (const m of d.monsters) {
    if (m.boss) continue;
    const dx = s.pos.x - m.x, dy = s.pos.y - m.y, dist = Math.abs(dx) + Math.abs(dy);
    if (dist === 1) { attacker = attacker ?? m; continue; }
    if (m.rooted) { m.rooted--; continue; }
    if (dist > 6 || Math.random() < 0.35) continue;
    const opts = Math.abs(dx) > Math.abs(dy) ? [[Math.sign(dx), 0], [0, Math.sign(dy)]] : [[0, Math.sign(dy)], [Math.sign(dx), 0]];
    for (const [ox, oy] of opts) {
      if (!ox && !oy) continue;
      const nx = m.x + ox!, ny = m.y + oy!;
      const tt = d.tiles[ny]?.[nx];
      if (tt === "." && !d.monsters.some((o) => o.x === nx && o.y === ny) && !(nx === s.pos.x && ny === s.pos.y)) { m.face = ox! > 0 ? "r" : ox! < 0 ? "l" : oy! > 0 ? "d" : "u"; m.movedAt = s.step; m.x = nx; m.y = ny; triggerTrap(s, m); break; }
    }
  }
  return attacker && d.monsters.includes(attacker) ? attacker : null;
}

// ======================= combat =======================
export type CombatAct = "attack" | "defend" | "flee" | "race" | "shoot" | "capture" | { skill: number } | { eat: number } | { tool: string } | { potion: string };
const dmgFormula = (a: number, d: number) => (a * a) / (a + d);
/** Every counter used by ascension conditions or race class ladders. */
const PATH_STATS = [...new Set([
  ...ASCENSIONS.flatMap((a) => a.reqs.map((r) => r.stat)).filter((k) => k !== "maxFloor"),
  ...Object.values(RACE_CLASS).flatMap((l) => l.sources.flatMap((x) => (x.kind === "stat" ? [x.id] : []))),
])];
/** Race-path counters that rose since `st0`: open ascension paths, plus the hero's own race ladder once ascended. */
export function pathGains(s: GameState, st0: Record<string, number>): PathGain[] {
  const out: PathGain[] = []; const add = (k: string) => (s.stats[k] ?? 0) - (st0[k] ?? 0);
  const line = RACE_CLASS[s.char.race];
  if (line) for (const x of line.sources) if (x.kind === "stat" && add(x.id) > 0) out.push({ icon: ASC_RACES.find((r) => r.id === line.race)?.icon ?? "🧬", label: x.label, add: add(x.id), cur: s.stats[x.id] ?? 0, need: x.need });
  for (const a of ascensionProgress(s)) {
    if (s.char.race === a.race || a.failed) continue;
    for (const r of a.reqs) if (r.stat !== "maxFloor" && add(r.stat) > 0) out.push({ icon: ASC_RACES.find((x) => x.id === a.race)!.icon, label: r.label, add: add(r.stat), cur: r.cur, need: r.need });
  }
  return out;
}
export function startCombat(s: GameState, m: Mon) {
  s.combat = {
    mon: m, log: [`⚔️ ${m.name} engages!${m.affix ? ` (${m.affix})` : ""}`], turn: 0, dealt: 0, taken: 0,
    xp0: { ...s.skills }, charXp0: s.xp, gold0: s.gold, stoneskin: 0, guardT: 0, roar: 0, stun: 0, monBurn: 0, monBleed: 0, pPoison: 0,
    lockT: 0, lockHp: 0, charging: false, shieldT: 0, frenzy: 0, raceUsed: false, eats: 0, healed: 0,
    st0: Object.fromEntries(PATH_STATS.map((k) => [k, s.stats[k] ?? 0])),
  };
  if (m.trapStun) { s.combat.stun = m.trapStun; s.combat.log.unshift(`🪤 ${m.name} is caught in your trap!`); m.trapStun = 0; }
  if (m.trapBurn) { s.combat.monBurn = m.trapBurn; m.trapBurn = 0; }
}
const clog = (c: Combat, msg: string) => { c.log = [msg, ...c.log].slice(0, 20); };

function playerHit(s: GameState, c: Combat, p: PStats, mult: number, opts: { magic?: boolean; el?: Element | undefined; sure?: boolean; label: string; weapon?: boolean }) {
  const m = c.mon;
  const magic = opts.magic ?? p.magicWeapon;
  if (!opts.sure && Math.random() * 100 > Math.min(98, p.acc - m.dodge)) { clog(c, `💨 ${opts.label} missed!`); return 0; }
  const atk = (magic ? p.matk : p.patk) * mult;
  let def = m.defn * (magic ? 0.75 : 1) * (c.shieldT > 0 ? 1.6 : 1);
  def *= 1 - Math.min(0.6, p.effects.pierce / 100);
  if (c.shred) def *= 1 - c.shred;
  const oil = opts.weapon && s.oil ? POTION[s.oil.id]?.oil : undefined;
  let dmg = dmgFormula(atk, def) * rand(0.9, 1.1);
  const el = opts.el ?? p.element;
  if (p.enchDmg && el === p.element) dmg *= 1 + p.enchDmg / 100;
  if (el !== "none" && el === m.weak) dmg *= 1.5; else if (el !== "none" && el === m.element) dmg *= 0.7;
  if (p.effects.holy && m.element === "dark") dmg *= 1 + p.effects.holy / 100;
  if (oil?.fx === "holy" && (MON_DEF[m.def]?.cat === "undead" || MON_DEF[m.def]?.cat === "fiend")) dmg *= 1 + oil.power / 100;
  if (s.char.race === "orc" && s.hp < playerStats(s).hp * 0.5) dmg *= 1.15;
  const crit = Math.random() * 100 < p.crit;
  if (crit) { dmg *= p.critDmg / 100; bump(s, "criticalHits"); }
  dmg = Math.max(1, Math.round(dmg));
  m.hp -= dmg; c.dealt += dmg; bump(s, "dmgDealt", dmg);
  if (dmg > (s.stats["highestHit"] ?? 0)) s.stats["highestHit"] = dmg;
  if (p.effects.lifesteal) { const h = Math.round(dmg * p.effects.lifesteal / 100); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; bump(s, "lifestealHeal", h); }
  if (p.effects.burn) c.monBurn = Math.max(c.monBurn, Math.round(dmg * p.effects.burn / 100));
  if (p.effects.bleed) c.monBleed = Math.max(c.monBleed, Math.round(dmg * p.effects.bleed / 100));
  if (oil && oil.fx !== "holy" && m.hp > 0 && Math.random() * 100 < oil.chance) {
    if (oil.fx === "poison" || oil.fx === "bleed") { c.monBleed = Math.max(c.monBleed, Math.round(dmg * oil.power / 100)); clog(c, oil.fx === "poison" ? "🐍 The venom takes hold!" : "🩸 A deep, bleeding cut!"); }
    else if (oil.fx === "burn") { c.monBurn = Math.max(c.monBurn, Math.round(dmg * oil.power / 100)); clog(c, "🔥 The napalm ignites!"); }
    else if (oil.fx === "chill") { c.roar = Math.max(c.roar, 2); clog(c, "❄️ The foe is chilled — its blows weaken."); }
  }
  clog(c, `${crit ? "💥 CRIT! " : ""}${opts.label} hits for ${dmg}${el !== "none" && el === m.weak ? " (weak!)" : ""}`);
  return dmg;
}

/** Torch fire strike (on attack and when defending) plus its special effect. */
function torchStrike(s: GameState, c: Combat, p: PStats, label: string) {
  const t = heldTorch(s); const m = c.mon; if (!t || m.hp <= 0) return;
  const fx = offhandFx(t, toolGrade(s, t.id));
  const d = playerHit(s, c, p, fx.fire || 0.3, { magic: p.matk >= p.patk, el: "fire", sure: true, label });
  if (AFF_BY_ID["fire"]) addAff(s, "fire", 0.3); if (d) bump(s, "torchStrikes");
  if (!d || m.hp <= 0 || !t.fx || Math.random() * 100 >= fx.chance) return;
  switch (t.fx) {
    case "sleep": c.stun = Math.max(c.stun, m.boss ? 1 : 2); clog(c, `💤 ${m.name} is lulled to sleep!`); break;
    case "siphon": { const h = Math.round(d * 0.6); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; bump(s, "lifestealHeal", h); clog(c, `🩸 The torch siphons ${h} HP.`); break; }
    case "blind": c.blind = 2; clog(c, `☀️ ${m.name} is blinded!`); break;
    case "venom": c.monBleed = Math.max(c.monBleed, Math.round(d * 0.8)); clog(c, `☠️ Witchfire venom seeps in.`); break;
    case "chill": c.roar = Math.max(c.roar, 2); clog(c, `❄️ ${m.name} is chilled — its blows weaken.`); break;
    case "soul": { const g = Math.round(d * 0.5); s.mp = Math.min(p.mp, s.mp + g); clog(c, `👻 Soulfire returns ${g} MP.`); break; }
    case "burn": c.monBurn = Math.max(c.monBurn, Math.round(d * 0.6)); clog(c, `🐉 ${m.name} is set ablaze!`); break;
  }
}

export function combatTurn(s: GameState, a: CombatAct): "win" | "lose" | "fled" | null {
  const c = s.combat; if (!c) return null;
  const m = c.mon; const p = playerStats(s);
  c.turn++;
  let defending = false; c.block = false;
  const wskill = p.weaponSkill;
  if (a === "attack") {
    playerHit(s, c, p, 1, { label: "You", weapon: true });
    addXp(s, p.magicWeapon ? "spellcasting" : wskill, 3); use(s.usage.weapon, wskill);
    if (wskill === "one_hand") addAff(s, "sword", 1); if (wskill === "two_hand") addAff(s, "might", 1.2); if (wskill === "unarmed") addAff(s, "might", 0.6);
    if (p.element !== "none" && AFF_BY_ID[p.element]) addAff(s, p.element, 0.6);
    if (m.hp > 0 && Math.random() * 100 < p.effects.haste) playerHit(s, c, p, 0.7, { label: "Hasted strike", weapon: true });
    const tt = heldTorch(s); if (tt) torchStrike(s, c, p, tt.name);
  } else if (a === "defend") {
    defending = true; s.sta = Math.min(p.sta, s.sta + Math.round(p.sta * 0.12)); s.mp = Math.min(p.mp, s.mp + Math.round(p.mp * 0.06));
    const dm = defendMode(s); c.block = dm === "shield";
    addXp(s, "defense", dm === "shield" ? 4 : 3); if (dm === "shield") { addAff(s, "shield", 1.5); bump(s, "shieldBlocks"); }
    clog(c, dm === "shield" ? "🛡️ You raise your shield." : dm === "torch" ? `🔥 You ward with your ${heldTorch(s)!.name}.` : "🙅 You brace yourself.");
  } else if (a === "flee") {
    const boss = m.boss > 0;
    const chance = boss ? 0 : 0.35 + (p.spd - 100) / 400 + lvl(s, "mobility") * 0.004;
    if (Math.random() < chance) { addXp(s, "mobility", 4); return finishCombat(s, "fled"); }
    clog(c, boss ? "🚫 You cannot flee from a Guardian!" : "❌ Couldn't escape!");
  } else if (a === "race") {
    if (c.raceUsed) return null;
    c.raceUsed = true; const r = race(s); use(s.usage.skill, r.active.name);
    switch (r.active.id) {
      case "rally": s.sta = Math.min(p.sta, s.sta + Math.round(p.sta * 0.3)); s.hp = Math.min(p.hp, s.hp + Math.round(p.hp * 0.15)); clog(c, "🫁 Second Wind!"); break;
      case "starshot": playerHit(s, c, p, 2.2, { el: "light", sure: true, label: "Starfall Arrow" }); break;
      case "stoneskin": c.stoneskin = 3; clog(c, "🪨 Stoneskin hardens you."); break;
      case "slip": if (m.boss === 0) { addXp(s, "mobility", 4); return finishCombat(s, "fled"); } clog(c, "🚫 Bosses can't be escaped."); break;
      case "gadget": playerHit(s, c, p, 1.8, { el: "wind", magic: true, label: "Spark Gadget" }); c.stun = 1; break;
      case "rampage": { const d = playerHit(s, c, p, 2.5, { magic: false, label: "Rampage" }); s.hp = Math.max(1, s.hp - Math.round(d * 0.1)); break; }
      case "roar": c.roar = 3; clog(c, "🗯️ Savage Roar! The foe falters."); break;
      case "hellfire": playerHit(s, c, p, 2.3, { el: "fire", magic: true, label: "Hellish Rebuke" }); c.monBurn = Math.max(c.monBurn, Math.round(p.matk * 0.15)); break;
      case "breath": playerHit(s, c, p, 2.6, { el: p.element === "none" ? "fire" : p.element, magic: true, label: "Dragon Breath" }); break;
      case "bloodfeast": { const d = playerHit(s, c, p, 2.4, { el: "dark", magic: true, sure: true, label: "Blood Feast" }); const h = Math.round(d * 0.6); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; bump(s, "lifestealHeal", h); break; }
      case "phase": c.stoneskin = 3; c.guardT = 3; clog(c, "👻 You phase out of the material world."); break;
      case "howl": playerHit(s, c, p, 2.8, { magic: false, label: "Moon Howl" }); c.roar = 3; break;
      case "deathbolt": playerHit(s, c, p, 3.2, { el: "dark", magic: true, label: "Death Bolt" }); break;
      case "rot": c.lockT = 3; c.lockHp = Math.max(1, s.hp); clog(c, "🧟 Undying Rot! You will not fall for 3 turns."); break;
      case "devour": { const d = playerHit(s, c, p, 2.2, { magic: false, label: "Devour" }); const h = Math.round(d * 0.4); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; break; }
      case "radiance": { const h = Math.round(p.hp * 0.25); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; clog(c, `😇 Radiance heals ${h}.`); break; }
    }
  } else if (a === "capture") {
    const why = captureBlock(s); if (why) { clog(c, `🚫 ${why}`); c.turn--; return null; }
    const chance = Math.min(0.85, 0.35 + lvl(s, "hunting") * 0.006 + (1 - m.hp / m.maxHp) * 0.2);
    addXp(s, "hunting", 4);
    if (Math.random() < chance) {
      const def = MON_DEF[m.def];
      const L = Math.max(1, Math.round(d0(s) * 0.8));
      const name = m.name.replace(/^(Guardian|Arch-Warden) /, "").replace(new RegExp(`^(${ELITE_AFFIX.join("|")}) `), "");
      s.companions = [...(s.companions ?? []), { id: uid(), name, kind: "monster", role: "beast", race: "", gender: "", monDef: m.def, xp: 15 * (L - 1) ** 2,
        base: { hp: def?.hp ?? 1, atk: def?.atk ?? 1, def: def?.def ?? 1, magic: m.magical }, equip: {} }];
      bump(s, "captures"); clog(c, `🪢 ${name} was captured and joins your party!`); note(s, `🪢 Captured ${name}!`);
      return finishCombat(s, "win");
    }
    clog(c, `🪢 ${m.name} breaks free!`);
  } else if (a === "shoot") {
    const r = s.ranged; const ammo = r ? ammoFor(r) : ""; const def = r ? TOOL[r] : undefined;
    if (!r || !def || !(s.tools?.[ammo] ?? 0)) { clog(c, "No ammunition!"); c.turn--; return null; }
    s.tools = { ...s.tools, [ammo]: s.tools![ammo]! - 1 };
    const pp = def.pierce ? { ...p, effects: { ...p.effects, pierce: p.effects.pierce + def.pierce } } : p;
    if (playerHit(s, c, pp, offhandFx(def, toolGrade(s, r)).mult, { magic: false, el: r === "laser" ? "light" : undefined, label: def.name })) bump(s, "rangedHits");
    addXp(s, "hunting", 4); addAff(s, "hunting", 1);
  } else if ("tool" in a) {
    const t = TOOL[a.tool]; if (!t || t.kind !== "throw" || !(s.tools?.[t.id] ?? 0)) { c.turn--; return null; }
    s.tools = { ...s.tools, [t.id]: s.tools![t.id]! - 1 }; use(s.usage.skill, t.name);
    if (t.flee) { if (m.boss === 0) { clog(c, "💨 You vanish in smoke!"); return finishCombat(s, "fled"); } clog(c, "🚫 The Guardian sees through the smoke."); }
    else {
      if (t.mult) { const d = playerHit(s, c, p, t.mult, { magic: !!t.el, el: t.el, sure: true, label: t.name }); if (t.burn) c.monBurn = Math.max(c.monBurn, Math.round(d * t.burn * 3)); }
      if (t.stun) { c.stun = Math.max(c.stun, m.boss ? 1 : t.stun); clog(c, `${t.icon} ${m.name} is snared!`); }
    }
    addXp(s, "hunting", 3);
  } else if ("skill" in a) {
    const sk = combatActives(s)[a.skill]; if (!sk) return null;
    const have = sk.res === "mp" ? s.mp : s.sta;
    if (have < sk.cost) { clog(c, `Not enough ${sk.res === "mp" ? "mana" : "stamina"}!`); c.turn--; return null; }
    if (sk.res === "mp") s.mp -= sk.cost; else s.sta -= sk.cost;
    use(s.usage.skill, sk.name);
    if (sk.aff !== "none") addAff(s, sk.aff, 1.5);
    if (sk.school) { bump(s, "spellsCast"); bump(s, `cast:${sk.school}`); c.school = sk.school; s.magic = { ...s.magic, [sk.school]: (s.magic?.[sk.school] ?? 0) + 3 }; addXp(s, "spellcasting", 2); }
    if (sk.kind === "drain") { const d = playerHit(s, c, p, sk.mult, { magic: true, el: sk.el, label: sk.name }); const h = Math.round(d * 0.4); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; bump(s, "lifestealHeal", h); addXp(s, "spellcasting", 5); } else
    if (sk.kind === "phys") { playerHit(s, c, p, sk.mult, { magic: false, label: sk.name, weapon: true }); addXp(s, wskill, 4); }
    else if (sk.kind === "mag") { playerHit(s, c, p, sk.mult, { magic: true, el: sk.el, label: sk.name }); addXp(s, "spellcasting", 5); }
    else if (sk.kind === "heal") { const h = Math.round(p.hp * sk.mult); s.hp = Math.min(p.hp, s.hp + h); c.healed += h; bump(s, "healing", h); clog(c, `💚 ${sk.name} restores ${h} HP.`); addXp(s, "spellcasting", 3); }
    else if (sk.kind === "guard") { c.guardT = 2; defending = true; clog(c, `🛡️ ${sk.name}! Damage greatly reduced.`); addXp(s, "defense", 4); }
    else if (sk.kind === "lock") { c.lockT = sk.mult; c.lockHp = Math.max(1, s.hp); clog(c, `♾️ ${sk.name}! Your HP is locked for ${sk.mult} turns.`); addXp(s, "endurance", 4); }
    else { equipped(s).forEach((g) => { g.dura = Math.min(g.maxDura, g.dura + Math.round(g.maxDura * 0.1)); }); clog(c, "🔧 Field Repair restores gear durability."); }
  } else if ("potion" in a) {
    const pt = POTION[a.potion]; if (!pt || !(s.potions?.[pt.id] ?? 0)) { c.turn--; return null; }
    if (pt.cat === "elixir" && (c.drinks ?? 0) >= DRINKS_PER_FIGHT) { clog(c, "🤢 You can't drink any more this fight."); c.turn--; return null; }
    s.potions = { ...s.potions, [pt.id]: s.potions![pt.id]! - 1 }; use(s.usage.skill, pt.name);
    if (pt.flask) {
      const f = pt.flask; const d = playerHit(s, c, p, f.mult, { magic: !!f.el, el: f.el, sure: true, label: pt.name });
      if (f.burn && d) c.monBurn = Math.max(c.monBurn, Math.round(d * f.burn));
      if (f.shred) { c.shred = Math.max(c.shred ?? 0, f.shred); clog(c, `🧫 ${m.name}'s armor melts!`); }
      if (f.blind) { c.blind = Math.max(c.blind ?? 0, f.blind); clog(c, `🌟 ${m.name} is blinded!`); }
      if (f.stun) { c.stun = Math.max(c.stun, f.stun); clog(c, `🧊 ${m.name} is frozen solid!`); }
      addXp(s, "hunting", 3);
    } else { if (pt.cat === "elixir") c.drinks = (c.drinks ?? 0) + 1; const h = applyPotion(s, pt.id, p); c.healed += h; clog(c, `${pt.icon} ${pt.name}${h ? ` restores ${h} HP` : ""}.`); }
  } else if ("eat" in a) {
    if (c.eats >= 2) { clog(c, "🤢 You can't eat more during this fight."); c.turn--; return null; }
    const h = eatFood(s, a.eat); c.eats++; c.healed += h; clog(c, `🍖 Ate and recovered ${h} HP.`);
  }
  if (m.hp <= 0) return finishCombat(s, "win");
  companionsAct(s, c, p);
  if (m.hp <= 0) return finishCombat(s, "win");
  // ---- DoTs ----
  if (c.monBurn) { m.hp -= c.monBurn; c.dealt += c.monBurn; clog(c, `🔥 Burn ${c.monBurn}`); c.monBurn = Math.round(c.monBurn * 0.6); }
  if (c.monBleed) { m.hp -= c.monBleed; c.dealt += c.monBleed; c.monBleed = Math.round(c.monBleed * 0.5); }
  if (m.hp <= 0) return finishCombat(s, "win");
  // ---- monster turn ----
  if (c.stun > 0) { c.stun--; clog(c, `😵 ${m.name} is stunned.`); }
  else {
    let mult = 1;
    if (m.ability === "frenzy") { c.frenzy++; mult *= 1 + c.frenzy * 0.08; }
    if (m.ability === "shield" && c.turn % 4 === 0) { c.shieldT = 2; clog(c, `🔰 ${m.name} raises a barrier!`); }
    if (c.charging) { mult *= 2.6; c.charging = false; }
    else if (m.ability === "heavy" && c.turn % 3 === 0) { c.charging = true; clog(c, `⚠️ ${m.name} winds up a devastating attack! DEFEND!`); mult = 0; }
    if (mult > 0) {
      if ((c.blind ?? 0) > 0 && Math.random() < 0.5) clog(c, `☀️ The blinded ${m.name} swings wide and misses!`);
      else if (Math.random() * 100 < p.dodge) { clog(c, `💨 You dodge ${m.name}'s attack!`); addXp(s, "evasion", 3); addAff(s, "agility", 0.8); }
      else {
        let atk = m.atk * mult * (c.roar > 0 ? 0.75 : 1);
        const def = m.magical ? p.mdef : p.pdef;
        let dmg = dmgFormula(atk, def) * rand(0.9, 1.1);
        if (defending) { const k = c.block ? DEFEND_TAKEN.shield : DEFEND_TAKEN.brace; dmg *= mult > 2 ? k / 2 : k; }
        if (c.guardT > 0) dmg *= 0.5;
        if (c.stoneskin > 0) dmg *= 0.5;
        dmg *= 1 - p.effects.guard / 100;
        if (p.wardEl !== "none" && m.element === p.wardEl) dmg *= 1 - p.wardV / 100;
        if (p.wards[m.element]) dmg *= 1 - Math.min(60, p.wards[m.element]!) / 100;
        if (s.char.race === "tiefling" && m.element === "fire") dmg *= 0.7;
        if (s.char.race === "aasimar" && m.element === "dark") dmg *= 0.7;
        dmg = Math.max(1, Math.round(dmg));
        s.hp -= dmg; c.taken += dmg; bump(s, "dmgTaken", dmg);
        addXp(s, "endurance", 2); if (defending) { addXp(s, "defense", 2); addAff(s, "shield", 0.8); }
        clog(c, `${mult > 2 ? "💢 DEVASTATING! " : ""}${m.name} hits you for ${dmg}`);
        if (m.ability === "drain") { const h = Math.round(dmg * 0.3); m.hp = Math.min(m.maxHp, m.hp + h); }
        if (m.def === "wolf" && s.spells?.some((x) => x.startsWith("transformation_"))) bump(s, "wolfBites");
        if (m.ability === "poison" && !ASC_RACES.find((r) => r.id === s.char.race)?.poisonImmune && Math.random() < 0.35) { c.pPoison = 3; clog(c, "🤢 You are poisoned!"); if (Math.random() < 0.4 && addAilment(s, "poisoned")) clog(c, "🤢 The venom lingers — visit the Church."); }
        if (m.ability === "drain" && Math.random() < 0.12 && addAilment(s, "weakened")) clog(c, "🥀 You feel weakened.");
        if (m.ability === "frenzy" && Math.random() < 0.12 && addAilment(s, "bleeding")) clog(c, "🩸 A deep wound keeps bleeding.");
        if (m.element === "dark" && m.boss > 0 && Math.random() < 0.15 && addAilment(s, "cursed")) clog(c, "🌑 A curse takes hold of you.");
      }
      const tt = heldTorch(s); if (defending && tt) torchStrike(s, c, p, `${tt.name} scorches`);
    }
  }
  if (m.hp <= 0 && s.hp > 0) return finishCombat(s, "win");
  if (c.pPoison > 0) { const pd = Math.max(1, Math.round(p.hp * 0.04)); s.hp -= pd; c.taken += pd; c.pPoison--; }
  if (p.effects.regen) s.hp = Math.min(p.hp, s.hp + Math.round(p.hp * p.effects.regen / 200));
  if (p.effects.manaflow) s.mp = Math.min(p.mp, s.mp + Math.round(p.mp * p.effects.manaflow / 100));
  s.sta = Math.min(p.sta, s.sta + 2);
  c.roar = Math.max(0, c.roar - 1); c.stoneskin = Math.max(0, c.stoneskin - 1); c.guardT = Math.max(0, c.guardT - 1); c.shieldT = Math.max(0, c.shieldT - 1); c.blind = Math.max(0, (c.blind ?? 0) - 1);
  if (c.lockT > 0) { if (s.hp < c.lockHp) s.hp = c.lockHp; c.lockT--; }
  if (s.hp <= 0) {
    if (s.char.race === "halforc" && !s.relentlessUsed) { s.relentlessUsed = true; s.hp = 1; clog(c, "🔥 Relentless! You refuse to fall."); return null; }
    return finishCombat(s, "lose");
  }
  return null;
}

function finishCombat(s: GameState, outcome: "win" | "lose" | "fled"): "win" | "lose" | "fled" {
  const c = s.combat!; const m = c.mon; const d = s.dungeon!; const p = playerStats(s);
  const loot: Record<string, number> = {};
  let xp = 0, gold = 0, sold = 0;
  // durability wear
  for (const g of equipped(s)) g.dura = Math.max(0, g.dura - ((g.slot === "one_hand" || g.slot === "two_hand") ? 2 : 1));
  if (s.blessing) { s.blessing.left--; if (s.blessing.left <= 0) s.blessing = undefined; }
  if (s.oil) {
    if (outcome === "win" && POTION[s.oil.id]?.oil?.fx === "poison") bump(s, "venomKills");
    s.oil = s.oil.left > 1 ? { ...s.oil, left: s.oil.left - 1 } : undefined; if (!s.oil) log(s, "🛢️ Your weapon oil has worn off.");
  }
  if (outcome === "win") {
    d.monsters = d.monsters.filter((x) => x.uid !== m.uid);
    if (m.boss) { d.bossAlive = false; bump(s, "bosses"); }
    for (const cp of s.companions ?? []) cp.xp += m.xp * 1.2;
    if (c.school === "blood") bump(s, "bloodKills");
    if (c.school === "plague") bump(s, "plagueKills");
    if ((UNDEAD.has(m.def) || isUndead(m.def)) && s.spells?.some((x) => x.startsWith("necromancy_"))) bump(s, "undeadKills");
    const cat = MON_DEF[m.def]?.cat; if (cat) bump(s, `kills:${cat}`);
    bump(s, "noFleeStreak"); s.stats["bestNoFlee"] = Math.max(s.stats["bestNoFlee"] ?? 0, s.stats["noFleeStreak"] ?? 0);
    if (c.taken === 0) bump(s, "flawlessWins"); if (c.turn <= 1) bump(s, "oneTurnKills");
    bump(s, "kills"); bump(s, "streak"); s.stats["bestStreak"] = Math.max(s.stats["bestStreak"] ?? 0, s.stats["streak"] ?? 0);
    use(s.usage.monster, m.name.replace(/^(Guardian|Arch-Warden) /, "").replace(new RegExp(`^(${ELITE_AFFIX.join("|")}) `), ""));
    xp = m.xp; addCharXp(s, xp); addXp(s, "hunting", 3 + m.tier + (m.boss ? 10 : 0)); addAff(s, "hunting", 1 + (m.boss ? 5 : 0));
    gold = Math.round(5 * Math.pow(1.1, d.floor / 10) * (m.boss === 3 ? 100 : m.boss === 2 ? 30 : m.boss === 1 ? 8 : m.affix ? 2 : 1) * rand(0.8, 1.3) * p.itemFind);
    earn(s, gold);
    const rolls = 1 + (m.affix ? 1 : 0) + (m.boss ? 3 + m.boss * 2 : 0) + (Math.random() < p.itemFind - 1 ? 1 : 0);
    for (let i = 0; i < rolls; i++) { const id = m.drops[ri(0, m.drops.length - 1)]!; loot[id] = (loot[id] ?? 0) + 1; }
    if (Math.random() < p.rareDrop + (m.boss ? 0.3 : 0)) {
      const t = Math.min(10, floorTier(d.floor) + 1);
      const pool = Object.values(MATERIALS).filter((x) => x.src === "monster" && x.tier === t && !x.catalyst);
      const r = pool[ri(0, pool.length - 1)]; if (r) loot[r.id] = (loot[r.id] ?? 0) + 1;
    }
    if (m.boss === 1) loot["guardian_sigil"] = (loot["guardian_sigil"] ?? 0) + 1 + (Math.random() < 0.3 ? 1 : 0);
    if (m.boss >= 2) { loot["warden_crest"] = (loot["warden_crest"] ?? 0) + 1; loot["guardian_sigil"] = (loot["guardian_sigil"] ?? 0) + 2; if (Math.random() < 0.5) loot["ancient_schematic"] = 1; }
    if (m.boss === 3) loot["eternity_core"] = 1;
    // auto-sell junk (setting is applied by caller through flag on state)
    if (autoSellFlag) {
      const ft = floorTier(d.floor);
      for (const [id, q] of Object.entries(loot)) if (getMat(id).tier <= ft - 3 && getMat(id).src === "monster") { const v = getMat(id).value * q; sold += v; earn(s, v); delete loot[id]; }
    }
    clog(c, `🏆 ${m.name} defeated!`);
  } else if (outcome === "lose") {
    bump(s, "deaths"); s.stats["streak"] = 0; s.stats["floorStreak"] = 0; s.stats["noFleeStreak"] = 0;
    if (s.spells?.some((x) => x.startsWith("soul_"))) bump(s, "soulDeaths");
    if (s.ailments?.poisoned && s.spells?.some((x) => x.startsWith("plague_"))) bump(s, "poisonDeaths");
    addAilment(s, "cursed");
  }
  const gains = Object.keys(s.skills).map((k) => ({ k, xp: (s.skills[k] ?? 0) - (c.xp0[k] ?? 0), from: levelOf(c.xp0[k] ?? 0), to: levelOf(s.skills[k] ?? 0) }))
    .filter((g) => g.xp > 0.01).sort((a, b) => b.xp - a.xp);
  s.result = {
    won: outcome === "win", fled: outcome === "fled", died: outcome === "lose", name: m.name, icon: m.icon, boss: m.boss, floor: d.floor,
    dealt: c.dealt, taken: c.taken, turns: c.turn, xp, gold, loot: Object.entries(loot).map(([id, qty]) => ({ id, qty })), gains,
    hp: Math.max(0, s.hp), maxHp: p.hp, sold, collected: false, kind: m.def, paths: c.st0 ? pathGains(s, c.st0) : [],
  };
  if (autoLootFlag || outcome !== "win") collectLoot(s);
  s.combat = undefined;
  if (outcome === "fled") s.stats["noFleeStreak"] = 0;
  if (outcome === "fled") { const r = s.dungeon!; const free = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: s.pos.x + dx!, y: s.pos.y + dy! })).find((q) => r.tiles[q.y]?.[q.x] === "." && !r.monsters.some((mm) => mm.x === q.x && mm.y === q.y)); if (free) s.pos = free; }
  if (outcome === "lose") {
    const lost = Math.floor(s.gold * 0.1); s.gold -= lost;
    leaveDungeon(s, false); s.hp = Math.max(1, Math.round(p.hp * 0.3)); s.sta = Math.round(p.sta * 0.3);
    log(s, `☠️ You fell on floor ${d.floor}. Lost your expedition loot and ${lost}g.`);
  }
  if (m.boss === 3 && outcome === "win") { s.won = true; note(s, "👑 The Eternal Warden falls. You conquered the Tower!"); }
  return outcome;
}
let autoSellFlag = false, autoLootFlag = true;
export function setCombatPrefs(autoSell: boolean, autoLoot: boolean) { autoSellFlag = autoSell; autoLootFlag = autoLoot; }
export function collectLoot(s: GameState) {
  const r = s.result; if (!r || r.collected) return;
  for (const { id, qty } of r.loot) addMat(s, id, qty, true);
  r.collected = true;
}
// ======================= economy =======================
export const sellPrice = (s: GameState, id: string) => Math.max(1, Math.round(getMat(id).value * 0.5 * (1 + lvl(s, "trading") * 0.005)));
/** Sellable inventory, highest material tier first. */
export function sellableList(s: GameState) {
  return Object.entries(s.inv)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ id, qty, tier: getMat(id).tier, price: sellPrice(s, id) }))
    .sort((a, b) => b.tier - a.tier || b.price - a.price || a.id.localeCompare(b.id));
}
export function sellMat(s: GameState, id: string, qty: number, mult = 1) {
  const n = Math.min(qty, s.inv[id] ?? 0); if (!n) return;
  takeMat(s, id, n); const v = Math.round(sellPrice(s, id) * n * mult); earn(s, v); addXp(s, "trading", Math.ceil(n / 3));
  log(s, `💰 Sold ${n}× ${getMat(id).name} for ${v}g.`);
}
export const SHOP_ITEMS: { id: string; name: string; icon: string; price: number; kind: "mat" | "food"; heal?: number }[] = [
  { id: "wheat_seed", name: "Wheat Seed", icon: "🌾", price: 6, kind: "mat" },
  { id: "carrot_seed", name: "Carrot Seed", icon: "🥕", price: 6, kind: "mat" },
  { id: "herb_seed", name: "Herb Seed", icon: "🌿", price: 10, kind: "mat" },
  { id: "pumpkin_seed", name: "Pumpkin Seed", icon: "🎃", price: 25, kind: "mat" },
  { id: "bread", name: "Traveler's Bread", icon: "🍞", price: 20, kind: "food", heal: 30 },
  { id: "ration", name: "Iron Ration", icon: "🥫", price: 120, kind: "food", heal: 120 },
];
export function buyShop(s: GameState, i: number) {
  const it = SHOP_ITEMS[i]; if (!it) return;
  const price = Math.round(it.price * (1 - Math.min(0.3, lvl(s, "trading") * 0.003)));
  if (!spend(s, price)) { log(s, "Not enough gold."); return; }
  if (it.kind === "mat") addMat(s, it.id, 1);
  else { const ex = s.foods.find((f) => f.name === it.name); if (ex) ex.qty++; else s.foods.push({ name: it.name, icon: it.icon, heal: it.heal!, qty: 1, tier: 0 }); }
  addXp(s, "trading", 1);
}
export function marketOffers(s: GameState) {
  const r = seeded(s.marketSeed); const ft = floorTier(Math.max(1, s.maxFloor));
  const pool = Object.values(MATERIALS).filter((m) => m.tier <= ft + 1 && !m.catalyst && m.src !== "boss" && m.src !== "casino");
  const buy = Array.from({ length: 4 }, () => { const m = pool[Math.floor(r() * pool.length)]!; return { id: m.id, qty: 1 + Math.floor(r() * 4), price: Math.round(m.value * (1.4 + r() * 0.6)) }; });
  const demand = Array.from({ length: 3 }, () => { const m = pool[Math.floor(r() * pool.length)]!; return { id: m.id, mult: 1.5 + r() * 0.8 }; });
  return { buy, demand };
}
export function marketBuy(s: GameState, i: number) {
  const o = marketOffers(s).buy[i]; if (!o) return;
  const bought = (s.stats[`mkt:${s.marketSeed}:${i}`] ?? 0); if (bought) { log(s, "Already bought."); return; }
  const price = Math.round(o.price * o.qty * (1 - Math.min(0.25, lvl(s, "trading") * 0.003)));
  if (!spend(s, price)) { log(s, "Not enough gold."); return; }
  addMat(s, o.id, o.qty); s.stats[`mkt:${s.marketSeed}:${i}`] = 1; addXp(s, "trading", 3); log(s, `⚖️ Bought ${o.qty}× ${getMat(o.id).name}.`);
}

// ---- quests ----
export function questProgress(s: GameState, q: Quest) {
  if (q.kind === "floor") return Math.min(q.need, s.maxFloor);
  const k = q.kind === "kill" ? "kills" : q.kind === "craft" ? "crafted" : "g:" + q.target;
  return Math.min(q.need, (s.stats[k] ?? 0) - q.base);
}
export function rerollQuests(s: GameState) {
  const f = Math.max(1, s.maxFloor);
  const gatherables = ["oak_log", "stone", "copper_ore", "daisy", "fish", "wheat", "egg", "birch_log", "iron_ore", "wool"];
  const mk = (): Quest => {
    const kind = (["kill", "gather", "floor", "craft"] as const)[ri(0, 3)]!;
    const scale = Math.pow(1.1, f / 10);
    if (kind === "kill") { const n = ri(8, 20); return { id: uid(), kind, target: "", need: n, base: s.stats["kills"] ?? 0, gold: Math.round(n * 6 * scale), tokens: 0, text: `Slay ${n} monsters in the Tower` }; }
    if (kind === "gather") { const t = gatherables[ri(0, gatherables.length - 1)]!; const n = ri(6, 18); return { id: uid(), kind, target: t, need: n, base: s.stats["g:" + t] ?? 0, gold: Math.round(n * 5 * scale), tokens: 0, text: `Gather ${n} ${getMat(t).name}` }; }
    if (kind === "craft") { const n = ri(1, 3); return { id: uid(), kind, target: "", need: n, base: s.stats["crafted"] ?? 0, gold: Math.round(n * 40 * scale), tokens: 0, text: `Forge ${n} piece(s) of gear` }; }
    const n = s.maxFloor + ri(1, 3); return { id: uid(), kind: "floor", target: "", need: n, base: 0, gold: Math.round(80 * Math.pow(1.1, n / 10)), tokens: 1, text: `Reach floor ${n}` };
  };
  s.quests = [mk(), mk(), mk()];
}
function rerollQuestsIfDone(s: GameState) { if (!s.quests.length) rerollQuests(s); }
export function claimQuest(s: GameState, id: string) {
  const q = s.quests.find((x) => x.id === id); if (!q || questProgress(s, q) < q.need) return;
  earn(s, q.gold); s.tokens += q.tokens; s.quests = s.quests.filter((x) => x.id !== id); bump(s, "quests");
  log(s, `📜 Quest complete! +${q.gold}g${q.tokens ? ` +${q.tokens} token` : ""}`);
  if (!s.quests.length) rerollQuests(s);
}

// ---- casino (house always has the edge) ----
export const maxBet = (s: GameState) => 20 + s.maxFloor * 12;
export const CASINO_PLAYS = 25;
function casinoGuard(s: GameState, bet: number) {
  if (bet <= 0 || bet > maxBet(s) || !spend(s, bet)) { log(s, "Invalid bet."); return false; }
  s.casinoPlays++; addXp(s, "gambling", 1); bump(s, "gambled", bet); return true;
}
export function playDice(s: GameState, bet: number, high: boolean) {
  if (!casinoGuard(s, bet)) return null;
  const a = ri(1, 6), b = ri(1, 6), t = a + b;
  const win = t !== 7 && (high ? t > 7 : t < 7);
  if (win) { earn(s, Math.round(bet * 1.9)); bump(s, "casinoWins"); }
  log(s, `🎲 ${a}+${b}=${t} — ${win ? `won ${Math.round(bet * 1.9)}g` : "lost"}`); return { a, b, win };
}
const REELS = ["🍒", "🍋", "🔔", "⭐", "💎", "🍀"];
const REEL_W = [30, 26, 18, 12, 8, 6];
export function playSlots(s: GameState, bet: number) {
  if (!casinoGuard(s, bet)) return null;
  const spin = () => pickWeighted(REELS.map((r, i) => [r, REEL_W[i]!] as [string, number]));
  const r = [spin(), spin(), spin()];
  let pay = 0, token = 0;
  if (r[0] === r[1] && r[1] === r[2]) { pay = r[0] === "🍀" ? 25 : r[0] === "💎" ? 15 : r[0] === "⭐" ? 8 : 4; token = r[0] === "🍀" ? 3 : 1; }
  else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) pay = 1.2;
  if (pay) earn(s, Math.round(bet * pay)); if (pay > 1.5) bump(s, "casinoWins"); s.tokens += token;
  log(s, `🎰 ${r.join(" ")} — ${pay ? `won ${Math.round(bet * pay)}g${token ? ` +${token} token` : ""}` : "nothing"}`); return { r, pay, token };
}
export function playHighLow(s: GameState, bet: number, cur: number, higher: boolean) {
  if (!casinoGuard(s, bet)) return null;
  const next = ri(1, 13); const win = higher ? next > cur : next < cur;
  if (win) { earn(s, Math.round(bet * 1.85)); bump(s, "casinoWins"); }
  log(s, `🃏 ${cur} → ${next}: ${win ? `won ${Math.round(bet * 1.85)}g` : "lost"}`); return { next, win };
}
export const TOKEN_SHOP: { id: string; cost: number }[] = [{ id: "lucky_clover", cost: 6 }, { id: "mana_crystal", cost: 4 }, { id: "guardian_sigil", cost: 15 }, { id: "ancient_schematic", cost: 80 }];
export function buyToken(s: GameState, i: number) {
  const it = TOKEN_SHOP[i]; if (!it || s.tokens < it.cost) return; s.tokens -= it.cost; addMat(s, it.id, 1); log(s, `🎟️ Exchanged tokens for ${getMat(it.id).name}.`);
}

// ======================= achievements =======================
export function statValue(s: GameState, k: string): number {
  if (k === "maxFloor") return s.maxFloor;
  if (k === "skillsLearned") return Object.keys(s.skills).length;
  if (k === "classesDiscovered") return s.classesSeen.length;
  return s.stats[k] ?? 0;
}
export function checkAchievements(s: GameState) {
  for (const a of ACHIEVEMENTS) {
    let got = s.ach[a.id] ?? 0;
    while (got < a.tiers.length && statValue(s, a.stat) >= a.tiers[got]!) {
      const r = a.rewards[got] ?? {};
      if (r.gold) earn(s, r.gold);
      if (r.mat) addMat(s, r.mat[0], r.mat[1]);
      if (r.title && !s.titles.includes(r.title)) s.titles.push(r.title);
      if (r.deco && !s.decos.includes(r.deco)) s.decos.push(r.deco);
      got++;
      note(s, `🏅 Achievement: ${a.name} ${["I", "II", "III", "IV", "V", "VI"][got - 1]}${r.title ? ` — title "${r.title}"` : ""}`);
    }
    s.ach[a.id] = got;
  }
}

// ======================= class evolution check =======================
export function checkClass(s: GameState) {
  const c = computeClass(s);
  if (c.id === s.classId) return;
  const before = s.classId.includes(":") ? parseClassId(s.classId) : { id: "adventurer", name: "Adventurer", tier: -1 } as ClassInfo;
  const pb = playerStats(s, before), pa = playerStats(s, c);
  const delta = (["hp", "mp", "sta", "patk", "matk", "pdef", "mdef", "crit", "dodge"] as StatKey[])
    .map((k) => ({ k, d: Math.round((pa[k] - pb[k]) * 10) / 10 })).filter((x) => Math.abs(x.d) >= 0.1);
  const oldActives = classActives(before).map((x) => x.name);
  s.pendingEvo = {
    from: s.className, to: c.name, tier: c.tier, bonuses: describePassives(c),
    skills: classActives(c).map((x) => x.name).filter((n) => !oldActives.includes(n)), delta, major: c.tier > before.tier,
  };
  s.classHistory.push({ from: s.className, to: c.name, floor: s.maxFloor, at: Date.now() });
  if (!s.classesSeen.includes(c.name)) s.classesSeen.push(c.name);
  s.classId = c.id; s.className = c.name;
}
function parseClassId(id: string): ClassInfo {
  const [affs, t] = id.split(":"); const [p, q] = (affs ?? "").split("+");
  return { id, name: "", tier: Number(t), primary: p, secondary: q };
}

export function favorite(m: Record<string, number>) { const e = Object.entries(m).sort((a, b) => b[1] - a[1])[0]; return e ? e[0] : "—"; }
export const SLOT_NAME = (sl: Slot) => SLOT_INFO[sl].name;
export { GRADES };
