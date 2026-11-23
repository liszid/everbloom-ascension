// Prison: reserve storage for companions, plus drills that level them up and raise their skills — pure data, no engine imports.
import type { CompRole } from "./guild";

/** Cells at Prison level l. */
export const prisonCap = (l: number) => 6 + (l - 1) * 3;
/** Gold to drill a companion from level L to L+1 (they can never pass the hero's character level). */
export const compLevelCost = (L: number) => Math.round(40 + 18 * Math.pow(L, 1.45));

export type CompSkillId = "vigor" | "power" | "guard" | "cleave" | "volley" | "mend" | "arcana" | "frenzy";
export interface CompSkill { id: CompSkillId; name: string; icon: string; desc: (lv: number) => string }
export const COMP_SKILL_MAX = 10;
export const COMP_SKILLS: Record<CompSkillId, CompSkill> = {
  vigor: { id: "vigor", name: "Vigor", icon: "❤️", desc: (l) => `+${l * 6}% HP` },
  power: { id: "power", name: "Power", icon: "⚔️", desc: (l) => `+${l * 6}% attack` },
  guard: { id: "guard", name: "Guard", icon: "🛡️", desc: (l) => `+${l * 6}% defense` },
  cleave: { id: "cleave", name: "Cleave", icon: "🪓", desc: (l) => `${l * 4}% chance to strike twice` },
  volley: { id: "volley", name: "Volley", icon: "🏹", desc: (l) => `+${l * 3}% double-shot chance` },
  mend: { id: "mend", name: "Mend", icon: "✨", desc: (l) => `Heals ${l * 10}% more` },
  arcana: { id: "arcana", name: "Arcana", icon: "🔮", desc: (l) => `Ignores ${l * 4}% of enemy defense` },
  frenzy: { id: "frenzy", name: "Frenzy", icon: "🐾", desc: (l) => `${l * 4}% chance to maul twice` },
};
/** Every companion trains the three basics plus its role's signature skill. */
export const ROLE_SKILL: Record<CompRole, CompSkillId> = { warrior: "cleave", archer: "volley", cleric: "mend", mage: "arcana", beast: "frenzy" };
export const compSkillList = (role: CompRole): CompSkillId[] => ["vigor", "power", "guard", ROLE_SKILL[role]];
/** Gold for raising a companion skill from lv to lv+1; deeper floors cost more. */
export const compSkillCost = (lv: number, compLevel: number) => Math.round((150 + compLevel * 12) * Math.pow(lv + 1, 1.5));
