# LuckyDex v0.28.3 test report

## Scope
v0.28.3 updates two existing Arcade games without changing venue ownership or Android package identity:
- Clefairy Match playback is accelerated while preserving its existing choreography and rules.
- Unown Decoder is rebuilt as a three-mode streak/cash-out game using runtime A-Z Unown glyph composition, the existing National Pokédex dataset, and a large text-only Pokémon-world term pool.

## Release identity
- Android application ID: `com.example.luckydex` (unchanged)
- Android `versionCode`: `283`
- Android `versionName`: `0.28.3`
- package/package-lock/runtime/visible app versions: `0.28.3`
- Permanent signer file remains `app/luckydex-dev.keystore`, unchanged from the v0.28.2 source baseline.
- Signer file SHA-256 in this source tree: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`

## Clefairy pacing
`LuckyDexClefairy.durationFor(...)` now reports:
- idle: 220 ms (unchanged)
- star: 968 ms
- song: 1129 ms
- moon: 1065 ms
- spin: 935 ms

The animation evaluates the original source keyframe/effect timeline against the shortened real playback duration, so actions finish at their original neutral/end pose rather than truncating old keyframes. The inter-symbol playback pause is reduced from 220 ms to 100 ms. Miss/reset timing still derives from `LuckyDexClefairy.durationFor(...)`.

## Unown Decoder content/model
- Pokémon entries: 1,025, built at runtime from `LuckyDexAdventureSpecies.byId`
- Curated text-only entries: 220
- Total current pool: 1,245 entries
- Curated categories include REGION, TYPE, ITEM, MOVE, LOCATION, BATTLE, and TRAINING.
- No word-specific Decoder artwork was added.
- Runtime rendering uses A-Z sprite paths under `arcade/sprites/actors/unown/`.
- The pre-existing sprite folder contains the 26 A-Z forms plus the legacy `exclamation.png` and `question.png`; those two punctuation files were already present in v0.28.2 and are not used by the v0.28.3 word renderer.

## Targeted verification
The following passed:

```text
node --check app/src/main/assets/clefairy-scene.js
node --check app/src/main/assets/clefairy-memory.js
node --check app/src/main/assets/arcade-unown-data.js
node --check app/src/main/assets/arcade-unown.js
node tests/v0283-clefairy-pace.test.cjs
node tests/v0283-unown-data.test.cjs
node tests/v0283-unown-ui.test.cjs
node tests/v0283-unown-flow.test.cjs
node tests/v0283-arcade-regression.test.cjs
node tests/v0283-release.test.cjs
node tests/v0282-release.test.cjs
node tests/arcade-session.test.cjs
node tests/restore-regressions.test.cjs
node tests/v022-targeted.test.cjs
```

The v0.28.3 browser test also passes its static fallback contract in this environment. Its real Playwright path contains narrow-phone overflow, typed Enter submission, canonical reveal, and close/reopen stale-callback assertions, but those browser assertions could not execute here because Playwright is not installed.

## Full test-program sweep
`npm test` was attempted first. It stops at `adventure-core.test.cjs` because the declared `playwright@1.62.1` dev dependency is not installed in this execution environment (`MODULE_NOT_FOUND: playwright`).

Every `tests/*.cjs` program was then run individually and classified by actual result:
- 119 test programs: PASS
- 14 Playwright-dependent programs: unavailable because `playwright` is not installed
- 1 known baseline failure: `v0223-ball-stalls.test.cjs`
- 0 unexpected failures

The 14 Playwright-unavailable programs are:
`adventure-core.test.cjs`, `adventure-file-origin.test.cjs`, `adventure-lifecycle.test.cjs`, `adventure-persistence.test.cjs`, `adventure-runtime.test.cjs`, `amie-recovery.test.cjs`, `recovery-layout.cjs`, `recovery-lifecycle.cjs`, `recovery-navigation.cjs`, `recovery-runtime.cjs`, `recovery-trade-refresh.cjs`, `recovery-transactions.cjs`, `v0223-berry-touch.test.cjs`, and `v0223-layout-grid.test.cjs`.

### Known unrelated baseline
`v0223-ball-stalls.test.cjs` still fails the historical seeded Ball Drop stress case (`drop 8, aim 75 never landed`). `app/src/main/assets/arcade-ball-drop.js` is unchanged byte-for-byte from the v0.28.2 source baseline in this worktree, so this failure is unrelated to the Clefairy/Unown changes.

## Offline asset integrity
All required offline audits passed:

```text
python3 scripts/fetch_arcade_v0200_assets.py --check
  PASS: 44 authentic scenes/sheets/crops
  PASS: 2,098 Arcade sprites
  PASS: 2,078 unretouched Arcade actors

python3 scripts/verify_v0223_venues.py
  PASS: 8 venue assets

python3 scripts/verify_adventure_assets.py
  PASS: 829 images, 1,025 species, 386 back sprites, 37 registry objects

python3 scripts/verify_fossil_museum_v0250_assets.py
  PASS: 42 images
```

## Android build availability
This container has Java but no project `gradlew` wrapper and no system `gradle` executable, so an Android APK build/signature inspection could not be run here. The source-level identity checks pass, the permanent keystore is present, and the keystore is unchanged from the v0.28.2 source baseline; this report does not claim an APK was built in this environment.
