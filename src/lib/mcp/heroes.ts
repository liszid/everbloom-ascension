import { ToolError, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "./supabase";
import { charLevel, gearStats, type Gear, type GameState } from "@/game/engine";
import { GRADES, SLOT_INFO, STAT_KEYS } from "@/game/data";

export const characterArg = {
  character: z.number().int().min(1).max(5).optional()
    .describe("Character slot number from list_characters (1-5). Omit to use the character currently being played."),
};

type RawSave = GameState | { multi: true; active: number; slots: GameState[] };

/** Loads the caller's own saved characters (row-level security limits it to their save). */
export async function loadHeroes(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Thornvale first.");
  const db = supabaseForUser(ctx);
  const { data, error } = await db.from("game_saves").select("data, updated_at").eq("user_id", ctx.getUserId() ?? "").maybeSingle();
  if (error) throw new ToolError("Could not read your saved game right now.");
  const raw = data?.data as RawSave | undefined;
  let slots: GameState[] = []; let active = 0;
  if (raw && "multi" in raw) { slots = (raw.slots ?? []).filter((x) => x?.v === 2); active = Math.max(0, Math.min(raw.active ?? 0, slots.length - 1)); }
  else if (raw && raw.v === 2) slots = [raw];
  return { slots, active, savedAt: (data?.updated_at as string | undefined) ?? null };
}

export async function pickHero(ctx: ToolContext, character?: number) {
  const { slots, active, savedAt } = await loadHeroes(ctx);
  if (!slots.length) throw new ToolError("You have no saved characters yet. Create one in the game first.");
  const idx = character === undefined ? active : character - 1;
  const hero = slots[idx];
  if (!hero) throw new ToolError(`There is no character in slot ${character}. You have ${slots.length}.`);
  return { hero, slot: idx + 1, savedAt };
}

export const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
export const heroLevel = (s: GameState) => charLevel(s.xp ?? 0);

export const toGearJson = (g: Gear) => {
  const st = gearStats(g);
  const stats: Record<string, number> = {};
  for (const k of STAT_KEYS) if (st[k]) stats[k] = round(st[k]);
  return {
    id: g.id,
    name: g.name,
    slot: SLOT_INFO[g.slot]?.name ?? g.slot,
    grade: GRADES[g.grade] ?? String(g.grade),
    element: g.element,
    enhancement: g.enh ?? 0,
    durability: `${Math.round(g.dura)}/${Math.round(g.maxDura)}`,
    enchantment: g.ench ? `${g.ench.el} +${g.ench.v}` : null,
    effects: (g.effects ?? []).map((e) => ({ effect: e.id, value: round(e.v) })),
    stats,
  };
};
