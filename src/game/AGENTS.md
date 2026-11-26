# Game expansion architecture

- Prison reserve companions remain whole Companion objects outside the active party; engine helpers move them without cloning so held gear and skills cannot duplicate.
- Journal instructions, tutorial missions, mass-action pacing and monster habits are browser-safe data modules; the engine applies rules while panels only present them.
- Manual class selection stores a discovered class ID, but race ladders take priority; the Codex resolves saved names for compatibility.
- Town family themes reuse existing artwork with scoped palette and architectural treatments, preserving map coordinates and gameplay across race changes.
