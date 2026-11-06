// Building interior scene shown at the top of a building's window: the hero walks in
// through the door and the building's keeper greets them from behind the counter.
import { Avatar } from "./Avatar";

type Npc = { name: string; race: string; gender: string; classId: string; lines: string[]; prop: string };
const NPCS: Record<string, Npc | null> = {
  house: null,
  forge: { name: "Brannoc the Smith", race: "dwarf", gender: "Male", classId: "crafting:2", prop: "⚒️", lines: ["Bring me good ore and I'll make it sing.", "The anvil's hot. What'll it be?"] },
  kitchen: { name: "Millie Butterfoot", race: "halfling", gender: "Female", classId: "culinary:1", prop: "🍲", lines: ["Nobody climbs on an empty stomach!", "Smells good, doesn't it?"] },
  carve: { name: "Old Hollin", race: "human", gender: "Male", classId: "crafting:0", prop: "🪵", lines: ["Wood remembers the hand that shapes it.", "Mind the shavings."] },
  smelt: { name: "Grukka", race: "orc", gender: "Female", classId: "fire:1", prop: "🔥", lines: ["Ore in, metal out. Simple.", "Stand back from the furnace."] },
  shop: { name: "Pip Tinkerwhistle", race: "gnome", gender: "Female", classId: "fortune:0", prop: "🧺", lines: ["Buying or selling, friend?", "Fresh stock, fair prices!"] },
  market: { name: "Sylas Windmere", race: "elf", gender: "Male", classId: "wind:0", prop: "⚖️", lines: ["Demand shifts like the wind.", "I've buyers from three kingdoms."] },
  tavern: { name: "Big Marta", race: "halforc", gender: "Female", classId: "culinary:0", prop: "🍺", lines: ["Looking for work? Check the board.", "First round's on... no, it's not."] },
  casino: { name: "Vex", race: "tiefling", gender: "Male", classId: "fortune:2", prop: "🎲", lines: ["Feeling lucky tonight?", "The house always... well, usually wins."] },
  warehouse: { name: "Hilda Stoutbarrel", race: "dwarf", gender: "Female", classId: "shield:0", prop: "📦", lines: ["Everything in its crate.", "Your goods are safe with me."] },
  tower: { name: "Warden Ilyra", race: "aasimar", gender: "Non-binary", classId: "light:2", prop: "🗼", lines: ["The tower waits. Choose your floor.", "May the light guide your climb."] },
};
export const INTERIOR_PANELS = new Set(Object.keys(NPCS));

export function Interior({ panel, hero }: { panel: string; hero: { race: string; gender: string; classId: string } }) {
  const npc = NPCS[panel];
  const line = npc ? npc.lines[Math.floor(Date.now() / 60000) % npc.lines.length] : "Home sweet home. Rest, save, or plan your next climb.";
  return (
    <div className="interior">
      <div className="interior-wall" />
      <div className="interior-floor" />
      {npc ? (
        <>
          <div className="interior-npc"><Avatar race={npc.race} gender={npc.gender} classId={npc.classId} /></div>
          <div className="interior-counter"><span>{npc.prop}</span></div>
        </>
      ) : <div className="interior-bed">🛏️</div>}
      <div className="interior-hero"><Avatar race={hero.race} gender={hero.gender} classId={hero.classId} dir="u" /></div>
      <div className="interior-door" />
      <div className="interior-bubble">
        {npc && <b className="block font-display text-[0.7rem] text-primary">{npc.name}</b>}
        <span>{line}</span>
      </div>
    </div>
  );
}
