import { useState } from "react";
import { getMat } from "./data";
import { churchHealCost, playerStats, type GameState } from "./engine";
import { SPOTS, SPOT_MAX, nextUnlock, spotLevel, spotMats, spotUpgradeCost, type SpotId } from "./gathering";
import { Sheet } from "./Panels";
import { Avatar } from "./Avatar";

const fmt = (n: number) => n.toLocaleString();
const ACT_ICON: Record<SpotId, string> = { forest: "🪓", mine: "⛏️", pond: "🎣", ranch: "🧺", field: "🌼" };

export function GatherPanel({ s, spot, onClose, onGather, onUpgrade, onPlots }: {
  s: GameState; spot: SpotId; onClose: () => void; onGather: (mat: string) => void; onUpgrade: () => void; onPlots?: () => void;
}) {
  const def = SPOTS[spot]; const L = spotLevel(s.spots, spot); const mats = spotMats(spot, L);
  const [mat, setMat] = useState(mats[mats.length - 1]!);
  const [swing, setSwing] = useState(0);
  const nx = nextUnlock(spot, L); const cost = spotUpgradeCost(spot, L); const max = playerStats(s).sta;
  return (
    <Sheet title={`${def.icon} ${def.name} · Lv ${L}`} onClose={onClose}>
      <div className={`gather-scene gather-${spot}`}>
        <div key={swing} className={`gather-hero ${swing ? "gather-swing" : ""}`}><Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} dir="r" frame={swing % 2 ? 1 : 0} /></div>
        <div key={`t${swing}`} className={`gather-target ${swing ? "gather-hit" : ""}`}>{getMat(mat).icon}</div>
        <div key={`f${swing}`} className="gather-tool">{ACT_ICON[spot]}</div>
      </div>
      <div className="mb-2 flex justify-between text-sm"><span>⚡ Stamina {Math.floor(s.sta)}/{max}</span><span className="text-muted-foreground">2 per action</span></div>
      <div className="mb-2 grid grid-cols-3 gap-1">
        {def.mats.map(([m, lv]) => { const ok = L >= lv; return (
          <button key={m} disabled={!ok} className={`pixel-btn flex flex-col items-center py-2 ${mat === m ? "pixel-btn-active" : ""}`} onClick={() => setMat(m)}>
            <span className="text-lg">{ok ? getMat(m).icon : "🔒"}</span>
            <span className="text-[0.65rem] leading-tight">{getMat(m).name}</span>
            <span className="text-[0.6rem] text-muted-foreground">{ok ? `T${getMat(m).tier} · ×${s.inv[m] ?? 0}` : `Lv ${lv}`}</span>
          </button>); })}
      </div>
      <button className="pixel-btn pixel-btn-primary mb-3 w-full py-4 text-lg" disabled={s.sta < 2} onClick={() => { onGather(mat); setSwing((n) => n + 1); }}>
        {s.sta < 2 ? "Too tired — rest or eat" : `${ACT_ICON[spot]} ${def.verb} ${getMat(mat).name}`}
      </button>
      {onPlots && <button className="pixel-btn mb-3 w-full py-3" onClick={onPlots}>🌱 Open crop plots</button>}
      <div className="border-t-2 border-border pt-2">
        <h3 className="text-accent">Upgrade {def.name}</h3>
        {L >= SPOT_MAX ? <p className="text-sm text-muted-foreground">Fully upgraded.</p> : <>
          <p className="text-sm">Next: Lv {L + 1}{nx ? ` · ${getMat(nx[0]).name} unlocks at Lv ${nx[1]}` : ""}. Bigger harvests.</p>
          <p className="text-sm text-muted-foreground">Cost: {fmt(cost.gold)}g + {cost.qty}× {getMat(cost.mat).name} (have {s.inv[cost.mat] ?? 0})</p>
          <button className="pixel-btn mt-1 w-full py-3" disabled={s.gold < cost.gold || (s.inv[cost.mat] ?? 0) < cost.qty} onClick={onUpgrade}>⬆️ Upgrade</button>
        </>}
      </div>
    </Sheet>
  );
}

export function ChurchPanel({ s, onClose, onHeal }: { s: GameState; onClose: () => void; onHeal: () => void }) {
  const c = churchHealCost(s);
  return (
    <Sheet title="⛪ Church" onClose={onClose}>
      <button className="pixel-btn pixel-btn-primary mb-2 w-full py-3" disabled={s.gold < c} onClick={onHeal}>✨ Healing blessing · {fmt(c)}g</button>
      <p className="text-sm text-muted-foreground">Prayers, blessings, curing ailments and elemental weapon blessings are coming in the next update.</p>
    </Sheet>
  );
}

export function SoonPanel({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  return <Sheet title={title} onClose={onClose}><p className="text-sm text-muted-foreground">{text}</p></Sheet>;
}

/** Tab strip shown inside merged buildings (e.g. Forge → Smithing / Sawmill / Smelter). */
export function BuildingTabs({ tabs, cur, go }: { tabs: [string, string][]; cur: string; go: (t: string) => void }) {
  return (
    <div className="flex shrink-0 gap-1 border-b-2 border-border px-2 py-1">
      {tabs.map(([t, l]) => <button key={t} className={`pixel-btn flex-1 py-2 text-xs ${cur === t ? "pixel-btn-active" : ""}`} onClick={() => go(t)}>{l}</button>)}
    </div>
  );
}
