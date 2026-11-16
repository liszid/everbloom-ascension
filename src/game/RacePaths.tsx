// Ascension path progress: each lore condition with a bar, its current count and how it is earned.
import { useState } from "react";
import { ascensionProgress, pathCloseness, pathStarted, pathState, schoolLock, type GameState, type PathState } from "./engine";
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
  const list = ascensionProgress(s).filter((a) => s.char.race !== a.race && pathStarted(a));
  return (
    <div className="pixel-panel mb-2 p-2 text-sm">
      <div className="text-accent">Race paths</div>
      {!list.length && <p className="text-xs text-muted-foreground">No transformation path started yet. Learn a magic school at the Magic Tower to begin one — each race path names the school it needs (Magic Tower › Rituals).</p>}
      {list.map((a) => { const r = ASC_RACES.find((x) => x.id === a.race)!; return (
        <div key={a.race} className="border-b border-border/30 py-1 last:border-0">
          <div>{r.icon} {r.name} {a.ready ? <span className="text-gold">· ready at the Magic Tower</span> : a.failed ? <span className="text-destructive">· path closed</span> : null}</div>
          <PathReqs a={a} />
        </div>); })}
    </div>
  );
}

const RANK: Record<PathState, number> = { current: 0, ready: 1, open: 2, locked: 3, closed: 4 };
const TAG: Record<PathState, [string, string]> = {
  current: ["your race", "text-gold"],
  ready: ["ready", "text-gold"],
  open: ["available", "text-accent"],
  locked: ["locked", "text-muted-foreground"],
  closed: ["closed", "text-destructive"],
};
type RitualFilter = "all" | "ready" | "open" | "locked" | "closed";
const FILTERS: { id: RitualFilter; label: string; has: (st: PathState) => boolean; empty: string }[] = [
  { id: "all", label: "All", has: () => true, empty: "No races to show." },
  { id: "ready", label: "Unlocked", has: (st) => st === "ready" || st === "current", empty: "No race is ready yet. Keep working a path — see Available for the ones you can push on." },
  { id: "open", label: "Available", has: (st) => st === "open", empty: "Nothing available yet. Learn a magic school to open a path — every race names the school it needs. See Locked for what is missing." },
  { id: "locked", label: "Locked", has: (st) => st === "locked", empty: "No race is locked — every remaining path can be started today." },
  { id: "closed", label: "Closed", has: (st) => st === "closed", empty: "No path is closed. Exact-count paths (like Ghost) close when the counter passes the need." },
];

/** Ritual list with a filter for what the hero can actually reach: unlocked now, available to work toward, still locked, or closed. */
export function RitualBrowser({ s, onAscend }: { s: GameState; onAscend: (race: string) => void }) {
  const paths = ascensionProgress(s);
  const state = new Map(paths.map((a) => [a.race, pathState(s, a)]));
  const [f, setF] = useState<RitualFilter>(() => (paths.some((a) => state.get(a.race) === "ready") ? "ready" : "open"));
  const cur = FILTERS.find((x) => x.id === f)!;
  const shown = paths
    .filter((a) => cur.has(state.get(a.race)!))
    .sort((x, y) => RANK[state.get(x.race)!] - RANK[state.get(y.race)!] || pathCloseness(y) - pathCloseness(x) || x.race.localeCompare(y.race));
  return <>
    <div className="mb-2 flex flex-wrap gap-1">
      {FILTERS.map((x) => { const n = paths.filter((a) => x.has(state.get(a.race)!)).length; if (!n && x.id !== "all") return null; return (
        <button key={x.id} className={`pixel-btn px-2 py-1 text-[0.7rem] ${f === x.id ? "pixel-btn-active" : ""}`} onClick={() => setF(x.id)}>{x.label} ({n})</button>); })}
    </div>
    {!shown.length && <p className="mb-2 text-xs text-muted-foreground">{cur.empty}</p>}
    {shown.map((a) => { const r = ASC_RACES.find((x) => x.id === a.race)!; const st = state.get(a.race)!; const lk = a.learned ? null : schoolLock(s, a.school); return (
      <div key={a.race} className="mb-1 border-2 border-border p-2">
        <div className="flex items-baseline justify-between gap-1 text-sm"><span>{r.icon} {r.name}</span><span className={`shrink-0 text-[0.65rem] ${TAG[st][1]}`}>{TAG[st][0]}</span></div>
        <div className="text-xs text-muted-foreground">{r.passive.name}: {r.passive.desc} · {r.active.name}: {r.active.desc}</div>
        <PathReqs a={a} />
        {!a.learned && <div className="mt-1 text-xs text-muted-foreground">{lk ? `🔒 ${lk}` : `Learn ${SCHOOL[a.school].name} · ${fmt(SCHOOL[a.school].gold)}g at the Magic Tower`}</div>}
        {st !== "current" && <button className="pixel-btn mt-1 w-full py-2 text-xs" disabled={!a.ready} onClick={() => onAscend(a.race)}>{a.failed ? "Path closed" : a.ready ? `Become a ${r.name}` : "Conditions not met"}</button>}
      </div>); })}
  </>;
}
