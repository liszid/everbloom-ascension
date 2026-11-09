import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ELEMENT_ICON, GRADES, PCT_STATS, PROPS, PROP_LABEL, SLOTS, SLOT_INFO, STAT_KEYS, STAT_LABEL, getMat,
  type Slot, type Stats,
} from "./data";
import {
  EFFECT_INFO, GEAR_CAP, computeClass, VILLAGE, key, SHOP_ITEMS, TOKEN_SHOP, cookPreview, craftPreview, enhanceChance, enhanceCost, floorTier,
  forgeUpgradeCost, gearStats, gearValue, lvl, marketOffers, maxBet, questProgress, repairCost, sellPrice, sellableList,
  type GameState, type Gear,
  bldgLvl, storageUsed, storageMax,
} from "./engine";
import { restPct } from "./items";
import { useGameConfirm } from "./Confirm";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";
import { Guide } from "./Guide";
import { useSettings, updateSettings, type Settings, type Speed } from "./settings";

export const fmt = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)}B`; if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e4) return `${(n / 1e3).toFixed(1)}k`; if (a >= 100) return Math.round(n).toString();
  return (Math.round(n * 10) / 10).toString();
};

// Building windows show an interior scene (keeper NPC) above their content.
export const SceneCtx = createContext<ReactNode>(null);
export function Sheet({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const scene = useContext(SceneCtx);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 sm:items-center" onClick={onClose}>
      <div className={`game-sheet pixel-panel flex max-h-[94dvh] w-full ${wide ? "max-w-2xl" : "max-w-lg"} flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between shrink-0 gap-2 border-b-2 border-border px-3 py-1.5">
          <h2 className="min-w-0 truncate text-base text-primary">{title}</h2>
          <button className="pixel-btn h-10 w-10 shrink-0" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {scene}
        <div className="sheet-content min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">{children}</div>
      </div>
    </div>
  );
}
export function Tabs<T extends string>({ tabs, cur, set }: { tabs: [T, string][]; cur: T; set: (t: T) => void }) {
  return (
    <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
      {tabs.map(([t, l]) => <button key={t} className={`pixel-btn shrink-0 py-2 ${cur === t ? "pixel-btn-active" : ""}`} onClick={() => set(t)}>{l}</button>)}
    </div>
  );
}
export function StatLine({ stats }: { stats: Stats }) {
  return (
    <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
      {STAT_KEYS.filter((k) => Math.abs(stats[k]) > 0.05).map((k) => (
        <span key={k}><span className="text-foreground">{STAT_LABEL[k]}</span> {stats[k] > 0 && PCT_STATS.includes(k) ? "+" : ""}{fmt(stats[k])}</span>
      ))}
    </div>
  );
}
export function GradeTag({ g }: { g: number }) { return <span className={`grade-${g}`}>{GRADES[g]}</span>; }

export function GearCard({ g, actions, equipped }: { g: Gear; actions?: ReactNode; equipped?: boolean }) {
  return (
    <div className={`border-2 p-2 ${equipped ? "border-primary" : "border-border/60"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate"><span className="mr-1">{SLOT_INFO[g.slot].icon}</span><span className={`grade-${g.grade}`}>{g.name}{g.enh ? ` +${g.enh}` : ""}</span> {ELEMENT_ICON[g.element]}</div>
          <div className="text-sm text-muted-foreground"><GradeTag g={g.grade} /> · {SLOT_INFO[g.slot].name} · T{g.avgTier.toFixed(1)} · 🔧 {g.dura}/{g.maxDura}{g.dura <= 0 ? " BROKEN" : ""}</div>
        </div>
        {equipped && <span className="shrink-0 text-xs text-primary">EQUIPPED</span>}
      </div>
      <StatLine stats={gearStats(g)} />
      {g.effects.length > 0 && <div className="text-sm text-accent">{g.effects.map((e) => `${e.id} ${fmt(e.v)}%`).join(" · ")}</div>}
      <div className="text-xs text-muted-foreground">{g.materials.map((m) => `${getMat(m.id).icon}${m.qty}`).join(" ")}</div>
      {actions && <div className="mt-1 flex flex-wrap gap-1">{actions}</div>}
    </div>
  );
}

function MatPicker({ s, sel, setSel, filter }: { s: GameState; sel: Record<string, number>; setSel: (f: (p: Record<string, number>) => Record<string, number>) => void; filter?: (id: string) => boolean }) {
  const ids = Object.keys(s.inv).filter((id) => (s.inv[id] ?? 0) > 0 && (!filter || filter(id))).sort((a, b) => getMat(b).tier - getMat(a).tier);
  if (!ids.length) return <p className="text-muted-foreground">No suitable materials.</p>;
  return (
    <div className="grid grid-cols-1 gap-1">
      {ids.map((id) => {
        const mt = getMat(id); const have = s.inv[id] ?? 0; const q = sel[id] ?? 0;
        return (
          <div key={id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/40 py-1 ${q ? "text-primary" : ""}`}>
            <div className="min-w-0">
              <div className="truncate">{mt.icon} {mt.name} <span className="text-muted-foreground">T{mt.tier} ×{have}</span> {ELEMENT_ICON[mt.element]}</div>
              <div className="truncate text-xs text-muted-foreground">{PROPS.filter((p) => mt.props[p] >= 6).map((p) => PROP_LABEL[p]).join(" · ")}</div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button className="pixel-btn h-9 w-9" disabled={!q} onClick={() => setSel((p) => ({ ...p, [id]: Math.max(0, q - 1) }))}>−</button>
              <span className="w-6 text-center">{q}</span>
              <button className="pixel-btn h-9 w-9" disabled={q >= have} onClick={() => setSel((p) => ({ ...p, [id]: q + 1 }))}>+</button>
              <button className="pixel-btn h-9 px-2" disabled={q >= have} onClick={() => setSel((p) => ({ ...p, [id]: have }))}>All</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ======================= FORGE =======================
export function ForgePanel({ s, onClose, onCraft, onEnhance, onRepair, onUpgrade }: {
  s: GameState; onClose: () => void; onCraft: (m: { id: string; qty: number }[], slot: Slot) => void;
  onEnhance: (id: string) => void; onRepair: (id: string) => void; onUpgrade: () => void;
}) {
  const [tab, setTab] = useState<"craft" | "enh" | "repair" | "forge">("craft");
  const [slot, setSlot] = useState<Slot>("one_hand");
  const [sel, setSel] = useState<Record<string, number>>({});
  const mats = Object.entries(sel).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const pv = useMemo(() => craftPreview(mats, slot, s), [JSON.stringify(mats), slot, s]);
  const fc = forgeUpgradeCost(s.forgeLvl);
  return (
    <Sheet title={`⚒️ Forge · Lv ${s.forgeLvl}`} onClose={onClose}>
      <Tabs tabs={[["craft", "Craft"], ["enh", "Enhance"], ["repair", "Repair"], ["forge", "Upgrade Forge"]]} cur={tab} set={setTab} />
      {tab === "craft" && <>
        <div className="mb-2 grid grid-cols-4 gap-1 sm:grid-cols-6">
          {SLOTS.map((sl) => <button key={sl} className={`pixel-btn flex flex-col items-center py-2 ${slot === sl ? "pixel-btn-active" : ""}`} onClick={() => setSlot(sl)}>
            <span className="text-lg">{SLOT_INFO[sl].icon}</span><span className="text-[0.6rem] leading-tight">{SLOT_INFO[sl].name.replace("-Handed Weapon", "-Hand")}</span></button>)}
        </div>
        <div className="pixel-panel mb-2 p-2">
          {mats.length ? <>
            <div><GradeTag g={pv.grade} /> <span className={`grade-${pv.grade}`}>{pv.name}</span> {ELEMENT_ICON[pv.element]}</div>
            <div className="text-sm text-muted-foreground">{pv.kinds} kinds · {pv.qty} units · avg T{pv.avgTier.toFixed(1)} · 🔧 {pv.maxDura} · ±10% roll</div>
            <StatLine stats={pv.base} />
            {pv.effects.length > 0 && <div className="text-sm text-accent">{pv.effects.map((e) => `${e.id} ${fmt(e.v)}%`).join(" · ")}</div>}
            {pv.cap < 7 && pv.reasons.length > 0 && <div className="text-xs text-muted-foreground">Next grade ({GRADES[pv.cap + 1]}) needs: {pv.reasons.join(", ")}</div>}
            {pv.needMore && <div className="text-xs text-muted-foreground">Add {pv.needMore} to reach {GRADES[pv.cap]}.</div>}
          </> : <p className="text-muted-foreground">Pick any materials — every combination makes a unique item. Higher tiers, more variety and quantity raise the grade.</p>}
          <button className="pixel-btn pixel-btn-primary mt-2 w-full py-3" disabled={!mats.length || s.gear.length >= GEAR_CAP} onClick={() => { onCraft(mats, slot); setSel({}); }}>
            {s.gear.length >= GEAR_CAP ? "Gear bag full" : `Forge ${SLOT_INFO[slot].name}`}
          </button>
        </div>
        <MatPicker s={s} sel={sel} setSel={setSel} filter={(id) => !getMat(id).seedOf} />
      </>}
      {tab === "enh" && <div className="space-y-2">
        {!s.gear.length && <p className="text-muted-foreground">No gear yet.</p>}
        {s.gear.map((g) => { const c = enhanceCost(g); return (
          <GearCard key={g.id} g={g} equipped={Object.values(s.equip).includes(g.id)} actions={<>
            <button className="pixel-btn pixel-btn-primary py-2" disabled={g.enh >= 20 || s.gold < c.gold || (s.inv[c.mat] ?? 0) < c.qty} onClick={() => onEnhance(g.id)}>
              ✨ +{g.enh + 1} · {fmt(c.gold)}g + {getMat(c.mat).icon}{c.qty} ({s.inv[c.mat] ?? 0}) · {Math.round(enhanceChance(s, g) * 100)}%
            </button></>} />); })}
        <p className="text-xs text-muted-foreground">Failure above +5 drops a level; above +10 cracks durability. Every +5 empowers special effects.</p>
      </div>}
      {tab === "repair" && <div className="space-y-2">
        {s.gear.filter((g) => g.dura < g.maxDura).map((g) => <GearCard key={g.id} g={g} actions={<button className="pixel-btn py-2" disabled={s.gold < repairCost(g)} onClick={() => onRepair(g.id)}>🔧 Repair · {fmt(repairCost(g))}g</button>} />)}
        {!s.gear.some((g) => g.dura < g.maxDura) && <p className="text-muted-foreground">All gear is in perfect shape.</p>}
      </div>}
      {tab === "forge" && <div className="space-y-2">
        <p>Forge level gates the highest grade you can craft: <b>Lv {s.forgeLvl}</b> → up to <GradeTag g={Math.min(7, s.forgeLvl)} />.</p>
        {s.forgeLvl < 7 ? <>
          <p className="text-sm text-muted-foreground">Next: {fmt(fc.gold)}g {fc.mats.map(([id, q]) => `· ${getMat(id).icon} ${getMat(id).name} ×${q} (have ${s.inv[id] ?? 0})`).join(" ")}</p>
          <button className="pixel-btn pixel-btn-primary w-full py-3" onClick={onUpgrade}>🔥 Upgrade Forge to Lv {s.forgeLvl + 1}</button>
          <p className="text-xs text-muted-foreground">Guardian Sigils drop from every 10th-floor Guardian; Warden Crests from every 100th-floor Arch-Warden.</p>
        </> : <p className="text-gold">Your forge is legendary. Only EX remains — and it demands an Ancient Schematic.</p>}
      </div>}
    </Sheet>
  );
}

// ======================= BAG =======================
export function BagPanel({ s, onClose, onEat, onEquip, onSell }: { s: GameState; onClose: () => void; onEat: (i: number) => void; onEquip: (id: string) => void; onSell: (id: string) => void }) {
  const [tab, setTab] = useState<"mats" | "gear" | "food">("gear");
  const st = useSettings();
  const inD = s.loc === "dungeon";
  const confirmation = useGameConfirm();
  return (
    <Sheet title={`🎒 Bag · ${s.gold.toLocaleString()}g · 🎟️${s.tokens}`} onClose={onClose}>
      <Tabs tabs={[["gear", `Gear ${s.gear.length}/${GEAR_CAP}`], ["mats", "Materials"], ["food", `Food ${s.foods.reduce((a, f) => a + f.qty, 0)}`]]} cur={tab} set={setTab} />
      {tab === "mats" && <>
        {inD && Object.keys(s.bag).length > 0 && <><h3 className="text-sm text-accent">Expedition loot (lost on death)</h3>
          <div className="mb-2 flex flex-wrap gap-2">{Object.entries(s.bag).map(([id, q]) => <span key={id}>{getMat(id).icon}{q}</span>)}</div></>}
        {Object.keys(s.inv).length === 0 && <p className="text-muted-foreground">Empty.</p>}
        {Object.entries(s.inv).sort((a, b) => getMat(b[0]).tier - getMat(a[0]).tier).map(([id, q]) => { const m = getMat(id); return (
          <details key={id} className="border-b border-border/40 py-1">
            <summary className="cursor-pointer">{m.icon} {m.name} ×{q} <span className="text-sm text-muted-foreground">T{m.tier} {ELEMENT_ICON[m.element]} · {m.src}</span></summary>
            <div className="grid grid-cols-2 gap-x-3 text-sm text-muted-foreground">{PROPS.map((p) => <span key={p}>{PROP_LABEL[p]} <span className="text-foreground">{m.props[p]}</span></span>)}</div>
          </details>); })}
      </>}
      {tab === "gear" && <div className="space-y-2">
        {!s.gear.length && <p className="text-muted-foreground">No gear. Craft some at the Forge ⚒️.</p>}
        {s.gear.slice().sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot)).map((g) => { const eq = s.equip[g.slot] === g.id; return (
          <GearCard key={g.id} g={g} equipped={eq} actions={<>
            <button className={`pixel-btn py-2 ${eq ? "" : "pixel-btn-primary"}`} onClick={() => onEquip(g.id)}>{eq ? "Unequip" : "Equip"}</button>
            {!inD && <button className="pixel-btn pixel-btn-danger py-2" onClick={() => { if (g.grade >= 2 && st.confirmRareSell) confirmation.ask({ title: "Sell rare gear?", text: `Sell ${GRADES[g.grade]} ${g.name} for ${gearValue(g)}g?`, label: "Sell", danger: true, action: () => onSell(g.id) }); else onSell(g.id); }}>Sell {fmt(gearValue(g))}g</button>}
          </>} />); })}
      </div>}
      {tab === "food" && <>
        {!s.foods.length && <p className="text-muted-foreground">No meals. Cook at the Kitchen 🍳 or buy at the Shop.</p>}
        {s.foods.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2 border-b border-border/50 py-1">
            <span className="min-w-0 truncate">{f.icon} {f.name} ×{f.qty} <span className="text-muted-foreground">(+{fmt(f.heal)})</span></span>
            <button className="pixel-btn pixel-btn-primary shrink-0 py-2" onClick={() => onEat(i)}>Eat</button>
          </div>))}
        <p className="mt-1 text-xs text-muted-foreground">A meal heals at most 45% of max HP.</p>
      </>}
    </Sheet>
  );
}

export function KitchenPanel({ s, onClose, onCook }: { s: GameState; onClose: () => void; onCook: (m: { id: string; qty: number }[]) => void }) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const mats = Object.entries(sel).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const pv = cookPreview(mats, s);
  return (
    <Sheet title="🍳 Kitchen" onClose={onClose}>
      <div className="pixel-panel mb-2 p-2">
        {pv.kinds ? <div>{pv.icon} {pv.servings}× {pv.name} · heals {fmt(pv.heal)}</div> : <p className="text-muted-foreground">Combine ingredients. More variety = tastier meals.</p>}
        <button className="pixel-btn pixel-btn-primary mt-2 w-full py-3" disabled={!pv.kinds} onClick={() => { onCook(mats); setSel({}); }}>Cook</button>
      </div>
      <MatPicker s={s} sel={sel} setSel={setSel} filter={(id) => !!getMat(id).food} />
    </Sheet>
  );
}
export function RefinePanel({ s, station, onClose, onRefine }: { s: GameState; station: "carve" | "smelt"; onClose: () => void; onRefine: (id: string, n: number) => void }) {
  const ids = Object.keys(s.inv).filter((id) => getMat(id).refine?.station === station);
  return (
    <Sheet title={station === "carve" ? "🪚 Carpentry" : "🔥 Smelter"} onClose={onClose}>
      <p className="mb-2 text-sm text-muted-foreground">2 raw → 1 refined material (+1 tier).</p>
      {!ids.length && <p className="text-muted-foreground">Nothing to {station === "carve" ? "carve" : "smelt"}.</p>}
      {ids.map((id) => { const m = getMat(id); const to = getMat(m.refine!.to); const n = Math.floor((s.inv[id] ?? 0) / 2); return (
        <div key={id} className="flex items-center justify-between gap-2 border-b border-border/40 py-1">
          <span className="min-w-0 truncate">{m.icon} {m.name} ×{s.inv[id]} → {to.icon} {to.name}</span>
          <span className="flex shrink-0 gap-1"><button className="pixel-btn py-2" disabled={!n} onClick={() => onRefine(id, 1)}>×1</button><button className="pixel-btn py-2" disabled={!n} onClick={() => onRefine(id, n)}>All {n}</button></span>
        </div>); })}
    </Sheet>
  );
}
export function PlotPanel({ s, onClose, onPlant, onHarvest }: { s: GameState; onClose: () => void; onPlant: (cells: [number, number][], seed: string) => void; onHarvest: (cells: [number, number][]) => void }) {
  const seeds = Object.keys(s.inv).filter((id) => getMat(id).seedOf);
  const [seed, setSeed] = useState<string | null>(seeds[0] ?? null);
  const cur = seed && s.inv[seed] ? seed : null;
  const cells: [number, number][] = [];
  VILLAGE.forEach((row, y) => [...row].forEach((c, x) => { if (c === "G") cells.push([x, y]); }));
  const xs = [...new Set(cells.map((c) => c[0]))].sort((a, b) => a - b), ys = [...new Set(cells.map((c) => c[1]))].sort((a, b) => a - b);
  const plot = (x: number, y: number) => s.village.plots[key(x, y)];
  const empty = cells.filter(([x, y]) => !plot(x, y)), ready = cells.filter(([x, y]) => { const p = plot(x, y); return p && p.readyAt <= s.step; });
  return (
    <Sheet title="🌱 Crop Field" onClose={onClose}>
      <p className="mb-1 text-sm text-muted-foreground">Pick a seed, then tap empty soil to plant. Tap ripe crops to harvest.</p>
      {!seeds.length && <p className="text-muted-foreground">No seeds. Pick flowers or visit the Shop.</p>}
      <div className="mb-2 flex flex-wrap gap-1">{seeds.map((id) => <button key={id} className={`pixel-btn px-2 py-2 text-sm ${cur === id ? "pixel-btn-active" : ""}`} onClick={() => setSeed(id)}>{getMat(id).icon} {getMat(id).name} ×{s.inv[id]}</button>)}</div>
      <div className="mx-auto mb-2 grid max-w-xs gap-1" style={{ gridTemplateColumns: `repeat(${xs.length}, 1fr)` }}>
        {ys.flatMap((y) => xs.map((x) => {
          const isG = cells.some((c) => c[0] === x && c[1] === y); const p = plot(x, y);
          if (!isG) return <div key={x + "," + y} />;
          const rdy = p && p.readyAt <= s.step;
          return <button key={x + "," + y} className={`tile tile-soil pixel-btn flex-col p-0 ${rdy ? "pixel-btn-active" : ""}`} disabled={!!p && !rdy || (!p && !cur)}
            onClick={() => (rdy ? onHarvest([[x, y]]) : !p && cur ? onPlant([[x, y]], cur) : undefined)}>
            <span className="text-2xl">{p ? (rdy ? getMat(p.crop).icon : "🌱") : ""}</span>
            {p && !rdy && <span className="text-[0.6rem]">{p.readyAt - s.step}</span>}
          </button>;
        }))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <button className="pixel-btn py-3" disabled={!cur || !empty.length} onClick={() => cur && onPlant(empty, cur)}>Plant all empty ({empty.length})</button>
        <button className="pixel-btn pixel-btn-primary py-3" disabled={!ready.length} onClick={() => onHarvest(ready)}>Harvest all ({ready.length})</button>
      </div>
    </Sheet>
  );
}
export function TowerPanel({ s, onClose, onEnter }: { s: GameState; onClose: () => void; onEnter: (f: number) => void }) {
  const [f, setF] = useState(Math.min(1000, s.maxFloor + 1));
  const next = Math.min(1000, s.maxFloor + 1);
  const kind = (n: number) => (n === 1000 ? "👑 Final Floor" : n % 100 === 0 ? "☠️ Arch-Warden" : n % 10 === 0 ? "💀 Guardian" : "");
  return (
    <Sheet title="🗼 The Tower" onClose={onClose}>
      <p>Highest cleared: <b className="text-primary">{s.maxFloor}</b> / 1000 · Danger tier {floorTier(next)}</p>
      <button className="pixel-btn pixel-btn-primary my-2 w-full py-4 text-base" onClick={() => onEnter(next)}>Climb to Floor {next} {kind(next)}</button>
      {s.maxFloor > 0 && <div className="pixel-panel p-2">
        <p className="text-sm">Revisit a cleared floor to farm materials:</p>
        <div className="my-2 flex items-center gap-1">
          <button className="pixel-btn min-w-11 py-3" aria-label="Down 10 floors" onClick={() => setF(Math.max(1, f - 10))}>−10</button>
          <button className="pixel-btn min-w-11 py-3" aria-label="Down 1 floor" onClick={() => setF(Math.max(1, f - 1))}>−</button>
          <select aria-label="Choose floor" className="pixel-btn min-w-0 flex-1 py-3 text-center" value={f} onChange={(e) => setF(Number(e.target.value))}>
            {Array.from({ length: next }, (_, i) => next - i).map((n) => <option key={n} value={n}>Floor {n}{n % 100 === 0 ? " ☠️" : n % 10 === 0 ? " 💀" : ""}</option>)}
          </select>
          <button className="pixel-btn min-w-11 py-3" aria-label="Up 1 floor" onClick={() => setF(Math.min(next, f + 1))}>+</button>
          <button className="pixel-btn min-w-11 py-3" aria-label="Up 10 floors" onClick={() => setF(Math.min(next, f + 10))}>+10</button>
        </div>
        <button className="pixel-btn w-full py-3" onClick={() => onEnter(f)}>Enter Floor {f} {kind(f)}</button>
      </div>}
      <p className="mt-2 text-xs text-muted-foreground">Monsters grow stronger every floor. HP doesn't regenerate in the Tower and you may eat at most twice per fight. Bosses telegraph heavy blows — Defend!</p>
    </Sheet>
  );
}
export function HousePanel({ s, onClose, onRest }: { s: GameState; onClose: () => void; onRest: () => void }) {
  return (
    <Sheet title="🏠 Home" onClose={onClose}>
      <button className="pixel-btn pixel-btn-primary mb-2 w-full py-3" onClick={onRest}>🛌 Rest (recover {restPct(bldgLvl(s, "house"))}%, time passes)</button>
      {s.decos.length > 0 && <p className="mb-2 text-sm">Village decorations: {s.decos.join(" ")}</p>}
      <p className="text-sm text-muted-foreground">Use the Storage tab to keep items safe and the Kitchen tab to cook. Saving is in Settings.</p>
    </Sheet>
  );
}

// ======================= ECONOMY =======================
export function ShopPanel({ s, onClose, onBuy, onSell }: { s: GameState; onClose: () => void; onBuy: (i: number) => void; onSell: (id: string, q: number) => void }) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  return (
    <Sheet title={`🏪 Shop · ${s.gold.toLocaleString()}g`} onClose={onClose}>
      <Tabs tabs={[["buy", "Buy"], ["sell", "Sell"]]} cur={tab} set={setTab} />
      {tab === "buy" && SHOP_ITEMS.map((it, i) => (
        <div key={it.id} className="shop-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/40 py-2">
          <span className="min-w-0 break-words leading-tight">{it.icon} {it.name}{it.heal ? ` (+${it.heal})` : ""}</span>
          <Button variant="secondary" className="pixel-btn h-11 min-w-16" disabled={s.gold < it.price} onClick={() => onBuy(i)}>{it.price}g</Button>
        </div>))}
      {tab === "sell" && sellableList(s).length === 0 && <p className="py-3 text-sm text-muted-foreground">Nothing to sell.</p>}
      {tab === "sell" && sellableList(s).map((it) => (
        <div key={it.id} className="shop-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/40 py-2">
          <div className="min-w-0 leading-tight"><div className="break-words">{getMat(it.id).icon} {getMat(it.id).name}</div><div className="text-sm text-muted-foreground">T{it.tier} · ×{it.qty}</div></div>
          <span className="flex shrink-0 gap-1"><Button variant="secondary" className="pixel-btn h-11 min-w-16" onClick={() => onSell(it.id, 1)}>{it.price}g</Button><Button variant="secondary" className="pixel-btn h-11" onClick={() => onSell(it.id, it.qty)}>All</Button></span>
        </div>))}
    </Sheet>
  );
}
export function MarketPanel({ s, onClose, onBuy, onSell }: { s: GameState; onClose: () => void; onBuy: (i: number) => void; onSell: (id: string, q: number, mult: number) => void }) {
  const o = marketOffers(s);
  return (
    <Sheet title="⚖️ Market" onClose={onClose}>
      <p className="text-sm text-muted-foreground">Traders rotate stock after every expedition.</p>
      <h3 className="mt-2 text-accent">For sale</h3>
      {o.buy.map((b, i) => { const done = !!s.stats[`mkt:${s.marketSeed}:${i}`]; const price = Math.round(b.price * b.qty); return (
        <div key={i} className="flex items-center justify-between border-b border-border/40 py-1">
          <span>{getMat(b.id).icon} {getMat(b.id).name} ×{b.qty} <span className="text-muted-foreground">T{getMat(b.id).tier}</span></span>
          <button className="pixel-btn py-2" disabled={done || s.gold < price} onClick={() => onBuy(i)}>{done ? "Sold" : `${fmt(price)}g`}</button>
        </div>); })}
      <h3 className="mt-3 text-accent">In demand (premium prices)</h3>
      {o.demand.map((d) => { const q = s.inv[d.id] ?? 0; return (
        <div key={d.id} className="flex items-center justify-between border-b border-border/40 py-1">
          <span>{getMat(d.id).icon} {getMat(d.id).name} ×{d.mult.toFixed(1)} <span className="text-muted-foreground">(have {q})</span></span>
          <button className="pixel-btn py-2" disabled={!q} onClick={() => onSell(d.id, q, d.mult)}>Sell all {fmt(sellPrice(s, d.id) * d.mult * q)}g</button>
        </div>); })}
    </Sheet>
  );
}
export function TavernPanel({ s, onClose, onClaim, onReroll }: { s: GameState; onClose: () => void; onClaim: (id: string) => void; onReroll: () => void }) {
  const rumors = ["They say Guardians wind up before their deadliest blows. Brace yourself.", "A smith told me EX gear needs an Ancient Schematic from the Arch-Wardens.",
    "Mixing many materials gives finer gear — but only high-tier ones break the Legendary ceiling.", "Elves find more loot; dwarves pull more ore. Choose your path wisely.",
    "Neglect your gear and the Tower will outgrow you."];
  return (
    <Sheet title="🍺 Tavern" onClose={onClose}>
      <p className="mb-2 italic text-muted-foreground">“{rumors[s.step % rumors.length]}”</p>
      <h3 className="text-accent">Quest board</h3>
      {s.quests.map((q) => { const p = questProgress(s, q); return (
        <div key={q.id} className="border-b border-border/40 py-2">
          <div>{q.text}</div>
          <div className="bar bar-xp my-1"><div style={{ width: `${(Math.max(0, p) / q.need) * 100}%` }} /></div>
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{Math.max(0, p)}/{q.need} · {fmt(q.gold)}g{q.tokens ? ` · 🎟️${q.tokens}` : ""}</span>
            <button className="pixel-btn pixel-btn-primary py-2" disabled={p < q.need} onClick={() => onClaim(q.id)}>Claim</button></div>
        </div>); })}
      <button className="pixel-btn mt-2 w-full py-2" disabled={s.gold < 20} onClick={onReroll}>New quests (20g)</button>
    </Sheet>
  );
}
export function CasinoPanel({ s, onClose, onDice, onSlots, onHL, onToken }: {
  s: GameState; onClose: () => void; onDice: (b: number, high: boolean) => void; onSlots: (b: number) => void;
  onHL: (b: number, cur: number, higher: boolean) => number | null; onToken: (i: number) => void;
}) {
  const [bet, setBet] = useState(10);
  const [card, setCard] = useState(7);
  const [tab, setTab] = useState<"dice" | "slots" | "cards" | "tokens">("dice");
  const mb = maxBet(s); const b = Math.min(bet, mb, s.gold);
  const left = s.gold > 0;
  return (
    <Sheet title={`🎰 Casino · ${s.gold.toLocaleString()}g · 🎟️${s.tokens}`} onClose={onClose}>
      <p className="text-sm text-muted-foreground">Play as long as your gold lasts. Max bet {fmt(mb)}g. The house always wins in the long run.</p>
      <div className="my-2 flex items-center gap-2"><span>Bet</span>
        <input type="range" min={1} max={Math.max(1, Math.min(mb, s.gold))} value={b} onChange={(e) => setBet(Number(e.target.value))} className="flex-1" />
        <span className="w-16 text-right">{b}g</span></div>
      <Tabs tabs={[["dice", "🎲 Dice"], ["slots", "🎰 Slots"], ["cards", "🃏 High-Low"], ["tokens", "🎟️ Tokens"]]} cur={tab} set={setTab} />
      {tab === "dice" && <div className="grid grid-cols-2 gap-2"><button className="pixel-btn py-4" disabled={!left || b < 1} onClick={() => onDice(b, false)}>Under 7 (×1.9)</button><button className="pixel-btn py-4" disabled={!left || b < 1} onClick={() => onDice(b, true)}>Over 7 (×1.9)</button></div>}
      {tab === "slots" && <button className="pixel-btn pixel-btn-primary w-full py-4" disabled={!left || b < 1} onClick={() => onSlots(b)}>Spin! (🍀🍀🍀 = ×25 + tokens)</button>}
      {tab === "cards" && <div className="text-center">
        <div className="my-2 text-5xl">🂠 {card}</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="pixel-btn py-4" disabled={!left || b < 1} onClick={() => { const n = onHL(b, card, false); if (n) setCard(n); }}>Lower (×1.85)</button>
          <button className="pixel-btn py-4" disabled={!left || b < 1} onClick={() => { const n = onHL(b, card, true); if (n) setCard(n); }}>Higher (×1.85)</button>
        </div></div>}
      {tab === "tokens" && TOKEN_SHOP.map((t, i) => (
        <div key={t.id} className="flex items-center justify-between border-b border-border/40 py-1">
          <span>{getMat(t.id).icon} {getMat(t.id).name}</span>
          <button className="pixel-btn py-2" disabled={s.tokens < t.cost} onClick={() => onToken(i)}>🎟️ {t.cost}</button>
        </div>))}
      <div className="mt-2 text-sm">{s.log[0]}</div>
    </Sheet>
  );
}
export function WarehousePanel({ s, onClose, onStoreGear, onTakeGear, onStoreAll, onTake }: {
  s: GameState; onClose: () => void; onStoreGear: (id: string) => void; onTakeGear: (id: string) => void; onStoreAll: () => void; onTake: (id: string) => void;
}) {
  const [tab, setTab] = useState<"gear" | "mats">("gear");
  const eq = new Set(Object.values(s.equip));
  return (
    <Sheet title="📦 Warehouse" onClose={onClose}>
      <p className="mb-1 text-xs text-muted-foreground">📦 Storage {storageUsed(s)}/{storageMax(s)} slots (each gear piece or material type uses one). Upgrade Home for more.</p>
      <Tabs tabs={[["gear", `Gear (${s.whGear.length})`], ["mats", "Materials"]]} cur={tab} set={setTab} />
      {tab === "gear" && <>
        <h3 className="text-accent">Carried ({s.gear.length}/{GEAR_CAP})</h3>
        {s.gear.filter((g) => !eq.has(g.id)).map((g) => <div key={g.id} className="flex items-center justify-between gap-2 border-b border-border/40 py-1">
          <span className="min-w-0 truncate"><span className={`grade-${g.grade}`}>{g.name}{g.enh ? ` +${g.enh}` : ""}</span> <span className="text-xs text-muted-foreground">{SLOT_INFO[g.slot].name}</span></span>
          <button className="pixel-btn shrink-0 py-2" onClick={() => onStoreGear(g.id)}>Store</button></div>)}
        <h3 className="mt-2 text-accent">Stored</h3>
        {s.whGear.map((g) => <div key={g.id} className="flex items-center justify-between gap-2 border-b border-border/40 py-1">
          <span className="min-w-0 truncate"><span className={`grade-${g.grade}`}>{g.name}{g.enh ? ` +${g.enh}` : ""}</span> <span className="text-xs text-muted-foreground">{SLOT_INFO[g.slot].name}</span></span>
          <button className="pixel-btn shrink-0 py-2" disabled={s.gear.length >= GEAR_CAP} onClick={() => onTakeGear(g.id)}>Take</button></div>)}
      </>}
      {tab === "mats" && <>
        <button className="pixel-btn mb-2 w-full py-2" onClick={onStoreAll}>Store all materials</button>
        {Object.entries(s.wh).map(([id, q]) => <div key={id} className="flex items-center justify-between border-b border-border/40 py-1">
          <span>{getMat(id).icon} {getMat(id).name} ×{q}</span><button className="pixel-btn py-2" onClick={() => onTake(id)}>Take all</button></div>)}
        {!Object.keys(s.wh).length && <p className="text-muted-foreground">Nothing stored.</p>}
      </>}
    </Sheet>
  );
}

// ======================= SETTINGS =======================
export interface CharSlots { list: GameState[]; active: number; max: number; onSwitch: (i: number) => void; onNew: () => void; onDelete: (i: number) => void }
export function SettingsPanel({ onClose, chars, saving, onSave, onSignOut }: { onClose: () => void; chars?: CharSlots; saving?: string; onSave?: () => void; onSignOut?: () => void }) {
  const st = useSettings();
  const [tab, setTab] = useState<"chars" | "display" | "audio" | "game" | "access">(chars ? "chars" : "display");
  const [guide, setGuide] = useState(false);
  const confirmation = useGameConfirm();
  const T = ({ k, label }: { k: keyof Settings; label: string }) => (
    <label className="flex min-h-11 items-center justify-between border-b border-border/40 py-1">
      <span>{label}</span>
      <button role="switch" aria-checked={!!st[k]} className={`pixel-btn w-16 py-2 ${st[k] ? "pixel-btn-primary" : ""}`} onClick={() => updateSettings({ [k]: !st[k] } as Partial<Settings>)}>{st[k] ? "ON" : "OFF"}</button>
    </label>
  );
  const S = ({ k, label, min = 0, max = 100 }: { k: keyof Settings; label: string; min?: number; max?: number }) => (
    <label className="block border-b border-border/40 py-2">
      <div className="flex justify-between"><span>{label}</span><span>{st[k] as number}</span></div>
      <input type="range" min={min} max={max} value={st[k] as number} onChange={(e) => updateSettings({ [k]: Number(e.target.value) } as Partial<Settings>)} className="w-full" />
    </label>
  );
  const Sp = ({ k, label }: { k: "promptSpeed" | "dialogueSpeed" | "combatSpeed"; label: string }) => (
    <div className="border-b border-border/40 py-2"><div>{label}</div>
      <div className="mt-1 grid grid-cols-4 gap-1">{(["slow", "normal", "fast", "instant"] as Speed[]).map((v) =>
        <button key={v} className={`pixel-btn py-2 capitalize ${st[k] === v ? "pixel-btn-active" : ""}`} onClick={() => updateSettings({ [k]: v })}>{v}</button>)}</div></div>
  );
  if (guide) return <Sheet title="📖 Guide" onClose={onClose}><Guide onBack={() => setGuide(false)} /></Sheet>;
  return (
    <Sheet title="⚙️ Settings" onClose={onClose}>
      {onSave && <div className="mb-2 flex items-center gap-2">
        <button className="pixel-btn pixel-btn-primary flex-1 py-3" onClick={onSave}>💾 Save now</button>
        {onSignOut && <button className="pixel-btn pixel-btn-danger py-3" onClick={onSignOut}>Sign out</button>}
      </div>}
      {onSave && <p className="mb-2 text-center text-xs text-muted-foreground">{saving || "Autosaves regularly."}</p>}
      <Tabs tabs={[...(chars ? [["chars", "Characters"] as ["chars", string]] : []), ["display", "Display"], ["audio", "Audio"], ["game", "Gameplay"], ["access", "Accessibility"]]} cur={tab} set={setTab} />
      {tab === "chars" && chars && <>
        <button className="pixel-btn pixel-btn-primary mb-2 w-full py-3" onClick={() => setGuide(true)}>📖 Game Guide — buildings, items & rules</button>
        <p className="py-1 text-sm text-muted-foreground">{chars.list.length}/{chars.max} characters</p>
        {chars.list.map((c, i) => (
          <div key={i} className={`mb-1 flex items-center gap-2 border-2 p-2 ${i === chars.active ? "border-primary" : "border-border"}`}>
            <div className="w-10 shrink-0"><Avatar race={c.char.race} gender={c.char.gender} classId={computeClass(c).id} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-primary">{c.char.name}</div>
              <div className="truncate text-xs text-muted-foreground capitalize">{c.char.race} · {computeClass(c).name} · Best floor {c.maxFloor}</div>
            </div>
            {i === chars.active ? <span className="text-xs text-accent">Playing</span> : <>
              <button className="pixel-btn pixel-btn-primary px-2 py-2" onClick={() => chars.onSwitch(i)}>Play</button>
              <button className="pixel-btn px-2 py-2" aria-label={`Delete ${c.char.name}`} onClick={() => confirmation.ask({ title: "Delete character?", text: `Permanently delete ${c.char.name} and their progress?`, label: "Delete", danger: true, action: () => chars.onDelete(i) })}>🗑️</button>
            </>}
          </div>
        ))}
        <button className="pixel-btn mt-2 w-full py-3" disabled={chars.list.length >= chars.max} onClick={chars.onNew}>{chars.list.length >= chars.max ? "Character slots full" : "＋ Create new character"}</button>
        <p className="pt-1 text-xs text-muted-foreground">Switch away from a character to delete it. Deleting is permanent.</p>
      </>}
      {tab === "display" && <>
        <T k="fullscreen" label="Fullscreen" />
        <S k="resScale" label="Resolution scaling (map) %" min={70} max={130} />
        <T k="shake" label="Screen shake" /><T k="dmgNumbers" label="Damage numbers" /><T k="lootToasts" label="Floating loot notifications" /><T k="detailedLog" label="Detailed combat log" />
        <div className="py-2"><div>UI scale</div><div className="mt-1 grid grid-cols-3 gap-1">{(["small", "medium", "large"] as const).map((v) =>
          <button key={v} className={`pixel-btn py-2 capitalize ${st.uiScale === v ? "pixel-btn-active" : ""}`} onClick={() => updateSettings({ uiScale: v })}>{v}</button>)}</div></div>
      </>}
      {tab === "audio" && <>
        <T k="musicOn" label="Enable music" /><T k="sfxOn" label="Enable sound effects" />
        <S k="master" label="Master volume" /><S k="music" label="Music volume" /><S k="sfx" label="Sound effect volume" /><S k="ambient" label="Ambient volume" /><S k="ui" label="UI volume" />
      </>}
      {tab === "game" && <>
        <Sp k="promptSpeed" label="Prompt speed" /><Sp k="dialogueSpeed" label="Dialogue speed" /><Sp k="combatSpeed" label="Combat message speed" />
        <T k="autoLoot" label="Auto loot" /><T k="autoSellCommon" label="Auto sell low-tier monster drops" /><T k="confirmRareSell" label="Confirm before selling Rare+ items" /><T k="confirmNextFloor" label="Confirm before taking the stairs" />
      </>}
      {tab === "access" && <>
        <T k="largeText" label="Larger text" /><T k="colorblind" label="Colorblind mode" /><T k="highContrast" label="High contrast" /><T k="reducedMotion" label="Reduced animation" />
      </>}
      <p className="mt-2 text-xs text-muted-foreground">Settings save automatically on this device.</p>
    </Sheet>
  );
}
