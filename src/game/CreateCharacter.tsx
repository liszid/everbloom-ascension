import { useState } from "react";
import { BACKGROUNDS, GENDERS, RACES, STAT_LABEL, type StatKey } from "./data";

export function CreateCharacter({ onDone, hadOld, onCancel }: { onDone: (c: { name: string; gender: string; race: string; bg: string }) => void; hadOld: boolean; onCancel?: (() => void) | undefined }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState(GENDERS[0]!);
  const [race, setRace] = useState("human");
  const [bg, setBg] = useState("smith");
  const r = RACES.find((x) => x.id === race)!;
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-3 p-3">
      <h1 className="text-center text-xl text-primary title-glow">Forge Your Hero</h1>
      {hadOld && <p className="pixel-panel p-2 text-sm text-muted-foreground">The Tower has changed. A new age begins — create a new adventurer.</p>}
      <div className="pixel-panel p-3">
        <label className="block text-sm">Name</label>
        <input className="mt-1 w-full border-2 border-border bg-input px-2 py-2 text-lg" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Adventurer name" />
        <div className="mt-2 grid grid-cols-3 gap-1">{GENDERS.map((g) => <button key={g} className={`pixel-btn py-2 ${gender === g ? "pixel-btn-active" : ""}`} onClick={() => setGender(g)}>{g}</button>)}</div>
      </div>
      <div className="pixel-panel p-3">
        <h2 className="text-sm text-accent">Race</h2>
        <div className="mt-1 grid grid-cols-5 gap-1">{RACES.map((x) => <button key={x.id} className={`pixel-btn flex flex-col items-center py-2 ${race === x.id ? "pixel-btn-active" : ""}`} onClick={() => setRace(x.id)}><span className="text-2xl">{x.icon}</span><span className="text-[0.6rem]">{x.name}</span></button>)}</div>
        <div className="mt-2 text-sm">
          <div className="text-primary">{r.icon} {r.name}</div><div className="text-muted-foreground">{r.desc}</div>
          <div>{Object.entries(r.mods).map(([k, v]) => <span key={k} className={`mr-2 ${v > 0 ? "text-xp" : "text-destructive"}`}>{STAT_LABEL[k as StatKey]} {v > 0 ? "+" : ""}{Math.round(v * 100)}%</span>)}</div>
          <div>⭐ {r.passive.name}: <span className="text-muted-foreground">{r.passive.desc}</span></div>
          <div>⚡ {r.active.name}: <span className="text-muted-foreground">{r.active.desc}</span></div>
          <div className="text-muted-foreground">Grows faster in: {Object.keys(r.growth).join(", ")}</div>
        </div>
      </div>
      <div className="pixel-panel p-3">
        <h2 className="text-sm text-accent">Background</h2>
        <div className="mt-1 grid grid-cols-1 gap-1">{BACKGROUNDS.map((b) => <button key={b.id} className={`pixel-btn py-2 text-left ${bg === b.id ? "pixel-btn-active" : ""}`} onClick={() => setBg(b.id)}>{b.icon} {b.name} <span className="text-xs opacity-80">— {b.desc} ({b.gold}g)</span></button>)}</div>
      </div>
      <button className="pixel-btn pixel-btn-primary py-4 text-base" disabled={!name.trim()} onClick={() => onDone({ name: name.trim(), gender, race, bg })}>Begin the Climb</button>
      {onCancel && <button className="pixel-btn py-3" onClick={onCancel}>Cancel</button>}
    </div>
  );
}
