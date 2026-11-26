// Arena and Player Market panels. Rules live in town.ts / engine.ts; this file is presentation plus the market's network calls.
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GRADES, SLOT_INFO, getMat } from "./data";
import { arenaLock, canReceive, compStats, freeGear, marketValue, type GameState, type Gear } from "./engine";
import { compLevel, type Companion } from "./guild";
import { ARENA_GEAR_WAVES, ARENA_WAVES, arenaBossKind, arenaFee, arenaFloors, arenaPrize, type ListingKind } from "./town";
import { Sheet, Tabs, fmt } from "./Panels";
import { MonsterSprite } from "./MonsterSprite";

export function ArenaPanel({ s, onClose, onStart, onFight, onCashOut }: { s: GameState; onClose: () => void; onStart: (f: number) => void; onFight: () => void; onCashOut: () => void }) {
  const floors = arenaFloors(s.maxFloor);
  const [f, setF] = useState(floors[0] ?? 10);
  const a = s.arena; const lock = arenaLock(s);
  return (
    <Sheet title="🏟️ The Arena" onClose={onClose}>
      {a ? <div>
        <p className="mb-1 text-sm">Floor {a.floor} bracket · wave <b className="text-primary">{a.wave}/{ARENA_WAVES}</b> cleared</p>
        <div className="mb-2 flex gap-1">{Array.from({ length: ARENA_WAVES }, (_, i) => <span key={i} className={`flex-1 border-2 py-1 text-center text-xs ${i < a.wave ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{i < a.wave ? "✔" : arenaBossKind(i + 1) === 2 ? "☠️" : "💀"}</span>)}</div>
        <div className="pixel-panel mb-2 p-2 text-sm">
          <div className="text-accent">Prizes held</div>
          <div>💰 {fmt(a.prize.gold)}g</div>
          {Object.entries(a.prize.mats).map(([id, q]) => <div key={id}>{getMat(id).icon} {getMat(id).name} ×{q} <span className="text-xs text-muted-foreground">T{getMat(id).tier}</span></div>)}
          {a.prize.gear.map((g) => <div key={g.id} className={`grade-${g.grade}`}>{SLOT_INFO[g.slot].icon} {g.name} <span className="text-xs">· {GRADES[g.grade]}{g.enh ? ` +${g.enh}` : ""}</span></div>)}
          {!a.wave && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        </div>
        <p className="mb-2 text-xs text-muted-foreground">HP, MP and stamina carry over between waves. Falling loses every prize you hold; walking away keeps them.</p>
        <button className="pixel-btn pixel-btn-primary mb-1 w-full py-3" onClick={onFight}>⚔️ Fight wave {a.wave + 1} {arenaBossKind(a.wave + 1) === 2 ? "— Arch-Warden" : "— Guardian"}</button>
        <button className="pixel-btn w-full py-2" onClick={onCashOut}>🏆 Take prizes and leave</button>
      </div> : <div>
        <p className="mb-2 text-sm">Face {ARENA_WAVES} bosses back to back: Guardians, then an Arch-Warden. Every wave adds rare materials and gold; waves {ARENA_GEAR_WAVES.join(" and ")} also award equipment.</p>
        {lock ? <p className="pixel-panel p-2 text-sm text-muted-foreground">{lock}</p> : <>
          <label className="mb-1 block text-sm" htmlFor="arena-bracket">Bracket</label>
          <select id="arena-bracket" className="pixel-btn mb-2 w-full py-3 text-center" value={f} onChange={(e) => setF(Number(e.target.value))}>
            {floors.map((n) => <option key={n} value={n}>Floor {n} bracket · fee {fmt(arenaFee(n))}g</option>)}
          </select>
          <p className="mb-2 text-xs text-muted-foreground">Full run prize: about {fmt(Array.from({ length: ARENA_WAVES }, (_, i) => arenaPrize(f, i + 1).gold).reduce((x, y) => x + y, 0))}g, {Array.from({ length: ARENA_WAVES }, (_, i) => arenaPrize(f, i + 1).rare).reduce((x, y) => x + y, 0)} rare materials and {ARENA_GEAR_WAVES.length} pieces of equipment. One run per Tower expedition.</p>
          <button className="pixel-btn pixel-btn-primary w-full py-3" disabled={s.gold < arenaFee(f)} onClick={() => onStart(f)}>🏟️ Enter · {fmt(arenaFee(f))}g</button>
        </>}
      </div>}
    </Sheet>
  );
}

// ---------------- Player market ----------------
type Row = { id: string; seller_id: string; seller_name: string; kind: ListingKind; label: string; item: unknown; qty: number; price: number; status: string; claimed: boolean; created_at: string };
export interface MarketOps {
  /** Takes the item out of the save; returns the listing draft or null. */ take: (kind: ListingKind, ref: string, qty: number) => { item: unknown; qty: number; price: number; label: string } | null;
  give: (kind: ListingKind, item: unknown, qty: number) => void;
  pay: (n: number) => boolean; earn: (n: number) => void; save: () => void;
}

function itemIcon(r: { kind: ListingKind; item: unknown }) {
  if (r.kind === "mat") return getMat((r.item as { id: string }).id).icon;
  if (r.kind === "gear") return SLOT_INFO[(r.item as Gear).slot]?.icon ?? "🛡️";
  return "🐾";
}

export function PlayerMarketPanel({ s, userId, onClose, ops }: { s: GameState; userId: string; onClose: () => void; ops: MarketOps }) {
  const [tab, setTab] = useState<"browse" | "sell" | "mine">("browse");
  const [rows, setRows] = useState<Row[]>([]);
  const [mine, setMine] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<"all" | ListingKind>("all");

  const load = useCallback(async () => {
    const [open, own] = await Promise.all([
      supabase.from("market_listings").select("*").eq("status", "open").neq("seller_id", userId).order("created_at", { ascending: false }).limit(100),
      supabase.from("market_listings").select("*").eq("seller_id", userId).or("status.eq.open,and(status.eq.sold,claimed.eq.false)").order("created_at", { ascending: false }).limit(100),
    ]);
    if (open.error || own.error) { setMsg("The market board can't be reached right now."); return; }
    setRows((open.data ?? []) as Row[]); setMine((own.data ?? []) as Row[]);
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const run = async (fn: () => Promise<void>) => { if (busy) return; setBusy(true); setMsg(""); try { await fn(); } finally { setBusy(false); void load(); } };

  const list = (kind: ListingKind, ref: string, qty: number) => run(async () => {
    const d = ops.take(kind, ref, qty); if (!d) { setMsg("That can't be listed."); return; }
    const { error } = await supabase.from("market_listings").insert({ seller_id: userId, seller_name: s.char.name, kind, label: d.label, item: JSON.parse(JSON.stringify(d.item)), qty: d.qty, price: d.price });
    if (error) { ops.give(kind, d.item, d.qty); setMsg("Listing failed — your item is back."); return; }
    ops.save(); setMsg(`Listed ${d.label} for ${fmt(d.price)}g.`);
  });
  const buy = (r: Row) => run(async () => {
    const room = canReceive(s, r.kind); if (room) { setMsg(room); return; }
    if (!ops.pay(r.price)) { setMsg("Not enough gold."); return; }
    const { error } = await supabase.rpc("market_buy", { _id: r.id });
    if (error) { ops.earn(r.price); setMsg("Someone was faster — your gold is back."); return; }
    ops.give(r.kind, r.item, r.qty); ops.save(); setMsg(`Bought ${r.label}.`);
  });
  const cancel = (r: Row) => run(async () => {
    if (canReceive(s, r.kind)) { setMsg(canReceive(s, r.kind)!); return; }
    const { error } = await supabase.rpc("market_cancel", { _id: r.id });
    if (error) { setMsg("It was just sold — collect your gold."); return; }
    ops.give(r.kind, r.item, r.qty); ops.save(); setMsg(`${r.label} is back with you.`);
  });
  const claim = () => run(async () => {
    const { data, error } = await supabase.rpc("market_claim");
    if (error) { setMsg("Couldn't collect right now."); return; }
    const sum = (data ?? []).reduce((a: number, x: { price: number }) => a + Number(x.price), 0);
    if (sum) { ops.earn(sum); ops.save(); setMsg(`Collected ${fmt(sum)}g from ${data!.length} sale${data!.length > 1 ? "s" : ""}.`); }
  });

  const sold = mine.filter((r) => r.status === "sold" && !r.claimed);
  const owed = sold.reduce((a, r) => a + Number(r.price), 0);
  const shown = rows.filter((r) => filter === "all" || r.kind === filter);
  return (
    <Sheet title="🏛️ Player Market" onClose={onClose}>
      <p className="mb-2 text-xs text-muted-foreground">Trade with other adventurers. Prices are set by market value — nobody can change them.</p>
      {owed > 0 && <button className="pixel-btn pixel-btn-primary mb-2 w-full py-2" disabled={busy} onClick={claim}>💰 Collect {fmt(owed)}g from {sold.length} sale{sold.length > 1 ? "s" : ""}</button>}
      <Tabs tabs={[["browse", "🛒 Buy"], ["sell", "📤 Sell"], ["mine", `📋 My listings (${mine.filter((r) => r.status === "open").length})`]]} cur={tab} set={setTab} />
      {msg && <p className="mb-2 text-sm text-accent" role="status">{msg}</p>}
      {tab === "browse" && <>
        <div className="mb-2 flex gap-1">{([["all", "All"], ["mat", "Materials"], ["gear", "Equipment"], ["monster", "Monsters"]] as const).map(([k, l]) => <button key={k} className={`pixel-btn flex-1 py-1 text-xs ${filter === k ? "pixel-btn-active" : ""}`} onClick={() => setFilter(k)}>{l}</button>)}</div>
        {!shown.length && <p className="text-sm text-muted-foreground">No offers right now. Check back later.</p>}
        {shown.map((r) => <ListingRow key={r.id} r={r} right={<button className="pixel-btn px-2 py-1 text-xs" disabled={busy || s.gold < r.price} onClick={() => buy(r)}>{fmt(r.price)}g</button>} />)}
      </>}
      {tab === "sell" && <SellList s={s} busy={busy} onList={list} />}
      {tab === "mine" && <>
        {!mine.filter((r) => r.status === "open").length && <p className="text-sm text-muted-foreground">You have nothing listed.</p>}
        {mine.filter((r) => r.status === "open").map((r) => <ListingRow key={r.id} r={r} mine right={<button className="pixel-btn px-2 py-1 text-xs" disabled={busy} onClick={() => cancel(r)}>Withdraw</button>} />)}
      </>}
    </Sheet>
  );
}

function ListingRow({ r, right, mine }: { r: Row; right: ReactNode; mine?: boolean }) {
  const g = r.kind === "gear" ? (r.item as Gear) : null;
  const c = r.kind === "monster" ? (r.item as Companion) : null;
  return (
    <div className="mb-1 flex items-center gap-2 border-2 border-border p-2 text-sm">
      {c ? <span className="h-8 w-8 shrink-0"><MonsterSprite kind={c.monDef ?? "slime"} name={c.name} boss={0} /></span> : <span className="text-lg">{itemIcon(r)}</span>}
      <span className="min-w-0 flex-1"><span className={`block truncate ${g ? `grade-${g.grade}` : ""}`}>{r.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{g ? `${GRADES[g.grade]}${g.enh ? ` +${g.enh}` : ""} · ` : ""}{c ? `Lv ${compLevel(c.xp)} · ` : ""}{mine ? `listed ${fmt(r.price)}g` : `by ${r.seller_name || "an adventurer"}`}</span></span>
      {right}
    </div>
  );
}

function SellList({ s, busy, onList }: { s: GameState; busy: boolean; onList: (k: ListingKind, ref: string, q: number) => void }) {
  const [kind, setKind] = useState<ListingKind>("mat");
  const [qty, setQty] = useState<Record<string, number>>({});
  const mats = Object.entries(s.inv).filter(([, q]) => q > 0).sort((a, b) => getMat(b[0]).tier - getMat(a[0]).tier);
  const gear = freeGear(s).sort((a, b) => b.grade - a.grade);
  const mons = [...(s.companions ?? []), ...(s.prison ?? [])].filter((c) => c.kind === "monster" && c.rentLeft === undefined);
  return <>
    <div className="mb-2 flex gap-1">{([["mat", "Materials"], ["gear", "Equipment"], ["monster", "Monsters"]] as const).map(([k, l]) => <button key={k} className={`pixel-btn flex-1 py-1 text-xs ${kind === k ? "pixel-btn-active" : ""}`} onClick={() => setKind(k)}>{l}</button>)}</div>
    {s.loc !== "village" && <p className="text-sm text-muted-foreground">List items from the village.</p>}
    {kind === "mat" && (mats.length ? mats.map(([id, have]) => { const q = Math.min(have, Math.max(1, qty[id] ?? 1)); const m = getMat(id); return (
      <div key={id} className="mb-1 border-2 border-border p-2 text-sm">
        <div className="flex items-center gap-2"><span className="text-lg">{m.icon}</span><span className="min-w-0 flex-1 truncate">{m.name} - T{m.tier} <span className="text-xs text-muted-foreground">×{have}</span></span>
          <button className="pixel-btn px-2 py-1 text-xs" disabled={busy} onClick={() => onList("mat", id, q)}>List {q} · {fmt(marketValue(s, "mat", id, q))}g</button></div>
        {have > 1 && <input aria-label={`Amount of ${m.name}`} type="range" min={1} max={have} value={q} onChange={(e) => setQty({ ...qty, [id]: Number(e.target.value) })} className="mt-1 w-full" />}
      </div>); }) : <p className="text-sm text-muted-foreground">No materials to sell.</p>)}
    {kind === "gear" && (gear.length ? gear.map((g) => (
      <div key={g.id} className="mb-1 flex items-center gap-2 border-2 border-border p-2 text-sm">
        <span className="text-lg">{SLOT_INFO[g.slot].icon}</span><span className={`min-w-0 flex-1 truncate grade-${g.grade}`}>{g.name} <span className="text-xs">· {GRADES[g.grade]}{g.enh ? ` +${g.enh}` : ""}</span></span>
        <button className="pixel-btn px-2 py-1 text-xs" disabled={busy} onClick={() => onList("gear", g.id, 1)}>List · {fmt(marketValue(s, "gear", g.id))}g</button>
      </div>)) : <p className="text-sm text-muted-foreground">No spare equipment (equipped gear can't be listed).</p>)}
    {kind === "monster" && (mons.length ? mons.map((c) => (
      <div key={c.id} className="mb-1 flex items-center gap-2 border-2 border-border p-2 text-sm">
        <span className="h-8 w-8 shrink-0"><MonsterSprite kind={c.monDef ?? "slime"} name={c.name} boss={0} /></span><span className="min-w-0 flex-1 truncate">{c.name} <span className="text-xs text-muted-foreground">Lv {compStats(s, c).level}</span></span>
        <button className="pixel-btn px-2 py-1 text-xs" disabled={busy} onClick={() => onList("monster", c.id, 1)}>List · {fmt(marketValue(s, "monster", c.id))}g</button>
      </div>)) : <p className="text-sm text-muted-foreground">No captured monsters. Weaken a monster in battle and capture it.</p>)}
    <p className="mt-2 text-xs text-muted-foreground">Listed items leave your bag. Withdraw a listing any time before it sells; sold listings pay out here.</p>
  </>;
}
