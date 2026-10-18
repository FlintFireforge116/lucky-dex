# LuckyDex v0.30.0 — Pokémon Dash v2 Verification

## Release identity
- `applicationId`: `com.example.luckydex` (unchanged)
- `versionCode`: `300`
- `versionName`: `0.30.0`
- package / package-lock versions: `0.30.0`
- permanent LuckyDex signer configuration remains unchanged.

## Pokémon Dash v2 contract
- Replaces the horizontal race presentation with a portrait, top-down, vertically scrolling course while retaining the v0.29 race distance, compressed Speed advantage, stamina/sprint model, boosts, slowdowns, obstacle density and hidden three-line collision model.
- Player and opponent racers render at a responsive 96–112 px with pixel smoothing disabled.
- Quick Race supports Easy / Normal / Hard / Expert opponent Speed bands and difficulty-scaled rewards.
- Type Leagues cover all 18 Pokémon types; dual types qualify for both relevant leagues.
- Every league is a deterministic three-race cup using the same five AI entrants across all three races, with 10/6/4/3/2/1 points and total race time as the tie-break.
- League rewards are paid only after race 3 and are 3× the matching Quick Race placement reward.
- Gold / Silver / Bronze trophies persist independently by type and difficulty and never downgrade.
- Quick and League racer memories are stored separately; migration remains additive for existing saves.
- League themes reskin the reusable course/effect system without changing collision geometry.
- Android visibility/page-hide pauses preserve the active race/cup and reset the frame clock on resume; abandoned races cannot award coins.

## Fresh verification
- JavaScript syntax checks passed for Dash config, League, course, engine, and Arcade platform modules.
- Full Dash v2 targeted suite passed, including save migration/type metadata, difficulty/reward policy, 18 themes, cup scoring/tie-breaks, themed deterministic courses, difficulty/type AI selection, top-down coordinate contracts, UI/mode flow, renderer contract, League/Quick persistence, exactly-once rewards, and source integration.
- `v0300-release.test.cjs` passed.
- Historical update-identity contracts were made forward-compatible and pass at v0.30.0 while retaining their original version floors, package identity, and signer checks.
- God Pack production/polish contracts from v0.29.2 passed unchanged.
- Broad direct Node sweep: **139 passed / 17 non-passing out of 156 test programs**.
- 14 of the 17 non-passing programs require Playwright/recovery-browser support, which is not installed in this extracted workspace.
- The remaining 3 are inherited failures reproduced against the untouched v0.29.2 base: `v0223-ball-stalls.test.cjs`, stale historical `v0284-release.test.cjs`, and `v0287-keyboard-overlay.test.cjs`.

## Offline asset audits
- Arcade asset validation: PASS — 44 authentic scenes/sheets/crops, 2,098 offline sprites, and 2,078 unretouched actors validated.
- Arcade venue audit: PASS — all 8 local venue assets verified.
- Adventure asset audit: PASS — 829 images / 1,025 species / 386 back sprites / 37 registry objects, no errors.
- Fossil Museum audit: PASS — 42 images verified.

## Review
- Separate whole-change self-review completed against untouched v0.29.2 because this harness has no reviewer subagent.
- No Critical or Important finding remained.
- Deferred minor: the AI control fallback references `defaultAiProfile` if an AI racer somehow arrives without the profile assigned by `makeRacer()`. Normal race construction always assigns that profile, so the path is currently unreachable in standard gameplay.

## Environment caveat
- No Gradle wrapper or system Gradle is available in this extracted workspace, so an Android compile was not run here.
