# Game expansion architecture

- Prison reserve companions remain whole Companion objects outside the active party; engine helpers move them without cloning so held gear and skills cannot duplicate.
- Journal instructions, tutorial missions, mass-action pacing and monster habits are browser-safe data modules; the engine applies rules while panels only present them.
- Manual class selection stores a discovered class ID, but race ladders take priority; the Codex resolves saved names for compatibility.
- Town family themes reuse existing artwork with scoped palette and architectural treatments, preserving map coordinates and gameplay across race changes.
- Village filtering belongs on separate ground layers and building artwork, never character tiles; building anchors sit above ground and hero/Elder anchors sit above buildings.
- Town decorations and building adornments use stable coordinate seeds, so camera movement never reshuffles decorations or changes gameplay.
- ElderSprite shares dedicated NPC artwork between the map and mission portrait; it must not change human player avatars.
