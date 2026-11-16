import { useState } from "react";
import { getMat } from "./data";
import { POTIONS, POTION, POTION_CAT_LABEL, OIL_BATTLES, TONIC_FLOORS, type PotionCat } from "./alchemy";
import { bldgLvl, type GameState } from "./engine";

const fmt = (n: number) => n.toLocaleString();

/** Craftery › Alchemy: brew elixirs, oils, flasks and tonics; drink or apply them in the village. */
export function AlchemyTab({ s, onBrew, onUse }: { s: GameState; onBrew: (id: string, times: number) => void; onUse: (id: string) => void }) {
  const [cat, setCat] = useState<PotionCat>("elixir");
  const lvl = bldgLvl(s, "craftery");
  const oil = s.oil ? POTION[s.oil.id] : undefined; const tonic = s.tonic ? POTION[s.tonic.id] : undefined;
  return (
    <div>
      <div className="mb-2 grid grid-cols-4 gap-1">
        {(Object.keys(POTION_CAT_LABEL) as PotionCat[]).map((c) => <button key={c} className={`pixel-btn min-w-0 px-0.5 py-2 text-[0.65rem] ${cat === c ? "pixel-btn-active" : ""}`} onClick={() => setCat(c)}>{POTION_CAT_LABEL[c]}</button>)}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        {cat === "elixir" ? "Drink here or from the Items menu in battle (up to 3 per fight)." : cat === "oil" ? `Coat your weapon: lasts ${OIL_BATTLES} battles. A new oil replaces the old one.` : cat === "flask" ? "Throw them from the Items menu in battle — they never miss." : `Drink before climbing: lasts ${TONIC_FLOORS} Tower floors and stacks with your meal.`}
      </p>
      {(oil || tonic) && <div className="mb-2 border-2 border-border p-2 text-xs">
        {oil && <div>{oil.icon} Weapon coated with <b>{oil.name}</b> · {s.oil!.left} battle{s.oil!.left === 1 ? "" : "s"} left</div>}
        {tonic && <div>{tonic.icon} <b>{tonic.name}</b> active · {s.tonic!.floors} floor{s.tonic!.floors === 1 ? "" : "s"} left</div>}
      </div>}
      {POTIONS.filter((p) => p.cat === cat).map((p) => {
        const have = s.potions?.[p.id] ?? 0; const locked = p.lvl > lvl;
        const ok = !locked && s.gold >= p.gold && p.recipe.every(([m, q]) => (s.inv[m] ?? 0) >= q);
        return (
          <div key={p.id} className="mb-1 border-2 border-border p-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{p.icon}</span>
              <div className="min-w-0 flex-1"><div className="text-sm">{p.name} <span className="text-xs text-muted-foreground">×{have}</span></div>
                <div className="text-xs text-muted-foreground">{p.desc}{locked ? ` · 🔒 Craftery Lv ${p.lvl}` : ""}</div></div>
            </div>
            <div className="mt-1 text-[0.7rem] text-muted-foreground">{fmt(p.gold)}g · {p.recipe.map(([m, q]) => `${q}× ${getMat(m).name} (${s.inv[m] ?? 0})`).join(" · ")}{p.makes > 1 ? ` → makes ${p.makes}` : ""}</div>
            <div className="mt-1 flex gap-1">
              <button className="pixel-btn flex-1 py-2 text-xs" disabled={!ok} onClick={() => onBrew(p.id, 1)}>Brew</button>
              <button className="pixel-btn flex-1 py-2 text-xs" disabled={!ok} onClick={() => onBrew(p.id, 5)}>Brew ×5</button>
              {p.cat !== "flask" && <button className="pixel-btn flex-1 py-2 text-xs" disabled={!have} onClick={() => onUse(p.id)}>{p.cat === "oil" ? "Coat weapon" : "Drink"}</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
