# LuckyDex v0.46.0 Verification Report

## Scope
Adds Endurance Expedition, the HP-stat event in the Pokémon Challenge Course / Goldenrod framework.

## Gameplay implemented
- Five-zone auto-advancing obstacle expedition: Forest Trail, River Rapids, Canyon Pass, Dark Cave, Frozen Summit.
- Player steers laterally and times jumps. Skilled avoidance costs zero endurance.
- Base HP is directly readable as the survival stat: endurance capacity = 20 + base HP (clamped to the canonical 1–255 base-HP range).
- Examples: base HP 40 -> 60 endurance; 150 -> 170; 255 -> 275.
- Same hazard deals the same absolute damage regardless of Pokémon, so HP changes mistake budget rather than secretly reducing damage.
- Each zone has three theme-specific obstacle families, for 15 distinct hazard identities across the course.
- Difficulty schedules use irregular gaps and occasional bursts rather than a fixed beat.
- Easy/Normal/Hard Exhibition profiles and Rookie/Poké/Great/Ultra/Master Goldenrod profiles are supported.
- Pause/resume preserves countdown, stage timing and jump windows rather than restarting the current zone.

## Rare event and progression
- Golden Trail Cache is a 2% default rare event, placed in a later zone and collected by steering onto it.
- Settings exposes Off / Vanilla 2% / Test 25% / Always 100% controls for the cache.
- Endurance Expedition has permanent Arcade records and Goldenrod cup participation.
- Added Endurance Master plus Trailblazer, Long-Haul Regular, Against the Elements, Untiring, Heart Over Health and hidden Trail Treasure achievements.
- Existing Goldenrod Grand Champion requirement remains unchanged for backwards compatibility with previously earned progress.

## Fresh verification
- Endurance Expedition + current Goldenrod/Challenge Course non-browser behaviour regression group: 151/151 pass.
- Endurance-specific suite: 5/5 pass.
- v0.46.0 release identity: 1/1 pass.
- Achievement regression group: 19/19 pass.
- Offline asset/integrity group: 27/27 pass, including existing Arcade course assets, Adventure authenticity checks, Fossil dig audit, cosmetics checks and the complete sleeve asset validator.
- `node --check` passes for the Endurance core/runtime and touched Goldenrod/world/app scripts.
- Android application ID remains `com.example.luckydex`; versionName `0.46.0`, versionCode `4600`.

## Existing environment limitation
- Target Range Playwright/browser fixtures are not runnable in this extracted source environment because Playwright/node_modules are not bundled. Browser-only historical tests are therefore not included in the non-browser regression count.
- Frozen historical release-identity tests that intentionally assert old versions are excluded from current-release behaviour verification.

## Scope preservation
This release is based directly on v0.45.5. Existing image/sprite/sleeve assets are unchanged; the new course reuses bundled local Gen III environment art. No Codex was used.
