// Prison: companions in reserve, shown as a block of cells. Captured monsters sit behind bars;
// recruits bought from the Adventurers Guild rest in open barracks bunks instead.
import { useState } from "react";
import { MAX_COMPANIONS, compLevel, type Companion } from "./guild";
import { COMP_SKILLS, COMP_SKILL_MAX, compLevelCost, compSkillCost, compSkillList, type CompSkillId } from "./prison";
import { charLevel, compStats, prisonMax, type GameState } from "./engine";
import { CompAvatar } from "./GuildPanels";
import { Sheet, fmt } from "./Panels";

export interface PrisonOps {
  deposit: (id: string) => void; withdraw: (id: string) => void; release: (id: string) => void;
  drill: (id: string) => void; skill: (id: string, sk: CompSkillId) => void;
}
export function PrisonPanel({ s, onClose, ops }: { s: GameState; onClose: () => void; ops: PrisonOps }) {
  const cells = s.prison ?? []; const party = s.companions ?? []; const max = prisonMax(s);
  const [sel, setSel] = useState<string | null>(cells[0]?.id ?? party[0]?.id ?? null);
  const cur = cells.find((c) => c.id === sel) ?? party.find((c) => c.id === sel);
  const inCell = !!cur && cells.some((c) => c.id === cur.id);
  return (
    <Sheet title={`⛓️ Prison · ${cells.length}/${max} cells`} onClose={onClose} wide>
      <h3 className="text-accent">Cell block</h3>
      <p className="mb-1 text-xs text-muted-foreground">Captured monsters wait behind bars; Guild recruits rest in the barracks bunks. Tap one to train it.</p>
      <div className="prison-block mb-2 grid grid-cols-3 gap-1.5 p-1.5 sm:grid-cols-4">
        {Array.from({ length: Math.max(max, cells.length) }, (_, i) => { const c = cells[i]; return (
          <button key={c?.id ?? `empty-${i}`} className={`prison-cell ${c ? (c.kind === "monster" ? "cell-barred" : "cell-bunk") : "cell-empty"} ${c && c.id === sel ? "cell-sel" : ""}`} disabled={!c} onClick={() => c && setSel(c.id)} aria-label={c ? `${c.name}, level ${compLevel(c.xp)}` : "Empty cell"}>
            <span className="cell-no">{i + 1}</span>
            {c && <span className="cell-occupant"><CompAvatar c={c} /></span>}
            {c?.kind === "monster" && <span className="cell-bars" aria-hidden />}
            <span className="cell-plaque">{c ? `${c.name} · Lv ${compLevel(c.xp)}` : "empty"}</span>
          </button>); })}
      </div>
      <h3 className="text-accent">Active party ({party.length}/{MAX_COMPANIONS})</h3>
      <div className="mb-2 grid grid-cols-4 gap-1">
        {party.map((c) => <button key={c.id} className={`pixel-btn flex flex-col items-center p-1 text-[0.6rem] ${c.id === sel ? "pixel-btn-active" : ""}`} onClick={() => setSel(c.id)}>
          <span className="h-9 w-9"><CompAvatar c={c} /></span><span className="w-full truncate">{c.name}</span></button>)}
        {!party.length && <p className="col-span-4 text-xs text-muted-foreground">No one in your party.</p>}
      </div>
      {cur ? <CompDetail s={s} c={cur} inCell={inCell} ops={ops} full={party.length >= MAX_COMPANIONS} cellsFull={cells.length >= max} />
        : <p className="text-sm text-muted-foreground">Capture monsters in the Tower or buy recruits at the Adventurers Guild. When your party is full, new captures are brought here.</p>}
    </Sheet>
  );
}

function CompDetail({ s, c, inCell, ops, full, cellsFull }: { s: GameState; c: Companion; inCell: boolean; ops: PrisonOps; full: boolean; cellsFull: boolean }) {
  const st = compStats(s, c); const L = st.level; const cap = charLevel(s.xp);
  return (
    <div className="pixel-panel p-2 text-sm">
      <div className="flex items-center gap-2"><span className="h-12 w-12 shrink-0"><CompAvatar c={c} /></span>
        <div className="min-w-0 flex-1"><div className="truncate text-primary">{c.name}</div>
          <div className="text-xs capitalize text-muted-foreground">{c.kind === "monster" ? "Captured monster" : `${c.role} recruit`} · Lv {L} · {inCell ? "in the Prison" : "in your party"}</div>
          <div className="text-xs">❤️ {fmt(st.hp)} · ⚔️ {fmt(st.atk)} · 🛡️ {fmt(st.def)}</div></div></div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {inCell ? <button className="pixel-btn pixel-btn-primary py-2 text-xs" disabled={full} onClick={() => ops.withdraw(c.id)}>{full ? "Party full" : "🤝 Take into party"}</button>
          : <button className="pixel-btn py-2 text-xs" disabled={cellsFull || c.rentLeft !== undefined} onClick={() => ops.deposit(c.id)}>{c.rentLeft !== undefined ? "Rented — can't stay" : cellsFull ? "Cells full" : "⛓️ Put in a cell"}</button>}
        <button className="pixel-btn py-2 text-xs" disabled={L >= cap || s.gold < compLevelCost(L)} onClick={() => ops.drill(c.id)}>{L >= cap ? `Max (your Lv ${cap})` : `🏋️ Level up · ${fmt(compLevelCost(L))}g`}</button>
      </div>
      <h4 className="mt-2 text-xs text-accent">Skills</h4>
      {compSkillList(c.role).map((id) => { const sk = COMP_SKILLS[id]; const lv = c.skills?.[id] ?? 0; const cost = compSkillCost(lv, L); return (
        <div key={id} className="flex items-center gap-2 border-b border-border/30 py-1 text-xs">
          <span className="w-5 text-center">{sk.icon}</span>
          <span className="min-w-0 flex-1"><b>{sk.name}</b> {lv}/{COMP_SKILL_MAX} <span className="text-muted-foreground">· {lv ? sk.desc(lv) : `${sk.desc(1)} per level`}</span></span>
          <button className="pixel-btn px-2 py-1 text-[0.65rem]" disabled={lv >= COMP_SKILL_MAX || s.gold < cost} onClick={() => ops.skill(c.id, id)}>{lv >= COMP_SKILL_MAX ? "Max" : `+1 · ${fmt(cost)}g`}</button>
        </div>); })}
      {inCell && <button className="pixel-btn mt-2 w-full py-1.5 text-xs" onClick={() => ops.release(c.id)}>{c.kind === "monster" ? "Release into the wild" : "Dismiss recruit"}</button>}
    </div>
  );
}
