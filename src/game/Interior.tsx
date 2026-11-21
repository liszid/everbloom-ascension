// Building interior scene shown at the top of a building's window: the hero walks in
// through the door and the building's keeper greets them from behind the counter.
import { Avatar } from "./Avatar";
import { icon, sceneArt } from "./art";

type Npc = { name: string; race: string; gender: string; classId: string; lines: string[]; prop: string };
const NPCS: Record<string, Npc | null> = {
  house: null,
  forge: { name: "Brannoc the Smith", race: "dwarf", gender: "Male", classId: "crafting:2", prop: "⚒️", lines: ["Bring me good ore and I'll make it sing.", "The anvil's hot. What'll it be?"] },
  kitchen: { name: "Millie Butterfoot", race: "halfling", gender: "Female", classId: "culinary:1", prop: "🍲", lines: ["Nobody climbs on an empty stomach!", "Smells good, doesn't it?"] },
  carve: { name: "Old Hollin", race: "human", gender: "Male", classId: "crafting:0", prop: "🪵", lines: ["Wood remembers the hand that shapes it.", "Mind the shavings."] },
  smelt: { name: "Grukka", race: "orc", gender: "Female", classId: "fire:1", prop: "🔥", lines: ["Ore in, metal out. Simple.", "Stand back from the furnace."] },
  shop: { name: "Pip Tinkerwhistle", race: "gnome", gender: "Female", classId: "fortune:0", prop: "🧺", lines: ["Buying or selling, friend?", "Fresh stock, fair prices!"] },
  market: { name: "Sylas Windmere", race: "elf", gender: "Male", classId: "wind:0", prop: "⚖️", lines: ["Demand shifts like the wind.", "I've buyers from three kingdoms."] },
  tavern: { name: "Guildmaster Marta", race: "halforc", gender: "Female", classId: "might:1", prop: "📜", lines: ["Looking for work? Check the mission table.", "The Guild pays well for brave hands."] },
  church: { name: "Sister Aveline", race: "human", gender: "Female", classId: "light:1", prop: "🕯️", lines: ["May the light mend your wounds.", "Rest your soul a while, child."] },
  magic: { name: "Archmage Quillon", race: "elf", gender: "Male", classId: "arcane:3", prop: "🔮", lines: ["Magic answers to the prepared mind.", "Mind the floating books."] },
  craftery: { name: "Tink Fizzlebolt", race: "gnome", gender: "Male", classId: "crafting:1", prop: "🪤", lines: ["Traps, darts, bombs — one use, big boom!", "Careful, that one's armed."] },
  casino: { name: "Vex", race: "tiefling", gender: "Male", classId: "fortune:2", prop: "🎲", lines: ["Feeling lucky tonight?", "The house always... well, usually wins."] },
  warehouse: { name: "Hilda Stoutbarrel", race: "dwarf", gender: "Female", classId: "shield:0", prop: "📦", lines: ["Everything in its crate.", "Your goods are safe with me."] },
  training: { name: "Drillmaster Korga", race: "halforc", gender: "Male", classId: "might:2", prop: "🎯", lines: ["Again! Sweat now, bleed less later.", "Pick a drill. Gold first, glory after."] },
  arena: { name: "Arena Master Cassia", race: "human", gender: "Female", classId: "sword:2", prop: "🏟️", lines: ["The crowd wants champions. Are you one?", "Five bosses. No rest. Big prizes."] },
  tower: { name: "Warden Ilyra", race: "aasimar", gender: "Non-binary", classId: "light:2", prop: "🗼", lines: ["The tower waits. Choose your floor.", "May the light guide your climb."] },
};
// Merged buildings share one keeper across their tabs.
const ALIAS: Record<string, string> = { carve: "forge", smelt: "forge", tan: "forge", market: "shop", warehouse: "house", kitchen: "house", guildshop: "tavern", companions: "tavern", pmarket: "tavern" };
export const INTERIOR_PANELS = new Set([...Object.keys(NPCS), ...Object.keys(ALIAS)]);

export function Interior({ panel, hero }: { panel: string; hero: { race: string; gender: string; classId: string } }) {
  const npc = NPCS[ALIAS[panel] ?? panel];
  const line = npc ? npc.lines[Math.floor(Date.now() / 60000) % npc.lines.length] : "Home sweet home. Rest, save, or plan your next climb.";
  return (
    <div className="interior" style={{ backgroundImage: `url(${sceneArt("interior")})` }}>
      {npc ? (
        <>
          <div className="interior-npc"><Avatar race={npc.race} gender={npc.gender} classId={npc.classId} /></div>
          <div className="interior-counter"><img src={icon("counter")} alt="" draggable={false} /><span>{npc.prop}</span></div>
        </>
      ) : <div className="interior-bed"><img src={icon("bed")} alt="Bed" draggable={false} /></div>}
      <div className="interior-hero"><Avatar race={hero.race} gender={hero.gender} classId={hero.classId} dir="u" /></div>
      <div className="interior-door" />
      <div className="interior-bubble">
        {npc && <b className="block font-display text-[0.7rem] text-primary">{npc.name}</b>}
        <span>{line}</span>
      </div>
    </div>
  );
}
