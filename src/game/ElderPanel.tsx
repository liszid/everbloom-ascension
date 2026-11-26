// Elder Rowan, the village guide: active mission, what each building does, and starter tips.
import { useState } from "react";
import { TUTOR_BUILDINGS, TUTOR_MISSIONS, TUTOR_TIPS } from "./tutorial";
import { tutorProgress, type GameState } from "./engine";
import { Sheet, Tabs, fmt } from "./Panels";
import { ElderSprite } from "./ElderSprite";

export const ELDER = { name: "Elder Rowan", race: "human", gender: "Male", classId: "light:2" };

export function ElderPanel({ s, onClose, onClaim }: { s: GameState; onClose: () => void; onClaim: () => void }) {
  const [tab, setTab] = useState<"mission" | "bldg" | "tips">("mission");
  const p = tutorProgress(s); const done = s.tutor ?? 0;
  return (
    <Sheet title={`❗ ${ELDER.name}`} onClose={onClose}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-14 w-14 shrink-0"><ElderSprite /></span>
        <p className="text-sm italic text-muted-foreground">"Welcome, climber. The Tower has a thousand floors — let an old man show you how to reach the top."</p>
      </div>
      <Tabs tabs={[["mission", "📜 Missions"], ["bldg", "🏘️ Buildings"], ["tips", "💡 Tips"]]} cur={tab} set={setTab} />
      {tab === "mission" && <div>
        {p ? <div className="pixel-panel p-2">
          <div className="text-xs text-muted-foreground">Mission {done + 1} of {TUTOR_MISSIONS.length}</div>
          <div className="text-primary">{p.m.text}</div>
          <p className="text-xs text-muted-foreground">{p.m.how}</p>
          <div className="bar bar-labeled bar-xp my-1"><div style={{ width: `${(p.cur / p.m.need) * 100}%` }} /><span className="bar-label">{fmt(p.cur)}/{fmt(p.m.need)}</span></div>
          <button className="pixel-btn pixel-btn-primary mt-1 w-full py-2" disabled={!p.done} onClick={onClaim}>{p.done ? `Claim ${fmt(p.m.gold)}g` : `Reward: ${fmt(p.m.gold)}g`}</button>
        </div> : <p className="text-primary">You've done everything I could teach you. The summit is yours.</p>}
        {done > 0 && <><h3 className="mt-2 text-accent">Completed ({done})</h3>
          {TUTOR_MISSIONS.slice(0, done).reverse().map((m) => <div key={m.id} className="border-b border-border/30 py-0.5 text-xs">✅ {m.text}</div>)}</>}
      </div>}
      {tab === "bldg" && TUTOR_BUILDINGS.map(([ic, name, text]) => <div key={name} className="border-b border-border/30 py-1 text-sm"><b>{ic} {name}</b><div className="text-xs text-muted-foreground">{text}</div></div>)}
      {tab === "tips" && <ol className="list-decimal space-y-1 pl-5 text-sm">{TUTOR_TIPS.map((t) => <li key={t}>{t}</li>)}</ol>}
    </Sheet>
  );
}
