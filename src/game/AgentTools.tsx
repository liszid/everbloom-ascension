import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { SLOTS, SLOT_INFO, GRADES } from "./data";
import { charLevel, playerStats, type GameState } from "./engine";
import { TOOL } from "./items";

/** Browser-agent tools for the hero currently on screen (read-only). Renders nothing. */
export function GameAgentTools({ s }: { s: GameState }) {
  useWebMCP({
    name: "get_hero_status",
    description: "Read the hero currently being played: level, class, health, mana, gold, where they are and any ongoing battle.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("get_hero_status", () => {
      const p = playerStats(s);
      const where = s.loc === "dungeon" ? `Tower floor ${s.dungeon?.floor ?? "?"}` : "Village";
      const lines = [
        `${s.char.name} — Lv ${charLevel(s.xp)} ${s.char.race} ${s.className}`,
        `HP ${Math.round(s.hp)}/${Math.round(p.hp)}, MP ${Math.round(s.mp)}/${Math.round(p.mp)}, ${Math.floor(s.gold)} gold`,
        `Location: ${where}. Highest floor: ${s.maxFloor}.`,
      ];
      if (s.combat) lines.push(`In battle with ${s.combat.mon.name} (HP ${Math.round(s.combat.mon.hp)}/${Math.round(s.combat.mon.maxHp)}).`);
      return lines.join("\n");
    }),
  });

  useWebMCP({
    name: "list_equipped_gear",
    description: "List the gear the current hero has equipped in each slot, with grade and enhancement.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("list_equipped_gear", () =>
      SLOTS.map((sl) => {
        const g = s.gear.find((x) => x.id === s.equip[sl]);
        const label = sl === "shield" ? "Off-hand" : SLOT_INFO[sl].name;
        if (g) return `${label}: ${g.name} [${GRADES[g.grade] ?? g.grade}${g.enh ? ` +${g.enh}` : ""}]`;
        if (sl === "shield" && s.ranged) return `${label}: ${TOOL[s.ranged]?.name ?? s.ranged}`;
        return `${label}: —`;
      }).join("\n")),
  });

  return null;
}
