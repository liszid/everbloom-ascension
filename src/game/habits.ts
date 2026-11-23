// Monster movement habits in the Tower — pure data. engine.moveMonsters reads them; spawning and stats never change.
import { MON_DEF } from "./bestiary";

/**
 * chase:   hunts the hero from afar (fiends, hungry undead).
 * prowl:   wanders its home room and charges only when the hero comes within 3 steps (beasts, dragons, giants).
 * patrol:  walks back and forth along a line, turning at walls; notices the hero within 3 steps (humanoids, constructs on guard).
 * wander:  drifts around at random and never really hunts (oozes, elementals, fey).
 * ambush:  stays perfectly still until the hero is right next to it (aberrations, monstrosities, mimics).
 * skittish: flutters erratically and only fights when cornered or touched (bats and other small flyers).
 */
export type Habit = "chase" | "prowl" | "patrol" | "wander" | "ambush" | "skittish";
const BY_ID: Record<string, Habit> = {
  bat: "skittish", swarm_bats: "skittish", rat: "skittish", harpy: "skittish", imp: "skittish", stirge: "skittish", pixie: "skittish", sprite: "skittish",
  mimic: "ambush", spider: "ambush", gelatinous_cube: "ambush", rust_monster: "prowl", gargoyle: "ambush", piercer: "ambush", roper: "ambush", trapper: "ambush",
  wolf: "prowl", skeleton: "patrol", wraith: "chase", vampire: "chase", ghoul: "chase", zombie: "wander", golem: "patrol", lich: "patrol",
  slime: "wander", frost: "wander", phoenix: "wander",
  swarm_rats: "skittish", swarm_insects: "skittish", giant_rat: "skittish", quasit: "skittish", devil_imp: "skittish", cockatrice: "skittish", blink_dog: "skittish",
  rug_of_smothering: "ambush", animated_armor: "patrol", ankheg: "ambush", bulette: "ambush", umber_hulk: "ambush", basilisk: "ambush", medusa: "ambush", kraken: "ambush",
  owlbear: "prowl", griffin: "prowl", hippogriff: "prowl", manticore: "prowl", chimera: "prowl", worg: "prowl", winter_wolf: "prowl", displacer_beast: "prowl", hydra: "prowl",
  minotaur: "patrol", centaur: "patrol", tarrasque: "chase", hell_hound: "chase", specter: "chase", banshee: "chase", shadow: "chase",
};
const BY_CAT: Record<string, Habit> = {
  beast: "prowl", dragon: "prowl", giant: "prowl", undead: "patrol", humanoid: "patrol", construct: "patrol", celestial: "patrol",
  fiend: "chase", ooze: "wander", elemental: "wander", fey: "wander", plant: "ambush", aberration: "ambush", monstrosity: "ambush",
};
export const habitOf = (id: string): Habit => BY_ID[id] ?? BY_CAT[MON_DEF[id]?.cat ?? ""] ?? "prowl";
/** Steps within which each habit notices (and goes after) the hero. */
export const NOTICE: Record<Habit, number> = { chase: 6, prowl: 3, patrol: 3, wander: 0, ambush: 1, skittish: 0 };
/** How far a prowler strays from where it spawned. */
export const HOME_RANGE = 3;
/** Chance to idle in place on a turn (lazier monsters stand around more). */
export const IDLE: Record<Habit, number> = { chase: 0.25, prowl: 0.45, patrol: 0.15, wander: 0.5, ambush: 1, skittish: 0.1 };

/** Flying creatures flap their wings while they hover in place (presentation only). */
const FLYERS = /bat|harpy|wyvern|dragon|phoenix|seraph|imp|quasit|eagle|griffin|hippogriff|pegasus|manticore|chimera|vrock|cockatrice|beholder|death_tyrant|wisp|frost|wraith|ghost|specter|banshee|flying_sword|insects/i;
export const isFlyer = (id: string) => FLYERS.test(id);
