import { defineTool } from "@lovable.dev/mcp-js";
import { characterArg, pickHero, toGearJson } from "../heroes";
import { getMat, MATERIALS } from "@/game/data";
import { TOOL } from "@/game/items";

const mats = (m: Record<string, number> | undefined) =>
  Object.entries(m ?? {}).filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ id, name: MATERIALS[id] ? getMat(id).name : id, tier: MATERIALS[id] ? getMat(id).tier : 0, qty }))
    .sort((a, b) => b.tier - a.tier || a.name.localeCompare(b.name));

export default defineTool({
  name: "get_inventory",
  title: "Get inventory",
  description: "List a character's materials, home storage, food, Craftery items and unequipped gear.",
  inputSchema: characterArg,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ character }, ctx) => {
    const { hero: s, slot } = await pickHero(ctx, character);
    const worn = new Set(Object.values(s.equip ?? {}));
    const materials = mats(s.inv);
    const storage = mats(s.wh);
    const towerBag = mats(s.bag);
    const food = (s.foods ?? []).filter((f) => f.qty > 0).map((f) => ({ name: f.name, heal: f.heal, qty: f.qty }));
    const craftery = Object.entries(s.tools ?? {}).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, name: TOOL[id]?.name ?? id, qty }));
    const spareGear = (s.gear ?? []).filter((g) => !worn.has(g.id)).map(toGearJson);
    const storedGear = (s.whGear ?? []).map(toGearJson);
    const text = [
      `${s.char.name} (slot ${slot}) — ${Math.floor(s.gold ?? 0)} gold`,
      `Materials: ${materials.slice(0, 25).map((m) => `${m.name} ×${m.qty}`).join(", ") || "none"}${materials.length > 25 ? ` …(+${materials.length - 25} more)` : ""}`,
      `Home storage: ${storage.length} kinds of material, ${storedGear.length} gear`,
      `Food: ${food.map((f) => `${f.name} ×${f.qty}`).join(", ") || "none"}`,
      `Craftery items: ${craftery.map((t) => `${t.name} ×${t.qty}`).join(", ") || "none"}`,
      `Unequipped gear: ${spareGear.map((g) => `${g.name} [${g.grade}]`).join(", ") || "none"}`,
      towerBag.length ? `Tower bag (lost on death): ${towerBag.map((m) => `${m.name} ×${m.qty}`).join(", ")}` : "",
    ].filter(Boolean).join("\n");
    return { content: [{ type: "text", text }], structuredContent: { slot, gold: Math.floor(s.gold ?? 0), materials, storage, towerBag, food, craftery, spareGear, storedGear } };
  },
});
