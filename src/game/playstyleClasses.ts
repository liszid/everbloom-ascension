// Playstyle classes from three aspects — pure data plus a pure resolver.
// An aspect is an affinity (grown by how you play) or a mastered combined/special magic school.
// Elemental schools feed their matching affinity (Herbalism feeds Nature), so they are not separate aspects.
import type { StatKey } from "./data";
import type { SchoolId } from "./magic";

export type ClassRole = "striker" | "tank" | "caster" | "specialist" | "hybrid";
export interface PlaystyleClass {
  id: string; name: string; triad: [string, string, string]; role: ClassRole; desc: string;
  /** Bonus at full strength (+0.1 = +10%; crit/dodge/acc 0.05 = +5 points); scaled by class tier. */ mods: Partial<Record<StatKey, number>>;
  /** Signature style names (flavour). */ traits: string[];
}
/** Magic schools that count as their own aspect (school level × SCHOOL_ASPECT_W). */
export const SCHOOL_ASPECTS: SchoolId[] = ["summoning", "soul", "transformation", "blood", "necromancy", "plague", "storm", "magma"];
/** Elemental schools add level × SCHOOL_AFF_W to the matching affinity's score. */
export const SCHOOL_TO_AFF: Partial<Record<SchoolId, string>> = { fire: "fire", water: "water", wind: "wind", earth: "earth", light: "light", dark: "dark", herbal: "nature" };
export const SCHOOL_ASPECT_W = 3;
export const SCHOOL_AFF_W = 2;
/** The third aspect must reach this score and this share of the strongest aspect. */
export const TRIAD_MIN = 8;
export const TRIAD_SHARE = 0.35;
/** Triad classes start at class tier 1; the name gains a prefix at higher tiers. */
export const TRIAD_PREFIX = ["", "", "Elite", "Exalted"];
/** Share of a triad's mods granted at class tier 0..3. */
export const TRIAD_SCALE = [0, 0.5, 0.75, 1];

const T = (id: string, name: string, triad: [string, string, string], role: ClassRole, desc: string, mods: Partial<Record<StatKey, number>>, traits: string[]): PlaystyleClass => ({ id, name, triad, role, desc, mods, traits });

export const TRIAD_CLASSES: PlaystyleClass[] = [
  T("iron_vanguard", "Iron Vanguard", ["shield", "might", "earth"], "tank", "Immovable armored wall that weathers the heaviest blows.", { hp: 0.22, pdef: 0.25 }, ["Bulwark Stance", "Stone Fortress"]),
  T("sword_saint", "Sword Saint", ["sword", "agility", "might"], "striker", "Master of pure physical blade flow, balance, and reach.", { patk: 0.2, crit: 0.08, spd: 0.08 }, ["Iaijutsu", "Blade Ward"]),
  T("berserker_titan", "Berserker Titan", ["might", "sword", "earth"], "striker", "Frenzied destroyer who trades caution for devastating impact.", { patk: 0.25, hp: 0.15, pdef: -0.05 }, ["Blood Frenzy", "Tremor Cleave"]),
  T("duelist_fencer", "Master Duelist", ["sword", "agility", "fortune"], "striker", "Pinpoint rapier strikes exploiting enemy openings and crits.", { patk: 0.15, crit: 0.15, dodge: 0.1 }, ["Parry & Riposte", "Flawless Footwork"]),
  T("mountain_juggernaut", "Mountain Juggernaut", ["might", "shield", "crafting"], "tank", "Living siege engine outfitted in thickest forged plate.", { hp: 0.2, pdef: 0.28 }, ["Siege Breaker", "Tempered Plating"]),
  T("whirlwind_dervish", "Whirlwind Dervish", ["sword", "agility", "wind"], "striker", "Spins through ranks like a gale, cleaving all in range.", { patk: 0.18, spd: 0.15, dodge: 0.08 }, ["Gale Dance", "Endless Flurry"]),
  T("gladiator_champion", "Gladiator Champion", ["might", "sword", "hunting"], "striker", "Arena veteran seasoned against every monstrous physiology.", { patk: 0.18, hp: 0.12, crit: 0.08 }, ["Crowd Pleaser", "Trophy Taker"]),
  T("shield_sentinel", "Aegis Sentinel", ["shield", "sword", "agility"], "tank", "Balances defensive bastion guards with rapid sword counters.", { pdef: 0.2, patk: 0.1, dodge: 0.06 }, ["Shield Bash", "Counterstep"]),
  T("earthshaker_brawler", "Earthshaker Pugilist", ["might", "earth", "crafting"], "striker", "Bare-fisted boxer whose punches crack stone and armor.", { patk: 0.22, pdef: 0.15 }, ["Shatter Fist", "Granite Guard"]),
  T("skirmisher", "Frontier Skirmisher", ["hunting", "sword", "agility"], "striker", "Hits and fades across rugged frontline corridors.", { patk: 0.14, spd: 0.12, dodge: 0.08 }, ["Hit and Fade", "Flanking Blade"]),
  T("executioner", "Headsman Executioner", ["might", "sword", "dark"], "striker", "Wields massive greatswords aimed at decapitating strikes.", { patk: 0.26, crit: 0.06 }, ["Execution Arc", "Grave Strike"]),
  T("deep_miner_brawler", "Subterranean Mauler", ["might", "earth", "hunting"], "striker", "Hardened deep in lightless shafts, deadly with pick and fist.", { patk: 0.18, pdef: 0.14, hp: 0.1 }, ["Tunnel Senses", "Pickaxe Pierce"]),
  T("tactical_warlord", "Grand Warlord", ["might", "shield", "sword"], "hybrid", "Commanding presence leading battle lines with supreme vigor.", { hp: 0.15, patk: 0.12, pdef: 0.15 }, ["War Cry", "Tactical Stance"]),
  T("blade_warden", "Blade Warden", ["sword", "shield", "crafting"], "tank", "Maintains finely tempered gear that deflects all incoming edges.", { pdef: 0.18, patk: 0.12, hp: 0.1 }, ["Honed Edge", "Deflecting Shield"]),
  T("grand_elementalist", "Grand Elementalist", ["fire", "water", "earth"], "caster", "Weaves the three pillars of terrestrial magic in tandem.", { matk: 0.28, mp: 0.2 }, ["Tri-Weaving", "Primordial Harmony"]),
  T("pyro_arcanist", "Solar Evoker", ["fire", "arcane", "wind"], "caster", "Funnels aether into white-hot solar flares and vortexes.", { matk: 0.26, crit: 0.08 }, ["Solar Flare", "Combustion Blast"]),
  T("cryo_sage", "Glacial Archon", ["water", "earth", "arcane"], "caster", "Freezes battlefields into solid rime and piercing icicles.", { matk: 0.22, mdef: 0.18, mp: 0.15 }, ["Frost Armor", "Absolute Zero"]),
  T("tempest_caller", "Tempest Archmage", ["wind", "water", "arcane"], "caster", "Unleashes torrential rain, typhoons, and arcs of static.", { matk: 0.24, spd: 0.12, mp: 0.15 }, ["Tempest Veil", "Chain Arc"]),
  T("aether_scholar", "Aether Scholar", ["arcane", "light", "crafting"], "caster", "Inscribes pure mana glyphs onto gear and battlefield ley lines.", { matk: 0.22, mp: 0.25 }, ["Mana Font", "Glyph Infusion"]),
  T("infernal_spellblade", "Infernal Spellblade", ["fire", "sword", "arcane"], "striker", "Sheathes steel blades in roaring sheets of destructive flame.", { patk: 0.15, matk: 0.15, crit: 0.08 }, ["Flame Edge", "Burst Slash"]),
  T("frost_spellblade", "Rime Knight", ["water", "sword", "shield"], "tank", "Coats shields in permafrost and strikes with freezing slashes.", { pdef: 0.16, matk: 0.14, hp: 0.12 }, ["Glacial Shield", "Chilling Riposte"]),
  T("geomancer", "Terra Geomancer", ["earth", "arcane", "shield"], "caster", "Shapes monoliths and stone spires from beneath enemy feet.", { matk: 0.2, pdef: 0.18, hp: 0.1 }, ["Spire Eruption", "Obsidian Skin"]),
  T("volcano_shaman", "Magma Shaman", ["fire", "earth", "might"], "hybrid", "Channels molten lava, burning armor and breaking bones.", { patk: 0.16, matk: 0.18, hp: 0.12 }, ["Magma Burst", "Molten Core"]),
  T("zephyr_weaver", "Zephyr Chronomancer", ["wind", "arcane", "agility"], "caster", "Manipulates air pressure and time slipstreams for rapid casting.", { matk: 0.2, spd: 0.18, dodge: 0.1 }, ["Slipstream", "Rapid Inversion"]),
  T("mystic_artisan", "Runesmith Enchanter", ["arcane", "crafting", "earth"], "specialist", "Binds magical equations into forged metal and crystals.", { matk: 0.18, pdef: 0.12, mp: 0.15 }, ["Runic Hardening", "Arcane Anvil"]),
  T("mana_leech", "Aether Leech", ["arcane", "dark", "agility"], "caster", "Siphons mana from enemy spells to fuel unending counter-magic.", { matk: 0.22, dodge: 0.08, mp: 0.2 }, ["Mana Siphon", "Spell Void"]),
  T("prismatic_sage", "Prismatic Savant", ["light", "arcane", "fire"], "caster", "Focuses light through spectral lenses for blinding laser bursts.", { matk: 0.27, crit: 0.1 }, ["Prismatic Beam", "Refraction"]),
  T("deep_aquamancer", "Abyssal Aquamancer", ["water", "dark", "arcane"], "caster", "Crushes enemy lungs under simulated deep-ocean pressures.", { matk: 0.24, mdef: 0.15, mp: 0.18 }, ["Crushing Depths", "Tidal Vortex"]),
  T("spellbreaker", "Arcane Spellbreaker", ["sword", "arcane", "shield"], "tank", "Cuts through magic spells and reflects bolts back at casters.", { patk: 0.12, mdef: 0.22, pdef: 0.12 }, ["Spell Ward", "Aether Sever"]),
  T("battlemage", "Frontline Battlemage", ["might", "arcane", "shield"], "hybrid", "Heavy plate armor caster dropping point-blank detonations.", { patk: 0.14, matk: 0.18, pdef: 0.14 }, ["Point-Blank Burst", "Armored Casting"]),
  T("omni_adept", "Omni-Adept", ["might", "arcane", "agility"], "hybrid", "Flawless harmony between physical prowess, magic, and speed.", { hp: 0.1, patk: 0.1, matk: 0.1, spd: 0.08 }, ["Flowing Form", "Spellstrike"]),
  T("shadow_assassin", "Shadow Assassin", ["dark", "sword", "agility"], "striker", "Strikes out of total darkness, leaving fatal severed arteries.", { patk: 0.22, crit: 0.14, dodge: 0.1 }, ["Shadowmeld", "Sneak Attack"]),
  T("nightstalker_ranger", "Nightstalker Sniper", ["hunting", "dark", "agility"], "striker", "Long-range marksman firing black feathered arrows unseen.", { patk: 0.2, acc: 0.12, crit: 0.1 }, ["Heartseeker", "Silenced Shot"]),
  T("poison_blademaster", "Venom Corsair", ["hunting", "sword", "crafting"], "striker", "Envenoms every dagger and blade with neurotoxic secretions.", { patk: 0.16, crit: 0.12, spd: 0.08 }, ["Toxic Coating", "Lingering Neurotoxin"]),
  T("gloom_stalker", "Gloom Stalker", ["dark", "hunting", "earth"], "striker", "Prowls subterranean caves and strikes prey from ceilings.", { patk: 0.18, dodge: 0.1, acc: 0.08 }, ["Cave Ambush", "Night Vision"]),
  T("shadow_trapper", "Umbral Saboteur", ["dark", "crafting", "hunting"], "specialist", "Lays shadowed snare traps that drag victims into the void.", { patk: 0.14, dodge: 0.12, acc: 0.1 }, ["Void Trap", "Smoke Screen"]),
  T("phantom_trickster", "Phantom Trickster", ["dark", "fortune", "agility"], "specialist", "Confuses enemies with afterimages and unpredictable feints.", { dodge: 0.16, crit: 0.12, spd: 0.1 }, ["Mirage Mirror", "Loaded Feint"]),
  T("highwayman", "Highway Plunderer", ["might", "hunting", "fortune"], "striker", "Aggressive ambusher demanding your gold or your life.", { patk: 0.18, crit: 0.08, hp: 0.1 }, ["Pocket Sand", "Gold Rush"]),
  T("dungeon_infiltrator", "Tower Infiltrator", ["agility", "crafting", "shield"], "hybrid", "Disarms lethal pressure plates and slips past guard sentries.", { dodge: 0.12, pdef: 0.1, spd: 0.1 }, ["Trap Evasion", "Light Steps"]),
  T("shadow_spellblade", "Duskblade", ["dark", "arcane", "sword"], "striker", "Channels concentrated gloom directly into devastating thrusts.", { patk: 0.15, matk: 0.16, crit: 0.08 }, ["Duskbrand", "Shadow Step"]),
  T("blind_blademaster", "Echo Swordsman", ["sword", "wind", "might"], "striker", "Tracks heartbeat vibrations and strikes with unswerving precision.", { patk: 0.2, acc: 0.2, crit: 0.08 }, ["Echo Location", "Sonic Cleave"]),
  T("ashen_assassin", "Cinder Assassin", ["fire", "dark", "agility"], "striker", "Leaves only smoking ash where assassination targets once stood.", { patk: 0.16, matk: 0.14, crit: 0.1 }, ["Cinder Cloak", "Flash Incinerate"]),
  T("nether_archer", "Abyssal Marksman", ["hunting", "dark", "arcane"], "striker", "Fires ethereal arrows that curve around obstacles and shields.", { patk: 0.18, matk: 0.14, acc: 0.14 }, ["Curve Shot", "Void Quiver"]),
  T("crusader_paladin", "Crusader Paladin", ["light", "sword", "shield"], "tank", "Holy knight clad in shining steel, smiting fiends and undead.", { hp: 0.18, pdef: 0.18, patk: 0.12 }, ["Holy Smite", "Righteous Aegis"]),
  T("sacred_bastion", "Sacred Bastion", ["light", "shield", "earth"], "tank", "Impenetrable sanctuary aura that shelters allies and self.", { hp: 0.22, pdef: 0.22, mdef: 0.18 }, ["Divine Bulwark", "Sanctified Wall"]),
  T("high_inquisitor", "Grand Inquisitor", ["light", "sword", "fire"], "striker", "Purges heresy with holy brandings, scourges, and flames.", { patk: 0.16, matk: 0.16, crit: 0.08 }, ["Inquisitor's Brand", "Cleansing Fire"]),
  T("dawnbringer_cleric", "Dawn Cleric", ["light", "arcane", "water"], "caster", "Calls down celestial dawns that heal wounds and mend vitality.", { matk: 0.2, mdef: 0.2, mp: 0.18 }, ["Morning Light", "Grace Cascade"]),
  T("solar_justiciar", "Solar Justiciar", ["light", "might", "sword"], "striker", "Bears colossal holy greatswords glowing with blazing sunlight.", { patk: 0.22, hp: 0.14, mdef: 0.1 }, ["Solar Cleave", "Judgment Call"]),
  T("valkyrie_maiden", "Battle Maiden", ["light", "might", "agility"], "striker", "Glorious winged frontline warrior choosing heroes for heaven.", { patk: 0.18, spd: 0.12, crit: 0.08 }, ["Valhalla Charge", "Golden Wings"]),
  T("holy_avenger", "Holy Avenger", ["light", "dark", "sword"], "striker", "Wields both radiant justice and shadow retribution.", { patk: 0.2, matk: 0.12, crit: 0.1 }, ["Twilight Wrath", "Penitence"]),
  T("luminary_healer", "High Luminary", ["light", "nature", "water"], "caster", "Combines healing waters and divine grace for infinite restoration.", { hp: 0.15, mdef: 0.22, mp: 0.2 }, ["Living Spring", "Aura of Mending"]),
  T("radiant_archer", "Sunstrider Archer", ["hunting", "light", "wind"], "striker", "Draws light arrows directly from sunlight, scorching shadows.", { patk: 0.18, acc: 0.15, crit: 0.08 }, ["Light Piercer", "Solar Quiver"]),
  T("exorcist_warden", "Crypt Exorcist", ["light", "shield", "dark"], "tank", "Traps demons and undead in blessed silver chains.", { pdef: 0.16, mdef: 0.22, hp: 0.12 }, ["Silver Seal", "Banish Wicked"]),
  T("oracle_prophet", "Divine Oracle", ["light", "fortune", "arcane"], "caster", "Glimpses heavenly will to dodge catastrophes and ensure wins.", { matk: 0.2, dodge: 0.12, mp: 0.15 }, ["Prescience", "Heavenly Favor"]),
  T("sanctified_smith", "Divine Runesmith", ["light", "crafting", "shield"], "tank", "Consecrates weapon edges and blesses shields at the holy forge.", { pdef: 0.2, mdef: 0.16, hp: 0.1 }, ["Consecrated Steel", "Blessed Hammer"]),
  T("guardian_seraph", "Seraphic Champion", ["light", "shield", "might"], "tank", "Descends with shielding wings to block lethal dungeon bosses.", { hp: 0.25, pdef: 0.2, mdef: 0.2 }, ["Heavenly Shield", "Martyr's Grace"]),
  T("wild_druid", "Wild Druid", ["nature", "earth", "might"], "hybrid", "Draws primal muscle from living root systems and beasts.", { hp: 0.2, patk: 0.14, pdef: 0.12 }, ["Barkskin", "Primal Roar"]),
  T("beast_warden", "Beast Warden", ["hunting", "nature", "might"], "striker", "Coordinates lethal pack hunting tactics alongside beast allies.", { patk: 0.18, hp: 0.14, acc: 0.08 }, ["Pack Alpha", "Ferocious Rend"]),
  T("thorn_weaver", "Bramble Archon", ["nature", "earth", "arcane"], "caster", "Entangles dungeon rooms in iron-hard barbed briar patches.", { matk: 0.24, pdef: 0.14, hp: 0.1 }, ["Thorn Entangle", "Spore Poison"]),
  T("verdant_ranger", "Grove Ranger", ["hunting", "nature", "agility"], "striker", "Blends seamlessly into foliage and fires moss-draped arrows.", { patk: 0.18, spd: 0.14, dodge: 0.1 }, ["Forest Camouflage", "Swift Camouflage"]),
  T("storm_shaman", "Primal Stormcaller", ["nature", "wind", "water"], "caster", "Calls forth nature's wrath via lightning bolts and flash floods.", { matk: 0.22, spd: 0.1, mp: 0.18 }, ["Call Thunder", "Flash Flood"]),
  T("spirit_stalker", "Shamanic Spiritblade", ["nature", "dark", "sword"], "striker", "Channels ancestral animal totems through enchanted steel.", { patk: 0.18, matk: 0.12, crit: 0.08 }, ["Bear Spirit", "Ghost Talon"]),
  T("root_sentinel", "Ironroot Warden", ["nature", "shield", "earth"], "tank", "Encases wooden shields in petrified roots, soaking immense hits.", { hp: 0.24, pdef: 0.24 }, ["Living Bulwark", "Petrified Fiber"]),
  T("apex_predator", "Apex Predator", ["hunting", "might", "agility"], "striker", "The deadliest hunter alive; closes gaps and tears throats instantly.", { patk: 0.24, spd: 0.14, crit: 0.12 }, ["Pounce", "Throat Tear"]),
  T("swamp_witch", "Mire Sorceress", ["nature", "water", "dark"], "caster", "Brews stagnant swamp waters that dissolve enemy skin and armor.", { matk: 0.22, hp: 0.1, mp: 0.18 }, ["Stagnant Miasma", "Leech Swarm"]),
  T("fey_wanderer", "Fey Wanderer", ["nature", "light", "agility"], "hybrid", "Glides through danger with playful twilight illusions.", { dodge: 0.18, spd: 0.14, matk: 0.1 }, ["Glamour Shift", "Sprite Mischief"]),
  T("tundra_hunter", "Glacial Hunter", ["hunting", "water", "earth"], "striker", "Tracks mammoths across frozen wastes; immune to bitter blizzards.", { patk: 0.16, pdef: 0.14, hp: 0.12 }, ["Harpoon Pierce", "Tundra Skin"]),
  T("volcanic_predator", "Infernal Beastmaster", ["hunting", "fire", "might"], "striker", "Hunts with fire hounds and strikes with blazing obsidian daggers.", { patk: 0.2, matk: 0.12, crit: 0.08 }, ["Ignited Pounce", "Hellhound Pact"]),
  T("primal_berserker", "Wildling Ravager", ["might", "nature", "agility"], "striker", "Discards civilized weapons to fight with wild feral fury.", { patk: 0.24, spd: 0.12, hp: 0.12 }, ["Feral Claws", "Savage Roar"]),
  T("grand_alchemist", "Grand Chemist", ["crafting", "nature", "water"], "specialist", "Distills potent combat elixirs and flesh-dissolving acids.", { matk: 0.16, hp: 0.14, pdef: 0.1 }, ["Volatile Catalyst", "Panacea Mastery"]),
  T("tinkerer_trapper", "Master Trapper", ["crafting", "hunting", "agility"], "specialist", "Lays spring-loaded traps and automated crossbolts in seconds.", { spd: 0.14, acc: 0.14, crit: 0.08 }, ["Caltrop Field", "Springblade Trap"]),
  T("battle_smith", "Master Runesmith", ["crafting", "might", "fire"], "hybrid", "Heats warhammers in the furnace to forge weapons and crush foes.", { patk: 0.2, pdef: 0.15 }, ["Anvil Smash", "Molten Temper"]),
  T("culinary_gourmet", "Master Gourmet Chef", ["culinary", "nature", "fire"], "specialist", "Prepares legendary feast buffs that sustain heroes across floors.", { hp: 0.22, sta: 0.2 }, ["Gourmet Feast", "Iron Stomach"]),
  T("combat_chef", "Iron Skillet Cleaver", ["culinary", "might", "sword"], "striker", "Wields oversized butcher blades and hot skillets with lethal skill.", { patk: 0.2, hp: 0.12 }, ["Butcher Carve", "Searing Skillet"]),
  T("merchant_prince", "Merchant Magnate", ["fortune", "crafting", "shield"], "hybrid", "Buys the finest mercenary protection and crafts gilded armor.", { hp: 0.15, pdef: 0.15, luck: 0.2 }, ["Bribery Shield", "Golden Opportunity"]),
  T("luck_blade", "Fates Favored", ["fortune", "sword", "wind"], "striker", "Uncanny luck turns guaranteed lethal hits into grazing misses.", { crit: 0.15, dodge: 0.15, spd: 0.1 }, ["Miracle Evade", "Lucky Thrust"]),
  T("arcane_machinist", "Arcane Machinist", ["crafting", "arcane", "fire"], "specialist", "Assembles clockwork turrets and arcane cannons on the fly.", { matk: 0.18, pdef: 0.14, acc: 0.12 }, ["Turret Deployment", "Aether Ignition"]),
  T("deep_sea_angler", "Abyssal Harpooner", ["water", "hunting", "might"], "striker", "Drags sea monsters from the depths using spiked heavy lines.", { patk: 0.18, hp: 0.14, acc: 0.1 }, ["Harpoon Drag", "Deep Snare"]),
  T("blood_alchemist", "Sanguine Chymist", ["crafting", "dark", "nature"], "specialist", "Distills enemy blood into intoxicating stat-surging tonics.", { matk: 0.18, hp: 0.12, crit: 0.08 }, ["Blood Extraction", "Sanguine Brew"]),
  T("plague_doctor", "Miasma Purifier", ["crafting", "dark", "water"], "specialist", "Spreads contagion through glass vials while immune to all rot.", { matk: 0.16, mdef: 0.18, hp: 0.1 }, ["Plague Vial", "Antidote Mask"]),
  T("dungeon_scavenger", "Relic Prospector", ["hunting", "crafting", "earth"], "specialist", "Excavates ancient treasures and repairs enchanted gear instantly.", { pdef: 0.14, hp: 0.12, luck: 0.15 }, ["Dowsing Rod", "Relic Restoration"]),
  T("pyro_brewer", "Wildfire Brewer", ["crafting", "fire", "hunting"], "specialist", "Hurls volatile napalm firebombs that burn everything to ash.", { patk: 0.12, matk: 0.18, crit: 0.08 }, ["Napalm Flask", "Chain Conflagration"]),
  T("iron_chef_sentinel", "Feastmaster Bulwark", ["culinary", "shield", "might"], "tank", "Hearty champion whose cooking doubles frontline stamina.", { hp: 0.25, pdef: 0.2, sta: 0.2 }, ["Hearty Stew", "Cast Iron Wall"]),
  T("void_artisan", "Void Crafter", ["crafting", "dark", "arcane"], "specialist", "Forges weapons from compressed black hole matter.", { matk: 0.2, patk: 0.12, pdef: 0.1 }, ["Gravity Forge", "Singularity Brand"]),
  T("temporal_gambler", "Fate Reversalist", ["fortune", "wind", "arcane"], "specialist", "Rewinds missed attacks and forces favorable dice outcomes.", { crit: 0.18, spd: 0.14, dodge: 0.1 }, ["Reroll Destiny", "Temporal Rewind"]),
  T("abyssal_chef", "Kraken Gourmand", ["culinary", "water", "dark"], "hybrid", "Cooks terrifying abyssal predators for eldritch combat surges.", { hp: 0.16, matk: 0.14, sta: 0.15 }, ["Eldritch Filet", "Void Broth"]),
  T("battering_ram", "Iron Breaker", ["might", "crafting", "sword"], "tank", "Smashes through enemy shields and armor plates with tools.", { patk: 0.16, pdef: 0.2 }, ["Armor Breaker", "Heavy Impact"]),
  T("wind_dancer", "Wind Dancer", ["agility", "wind", "fortune"], "striker", "Graceful flow that converts movement speed into slicing force.", { spd: 0.18, patk: 0.12, dodge: 0.1 }, ["Zephyr Blade", "Untouchable"]),
  T("stalwart_defender", "Stalwart Defender", ["shield", "earth", "hunting"], "tank", "Roots heels into the ground and refuses to budge.", { pdef: 0.26, hp: 0.18 }, ["Rooted Bastion", "Unstoppable Wall"]),
  T("swift_scythe", "Gale Reaper", ["wind", "dark", "might"], "striker", "Swings broad sweeping blades with gale force momentum.", { patk: 0.17, spd: 0.14, acc: 0.1 }, ["Scythe Cleave", "Wind Slip"]),
  T("storm_spellblade", "Stormblade", ["wind", "sword", "water"], "striker", "Surges across the field with crackling lightning-fast steps.", { patk: 0.16, matk: 0.14, spd: 0.12 }, ["Static Thrust", "Lightning Step"]),
  T("blood_rogue", "Sanguine Duelist", ["dark", "agility", "might"], "striker", "Draws bloody power from every opened vein on the foe.", { patk: 0.22, hp: 0.08, crit: 0.08 }, ["Blood Siphon", "Rend Flesh"]),
  T("wind_corsair", "Sky Corsair", ["wind", "fortune", "hunting"], "striker", "Swashbuckler who relies on daring acrobatic stunts and luck.", { patk: 0.15, crit: 0.12, spd: 0.12 }, ["Acrobatic Flourish", "Lucky Riposte"]),
  T("soul_reaper_rogue", "Ghostblade Stalker", ["dark", "sword", "water"], "striker", "Daggers bypass solid physical mail to cut spiritual essence.", { patk: 0.18, crit: 0.15, dodge: 0.1 }, ["Spirit Pierce", "Ethereal Step"]),
  T("bounty_hunter", "Bounty Hunter", ["hunting", "agility", "fortune"], "striker", "Tracks targets across infinite floors and never lets prey go.", { patk: 0.17, spd: 0.12, acc: 0.1 }, ["Target Quarry", "Shackling Strike"]),
  T("monastic_templar", "Monk Ascetic", ["agility", "might", "earth"], "hybrid", "Channels holy light through bare palms and swift roundhouses.", { patk: 0.16, mdef: 0.16, spd: 0.12 }, ["Ki Palm", "Iron Body"]),
  T("life_weaver", "Worldroot Mender", ["nature", "water", "earth"], "caster", "Pours sap and spring water into mortal wounds for rapid rebirth.", { hp: 0.18, mdef: 0.18, mp: 0.2 }, ["Worldroot Bloom", "Soothing Sap"]),
  T("fortune_gambler", "High Stakes Gambler", ["fortune", "agility", "might"], "striker", "Wagers life and limb for astronomically high critical bursts.", { crit: 0.22, critDmg: 0.4, dodge: 0.12 }, ["Loaded Dice", "Double Down"]),
  T("astrologer", "Star Astrologer", ["arcane", "light", "wind"], "caster", "Charts zodiac alignments to summon falling meteors.", { matk: 0.24, crit: 0.1, mp: 0.15 }, ["Starfall", "Zodiac Blessing"]),
  T("shadow_merchant", "Black Market Smuggler", ["fortune", "dark", "crafting"], "striker", "Trades illicit goods and strikes with concealed poison needles.", { crit: 0.14, dodge: 0.12, spd: 0.1 }, ["Poison Needle", "Quick Escape"]),
  T("siege_engineer", "Siege Engineer", ["crafting", "earth", "shield"], "tank", "Erects barricades and operates heavy ballistas in narrow halls.", { hp: 0.18, pdef: 0.24 }, ["Field Barricade", "Siege Bolt"]),
  T("champions_paragon", "Paragon Sovereign", ["sword", "light", "agility"], "hybrid", "Supreme hero revered throughout the realm for peerless valor.", { hp: 0.2, patk: 0.18, pdef: 0.15, mdef: 0.15 }, ["Aura of Glory", "Champion Cleave"]),
  T("phantom_assassin", "Phantom Assassin", ["agility", "shield", "hunting"], "striker", "Parries with an off-hand blade, slips away and finishes foes from range.", { patk: 0.18, crit: 0.12, dodge: 0.12 }, ["Off-hand Parry", "Vanishing Shot"]),
  T("druid", "Druid", ["transformation", "nature", "might"], "hybrid", "Takes the shape of bear and wolf, drawing strength from the wild.", { hp: 0.18, patk: 0.16, pdef: 0.1 }, ["Wild Shape", "Primal Strength"]),
  T("archdruid", "Archdruid", ["transformation", "summoning", "nature"], "caster", "Commands every living form of the wilds, from root to beast.", { matk: 0.2, hp: 0.18, mp: 0.15 }, ["Grove Call", "Thousand Forms"]),
  T("moon_shapeshifter", "Moon Shapeshifter", ["transformation", "hunting", "agility"], "striker", "Slips between hunter and beast under the moonlight.", { patk: 0.18, spd: 0.12, dodge: 0.1 }, ["Lunar Pounce", "Feral Senses"]),
  T("primal_beastlord", "Primal Beastlord", ["transformation", "might", "hunting"], "striker", "A towering beast-form that tears through any prey.", { patk: 0.24, hp: 0.14 }, ["Rending Claws", "Apex Roar"]),
  T("skinchanger", "Skinchanger", ["transformation", "dark", "agility"], "striker", "Wears stolen shapes and strikes from the shadows.", { patk: 0.16, dodge: 0.14, crit: 0.08 }, ["Stolen Face", "Shadow Hide"]),
  T("wildshape_warden", "Wildshape Warden", ["transformation", "nature", "shield"], "tank", "Hardens into bark and turtle-shell to guard the grove.", { hp: 0.22, pdef: 0.22 }, ["Shell Form", "Barkhide"]),
  T("chimera_knight", "Chimera Knight", ["transformation", "sword", "fire"], "striker", "Fuses blade and fang with fire-breathing fury.", { patk: 0.2, matk: 0.1, crit: 0.06 }, ["Chimera Bite", "Flame Mane"]),
  T("blood_beast", "Blood Beast", ["transformation", "blood", "dark"], "striker", "A blood-mad horror that grows stronger with every wound.", { patk: 0.22, hp: 0.16 }, ["Frenzied Feast", "Crimson Hide"]),
  T("necromancer", "Necromancer", ["necromancy", "dark", "arcane"], "caster", "Raises the fallen to serve and drains life from the living.", { matk: 0.26, mp: 0.2 }, ["Raise Dead", "Grave Chill"]),
  T("death_knight", "Death Knight", ["necromancy", "might", "shield"], "tank", "An armored champion of undeath who cannot be put down.", { hp: 0.2, pdef: 0.2, patk: 0.1 }, ["Unholy Armor", "Death Grip"]),
  T("dread_reaper", "Dread Reaper", ["necromancy", "sword", "dark"], "striker", "Harvests souls with a cold, cleaving blade.", { patk: 0.2, crit: 0.1, matk: 0.08 }, ["Soul Harvest", "Reaper's Arc"]),
  T("legion_master", "Legion Master", ["necromancy", "summoning", "arcane"], "caster", "Calls an endless legion of bone and spirit.", { matk: 0.24, mp: 0.22 }, ["Bone Legion", "Spirit Tether"]),
  T("lord_of_rot", "Lord of Rot", ["necromancy", "plague", "dark"], "caster", "Rules over decay; the dead rise and the living wither.", { matk: 0.26, mdef: 0.14 }, ["Rotting Host", "Withering Aura"]),
  T("celestial_summoner", "Celestial Summoner", ["summoning", "arcane", "light"], "caster", "Calls radiant spirits and guardian angels to battle.", { matk: 0.22, mdef: 0.16, mp: 0.15 }, ["Angelic Ally", "Halo Ward"]),
  T("beastcaller", "Beastcaller", ["summoning", "nature", "hunting"], "specialist", "Whistles up wolves, hawks and bears from the wild.", { patk: 0.14, matk: 0.14, acc: 0.1 }, ["Pack Summons", "Hunter's Bond"]),
  T("demonologist", "Demonologist", ["summoning", "fire", "dark"], "caster", "Binds imps and hellspawn with burning pacts.", { matk: 0.26, crit: 0.08 }, ["Infernal Pact", "Imp Swarm"]),
  T("golemancer", "Golemancer", ["summoning", "earth", "crafting"], "specialist", "Builds and animates stone guardians from raw ore.", { pdef: 0.2, matk: 0.14, hp: 0.12 }, ["Stone Servant", "Rune Core"]),
  T("seraph_caller", "Seraph Caller", ["summoning", "soul", "light"], "caster", "Binds the souls of the holy as shining guardians.", { matk: 0.22, mdef: 0.2, hp: 0.1 }, ["Seraphic Choir", "Soul Light"]),
  T("soulbinder", "Soulbinder", ["soul", "dark", "arcane"], "caster", "Chains enemy souls and feeds on their essence.", { matk: 0.26, mp: 0.18 }, ["Soul Chain", "Essence Feast"]),
  T("spirit_warden", "Spirit Warden", ["soul", "light", "shield"], "tank", "Anchors its soul as an unbreakable shield for the living.", { hp: 0.2, mdef: 0.22, pdef: 0.12 }, ["Soul Bulwark", "Guiding Light"]),
  T("spectral_blade", "Spectral Blade", ["soul", "sword", "agility"], "striker", "A blade half in this world, cutting body and spirit.", { patk: 0.2, crit: 0.1, dodge: 0.08 }, ["Phase Cut", "Ghost Step"]),
  T("fate_weaver", "Fate Weaver", ["soul", "fortune", "arcane"], "specialist", "Reads the threads of fate and plucks the lucky ones.", { matk: 0.18, crit: 0.12, luck: 0.2 }, ["Thread of Fate", "Lucky Omen"]),
  T("blood_knight", "Blood Knight", ["blood", "dark", "might"], "striker", "Fuels crushing blows with its own boiling blood.", { patk: 0.24, hp: 0.12 }, ["Blood Rage", "Crimson Cleave"]),
  T("hemoblade", "Hemoblade", ["blood", "sword", "agility"], "striker", "Every cut opens a vein; every vein feeds the blade.", { patk: 0.2, crit: 0.12, spd: 0.08 }, ["Vein Slash", "Thirsting Edge"]),
  T("blood_witch", "Blood Witch", ["blood", "arcane", "nature"], "caster", "Brews curses from blood and root.", { matk: 0.24, hp: 0.12 }, ["Blood Hex", "Rootbound Curse"]),
  T("crimson_butcher", "Crimson Butcher", ["blood", "culinary", "hunting"], "striker", "Carves monsters with a cleaver and cooks what remains.", { patk: 0.2, hp: 0.14, sta: 0.1 }, ["Cleaver Rend", "Hunter's Feast"]),
  T("blight_druid", "Blight Druid", ["plague", "dark", "nature"], "caster", "Turns the wilds into a festering, poisonous mire.", { matk: 0.24, hp: 0.1 }, ["Blight Bloom", "Rot Roots"]),
  T("beaked_doctor", "Plague Doctor", ["plague", "crafting", "arcane"], "specialist", "Studies disease behind a beaked mask and weaponizes it.", { matk: 0.2, mdef: 0.16 }, ["Miasma Flask", "Beaked Mask"]),
  T("venom_stalker", "Venom Stalker", ["plague", "hunting", "agility"], "striker", "Hunts with poisoned darts and vanishes into the reeds.", { patk: 0.18, crit: 0.1, dodge: 0.1 }, ["Venom Dart", "Reed Hide"]),
  T("lightning_duelist", "Lightning Duelist", ["storm", "sword", "agility"], "striker", "Strikes like a lightning bolt: once, and decisively.", { patk: 0.2, spd: 0.14, crit: 0.08 }, ["Thunder Lunge", "Static Step"]),
  T("storm_archon", "Storm Archon", ["storm", "arcane", "wind"], "caster", "Commands thunderheads and chains of lightning.", { matk: 0.28, spd: 0.08 }, ["Chain Storm", "Eye of the Tempest"]),
  T("thunder_guard", "Thunder Guard", ["storm", "might", "shield"], "tank", "A storm-charged shield that shocks every attacker.", { pdef: 0.2, hp: 0.16, patk: 0.1 }, ["Static Bulwark", "Thunderclap Bash"]),
  T("skystrike_ranger", "Skystrike Ranger", ["storm", "hunting", "wind"], "striker", "Arrows that fall like lightning from a clear sky.", { patk: 0.18, acc: 0.14, crit: 0.08 }, ["Lightning Arrow", "Gale Draw"]),
  T("volcanic_titan", "Volcanic Titan", ["magma", "might", "earth"], "tank", "Molten muscle wrapped in a crust of cooling stone.", { hp: 0.24, patk: 0.16, pdef: 0.14 }, ["Lava Fists", "Magma Crust"]),
  T("magma_forgemaster", "Magma Forgemaster", ["magma", "crafting", "fire"], "specialist", "Forges weapons straight from the volcano's heart.", { patk: 0.16, matk: 0.16, pdef: 0.1 }, ["Volcanic Anvil", "Molten Edge"]),
  T("obsidian_knight", "Obsidian Knight", ["magma", "sword", "shield"], "tank", "Clad in volcanic glass that shatters blades.", { pdef: 0.22, patk: 0.14, hp: 0.12 }, ["Obsidian Plate", "Glass Riposte"]),
  T("cataclysm_mage", "Cataclysm Mage", ["magma", "arcane", "fire"], "caster", "Calls down eruptions and rivers of fire.", { matk: 0.3, crit: 0.06 }, ["Eruption", "Firestorm"]),
  T("primordial_archmage", "Primordial Archmage", ["storm", "magma", "arcane"], "caster", "Masters the raw forces that shaped the world.", { matk: 0.3, mp: 0.2 }, ["World Shaper", "Primal Surge"]),
  T("herbal_brewmaster", "Herbal Brewmaster", ["culinary", "nature", "water"], "specialist", "Brews teas and tonics that mend any wound.", { hp: 0.18, mp: 0.15, sta: 0.15 }, ["Healing Brew", "Steeped Calm"]),
  T("tavern_keeper", "Tavern Keeper", ["culinary", "fortune", "crafting"], "specialist", "Runs the best tavern in the realm and wins every bar brawl.", { hp: 0.16, luck: 0.2, sta: 0.15 }, ["Bar Brawl", "House Special"]),
];
export const TRIAD: Record<string, PlaystyleClass> = Object.fromEntries(TRIAD_CLASSES.map((c) => [c.id, c]));
const BY_KEY: Record<string, PlaystyleClass> = Object.fromEntries(TRIAD_CLASSES.map((c) => [[...c.triad].sort().join("+"), c]));
/** The curated class for three aspects in any order, if one exists. */
export const findTriad = (a: string, b: string, c: string): PlaystyleClass | undefined => BY_KEY[[a, b, c].sort().join("+")];
export const triadName = (c: PlaystyleClass, tier: number) => [TRIAD_PREFIX[tier], c.name].filter(Boolean).join(" ");

/** Pick the playstyle class from aspect scores: the top three aspects, if strong enough and curated. */
export function resolveTriad(score: Record<string, number>): PlaystyleClass | undefined {
  const top = Object.entries(score).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (top.length < 3) return undefined;
  const third = top[2]![1];
  if (third < TRIAD_MIN || third < top[0]![1] * TRIAD_SHARE) return undefined;
  return findTriad(top[0]![0], top[1]![0], top[2]![0]);
}
