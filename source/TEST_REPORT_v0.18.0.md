# LuckyDex v0.18.0 Test Report

**Date:** 2026-10-05
**Baseline:** LuckyDex v0.17.0 source export
**Release:** v0.18.0 (`versionCode 190`)
**Build marker:** `0.18.0-arcade-world-rework`

## Scope verified

- Continuous eight-stop Arcade world with local WebP landmark art.
- Dedicated World → Venue → Game hierarchy and owning-venue back navigation.
- Shared compact run/reward strip and exact-award result sheet.
- Berry Picker presentation rebuild with garden trees, in-scene customer requests and reactions.
- Head It finite/unlimited run rebuild with RAF-driven yarn motion and guarded completion.
- Tile Puzzle board rebuild with coherent image crops, tap/swipe movement, solvable 3×3/4×4/5×5 shuffles and completed-image reveal.
- Poké Ball Drop three-ball lifecycle, incremental actual coin feedback and separate 1000-coin jackpot.
- Shared result integration for Voltorb Flip, Berry Blender, Clefairy Match, Fossil Excavation, Unown Decoder and Who's That Pokémon? (including the active Super Hard/Endless quiz override).
- Ditto Transform removed from visible/launchable Arcade navigation while legacy save state remains intact.
- v0.17 platform economy/save behavior retained unless explicitly changed by the v0.18 specification.

## Automated verification

### Node Arcade regression

All `tests/arcade-*.test.js` files passed. Coverage includes the v0.17 scoring/economy regressions plus the new v0.18 session, world, Amie and Poké Ball Drop tests.

Notable v0.18 checks include:
- exact eight-venue / ten-game mapping and legacy-zone migration;
- completion guards preventing duplicate awards;
- exact Head It run configurations and speed floors;
- 600 seeded Tile Puzzle generation/inverse-replay checks for each supported grid-size loop used by the test suite, plus gesture/crop/result checks;
- Poké Ball Drop payout deltas and 1000-coin jackpot behavior.

### Python/static regression

`pytest -q` passed with **18 tests / 0 failures**.

Static checks include:
- v0.18 release metadata and build marker;
- script dependency order with world navigation loaded last;
- old zone/Ditto v0.17 modules not loaded;
- eight local venue assets present and non-empty;
- duplicate HTML ID check;
- stable-game result bridges use actual awarded values;
- Ditto launcher absent while save compatibility remains;
- stable signing-file SHA-256 unchanged.

### JavaScript syntax

`node --check` passed for all **20** top-level asset JavaScript files.

### Whitespace/source diff

The v0.17 source ZIP was re-extracted as an untouched baseline and checked against the v0.18 tree using `git diff --no-index --check`. It reported no whitespace errors. (`--no-index` returns a non-zero difference status because the trees intentionally differ.)

### Signing identity

`app/luckydex-dev.keystore` SHA-256 remains:

`90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`

`keytool -list` successfully opened alias `luckydex` with the existing password/configuration.

## Acceptance review

1. **World route:** source/static PASS — old stacked zone module is not loaded; the eight-stop horizontal world is the active selector.
2. **Dedicated venue page:** source/static PASS — world and venue are separate sibling views; venue contents are not appended under the world route.
3. **Back hierarchy:** logic/static PASS — Game → owning Venue → same selected World landmark → prior app navigation.
4. **No emoji landmark art:** source/static PASS — all eight primary landmark paths are local WebP files.
5. **Berry Picker:** logic/source PASS — v0.17 scoring config retained; garden trees, thought bubbles, reactions, drag and tap paths present.
6. **Head It:** logic/source PASS — RAF motion, finite ball counts, Unlimited three-miss end, hit feedback and idempotent completion covered.
7. **Tile Puzzle:** logic/source PASS — coherent square source crops, adjacent tap/swipe rules, solvability checks and final-image reveal covered.
8. **Poké Ball Drop:** logic/source PASS — no New/Next Round control; three-ball lifecycle and exact winnings result covered.
9. **Ditto retirement:** static PASS — no visible launcher/world mapping and no v0.17 Ditto module/style load; dormant state remains.
10. **Run/reward/results:** static/logic PASS — all ten visible games have session rules and exact-award result paths.
11. **Save/signing compatibility:** static/regression PASS — additive venue migration, existing state preservation and keystore SHA verified.
12. **Release gates:** Node, pytest, JS syntax, duplicate-ID, asset and ZIP-integrity checks are part of this release pass. Android compilation remains the GitHub Actions gate below.

## Not locally verifiable in this harness

There is no Gradle wrapper or system Gradle installation in the supplied source export/runtime, so a local `:app:assembleDebug` compile could not be executed. The existing GitHub Actions workflow remains the authoritative Android compile/signing check after the root source ZIP is uploaded.

No claim is made that the new motion feel, landmark composition or portrait geometry has been physically device-tested in this environment. Those visual/on-device judgments should be confirmed from the GitHub-built APK on the target Android phone; any such follow-up is visual QA rather than a known static/logic failure.
