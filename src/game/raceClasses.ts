// Lore-locked class ladders for ascended races — pure data plus a pure mastery calculator.
// Once a hero ascends, their class is bound to the race and only ranks up through race-related growth.
import type { SchoolId } from "./magic";

export type MasterySource =
  | { kind: "school"; id: SchoolId; label: string }
  | { kind: "skill"; id: string; label: string }
  | { kind: "aff"; id: string; label: string }
  | { kind: "stat"; id: string; label: string; need: number };

export interface RaceClassLine {
  race: string;
  /** Rank names, lowest to highest. */
  ranks: [string, string, string, string, string];
  /** Lore affinities that drive class passives and combat skills (primary, secondary). */
  affs: [string, string];
  lore: string;
  sources: MasterySource[];
}

/** Mastery % needed for each rank (rank 0 is granted on ascension). Late ranks are deliberately far away. */
export const RANK_AT = [0, 20, 40, 65, 90] as const;
/** Level at which each source counts as fully mastered. */
export const SOURCE_CAP = { school: 20, skill: 100, aff: 40 } as const;

export const RACE_CLASSES: RaceClassLine[] = [
  { race: "vampire", ranks: ["Fledgling Vampire", "Vampire Noble", "Vampire Lord", "Elder Vampire", "Vampire Progenitor"], affs: ["dark", "agility"],
    lore: "Blood sustains the ageless. Feed, master blood and shadow, and climb the nocturnal court.",
    sources: [
      { kind: "school", id: "blood", label: "Blood Magic" }, { kind: "school", id: "dark", label: "Shadow Arts" },
      { kind: "aff", id: "dark", label: "Darkness affinity" }, { kind: "skill", id: "spellcasting", label: "Spellcasting" }, { kind: "skill", id: "evasion", label: "Evasion" },
      { kind: "stat", id: "lifestealHeal", label: "HP drained through life steal", need: 250000 }, { kind: "stat", id: "bloodKills", label: "Monsters drained with Blood Magic", need: 3000 },
    ] },
  { race: "ghost", ranks: ["Restless Spirit", "Poltergeist", "Spectre", "Phantom Lord", "Eternal Apparition"], affs: ["dark", "arcane"],
    lore: "A soul anchored by its binding. The deeper the tether, the more the veil bends to its will.",
    sources: [
      { kind: "school", id: "soul", label: "Soul Binding" }, { kind: "school", id: "dark", label: "Shadow Arts" },
      { kind: "aff", id: "arcane", label: "Arcane affinity" }, { kind: "aff", id: "dark", label: "Darkness affinity" },
      { kind: "skill", id: "spellcasting", label: "Spellcasting" }, { kind: "skill", id: "evasion", label: "Evasion" },
      { kind: "stat", id: "floorsCleared", label: "Floors haunted (cleared)", need: 500 },
    ] },
  { race: "werewolf", ranks: ["Moon-Cursed Whelp", "Werewolf Prowler", "Alpha Werewolf", "Pack Lord", "Fenrir's Heir"], affs: ["might", "hunting"],
    lore: "The curse grows with every hunt. Embrace the beast, master the change and lead the pack.",
    sources: [
      { kind: "school", id: "transformation", label: "Transformation" },
      { kind: "aff", id: "hunting", label: "Hunting affinity" }, { kind: "aff", id: "might", label: "Might affinity" },
      { kind: "skill", id: "unarmed", label: "Brawling" }, { kind: "skill", id: "hunting", label: "Monster Hunting" }, { kind: "skill", id: "mobility", label: "Mobility" },
      { kind: "stat", id: "kills", label: "Prey slain", need: 20000 },
    ] },
  { race: "lich", ranks: ["Hollow Lich", "Lich Sorcerer", "Lich Lord", "Archlich", "Demilich"], affs: ["arcane", "dark"],
    lore: "Undying will bound to a phylactery. Only forbidden knowledge feeds its ascent.",
    sources: [
      { kind: "school", id: "necromancy", label: "Necromancy" }, { kind: "school", id: "soul", label: "Soul Binding" }, { kind: "school", id: "dark", label: "Shadow Arts" },
      { kind: "aff", id: "arcane", label: "Arcane affinity" }, { kind: "skill", id: "spellcasting", label: "Spellcasting" },
      { kind: "stat", id: "undeadKills", label: "Undead bent or destroyed", need: 5000 },
    ] },
  { race: "zombie", ranks: ["Shambling Corpse", "Rotting Brute", "Plague Walker", "Flesh Abomination", "Undying Colossus"], affs: ["shield", "might"],
    lore: "Dead flesh that will not fall. Every wound endured makes the rot stronger.",
    sources: [
      { kind: "school", id: "plague", label: "Plague Craft" },
      { kind: "aff", id: "shield", label: "Shield affinity" }, { kind: "aff", id: "might", label: "Might affinity" },
      { kind: "skill", id: "endurance", label: "Endurance" }, { kind: "skill", id: "defense", label: "Defense" }, { kind: "skill", id: "unarmed", label: "Brawling" },
      { kind: "stat", id: "dmgTaken", label: "Damage endured", need: 2000000 },
    ] },
  { race: "ghoul", ranks: ["Carrion Ghoul", "Ghast", "Crypt Ravager", "Ghoul Lord", "Ghoul King"], affs: ["hunting", "might"],
    lore: "A ravenous corpse-eater. It grows mightier with every body it devours.",
    sources: [
      { kind: "school", id: "plague", label: "Plague Craft" },
      { kind: "aff", id: "hunting", label: "Hunting affinity" }, { kind: "skill", id: "hunting", label: "Monster Hunting" },
      { kind: "skill", id: "unarmed", label: "Brawling" }, { kind: "skill", id: "evasion", label: "Evasion" },
      { kind: "stat", id: "plagueKills", label: "Corpses devoured", need: 3000 },
    ] },
];
export const RACE_CLASS: Record<string, RaceClassLine> = Object.fromEntries(RACE_CLASSES.map((l) => [l.race, l]));

export interface MasteryReader { school: (id: SchoolId) => number; skill: (id: string) => number; aff: (id: string) => number; stat: (id: string) => number }
export interface MasteryPart { label: string; cur: number; max: number; pct: number }

/** Overall race mastery 0–100: the average of every lore source's progress toward its cap. */
export function raceMastery(line: RaceClassLine, r: MasteryReader) {
  const parts: MasteryPart[] = line.sources.map((src) => {
    const cur = src.kind === "school" ? r.school(src.id) : src.kind === "skill" ? r.skill(src.id) : src.kind === "aff" ? r.aff(src.id) : r.stat(src.id);
    const max = src.kind === "stat" ? src.need : SOURCE_CAP[src.kind];
    return { label: src.label, cur, max, pct: Math.max(0, Math.min(1, cur / max)) };
  });
  const pct = Math.floor((parts.reduce((a, p) => a + p.pct, 0) / parts.length) * 1000) / 10;
  let rank = 0; RANK_AT.forEach((t, i) => { if (pct >= t) rank = i; });
  return { pct, rank, parts, next: RANK_AT[rank + 1] as number | undefined };
}
