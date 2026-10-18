# LuckyDex v0.46.1 Verification Report

## Scope
Endurance Expedition visual/mobile polish based directly on v0.46.0.

## Changes
- Reworked all five Endurance Expedition environments to use the bundled extracted Pokémon Emerald Gen III metatiles already present in LuckyDex.
- Forest uses Emerald forest grass/path/tall-grass/tree art.
- River Rapids uses Emerald water, shallow-water and shoreline tiles.
- Canyon uses Emerald route-rock and desert-sand tiles.
- Dark Cave uses Emerald cave floor/wall/rock tiles.
- Frozen Summit uses Emerald ice floor/wall/rock/cracked-ice tiles.
- Obstacle presentation now reuses those extracted tiles wherever an appropriate Gen III source asset exists instead of relying primarily on CSS gradients/shapes.
- Removed the GO phase entirely. Start sequence is now 3 → 2 → 1 → immediate play, with a small top badge rather than a full-arena blocking overlay.
- Fixed mobile control cutoff: the game surface is vertically scrollable, mobile arena height uses the dynamic viewport, the play area reserves `safe-area-inset-bottom`, and the controls use a bottom-safe sticky layout.
- Gameplay rules, HP/endurance tuning, Golden Trail Cache, records, achievements and Goldenrod integration are unchanged.

## Fresh verification
- v0.46.0 Endurance + new v0.46.1 visual/mobile/release tests: 9/9 pass.
- Current Goldenrod/Challenge Course non-browser behaviour regression group: 179/179 pass.
- Achievement regression group: 19/19 pass.
- Asset/integrity checks: 22/22 current asset tests pass, including the Emerald Gen III source/provenance validator and complete sleeve validator.
- One historical Adventure preservation test remains red for `arcade/kids-club/SOURCES.md`; the identical failure reproduces byte-for-byte on the untouched v0.46.0 input ZIP, so it is inherited and unrelated to v0.46.1.
- Two Target Range browser fixtures remain unavailable because Playwright is not bundled in the extracted source environment.
- `node --check` passes for both touched Endurance JavaScript files.
- Android application ID remains `com.example.luckydex`; versionName `0.46.1`, versionCode `4601`.

## Scope preservation
Compared with the supplied v0.46.0 ZIP before adding this report: 9 existing files changed, 2 test files added, 0 files removed. No image assets were modified or replaced; this pass reuses the already-bundled, provenance-tracked extracted Emerald art.

No Codex was used.
