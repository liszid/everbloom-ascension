import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ANIMALS, ELEMENT_ICON, TREES, getMat } from "./data";
import {
  addXp, clearFloor, combatMon, combatTurn, cook, craftGear, enterDungeon, gather, harvest, leaveDungeon, log,
  mineVein, moveMonsters, newGame, plant, playerStats, refine, restAtHome, startCombat, villageTile, VILLAGE,
  type CombatAct, type GameState,
} from "./engine";
import { BagPanel, ForgePanel, GearPanel, HousePanel, KitchenPanel, PlotPanel, RefinePanel, Sheet, SkillsPanel, TowerPanel, fmt } from "./Panels";

type PanelType = "forge" | "kitchen" | "carve" | "smelt" | "plot" | "house" | "tower" | "bag" | "skills" | "gear" | "eat";
const STATIONS: Record<string, PanelType> = { H: "house", K: "kitchen", A: "forge", C: "carve", U: "smelt", D: "tower" };
const STATION_ICON: Record<string, string> = { H: "🏠", K: "🍳", A: "⚒️", C: "🪚", U: "🔥", D: "🗼" };
const VW = 11, VH = 11;

export function Game({ userId }: { userId: string }) {
  const [s, setS] = useState<GameState | null>(null);
  const ref = useRef<GameState | null>(null);
  const dirty = useRef(false);
  const [panel, setPanel] = useState<{ t: PanelType; x?: number; y?: number } | null>(null);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    let alive = true;
    supabase.from("game_saves").select("data").eq("user_id", userId).maybeSingle().then(({ data }) => {
      if (!alive) return;
      const loaded = data?.data as unknown as GameState | undefined;
      const g = loaded && loaded.v === 1 ? { ...newGame(), ...loaded } : newGame();
      ref.current = g; setS(g); dirty.current = !loaded;
    });
    return () => { alive = false; };
  }, [userId]);

  const save = useCallback(async () => {
    if (!ref.current) return;
    setSaving("Saving…");
    const { error } = await supabase.from("game_saves").upsert({ user_id: userId, data: JSON.parse(JSON.stringify(ref.current)), updated_at: new Date().toISOString() });
    dirty.current = !!error;
    setSaving(error ? "Save failed — will retry" : `Saved ${new Date().toLocaleTimeString()}`);
  }, [userId]);

  useEffect(() => {
    const id = setInterval(() => { if (dirty.current) void save(); }, 12000);
    const vis = () => { if (document.visibilityState === "hidden" && dirty.current) void save(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [save]);

  const act = useCallback(<R,>(fn: (n: GameState) => R): R => {
    const n = structuredClone(ref.current!) as GameState;
    const r = fn(n);
    const locChanged = n.loc !== ref.current!.loc;
    ref.current = n; dirty.current = true; setS(n);
    if (locChanged) setTimeout(() => void save(), 50);
    return r;
  }, [save]);

  const move = useCallback((dx: number, dy: number) => {
    const cur = ref.current;
    if (!cur || cur.combat || panel) return;
    const open = act<{ t: PanelType; x?: number; y?: number } | null>((n) => {
      const tx = n.pos.x + dx, ty = n.pos.y + dy;
      const max = playerStats(n).maxHp;
      if (n.loc === "village") {
        const t = villageTile(tx, ty);
        if (t === "." || t === ",") {
          n.pos = { x: tx, y: ty }; n.step++; addXp(n, "movement", 1);
          if (n.hp < max) n.hp = Math.min(max, n.hp + 1);
          return null;
        }
        if (STATIONS[t]) return { t: STATIONS[t]! };
        if (t === "G") {
          const p = n.village.plots[`${tx},${ty}`];
          if (p && p.readyAt <= n.step) { harvest(n, tx, ty); n.step++; return null; }
          if (p) { log(n, `🌱 ${getMat(p.crop).name} ready in ${p.readyAt - n.step} steps.`); return null; }
          return { t: "plot", x: tx, y: ty };
        }
        const msg = gather(n, tx, ty);
        if (msg) { log(n, msg); n.step++; }
        return null;
      }
      const d = n.dungeon!;
      const mon = d.monsters.find((m) => m.x === tx && m.y === ty);
      if (mon) { startCombat(n, mon); return null; }
      const t = d.tiles[ty]?.[tx];
      if (!t || t === "#") return null;
      if (t === "V") { mineVein(n, tx, ty); n.step++; }
      else if (t === ">") {
        if (d.bossAlive) { log(n, "🔒 The Guardian must fall before the stairs open!"); return null; }
        clearFloor(n); return null;
      } else { n.pos = { x: tx, y: ty }; n.step++; addXp(n, "movement", 1); }
      const p = playerStats(n);
      if (p.traits.regen) n.hp = Math.min(p.maxHp, n.hp + Math.ceil(p.maxHp * 0.01 * p.traits.regen));
      const attacker = moveMonsters(n);
      if (attacker) startCombat(n, attacker);
      return null;
    });
    if (open) setPanel(open);
  }, [act, panel]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const d: Record<string, [number, number]> = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
      if (d[k]) { e.preventDefault(); move(...d[k]!); }
      if (k === "escape") setPanel(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);

  if (!s) return <div className="flex min-h-screen items-center justify-center font-display text-primary">Loading your adventure…</div>;

  const p = playerStats(s);
  const inV = s.loc === "village";
  const W = inV ? 20 : s.dungeon!.w, H = inV ? 15 : s.dungeon!.h;
  const cx = Math.max(0, Math.min(W - VW, s.pos.x - Math.floor(VW / 2)));
  const cy = Math.max(0, Math.min(H - VH, s.pos.y - Math.floor(VH / 2)));
  const cells = [];
  for (let y = cy; y < cy + VH; y++) for (let x = cx; x < cx + VW; x++) cells.push(renderTile(s, x, y));
  const close = () => setPanel(null);
  const mon = combatMon(s);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-2 p-2">
      <header className="pixel-panel p-2">
        <div className="flex items-center justify-between">
          <h1 className="text-sm text-primary">{inV ? "Thornvale Village" : `Tower · Floor ${s.dungeon!.floor}`}</h1>
          <span className="text-sm text-muted-foreground">Best {s.maxFloor}/1000</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm">❤️</span>
          <div className="bar bar-hp flex-1"><div style={{ width: `${(s.hp / p.maxHp) * 100}%` }} /></div>
          <span className="w-20 text-right text-sm">{s.hp}/{p.maxHp}</span>
        </div>
        <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
          <span>⚔️ {fmt(p.atk)}</span><span>🛡️ {fmt(p.def)}</span>{p.elements.length > 0 && <span>{p.elements.map((e) => ELEMENT_ICON[e]).join("")}</span>}
          {!inV && <span>👜 {Object.values(s.bag).reduce((a, b) => a + b, 0)}</span>}
        </div>
      </header>

      {s.won && <div className="pixel-panel p-2 text-center font-display text-gold title-glow">👑 You conquered the Tower! 👑</div>}

      <div className="map-grid" style={{ gridTemplateColumns: `repeat(${VW}, 1fr)` }}>{cells}</div>

      <div className="pixel-panel min-h-[4.2rem] px-2 py-1 text-base leading-tight">
        {s.log.slice(0, 3).map((l, i) => <div key={i} className={i ? "text-muted-foreground" : ""}>{l}</div>)}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-3 gap-1">
          <span /><button aria-label="Up" className="pixel-btn h-12 w-12 text-lg" onClick={() => move(0, -1)}>▲</button><span />
          <button aria-label="Left" className="pixel-btn h-12 w-12 text-lg" onClick={() => move(-1, 0)}>◀</button>
          <span className="flex items-center justify-center text-muted-foreground">✦</span>
          <button aria-label="Right" className="pixel-btn h-12 w-12 text-lg" onClick={() => move(1, 0)}>▶</button>
          <span /><button aria-label="Down" className="pixel-btn h-12 w-12 text-lg" onClick={() => move(0, 1)}>▼</button><span />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1">
          <button className="pixel-btn py-3" onClick={() => setPanel({ t: "bag" })}>👜 Bag</button>
          <button className="pixel-btn py-3" onClick={() => setPanel({ t: "gear" })}>🎒 Gear</button>
          <button className="pixel-btn py-3" onClick={() => setPanel({ t: "skills" })}>📜 Skills</button>
          {inV ? <button className="pixel-btn py-3" onClick={() => setPanel({ t: "eat" })}>🍖 Eat</button>
            : <button className="pixel-btn pixel-btn-danger py-3" onClick={() => act((n) => { leaveDungeon(n, true); log(n, "🏃 You retreat to the village with your loot."); })}>🏃 Retreat</button>}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">Walk into trees, rocks, flowers, water, animals and buildings to use them.</p>

      {panel?.t === "forge" && <ForgePanel s={s} onClose={close} onCraft={(m, sl, w) => act((n) => craftGear(n, m, sl, w))} />}
      {panel?.t === "gear" && <GearPanel s={s} onClose={close}
        onEquip={(g) => act((n) => { n.equip[g.slot] = n.equip[g.slot] === g.id ? undefined : g.id; n.hp = Math.min(n.hp, playerStats(n).maxHp); })}
        onScrap={(g) => act((n) => { n.gear = n.gear.filter((x) => x.id !== g.id); log(n, `🗑️ Scrapped ${g.name}`); })} />}
      {panel?.t === "bag" && <BagPanel s={s} onClose={close} />}
      {panel?.t === "skills" && <SkillsPanel s={s} onClose={close} />}
      {panel?.t === "kitchen" && <KitchenPanel s={s} onClose={close} onCook={(m) => act((n) => cook(n, m))} />}
      {(panel?.t === "carve" || panel?.t === "smelt") && <RefinePanel s={s} station={panel.t} onClose={close} onRefine={(id, k) => act((n) => refine(n, id, k, panel.t as "carve" | "smelt"))} />}
      {panel?.t === "plot" && <PlotPanel s={s} onClose={close} onPlant={(seed) => { act((n) => plant(n, panel.x!, panel.y!, seed)); close(); }} />}
      {panel?.t === "tower" && <TowerPanel s={s} onClose={close} onEnter={(f) => { act((n) => enterDungeon(n, f)); close(); }} />}
      {panel?.t === "house" && <HousePanel s={s} saving={saving} onClose={close} onRest={() => act(restAtHome)} onSave={() => void save()}
        onSignOut={async () => { await save(); await supabase.auth.signOut(); }} />}
      {panel?.t === "eat" && (
        <Sheet title="🍖 Eat" onClose={close}>
          {!s.foods.length && <p className="text-muted-foreground">No meals. Cook at the kitchen 🍳.</p>}
          {s.foods.map((f, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 py-1">
              <span>{f.icon} {f.name} ×{f.qty} (+{f.heal})</span>
              <button className="pixel-btn pixel-btn-primary" disabled={s.hp >= p.maxHp} onClick={() => act((n) => {
                const fd = n.foods[i]!; n.hp = Math.min(playerStats(n).maxHp, n.hp + fd.heal); fd.qty--; if (fd.qty <= 0) n.foods.splice(i, 1);
              })}>Eat</button>
            </div>
          ))}
        </Sheet>
      )}

      {s.combat && mon && <CombatView s={s} onAct={(a) => act((n) => combatTurn(n, a))} />}
    </div>
  );
}

function CombatView({ s, onAct }: { s: GameState; onAct: (a: CombatAct) => void }) {
  const m = combatMon(s)!;
  const p = playerStats(s);
  const [eating, setEating] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-3">
      <div className="pixel-panel w-full max-w-md p-3">
        <div className="text-center">
          <div className={`text-6xl ${m.boss ? "tile-boss" : ""}`}>{m.icon}</div>
          <h2 className="mt-1 text-lg text-accent">{m.name}</h2>
          <div className="text-sm text-muted-foreground">Floor {s.dungeon!.floor} · Weak to {ELEMENT_ICON[m.weak]} {m.weak}</div>
          <div className="bar bar-hp mt-1"><div style={{ width: `${Math.max(0, (m.hp / m.maxHp) * 100)}%` }} /></div>
          <div className="text-sm">{Math.max(0, Math.round(m.hp))}/{m.maxHp}</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span>🧙</span><div className="bar bar-hp flex-1"><div style={{ width: `${(s.hp / p.maxHp) * 100}%` }} /></div><span className="text-sm">{s.hp}/{p.maxHp}</span>
        </div>
        <div className="mt-2 h-32 overflow-hidden text-base leading-tight">
          {s.combat!.log.map((l, i) => <div key={i} className={i ? "text-muted-foreground" : ""}>{l}</div>)}
        </div>
        {eating ? (
          <div className="mt-2 space-y-1">
            {s.foods.map((f, i) => <button key={i} className="pixel-btn w-full text-left" onClick={() => { onAct({ eat: i }); setEating(false); }}>{f.icon} {f.name} ×{f.qty} (+{f.heal})</button>)}
            {!s.foods.length && <p className="text-muted-foreground">No food!</p>}
            <button className="pixel-btn w-full" onClick={() => setEating(false)}>Back</button>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="pixel-btn pixel-btn-primary py-3" onClick={() => onAct("attack")}>⚔️ Attack</button>
            <button className="pixel-btn py-3" onClick={() => onAct("defend")}>🛡️ Defend</button>
            <button className="pixel-btn py-3" onClick={() => setEating(true)}>🍖 Eat</button>
            <button className="pixel-btn py-3" onClick={() => onAct("flee")}>🏃 Flee</button>
          </div>
        )}
      </div>
    </div>
  );
}

function renderTile(s: GameState, x: number, y: number) {
  const k = `${x},${y}`;
  const isP = s.pos.x === x && s.pos.y === y;
  let cls = "tile-grass", glyph = "", dim = false, boss = false;
  if (s.loc === "village") {
    const t = VILLAGE[y]?.[x] ?? "#";
    const alt = (x + y) % 2 ? "tile-grass" : "tile-grass-2";
    const depleted = (s.village.nodes[k] ?? 0) > s.step;
    cls = alt;
    if (t === "#") cls = "tile-fence";
    else if (t === ",") cls = "tile-path";
    else if (TREES[t]) { glyph = TREES[t]!.icon; dim = depleted; }
    else if (t === "R") { glyph = "🪨"; dim = depleted; }
    else if (t === "F") { glyph = "🌼"; dim = depleted; }
    else if (t === "W") { cls = "tile-water"; glyph = depleted ? "" : (x * 7 + y * 3) % 5 === 0 ? "🐟" : ""; }
    else if (t === "G") {
      cls = "tile-soil";
      const p = s.village.plots[k];
      glyph = p ? (p.readyAt <= s.step ? getMat(p.crop).icon : "🌱") : "";
    } else if (ANIMALS[t]) { glyph = ANIMALS[t]!.icon; dim = (s.village.animals[k] ?? 0) > s.step; }
    else if (STATION_ICON[t]) { cls = "tile-station"; glyph = STATION_ICON[t]!; }
  } else {
    const d = s.dungeon!;
    const t = d.tiles[y]?.[x] ?? "#";
    cls = t === "#" ? "tile-wall" : (x + y) % 2 ? "tile-floor" : "tile-floor-2";
    if (t === "V") glyph = "💎";
    if (t === ">") glyph = d.bossAlive ? "🔒" : "🪜";
    const m = d.monsters.find((mm) => mm.x === x && mm.y === y);
    if (m) { glyph = m.icon; boss = m.boss; }
  }
  return (
    <div key={k} className={`tile ${cls}`}>
      {isP ? <span className="tile-player">🧙</span> : glyph && <span className={`${dim ? "tile-dim" : ""} ${boss ? "tile-boss" : ""}`}>{glyph}</span>}
    </div>
  );
}
