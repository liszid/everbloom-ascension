import { useState } from "react";
import { AFFINITIES, GRADES, SKILLS, SLOTS, SLOT_INFO, getMat, type Slot } from "./data";
import { guildSellMult, compGear, compStats, freeGear, GEAR_CAP, lvl, techLock, specAffinities, type GameState } from "./engine";
import { HIRELINGS, MAX_COMPANIONS, RENT_FLOORS, TECH_REQ, buyPrice, rentPrice, techGold, trainChance, trainCost, type CompRole, type Companion } from "./guild";
import { Sheet, fmt } from "./Panels";
import { Avatar } from "./Avatar";
import { MonsterSprite } from "./MonsterSprite";
import { heldGearOfComp } from "./HeldGear";

export function CompAvatar({ c }: { c: Companion }) {
  return c.kind === "monster" ? <MonsterSprite kind={c.monDef ?? "slime"} name={c.name} boss={0} /> : <Avatar race={c.race} gender={c.gender} classId={c.role === "mage" ? "fire:1" : c.role === "cleric" ? "light:1" : c.role === "archer" ? "hunting:1" : "might:1"} held={heldGearOfComp(c)} />;
}

export function GuildShopPanel({ s, onClose, onSell }: { s: GameState; onClose: () => void; onSell: (id: string, q: number) => void }) {
  const parts = Object.entries(s.inv).filter(([id, q]) => q > 0 && getMat(id).src === "monster").sort((a, b) => getMat(b[0]).tier - getMat(a[0]).tier);
  return (
    <Sheet title="🦴 Guild Merchant" onClose={onClose}>
      <p className="mb-2 text-xs text-muted-foreground">The Guild pays {guildSellMult(s).toFixed(2)}× the shop price for monster parts.</p>
      {!parts.length && <p className="text-sm text-muted-foreground">No monster parts in your bag.</p>}
      {parts.map(([id, q]) => { const m = getMat(id); const each = Math.max(1, Math.round(m.value * guildSellMult(s))); return (
        <div key={id} className="mb-1 flex items-center gap-2 border-2 border-border p-2 text-sm">
          <span className="text-lg">{m.icon}</span>
          <span className="min-w-0 flex-1">{m.name} <span className="text-xs text-muted-foreground">T{m.tier} · ×{q} · {fmt(each)}g</span></span>
          <button className="pixel-btn px-2 py-1 text-xs" onClick={() => onSell(id, 1)}>1</button>
          <button className="pixel-btn px-2 py-1 text-xs" onClick={() => onSell(id, q)}>All</button>
        </div>); })}
    </Sheet>
  );
}

export function TrainingPanel({ s, onClose, onTrain, onTech }: { s: GameState; onClose: () => void; onTrain: (k: string) => void; onTech: (aff: string, kind: "passive" | "active") => void }) {
  const [tab, setTab] = useState<"skills" | "spec">("skills");
  const spec = specAffinities(s);
  return (
    <Sheet title="🏋️ Training Grounds" onClose={onClose}>
      <div className="mb-2 flex gap-1">
        <button className={`pixel-btn flex-1 py-2 text-xs ${tab === "skills" ? "pixel-btn-active" : ""}`} onClick={() => setTab("skills")}>Skill training</button>
        <button className={`pixel-btn flex-1 py-2 text-xs ${tab === "spec" ? "pixel-btn-active" : ""}`} onClick={() => setTab("spec")}>Specialists</button>
      </div>
      {tab === "skills" && <>
        <p className="mb-2 text-xs text-muted-foreground">Pay for a session: success grants half a level. Higher levels cost more and succeed less often.</p>
        {Object.entries(SKILLS).map(([k, d]) => { const L = lvl(s, k); const c = trainCost(L); return (
          <div key={k} className="mb-1 flex items-center gap-2 border-b border-border py-1 text-sm">
            <span>{d.icon}</span><span className="min-w-0 flex-1">{d.name} <span className="text-xs text-muted-foreground">Lv {L} · {Math.round(trainChance(L) * 100)}%</span></span>
            <button className="pixel-btn px-2 py-1 text-xs" disabled={s.gold < c} onClick={() => onTrain(k)}>{fmt(c)}g</button>
          </div>); })}
      </>}
      {tab === "spec" && <>
        <p className="mb-2 text-xs text-muted-foreground">Specialists only teach your top two affinities: {spec.map((a) => AFFINITIES.find((x) => x.id === a)?.name).join(" & ") || "none yet"}. Passive at Lv {TECH_REQ.passive} (doubles the affinity bonus), active at Lv {TECH_REQ.active} (a stronger battle art).</p>
        {AFFINITIES.filter((a) => spec.includes(a.id)).map((a) => <div key={a.id} className="mb-2 border-2 border-border p-2">
          <div className="text-sm text-accent">{a.icon} {a.name} trainer</div>
          {(["passive", "active"] as const).map((k) => { const lock = techLock(s, a.id, k); return (
            <button key={k} className="pixel-btn mt-1 w-full py-2 text-left text-xs" disabled={!!lock || s.gold < techGold(k)} onClick={() => onTech(a.id, k)}>
              {k === "passive" ? `📖 ${a.name} Mastery — doubled passive bonus` : `⚔️ ${a.titles[1]} Art — empowered ${a.active.name}`} · {lock ?? `${fmt(techGold(k))}g`}
            </button>); })}
        </div>)}
      </>}
    </Sheet>
  );
}

export function HirePanel({ s, onClose, onHire, onParty }: { s: GameState; onClose: () => void; onHire: (r: CompRole, buy: boolean) => void; onParty: () => void }) {
  const n = s.companions?.length ?? 0; const rp = rentPrice(s.maxFloor), bp = buyPrice(s.maxFloor);
  return (
    <Sheet title="🤝 Companions" onClose={onClose}>
      <p className="mb-2 text-xs text-muted-foreground">Party {n}/{MAX_COMPANIONS}. Rent for {RENT_FLOORS} floors or recruit for good. Weakened monsters (below 30% HP) can be captured in battle.</p>
      {n > 0 && <button className="pixel-btn mb-2 w-full py-2" onClick={onParty}>👥 Manage party</button>}
      {HIRELINGS.map((h) => <div key={h.role} className="mb-1 border-2 border-border p-2">
        <div className="flex items-center gap-2"><div className="h-10 w-10"><Avatar race={h.race} gender={h.gender} classId="might:1" /></div>
          <div className="min-w-0 flex-1"><div className="text-sm">{h.icon} {h.name} <span className="text-xs capitalize text-muted-foreground">{h.role}</span></div><div className="text-xs text-muted-foreground">{h.desc}</div></div></div>
        <div className="mt-1 flex gap-1">
          <button className="pixel-btn flex-1 py-2 text-xs" disabled={n >= MAX_COMPANIONS || s.gold < rp} onClick={() => onHire(h.role, false)}>Rent · {fmt(rp)}g</button>
          <button className="pixel-btn flex-1 py-2 text-xs" disabled={n >= MAX_COMPANIONS || s.gold < bp} onClick={() => onHire(h.role, true)}>Recruit · {fmt(bp)}g</button>
        </div>
      </div>)}
    </Sheet>
  );
}

export function PartyPanel({ s, onClose, start, onEquip, onTitle, onDismiss }: {
  s: GameState; onClose: () => void; start?: string | undefined; onEquip: (cid: string, gid: string | undefined, slot: Slot) => void; onTitle: (cid: string, t: string | undefined) => void; onDismiss: (cid: string) => void;
}) {
  const comps = s.companions ?? [];
  const [cur, setCur] = useState(start ?? comps[0]?.id);
  const [tab, setTab] = useState<"stats" | "equip" | "title">("stats");
  const [slot, setSlot] = useState<Slot | null>(null);
  const c = comps.find((x) => x.id === cur) ?? comps[0];
  if (!c) return <Sheet title="👥 Party" onClose={onClose}><p className="text-sm text-muted-foreground">No companions yet — visit the Adventurers Guild.</p></Sheet>;
  const st = compStats(s, c); const free = freeGear(s);
  return (
    <Sheet title="👥 Party" onClose={onClose}>
      <div className="mb-2 flex gap-1">{comps.map((x) => <button key={x.id} className={`pixel-btn flex flex-1 flex-col items-center p-1 text-[0.65rem] ${x.id === c.id ? "pixel-btn-active" : ""}`} onClick={() => { setCur(x.id); setSlot(null); }}><div className="h-8 w-8"><CompAvatar c={x} /></div>{x.name}</button>)}</div>
      <div className="mb-2 flex gap-1">{([["stats", "📊 Stats"], ["equip", "🛡️ Equipment"], ["title", "🏅 Title"]] as const).map(([t, l]) => <button key={t} className={`pixel-btn flex-1 py-2 text-xs ${tab === t ? "pixel-btn-active" : ""}`} onClick={() => setTab(t)}>{l}</button>)}</div>
      {tab === "stats" && <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2"><div className="h-14 w-14"><CompAvatar c={c} /></div><div><div className="text-accent">{c.name}</div><div className="text-xs capitalize text-muted-foreground">{c.kind === "monster" ? "Captured monster" : c.role} · Lv {st.level} · {c.rentLeft !== undefined ? `rented, ${c.rentLeft} floors left` : "permanent"}</div></div></div>
        <div>❤️ HP {fmt(st.hp)} · ⚔️ {c.base.magic ? "M.Atk" : "Atk"} {fmt(st.atk)} · 🛡️ Def {fmt(st.def)}</div>
        <p className="text-xs text-muted-foreground">Companions fight after you each turn, grow with every victory and draw strength from gear and titles.</p>
        <button className="pixel-btn w-full py-2 text-xs" onClick={() => onDismiss(c.id)}>{c.rentLeft !== undefined ? "End contract" : c.kind === "monster" ? "Release" : "Dismiss"}</button>
      </div>}
      {tab === "equip" && <>
        <p className="mb-2 text-xs text-muted-foreground">Gear you hand over leaves your bag and is carried by {c.name}. Removing it puts it back in your bag ({s.gear.length}/{GEAR_CAP}). If {c.name} leaves the party, everything comes back to you.</p>
        {SLOTS.map((sl) => { const g = compGear(c, sl); return (
          <div key={sl} className="mb-1 border-b border-border py-1 text-sm">
            <div className="flex items-center gap-2"><span className="w-24 text-xs text-muted-foreground">{SLOT_INFO[sl].name}</span><span className={`min-w-0 flex-1 truncate ${g ? `grade-${g.grade}` : ""}`}>{g ? g.name : "—"}</span>
              {g && <button className="pixel-btn px-2 py-1 text-xs" disabled={s.gear.length >= GEAR_CAP} onClick={() => onEquip(c.id, undefined, sl)}>{s.gear.length >= GEAR_CAP ? "Bag full" : "Remove"}</button>}
              <button className="pixel-btn px-2 py-1 text-xs" onClick={() => setSlot(slot === sl ? null : sl)}>Pick</button></div>
            {slot === sl && <div className="mt-1 space-y-1">
              {free.filter((x) => x.slot === sl).sort((a, b) => b.grade - a.grade || b.enh - a.enh).map((x) => <button key={x.id} className="pixel-btn w-full py-1 text-left text-xs" onClick={() => { onEquip(c.id, x.id, sl); setSlot(null); }}><span className={`grade-${x.grade}`}>{x.name}</span> <span className="text-muted-foreground">· {GRADES[x.grade]}{x.enh ? ` +${x.enh}` : ""}{g ? " · swap" : ""}</span></button>)}
              {!free.some((x) => x.slot === sl) && <p className="text-xs text-muted-foreground">No spare gear for this slot.</p>}
            </div>}
          </div>); })}
      </>}
      {tab === "title" && <>
        <p className="mb-2 text-xs text-muted-foreground">Share one of your earned titles. Its stat bonuses apply and its stars grow while worn ({"★".repeat(st.stars)}).</p>
        <button className={`pixel-btn mb-1 w-full py-2 text-xs ${!c.title ? "pixel-btn-active" : ""}`} onClick={() => onTitle(c.id, undefined)}>No title</button>
        {s.titles.map((t) => <button key={t} className={`pixel-btn mb-1 w-full py-2 text-xs ${c.title === t ? "pixel-btn-active" : ""}`} onClick={() => onTitle(c.id, t)}>{t}</button>)}
      </>}
    </Sheet>
  );
}
