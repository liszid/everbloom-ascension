import { defineTool } from "@lovable.dev/mcp-js";
import { characterArg, pickHero, toGearJson } from "../heroes";
import { SLOTS, SLOT_INFO } from "@/game/data";
import { TOOL } from "@/game/items";

export default defineTool({
  name: "get_equipment",
  title: "Get equipment",
  description: "Show a character's equipped gear in every slot (grade, element, enhancement, durability and stats), plus ranged or torch off-hand.",
  inputSchema: characterArg,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ character }, ctx) => {
    const { hero: s, slot } = await pickHero(ctx, character);
    const equipped = SLOTS.map((sl) => {
      const g = s.gear.find((x) => x.id === s.equip?.[sl]);
      return { slot: sl === "shield" ? "Off-hand" : SLOT_INFO[sl].name, item: g ? toGearJson(g) : null };
    });
    const offhandItem = s.ranged ? { id: s.ranged, name: TOOL[s.ranged]?.name ?? s.ranged } : null;
    const text = [
      `${s.char.name} (slot ${slot}) equipment:`,
      ...equipped.map((e) => `${e.slot}: ${e.item ? `${e.item.name} [${e.item.grade}${e.item.enhancement ? ` +${e.item.enhancement}` : ""}]` : e.slot === "Off-hand" && offhandItem ? offhandItem.name : "—"}`),
    ].join("\n");
    return { content: [{ type: "text", text }], structuredContent: { slot, equipped, offhandItem } };
  },
});
