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
- Village gathering spots are data-driven in src/game/gathering.ts (spot level gates materials); merged buildings reuse existing panels via a shared tab strip in Game.tsx GROUPS.
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
