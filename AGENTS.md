<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Game confirmations use the shared ConfirmationProvider rather than native browser dialogs to keep fullscreen intact.
- Building and monster artwork uses browser-safe procedural SVG modules with palette tokens in src/styles.css so gameplay and presentation remain separate.
- Mobile map width follows available horizontal space; short screens scroll vertically instead of compressing the map.
- The map renders one extra ring of tiles inside a sliding inner grid so camera and sprite moves animate between tiles (Web Animations in Game.tsx); gameplay stays tile-based.
- Village gathering spots are data-driven in src/game/gathering.ts (unlock level derives from material tier; when unlock levels move later, migrateSave records grandfathered materials in GameState.spotKeep so saves never lose access); refine stations (carve/smelt/tan) are a Material.refine field so new workshops need no engine changes; merged buildings reuse existing panels via a shared tab strip in Game.tsx GROUPS.
- Church services and Craftery item definitions live as pure data in src/game/items.ts; engine.ts applies them so UI and rules stay separate.
- Magic schools, spells and ascended races are pure data in src/game/magic.ts; progress counters live in GameState.stats.
- Guild companions, trainers and pricing are pure data in src/game/guild.ts; companion stats derive from shared player gear/titles via engine.compStats.
- Map item cartoon icons are looked up by id/emoji in src/game/art.ts; gameplay data keeps emoji ids so art stays presentation-only.
- Dungeon theme names/rotation are pure data in src/game/themes.ts; their floor/wall look (procedural textures spanning several tiles, wall trims, ambience) lives in src/game/dungeonStyle.ts so art never touches gameplay.
- The off-hand holds one of: a shield (gear slot id stays "shield" for save compatibility, shown as Off-hand) or a Craftery ranged weapon/torch in GameState.ranged; equipping one clears the others.
- Ascended-race class ladders (rank names, lore affinities, mastery sources and rank thresholds) are pure data in src/game/raceClasses.ts; engine.computeClass returns the race ladder instead of the skill/affinity/title class whenever the hero's race has a ladder.
- Shared game React contexts (SceneCtx, confirmations) are cached on globalThis so live code reloads never split a provider from its readers.
- The app's MCP server lives in src/lib/mcp (one tool per file, registered in index.ts) and verifies managed-auth OAuth tokens; tools read game_saves only through the caller-scoped client so RLS keeps each player to their own save, and stay read-only because the browser autosave would overwrite server-side edits.
- Browser-agent (WebMCP) tools for the on-screen hero are registered in src/game/AgentTools.tsx, separate from the MCP server.
- Sign-in return targets go through oauthReturnPath; social/email sign-in lands on the public /login page, which forwards to `next` once the session exists.
- Weapon archetypes (ideal material-role mixes, traits) are pure data in src/game/archetypes.ts and Kitchen recipes/meal buffs in src/game/recipes.ts; material roles derive from Material.src via data.matRole so new materials need no tagging.
- Craftery torches/ranged weapons stay stackable tool counts; their grade lives in GameState.toolGrades and engine.offhandStats derives stats from it, so no Gear objects or bag slots are needed.
- Companion gear objects live on Companion.held (out of GameState.gear) and go back to the bag on removal, dismissal or contract end; migrateSave moves old bag-referenced companion gear so nothing duplicates.
- Race-path counters snapshot into Combat.st0 at battle start and engine.pathGains diffs them for the result screen; ascension hints are data on ASCENSIONS reqs in magic.ts.
- Monster homes/categories and the extra D&D bestiary are pure data in src/game/bestiary.ts; engine.makeMonster only picks from the theme pool and keeps its own scaling. MonsterSprite resolves transparent 256×256 m_<id>.webp, _side (right-facing, mirrored for left), and _back artwork by exact monster ID, so presentation never changes spawning or stats.
- Alchemy potions are data in src/game/alchemy.ts, stored as GameState.potions counts; oils last battles and tonics last floors, so no Gear objects are needed.
- Playstyle (3-aspect) classes, specialization paths and build synergies are pure data in playstyleClasses.ts, specializations.ts and synergies.ts; engine.computeClass/playerStats apply them and ascended race ladders still take priority.
- New ascended races and ladders live in src/game/ascendedRaces.ts and are appended to ASC_RACES/ASCENSIONS/RACE_CLASSES; their active skills are data-driven (AscRace.act) so no combat switch edits are needed.
- Avatar artwork uses transparent 256×256 a_<race>_<m|f>.webp front assets plus optional _side (facing right, mirrored for left) and _back views resolved by race ID, so portraits and map sprites share race-specific art; race art keeps hands empty because HeldGear draws the equipped weapon.
- Equipped weapon visuals derive from src/game/weaponLook.ts (named top material → colour/family, tier → crude/fine/ornate/majestic style, gear id → shape seed) so gear data needs no art fields.
