import { defineTool } from "@lovable.dev/mcp-js";
import { heroLevel, loadHeroes } from "../heroes";

export default defineTool({
  name: "list_characters",
  title: "List characters",
  description: "List the signed-in player's Thornvale characters with level, class, race and highest tower floor.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { slots, active, savedAt } = await loadHeroes(ctx);
    const characters = slots.map((s, i) => ({
      slot: i + 1,
      name: s.char.name,
      race: s.char.race,
      gender: s.char.gender,
      class: s.className,
      level: heroLevel(s),
      highestFloor: s.maxFloor ?? 0,
      gold: Math.floor(s.gold ?? 0),
      active: i === active,
    }));
    const text = characters.length
      ? characters.map((c) => `#${c.slot}${c.active ? " (playing)" : ""} ${c.name} — Lv ${c.level} ${c.race} ${c.class}, best floor ${c.highestFloor}, ${c.gold} gold`).join("\n")
      : "No characters yet.";
    return { content: [{ type: "text", text }], structuredContent: { characters, lastSaved: savedAt } };
  },
});
