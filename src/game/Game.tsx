import { titleStars } from "./titles";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ANIMALS, BUILDINGS, TREES, getMat } from "./data";
import {
  addMat, addXp, note, buyShop, buyToken, checkAchievements, checkClass, claimQuest, clampVitals, climbDown, climbUp, collectLoot, combatTurn, cook,
  craftGear, eatFood, enhance, enterDungeon, equipGear, gather, harvest, key, leaveDungeon, log, marketBuy, mineVein, moveMonsters,
  newGame, openChest, plant, playDice, playHighLow, playSlots, playerStats, refine, repair, rerollQuests, restAtHome, sellGear, sellMat,
  setCombatPrefs, spend, migrateSave, upgradeOffhand, cookRecipe, gatherSpot, upgradeSpot, churchHeal, startCombat, cureAilment, buyBlessing, pray, enchantGear, craftTool, setSpec, brewPotion, usePotion, equipRanged, placeTrap, stepAilments, learnSchool, studySchool, ascend, upgradeBldg, storeGear, storeAll, marketMult, guildSellMult, toggleSpell, levelSpell, hireCompanion, dismissCompanion, compEquip, compTitle, trainSkill, learnTech, trainAffinity, startArena, arenaFight, arenaCashOut, skipToBoss, takeForListing, receiveListing, earn, takeMat, upgradeForge, villageTile, depositComp, withdrawComp, releasePrisoner, drillComp, upgradeCompSkill, claimTutor, tutorProgress, pickClass, WALKABLE_V, VILLAGE, VILLAGE_START,
  type CombatAct, type GameState, type Mon, sightRadius,
} from "./engine";
import {
  BagPanel, CasinoPanel, ForgePanel, HousePanel, KitchenPanel, MarketPanel, PlotPanel, RefinePanel, SettingsPanel, ShopPanel,
  TavernPanel, TowerPanel, WarehousePanel, fmt, SceneCtx,
} from "./Panels";
import { GuildShopPanel, TrainingPanel, HirePanel, PartyPanel, CompAvatar } from "./GuildPanels";
import { BldgUpgrade } from "./VillagePanels";
import type { BldgId } from "./items";
import { MagicPanel, ChurchPanel, CrafteryPanel, GatherPanel, SoonPanel, BuildingTabs } from "./VillagePanels";
import { TOOL, TOOLS, TRAP_RANGE } from "./items";
import { SPOT_TILES, spotLevel, spotStage, type SpotId } from "./gathering";
import { ProfilePanel } from "./Profile";
import { CombatView, EvoModal, ResultView } from "./Combat";
import { CreateCharacter } from "./CreateCharacter";
import { Building } from "./Building";
import { MonsterSprite } from "./MonsterSprite";
import { ConfirmationProvider, useGameConfirm } from "./Confirm";
import { Avatar, type Facing } from "./Avatar";
import { heldGearOf } from "./HeldGear";
import { GameAgentTools } from "./AgentTools";
import { Interior, INTERIOR_PANELS } from "./Interior";
import { SPEED_MS, loadSettings, sfx, unlockAudio, useSettings, viewTiles } from "./settings";
import { ArenaPanel, PlayerMarketPanel } from "./TownPanels";
import { SKIP_WARNING, nextBossFloor } from "./town";
import { PrisonPanel } from "./PrisonPanel";
import { ElderPanel } from "./ElderPanel";
import { ElderSprite } from "./ElderSprite";
import { townThemeOf } from "./townTheme";
import { TownDecor, adornBuilding } from "./TownDecor";

type PanelT = "forge" | "kitchen" | "carve" | "smelt" | "tan" | "plot" | "house" | "tower" | "bag" | "profile" | "settings" | "shop" | "market" | "tavern" | "casino" | "warehouse" | "church" | "magic" | "craftery" | "gather" | "guildshop" | "training" | "companions" | "party" | "arena" | "pmarket" | "prison" | "elder";
const STATIONS: Record<string, PanelT> = { H: "house", M: "shop", A: "forge", J: "church", Z: "magic", V: "craftery", N: "tavern", X: "casino", D: "tower", K: "training", U: "arena", C: "prison" };
// Merged buildings: each panel in a group shows the same tab strip.
const GROUPS: [string, string][][] = [
  [["house", "🛏️ Rest"], ["warehouse", "📦 Storage"], ["kitchen", "🍳 Kitchen"]],
  [["shop", "🏪 Shop"], ["market", "⚖️ Market"], ["pmarket", "🏛️ Player Market"]],
  [["tavern", "📜 Missions"], ["guildshop", "🦴 Merchant"], ["companions", "🤝 Hire"]],
  [["forge", "⚒️ Smithy"], ["carve", "🪚 Sawmill"], ["smelt", "🔥 Smelter"], ["tan", "🧵 Tannery"]],
];
const BLDG_OF: Partial<Record<string, BldgId>> = { house: "house", warehouse: "house", kitchen: "house", craftery: "craftery", church: "church", tavern: "guild", guildshop: "guild", pmarket: "market", prison: "prison", training: "training", arena: "arena", companions: "guild", shop: "market", market: "market" };
type PanelS = { t: PanelT; x?: number; y?: number; spot?: SpotId; cid?: string };
const tileOpen = (t: string): PanelS | null => t === "@" ? { t: "elder" } : STATIONS[t] ? { t: STATIONS[t]! } : SPOT_TILES[t] ? { t: "gather", spot: SPOT_TILES[t] } : t === "G" ? { t: "plot" } : null;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

export const MAX_CHARS = 5;
export function Game({ userId }: { userId: string }) {
  return <ConfirmationProvider><GameSession userId={userId} /></ConfirmationProvider>;
}
function GameSession({ userId }: { userId: string }) {
  const confirmation = useGameConfirm();
  const [s, setS] = useState<GameState | null>(null);
  const [needChar, setNeedChar] = useState<null | { hadOld: boolean }>(null);
  const ref = useRef<GameState | null>(null);
  const slots = useRef<GameState[]>([]);
  const active = useRef(0);
  const [, bumpChars] = useState(0);
  const dirty = useRef(false);
  const [panel, setPanel] = useState<PanelS | null>(null);
  const [saving, setSaving] = useState("");
  const [toasts, setToasts] = useState<{ id: number; t: string }[]>([]);
  const [trapAt, setTrapAt] = useState<{ x: number; y: number } | null>(null);
  const pushToast = (t: string) => { const it = { id: Math.random(), t }; setToasts((x) => [...x, it].slice(-4)); setTimeout(() => setToasts((x) => x.filter((y) => y !== it)), 1800); };
  const st = useSettings();
  const VW = viewTiles(st), VH = VW;
  const [face, setFace] = useState<Facing>("d");
  const [walkF, setWalkF] = useState<0 | 1 | undefined>(undefined);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepAnim = (dx: number, dy: number) => {
    setFace(dx > 0 ? "r" : dx < 0 ? "l" : dy < 0 ? "u" : "d");
    setWalkF((f) => (f === 0 ? 1 : 0));
    if (walkTimer.current) clearTimeout(walkTimer.current);
    walkTimer.current = setTimeout(() => setWalkF(undefined), 260);
  };
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const pathAction = useRef<null | (() => void)>(null);

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { setCombatPrefs(st.autoSellCommon, st.autoLoot); }, [st.autoSellCommon, st.autoLoot]);

  useEffect(() => {
    let alive = true;
    supabase.from("game_saves").select("data").eq("user_id", userId).maybeSingle().then(({ data }) => {
      if (!alive) return;
      const raw = data?.data as unknown as (GameState | { multi: true; active: number; slots: GameState[] }) | undefined;
      if (raw && "multi" in raw) { slots.current = raw.slots.filter((x) => x?.v === 2); active.current = Math.min(raw.active, slots.current.length - 1); }
      else if (raw && raw.v === 2) { slots.current = [raw]; active.current = 0; }
      for (const sl of slots.current) if (migrateSave(sl)) dirty.current = true;
      const loaded = slots.current[active.current];
      if (loaded) {
        // one-time rebalance: agility used to grow far too fast from walking
        if (!loaded.agiFix) { loaded.aff["agility"] = (loaded.aff["agility"] ?? 0) * 0.3; loaded.agiFix = true; dirty.current = true; }
        if (loaded.loc === "village" && !WALKABLE_V.has(villageTile(loaded.pos.x, loaded.pos.y))) loaded.pos = { ...VILLAGE_START };
        ref.current = loaded; loaded.notes = []; setS(loaded);
      }
      else setNeedChar({ hadOld: !!raw && !slots.current.length });
    });
    return () => { alive = false; };
  }, [userId]);

  const save = useCallback(async () => {
    if (ref.current) slots.current[active.current] = ref.current;
    setSaving("Saving…");
    const payload = { multi: true, active: active.current, slots: slots.current.map((x) => ({ ...x, notes: [] })) };
    const { error } = await supabase.from("game_saves").upsert({ user_id: userId, data: JSON.parse(JSON.stringify(payload)), updated_at: new Date().toISOString() });
    dirty.current = !!error;
    setSaving(error ? "Save failed — will retry" : `Saved ${new Date().toLocaleTimeString()}`);
  }, [userId]);

  useEffect(() => {
    const id = setInterval(() => { if (dirty.current) void save(); }, 12000);
    const pt = setInterval(() => { if (ref.current && document.visibilityState === "visible") { ref.current.playTime += 5; dirty.current = true;
      const c = ref.current; if (c.title) { c.titleTime ??= {}; const t0 = c.titleTime[c.title] ?? 0; const b = titleStars(c.title, t0); c.titleTime[c.title] = t0 + 5; const a = titleStars(c.title, t0 + 5); if (a > b) note(c, `⭐ Title "${c.title}" rose to ${a} stars!`); } } }, 5000);
    const vis = () => { if (document.visibilityState === "hidden" && dirty.current) void save(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); clearInterval(pt); document.removeEventListener("visibilitychange", vis); };
  }, [save]);

  const act = useCallback(<R,>(fn: (n: GameState) => R): R => {
    const n = structuredClone(ref.current!) as GameState;
    const r = fn(n);
    checkAchievements(n); checkClass(n);
    const locChanged = n.loc !== ref.current!.loc;
    if (n.notes.length) {
      const ns = n.notes; n.notes = [];
      if (getSettingsToasts()) { const add = ns.map((t) => ({ id: Math.random(), t })); setToasts((x) => [...x, ...add].slice(-4)); setTimeout(() => setToasts((x) => x.filter((y) => !add.includes(y))), SPEED_MS[st.promptSpeed]); sfx("loot"); }
    }
    if (n.pendingEvo && !ref.current!.pendingEvo) sfx("evolve");
    ref.current = n; dirty.current = true; setS(n);
    if (locChanged) setTimeout(() => void save(), 50);
    return r;
  }, [save, st.promptSpeed]);
  const toastsOn = useRef(st.lootToasts); toastsOn.current = st.lootToasts;
  const getSettingsToasts = () => toastsOn.current;

  const blocked = () => { const c = ref.current; return confirmation.pending || !c || !!c.combat || !!c.result || !!c.pendingEvo; };

  // ---- core move ----
  const move = useCallback((dx: number, dy: number) => {
    if (blocked() || panel) return;
    stepAnim(dx, dy);
    const open = act<PanelS | null>((n) => {
      const tx = n.pos.x + dx, ty = n.pos.y + dy;
      if (n.loc === "village") {
        const t = villageTile(tx, ty);
        if (WALKABLE_V.has(t)) {
          n.pos = { x: tx, y: ty }; n.step++; addXp(n, "mobility", 0.5);
          const p = playerStats(n); n.sta = Math.min(p.sta, n.sta + 1); if (n.hp < p.hp && !n.ailments?.poisoned) n.hp = Math.min(p.hp, n.hp + 1);
          return null;
        }
        return interactVillage(n, tx, ty);
      }
      const d = n.dungeon!;
      const mon = d.monsters.find((m) => m.x === tx && m.y === ty);
      if (mon) { startCombat(n, mon); return null; }
      const t = d.tiles[ty]?.[tx];
      if (!t || t === "#") return null;
      if (t === "V") { mineVein(n, tx, ty); n.step++; }
      else if (t === "$") { openChest(n, tx, ty); n.pos = { x: tx, y: ty }; }
      else if (t === ">") {
        if (d.bossAlive) { log(n, "🔒 The Guardian must fall before the stairs open!"); return null; }
        return { t: "tower", x: -1 };
      } else if (t === "<") {
        return { t: "tower", x: -2 };
      } else { n.pos = { x: tx, y: ty }; n.step++; addXp(n, "mobility", 0.5); stepAilments(n); }
      const attacker = moveMonsters(n);
      if (attacker) startCombat(n, attacker);
      return null;
    });
    if (open?.x === -1 || open?.x === -2) {
      const up = open.x === -1; const f = ref.current!.dungeon!.floor;
      const go = () => { act((n) => (up ? climbUp(n) : climbDown(n))); setTimeout(() => void save(), 50); };
      if (!getConfirm()) go();
      else if (up) confirmation.ask({ title: `Climb to floor ${f + 1}?`, text: f >= 1000 ? "This is the top of the Tower. The stairs lead back to the village." : "Take the stairs up. Your loot stays in your bag until you retreat to the village.", label: "⬆️ Go up", action: go });
      else confirmation.ask({ title: `Go down to floor ${f - 1}?`, text: "Take the stairs down. You arrive next to that floor's stairs up.", label: "⬇️ Go down", action: go });
    } else if (open) setPanel(open);
  }, [act, save, panel, confirmation.pending]);
  const confirmRef = useRef(st.confirmNextFloor); confirmRef.current = st.confirmNextFloor;
  const getConfirm = () => confirmRef.current;

  function interactVillage(n: GameState, tx: number, ty: number): PanelS | null {
    const t = villageTile(tx, ty);
    const o = tileOpen(t); if (o) return o;
    if (gather(n, tx, ty)) { n.step++; sfx("ui"); }
    return null;
  }

  // ---- tap on map ----
  const tapTile = (x: number, y: number) => {
    unlockAudio();
    const c = ref.current; if (!c || blocked() || panel) return;
    const near = Math.abs(c.pos.x - x) + Math.abs(c.pos.y - y);
    if (c.loc === "village") {
      const t = villageTile(x, y);
      const o = tileOpen(t); if (o) { setPanel(o); sfx("ui"); return; }
      if (WALKABLE_V.has(t)) { walkTo(x, y, null); return; }
      if (t === "#") return;
      if (near === 1) { const o = act((n) => interactVillage(n, x, y)); if (o) setPanel(o); return; }
      // walk to adjacent tile, then interact
      walkTo(x, y, () => { const o = act((n) => interactVillage(n, x, y)); if (o) setPanel(o); }, true);
      return;
    }
    if (near === 1) { move(x - c.pos.x, y - c.pos.y); return; }
    const d = c.dungeon!; const t = d.tiles[y]?.[x];
    const target = d.monsters.some((m) => m.x === x && m.y === y) || t === "V" || t === ">" || t === "<";
    if (target) walkTo(x, y, () => { const n = ref.current!; if (Math.abs(n.pos.x - x) + Math.abs(n.pos.y - y) === 1) move(x - n.pos.x, y - n.pos.y); }, true);
    else walkTo(x, y, null);
  };
  const walkTo = (x: number, y: number, then: (() => void) | null, adjacent = false) => {
    const c = ref.current!; const path = bfs(c, x, y, adjacent);
    if (!path) return;
    if (!path.length) { pathRef.current = []; pathAction.current = null; if (then) then(); return; }
    pathRef.current = path; pathAction.current = then;
  };
  useEffect(() => {
    const id = setInterval(() => {
      const p = pathRef.current; const c = ref.current;
      if (!c || !p.length) return;
      if (blocked() || panel) { pathRef.current = []; pathAction.current = null; return; }
      const nx = p.shift()!; const before = c.pos;
      move(nx.x - before.x, nx.y - before.y);
      const after = ref.current!;
      if (after.pos.x !== nx.x || after.pos.y !== nx.y || after.loc !== c.loc) { pathRef.current = []; pathAction.current = null; return; }
      if (!pathRef.current.length && pathAction.current) { const a = pathAction.current; pathAction.current = null; setTimeout(a, 0); }
    }, 110);
    return () => clearInterval(id);
  }, [move, panel]);

  // ---- joystick ----
  const joy = useRef<{ dir: [number, number] | null; last: number }>({ dir: null, last: 0 });
  const [stick, setStick] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(null);
  const stickRef = useRef(false); stickRef.current = !!stick;
  const keyDir = useRef<string | null>(null);
  useEffect(() => {
    const ms = Math.round(170 * 100 / Math.max(60, playerSpd()));
    const id = setInterval(() => { const d = joy.current.dir; if (d && Date.now() - joy.current.last >= ms - 20) { joy.current.last = Date.now(); pathRef.current = []; move(d[0], d[1]); } }, 40);
    return () => clearInterval(id);
  }, [move, s?.skills?.["mobility"]]);
  const playerSpd = () => (ref.current ? playerStats(ref.current).spd : 100);
  const onDown = (e: RPE<HTMLDivElement>) => {
    unlockAudio();
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false, id: e.pointerId };
    const target = e.target as HTMLElement;
    let held = false;
    const lp = window.setTimeout(() => {
      if (start.moved) return;
      const c = ref.current; const cell = target.closest("[data-x]") as HTMLElement | null;
      if (!c || c.loc !== "dungeon" || !cell || blocked() || panel) return;
      const x = Number(cell.dataset["x"]), y = Number(cell.dataset["y"]); const d = c.dungeon!;
      const dist = Math.abs(c.pos.x - x) + Math.abs(c.pos.y - y);
      held = true;
      if (dist === 0 || dist > TRAP_RANGE || d.tiles[y]?.[x] !== "." || d.monsters.some((m) => m.x === x && m.y === y) || d.traps?.some((q) => q.x === x && q.y === y)) { pushToast(`Traps go on empty floor within ${TRAP_RANGE} steps`); return; }
      pathRef.current = []; setTrapAt({ x, y });
    }, 500);
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x, dy = ev.clientY - start.y; const dist = Math.hypot(dx, dy);
      if (dist > 18 || (start.moved && dist > 8)) {
        start.moved = true; clearTimeout(lp);
        const cl = Math.min(dist, 44); setStick({ ox: start.ox, oy: start.oy, dx: (dx / dist) * cl, dy: (dy / dist) * cl });
        const nd: [number, number] = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
        const od = joy.current.dir;
        joy.current.dir = nd;
        // step immediately on a new direction so short flicks and bumps register on the first try
        if ((!od || od[0] !== nd[0] || od[1] !== nd[1]) && Date.now() - joy.current.last >= Math.round(170 * 100 / Math.max(60, playerSpd()))) { pathRef.current = []; joy.current.last = Date.now(); move(nd[0], nd[1]); }
      }
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); window.removeEventListener("pointercancel", onUp);
      joy.current.dir = null; setStick(null); clearTimeout(lp);
      if (!start.moved && !held) {
        const hit = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null) ?? target;
        const cell = (hit.closest("[data-x]") ?? target.closest("[data-x]")) as HTMLElement | null;
        if (cell) tapTile(Number(cell.dataset["x"]), Number(cell.dataset["y"]));
      }
    };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); window.addEventListener("pointercancel", onUp);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const d: Record<string, [number, number]> = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
      if (d[k] && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        // Holding a key walks at the hero's normal pace (the joystick timer), never at the OS key-repeat rate.
        const direction = d[k]; if (!direction || e.repeat) return;
        keyDir.current = k; joy.current.dir = direction; pathRef.current = [];
        if (Date.now() - joy.current.last >= Math.round(170 * 100 / Math.max(60, playerSpd()))) { joy.current.last = Date.now(); move(...direction); }
      }
      if (k === "escape") setPanel(null);
    };
    const up = (e: KeyboardEvent) => { if (e.key.toLowerCase() === keyDir.current) { keyDir.current = null; if (!stickRef.current) joy.current.dir = null; } };
    const blur = () => { keyDir.current = null; if (!stickRef.current) joy.current.dir = null; };
    window.addEventListener("keydown", h); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", h); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [move]);

  // ---- smooth movement: slide the hero, moved monsters and the camera between tiles ----
  const innerRef = useRef<HTMLDivElement | null>(null);
  const prevView = useRef<{ loc: string; floor: number; x: number; y: number; cx: number; cy: number; step: number; t: number } | null>(null);
  useLayoutEffect(() => {
    if (!s) return;
    const { cx, cy } = camera(s, VW, VH);
    const now = performance.now(); const pv = prevView.current;
    const floor = s.dungeon?.floor ?? 0;
    prevView.current = { loc: s.loc, floor, x: s.pos.x, y: s.pos.y, cx, cy, step: s.step, t: now };
    const el = innerRef.current;
    if (!pv || !el || pv.loc !== s.loc || pv.floor !== floor || pv.step === s.step) return;
    if (document.documentElement.classList.contains("rm")) return;
    const dur = Math.max(90, Math.min(170, now - pv.t));
    const opts: KeyframeAnimationOptions = { duration: dur, easing: "linear" };
    const dx = s.pos.x - pv.x, dy = s.pos.y - pv.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      const dcx = cx - pv.cx, dcy = cy - pv.cy, cols = VW + 2, rows = VH + 2;
      if (dcx || dcy) el.animate([{ transform: `translate(${(dcx * 100) / cols}%, ${(dcy * 100) / rows}%)` }, { transform: "translate(0, 0)" }], opts);
      el.querySelector(".tile-mover-p")?.animate([{ transform: `translate(${-dx * 100}%, ${-dy * 100}%)` }, { transform: "translate(0, 0)" }], opts);
    }
    el.querySelectorAll<HTMLElement>(".tile-mover[data-slide]").forEach((m) => {
      const f = m.dataset["slide"]; const [mx, my] = f === "r" ? [1, 0] : f === "l" ? [-1, 0] : f === "u" ? [0, -1] : [0, 1];
      m.animate([{ transform: `translate(${-mx * 100}%, ${-my * 100}%)` }, { transform: "translate(0, 0)" }], opts);
    });
  }, [s, VW, VH]);

  if (needChar) return <CreateCharacter hadOld={needChar.hadOld} onCancel={slots.current.length ? () => { setNeedChar(null); } : undefined} onDone={(c) => { const g = newGame(c); if (ref.current) slots.current[active.current] = ref.current; slots.current.push(g); active.current = slots.current.length - 1; ref.current = g; setPanel(null); dirty.current = true; setS(g); setNeedChar(null); setTimeout(() => void save(), 50); }} />;
  if (!s) return <div className="flex min-h-dvh items-center justify-center font-display text-primary">Loading your adventure…</div>;

  const p = playerStats(s);
  const inV = s.loc === "village";
  const { cx, cy } = camera(s, VW, VH);
  const avatar = <Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} dir={face} frame={walkF} held={heldGearOf(s)} />;
  const cells = [];
  // one extra ring of tiles around the view so the camera can slide smoothly
  for (let y = cy - 1; y < cy + VH + 1; y++) for (let x = cx - 1; x < cx + VW + 1; x++) cells.push(renderTile(s, x, y, avatar, cx - 1, cy - 1, walkF !== undefined));
  const close = () => setPanel(null);

  return (
    <div className="game-shell mx-auto flex h-dvh w-full min-w-0 max-w-lg flex-col gap-1.5 p-1.5" onPointerDown={unlockAudio}>
      <GameAgentTools s={s} />
      <header className="pixel-panel p-1.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <button className="flex min-w-0 items-center gap-1 text-left" onClick={() => setPanel({ t: "profile" })}>
            <span className="h-9 w-9 shrink-0"><Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} held={heldGearOf(s)} /></span>
            <span className="min-w-0"><span className="block truncate text-sm text-primary">{s.char.name} · Lv {p.level}</span><span className="block truncate text-xs text-muted-foreground">{s.className}</span></span>
          </button>
          <div className="text-right text-xs"><div className="text-gold">💰 {fmt(s.gold)}</div><div className="text-muted-foreground">{inV ? "Thornvale" : `Floor ${s.dungeon!.floor} · ${themeFor(s.dungeon!.floor).icon} ${themeFor(s.dungeon!.floor).name}`} · best {s.maxFloor}</div></div>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-1 text-[0.7rem]">
          <MiniBar cls="bar-hp" v={s.hp} max={p.hp} label="HP" /><MiniBar cls="bar-mp" v={s.mp} max={p.mp} label="MP" /><MiniBar cls="bar-sta" v={s.sta} max={p.sta} label="STA" />
        </div>
      </header>

      {s.won && <div className="pixel-panel p-1 text-center font-display text-gold title-glow">👑 Tower Conqueror 👑</div>}

      <div className="game-map-area relative min-h-0 flex-1">
        <div className="map-wrap touch-none select-none" onPointerDown={onDown}>
          <div className={`map-grid ${inV ? `map-village town-${townThemeOf(s.char.race)}` : "map-dungeon"}`} style={{ ["--view" as string]: VW }}>
            <div ref={innerRef} className="map-inner" style={{ gridTemplateColumns: `repeat(${VW + 2}, 1fr)`, width: `${((VW + 2) / VW) * 100}%`, left: `${-100 / VW}%`, top: `${-100 / VH}%`, ["--cols" as string]: VW + 2 }}>{cells}</div>
            {inV && <div aria-hidden className="town-air" />}
            {!inV && <div aria-hidden className={`torchlight amb-${ambience(themeIndex(s.dungeon!.floor)) ?? "none"}`} style={{ background: `radial-gradient(circle at ${((s.pos.x - cx + 0.5) / VW) * 100}% ${((s.pos.y - cy + 0.5) / VH) * 100}%, transparent 22%, rgba(8,6,12,.16) 48%, rgba(8,6,12,.42) 90%)` }} />}
          </div>
          {stick && <div className="joy-base" style={{ left: stick.ox - 50, top: stick.oy - 50 }}><div className="joy-knob" style={{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }} /></div>}
          {!stick && <div className="joy-hint">Drag to walk · tap to interact</div>}
        </div>
        {(() => { const tp = tutorProgress(s); return tp && <button className={`mission-pill ${tp.done ? "mission-done" : ""}`} onClick={() => setPanel({ t: "elder" })} aria-label="Open Elder Rowan's mission">
          <span>{tp.done ? "❗" : "📜"}</span><span className="truncate">{tp.m.text}</span><span className="shrink-0">{tp.done ? "Claim!" : `${fmt(tp.cur)}/${fmt(tp.m.need)}`}</span></button>; })()}
        <div className="pointer-events-none absolute inset-x-0 top-1 z-30 flex flex-col items-center gap-1">
          {toasts.map((t) => <div key={t.id} className="pixel-panel toast px-2 py-1 text-sm">{t.t}</div>)}
        </div>
      </div>

      <div className="pixel-panel h-[3.2rem] overflow-hidden px-2 py-0.5 text-sm leading-tight">
        {s.log.slice(0, 2).map((l, i) => <div key={i} className={`truncate ${i ? "text-muted-foreground" : ""}`}>{l}</div>)}
      </div>

      {!!s.companions?.length && <div className="flex gap-1">
        {s.companions.map((c) => <button key={c.id} className="pixel-btn flex min-w-0 flex-1 items-center gap-1 px-1 py-0.5 text-[0.65rem]" onClick={() => setPanel({ t: "party", cid: c.id })}>
          <span className="h-6 w-6 shrink-0"><CompAvatar c={c} /></span><span className="truncate">{c.name}</span></button>)}
      </div>}
      <nav className="grid grid-cols-5 gap-1">
        <NavBtn icon="🎒" label="Bag" onClick={() => setPanel({ t: "bag" })} />
        <NavBtn icon="👤" label="Profile" onClick={() => setPanel({ t: "profile" })} />
        {inV ? <NavBtn icon="⚒️" label="Forge" onClick={() => setPanel({ t: "forge" })} /> : <NavBtn icon="🍖" label="Eat" onClick={() => setPanel({ t: "bag" })} />}
        {inV ? <NavBtn icon="🗼" label="Tower" onClick={() => setPanel({ t: "tower" })} />
          : <NavBtn icon="🏃" label="Retreat" danger onClick={() => confirmation.ask({ title: "Retreat to the village?", text: "You go home with all the loot in your bag. This floor stays uncleared.", label: "Retreat", action: () => act((n) => { leaveDungeon(n, true); log(n, "🏃 You retreat with your loot."); }) })} />}
        <NavBtn icon="⚙️" label="Settings" onClick={() => setPanel({ t: "settings" })} />
      </nav>

      <SceneCtx.Provider value={panel && INTERIOR_PANELS.has(panel.t) ? <>
        <Interior panel={panel.t} hero={{ race: s.char.race, gender: s.char.gender, classId: s.classId }} />
        {(() => { const g = GROUPS.find((x) => x.some(([t]) => t === panel.t)); return g ? <BuildingTabs tabs={g} cur={panel.t} go={(t) => setPanel({ t: t as PanelT })} /> : null; })()}
        {BLDG_OF[panel.t] && <BldgUpgrade s={s} b={BLDG_OF[panel.t]!} onUp={() => { if (act((n) => upgradeBldg(n, BLDG_OF[panel.t]!))) sfx("level"); }} />}
      </> : null}>
      {panel?.t === "gather" && panel.spot && <GatherPanel key={panel.spot} s={s} spot={panel.spot} onClose={close} onGather={(m) => { if (act((n) => gatherSpot(n, panel.spot!, m))) sfx("ui"); else sfx("fail"); }}
        onUpgrade={() => { if (act((n) => upgradeSpot(n, panel.spot!))) sfx("level"); }} onPlots={panel.spot === "field" ? () => setPanel({ t: "plot" }) : undefined} />}
      {panel?.t === "church" && <ChurchPanel s={s} onClose={close} onHeal={() => { if (act(churchHeal)) sfx("level"); }} onCure={(id) => { if (act((n) => cureAilment(n, id))) sfx("level"); }}
        onBless={(id) => { if (act((n) => buyBlessing(n, id))) sfx("level"); }} onPray={() => { act(pray); sfx("level"); }} onEnchant={(g, el) => { if (act((n) => enchantGear(n, g, el))) sfx("loot"); else sfx("fail"); }} />}
      {panel?.t === "magic" && <MagicPanel s={s} onClose={close} onToggle={(id) => act((n) => toggleSpell(n, id))} onLevel={(id) => { if (act((n) => levelSpell(n, id))) sfx("level"); }} onLearn={(id) => { if (act((n) => learnSchool(n, id))) sfx("level"); }} onStudy={(id) => { if (act((n) => studySchool(n, id))) sfx("ui"); }}
        onAscend={(r) => confirmation.ask({ title: "Embrace the transformation?", text: "Your race changes permanently. Your old racial traits are replaced.", label: "Transform", action: () => { act((n) => ascend(n, r)); sfx("level"); } })} />}
      {panel?.t === "guildshop" && <GuildShopPanel s={s} onClose={close} onSell={(id, q) => { act((n) => sellMat(n, id, q, guildSellMult(n))); sfx("coin"); }} />}
      {panel?.t === "arena" && <ArenaPanel s={s} onClose={close} onStart={(f) => { if (act((n) => startArena(n, f))) { sfx("level"); close(); } else sfx("fail"); }}
        onFight={() => { if (act(arenaFight)) { sfx("hit"); close(); } }} onCashOut={() => { act(arenaCashOut); sfx("loot"); }} />}
      {panel?.t === "pmarket" && <PlayerMarketPanel s={s} userId={userId} onClose={close} ops={{
        take: (k, ref, q) => act((n) => takeForListing(n, k, ref, q)),
        give: (k, item, q) => act((n) => receiveListing(n, k, item, q)),
        pay: (g) => act((n) => spend(n, g)), earn: (g) => act((n) => earn(n, g)),
        save: () => setTimeout(() => void save(), 50),
      }} />}
      {panel?.t === "prison" && <PrisonPanel s={s} onClose={close} ops={{
        deposit: (id) => { if (act((n) => depositComp(n, id))) sfx("ui"); else sfx("fail"); },
        withdraw: (id) => { if (act((n) => withdrawComp(n, id))) sfx("ui"); else sfx("fail"); },
        release: (id) => confirmation.ask({ title: "Release for good?", text: "They leave forever. Any gear they carry goes back to your bag.", label: "Release", action: () => act((n) => releasePrisoner(n, id)) }),
        drill: (id) => { if (act((n) => drillComp(n, id))) sfx("level"); else sfx("fail"); },
        skill: (id, sk) => { if (act((n) => upgradeCompSkill(n, id, sk))) sfx("level"); else sfx("fail"); },
      }} />}
      {panel?.t === "elder" && <ElderPanel s={s} onClose={close} onClaim={() => { if (act(claimTutor)) sfx("coin"); }} />}
      {panel?.t === "training" && <TrainingPanel s={s} onClose={close} onAff={(a) => { const r = act((n) => trainAffinity(n, a)); sfx(r ? "level" : "fail"); }} onTrain={(k) => { const r = act((n) => trainSkill(n, k)); sfx(r ? "level" : "fail"); }} onTech={(a, k) => { if (act((n) => learnTech(n, a, k))) sfx("level"); }} />}
      {panel?.t === "companions" && <HirePanel s={s} onClose={close} onHire={(r, b) => { if (act((n) => hireCompanion(n, r, b))) sfx("level"); }} onParty={() => setPanel({ t: "party" })} />}
      {panel?.t === "party" && <PartyPanel s={s} start={panel.cid} onClose={close} onEquip={(c, g, sl) => act((n) => compEquip(n, c, g, sl))} onTitle={(c, t) => act((n) => compTitle(n, c, t))}
        onDismiss={(c) => confirmation.ask({ title: "Part ways?", text: "This companion will leave your party for good. Any gear they carry goes back to your bag.", label: "Confirm", action: () => act((n) => dismissCompanion(n, c)) })} />}
      {panel?.t === "craftery" && <CrafteryPanel s={s} onClose={close} onCraft={(id, k) => { if (act((n) => craftTool(n, id, k))) sfx("loot"); else sfx("fail"); }} onRanged={(id) => act((n) => equipRanged(n, id))} onUpgrade={(id) => { if (act((n) => upgradeOffhand(n, id))) sfx("level"); else sfx("fail"); }} onBrew={(id, k) => { if (act((n) => brewPotion(n, id, k))) sfx("loot"); else sfx("fail"); }} onUsePotion={(id) => { if (act((n) => usePotion(n, id))) sfx("loot"); }} />}
      {trapAt && <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-2" onClick={() => setTrapAt(null)}>
        <div className="pixel-panel w-full max-w-md p-3" onClick={(e) => e.stopPropagation()}>
          <h2 className="mb-2 text-accent">🪤 Place a trap</h2>
          {TOOLS.filter((t) => t.kind === "trap").map((t) => <button key={t.id} className="pixel-btn mb-1 w-full py-3 text-left" disabled={!(s.tools?.[t.id] ?? 0)} onClick={() => { if (act((n) => placeTrap(n, t.id, trapAt.x, trapAt.y))) sfx("ui"); setTrapAt(null); }}>{t.icon} {t.name} ×{s.tools?.[t.id] ?? 0} <span className="text-xs">· {t.desc}</span></button>)}
          {!TOOLS.some((t) => t.kind === "trap" && (s.tools?.[t.id] ?? 0) > 0) && <p className="mb-1 text-sm text-muted-foreground">No traps — craft them at the Craftery.</p>}
          <button className="pixel-btn w-full py-2" onClick={() => setTrapAt(null)}>Cancel</button>
        </div>
      </div>}
      {panel?.t === "forge" && <ForgePanel s={s} onClose={close} onCraft={(m, sl) => { const g = act((n) => craftGear(n, m, sl)); sfx(g ? "loot" : "fail"); }}
        onEnhance={(id) => act((n) => enhance(n, id))} onRepair={(id) => act((n) => repair(n, id))} onUpgrade={() => act(upgradeForge)} />}
      {panel?.t === "bag" && <BagPanel s={s} onClose={close} onEat={(i) => act((n) => { eatFood(n, i); })} onEquip={(id) => act((n) => equipGear(n, id))} onSell={(id) => { act((n) => sellGear(n, id)); sfx("coin"); }} />}
      {panel?.t === "profile" && <ProfilePanel s={s} onClose={close} onTitle={(t) => act((n) => { n.title = t; checkClass(n); })} onEquip={(id) => act((n) => equipGear(n, id))} onSpec={(id) => act((n) => setSpec(n, id))} onPickClass={(id) => act((n) => { if (pickClass(n, id)) checkClass(n); })} />}
      {panel?.t === "settings" && <SettingsPanel onClose={close} saving={saving} onSave={() => void save()} onSignOut={async () => { await save(); await supabase.auth.signOut(); }} chars={{
        list: slots.current.map((x, i) => i === active.current && ref.current ? ref.current : x), active: active.current, max: MAX_CHARS,
        onSwitch: (i) => { if (ref.current) slots.current[active.current] = ref.current; active.current = i; const g = slots.current[i]!; g.notes = []; ref.current = g; setS(g); close(); void save(); },
        onNew: () => { if (slots.current.length < MAX_CHARS) { close(); setNeedChar({ hadOld: false }); } },
        onDelete: (i) => { if (i === active.current || !slots.current[i]) return; slots.current.splice(i, 1); if (i < active.current) active.current--; bumpChars((n) => n + 1); void save(); },
      }} />}
      {panel?.t === "kitchen" && <KitchenPanel s={s} onClose={close} onCook={(m) => act((n) => cook(n, m))} onRecipe={(id) => act((n) => cookRecipe(n, id))} />}
      {(panel?.t === "carve" || panel?.t === "smelt" || panel?.t === "tan") && <RefinePanel s={s} station={panel.t} onClose={close} onRefine={(id, k) => act((n) => refine(n, id, k, panel.t as "carve" | "smelt" | "tan"))} />}
      {panel?.t === "plot" && <PlotPanel s={s} onClose={close} onPlant={(cells, seed) => act((n) => { for (const [x, y] of cells) { if (!n.inv[seed]) break; if (!n.village.plots[key(x, y)]) plant(n, x, y, seed); } })}
        onHarvest={(cells) => { act((n) => { for (const [x, y] of cells) { harvest(n, x, y); n.step++; } }); sfx("loot"); }} />}
      {panel?.t === "tower" && <TowerPanel s={s} onClose={close} onEnter={(f) => { act((n) => enterDungeon(n, f)); close(); }}
        onSkip={() => confirmation.ask({ title: `Skip to floor ${nextBossFloor(s.maxFloor)}?`, text: `${SKIP_WARNING} You pass the floors in between without their monsters, materials and experience, and face the Guardian at once.`, label: "⏩ Skip ahead", action: () => { if (act(skipToBoss)) { close(); setTimeout(() => void save(), 50); } } })} />}
      {panel?.t === "house" && <HousePanel s={s} onClose={close} onRest={() => act(restAtHome)} />}
      {panel?.t === "shop" && <ShopPanel s={s} onClose={close} onBuy={(i) => act((n) => buyShop(n, i))} onSell={(id, q) => { act((n) => sellMat(n, id, q, marketMult(n))); sfx("coin"); }} />}
      {panel?.t === "market" && <MarketPanel s={s} onClose={close} onBuy={(i) => act((n) => marketBuy(n, i))} onSell={(id, q, m) => { act((n) => sellMat(n, id, q, m)); sfx("coin"); }} />}
      {panel?.t === "tavern" && <TavernPanel s={s} onClose={close} onClaim={(id) => { act((n) => claimQuest(n, id)); sfx("coin"); }} onReroll={() => act((n) => { if (spend(n, 20)) rerollQuests(n); })} />}
      {panel?.t === "casino" && <CasinoPanel s={s} onClose={close} onDice={(b, h) => act((n) => { playDice(n, b, h); })} onSlots={(b) => act((n) => { playSlots(n, b); })}
        onHL={(b, cur, hi) => act((n) => playHighLow(n, b, cur, hi)?.next ?? null)} onToken={(i) => act((n) => buyToken(n, i))} />}
      {panel?.t === "warehouse" && <WarehousePanel s={s} onClose={close}
        onStoreGear={(id) => act((n) => { storeGear(n, id); })}
        onTakeGear={(id) => act((n) => { const g = n.whGear.find((x) => x.id === id); if (g) { n.whGear = n.whGear.filter((x) => x.id !== id); n.gear.push(g); } })}
        onStoreAll={() => act(storeAll)}
        onTake={(id) => act((n) => { const q = n.wh[id] ?? 0; if (takeMat(n, id, q, "wh")) addMat(n, id, q); })} />}
      </SceneCtx.Provider>

      {s.combat && <CombatView s={s} onAct={(a: CombatAct) => { const r = act((n) => combatTurn(n, a)); sfx(r === "lose" ? "fail" : r === "win" ? "level" : "hit"); }} />}
      {s.result && <ResultView s={s} onCollect={() => { act(collectLoot); sfx("loot"); }} onContinue={() => { act((n) => { n.result = undefined; clampVitals(n); }); if (ref.current?.arena) setPanel({ t: "arena" }); }} />}
      {s.pendingEvo && <EvoModal evo={s.pendingEvo} onOk={() => act((n) => { n.pendingEvo = undefined; })} />}
    </div>
  );
}

function NavBtn({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return <button className={`pixel-btn flex min-h-14 flex-col items-center justify-center py-1 ${danger ? "pixel-btn-danger" : ""}`} onClick={() => { sfx("ui"); onClick(); }}><span className="text-xl leading-none">{icon}</span><span className="text-[0.62rem]">{label}</span></button>;
}
function MiniBar({ cls, v, max, label }: { cls: string; v: number; max: number; label: string }) {
  const pct = Math.max(0, Math.min(100, max ? (v / max) * 100 : 0));
  return <div className={`bar bar-labeled ${cls}`}><div style={{ width: `${pct}%` }} /><span className="bar-label">{label} {fmt(Math.max(0, v))}/{fmt(max)}</span></div>;
}

function bfs(s: GameState, tx: number, ty: number, adjacent: boolean) {
  const walk = (x: number, y: number) => {
    if (s.loc === "village") return WALKABLE_V.has(villageTile(x, y));
    const t = s.dungeon!.tiles[y]?.[x]; return t === "." || t === "$";
  };
  const goal = (x: number, y: number) => adjacent ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty;
  const start = s.pos; const prev: Record<string, string | null> = { [key(start.x, start.y)]: null };
  const q = [start]; let end: { x: number; y: number } | null = goal(start.x, start.y) ? start : null;
  while (q.length && !end) {
    const c = q.shift()!;
    for (const [dx, dy] of DIRS) {
      const nx = c.x + dx, ny = c.y + dy, k = key(nx, ny);
      if (prev[k] !== undefined || !walk(nx, ny)) continue;
      if (s.loc === "dungeon" && s.dungeon!.monsters.some((m) => m.x === nx && m.y === ny)) continue;
      prev[k] = key(c.x, c.y); if (goal(nx, ny)) { end = { x: nx, y: ny }; break; } q.push({ x: nx, y: ny });
    }
  }
  if (!end) return null;
  const path: { x: number; y: number }[] = []; let k: string | null = key(end.x, end.y);
  while (k && k !== key(start.x, start.y)) { const [x, y] = k.split(",").map(Number); path.unshift({ x: x!, y: y! }); k = prev[k] ?? null; }
  return path.slice(0, 40);
}

import { icon } from "./art";
import { dungeonTileStyle, ambience } from "./dungeonStyle";
import { themeFor, themeIndex } from "./themes";
const OBJ_ART = import.meta.glob("../assets/art/o_*.webp", { eager: true, import: "default" }) as Record<string, string>;
const obj = (id: string) => OBJ_ART[`../assets/art/o_${id}.webp`];

/** Camera origin: keeps the hero centred, clamped to the map edges. */
function camera(s: GameState, VW: number, VH: number) {
  const W = s.loc === "village" ? VILLAGE[0]!.length : s.dungeon!.w, H = s.loc === "village" ? VILLAGE.length : s.dungeon!.h;
  return { cx: Math.max(0, Math.min(W - VW, s.pos.x - Math.floor(VW / 2))), cy: Math.max(0, Math.min(H - VH, s.pos.y - Math.floor(VH / 2))) };
}

/** Village ground kind for corner rounding: grass-backed or open ground (path/water/soil; buildings stand on path); off-map is neutral. */
function groundKind(x: number, y: number): "grass" | "path" | "water" | "soil" | null {
  const t = VILLAGE[y]?.[x];
  if (t === undefined) return null;
  if (SPOT_TILES[t]) return "grass";
  return t === "," || BUILDINGS[t] ? "path" : t === "W" ? "water" : t === "G" ? "soil" : "grass";
}
const CORNERS: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
/** Rounds grass where it meets paths, water and soil: grass bulges get round tips, inner bends get soft fillets. */
function roundedCorners(x: number, y: number): React.CSSProperties | undefined {
  const t = VILLAGE[y]?.[x]; if (t === undefined || BUILDINGS[t]) return undefined;
  const me = groundKind(x, y); if (!me) return undefined;
  const isG = me === "grass"; let under: string | null = null; let any = false;
  const r = CORNERS.map(([sx, sy]) => {
    const ks = [groundKind(x + sx, y), groundKind(x, y + sy), groundKind(x + sx, y + sy)];
    const opp = ks.every((k) => k !== null && (isG ? k !== "grass" : k === "grass"));
    if (opp) { any = true; if (isG && !under) under = ks[2] ?? null; }
    return opp ? "45%" : "0";
  }).join(" ");
  if (!any) return undefined;
  return isG ? ({ "--br": r, "--under": under } as React.CSSProperties) : { borderRadius: r };
}

function renderTile(s: GameState, x: number, y: number, avatar: React.ReactNode, cx: number, cy: number, walking: boolean) {
  const k = `${x},${y}`;
  const isP = s.pos.x === x && s.pos.y === y;
  let elder = false;
  let cls = "tile-grass", glyph = "", dim = false, boss = false, label = "", bldg: React.ReactNode = null, mon: Mon | undefined, art: string | undefined, tileBg: React.CSSProperties | undefined;
  if (s.loc === "village") {
    const t = VILLAGE[y]?.[x] ?? "#";
    const depleted = (s.village.nodes[k] ?? 0) > s.step;
    cls = (x + y) % 2 ? "tile-grass" : "tile-grass-2";
    tileBg = roundedCorners(x, y);
    if (tileBg && (tileBg as Record<string, string>)["--under"]) { cls += ` tile-cvx under-${(tileBg as Record<string, string>)["--under"]}`; }
    if (t === "#") { cls = "tile-fence"; art = obj("fence"); }
    else if (t === "@") { elder = true; cls += " tap"; }
    else if (t === ",") cls = "tile-path";
    else if (TREES[t]) { glyph = TREES[t]!.icon; art = obj(t); dim = depleted; cls += " tap"; }
    else if (t === "R") { glyph = "🪨"; art = obj("R"); dim = depleted; cls += " tap"; }
    else if (t === "F") { glyph = "🌼"; art = obj("F"); dim = depleted; cls += " tap"; }
    else if (t === "W") { cls = "tile-water tap"; glyph = depleted ? "" : (x * 7 + y * 3) % 5 === 0 ? "🐟" : ""; if (glyph) art = icon("fish"); }
    else if (t === "G") { cls = "tile-soil tap"; const p = s.village.plots[k]; glyph = p ? (p.readyAt <= s.step ? getMat(p.crop).icon : "🌱") : ""; if (p) art = p.readyAt <= s.step ? (icon(p.crop) ?? undefined) : icon("sprout"); }
    else if (ANIMALS[t]) { glyph = ANIMALS[t]!.icon; art = obj(t); dim = (s.village.animals[k] ?? 0) > s.step; cls += " tap"; }
    else if (BUILDINGS[t]) {
      cls = SPOT_TILES[t] ? `${(x + y) % 2 ? "tile-grass" : "tile-grass-2"} tap` : "tile-station-part tap";
      // 2x2 building: draw it once, anchored on its first visible tile
      let bx = x, by = y;
      while (VILLAGE[y]?.[bx - 1] === t) bx--;
      while (VILLAGE[by - 1]?.[x] === t) by--;
      if (x === Math.max(bx, cx) && y === Math.max(by, cy)) {
        bldg = (
          <span className="bldg" style={{ left: `${-(x - bx) * 100}%`, top: `${-(y - by) * 100}%` }}>
            <Building kind={t} name={BUILDINGS[t]?.name ?? "Building"} townTheme={townThemeOf(s.char.race)} adorned={adornBuilding(bx, by)} stage={SPOT_TILES[t] ? spotStage(spotLevel(s.spots, SPOT_TILES[t]!)) : 0} />
          </span>
        );
      }
    }
  } else {
    const d = s.dungeon!;
    const t = d.tiles[y]?.[x] ?? "#";
    cls = t === "#" ? "tile-wall" : (x + y) % 2 ? "tile-floor" : "tile-floor-2";
    tileBg = dungeonTileStyle(themeIndex(d.floor), x, y, (wx, wy) => (d.tiles[wy]?.[wx] ?? "#") === "#");
    if (t === "V") { glyph = "💎"; art = icon("gem"); }
    if (t === "$") { glyph = "🧰"; art = icon("chest"); }
    if (t === ">") { glyph = d.bossAlive ? "🔒" : "🪜"; art = icon(d.bossAlive ? "locked" : "stairs_up"); label = d.bossAlive ? "" : "Up"; }
    if (t === "<") { glyph = "🕳️"; art = icon("stairs"); label = "Down"; }
    const tr = d.traps?.find((q) => q.x === x && q.y === y); if (tr) { glyph = TOOL[tr.id]?.icon ?? "🪤"; art = icon(tr.id) ?? icon("bear_trap"); dim = true; }
    const m = d.monsters.find((mm) => mm.x === x && mm.y === y);
    if (m) { glyph = m.icon; boss = m.boss > 0 || !!m.affix; mon = m; }
    // vision: beyond sight only walls/floor (and the stairs beacon) show; torches widen it
    const dist = Math.hypot(x - s.pos.x, y - s.pos.y), sight = sightRadius(s);
    if (dist > sight) { cls += " tile-fog"; if (t !== ">" && t !== "<") { glyph = ""; art = undefined; mon = undefined; boss = false; } }
    else if (dist > sight - 1) cls += " tile-dusk";
  }
  return (
    <div key={k} data-x={x} data-y={y} className={`tile ${cls}`} style={tileBg}>
      {s.loc === "village" && <span className={`town-ground ${cls}`} style={tileBg} aria-hidden />}
      {s.loc === "village" && !isP && !elder && [".", ","].includes(VILLAGE[y]?.[x] ?? "") && <TownDecor race={s.char.race} x={x} y={y} />}
      {bldg}
      {elder && <span className="tile-mover tile-elder"><span className="elder-sprite"><ElderSprite /></span><span className="elder-mark" aria-label="Elder Rowan has advice">!</span></span>}
      {isP ? <span className="tile-mover tile-mover-p"><span className={`tile-player h-[90%] w-[90%] ${walking ? "walking" : ""}`}>{avatar}</span></span>
        : mon ? <span className="tile-mover tile-mover-m" data-slide={mon.movedAt === s.step ? mon.face ?? "d" : undefined}><MonsterSprite kind={mon.def} name={mon.name} dir={mon.face ?? "d"} moving={mon.movedAt === s.step} motionTick={s.step} boss={mon.boss || (mon.affix ? 1 : 0)} /></span>
        : art ? <img src={art} alt={glyph || "fence"} draggable={false} loading="lazy" width={256} height={256} className={`tile-obj ${dim ? (mon ? "" : "tile-dim") : ""} ${cls.includes("tile-water") ? "tile-fish" : ""}`} />
        : glyph && <span className={`${dim ? "tile-dim" : ""} ${boss ? "tile-boss" : ""}`}>{glyph}</span>}
      {label && <span className="tile-label">{label}</span>}
    </div>
  );
}
