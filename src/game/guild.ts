// Adventurers Guild: companions, trainers and pricing — pure data, no engine imports.
import type { Slot } from "./data";

export const MAX_COMPANIONS = 4;
export const RENT_FLOORS = 5;
export type CompRole = "warrior" | "archer" | "cleric" | "mage" | "beast";
export interface Companion {
  id: string; name: string; kind: "human" | "monster"; role: CompRole; race: string; gender: string; monDef?: string | undefined;
  xp: number; base: { hp: number; atk: number; def: number; magic: boolean };
  equip: Partial<Record<Slot, string | undefined>>; title?: string | undefined; titleTime?: Record<string, number> | undefined;
  rentLeft?: number | undefined; // undefined = owned permanently
}
export const HIRELINGS: { role: CompRole; name: string; icon: string; race: string; gender: string; desc: string; hp: number; atk: number; def: number; magic: boolean }[] = [
  { role: "warrior", name: "Brom", icon: "🛡️", race: "dwarf", gender: "Male", desc: "Sturdy fighter — steady physical blows.", hp: 1.3, atk: 1, def: 1.3, magic: false },
  { role: "archer", name: "Lyra", icon: "🏹", race: "elf", gender: "Female", desc: "Sharp-eyed — strong hits, sometimes twice.", hp: 0.9, atk: 1.3, def: 0.8, magic: false },
  { role: "cleric", name: "Osric", icon: "✨", race: "aasimar", gender: "Male", desc: "Heals you every other turn.", hp: 1, atk: 0.6, def: 1, magic: true },
  { role: "mage", name: "Vesna", icon: "🔮", race: "tiefling", gender: "Female", desc: "Fierce magic damage.", hp: 0.8, atk: 1.5, def: 0.7, magic: true },
];
/** Rental lasts RENT_FLOORS floors (each floor left counts); buying costs far more but lasts forever. */
export const rentPrice = (maxFloor: number) => Math.round(80 * (1 + maxFloor / 8));
export const buyPrice = (maxFloor: number) => Math.round(1500 * (1 + maxFloor / 6));
export const compLevel = (xp: number) => Math.min(300, 1 + Math.floor(Math.sqrt(xp / 15)));
/** Capture works on weakened (<30% HP), non-boss monsters. */
export const CAPTURE_HP = 0.3;

export const GUILD_BUY_MULT = 1.6;
export const trainCost = (lvl: number) => Math.round(40 * Math.pow(lvl, 1.6));
export const trainChance = (lvl: number) => Math.max(0.35, 0.85 - lvl * 0.004);

export interface Tech { id: string; aff: string; kind: "passive" | "active"; req: number; gold: number }
/** Specialization techniques: every affinity has a passive (affinity Lv 6) and an active (Lv 12). Only your top-2 affinities' trainers will teach you. */
export const techId = (aff: string, kind: "passive" | "active") => `${aff}:${kind}`;
export const TECH_REQ = { passive: 6, active: 12 };
export const techGold = (kind: "passive" | "active") => (kind === "passive" ? 1200 : 3000);
