import { useEffect, useRef, useState } from "react";
import { ELEMENT_ICON, SKILLS, STAT_LABEL, getMat } from "./data";
import { BESTIARY } from "./bestiary";
import { POTIONS, DRINKS_PER_FIGHT } from "./alchemy";
import { TOOLS, ammoFor, TOOL } from "./items";
import { captureBlock, combatActives, defendMode, mainSpell, playerStats, race as raceOf, type CombatAct, type Evo, type GameState } from "./engine";
import { fmt } from "./Panels";
import { MonsterSprite } from "./MonsterSprite";
import { useSettings } from "./settings";

export function CombatView({ s, onAct }: { s: GameState; onAct: (a: CombatAct) => void }) {
  const c = s.combat!; const m = c.mon; const p = playerStats(s);
  const st = useSettings();
  const [menu, setMenu] = useState<"main" | "skill" | "item">("main");
  const [floats, setFloats] = useState<{ id: number; t: string; me: boolean }[]>([]);
  const [shake, setShake] = useState(false);
  const prev = useRef({ dealt: c.dealt, taken: c.taken });
  useEffect(() => {
    const dd = c.dealt - prev.current.dealt, dt = c.taken - prev.current.taken;
    prev.current = { dealt: c.dealt, taken: c.taken };
    const add: { id: number; t: string; me: boolean }[] = [];
    if (dd > 0) add.push({ id: Math.random(), t: `-${fmt(dd)}`, me: false });
    if (dt > 0) { add.push({ id: Math.random(), t: `-${fmt(dt)}`, me: true }); if (st.shake && !st.reducedMotion) { setShake(true); setTimeout(() => setShake(false), 250); } }
    if (add.length && st.dmgNumbers) { setFloats((f) => [...f, ...add]); setTimeout(() => setFloats((f) => f.filter((x) => !add.includes(x))), 900); }
  }, [c.dealt, c.taken, st.dmgNumbers, st.shake, st.reducedMotion]);
  const race = raceOf(s);
  const acts = combatActives(s);
  const main = mainSpell(s);
  const dm = defendMode(s);
  const wpn = s.equip.two_hand ?? s.equip.one_hand;
  const weaponName = wpn ? (s.gear.find((g) => g.id === wpn)?.name ?? "weapon") : "fists";
  const shooter = s.ranged && TOOL[s.ranged]?.kind === "ranged" ? TOOL[s.ranged]! : undefined;
  const ammo = shooter ? (s.tools?.[ammoFor(s.ranged!)] ?? 0) : 0;
  const throws = TOOLS.filter((t) => t.kind === "throw" && (s.tools?.[t.id] ?? 0) > 0);
  const potions = POTIONS.filter((x) => (s.potions?.[x.id] ?? 0) > 0);
  const logLines = st.detailedLog ? c.log.slice(0, 6) : c.log.slice(0, 2);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/85 p-2 sm:items-center">
      <div className={`pixel-panel max-h-[96dvh] w-full max-w-md overflow-y-auto p-3 ${shake ? "shake" : ""}`}>
        <div className="relative text-center">
          <div className="mx-auto h-20 w-20"><MonsterSprite kind={m.def} name={m.name} boss={m.boss} /></div>
          {floats.filter((f) => !f.me).map((f) => <span key={f.id} className="float-num text-gold">{f.t}</span>)}
          <h2 className="mt-1 text-base text-accent">{m.name}</h2>
          <div className="text-xs text-muted-foreground">{s.dungeon!.arena ? `🏟️ Arena wave ${(s.arena?.wave ?? 0) + 1}` : `Floor ${s.dungeon!.floor}`} · {m.magical ? "Magic" : "Physical"} · weak {ELEMENT_ICON[m.weak]}{m.weak}{c.charging ? " · ⚠️ CHARGING" : ""}</div>
          <div className="bar bar-hp mt-1"><div style={{ width: `${Math.max(0, (m.hp / m.maxHp) * 100)}%` }} /></div>
          <div className="text-sm">{fmt(Math.max(0, m.hp))}/{fmt(m.maxHp)}</div>
        </div>
        <div className="relative mt-2 space-y-1 text-sm">
          {floats.filter((f) => f.me).map((f) => <span key={f.id} className="float-num text-destructive">{f.t}</span>)}
          <Bar icon="❤️" cls="bar-hp" v={s.hp} max={p.hp} /><Bar icon="🔷" cls="bar-mp" v={s.mp} max={p.mp} /><Bar icon="⚡" cls="bar-sta" v={s.sta} max={p.sta} />
        </div>
        <div className="mt-2 h-24 overflow-hidden text-sm leading-tight">{logLines.map((l, i) => <div key={i} className={i ? "text-muted-foreground" : ""}>{l}</div>)}</div>
        {menu === "main" && <div className="mt-2 grid grid-cols-3 gap-2">
          <button className="pixel-btn pixel-btn-primary py-4" onClick={() => onAct("attack")}>⚔️ Hit<span className="block truncate text-[10px] opacity-80">{weaponName}</span></button>
          {main ? <button className="pixel-btn py-4" disabled={s.mp < main.skill.cost} onClick={() => onAct({ skill: main.index })}>{main.skill.el ? ELEMENT_ICON[main.skill.el] : "🔮"} <span className="text-xs">{main.skill.name}</span><span className="block text-[10px] opacity-80">{main.skill.cost} MP</span></button>
            : <button className="pixel-btn py-4" disabled title="Learn a spell at the Magic Tower">🔮 Magic<span className="block text-[10px] opacity-80">none learned</span></button>}
          <button className="pixel-btn py-4" onClick={() => onAct("defend")}>{dm === "shield" ? "🛡️" : dm === "torch" ? "🔥" : "🙅"} Defend<span className="block text-[10px] opacity-80">{dm === "shield" ? "shield block" : dm === "torch" ? "torch ward" : "brace"}</span></button>
          <button className="pixel-btn py-4" onClick={() => setMenu("item")}>🎒 Items</button>
          <button className="pixel-btn py-4" onClick={() => setMenu("skill")}>✨ Skills</button>
          <button className="pixel-btn py-4" disabled={m.boss > 0} title={m.boss > 0 ? "You cannot flee from a Guardian" : ""} onClick={() => onAct("flee")}>🏃 Flee</button>
        </div>}
        {menu === "skill" && <div className="mt-2 max-h-[45dvh] space-y-1 overflow-y-auto">
          {acts.map((a, i) => <button key={i} className="pixel-btn w-full py-3 text-left" disabled={(a.res === "mp" ? s.mp : s.sta) < a.cost} onClick={() => { onAct({ skill: i }); setMenu("main"); }}>
            {a.spellId ? "🔮 " : ""}{a.name} <span className="text-xs">· {a.cost} {a.res === "mp" ? "MP" : "STA"} · {a.kind}{a.el ? ` ${ELEMENT_ICON[a.el]}` : ""}</span></button>)}
          <button className="pixel-btn w-full py-3 text-left" disabled={c.raceUsed} onClick={() => { onAct("race"); setMenu("main"); }}>{race.icon} {race.active.name} <span className="text-xs">· race · {c.raceUsed ? "used" : "once per fight"}</span></button>
          <button className="pixel-btn w-full py-3 text-left" disabled={!!captureBlock(s)} onClick={() => { onAct("capture"); setMenu("main"); }}>🪢 Capture <span className="text-xs">· {captureBlock(s) ?? "try to tame this monster"}</span></button>
          <button className="pixel-btn w-full py-2" onClick={() => setMenu("main")}>Back</button>
        </div>}
        {menu === "item" && <div className="mt-2 max-h-[45dvh] space-y-1 overflow-y-auto">
          <div className="text-xs text-muted-foreground">🍖 Food · {Math.max(0, 2 - c.eats)} bites left this fight</div>
          {s.foods.map((f, i) => <button key={`f${i}`} className="pixel-btn w-full py-3 text-left" disabled={c.eats >= 2} onClick={() => { onAct({ eat: i }); setMenu("main"); }}>{f.icon} {f.name} ×{f.qty} <span className="text-xs">· +{fmt(f.heal)} HP</span></button>)}
          {!s.foods.length && <p className="text-sm text-muted-foreground">No food — cook some at Home.</p>}
          <div className="pt-1 text-xs text-muted-foreground">🎯 Tools</div>
          {shooter && <button className="pixel-btn w-full py-3 text-left" disabled={!ammo} onClick={() => { onAct("shoot"); setMenu("main"); }}>{shooter.icon} Shoot {shooter.name} <span className="text-xs">· ammo ×{ammo}</span></button>}
          {throws.map((t) => <button key={t.id} className="pixel-btn w-full py-3 text-left" onClick={() => { onAct({ tool: t.id }); setMenu("main"); }}>{t.icon} {t.name} ×{s.tools![t.id]} <span className="text-xs">· {t.desc}</span></button>)}
          {!throws.length && !shooter && <p className="text-sm text-muted-foreground">No usable tools — craft some at the Craftery.</p>}
          {potions.length > 0 && <div className="pt-1 text-xs text-muted-foreground">⚗️ Alchemy · {Math.max(0, DRINKS_PER_FIGHT - (c.drinks ?? 0))} elixirs left this fight{s.oil ? ` · oil: ${s.oil.left} battles` : ""}</div>}
          {potions.map((x) => <button key={x.id} className="pixel-btn w-full py-3 text-left" disabled={x.cat === "elixir" && (c.drinks ?? 0) >= DRINKS_PER_FIGHT} onClick={() => { onAct({ potion: x.id }); setMenu("main"); }}>{x.icon} {x.name} ×{s.potions![x.id]} <span className="text-xs">· {x.desc}</span></button>)}
          <button className="pixel-btn w-full py-2" onClick={() => setMenu("main")}>Back</button>
        </div>}
      </div>
    </div>
  );
}
function Bar({ icon, cls, v, max }: { icon: string; cls: string; v: number; max: number }) {
  return <div className="flex items-center gap-2"><span className="w-5">{icon}</span><div className={`bar ${cls} flex-1`}><div style={{ width: `${Math.max(0, (v / max) * 100)}%` }} /></div><span className="w-24 text-right">{fmt(Math.max(0, v))}/{fmt(max)}</span></div>;
}

export function ResultView({ s, onCollect, onContinue }: { s: GameState; onCollect: () => void; onContinue: () => void }) {
  const r = s.result!;
  const monsterKind = r.kind ?? BESTIARY.find((monster) => monster.icon === r.icon)?.id ?? "sovereign";
  const title = r.died ? "☠️ Defeated" : r.fled ? "🏃 Escaped" : "🏆 Victory!";
  // Finished counters are hidden so only goals still in progress are listed.
  const openPaths = (r.paths ?? []).filter((g) => g.cur < g.need);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/85 p-2 sm:items-center">
      <div className="pixel-panel max-h-[92dvh] w-full max-w-md overflow-y-auto p-3">
        <div className="text-center"><div className="mx-auto h-20 w-20"><MonsterSprite kind={monsterKind} name={r.name} boss={r.boss} /></div>
          <h2 className={`text-lg ${r.died ? "text-destructive" : "text-primary"} title-glow`}>{title}</h2>
          <div className="text-sm text-muted-foreground">{r.name} · Floor {r.floor} · {r.turns} turns</div></div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
          <div className="pixel-panel p-2">⚔️ Dealt <b className="block text-base text-gold">{fmt(r.dealt)}</b></div>
          <div className="pixel-panel p-2">💢 Taken <b className="block text-base text-destructive">{fmt(r.taken)}</b></div>
          <div className="pixel-panel p-2">🌟 XP <b className="block text-base text-xp">+{fmt(r.xp)}</b></div>
          <div className="pixel-panel p-2">💰 Gold <b className="block text-base text-gold">+{fmt(r.gold)}{r.sold ? ` (+${r.sold} sold)` : ""}</b></div>
        </div>
        <div className="mt-1 text-sm">❤️ {fmt(r.hp)}/{fmt(r.maxHp)}</div>
        {r.loot.length > 0 && <><h3 className="mt-2 text-accent">Loot</h3>
          <div className="grid grid-cols-2 gap-1">{r.loot.map((l) => { const m = getMat(l.id); return <div key={l.id} className={`text-sm ${m.tier >= 5 ? "grade-5" : m.tier >= 3 ? "grade-3" : ""}`}>{m.icon} {m.name} ×{l.qty} <span className="text-muted-foreground">T{m.tier}</span></div>; })}</div></>}
        {r.gains.length > 0 && <><h3 className="mt-2 text-accent">Skill progress</h3>
          {r.gains.slice(0, 6).map((g) => <div key={g.k} className="flex justify-between text-sm"><span>{SKILLS[g.k]?.icon} {SKILLS[g.k]?.name ?? g.k}</span><span>+{fmt(g.xp)} xp {g.to > g.from ? <b className="text-xp">Lv {g.from}→{g.to}</b> : `Lv ${g.to}`}</span></div>)}</>}
        {openPaths.length > 0 && <details className="mt-2">
          <summary className="cursor-pointer text-accent">Class progress ({openPaths.length})</summary>
          {openPaths.map((g) => <div key={g.icon + g.label} className="mt-1 text-sm">
            <div className="flex justify-between gap-2"><span className="min-w-0 truncate">{g.icon} {g.label}</span><span className="shrink-0 text-xs text-xp">+{fmt(g.add)}</span></div>
            <div className="bar bar-xp bar-labeled"><div style={{ width: `${Math.min(100, (g.cur / g.need) * 100)}%` }} /><span className="bar-label">{fmt(Math.floor(g.cur))}/{fmt(g.need)}</span></div>
          </div>)}
        </details>}
        {r.died && <p className="mt-2 text-sm text-destructive">You lost your expedition loot and 10% of your gold, and woke up in the village.</p>}
        {/* Pinned to the bottom of the results so the next action never needs scrolling. */}
        <div className="sticky -bottom-3 -mx-3 -mb-3 mt-3 grid gap-2 border-t border-border/60 bg-card p-3">
          {r.won && !r.collected && <button className="pixel-btn w-full py-3" onClick={onCollect}>🎒 Collect loot</button>}
          <button className="pixel-btn pixel-btn-primary w-full py-4" onClick={onContinue}>{r.died ? "Return to village" : r.won && !r.collected ? "Leave loot & continue" : s.arena ? "🏟️ Back to the Arena" : s.loc === "village" ? "Continue" : "Continue crawling"}</button>
        </div>
      </div>
    </div>
  );
}

export function EvoModal({ evo, onOk }: { evo: Evo; onOk: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-3">
      <div className={`pixel-panel evo-burst w-full max-w-md p-4 text-center ${evo.major ? "evo-major" : ""}`}>
        <div className="text-4xl">{evo.major ? "🌟" : "✨"}</div>
        <h2 className="mt-1 text-lg text-gold title-glow">Congratulations!</h2>
        <p className="text-sm text-muted-foreground">Your actions and experience have forged a new path.</p>
        <div className="my-3 text-sm">Class {evo.major ? "Evolved" : "Changed"}:</div>
        <div className="text-base"><span className="text-muted-foreground">{evo.from}</span> → <b className="text-primary">{evo.to}</b></div>
        {evo.bonuses.length > 0 && <div className="mt-3 text-sm"><div className="text-accent">New bonuses</div>{evo.bonuses.join(" · ")}</div>}
        {evo.skills.length > 0 && <div className="mt-2 text-sm"><div className="text-accent">Skills unlocked</div>{evo.skills.join(", ")}</div>}
        {evo.delta.length > 0 && <div className="mt-2 text-sm"><div className="text-accent">Stat changes</div>
          {evo.delta.map((d) => <span key={d.k} className={`mr-2 ${d.d > 0 ? "text-xp" : "text-destructive"}`}>{STAT_LABEL[d.k]} {d.d > 0 ? "+" : ""}{fmt(d.d)}</span>)}</div>}
        <button className="pixel-btn pixel-btn-primary mt-4 w-full py-4" onClick={onOk}>Embrace the path</button>
      </div>
    </div>
  );
}
