import { defineTool } from "@lovable.dev/mcp-js";
import { characterArg, heroLevel, pickHero, round } from "../heroes";
import { affLevel, lvl, playerStats, raceClassProgress } from "@/game/engine";
import { AFFINITIES, SKILLS } from "@/game/data";
import { titleStars } from "@/game/titles";

export default defineTool({
  name: "get_character",
  title: "Get character",
  description: "Show a character's level, class, health, gold, location, combat stats, top skills and affinities.",
  inputSchema: characterArg,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ character }, ctx) => {
    const { hero: s, slot, savedAt } = await pickHero(ctx, character);
    const ps = playerStats(s);
    const skills = Object.keys(s.skills ?? {})
      .map((k) => ({ skill: SKILLS[k]?.name ?? k, level: lvl(s, k) }))
      .sort((a, b) => b.level - a.level).slice(0, 8);
    const affinities = AFFINITIES.map((a) => ({ affinity: a.name, level: affLevel(s.aff?.[a.id] ?? 0) }))
      .filter((a) => a.level > 0).sort((a, b) => b.level - a.level).slice(0, 6);
    const rc = raceClassProgress(s);
    const title = s.title ? { name: s.title, stars: titleStars(s.title, s.titleTime?.[s.title] ?? 0) } : null;
    const where = s.loc === "dungeon" ? `Tower floor ${s.dungeon?.floor ?? "?"}` : "Village";
    const summary = {
      slot, name: s.char.name, gender: s.char.gender, race: s.char.race, background: s.char.bg,
      class: s.className, level: heroLevel(s), xp: Math.floor(s.xp ?? 0),
      hp: `${Math.round(s.hp)}/${Math.round(ps.hp)}`, mp: `${Math.round(s.mp)}/${Math.round(ps.mp)}`,
      gold: Math.floor(s.gold ?? 0), guildTokens: s.tokens ?? 0,
      location: where, highestFloor: s.maxFloor ?? 0, wonGame: !!s.won,
      playTimeHours: round((s.playTime ?? 0) / 3600),
      title,
      stats: {
        physicalAttack: round(ps.patk), magicAttack: round(ps.matk), physicalDefense: round(ps.pdef), magicDefense: round(ps.mdef),
        critChance: round(ps.crit), critDamage: round(ps.critDmg), dodge: round(ps.dodge), accuracy: round(ps.acc), speed: round(ps.spd), luck: round(ps.luck),
        element: ps.element,
      },
      topSkills: skills,
      topAffinities: affinities,
      ailments: Object.entries(s.ailments ?? {}).filter(([, v]) => (v ?? 0) > 0).map(([k]) => k),
      blessing: s.blessing ? { id: s.blessing.id, battlesLeft: s.blessing.left } : null,
      raceMastery: rc ? { percent: rc.pct, rank: rc.line.ranks[rc.rank] ?? null, nextRankAtPercent: rc.next ?? null } : null,
      lastSaved: savedAt,
    };
    const text = [
      `${summary.name} — Lv ${summary.level} ${summary.race} ${summary.class} (slot ${slot})`,
      `HP ${summary.hp}, MP ${summary.mp}, ${summary.gold} gold. ${where}; best floor ${summary.highestFloor}.`,
      `P.Atk ${summary.stats.physicalAttack}, M.Atk ${summary.stats.magicAttack}, P.Def ${summary.stats.physicalDefense}, M.Def ${summary.stats.magicDefense}`,
      `Top skills: ${skills.map((x) => `${x.skill} ${x.level}`).join(", ") || "none"}`,
      title ? `Title: ${title.name} (${title.stars}★)` : "No title equipped",
    ].join("\n");
    return { content: [{ type: "text", text }], structuredContent: { character: summary } };
  },
});
