# LuckyDex v0.29.0 Test Report

## Scope
Adds **Pokémon Dash** as a new full Arcade venue/minigame built around the player's caught Pokémon.

## Pokémon Dash
- Dedicated Pokémon Dash Race Course venue in the continuous Arcade world.
- Racer picker uses only Pokémon actually present in `state.pokemon`, including shiny identity, level and local sprite.
- Species base Speed is read from the bundled 1–1025 Adventure species dataset and compressed to a roughly 15–20% raw pace spread so player input remains decisive.
- Six-racer side-scrolling race: one player + five AI racers.
- Three lanes with interpolated lane changes, hold-to-sprint stamina, recovery delay, rocks, mud, speed pads and stamina pickups.
- Deterministic seeded course generation with later-race density increase and no full-width unavoidable hazard wall.
- AI racers use the same stamina/effect model with reaction delay, hazard avoidance, boost seeking and mistakes.
- Canvas race presentation includes scrolling track, parallax scenery, local Pokémon sprites, shadows, visible overtakes, finish line and live HUD.
- Android background/recent-app transitions pause simulation; resume resets frame timing so hidden time is never simulated.
- Completion/reward path is guarded exactly once. Abandoned races pay nothing.
- Persistent Dash stats: last racer, races, wins, podiums and best time.
- Placement rewards: **120 / 80 / 55 / 35 / 25 / 20 Lucky Coins** for 1st–6th.

## Release identity
- Android package: `com.example.luckydex`
- `versionCode 291`
- `versionName 0.29.0`
- package/package-lock: `0.29.0`
- permanent bundled `luckydex-dev.keystore` signing configuration preserved
- visible UI and runtime build markers updated to `v0.29.0` / `0.29.0`

## Verification completed
Fresh PASS runs:
- `node --check` for Dash course/runtime plus Arcade platform/world/session integration files
- `tests/arcade-ball-drop.test.cjs`
- `tests/arcade-classics.test.cjs`
- `tests/arcade-dash-course.test.cjs`
- `tests/arcade-dash-integration.test.cjs`
- `tests/arcade-dash.test.cjs`
- `tests/arcade-platform.test.cjs`
- `tests/arcade-session.test.cjs`
- `tests/v024-compat.test.cjs`
- `tests/v0241-compat.test.cjs`
- `tests/v0258-update-identity.test.cjs`
- `tests/v0263-release.test.cjs`
- offline Arcade authentic-scene/sprite/actor checksum audit
- v0.22.3 venue audit
- Adventure asset audit: 829 images / 1,025 species
- Fossil Museum audit: 42 images

## Full-suite/environment notes
`npm test` cannot complete in this extracted workspace because Playwright is declared but not installed. An `npm ci --ignore-scripts` attempt could not complete in the container, so Playwright-dependent browser programs remain unavailable here. This is the same class of limitation documented in v0.28.10.

A broader source-only sweep also reaches a pre-existing historical Unown assertion: `v0287-keyboard-overlay.test.cjs` expects `height:min(52vh,520px)`, while the supplied **v0.28.10 base ZIP itself** contains `height:min(45vh,420px)`. Pokémon Dash does not modify that Unown CSS. Historical exact-version `v*-release.test.cjs` files also intentionally pin older release numbers and are not valid as an aggregate future-release gate.

## Android build note
This source snapshot contains no Gradle wrapper, and the container has no system `gradle` executable, so a local APK build could not be run here. The existing GitHub/Termux build configuration, application ID and permanent signer files are preserved.

## Packaging
Prepared source archive: `LuckyDex_source_v0.29.0.zip`. Generated dependency/build caches (`node_modules`, `.superpowers`, `.git`, Gradle/build output and old artifact output) are excluded.
