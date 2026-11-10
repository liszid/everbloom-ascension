import { defineTool } from "@lovable.dev/mcp-js";
import { characterArg, pickHero } from "../heroes";
import { SCHOOL, SPELL, schoolLevel, type SchoolId } from "@/game/magic";
import { SPOTS, spotLevel, type SpotId } from "@/game/gathering";
import { compLevel } from "@/game/guild";
import { themeFor } from "@/game/themes";

const BUILDINGS: Record<string, string> = { house: "Home", market: "Market", craftery: "Craftery", church: "Church", guild: "Adventurers' Guild" };

export default defineTool({
  name: "get_progress",
  title: "Get progress",
  description: "Show a character's tower progress, magic schools and spells, village building and gathering spot levels, companions, titles and achievements.",
  inputSchema: characterArg,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ character }, ctx) => {
    const { hero: s, slot } = await pickHero(ctx, character);
    const schools = Object.entries(s.magic ?? {}).map(([id, xp]) => ({ school: SCHOOL[id as SchoolId]?.name ?? id, level: schoolLevel(xp ?? 0) }));
    const equippedSpells = (s.spellSlots ?? []).map((id) => ({ name: SPELL[id]?.name ?? id, level: s.spellLv?.[id] ?? 1 }));
    const buildings = Object.entries(BUILDINGS).map(([id, name]) => ({ building: name, level: (s.bldg as Record<string, number> | undefined)?.[id] ?? 1 }));
    const gathering = (Object.keys(SPOTS) as SpotId[]).map((id) => ({ spot: SPOTS[id].name, level: spotLevel(s.spots, id) }));
    const companions = (s.companions ?? []).map((c) => ({ name: c.name, role: c.role, kind: c.kind, level: compLevel(c.xp), floorsLeft: c.rentLeft ?? null }));
    const progress = {
      slot,
      highestFloor: s.maxFloor ?? 0,
      nextTheme: themeFor(Math.max(1, (s.maxFloor ?? 0) + 1)).name,
      forgeLevel: s.forgeLvl ?? 1,
      schools, learnedSpells: (s.spells ?? []).length, equippedSpells,
      buildings, gathering, companions,
      titles: s.titles ?? [], equippedTitle: s.title ?? null,
      achievements: Object.keys(s.ach ?? {}).length,
      monstersSlain: s.stats?.["kills"] ?? 0,
    };
    const text = [
      `${s.char.name} (slot ${slot}) — best floor ${progress.highestFloor} of 1000 (next: ${progress.nextTheme})`,
      `Magic: ${schools.map((x) => `${x.school} ${x.level}`).join(", ") || "none"}; equipped spells: ${equippedSpells.map((x) => `${x.name} Lv${x.level}`).join(", ") || "none"}`,
      `Buildings: ${buildings.map((b) => `${b.building} ${b.level}`).join(", ")}; Forge ${progress.forgeLevel}`,
      `Gathering: ${gathering.map((g) => `${g.spot} ${g.level}`).join(", ")}`,
      `Companions: ${companions.map((c) => `${c.name} (${c.role}, Lv ${c.level})`).join(", ") || "none"}`,
      `${progress.titles.length} titles, ${progress.achievements} achievements`,
    ].join("\n");
    return { content: [{ type: "text", text }], structuredContent: { progress } };
  },
});
