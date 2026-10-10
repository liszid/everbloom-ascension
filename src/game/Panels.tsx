import { useMemo, useState, type ReactNode } from "react";
import {
  ELEMENT_ICON, SKILLS, STAT_KEYS, STAT_LABEL, TRAIT_INFO, WEAPON_INFO, WEAPON_TYPES, getMat,
  type WeaponType,
} from "./data";
import {
  cookPreview, craftPreview, elementLabel, levelOf, lvl, playerStats, xpFor,
  type GameState, type Gear, type Slot,
} from "./engine";

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 sm:items-center" onClick={onClose}>
      <div className="pixel-panel flex max-h-[88vh] w-full max-w-lg flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b-2 border-border px-3 py-2">
          <h2 className="text-base text-primary">{title}</h2>
          <button className="pixel-btn" onClick={onClose}>✕</button>
        </div>
        <div className="overflow-y-auto p-3">{children}</div>
      </div>
    </div>
  );
}

export function StatLine({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
      {STAT_KEYS.filter((k) => (stats[k] ?? 0) > 0.05).map((k) => (
        <span key={k}><span className="text-foreground">{STAT_LABEL[k]}</span> {fmt(stats[k]!)}</span>
      ))}
    </div>
  );
}
export const fmt = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n >= 100 ? Math.round(n).toString() : (Math.round(n * 10) / 10).toString());

function MatInfo({ id }: { id: string }) {
  const m = getMat(id);
  return (
    <div className="text-sm text-muted-foreground">
      <span>T{m.tier}</span>
      {m.element !== "none" && <span> · {ELEMENT_ICON[m.element]} {m.element}</span>}
      {m.trait && <span> · ✦{m.trait}</span>}
      {m.food && <span> · 🍽 {m.food}</span>}
    </div>
  );
}

function Qty({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button className="pixel-btn px-2" disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <span className="w-7 text-center text-lg">{value}</span>
      <button className="pixel-btn px-2" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      <button className="pixel-btn px-2" disabled={value >= max} onClick={() => onChange(max)}>Max</button>
    </div>
  );
}

function MatPicker({ ids, inv, sel, setSel }: { ids: string[]; inv: Record<string, number>; sel: Record<string, number>; setSel: (s: Record<string, number>) => void }) {
  if (!ids.length) return <p className="text-muted-foreground">You have no suitable materials. Go gather some!</p>;
  return (
    <div className="space-y-1">
      {ids.map((id) => {
        const m = getMat(id);
        return (
          <div key={id} className="flex items-center justify-between gap-2 border-b border-border/50 py-1">
            <div className="min-w-0">
              <div className="truncate">{m.icon} {m.name} <span className="text-muted-foreground">×{inv[id]}</span></div>
              <MatInfo id={id} />
            </div>
            <Qty value={sel[id] ?? 0} max={inv[id] ?? 0} onChange={(v) => setSel({ ...sel, [id]: v })} />
          </div>
        );
      })}
    </div>
  );
}

const sortedInv = (inv: Record<string, number>, f: (id: string) => boolean = () => true) =>
  Object.keys(inv).filter((id) => (inv[id] ?? 0) > 0 && f(id)).sort((a, b) => getMat(b).tier - getMat(a).tier || a.localeCompare(b));

export function ForgePanel({ s, onCraft, onClose }: { s: GameState; onCraft: (mats: { id: string; qty: number }[], slot: Slot, w: WeaponType) => Gear | null; onClose: () => void }) {
  const [slot, setSlot] = useState<Slot>("weapon");
  const [wtype, setW] = useState<WeaponType>("sword");
  const [sel, setSel] = useState<Record<string, number>>({});
  const [last, setLast] = useState<Gear | null>(null);
  const mats = Object.entries(sel).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const prev = useMemo(() => craftPreview(mats, slot, wtype, lvl(s, "crafting")), [JSON.stringify(mats), slot, wtype, s]);
  return (
    <Sheet title="⚒️ Forge" onClose={onClose}>
      <p className="mb-2 text-sm text-muted-foreground">Combine any materials. More kinds and more quantity = higher grade. Every forging turns out a little different.</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {WEAPON_TYPES.map((w) => (
          <button key={w} className={`pixel-btn ${slot === "weapon" && wtype === w ? "pixel-btn-active" : ""}`} onClick={() => { setSlot("weapon"); setW(w); }}>{WEAPON_INFO[w].icon} {WEAPON_INFO[w].name}</button>
        ))}
        <button className={`pixel-btn ${slot === "armor" ? "pixel-btn-active" : ""}`} onClick={() => setSlot("armor")}>🛡️ Armor</button>
        <button className={`pixel-btn ${slot === "charm" ? "pixel-btn-active" : ""}`} onClick={() => setSlot("charm")}>📿 Charm</button>
      </div>
      <MatPicker ids={sortedInv(s.inv)} inv={s.inv} sel={sel} setSel={setSel} />
      <div className="pixel-panel mt-3 p-2">
        {mats.length ? (
          <>
            <div className="flex items-baseline justify-between">
              <span>Predicted grade</span>
              <span className={`font-display text-2xl grade-${prev.gradeIdx}`}>{prev.grade}</span>
            </div>
            <div className="text-sm text-muted-foreground">{prev.kinds} kinds · {prev.totalQty} pieces</div>
            <StatLine stats={prev.stats} />
            {prev.elements.length > 0 && <div className="text-sm">Element: {elementLabel(prev.elements)}</div>}
            {prev.traits.length > 0 && <div className="text-sm">Traits: {prev.traits.map((t) => `${t.t} ${Math.round(t.v * 100)}%`).join(", ")}</div>}
          </>
        ) : <span className="text-muted-foreground">Add materials to see a preview.</span>}
      </div>
      <button className="pixel-btn pixel-btn-primary mt-3 w-full py-2 text-base" disabled={!mats.length}
        onClick={() => { const g = onCraft(mats, slot, wtype); setLast(g); setSel({}); }}>Forge!</button>
      {last && <div className="mt-3"><GearCard g={last} /></div>}
    </Sheet>
  );
}

export function GearCard({ g, children }: { g: Gear; children?: ReactNode }) {
  return (
    <div className="pixel-panel p-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={`font-display text-sm grade-${g.gradeIdx}`}>[{g.grade}] {g.name}</div>
          <div className="text-sm text-muted-foreground">{g.slot === "weapon" ? `${WEAPON_INFO[g.wtype!].icon} ${WEAPON_INFO[g.wtype!].name}` : g.slot === "armor" ? "🛡️ Armor" : "📿 Charm"}</div>
        </div>
        {children}
      </div>
      <StatLine stats={g.stats} />
      {g.elements.length > 0 && <div className="text-sm">{elementLabel(g.elements)}</div>}
      {g.traits.map((t) => <div key={t.t} className="text-sm text-xp">✦ {t.t} {Math.round(t.v * 100)}% — {TRAIT_INFO[t.t]}</div>)}
      <div className="text-xs text-muted-foreground">{g.materials.map((m) => `${getMat(m.id).icon}${m.qty}`).join(" ")}</div>
    </div>
  );
}

export function GearPanel({ s, onEquip, onScrap, onClose }: { s: GameState; onEquip: (g: Gear) => void; onScrap: (g: Gear) => void; onClose: () => void }) {
  const p = playerStats(s);
  return (
    <Sheet title="🎒 Gear" onClose={onClose}>
      <div className="pixel-panel mb-3 grid grid-cols-3 gap-1 p-2 text-sm">
        <span>❤️ {s.hp}/{p.maxHp}</span><span>⚔️ {fmt(p.atk)}</span><span>🛡️ {fmt(p.def)}</span>
        <span>✨ {fmt(p.mag)}</span><span>💥 {Math.round(p.crit * 100)}%</span><span>💨 {Math.round(p.dodge * 100)}%</span>
        {p.elements.length > 0 && <span className="col-span-3">Weapon element: {elementLabel(p.elements)}</span>}
      </div>
      {!s.gear.length && <p className="text-muted-foreground">No gear yet. Visit the forge ⚒️ in the village.</p>}
      <div className="space-y-2">
        {[...s.gear].sort((a, b) => b.gradeIdx - a.gradeIdx).map((g) => {
          const on = s.equip[g.slot] === g.id;
          return (
            <GearCard key={g.id} g={g}>
              <div className="flex flex-col gap-1">
                <button className={`pixel-btn ${on ? "pixel-btn-active" : "pixel-btn-primary"}`} onClick={() => onEquip(g)}>{on ? "Equipped" : "Equip"}</button>
                {!on && <button className="pixel-btn pixel-btn-danger" onClick={() => onScrap(g)}>Scrap</button>}
              </div>
            </GearCard>
          );
        })}
      </div>
    </Sheet>
  );
}

export function BagPanel({ s, onClose }: { s: GameState; onClose: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const ids = sortedInv(s.inv);
  const bag = sortedInv(s.bag);
  return (
    <Sheet title="👜 Inventory" onClose={onClose}>
      {s.loc === "dungeon" && (
        <div className="mb-3">
          <h3 className="text-sm text-accent">Loot bag (lost if you fall)</h3>
          {bag.length ? bag.map((id) => <div key={id}>{getMat(id).icon} {getMat(id).name} ×{s.bag[id]}</div>) : <p className="text-muted-foreground">Empty</p>}
        </div>
      )}
      <h3 className="text-sm text-primary">Materials</h3>
      {!ids.length && <p className="text-muted-foreground">Nothing yet.</p>}
      <div className="grid grid-cols-1 gap-1">
        {ids.map((id) => {
          const m = getMat(id);
          return (
            <button key={id} className="border-b border-border/50 py-1 text-left font-body" onClick={() => setOpen(open === id ? null : id)}>
              <div>{m.icon} {m.name} <span className="text-muted-foreground">×{s.inv[id]}</span></div>
              {open === id && (
                <div className="pl-6">
                  <MatInfo id={id} />
                  <StatLine stats={m.stats} />
                  {m.trait && <div className="text-sm text-xp">✦ {TRAIT_INFO[m.trait]}</div>}
                  {m.refine && <div className="text-sm">Can be {m.refine.station === "carve" ? "carved" : "smelted"} into {getMat(m.refine.to).name}</div>}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <h3 className="mt-3 text-sm text-primary">Meals</h3>
      {s.foods.length ? s.foods.map((f, i) => <div key={i}>{f.icon} {f.name} ×{f.qty} <span className="text-muted-foreground">(+{f.heal} HP)</span></div>) : <p className="text-muted-foreground">No food. Cook at the kitchen 🍳.</p>}
    </Sheet>
  );
}

export function SkillsPanel({ s, onClose }: { s: GameState; onClose: () => void }) {
  const known = Object.keys(SKILLS).filter((k) => s.skills[k] !== undefined);
  return (
    <Sheet title="📜 Skills" onClose={onClose}>
      <p className="mb-2 text-sm text-muted-foreground">Skills are learned by doing. {Object.keys(SKILLS).length - known.length} skills still undiscovered.</p>
      <div className="space-y-2">
        {known.sort((a, b) => (s.skills[b] ?? 0) - (s.skills[a] ?? 0)).map((k) => {
          const xp = s.skills[k]!; const L = levelOf(xp);
          const pct = ((xp - xpFor(L)) / (xpFor(L + 1) - xpFor(L))) * 100;
          return (
            <div key={k}>
              <div className="flex justify-between"><span>{SKILLS[k]!.icon} {SKILLS[k]!.name}</span><span className="text-primary">Lv {L}</span></div>
              <div className="bar bar-xp"><div style={{ width: `${pct}%` }} /></div>
              <div className="text-xs text-muted-foreground">{SKILLS[k]!.desc}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-sm text-muted-foreground">Monsters slain: {s.kills} · Highest floor: {s.maxFloor}/1000</div>
    </Sheet>
  );
}

export function KitchenPanel({ s, onCook, onClose }: { s: GameState; onCook: (m: { id: string; qty: number }[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const mats = Object.entries(sel).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const p = cookPreview(mats, lvl(s, "cooking"));
  return (
    <Sheet title="🍳 Kitchen" onClose={onClose}>
      <p className="mb-2 text-sm text-muted-foreground">Mix any ingredients. More variety makes better meals.</p>
      <MatPicker ids={sortedInv(s.inv, (id) => !!getMat(id).food)} inv={s.inv} sel={sel} setSel={setSel} />
      {p.qty > 0 && <div className="pixel-panel mt-3 p-2">{p.portions}× {p.name} — +{p.heal} HP each</div>}
      <button className="pixel-btn pixel-btn-primary mt-3 w-full py-2" disabled={!p.qty} onClick={() => { onCook(mats); setSel({}); }}>Cook</button>
    </Sheet>
  );
}

export function RefinePanel({ s, station, onRefine, onClose }: { s: GameState; station: "carve" | "smelt"; onRefine: (id: string, n: number) => void; onClose: () => void }) {
  const ids = sortedInv(s.inv, (id) => getMat(id).refine?.station === station);
  return (
    <Sheet title={station === "carve" ? "🪚 Carving Bench" : "🔥 Furnace"} onClose={onClose}>
      <p className="mb-2 text-sm text-muted-foreground">Turn 2 raw pieces into 1 stronger, higher-tier material.</p>
      {!ids.length && <p className="text-muted-foreground">{station === "carve" ? "Bring logs from the trees." : "Bring ore from the rocks."}</p>}
      {ids.map((id) => {
        const m = getMat(id); const to = getMat(m.refine!.to); const have = s.inv[id] ?? 0;
        return (
          <div key={id} className="flex items-center justify-between border-b border-border/50 py-1">
            <span>{m.icon}{m.name} ×{have} → {to.icon}{to.name}</span>
            <div className="flex gap-1">
              <button className="pixel-btn" disabled={have < 2} onClick={() => onRefine(id, 1)}>×1</button>
              <button className="pixel-btn pixel-btn-primary" disabled={have < 2} onClick={() => onRefine(id, 999)}>All</button>
            </div>
          </div>
        );
      })}
    </Sheet>
  );
}

export function PlotPanel({ s, onPlant, onClose }: { s: GameState; onPlant: (seed: string) => void; onClose: () => void }) {
  const seeds = sortedInv(s.inv, (id) => !!getMat(id).seedOf);
  return (
    <Sheet title="🌱 Garden Plot" onClose={onClose}>
      {!seeds.length && <p className="text-muted-foreground">No seeds. Picking flowers sometimes yields seeds.</p>}
      {seeds.map((id) => (
        <div key={id} className="flex items-center justify-between border-b border-border/50 py-1">
          <span>{getMat(id).icon} {getMat(id).name} ×{s.inv[id]}</span>
          <button className="pixel-btn pixel-btn-primary" onClick={() => onPlant(id)}>Plant</button>
        </div>
      ))}
    </Sheet>
  );
}

export function TowerPanel({ s, onEnter, onClose }: { s: GameState; onEnter: (f: number) => void; onClose: () => void }) {
  const next = Math.min(1000, s.maxFloor + 1);
  const [f, setF] = useState(next);
  const clamp = (v: number) => Math.max(1, Math.min(next, v));
  return (
    <Sheet title="🗼 The Tower" onClose={onClose}>
      <p className="text-sm text-muted-foreground">Reach the stairs 🪜 on each floor. Every 10th floor is guarded. Fall and you lose that floor's loot.</p>
      <div className="my-3 bar bar-xp"><div style={{ width: `${(s.maxFloor / 1000) * 100}%` }} /></div>
      <div className="text-center">Highest floor cleared: <span className="text-primary">{s.maxFloor}</span> / 1000</div>
      <button className="pixel-btn pixel-btn-primary mt-3 w-full py-2 text-base" onClick={() => onEnter(next)}>Climb to Floor {next}</button>
      {s.maxFloor > 0 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          <button className="pixel-btn" onClick={() => setF(clamp(f - 10))}>-10</button>
          <button className="pixel-btn" onClick={() => setF(clamp(f - 1))}>-1</button>
          <span className="w-12 text-center text-lg">{f}</span>
          <button className="pixel-btn" onClick={() => setF(clamp(f + 1))}>+1</button>
          <button className="pixel-btn" onClick={() => setF(clamp(f + 10))}>+10</button>
          <button className="pixel-btn" onClick={() => onEnter(f)}>Revisit</button>
        </div>
      )}
    </Sheet>
  );
}

export function HousePanel({ s, onRest, onSave, onSignOut, saving, onClose }: { s: GameState; onRest: () => void; onSave: () => void; onSignOut: () => void; saving: string; onClose: () => void }) {
  return (
    <Sheet title="🏠 Home" onClose={onClose}>
      <p className="text-sm text-muted-foreground">A warm bed and a safe chest. Your progress is saved to your account automatically.</p>
      <div className="mt-3 grid gap-2">
        <button className="pixel-btn pixel-btn-primary py-2" onClick={onRest}>Rest (full heal)</button>
        <button className="pixel-btn py-2" onClick={onSave}>Save now</button>
        <span className="text-center text-sm text-muted-foreground">{saving}</span>
        <button className="pixel-btn pixel-btn-danger py-2" onClick={onSignOut}>Sign out</button>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">Steps walked: {s.step} · Monsters slain: {s.kills}</div>
    </Sheet>
  );
}
