import { useState } from "react";
import { ELEMENT_ICON, getMat, type Element } from "./data";
import { AILMENTS, BLESSINGS, BLESS_BATTLES, ENCHANT_ELEMENTS, TOOL, TOOLS, enchantPower, type AilmentId, type BlessingId, type RangedId, type ToolKind } from "./items";
import { ailmentCost, blessingCost, churchHealCost, enchantMatFor, playerStats, type GameState } from "./engine";
import { SPOTS, SPOT_MAX, nextUnlock, spotLevel, spotMats, spotUpgradeCost, type SpotId } from "./gathering";
import { Sheet } from "./Panels";
import { Avatar } from "./Avatar";

const fmt = (n: number) => n.toLocaleString();
const ACT_ICON: Record<SpotId, string> = { forest: "🪓", mine: "⛏️", pond: "🎣", ranch: "🧺", field: "🌼" };

export function GatherPanel({ s, spot, onClose, onGather, onUpgrade, onPlots }: {
  s: GameState; spot: SpotId; onClose: () => void; onGather: (mat: string) => void; onUpgrade: () => void; onPlots?: (() => void) | undefined;
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

export function ChurchPanel({ s, onClose, onHeal, onCure, onBless, onPray, onEnchant }: {
  s: GameState; onClose: () => void; onHeal: () => void; onCure: (id: AilmentId) => void; onBless: (id: BlessingId) => void; onPray: () => void; onEnchant: (gid: string, el: Element) => void;
}) {
  const [tab, setTab] = useState<"care" | "bless" | "ench">("care");
  const [gid, setGid] = useState<string>("");
  const c = churchHealCost(s); const ail = Object.keys(s.ailments ?? {}) as AilmentId[];
  const gears = s.gear.filter((g) => g.slot === "one_hand" || g.slot === "two_hand" || g.slot === "shield");
  const sel = gears.find((g) => g.id === gid) ?? gears[0];
  return (
    <Sheet title="⛪ Church" onClose={onClose}>
      <div className="mb-2 flex gap-1">
        {([["care", "🩹 Healing"], ["bless", "🙏 Blessings"], ["ench", "🌟 Enchant"]] as const).map(([t, l]) => <button key={t} className={`pixel-btn flex-1 py-2 text-xs ${tab === t ? "pixel-btn-active" : ""}`} onClick={() => setTab(t)}>{l}</button>)}
      </div>
      {tab === "care" && <>
        <button className="pixel-btn pixel-btn-primary mb-3 w-full py-3" disabled={s.gold < c} onClick={onHeal}>✨ Restore HP & MP · {fmt(c)}g</button>
        <h3 className="text-accent">Ailments</h3>
        {!ail.length && <p className="text-sm text-muted-foreground">You are free of ailments. Venom, draining foes, deep wounds, cursed guardians and death can afflict you.</p>}
        {ail.map((id) => { const a = AILMENTS[id]; const cost = ailmentCost(s, id); return (
          <div key={id} className="mb-1 flex items-center gap-2 border-2 border-border p-2">
            <span className="text-xl">{a.icon}</span>
            <div className="min-w-0 flex-1"><div className="text-sm">{a.name}</div><div className="text-xs text-muted-foreground">{a.desc}</div></div>
            <button className="pixel-btn px-2 py-2 text-xs" disabled={s.gold < cost} onClick={() => onCure(id)}>Cure {fmt(cost)}g</button>
          </div>); })}
      </>}
      {tab === "bless" && <>
        <button className="pixel-btn pixel-btn-primary mb-1 w-full py-3" disabled={!!s.prayed} onClick={onPray}>{s.prayed ? "🙏 Already prayed — return after a climb" : "🙏 Pray (free, once per climb)"}</button>
        <p className="mb-2 text-xs text-muted-foreground">Faith {s.faith ?? 0} · each point makes blessings 1% cheaper (max 30%).</p>
        {s.blessing && <p className="mb-2 text-sm text-gold">Active: {BLESSINGS[s.blessing.id].icon} {BLESSINGS[s.blessing.id].name} · {s.blessing.left} battles left</p>}
        {(Object.keys(BLESSINGS) as BlessingId[]).map((id) => { const b = BLESSINGS[id]; const cost = blessingCost(s, id); return (
          <button key={id} className="pixel-btn mb-1 flex w-full items-center gap-2 p-2 text-left" disabled={s.gold < cost} onClick={() => onBless(id)}>
            <span className="text-xl">{b.icon}</span><span className="min-w-0 flex-1"><span className="block text-sm">{b.name}</span><span className="block text-xs text-muted-foreground">{b.desc} · {BLESS_BATTLES} battles</span></span><span className="text-xs">{fmt(cost)}g</span>
          </button>); })}
        <p className="text-xs text-muted-foreground">Only one blessing can be active; a new one replaces the old.</p>
      </>}
      {tab === "ench" && <>
        {!gears.length && <p className="text-sm text-muted-foreground">Craft a weapon or shield first.</p>}
        {sel && <>
          <select className="pixel-btn mb-2 w-full p-2 text-sm" value={sel.id} onChange={(e) => setGid(e.target.value)}>
            {gears.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.slot === "shield" ? "shield" : "weapon"}){g.ench ? ` · ${ELEMENT_ICON[g.ench.el]}${g.ench.v}%` : ""}</option>)}
          </select>
          <p className="mb-2 text-xs text-muted-foreground">{sel.slot === "shield" ? `Shield: reduces damage from monsters of that element by ${Math.min(50, enchantPower(sel.grade) * 2)}%+ and +5% defense.` : `Weapon: attacks take the element and deal +${enchantPower(sel.grade)}%+ damage (hit weaknesses for 1.5×).`} Rare essences add +5%.</p>
          <div className="grid grid-cols-2 gap-1">
            {ENCHANT_ELEMENTS.map((el) => { const need = enchantMatFor(s, sel, el); const ok = s.gold >= need.gold && (s.inv[need.mat] ?? 0) >= need.qty; return (
              <button key={el} className="pixel-btn flex flex-col items-center p-2" disabled={!ok} onClick={() => onEnchant(sel.id, el)}>
                <span className="text-lg">{ELEMENT_ICON[el]} <span className="text-sm capitalize">{el}</span></span>
                <span className="text-[0.65rem] text-muted-foreground">{fmt(need.gold)}g · {need.qty}× {getMat(need.mat).name} ({s.inv[need.mat] ?? 0})</span>
              </button>); })}
          </div>
        </>}
      </>}
    </Sheet>
  );
}

export function CrafteryPanel({ s, onClose, onCraft, onRanged }: { s: GameState; onClose: () => void; onCraft: (id: string, times: number) => void; onRanged: (id: RangedId | undefined) => void }) {
  const [tab, setTab] = useState<ToolKind>("throw");
  return (
    <Sheet title="🪤 Craftery" onClose={onClose}>
      <div className="mb-2 flex gap-1">
        {([["throw", "🔪 Throw"], ["trap", "🪤 Traps"], ["ammo", "➶ Ammo"], ["ranged", "🏹 Off-hand"]] as const).map(([t, l]) => <button key={t} className={`pixel-btn flex-1 py-2 text-xs ${tab === t ? "pixel-btn-active" : ""}`} onClick={() => setTab(t)}>{l}</button>)}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{tab === "trap" ? "In the dungeon, press and hold an empty floor tile (up to 3 steps away) to set a trap." : tab === "throw" ? "Single-use items — throw them from the Items menu in battle." : tab === "ammo" ? "Each Shoot uses one round of your off-hand's ammo." : `Off-hand ranged weapons replace your shield. Readied: ${s.ranged ? TOOL[s.ranged]!.name : "none"}.`}</p>
      {TOOLS.filter((t) => t.kind === tab).map((t) => { const have = s.tools?.[t.id] ?? 0; const ok = s.gold >= t.gold && t.recipe.every(([m, q]) => (s.inv[m] ?? 0) >= q); const owned = t.kind === "ranged" && have > 0; return (
        <div key={t.id} className="mb-1 border-2 border-border p-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{t.icon}</span>
            <div className="min-w-0 flex-1"><div className="text-sm">{t.name} {t.kind !== "ranged" && <span className="text-xs text-muted-foreground">×{have}</span>}</div><div className="text-xs text-muted-foreground">{t.desc}</div></div>
          </div>
          <div className="mt-1 text-[0.7rem] text-muted-foreground">{fmt(t.gold)}g · {t.recipe.map(([m, q]) => `${q}× ${getMat(m).name} (${s.inv[m] ?? 0})`).join(" · ")}{t.makes > 1 ? ` → makes ${t.makes}` : ""}</div>
          <div className="mt-1 flex gap-1">
            {!owned && <button className="pixel-btn flex-1 py-2 text-xs" disabled={!ok} onClick={() => onCraft(t.id, 1)}>Craft</button>}
            {!owned && t.kind !== "ranged" && <button className="pixel-btn flex-1 py-2 text-xs" disabled={!ok} onClick={() => onCraft(t.id, 5)}>Craft ×5</button>}
            {owned && <button className="pixel-btn flex-1 py-2 text-xs" onClick={() => onRanged(s.ranged === t.id ? undefined : t.id as RangedId)}>{s.ranged === t.id ? "Unequip" : "Ready in off-hand"}</button>}
          </div>
        </div>); })}
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
