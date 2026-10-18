# LuckyDex v0.40.10 — Test / Handover Report

## Scope

v0.40.10 is the Kanto Adventure authenticity pass plus three cleanup items carried forward from v0.40.9 phone testing:

- replace fabricated Kanto journey vignettes with canonical FireRed/LeafGreen location maps for every authored Kanto stop;
- keep packaged local scenes as offline/error fallbacks;
- remove the remaining square/outline treatment from Gold Rock;
- retire the obsolete `Perfect Harden a Gold Rock` secret achievement, including stale saved claims and historical Arcade review rows;
- make shiny-Unown rewards eligible from any TCG/TCGP card whose displayed name begins with the shiny letter, with no shiny/rarity requirement.

## Adventure authenticity

Added `app/src/main/assets/adventure/adventure-kanto-canonical-v0410.js`.

The overlay covers all 39 authored Kanto journey places currently present in the regional journey: towns/cities, routes, Viridian Forest, Mt. Moon, Rock Tunnel, Pokémon Tower, Seafoam Islands, Pokémon Mansion, all authored Gyms, Victory Road and Indigo Plateau.

Canonical map sources are the FireRed/LeafGreen map captures hosted by Bulbagarden Archives and resolved through stable HTTPS `Special:Redirect/file/...` paths. The Kanto journey map likewise prefers the canonical `FRLG Kanto.png` region image.

Phone presentation is independent of the source image dimensions. Canonical scenes render in a stable 4:3 frame; tall/wide routes use `object-fit: cover` plus explicit focal positions rather than shrinking into long strips or being stretched. A separate packaged Red marker remains over the map instead of being baked into the source artwork.

Each canonical scene retains the pre-v0.40.10 packaged scene as `fallbackPath`. If a remote canonical image cannot load, `adventure-regional-ui.js` swaps to that local scene rather than leaving a blank panel.

### Device caveat

This environment cannot install/launch the browser stack required to verify Android WebView network redirects. Canonical image loading therefore still needs the normal phone check. Offline/error fallback behaviour is covered by Node contracts. No fabricated map was removed from the package; it remains available only as the fallback.

## Cleanup

- Gold Rock keeps its gold/shiny filter but no longer has the square outline/box treatment.
- `rock_harden_gold_perfect` / `Perfect Harden a Gold Rock` has been removed from the achievement catalogue.
- `retired-achievement-migrations-v0410.js` removes that retired ID from both saved `achievementClaims` and old Arcade `recent[*].achievements` review rows before app state is rendered, preventing the stale completion banner from resurfacing.
- Unown card selection remains initial-letter based across TCG + TCGP. Ordinary/Common cards are explicitly regression-tested as valid rewards.
- The Unown reward title says `UNOWN <LETTER> REWARD`; it does not imply that the awarded card itself is shiny.

## Release identity

- package version: `0.40.10`
- Android `versionCode`: `4010`
- Android `versionName`: `0.40.10`
- visible/app build markers: `v0.40.10`

## Focused verification

Command:

`node --test tests/v0410-adventure-authenticity.test.cjs tests/v0410-release.test.cjs tests/v0409-release.test.cjs tests/v0380-rock-harden-state-achievements.test.cjs`

Result: **15/15 passing, 0 failures**.

The v0.40.10-specific contracts cover:

- all 39 authored Kanto stops resolving to canonical FRLG entries;
- local fallback preservation;
- canonical overlay load order;
- error fallback wiring;
- stable 4:3 phone framing for very tall maps such as Route 23/Cycling Road;
- separate player-marker overlay;
- obsolete Gold Rock achievement removal and saved/history migration;
- Gold Rock style without square outline/background;
- ordinary initial-letter cards as valid Unown rewards;
- Unown reveal copy not implying a shiny card;
- v0.40.10 / versionCode 4010 alignment.

## Full non-browser regression

All **361** `tests/*.test.cjs` programs were executed/classified individually from the working source.

- runnable in this environment: **335**
- Playwright/browser-dependent and environment-blocked: **26**
- genuine failures: **0**

The 335 runnable programs were then executed together using Node's test runner.

Result:

- **534 tests/subtests**
- **534 PASS**
- **0 FAIL**
- **0 skipped/cancelled**

The 26 blocked programs are not counted as passes. They are the browser/device Adventure, Arcade and layout programs that require Playwright/browser tooling unavailable in this session.

## Asset / preservation verification

Fresh checks from the working source:

- Adventure local-scene pixel/build verifier (`tests/adventure_location_scene_pixels.py`): **2/2 PASS**
- protected baseline preservation: **5,946 protected files PASS**
- protected shared save/pack/Collection/Dust/trade/navigation declarations: **211 PASS**
- Pokémon Dash local assets/course assets/Gen III pinned source integrity: **PASS**
- Fossil Museum/mining asset contracts and complete dig audit: **PASS**
- Rock Harden local asset integrity: **PASS**
- changed/new JavaScript `node --check`: **PASS**

## Phone checks requested

1. Open Pallet Town, Route 1, Viridian City and Viridian Forest; confirm the actual FRLG maps appear.
2. Check one Gym and one extreme route such as Cycling Road or Route 23; confirm the frame stays a useful 4:3 window rather than becoming a tall strip.
3. Open the Kanto Map and confirm the canonical Kanto region map appears.
4. Confirm the Red/player marker is visible over the canonical scene.
5. Briefly test with connectivity disabled; the old packaged local scene should appear as fallback instead of a blank image.
6. Verify Gold Rock no longer has the square halo and the retired Gold Rock secret no longer appears in a review.
7. Force Shiny Unown in Settings; verify a matching ordinary card can be awarded as long as its displayed name begins with the shiny letter.
