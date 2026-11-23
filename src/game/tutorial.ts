// Elder Rowan, the village guide: building tips, starter strategies and a mission chain — pure data.
// engine.tutorMission/claimTutor read these; statValue resolves each mission's counter.

export interface TutorMission { id: string; text: string; how: string; stat: string; need: number; gold: number }
/** Missions in order: each one teaches a mechanic and points toward the 1000th floor. */
export const TUTOR_MISSIONS: TutorMission[] = [
  { id: "wood", text: "Chop 5 logs", how: "Tap a tree in the village or the Forest.", stat: "treesCut", need: 5, gold: 40 },
  { id: "ore", text: "Mine 5 ores", how: "Tap the rocks or open the Mine.", stat: "oresMined", need: 5, gold: 40 },
  { id: "craft", text: "Forge your first gear", how: "Open the Forge › Smithy, drop in materials and craft.", stat: "crafted", need: 1, gold: 60 },
  { id: "equip", text: "Wear 3 pieces of gear", how: "Profile › Equipment, or tap gear in your Bag.", stat: "equipped", need: 3, gold: 60 },
  { id: "cook", text: "Cook a meal", how: "Home › Kitchen: combine food materials.", stat: "foodCooked", need: 1, gold: 50 },
  { id: "floor1", text: "Clear Tower floor 1", how: "Enter the Tower and take the stairs up.", stat: "maxFloor", need: 1, gold: 80 },
  { id: "plant", text: "Plant 5 seeds", how: "Tap the crop field and sow seeds from the Shop.", stat: "seedsPlanted", need: 5, gold: 60 },
  { id: "smelt", text: "Smelt 5 ingots", how: "Forge › Smelter turns ore into ingots for better gear.", stat: "ingotsSmelted", need: 5, gold: 80 },
  { id: "spot", text: "Upgrade a gathering spot", how: "Open the Forest, Mine, Pond or Animal Farm and upgrade it.", stat: "spotLevels", need: 1, gold: 120 },
  { id: "floor5", text: "Reach floor 5", how: "Climb the Tower. Retreat to keep your loot.", stat: "maxFloor", need: 5, gold: 150 },
  { id: "enhance", text: "Enhance gear 3 times", how: "Forge › Smithy › Enhance makes gear stronger.", stat: "upgrades", need: 3, gold: 150 },
  { id: "pray", text: "Pray at the Church", how: "Pray once after each trip for a free blessing.", stat: "prayers", need: 1, gold: 100 },
  { id: "guardian", text: "Defeat your first Guardian", how: "Every 10th floor has a Guardian. Defend when it winds up!", stat: "bosses", need: 1, gold: 300 },
  { id: "bldg", text: "Upgrade a village building", how: "Open any building and use the upgrade button at the top.", stat: "bldgLevels", need: 1, gold: 250 },
  { id: "capture", text: "Capture a monster", how: "In battle, weaken a monster below 30% HP and use Capture.", stat: "captures", need: 1, gold: 300 },
  { id: "brew", text: "Brew 3 potions", how: "Craftery › Alchemy brews elixirs, oils and tonics.", stat: "potionsBrewed", need: 3, gold: 300 },
  { id: "train", text: "Train an affinity", how: "The Training Ground drills affinities and skills for gold.", stat: "affTrained", need: 1, gold: 400 },
  { id: "floor25", text: "Reach floor 25", how: "Bring food, potions and a companion or two.", stat: "maxFloor", need: 25, gold: 800 },
  { id: "arena", text: "Fight in the Arena", how: "After floor 10, the Arena pits you against bosses for rare prizes.", stat: "arenaRuns", need: 1, gold: 800 },
  { id: "spots5", text: "Raise gathering spots 10 levels in total", how: "Higher spots unlock a new material tier every 10 levels.", stat: "spotLevels", need: 10, gold: 1500 },
  { id: "floor50", text: "Reach floor 50", how: "Craft with higher-tier materials for better grades.", stat: "maxFloor", need: 50, gold: 2500 },
  { id: "kills500", text: "Defeat 500 monsters", how: "Every fight trains the skills you use.", stat: "kills", need: 500, gold: 3000 },
  { id: "floor100", text: "Defeat the floor 100 Arch-Warden", how: "Arch-Wardens guard every 100th floor.", stat: "maxFloor", need: 100, gold: 8000 },
  { id: "bldg20", text: "Raise buildings 20 levels in total", how: "Better buildings mean better prices, rest, storage and prisons.", stat: "bldgLevels", need: 20, gold: 15000 },
  { id: "floor250", text: "Reach floor 250", how: "Ascend a race or master a class path for big bonuses.", stat: "maxFloor", need: 250, gold: 40000 },
  { id: "floor500", text: "Reach floor 500", how: "Halfway to the top. Relic and EX gear will carry you.", stat: "maxFloor", need: 500, gold: 120000 },
  { id: "floor750", text: "Reach floor 750", how: "Only the strongest builds survive here.", stat: "maxFloor", need: 750, gold: 300000 },
  { id: "floor1000", text: "Conquer the 1000th floor", how: "Defeat the Eternal Warden at the very top.", stat: "maxFloor", need: 1000, gold: 1000000 },
];

/** What each building is for, as the Elder explains it. */
export const TUTOR_BUILDINGS: [string, string, string][] = [
  ["🏠", "Home", "Rest to recover, keep spare items in Storage and cook meals in the Kitchen."],
  ["⚖️", "Market", "Buy seeds and supplies, sell materials, and trade with other players in the Player Market."],
  ["⚒️", "Forge", "Craft gear from any materials. More kinds and more pieces make a higher grade. Also: sawmill, smelter and tannery."],
  ["⛪", "Church", "Cure ailments, buy blessings, pray for a free one after each trip, and enchant weapons."],
  ["🔮", "Magic Tower", "Learn magic schools and spells, and perform rituals that change your race."],
  ["🪤", "Craftery", "Traps, throwing items, ranged off-hands, torches and alchemy potions."],
  ["🛡️", "Adventurers Guild", "Missions for gold and tokens, a merchant who pays more for monster parts, and companions for hire."],
  ["⛓️", "Prison", "Keep extra companions and captured monsters in cells, drill their levels and raise their skills."],
  ["🏋️", "Training Ground", "Pay to drill an affinity or skill, and learn special techniques."],
  ["🏟️", "Arena", "Fight five bosses in a row for rare materials and equipment."],
  ["🎰", "Casino", "Games of chance. Wins give tokens for rare items."],
  ["🗼", "Tower", "1000 floors of monsters. Clear a floor by taking its stairs up; retreat to bring your loot home."],
  ["🌲", "Gathering spots", "Forest, Mine, Pond, Animal Farm and the crop field give materials for stamina. Upgrade them for new tiers."],
];

/** Starter strategy tips. */
export const TUTOR_TIPS: string[] = [
  "Gather a little of everything early: mixing many different materials raises gear grade more than piling up one kind.",
  "Smelt ores and carve logs before forging — refined materials have better stats.",
  "Your skills grow from what you do. Fight with a sword to master swords; walk to grow movement.",
  "Low-tier materials stop teaching you much once you're skilled. Upgrade gathering spots to reach the next tier.",
  "Retreat before you're out of food: dying in the Tower loses the loot in your bag.",
  "Guardians telegraph heavy blows — press Defend when you see the warning.",
  "Capture weakened monsters to build a party. Extras wait in the Prison.",
  "Pray at the Church after every trip — it's a free blessing.",
  "The Tower picker shows each floor's map, monsters and loot. Farm floors whose loot you need.",
  "Skipping floors is tempting, but you miss their experience and materials.",
];
