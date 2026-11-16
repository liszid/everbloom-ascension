// Linear specializations: six paths that rank up from lifetime counters — pure data, no engine imports.
// Earned by how you play; the hero chooses one unlocked path to apply (GameState.spec).
import type { StatKey } from "./data";

export interface SpecRank { name: string; need: number; desc: string; /** +0.1 = +10%; crit/dodge/acc 0.05 = +5 points. */ mods: Partial<Record<StatKey, number>>; traits: string[] }
export interface SpecTrack { id: string; name: string; icon: string; desc: string; /** GameState.stats counter. */ stat: string; how: string; ranks: SpecRank[] }

export const SPEC_TRACKS: SpecTrack[] = [
  { id: "faith", name: "The Holy Covenant", icon: "🙏", desc: "Channels divine favor earned through devout prayer and temple blessings.", stat: "prayers", how: "Pray at the Church", ranks: [
    { name: "Acolyte", need: 10, desc: "A devout student kneeling before the altar.", mods: { mp: 0.08, mdef: 0.06 }, traits: ["Minor Benediction", "Calm Spirit"] },
    { name: "Priest", need: 30, desc: "An ordained servant capable of soothing wounds and purifying malice.", mods: { mp: 0.15, matk: 0.08, mdef: 0.1 }, traits: ["Holy Aura", "Merciful Touch"] },
    { name: "High Priest", need: 70, desc: "A pillar of the faithful whose word summons angelic warmth.", mods: { mp: 0.22, matk: 0.14, mdef: 0.15, hp: 0.08 }, traits: ["Sanctified Grace", "Divine Ward"] },
    { name: "Holy Templar", need: 120, desc: "A martial champion clad in consecrated steel and glowing scripture.", mods: { hp: 0.16, patk: 0.12, matk: 0.16, pdef: 0.14, mdef: 0.18 }, traits: ["Smite Evil", "Aura of Protection"] },
    { name: "Seraphic Saint", need: 200, desc: "The supreme earthly conduit of divine power. Miracles follow their step.", mods: { hp: 0.25, mp: 0.3, matk: 0.25, mdef: 0.25, luck: 0.15 }, traits: ["Heavenly Host", "Resurrection Seal", "Unbroken Faith"] },
  ] },
  { id: "ranged", name: "The Deadeye Path", icon: "🏹", desc: "Honed through countless shots with bows, crossbows, and slings.", stat: "rangedHits", how: "Land shots with an off-hand ranged weapon", ranks: [
    { name: "Hunter", need: 30, desc: "Patient stalker of forest beasts and wild game.", mods: { acc: 0.04, crit: 0.02, patk: 0.05 }, traits: ["Keen Sights", "Eagle Focus"] },
    { name: "Scout", need: 100, desc: "A nimble skirmisher who strikes from the tall brush before vanishing.", mods: { acc: 0.07, crit: 0.04, dodge: 0.04, patk: 0.1 }, traits: ["Fleet Footwork", "Piercing Arrow"] },
    { name: "Sharpshooter", need: 250, desc: "Calculates wind, trajectory, and weak spots in an instant.", mods: { acc: 0.1, crit: 0.08, critDmg: 0.2, patk: 0.15 }, traits: ["Vitals Aim", "Pinpoint Impact"] },
    { name: "Sniper", need: 500, desc: "Delivers lethal bolts from well beyond the enemy's retaliatory range.", mods: { acc: 0.14, crit: 0.12, critDmg: 0.35, patk: 0.2, dodge: 0.06 }, traits: ["Headshot Mastery", "Unseen Stalker"] },
    { name: "Phantom Marksman", need: 1000, desc: "Arrows materialize through solid stone, claiming foes before the bowstring sounds.", mods: { acc: 0.2, crit: 0.18, critDmg: 0.5, patk: 0.28, dodge: 0.1 }, traits: ["Arrow of the Void", "Ghost Mirage", "Armor Obliteration"] },
  ] },
  { id: "fire", name: "The Ember Lineage", icon: "🔥", desc: "Born of sparks and nourished by wielding torches into the deep dark.", stat: "torchStrikes", how: "Burn foes with a held torch", ranks: [
    { name: "Lantern Bearer", need: 25, desc: "Dispels the dungeon shadows with a steady hand and dry pitch.", mods: { hp: 0.06, patk: 0.05 }, traits: ["Lantern Ward", "Searing Brand"] },
    { name: "Firebrand", need: 80, desc: "Spreads sparks with every weapon clash, igniting vulnerable hides.", mods: { patk: 0.1, matk: 0.08, crit: 0.03 }, traits: ["Cauterize", "Ember Whip"] },
    { name: "Pyromancer", need: 200, desc: "Commands swirling fireballs and dancing flame shrouds.", mods: { matk: 0.18, patk: 0.1, mp: 0.12 }, traits: ["Flashfire Burst", "Thermal Cloak"] },
    { name: "Hellfire Zealot", need: 400, desc: "Converts their own vitality into searing white-hot agony for opponents.", mods: { patk: 0.18, matk: 0.22, crit: 0.08, critDmg: 0.25 }, traits: ["Immolation Aura", "Scorched Earth"] },
    { name: "Living Pyre", need: 750, desc: "The flesh has fused with eternal fire. Striking them is striking an erupting caldera.", mods: { hp: 0.2, patk: 0.22, matk: 0.3, pdef: 0.12, mdef: 0.15 }, traits: ["Infernal Resurgence", "Supernova", "Pure Flame Core"] },
  ] },
  { id: "fortune", name: "The Gambler's Guild", icon: "🎲", desc: "Mastery over probability, loaded rolls, and brazen fortune.", stat: "casinoWins", how: "Win casino games", ranks: [
    { name: "Risktaker", need: 10, desc: "Thrives when the odds are slightly stacked against them.", mods: { luck: 0.1, crit: 0.03 }, traits: ["Lady Luck's Smile", "Daring Bet"] },
    { name: "Cardsharp", need: 30, desc: "Quick fingers and a poker face that conceals lethal sleights.", mods: { luck: 0.18, crit: 0.05, dodge: 0.04 }, traits: ["Ace in the Hole", "Loaded Draw"] },
    { name: "Dice Roller", need: 75, desc: "Bends the physics of rotating dice to produce favorable streaks.", mods: { luck: 0.28, crit: 0.08, critDmg: 0.2 }, traits: ["Double Sixes", "Reroll Fate"] },
    { name: "High Roller", need: 150, desc: "Bets immense sums of vitality and coin on every single stroke.", mods: { luck: 0.4, crit: 0.12, critDmg: 0.35, dodge: 0.07 }, traits: ["All In", "Jackpot Fever"] },
    { name: "Gambler King", need: 300, desc: "Reality itself submits to their wager. The house always loses against them.", mods: { luck: 0.6, crit: 0.18, critDmg: 0.55, dodge: 0.12, patk: 0.15 }, traits: ["Wheel of Destiny", "Flawless Bluff", "Gold Rush Overdrive"] },
  ] },
  { id: "martial", name: "The Colosseum Brotherhood", icon: "🏟️", desc: "Forged in blood, shield bashes, and victorious arena duels.", stat: "bosses", how: "Defeat Tower Guardians", ranks: [
    { name: "Pit Fighter", need: 3, desc: "Survives brutal underground brawls with grit and calloused fists.", mods: { hp: 0.1, patk: 0.08, sta: 0.1 }, traits: ["Brawler's Grit", "Iron Jaw"] },
    { name: "Arena Duelist", need: 12, desc: "Fights with weapon balance and flamboyant crowd-pleasing strikes.", mods: { hp: 0.14, patk: 0.14, acc: 0.06, pdef: 0.08 }, traits: ["Riposte", "Gladiatorial Flourish"] },
    { name: "Centurion Veteran", need: 30, desc: "Commanding presence who leads combat lines and breaks cavalry charges.", mods: { hp: 0.2, patk: 0.18, pdef: 0.15, sta: 0.2 }, traits: ["Shield Wall", "Commanding Roar"] },
    { name: "Grand Champion", need: 60, desc: "The arena crowd chants their name as giants tumble before their feet.", mods: { hp: 0.28, patk: 0.25, pdef: 0.2, crit: 0.07 }, traits: ["Champion's Decapitation", "Unbreakable Will"] },
    { name: "Undefeated Sovereign", need: 120, desc: "A living god of the arena. No weapon has pierced their armor in a hundred battles.", mods: { hp: 0.38, patk: 0.32, pdef: 0.28, mdef: 0.18, sta: 0.3 }, traits: ["Aegis of the Victor", "Colossus Breaker", "Triumphant March"] },
  ] },
  { id: "alchemy", name: "The Transmuter's Circle", icon: "⚗️", desc: "Learned through refining reagents, brewing elixirs, and distilling monster essences.", stat: "potionsBrewed", how: "Brew potions in Craftery › Alchemy", ranks: [
    { name: "Apprentice Brewer", need: 10, desc: "Knows basic ratios of herbs and water to soothe fever and mend cuts.", mods: { mp: 0.08, luck: 0.06 }, traits: ["Careful Measure", "Herbal Extract"] },
    { name: "Apothecary", need: 35, desc: "Synthesizes battle tonics and poisonous salves for weapon blades.", mods: { mp: 0.14, matk: 0.08, luck: 0.1 }, traits: ["Toxic Distillation", "Quick Salve"] },
    { name: "Alchemical Craftsman", need: 80, desc: "Produces stabilized volatile flasks and multi-tiered restorative brews.", mods: { mp: 0.2, matk: 0.14, mdef: 0.12, luck: 0.15 }, traits: ["Catalytic Surge", "Enhanced Potency"] },
    { name: "Master Transmuter", need: 160, desc: "Alters material densities and elemental attunements at room temperature.", mods: { mp: 0.26, matk: 0.22, mdef: 0.18, luck: 0.22, hp: 0.1 }, traits: ["Philosopher's Coating", "Volatile Flask Cascades"] },
    { name: "Philosopher's Adept", need: 300, desc: "Holds the secret to the Magnum Opus: turning lead into gold and base blood into elixir.", mods: { hp: 0.2, mp: 0.35, matk: 0.3, mdef: 0.25, luck: 0.35 }, traits: ["Elixir of Immortality", "Universal Solvent", "Homunculus Ward"] },
  ] },
];
export const SPEC: Record<string, SpecTrack> = Object.fromEntries(SPEC_TRACKS.map((t) => [t.id, t]));
/** Highest rank reached on a path (−1 = not unlocked yet). */
export function specRank(t: SpecTrack, stats: Record<string, number>) {
  const v = stats[t.stat] ?? 0; let r = -1; t.ranks.forEach((x, i) => { if (v >= x.need) r = i; }); return r;
}
