import type React from "react";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ANIMALS, BUILDINGS, TREES, getMat } from "./data";
import {
  addMat, addXp, buyShop, buyToken, checkAchievements, checkClass, claimQuest, clampVitals, clearFloor, collectLoot, combatTurn, cook,
  craftGear, eatFood, enhance, enterDungeon, equipGear, gather, harvest, key, leaveDungeon, log, marketBuy, mineVein, moveMonsters,
  newGame, openChest, plant, playDice, playHighLow, playSlots, playerStats, refine, repair, rerollQuests, restAtHome, sellGear, sellMat,
  setCombatPrefs, spend, startCombat, takeMat, upgradeForge, villageTile, WALKABLE_V, VILLAGE,
  type CombatAct, type GameState,
} from "./engine";
import {
  BagPanel, CasinoPanel, ForgePanel, HousePanel, KitchenPanel, MarketPanel, PlotPanel, RefinePanel, SettingsPanel, ShopPanel,
  TavernPanel, TowerPanel, WarehousePanel, fmt,
} from "./Panels";
import { ProfilePanel } from "./Profile";
import { CombatView, EvoModal, ResultView } from "./Combat";
import { CreateCharacter } from "./CreateCharacter";
import { Avatar } from "./Avatar";
import { SPEED_MS, loadSettings, sfx, unlockAudio, useSettings } from "./settings";

type PanelT = "forge" | "kitchen" | "carve" | "smelt" | "plot" | "house" | "tower" | "bag" | "profile" | "settings" | "shop" | "market" | "tavern" | "casino" | "warehouse";
const STATIONS: Record<string, PanelT> = { H: "house", K: "kitchen", A: "forge", C: "carve", U: "smelt", D: "tower", $: "shop", M: "market", N: "tavern", X: "casino", Q: "warehouse" };
const VW = 11, VH = 11;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

export function Game({ userId }: { userId: string }) {
  const [s, setS] = useState<GameState | null>(null);
  const [needChar, setNeedChar] = useState<null | { hadOld: boolean }>(null);
  const ref = useRef<GameState | null>(null);
  const dirty = useRef(false);
  const [panel, setPanel] = useState<{ t: PanelT; x?: number; y?: number } | null>(null);
  const [saving, setSaving] = useState("");
  const [toasts, setToasts] = useState<{ id: number; t: string }[]>([]);
  const st = useSettings();
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const pathAction = useRef<null | (() => void)>(null);

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { setCombatPrefs(st.autoSellCommon, st.autoLoot); }, [st.autoSellCommon, st.autoLoot]);

  useEffect(() => {
    let alive = true;
    supabase.from("game_saves").select("data").eq("user_id", userId).maybeSingle().then(({ data }) => {
      if (!alive) return;
      const loaded = data?.data as unknown as GameState | undefined;
      if (loaded && loaded.v === 2) {
        // one-time rebalance: agility used to grow far too fast from walking
        if (!loaded.agiFix) { loaded.aff["agility"] = (loaded.aff["agility"] ?? 0) * 0.3; loaded.agiFix = true; dirty.current = true; }
        ref.current = loaded; loaded.notes = []; setS(loaded);
      }
      else setNeedChar({ hadOld: !!loaded });
    });
    return () => { alive = false; };
  }, [userId]);

  const save = useCallback(async () => {
    if (!ref.current) return;
    setSaving("Saving…");
    const { error } = await supabase.from("game_saves").upsert({ user_id: userId, data: JSON.parse(JSON.stringify({ ...ref.current, notes: [] })), updated_at: new Date().toISOString() });
    dirty.current = !!error;
    setSaving(error ? "Save failed — will retry" : `Saved ${new Date().toLocaleTimeString()}`);
  }, [userId]);

  useEffect(() => {
    const id = setInterval(() => { if (dirty.current) void save(); }, 12000);
    const pt = setInterval(() => { if (ref.current && document.visibilityState === "visible") { ref.current.playTime += 5; dirty.current = true; } }, 5000);
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

  const blocked = () => { const c = ref.current; return !c || !!c.combat || !!c.result || !!c.pendingEvo; };

  // ---- core move ----
  const move = useCallback((dx: number, dy: number) => {
    if (blocked() || panel) return;
    const open = act<{ t: PanelT; x?: number; y?: number } | null>((n) => {
      const tx = n.pos.x + dx, ty = n.pos.y + dy;
      if (n.loc === "village") {
        const t = villageTile(tx, ty);
        if (WALKABLE_V.has(t)) {
          n.pos = { x: tx, y: ty }; n.step++; addXp(n, "mobility", 0.5);
          const p = playerStats(n); n.sta = Math.min(p.sta, n.sta + 1); if (n.hp < p.hp) n.hp = Math.min(p.hp, n.hp + 1);
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
      } else { n.pos = { x: tx, y: ty }; n.step++; addXp(n, "mobility", 0.5); }
      const attacker = moveMonsters(n);
      if (attacker) startCombat(n, attacker);
      return null;
    });
    if (open?.x === -1) {
      if (!getConfirm() || confirm("Take the stairs? This clears the floor and returns you to the village.")) act(clearFloor);
    } else if (open) setPanel(open);
  }, [act, panel]);
  const confirmRef = useRef(st.confirmNextFloor); confirmRef.current = st.confirmNextFloor;
  const getConfirm = () => confirmRef.current;

  function interactVillage(n: GameState, tx: number, ty: number): { t: PanelT; x?: number; y?: number } | null {
    const t = villageTile(tx, ty);
    if (STATIONS[t]) return { t: STATIONS[t]! };
    if (t === "G") return { t: "plot" };
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
      if (STATIONS[t]) { setPanel({ t: STATIONS[t]! }); sfx("ui"); return; }
      if (t === "G") { setPanel({ t: "plot" }); sfx("ui"); return; }
      if (WALKABLE_V.has(t)) { walkTo(x, y, null); return; }
      if (t === "#") return;
      if (near === 1) { const o = act((n) => interactVillage(n, x, y)); if (o) setPanel(o); return; }
      // walk to adjacent tile, then interact
      walkTo(x, y, () => { const o = act((n) => interactVillage(n, x, y)); if (o) setPanel(o); }, true);
      return;
    }
    if (near === 1) { move(x - c.pos.x, y - c.pos.y); return; }
    const d = c.dungeon!; const t = d.tiles[y]?.[x];
    const target = d.monsters.some((m) => m.x === x && m.y === y) || t === "V" || t === ">";
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
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x, dy = ev.clientY - start.y; const dist = Math.hypot(dx, dy);
      if (dist > 18 || (start.moved && dist > 8)) {
        start.moved = true;
        const cl = Math.min(dist, 44); setStick({ ox: start.ox, oy: start.oy, dx: (dx / dist) * cl, dy: (dy / dist) * cl });
        const nd: [number, number] = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
        const od = joy.current.dir;
        joy.current.dir = nd;
        // step immediately on a new direction so short flicks and bumps register on the first try
        if (!od || od[0] !== nd[0] || od[1] !== nd[1]) { pathRef.current = []; joy.current.last = Date.now(); move(nd[0], nd[1]); }
      }
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); window.removeEventListener("pointercancel", onUp);
      joy.current.dir = null; setStick(null);
      if (!start.moved) {
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
      if (d[k] && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); move(...d[k]!); }
      if (k === "escape") setPanel(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);

  if (needChar) return <CreateCharacter hadOld={needChar.hadOld} onDone={(c) => { const g = newGame(c); ref.current = g; dirty.current = true; setS(g); setNeedChar(null); setTimeout(() => void save(), 50); }} />;
  if (!s) return <div className="flex min-h-dvh items-center justify-center font-display text-primary">Loading your adventure…</div>;

  const p = playerStats(s);
  const inV = s.loc === "village";
  const W = inV ? 20 : s.dungeon!.w, H = inV ? 15 : s.dungeon!.h;
  const cx = Math.max(0, Math.min(W - VW, s.pos.x - Math.floor(VW / 2)));
  const cy = Math.max(0, Math.min(H - VH, s.pos.y - Math.floor(VH / 2)));
  const avatar = <Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} />;
  const cells = [];
  for (let y = cy; y < cy + VH; y++) for (let x = cx; x < cx + VW; x++) cells.push(renderTile(s, x, y, avatar));
  const close = () => setPanel(null);

  return (
    <div className="mx-auto flex h-dvh max-w-lg flex-col gap-1.5 p-1.5" onPointerDown={unlockAudio}>
      <header className="pixel-panel p-1.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <button className="flex min-w-0 items-center gap-1 text-left" onClick={() => setPanel({ t: "profile" })}>
            <span className="h-9 w-9 shrink-0"><Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} /></span>
            <span className="min-w-0"><span className="block truncate text-sm text-primary">{s.char.name} · Lv {p.level}</span><span className="block truncate text-xs text-muted-foreground">{s.className}</span></span>
          </button>
          <div className="text-right text-xs"><div className="text-gold">💰 {fmt(s.gold)}</div><div className="text-muted-foreground">{inV ? "Thornvale" : `Floor ${s.dungeon!.floor}`} · best {s.maxFloor}</div></div>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-1 text-[0.7rem]">
          <MiniBar cls="bar-hp" v={s.hp} max={p.hp} label="HP" /><MiniBar cls="bar-mp" v={s.mp} max={p.mp} label="MP" /><MiniBar cls="bar-sta" v={s.sta} max={p.sta} label="STA" />
        </div>
      </header>

      {s.won && <div className="pixel-panel p-1 text-center font-display text-gold title-glow">👑 Tower Conqueror 👑</div>}

      <div className="relative min-h-0 flex-1">
        <div className="map-wrap touch-none select-none" onPointerDown={onDown}>
          <div className="map-grid" style={{ gridTemplateColumns: `repeat(${VW}, 1fr)` }}>{cells}</div>
          {stick && <div className="joy-base" style={{ left: stick.ox - 50, top: stick.oy - 50 }}><div className="joy-knob" style={{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }} /></div>}
          {!stick && <div className="joy-hint">Drag to walk · tap to interact</div>}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1 z-30 flex flex-col items-center gap-1">
          {toasts.map((t) => <div key={t.id} className="pixel-panel toast px-2 py-1 text-sm">{t.t}</div>)}
        </div>
      </div>

      <div className="pixel-panel h-[3.2rem] overflow-hidden px-2 py-0.5 text-sm leading-tight">
        {s.log.slice(0, 2).map((l, i) => <div key={i} className={`truncate ${i ? "text-muted-foreground" : ""}`}>{l}</div>)}
      </div>

      <nav className="grid grid-cols-5 gap-1">
        <NavBtn icon="🎒" label="Bag" onClick={() => setPanel({ t: "bag" })} />
        <NavBtn icon="👤" label="Profile" onClick={() => setPanel({ t: "profile" })} />
        {inV ? <NavBtn icon="⚒️" label="Forge" onClick={() => setPanel({ t: "forge" })} /> : <NavBtn icon="🍖" label="Eat" onClick={() => setPanel({ t: "bag" })} />}
        {inV ? <NavBtn icon="🗼" label="Tower" onClick={() => setPanel({ t: "tower" })} />
          : <NavBtn icon="🏃" label="Retreat" danger onClick={() => { if (confirm("Retreat to the village? You keep your loot but the floor stays uncleared.")) act((n) => { leaveDungeon(n, true); log(n, "🏃 You retreat with your loot."); }); }} />}
        <NavBtn icon="⚙️" label="Settings" onClick={() => setPanel({ t: "settings" })} />
      </nav>

      {panel?.t === "forge" && <ForgePanel s={s} onClose={close} onCraft={(m, sl) => { const g = act((n) => craftGear(n, m, sl)); sfx(g ? "loot" : "fail"); }}
        onEnhance={(id) => act((n) => enhance(n, id))} onRepair={(id) => act((n) => repair(n, id))} onUpgrade={() => act(upgradeForge)} />}
      {panel?.t === "bag" && <BagPanel s={s} onClose={close} onEat={(i) => act((n) => { eatFood(n, i); })} onEquip={(id) => act((n) => equipGear(n, id))} onSell={(id) => { act((n) => sellGear(n, id)); sfx("coin"); }} />}
      {panel?.t === "profile" && <ProfilePanel s={s} onClose={close} onTitle={(t) => act((n) => { n.title = t; })} onEquip={(id) => act((n) => equipGear(n, id))} />}
      {panel?.t === "settings" && <SettingsPanel onClose={close} />}
      {panel?.t === "kitchen" && <KitchenPanel s={s} onClose={close} onCook={(m) => act((n) => cook(n, m))} />}
      {(panel?.t === "carve" || panel?.t === "smelt") && <RefinePanel s={s} station={panel.t} onClose={close} onRefine={(id, k) => act((n) => refine(n, id, k, panel.t as "carve" | "smelt"))} />}
      {panel?.t === "plot" && <PlotPanel s={s} onClose={close} onPlant={(cells, seed) => act((n) => { for (const [x, y] of cells) { if (!n.inv[seed]) break; if (!n.village.plots[key(x, y)]) plant(n, x, y, seed); } })}
        onHarvest={(cells) => { act((n) => { for (const [x, y] of cells) { harvest(n, x, y); n.step++; } }); sfx("loot"); }} />}
      {panel?.t === "tower" && <TowerPanel s={s} onClose={close} onEnter={(f) => { act((n) => enterDungeon(n, f)); close(); }} />}
      {panel?.t === "house" && <HousePanel s={s} saving={saving} onClose={close} onRest={() => act(restAtHome)} onSave={() => void save()} onSignOut={async () => { await save(); await supabase.auth.signOut(); }} />}
      {panel?.t === "shop" && <ShopPanel s={s} onClose={close} onBuy={(i) => act((n) => buyShop(n, i))} onSell={(id, q) => { act((n) => sellMat(n, id, q)); sfx("coin"); }} />}
      {panel?.t === "market" && <MarketPanel s={s} onClose={close} onBuy={(i) => act((n) => marketBuy(n, i))} onSell={(id, q, m) => { act((n) => sellMat(n, id, q, m)); sfx("coin"); }} />}
      {panel?.t === "tavern" && <TavernPanel s={s} onClose={close} onClaim={(id) => { act((n) => claimQuest(n, id)); sfx("coin"); }} onReroll={() => act((n) => { if (spend(n, 20)) rerollQuests(n); })} />}
      {panel?.t === "casino" && <CasinoPanel s={s} onClose={close} onDice={(b, h) => act((n) => { playDice(n, b, h); })} onSlots={(b) => act((n) => { playSlots(n, b); })}
        onHL={(b, cur, hi) => act((n) => playHighLow(n, b, cur, hi)?.next ?? null)} onToken={(i) => act((n) => buyToken(n, i))} />}
      {panel?.t === "warehouse" && <WarehousePanel s={s} onClose={close}
        onStoreGear={(id) => act((n) => { const g = n.gear.find((x) => x.id === id); if (g) { n.gear = n.gear.filter((x) => x.id !== id); n.whGear.push(g); } })}
        onTakeGear={(id) => act((n) => { const g = n.whGear.find((x) => x.id === id); if (g) { n.whGear = n.whGear.filter((x) => x.id !== id); n.gear.push(g); } })}
        onStoreAll={() => act((n) => { for (const [id, q] of Object.entries(n.inv)) { n.wh[id] = (n.wh[id] ?? 0) + q; } n.inv = {}; })}
        onTake={(id) => act((n) => { const q = n.wh[id] ?? 0; if (takeMat(n, id, q, "wh")) addMat(n, id, q); })} />}

      {s.combat && <CombatView s={s} onAct={(a: CombatAct) => { const r = act((n) => combatTurn(n, a)); sfx(r === "lose" ? "fail" : r === "win" ? "level" : "hit"); }} />}
      {s.result && <ResultView s={s} onCollect={() => { act(collectLoot); sfx("loot"); }} onContinue={() => act((n) => { n.result = undefined; clampVitals(n); })} />}
      {s.pendingEvo && <EvoModal evo={s.pendingEvo} onOk={() => act((n) => { n.pendingEvo = undefined; })} />}
    </div>
  );
}

function NavBtn({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return <button className={`pixel-btn flex min-h-14 flex-col items-center justify-center py-1 ${danger ? "pixel-btn-danger" : ""}`} onClick={() => { sfx("ui"); onClick(); }}><span className="text-xl leading-none">{icon}</span><span className="text-[0.62rem]">{label}</span></button>;
}
function MiniBar({ cls, v, max, label }: { cls: string; v: number; max: number; label: string }) {
  return <div><div className={`bar ${cls}`}><div style={{ width: `${Math.max(0, (v / max) * 100)}%` }} /></div><div className="text-center text-muted-foreground">{label} {fmt(Math.max(0, v))}/{fmt(max)}</div></div>;
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

const DECO_SPOTS: [number, number][] = [];
VILLAGE.forEach((r, y) => [...r].forEach((c, x) => { if (c === "o") DECO_SPOTS.push([x, y]); }));

function renderTile(s: GameState, x: number, y: number, avatar: React.ReactNode) {
  const k = `${x},${y}`;
  const isP = s.pos.x === x && s.pos.y === y;
  let cls = "tile-grass", glyph = "", dim = false, boss = false, label = "";
  if (s.loc === "village") {
    const t = VILLAGE[y]?.[x] ?? "#";
    const depleted = (s.village.nodes[k] ?? 0) > s.step;
    cls = (x + y) % 2 ? "tile-grass" : "tile-grass-2";
    if (t === "#") cls = "tile-fence";
    else if (t === ",") cls = "tile-path";
    else if (t === "o") { const i = DECO_SPOTS.findIndex(([a, b]) => a === x && b === y); glyph = s.decos[i] ?? ""; }
    else if (TREES[t]) { glyph = TREES[t]!.icon; dim = depleted; cls += " tap"; }
    else if (t === "R") { glyph = "🪨"; dim = depleted; cls += " tap"; }
    else if (t === "F") { glyph = "🌼"; dim = depleted; cls += " tap"; }
    else if (t === "W") { cls = "tile-water tap"; glyph = depleted ? "" : (x * 7 + y * 3) % 5 === 0 ? "🐟" : ""; }
    else if (t === "G") { cls = "tile-soil tap"; const p = s.village.plots[k]; glyph = p ? (p.readyAt <= s.step ? getMat(p.crop).icon : "🌱") : ""; }
    else if (ANIMALS[t]) { glyph = ANIMALS[t]!.icon; dim = (s.village.animals[k] ?? 0) > s.step; cls += " tap"; }
    else if (BUILDINGS[t]) { cls = "tile-station tap"; glyph = BUILDINGS[t]!.icon; label = BUILDINGS[t]!.name; }
  } else {
    const d = s.dungeon!;
    const t = d.tiles[y]?.[x] ?? "#";
    cls = t === "#" ? "tile-wall" : (x + y) % 2 ? "tile-floor" : "tile-floor-2";
    if (t === "V") glyph = "💎";
    if (t === "$") glyph = "🧰";
    if (t === ">") glyph = d.bossAlive ? "🔒" : "🪜";
    const m = d.monsters.find((mm) => mm.x === x && mm.y === y);
    if (m) { glyph = m.icon; boss = m.boss > 0 || !!m.affix; }
  }
  return (
    <div key={k} data-x={x} data-y={y} className={`tile ${cls}`}>
      {isP ? <span className="tile-player h-[90%] w-[90%]">{avatar}</span> : glyph && <span className={`${dim ? "tile-dim" : ""} ${boss ? "tile-boss" : ""}`}>{glyph}</span>}
      {label && <span className="tile-label">{label}</span>}
    </div>
  );
}
