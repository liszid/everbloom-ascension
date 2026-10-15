import { Avatar } from "./Avatar";
import { useState } from "react";
import { ACHIEVEMENTS, AFFINITIES, GRADES, SKILLS, SLOTS, SLOT_INFO, STAT_LABEL, RACES, BACKGROUNDS, type StatKey } from "./data";
import {
  affLevel, charLevel, charXpFor, classActives, computeClass, describePassives, favorite, levelOf, playerStats, statValue, xpForLevel,
  type GameState,
} from "./engine";
import { GearCard, Sheet, Tabs, fmt } from "./Panels";

const time = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

export function ProfilePanel({ s, onClose, onTitle, onEquip }: { s: GameState; onClose: () => void; onTitle: (t: string | undefined) => void; onEquip: (id: string) => void }) {
  const [tab, setTab] = useState<"info" | "stats" | "equip" | "aff" | "skills" | "class" | "journal">("info");
  const p = playerStats(s); const L = charLevel(s.xp); const c = computeClass(s);
  const race = RACES.find((r) => r.id === s.char.race)!; const bg = BACKGROUNDS.find((b) => b.id === s.char.bg);
  const [sel, setSel] = useState<string | null>(null);
  const Row = ({ k, v }: { k: string; v: string | number }) => <div className="flex justify-between border-b border-border/30 py-0.5"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
  return (
    <Sheet title={`👤 ${s.char.name}${s.title ? ` "${s.title}"` : ""}`} onClose={onClose} wide>
      <Tabs tabs={[["info", "Info"], ["stats", "Stats"], ["equip", "Equipment"], ["aff", "Affinity"], ["skills", "Skills"], ["class", "Classes"], ["journal", "Journal"]]} cur={tab} set={setTab} />
      {tab === "info" && <div>
        <div className="mb-2 flex items-center gap-3"><span className="h-16 w-16 shrink-0"><Avatar race={s.char.race} gender={s.char.gender} classId={s.classId} /></span>
          <div className="min-w-0"><div className="text-lg text-primary">{s.className}</div><div className="text-sm text-muted-foreground">Lv {L} {s.char.gender} {race.name} · {bg?.name}</div></div></div>
        <div className="bar bar-xp mb-2"><div style={{ width: `${((s.xp - charXpFor(L)) / (charXpFor(L + 1) - charXpFor(L))) * 100}%` }} /></div>
        <Row k="Experience" v={`${fmt(s.xp)} / ${fmt(charXpFor(L + 1))}`} /><Row k="Highest floor" v={`${s.maxFloor} / 1000`} />
        <Row k="Gold" v={s.gold.toLocaleString()} /><Row k="Tokens" v={s.tokens} /><Row k="Play time" v={time(s.playTime)} />
        <Row k="Race passive" v={race.passive.name} /><p className="text-xs text-muted-foreground">{race.passive.desc}</p>
        <Row k="Race active" v={race.active.name} /><p className="text-xs text-muted-foreground">{race.active.desc}</p>
        <div className="mt-2"><div className="text-sm">Title</div><div className="flex flex-wrap gap-1">
          <button className={`pixel-btn py-1 ${!s.title ? "pixel-btn-active" : ""}`} onClick={() => onTitle(undefined)}>None</button>
          {s.titles.map((t) => <button key={t} className={`pixel-btn py-1 ${s.title === t ? "pixel-btn-active" : ""}`} onClick={() => onTitle(t)}>{t}</button>)}
          {!s.titles.length && <span className="text-sm text-muted-foreground">Earn titles from achievements.</span>}</div></div>
      </div>}
      {tab === "stats" && <div className="grid gap-x-6 sm:grid-cols-2">
        <div><h3 className="text-accent">Primary</h3>
          {(["hp", "mp", "sta", "patk", "matk", "pdef", "mdef", "crit", "critDmg", "dodge", "acc", "spd", "luck"] as StatKey[]).map((k) => <Row key={k} k={STAT_LABEL[k]} v={fmt(p[k])} />)}</div>
        <div><h3 className="text-accent">Secondary</h3>
          <Row k="Total damage dealt" v={fmt(s.stats["dmgDealt"] ?? 0)} /><Row k="Total damage taken" v={fmt(s.stats["dmgTaken"] ?? 0)} />
          <Row k="Healing performed" v={fmt(s.stats["healing"] ?? 0)} /><Row k="Crafting efficiency" v={`${Math.round(p.craftEff * 100)}%`} />
          <Row k="Gathering efficiency" v={`${Math.round(p.gatherEff * 100)}%`} /><Row k="Item find rate" v={`${Math.round(p.itemFind * 100)}%`} />
          <Row k="Rare material drop" v={`${(p.rareDrop * 100).toFixed(1)}%`} /><Row k="Weapon element" v={p.element} /></div>
      </div>}
      {tab === "equip" && <div>
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
          {SLOTS.map((sl) => { const g = s.gear.find((x) => x.id === s.equip[sl]); return (
            <button key={sl} className={`pixel-btn flex min-h-16 flex-col items-center py-2 ${sel === sl ? "pixel-btn-active" : ""}`} onClick={() => setSel(sl)}>
              <span className="text-xl">{SLOT_INFO[sl].icon}</span>
              <span className={`w-full truncate text-[0.65rem] ${g ? `grade-${g.grade}` : "text-muted-foreground"}`}>{g ? g.name : SLOT_INFO[sl].name}</span>
            </button>); })}
        </div>
        {sel && (() => { const g = s.gear.find((x) => x.id === s.equip[sel as keyof typeof s.equip]); return g
          ? <div className="mt-2"><GearCard g={g} equipped actions={<button className="pixel-btn py-2" onClick={() => onEquip(g.id)}>Unequip</button>} /><p className="text-xs text-muted-foreground">Grade {GRADES[g.grade]} · materials listed above · durability {g.dura}/{g.maxDura}</p></div>
          : <p className="mt-2 text-muted-foreground">Empty slot. {sel === "shield" && s.equip.two_hand ? "Two-handed weapon equipped." : "Equip from the Bag."}</p>; })()}
      </div>}
      {tab === "aff" && <div>
        {AFFINITIES.map((a) => { const pts = s.aff[a.id] ?? 0; const l = affLevel(pts); const next = 8 * (l + 1) * (l + 1); const cur = 8 * l * l; return (
          <div key={a.id} className="border-b border-border/30 py-1">
            <div className="flex justify-between"><span>{a.icon} {a.name}</span><span>Lv {l}</span></div>
            <div className="bar bar-xp"><div style={{ width: `${((pts - cur) / (next - cur)) * 100}%` }} /></div>
          </div>); })}
        <p className="mt-2 text-xs text-muted-foreground">Affinities grow from what you do. Higher affinity boosts related skills' growth and shapes your class.</p>
      </div>}
      {tab === "skills" && <div>
        {Object.entries(s.skills).sort((a, b) => b[1] - a[1]).map(([k, xp]) => { const l = levelOf(xp); const info = SKILLS[k]; return (
          <div key={k} className="border-b border-border/30 py-1">
            <div className="flex justify-between"><span>{info?.icon} {info?.name ?? k}</span><span>Lv {l}</span></div>
            <div className="bar bar-xp"><div style={{ width: `${((xp - xpForLevel(l)) / (xpForLevel(l + 1) - xpForLevel(l))) * 100}%` }} /></div>
            <div className="text-xs text-muted-foreground">{info?.desc}</div>
          </div>); })}
        {!Object.keys(s.skills).length && <p className="text-muted-foreground">Skills appear as you do things.</p>}
      </div>}
      {tab === "class" && <div>
        <div className="pixel-panel mb-2 p-2"><div className="text-primary">{c.name}</div>
          <div className="text-sm">Passives: {describePassives(c).join(", ") || "none yet"}</div>
          <div className="text-sm">Skills: {classActives(c).map((a) => a.name).join(", ")}</div></div>
        <h3 className="text-accent">Evolution history</h3>
        {!s.classHistory.length && <p className="text-muted-foreground">Your path has not yet diverged.</p>}
        {s.classHistory.slice().reverse().map((h, i) => <div key={i} className="border-b border-border/30 py-1 text-sm">{h.from} → <b className="text-primary">{h.to}</b> <span className="text-muted-foreground">· floor {h.floor} · {new Date(h.at).toLocaleDateString()}</span></div>)}
        <p className="mt-2 text-sm text-muted-foreground">Classes discovered: {s.classesSeen.length}</p>
      </div>}
      {tab === "journal" && <Journal s={s} />}
    </Sheet>
  );
}

function Journal({ s }: { s: GameState }) {
  const v = (k: string) => fmt(s.stats[k] ?? 0);
  const best = Math.max(0, ...Object.values(s.skills).map(levelOf));
  const sections: [string, [string, string | number][]][] = [
    ["Combat", [["Monsters killed", v("kills")], ["Bosses defeated", v("bosses")], ["Total damage dealt", v("dmgDealt")], ["Total damage taken", v("dmgTaken")], ["Highest hit", v("highestHit")], ["Longest survival streak", v("bestStreak")], ["Deaths", v("deaths")]]],
    ["Equipment", [["Items crafted", v("crafted")], ["Legendary+ crafted", v("craftedLegendary")], ["Relic+ crafted", v("craftedRelic")], ["EX crafted", v("craftedEX")], ["Upgrades performed", v("upgrades")]]],
    ["Gathering", [["Trees cut", v("treesCut")], ["Ores mined", v("oresMined")], ["Plants harvested", v("plantsHarvested")], ["Fish caught", v("fishCaught")], ["Animals tended", v("animalsTended")], ["Food cooked", v("foodCooked")]]],
    ["Skills", [["Highest skill level", best], ["Skills learned", Object.keys(s.skills).length], ["Current class", s.className], ["Classes discovered", s.classesSeen.length]]],
    ["Usage", [["Most used weapon", favorite(s.usage.weapon).replace("_", "-")], ["Most used skill", favorite(s.usage.skill)], ["Favorite material", favorite(s.usage.mat)], ["Most hunted monster", favorite(s.usage.monster)]]],
    ["Lifetime", [["Total play time", time(s.playTime)], ["Playthrough started", new Date(s.createdAt).toLocaleDateString()], ["Floors cleared", v("floorsCleared")], ["Highest floor", s.maxFloor], ["Gold earned", v("goldEarned")], ["Gold spent", v("goldSpent")]]],
  ];
  return (
    <div>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {sections.map(([t, rows]) => <div key={t} className="mb-2"><h3 className="text-accent">{t}</h3>
          {rows.map(([k, val]) => <div key={k} className="flex justify-between gap-2 border-b border-border/30 py-0.5 text-sm"><span className="text-muted-foreground">{k}</span><span className="truncate">{val}</span></div>)}</div>)}
      </div>
      <h3 className="mt-2 text-accent">Achievements</h3>
      {ACHIEVEMENTS.map((a) => { const got = s.ach[a.id] ?? 0; const next = a.tiers[got]; const val = statValue(s, a.stat); return (
        <div key={a.id} className="border-b border-border/30 py-1">
          <div className="flex justify-between"><span>{got === a.tiers.length ? "🏅" : "▫️"} {a.name} {"★".repeat(got)}{"☆".repeat(a.tiers.length - got)}</span><span className="text-sm text-muted-foreground">{next !== undefined ? `${fmt(val)}/${fmt(next)}` : "Complete"}</span></div>
          {next !== undefined && <div className="text-xs text-muted-foreground">Reward: {Object.entries(a.rewards[got] ?? {}).map(([k, r]) => k === "mat" ? `material` : k === "gold" ? `${r}g` : `${k} ${r}`).join(", ")}</div>}
        </div>); })}
    </div>
  );
}
