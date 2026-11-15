// Ascension path progress: each lore condition with a bar, its current count and how it is earned.
import { ascensionProgress, type GameState } from "./engine";
import { ASC_RACES, SCHOOL } from "./magic";
import { fmt } from "./Panels";

type Path = ReturnType<typeof ascensionProgress>[number];

export function PathReqs({ a }: { a: Path }) {
  return <>
    <div className={`text-xs ${a.learned ? "text-gold" : ""}`}>{a.learned ? "✅" : "⬜"} Learn {SCHOOL[a.school].name}</div>
    {a.reqs.map((q) => { const pct = Math.max(0, Math.min(100, (q.cur / q.need) * 100)); return (
      <div key={q.stat} className="mt-1 text-xs">
        <div className={`flex justify-between gap-2 ${q.ok ? "text-gold" : q.failed ? "text-destructive" : ""}`}>
          <span>{q.ok ? "✅" : q.failed ? "❌" : "⬜"} {q.label}</span><span className="shrink-0">{fmt(Math.floor(q.cur))} / {fmt(q.need)}</span>
        </div>
        <div className="bar bar-xp my-0.5"><div style={{ width: `${q.failed ? 100 : pct}%` }} /></div>
        <div className="text-[0.65rem] text-muted-foreground">{q.hint}</div>
      </div>); })}
  </>;
}

/** Compact list of ascension paths the hero has started (school learned or any progress made). */
export function StartedPaths({ s }: { s: GameState }) {
  const list = ascensionProgress(s).filter((a) => s.char.race !== a.race && (a.learned || a.reqs.some((r) => r.stat !== "maxFloor" && r.cur > 0)));
  return (
    <div className="pixel-panel mb-2 p-2 text-sm">
      <div className="text-accent">Race paths</div>
      {!list.length && <p className="text-xs text-muted-foreground">No transformation path started yet. Learn Blood Magic, Soul Binding, Transformation, Necromancy or Plague Craft at the Magic Tower to begin one.</p>}
      {list.map((a) => { const r = ASC_RACES.find((x) => x.id === a.race)!; return (
        <div key={a.race} className="border-b border-border/30 py-1 last:border-0">
          <div>{r.icon} {r.name} {a.ready ? <span className="text-gold">· ready at the Magic Tower</span> : a.failed ? <span className="text-destructive">· path closed</span> : null}</div>
          <PathReqs a={a} />
        </div>); })}
    </div>
  );
}
