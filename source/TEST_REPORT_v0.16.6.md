# Lucky Dex v0.16.6 validation report

## Scope
v0.16.6 is a self-contained Arcade content expansion on top of the tested v0.16.5 deterministic card-art build.

## Added
- Fossil Excavation
  - Oreburgh Mining Museum theme.
  - 6×7 dig board with proximity shimmer.
  - Chisel and hammer tool economy.
  - 11 canonical fossil/restoration targets from Omanyte through Amaura.
  - Hidden mineral finds, completion payout, persistent fossils-restored count and best payout.
- Ditto Shuffle
  - Pokémon Mansion research-lab theme.
  - 3→5 animated research capsules.
  - Real positional swaps with increasing speed/round count.
  - Risk/reward bank and cash-out loop.
  - Persistent best round.
- Who's That Pokémon?
  - Indigo League quiz-show presentation.
  - 10-question runs.
  - Easy / Normal / Hard modes.
  - Timed silhouette recognition, generation hints, mirrored Hard silhouettes, streak/time scoring.
  - Persistent best score and perfect-run achievement.
- Voltorb Flip visual refresh
  - Goldenrod Game Corner presentation.
  - Poké Ball-style unrevealed tiles, richer clue cards and board treatment.
  - Core Voltorb Flip mechanics intentionally unchanged.

## Progression / rewards
- New persistent arcade fields migrate into existing saves without resetting prior progress.
- Three new achievements:
  - Underground Archaeologist — restore 5 fossils.
  - No Fooling Me — reach Ditto Shuffle round 6.
  - Pokédex Savant — perfect 10/10 quiz.
- New games feed the existing Lucky Coin / trainer XP / daily Arcade Coin systems.

## Compatibility
- Existing v0.16.5 deterministic card-art files are retained.
- No battle code was modified.
- No existing Clefairy Match or Berry Blender mechanics were changed.
- Existing Voltorb mechanics are preserved; only presentation/help text changed.

## Static validation
- All JavaScript files pass `node --check`.
- All `getElementById()` references in the v0.16.6 arcade module resolve to actual HTML elements.
- No duplicate HTML IDs were introduced.
- All local script/stylesheet references exist.
- HTML now loads `app-v0166.js` and `arcade-expansion-v0166.js`.
- Android metadata is `versionCode 166` / `versionName 0.16.6`.
- ZIP integrity is checked after packaging.

## Environment limitation
A Chromium phone-size screenshot pass was attempted, but the container's Chromium process failed to terminate cleanly under headless mode. This was not treated as a successful visual test. The final APK build remains the meaningful Android/WebView validation and should run through the existing GitHub Actions APK workflow.
