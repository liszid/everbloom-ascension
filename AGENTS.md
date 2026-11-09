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
- Village gathering spots are data-driven in src/game/gathering.ts (spot level gates materials); merged buildings reuse existing panels via a shared tab strip in Game.tsx GROUPS.
- Church services and Craftery item definitions live as pure data in src/game/items.ts; engine.ts applies them so UI and rules stay separate.
- Magic schools, spells and ascended races are pure data in src/game/magic.ts; progress counters live in GameState.stats.
