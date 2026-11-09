# Village Rework and New Systems

This is too big to build safely in one go, so it is split into 4 phases. Each phase leaves the game playable. After you approve, I'll build Phase 1 and then continue phase by phase.

## Phase 1: New village layout and merged buildings
- New town map built around these buildings: **Home** (rest, plus storage from the old Warehouse), **Market** (Shop and Market merged, buy/sell/prices), **Forge** (Sawmill, Smelter, Carpentry and Forge merged into tabs), **Church**, **Magic Tower**, **Craftery**, **Adventurers Guild** (replaces the Tavern), **Casino**, **Dungeon Tower**.
- Each new building gets its own pixel-art look and a keeper who serves you inside.
- Save moves from Home to Settings.
- Gathering spots on the map: **Forest, Field, Mine, Animal Farm, Pond**. Tapping one opens a window where your hero is shown working (chopping, mining, fishing...). You pick the material and tap "Gather" over and over.
- Each spot can be upgraded with gold and materials. Higher levels unlock better materials (Mine: L1 stone, L3 copper, L5 iron, L10 silver...) and make the spot look richer on the map.
- Old saves keep their items; Warehouse contents move into Home.

## Phase 2: Church and Craftery
- **Church**: cure ailments, full heal (costs gold), pray for a random blessing that lasts one floor, and add an element to a weapon or shield for extra damage.
- **Craftery**: craft single-use items such as traps, throwing weapons, bombs, arrows, bolts and bullets.
- Bows, crossbows and guns become off-hand gear that use up ammo in battle.
- **Long-press on the dungeon map** opens a menu to place a trap. Monsters that walk onto it take damage or get a status effect.

## Phase 3: Magic Tower and new races
- Schools of magic: Fire, Water, Wind, Earth, Light, Dark, Herbal, Summoning, Soul, Transformation, plus hidden ones you discover by combining two schools (for example Blood = Herbal + Water, Necromancy = Summoning + Dark).
- Spells unlock once you hit stat requirements (for example Fireball needs 100 INT). Training raises a school's level for gold.
- Race changes in the middle of the game, each with fixed conditions:
  - **Vampire**: knows Blood magic, has drained blood from 200 monsters, has healed 10,000 HP through life steal.
  - **Ghost**: knows Soul Binding and has died exactly once since learning it.
  - **Werewolf**: knows Transformation and has been bitten by wolf-type monsters 100 times.
  - **Lich, Zombie, Ghoul**: conditions based on each race's lore (I'll suggest them and you can change them).
- The Profile shows your progress toward each race.

## Phase 4: Adventurers Guild and companions
- Mission board (moved from the Tavern).
- Guild buyer who pays more for monster parts.
- Skill training: pay gold for a chance to make a skill stronger.
- Trainers for each specialization who teach extra passive and active skills.
- Companions, hired or bought:
  - A hired companion joins you for one floor at a fixed price.
  - Bought companions are yours to keep, up to 4. They can be humans, or monsters you capture in the dungeon (needs a capture item from the Craftery).
  - Companions fight with you in battle.
  - When you own companions, buttons for them appear at the bottom next to your hero. Each opens that companion's Stats, Equipment and Title tabs.

## Technical notes
- Save format gets a version bump, and old saves are converted automatically. No database changes are needed because saves are stored as JSON.
- New data modules: `magic.ts`, `races-ext.ts`, `companions.ts`, `gathering.ts`, `craftery.ts`. Small tests cover the rules: the gathering level gates, the race unlock conditions, ammo use and the companion limit.
