// Profile › Classes extras: playstyle (3-aspect) class, linear specializations, build synergies and the class codex.
import { useState } from "react";
import { AFF_BY_ID } from "./data";
import { SCHOOL, type SchoolId } from "./magic";
import { TRIAD, TRIAD_CLASSES, TRIAD_SCALE, findTriad, type ClassRole } from "./playstyleClasses";
import { SPEC_TRACKS, specRank } from "./specializations";
import { SYNERGIES } from "./synergies";
import { activeSynergies, buildInput, classScores, computeClass, classIdByName, raceClassProgress, type GameState } from "./engine";
import { fmt } from "./Panels";

const aspectName = (a: string) => AFF_BY_ID[a] ? `${AFF_BY_ID[a]!.icon} ${AFF_BY_ID[a]!.name}` : SCHOOL[a as SchoolId] ? `${SCHOOL[a as SchoolId].icon} ${SCHOOL[a as SchoolId].name}` : a;
const ROLE: Record<ClassRole, string> = { striker: "⚔️ Striker", tank: "🛡️ Tank", caster: "🔮 Caster", specialist: "🧰 Specialist", hybrid: "♾️ Hybrid" };
const modText = (m: Record<string, number>, k = 1) => Object.entries(m).map(([s, v]) => ["crit", "dodge", "acc"].includes(s) ? `+${Math.round(v * k * 100)} ${s}` : `${v < 0 ? "" : "+"}${Math.round(v * k * 100)}% ${s}`).join(", ");

export function PlaystyleBlock({ s }: { s: GameState }) {
  const c = computeClass(s); const tri = c.triad ? TRIAD[c.triad] : undefined;
  const scores = classScores(s).aspect;
  const recommended = [...TRIAD_CLASSES].sort((a, b) => b.triad.reduce((n, k) => n + (scores[k] ?? 0), 0) - a.triad.reduce((n, k) => n + (scores[k] ?? 0), 0))[0];
  const top = Object.entries(scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const match = top.length === 3 ? findTriad(top[0]![0], top[1]![0], top[2]![0]) : undefined;
  return (
    <div className="pixel-panel mb-2 p-2 text-sm">
      <div className="text-accent">Playstyle class</div>
      {tri ? <>
        <div><b className="text-primary">{c.name}</b> <span className="text-xs text-muted-foreground">· {ROLE[tri.role]}</span></div>
        <p className="text-xs text-muted-foreground">{tri.desc}</p>
        <div className="text-xs">Aspects: {tri.triad.map(aspectName).join(" + ")}</div>
        <div className="text-xs">Bonus: {modText(tri.mods, TRIAD_SCALE[Math.max(0, c.tier)] ?? 1)}</div>
        <div className="text-xs text-muted-foreground">Style: {tri.traits.join(" · ")}</div>
      </> : <p className="text-xs text-muted-foreground">Grow three strong aspects — affinities and mastered special magic schools (Summoning, Soul, Transformation, Blood, Necromancy, Plague, Tempest, Magma) — to become a playstyle class such as Druid (Transformation + Nature + Might). Elemental schools strengthen their matching affinity.</p>}
      {recommended && <p className="text-xs text-gold">Suggested path: {recommended.name}. Raise {recommended.triad.slice().sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0)).map(aspectName).join(" + ")} — weakest first.</p>}
      <div className="mt-1 text-xs">Strongest aspects: {top.map(([a, v]) => `${aspectName(a)} ${Math.round(v)}`).join(" · ") || "none yet"}</div>
      {!tri && match && <div className="text-xs text-gold">These three point toward: {match.name} (needs class tier 1 and a third aspect at least 35% of your strongest).</div>}
    </div>
  );
}

export function SpecBlock({ s, onSpec }: { s: GameState; onSpec: (id: string | undefined) => void }) {
  return (
    <div className="pixel-panel mb-2 p-2 text-sm">
      <details><summary className="cursor-pointer text-accent">Specializations</summary>
      <p className="text-xs text-muted-foreground">Paths rank up from what you do. Choose one unlocked path to gain its current rank bonus.</p>
      {SPEC_TRACKS.map((t) => { const r = specRank(t, s.stats); const cur = s.stats[t.stat] ?? 0; const next = t.ranks[r + 1]; const on = s.spec === t.id; return (
        <div key={t.id} className={`mt-1 border-2 p-1.5 ${on ? "border-primary" : "border-border"}`}>
          <div className="flex items-center justify-between gap-2"><span>{t.icon} {t.name}</span>
            <button className="pixel-btn px-2 py-1 text-xs" disabled={r < 0} onClick={() => onSpec(on ? undefined : t.id)}>{on ? "Clear" : r < 0 ? "Locked" : "Choose"}</button></div>
          <div className="text-xs">{r >= 0 ? <><b>{t.ranks[r]!.name}</b> · {modText(t.ranks[r]!.mods)}</> : <span className="text-muted-foreground">Not unlocked</span>}</div>
          <div className="text-[0.65rem] text-muted-foreground">{t.how} · {fmt(cur)}{next ? ` / ${fmt(next.need)} for ${next.name}` : " · highest rank"}</div>
          {next && <div className="bar bar-xp my-0.5"><div style={{ width: `${Math.min(100, (cur / next.need) * 100)}%` }} /></div>}
        </div>); })}
      </details>
    </div>
  );
}

export function SynergyBlock({ s }: { s: GameState }) {
  const act = new Set(activeSynergies(s).map((x) => x.id)); const b = buildInput(s);
  const [all, setAll] = useState(false);
  return (
    <div className="pixel-panel mb-2 p-2 text-sm">
      <details><summary className="cursor-pointer text-accent">Build synergies</summary><div className="flex items-center justify-between">
        <button className="pixel-btn px-2 py-1 text-xs" onClick={() => setAll((x) => !x)}>{all ? "Active only" : `All (${SYNERGIES.length})`}</button></div>
      <div className="text-[0.65rem] text-muted-foreground">Weapon: {b.arch ?? "none"} · Off-hand: {b.offhand} · Title: {b.title ?? "none"}</div>
      {SYNERGIES.filter((x) => all || act.has(x.id)).map((x) => <div key={x.id} className={`mt-1 border-b border-border/30 pb-1 text-xs ${act.has(x.id) ? "" : "text-muted-foreground"}`}>
        <div>{act.has(x.id) ? "✅" : "⬜"} {x.icon} <b>{x.name}</b> · {modText(x.mods)}{x.el ? `, +${Math.round(x.el.bonus * 100)}% ${x.el.el} damage` : ""}</div>
        <div className="text-[0.65rem]">{x.desc} Needs: {x.hint}.</div></div>)}
      {!all && !act.size && <p className="text-xs text-muted-foreground">No synergy active yet — combine your race, class, title, weapon and off-hand.</p>}</details>
    </div>
  );
}

export function ClassCodex({ s, onPick }: { s: GameState; onPick: (id: string | undefined) => void }) {
  const [open, setOpen] = useState(false); const [role, setRole] = useState<ClassRole | "all">("all");
  const seen = (n: string) => s.classesSeen.some((x) => x === n || x.endsWith(` ${n}`));
  const list = TRIAD_CLASSES.filter((c) => role === "all" || c.role === role);
  return (
    <div className="pixel-panel mb-2 p-2 text-sm">
      <button className="pixel-btn w-full py-1 text-xs" onClick={() => setOpen((o) => !o)}>📖 Class codex · {TRIAD_CLASSES.filter((c) => seen(c.name)).length}/{TRIAD_CLASSES.length} discovered {open ? "▲" : "▼"}</button>
      {open && <>
        <h4 className="text-accent">Discovered classes</h4>
        {!raceClassProgress(s) && <button className="pixel-btn my-1 px-2 py-1 text-xs" onClick={() => onPick(undefined)}>Follow playstyle</button>}
        {s.classesSeen.map((name) => { const id = classIdByName(name); return <div key={name} className="flex items-center justify-between gap-2 border-b border-border/30 py-1 text-xs"><span>{name}</span>{id && !raceClassProgress(s) && <button className="pixel-btn px-2 py-1" disabled={s.classPick === id} onClick={() => onPick(id)}>{s.classPick === id ? "Selected" : "Choose"}</button>}</div>; })}
        <h4 className="mt-2 text-accent">Three-aspect classes</h4>
        <div className="my-1 flex flex-wrap gap-1">{(["all", "striker", "tank", "caster", "specialist", "hybrid"] as const).map((r) => <button key={r} className={`pixel-btn px-2 py-0.5 text-[0.65rem] ${role === r ? "pixel-btn-active" : ""}`} onClick={() => setRole(r)}>{r === "all" ? "All" : ROLE[r]}</button>)}</div>
        {list.map((c) => <div key={c.id} className="border-b border-border/30 py-0.5 text-xs">
          <span className={seen(c.name) ? "text-primary" : ""}>{seen(c.name) ? "✅" : "▫️"} {c.name}</span> <span className="text-muted-foreground">· {c.triad.map(aspectName).join(" + ")}</span></div>)}
      </>}
    </div>
  );
}
