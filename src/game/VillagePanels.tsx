import { useEffect, useRef, useState } from "react";
import { ELEMENT_ICON, getMat, type Element } from "./data";
import { SPELL, ASC_RACES, SCHOOL, SCHOOLS, SCHOOL_MAX, SPELLS, STUDY_XP, schoolLevel, studyCost, type SchoolId, type Spell } from "./magic";
import { BLDG_INFO, BLDG_MAX, bldgCost, blessBattles, type BldgId, AILMENTS, BLESSINGS, ENCHANT_ELEMENTS, TOOL, TOOLS, enchantPower, OFFHAND_MAX, offhandFx, offhandUpCost, type AilmentId, type BlessingId, type RangedId, type ToolKind } from "./items";
import { GRADES } from "./data";
import { PathReqs } from "./RacePaths";
import { pathStarted, offhandStats, spotMatsFor, toolGrade, MAX_SPELL_SLOTS, SPELL_LV_BONUS, SPELL_MAX_LV, equippedSpells, spellUpCost, bldgLvl, ascensionProgress, schoolLock, spellLock, ailmentCost, blessingCost, churchHealCost, enchantMatFor, playerStats, type GameState } from "./engine";
import { SPOTS, SPOT_MAX, nextUnlock, spotLevel, spotUpgradeCost, type SpotId } from "./gathering";
import { Sheet } from "./Panels";
import { Avatar } from "./Avatar";
import { AlchemyTab } from "./AlchemyPanel";
import { emojiArt, objArt, icon, sceneArt } from "./art";
const TARGET: Record<SpotId, () => string | undefined> = { forest: () => objArt("T"), mine: () => objArt("R"), pond: () => icon("fish"), ranch: () => objArt("w"), field: () => objArt("F") };
const Em = ({ e, cls }: { e: string; cls?: string }) => { const a = emojiArt(e); return a ? <img src={a} alt={e} draggable={false} className={`gather-img ${cls ?? ""}`} /> : <>{e}</>; };

const fmt = (n: number) => n.toLocaleString();
const DECOR: Record<SpotId, string[]> = { forest: ["🌲", "🌳", "🌲", "🌳", "🌲"], mine: ["🪨", "⛏️", "🪨", "💎", "🪨"], pond: ["🌾", "🪷", "🌾"], ranch: ["🐄", "🐔", "🐑", "🌾"], field: ["🌼", "🌷", "🌻", "🌸", "🌼"] };
const ACT_ICON: Record<SpotId, string> = { forest: "🪓", mine: "⛏️", pond: "🎣", ranch: "🧺", field: "🌼" };

/** Holding the gather button: first repeat after this delay, then one action per interval. */
export const HOLD_DELAY_MS = 350;
/** 12 actions per second — the fastest a player can tap. */
export const HOLD_EVERY_MS = Math.round(1000 / 12);

export function GatherPanel({ s, spot, onClose, onGather, onUpgrade, onPlots }: {
  s: GameState; spot: SpotId; onClose: () => void; onGather: (mat: string) => void; onUpgrade: () => void; onPlots?: (() => void) | undefined;
}) {
  const def = SPOTS[spot]; const L = spotLevel(s.spots, spot); const mats = spotMatsFor(s, spot);
  const [mat, setMat] = useState(mats[mats.length - 1]!);
  const [swing, setSwing] = useState(0);
  const nx = nextUnlock(spot, L); const cost = spotUpgradeCost(spot, L); const max = playerStats(s).sta;
  // Hold-to-repeat: holding the action button keeps gathering until stamina runs out or the finger lifts.
  const latest = useRef({ s, mat, onGather }); latest.current = { s, mat, onGather };
  const hold = useRef<{ delay?: ReturnType<typeof setTimeout>; tick?: ReturnType<typeof setInterval> }>({});
  const [holding, setHolding] = useState(false);
  const gatherOnce = () => {
    const { s: cur, mat: m, onGather: g } = latest.current;
    if (cur.sta < 2) return false;
    g(m); setSwing((n) => n + 1); return true;
  };
  const stopHold = () => { clearTimeout(hold.current.delay); clearInterval(hold.current.tick); hold.current = {}; setHolding(false); };
  const startHold = () => {
    stopHold();
    if (!gatherOnce()) return;
    setHolding(true);
    hold.current.delay = setTimeout(() => {
      hold.current.tick = setInterval(() => { if (!gatherOnce()) stopHold(); }, HOLD_EVERY_MS);
    }, HOLD_DELAY_MS);
  };
  useEffect(() => stopHold, []);
  useEffect(() => { if (s.sta < 2 && holding) stopHold(); }, [s.sta, holding]);
  return (
    <Sheet title={`${def.icon} ${def.name} · Lv ${L}`} onClose={onClose}>
      <div className={`gather-scene gather-${spot}`} style={{ backgroundImage: `url(${sceneArt(spot)})` }}>
        {DECOR[spot].map((d, i) => <span key={i} className="gather-decor" style={{ left: `${6 + i * 22}%`, fontSize: 18 + (i % 2) * 8 + Math.min(L, 100) / 10 }}><Em e={d} /></span>)}
        {spot === "pond" && [0, 1, 2].map((i) => <span key={i} className="gather-ripple" style={{ animationDelay: `${i * 0.5}s`, bottom: `${10 + i * 8}%` }} />)}
        {spot === "pond" && [0, 1].map((i) => <img key={`lp${i}`} src={icon("lilypad")} alt="" draggable={false} className="gather-lilypad" style={{ right: `${8 + i * 22}%`, bottom: `${6 + i * 14}%`, animationDelay: `${i * 0.9}s` }} />)}
        <div className={`gather-hero ${swing ? "gather-swing" : ""}`} key={`h${swing}`}><Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} dir="r" frame={swing % 2 ? 1 : 0} /></div>
        <div className="gather-tool"><Em e={ACT_ICON[spot]} /></div>
        <div className="gather-target">{TARGET[spot]() ? <img src={TARGET[spot]()} alt={getMat(mat).name} draggable={false} className="gather-img" /> : getMat(mat).icon}</div>
        {swing > 0 && <span key={`p${swing}`} className="gather-pop">+{getMat(mat).icon}</span>}
      </div>
      <div className="mb-2 flex justify-between text-sm"><span>⚡ Stamina {Math.floor(s.sta)}/{max}</span><span className="text-muted-foreground">2 per action</span></div>
      <div className="mb-2 grid grid-cols-3 gap-1">
        {def.mats.map(([m, lv]) => { const ok = mats.includes(m); return (
          <button key={m} disabled={!ok} className={`pixel-btn flex flex-col items-center py-2 ${mat === m ? "pixel-btn-active" : ""}`} onClick={() => setMat(m)}>
            <span className="text-lg">{ok ? getMat(m).icon : "🔒"}</span>
            <span className="text-[0.65rem] leading-tight">{getMat(m).name}</span>
            <span className="text-[0.6rem] text-muted-foreground">{ok ? `T${getMat(m).tier} · ×${s.inv[m] ?? 0}` : `Lv ${lv}`}</span>
          </button>); })}
      </div>
      <button className={`pixel-btn pixel-btn-primary hold-btn mb-1 w-full py-4 text-lg ${holding ? "pixel-btn-active" : ""}`} disabled={s.sta < 2}
        onPointerDown={(e) => { if (e.button > 0) return; e.currentTarget.setPointerCapture?.(e.pointerId); startHold(); }}
        onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => { if (e.detail === 0) gatherOnce(); /* keyboard activation; pointer presses are handled above */ }}>
        {s.sta < 2 ? "Too tired — rest or eat" : `${ACT_ICON[spot]} ${def.verb} ${getMat(mat).name}`}
      </button>
      <p className="mb-3 text-center text-xs text-muted-foreground">{holding ? "Keep holding to keep going…" : "Tip: hold the button to keep going"}</p>
      {onPlots && <button className="pixel-btn mb-3 w-full py-3" onClick={onPlots}>🌱 Open crop plots</button>}
      <div className="border-t-2 border-border pt-2">
        <h3 className="text-accent">Upgrade {def.name}</h3>
        {L >= SPOT_MAX ? <p className="text-sm text-muted-foreground">Fully upgraded.</p> : <>
          <p className="text-sm">Next: Lv {L + 1}{nx ? ` · ${getMat(nx[0]).name} (T${getMat(nx[0]).tier}) unlocks at Lv ${nx[1]}` : ""}. Bigger harvests. A new tier opens every 10 levels.</p>
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
            <span className="text-xl">{b.icon}</span><span className="min-w-0 flex-1"><span className="block text-sm">{b.name}</span><span className="block text-xs text-muted-foreground">{b.desc} · {blessBattles(bldgLvl(s, "church"))} battles</span></span><span className="text-xs">{fmt(cost)}g</span>
          </button>); })}
        <p className="text-xs text-muted-foreground">Only one blessing can be active; a new one replaces the old.</p>
      </>}
      {tab === "ench" && <>
        {!gears.length && <p className="text-sm text-muted-foreground">Craft a weapon or off-hand shield first.</p>}
        {sel && <>
          <select className="pixel-btn mb-2 w-full p-2 text-sm" value={sel.id} onChange={(e) => setGid(e.target.value)}>
            {gears.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.slot === "shield" ? "off-hand" : "weapon"}){g.ench ? ` · ${ELEMENT_ICON[g.ench.el]}${g.ench.v}%` : ""}</option>)}
          </select>
          <p className="mb-2 text-xs text-muted-foreground">{sel.slot === "shield" ? `Off-hand shield: reduces damage from monsters of that element by ${Math.min(50, enchantPower(sel.grade) * 2)}%+ and +5% defense.` : `Weapon: attacks take the element and deal +${enchantPower(sel.grade)}%+ damage (hit weaknesses for 1.5×).`} Rare essences add +5%.</p>
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

export function CrafteryPanel({ s, onClose, onCraft, onRanged, onUpgrade, onBrew, onUsePotion }: { s: GameState; onClose: () => void; onCraft: (id: string, times: number) => void; onRanged: (id: RangedId | undefined) => void; onUpgrade: (id: string) => void; onBrew: (id: string, times: number) => void; onUsePotion: (id: string) => void }) {
  const [tab, setTab] = useState<ToolKind | "alchemy">("throw");
  return (
    <Sheet title="🪤 Craftery" onClose={onClose}>
      <div className="mb-2 grid grid-cols-6 gap-1">
        {([["throw", "🔪 Throw"], ["trap", "🪤 Traps"], ["ammo", "➶ Ammo"], ["ranged", "🏹 Ranged"], ["torch", "🔥 Torch"], ["alchemy", "⚗️ Alchemy"]] as const).map(([t, l]) => <button key={t} className={`pixel-btn min-w-0 px-0.5 py-2 text-[0.65rem] ${tab === t ? "pixel-btn-active" : ""}`} onClick={() => setTab(t)}>{l}</button>)}
      </div>
      {tab === "alchemy" ? <AlchemyTab s={s} onBrew={onBrew} onUse={onUsePotion} /> : <>
      <p className="mb-2 text-xs text-muted-foreground">{tab === "trap" ? "In the dungeon, press and hold an empty floor tile (up to 3 steps away) to set a trap." : tab === "throw" ? "Single-use items — throw them from the Items menu in battle." : tab === "ammo" ? "Each Shoot uses one round of your off-hand's ammo." : tab === "torch" ? `Torches go in your off-hand instead of a shield or ranged weapon. They light up more of the dungeon and burn foes whenever you attack or defend. Upgrade a torch you own, from Common to EX, for defense, attack and stronger effects. Readied: ${s.ranged ? TOOL[s.ranged]!.name : "none"}.` : `Off-hand ranged weapons replace your shield or torch; two-handed ones also stow your one-handed weapon. Upgrade one you own, from Common to EX, for stronger shots and defense. Readied: ${s.ranged ? TOOL[s.ranged]!.name : "none"}.`}</p>
      {TOOLS.filter((t) => t.kind === tab).map((t) => { const have = s.tools?.[t.id] ?? 0; const locked = (t.lvl ?? 1) > bldgLvl(s, "craftery"); const ok = !locked && s.gold >= t.gold && t.recipe.every(([m, q]) => (s.inv[m] ?? 0) >= q); const held = t.kind === "ranged" || t.kind === "torch"; const owned = held && have > 0; return (
        <div key={t.id} className="mb-1 border-2 border-border p-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{t.icon}</span>
            <div className="min-w-0 flex-1"><div className="text-sm">{t.name} {!held && <span className="text-xs text-muted-foreground">×{have}</span>}</div><div className="text-xs text-muted-foreground">{t.two ? "🙌 Two-handed · " : held ? "Off-hand · " : ""}{t.desc}{t.uses ? ` (uses ${TOOL[t.uses]?.name})` : ""}{locked ? ` · 🔒 Craftery Lv ${t.lvl}` : ""}</div></div>
          </div>
          <div className="mt-1 text-[0.7rem] text-muted-foreground">{fmt(t.gold)}g · {t.recipe.map(([m, q]) => `${q}× ${getMat(m).name} (${s.inv[m] ?? 0})`).join(" · ")}{t.makes > 1 ? ` → makes ${t.makes}` : ""}</div>
          <div className="mt-1 flex gap-1">
            {!owned && <button className="pixel-btn flex-1 py-2 text-xs" disabled={!ok} onClick={() => onCraft(t.id, 1)}>Craft</button>}
            {!owned && !held && <button className="pixel-btn flex-1 py-2 text-xs" disabled={!ok} onClick={() => onCraft(t.id, 5)}>Craft ×5</button>}
            {owned && <button className="pixel-btn flex-1 py-2 text-xs" onClick={() => onRanged(s.ranged === t.id ? undefined : t.id as RangedId)}>{s.ranged === t.id ? "Unequip" : "Ready in off-hand"}</button>}
          </div>
          {owned && <OffhandGrade s={s} id={t.id} onUpgrade={onUpgrade} />}
        </div>); })}
      </>}
    </Sheet>
  );
}

/** Grade, stats and next upgrade of an owned torch or ranged weapon. */
function OffhandGrade({ s, id, onUpgrade }: { s: GameState; id: string; onUpgrade: (id: string) => void }) {
  const t = TOOL[id]!; const g = toolGrade(s, id); const st = offhandStats(id, g); const fx = offhandFx(t, g);
  const c = g < OFFHAND_MAX ? offhandUpCost(t, g + 1) : null; const cl = bldgLvl(s, "craftery");
  const ok = !!c && cl >= c.lvl && s.gold >= c.gold && c.mats.every(([m, q]) => (s.inv[m] ?? 0) >= q);
  const n = (x: number) => Math.round(x).toLocaleString();
  return (
    <div className="mt-1 border-t border-border/60 pt-1 text-[0.7rem]">
      <div><span className={`grade-${g}`}>{GRADES[g]}</span> <span className="text-muted-foreground">· +{n(st.patk)} P.Atk · +{n(st.matk)} M.Atk · +{n(st.pdef)} P.Def · +{n(st.mdef)} M.Def · +{n(st.hp)} HP</span></div>
      <div className="text-muted-foreground">{t.kind === "torch" ? `Light +${fx.sight.toFixed(1)} · fire ×${fx.fire.toFixed(2)}${t.fx ? ` · effect ${fx.chance}%` : ""}${fx.fireWard ? ` · −${fx.fireWard}% fire damage taken` : ""}` : `Shoot ×${fx.mult.toFixed(1)}`}</div>
      {c ? <>
        <div className="mt-0.5 text-muted-foreground">Next ({GRADES[g + 1]}): {fmt(c.gold)}g · {c.mats.map(([m, q]) => `${q}× ${getMat(m).name} (${s.inv[m] ?? 0})`).join(" · ")}{cl < c.lvl ? ` · 🔒 Craftery Lv ${c.lvl}` : ""}</div>
        <button className="pixel-btn mt-1 w-full py-2 text-xs" disabled={!ok} onClick={() => onUpgrade(id)}>⬆️ Upgrade to {GRADES[g + 1]}</button>
      </> : <div className="text-gold">Maximum grade reached.</div>}
    </div>
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

function spellText(sp: Spell, lv: number) {
  const lm = 1 + (lv - 1) * SPELL_LV_BONUS;
  switch (sp.kind) {
    case "heal": return `Heals ${Math.round(sp.mult * lm * 100)}% HP`;
    case "guard": return "Guard: big damage cut for 2 turns";
    case "lock": return `HP lock for ${sp.mult} turns`;
    case "drain": return `Drain ×${(sp.mult * lm).toFixed(1)}, heals 40%`;
    case "phys": return `Strike ×${(sp.mult * lm).toFixed(1)}`;
    default: return `Spell damage ×${(sp.mult * lm).toFixed(1)}`;
  }
}

export function MagicPanel({ s, onClose, onLearn, onStudy, onAscend, onToggle, onLevel }: { s: GameState; onClose: () => void; onToggle: (id: string) => void; onLevel: (id: string) => void; onLearn: (id: SchoolId) => void; onStudy: (id: SchoolId) => void; onAscend: (race: string) => void }) {
  const [tab, setTab] = useState<"schools" | "spells" | "rituals">("schools");
  const [open, setOpen] = useState<Partial<Record<SchoolId, boolean>>>({});
  const [showAll, setShowAll] = useState<Partial<Record<SchoolId, boolean>>>({});
  const [ritualAll, setRitualAll] = useState(false);
  const matk = Math.round(playerStats(s).matk);
  const known = SCHOOLS.filter((x) => s.magic?.[x.id] !== undefined);
  return (
    <Sheet title="🔮 Magic Tower" onClose={onClose}>
      <div className="mb-2 flex gap-1">
        {([["schools", "📚 Schools"], ["spells", "✨ Spells"], ["rituals", "🌑 Rituals"]] as const).map(([t, l]) => <button key={t} className={`pixel-btn flex-1 py-2 text-xs ${tab === t ? "pixel-btn-active" : ""}`} onClick={() => setTab(t)}>{l}</button>)}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">Your M.Atk: {fmt(matk)} · Spells unlock once school level and M.Atk are high enough. Only 4 can be equipped for battle.</p>
      {tab === "schools" && SCHOOLS.map((sc) => { const xp = s.magic?.[sc.id]; const L = xp === undefined ? 0 : schoolLevel(xp); const lock = xp === undefined ? schoolLock(s, sc.id) : null; const hidden = !!sc.combo && xp === undefined && !!lock && lock.startsWith("Undiscovered"); return (
        <div key={sc.id} className="mb-1 border-2 border-border p-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{hidden ? "❔" : sc.icon}</span>
            <div className="min-w-0 flex-1"><div className="text-sm">{hidden ? "Unknown combined magic" : sc.name}{xp !== undefined && <span className="text-gold"> · Lv {L}/{SCHOOL_MAX}</span>}</div>
              <div className="text-xs text-muted-foreground">{hidden ? lock : sc.desc}{sc.combo && !hidden ? ` (${SCHOOL[sc.combo[0]].name} + ${SCHOOL[sc.combo[1]].name})` : ""}</div></div>
          </div>
          {xp === undefined && !hidden && <button className="pixel-btn mt-1 w-full py-2 text-xs" disabled={!!lock || s.gold < sc.gold} onClick={() => onLearn(sc.id)}>{lock ?? `${sc.combo ? "Discover" : "Learn"} · ${fmt(sc.gold)}g`}</button>}
          {xp !== undefined && L < SCHOOL_MAX && <button className="pixel-btn mt-1 w-full py-2 text-xs" disabled={s.gold < studyCost(L)} onClick={() => onStudy(sc.id)}>📘 Study (+{STUDY_XP} xp) · {fmt(studyCost(L))}g</button>}
        </div>); })}
      {tab === "spells" && <>
        {!known.length && <p className="text-sm text-muted-foreground">Learn a school first.</p>}
        {known.length > 0 && <div className="mb-2 border-2 border-gold p-2">
          <div className="mb-1 text-sm text-gold">Equipped spells {equippedSpells(s).length}/{MAX_SPELL_SLOTS}</div>
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: MAX_SPELL_SLOTS }, (_, i) => { const id = equippedSpells(s)[i]; const sp = id ? SPELL[id] : undefined; return (
              <button key={i} className="pixel-btn min-h-[2.6rem] p-1 text-left text-xs" disabled={!sp} onClick={() => sp && onToggle(sp.id)}>
                {sp ? <>{SCHOOL[sp.school].icon} {sp.name} <span className="text-gold">Lv {s.spellLv?.[sp.id] ?? 1}</span><span className="block text-[0.6rem] text-muted-foreground">tap to unequip</span></> : <span className="text-muted-foreground">— empty slot —</span>}
              </button>); })}
          </div>
        </div>}
        {known.map((sc) => { const list = SPELLS.filter((sp) => sp.school === sc.id); const got = list.filter((sp) => s.spells?.includes(sp.id)).length; const L = schoolLevel(s.magic?.[sc.id] ?? 0); const isOpen = open[sc.id] ?? known.length === 1; const all = showAll[sc.id];
          const next = new Set(list.filter((sp) => !s.spells?.includes(sp.id)).slice(0, 3).map((sp) => sp.id));
          const shown = all ? list : list.filter((sp) => s.spells?.includes(sp.id) || next.has(sp.id));
          return <div key={sc.id} className="mb-2">
          <button className="pixel-btn flex w-full items-center justify-between px-2 py-1.5 text-left text-sm" onClick={() => setOpen((o) => ({ ...o, [sc.id]: !isOpen }))}>
            <span className="text-accent">{sc.icon} {sc.name} <span className="text-xs text-muted-foreground">Lv {L}/{SCHOOL_MAX}</span></span>
            <span className="text-xs text-gold">{got}/{list.length} learned {isOpen ? "▲" : "▼"}</span>
          </button>
          {isOpen && <>{shown.map((sp) => { const has = s.spells?.includes(sp.id); const on = equippedSpells(s).includes(sp.id); const lv = s.spellLv?.[sp.id] ?? 1; const uc = spellUpCost(sp.id, lv); return (
            <div key={sp.id} className={`border-b border-border py-1 text-sm ${has ? "" : "text-muted-foreground"}`}>
              <div className="flex justify-between gap-1"><span>{has ? (on ? "🟢" : "⚪") : "🔒"} {sp.name}{has && <span className="text-gold"> Lv {lv}/{SPELL_MAX_LV}</span>}</span>
                <span className="shrink-0 text-xs">{Math.round(sp.cost * (1 + (lv - 1) * 0.05))} MP</span></div>
              <div className="text-xs text-muted-foreground">{spellText(sp, lv)}{sp.el ? ` ${ELEMENT_ICON[sp.el]}` : ""} · School Lv {sp.lvl}</div>
              {!has && <div className="text-xs">Requires {spellLock(s, sp.id)}</div>}
              {has && <div className="mt-1 flex gap-1">
                <button className="pixel-btn flex-1 py-1 text-xs" disabled={!on && equippedSpells(s).length >= MAX_SPELL_SLOTS} onClick={() => onToggle(sp.id)}>{on ? "Unequip" : equippedSpells(s).length >= MAX_SPELL_SLOTS ? "Slots full" : "Equip"}</button>
                <button className="pixel-btn flex-1 py-1 text-xs" disabled={lv >= SPELL_MAX_LV || s.gold < uc} onClick={() => onLevel(sp.id)}>{lv >= SPELL_MAX_LV ? "MAX" : `📈 Lv up · ${fmt(uc)}g (+${Math.round(SPELL_LV_BONUS * 100)}%)`}</button>
              </div>}
            </div>); })}
          {list.length > shown.length || all ? <button className="pixel-btn mt-1 w-full py-1 text-xs" onClick={() => setShowAll((o) => ({ ...o, [sc.id]: !all }))}>{all ? "Show fewer" : `Show all ${list.length} spells`}</button> : null}
          </>}
        </div>; })}
      </>}
      {tab === "rituals" && <>
        <p className="mb-2 text-xs text-muted-foreground">Forbidden rites can transform your race. Most counters only start once you know a spell of that school; each line says how it is earned. Battle results show any progress you make.{s.char.origin ? ` Born a ${s.char.origin}.` : ""}</p>
        {(() => { const all = ascensionProgress(s); const started = all.filter((a) => pathStarted(a) || s.char.race === a.race); return (
          <div className="mb-2 flex gap-1">
            <button className={`pixel-btn flex-1 py-1 text-xs ${!ritualAll ? "pixel-btn-active" : ""}`} onClick={() => setRitualAll(false)}>Started ({started.length})</button>
            <button className={`pixel-btn flex-1 py-1 text-xs ${ritualAll ? "pixel-btn-active" : ""}`} onClick={() => setRitualAll(true)}>All races ({all.length})</button>
          </div>); })()}
        {!ritualAll && !ascensionProgress(s).some((a) => pathStarted(a) || s.char.race === a.race) && <p className="text-xs text-muted-foreground">No path started yet — learn the school a race needs to begin. See “All races”.</p>}
        {ascensionProgress(s).filter((a) => ritualAll || pathStarted(a) || s.char.race === a.race).map((a) => { const r = ASC_RACES.find((x) => x.id === a.race)!; const cur = s.char.race === a.race; return (
          <div key={a.race} className="mb-1 border-2 border-border p-2">
            <div className="text-sm">{r.icon} {r.name} {cur && <span className="text-gold">· your race</span>}</div>
            <div className="text-xs text-muted-foreground">{r.passive.name}: {r.passive.desc} · {r.active.name}: {r.active.desc}</div>
            <PathReqs a={a} />
            {!cur && <button className="pixel-btn mt-1 w-full py-2 text-xs" disabled={!a.ready} onClick={() => onAscend(a.race)}>{a.failed ? "Path closed" : a.ready ? `Become a ${r.name}` : "Conditions not met"}</button>}
          </div>); })}
      </>}
    </Sheet>
  );
}

/** Compact building-level bar shown under the interior scene of upgradeable buildings. */
export function BldgUpgrade({ s, b, onUp }: { s: GameState; b: BldgId; onUp: () => void }) {
  const L = bldgLvl(s, b); const c = bldgCost(L);
  return (
    <div className="flex shrink-0 items-center gap-2 border-b-2 border-border px-2 py-1 text-xs">
      <span className="min-w-0 flex-1"><b className="text-gold">{BLDG_INFO[b].name} Lv {L}</b> · <span className="text-muted-foreground">{BLDG_INFO[b].perk(L)}</span>
        {L < BLDG_MAX && <span className="block text-muted-foreground">Next: {BLDG_INFO[b].perk(L + 1)}</span>}</span>
      {L < BLDG_MAX ? <button className="pixel-btn shrink-0 px-2 py-1 text-xs" disabled={s.gold < c} onClick={onUp}>⬆️ {fmt(c)}g</button> : <span className="text-gold">MAX</span>}
    </div>
  );
}
