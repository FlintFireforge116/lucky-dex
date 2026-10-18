# LuckyDex v0.53.0 Verification Report

## Scope

This release upgrades **Pikachu's Beach** at the Summer Beach House from the single v0.52.0 implementation into two modes while preserving the existing `pikachuBeach` Arcade game ID, save compatibility, Lucky Wave settings/rewards and Android identity.

### Classic

- Deterministic 20 ms fixed-step JavaScript translation of the Pokémon Yellow surfing Pikachu state flow.
- 6000 HP countdown and 24-section course.
- Riding -> jumping -> landing/crashed -> riding/results flow.
- Speed-sensitive wave launches and source-derived clean / rough / hard / wipeout landing classes.
- Original Radness awards preserved: 50 / 150 / 180 / 350 / 500.
- Clear score remains Radness + remaining HP.
- Easy / Normal / Hard retain the same core state structure; Easy/Hard change only the approved landing tolerance/loss wrapper.
- Existing v0.52.0 Pikachu's Beach history migrates losslessly and idempotently into the Classic record branch.

### DX

The supplied `superSurfingPikachuDX_v1_1.zip` was recovered into local LuckyDex assets with `scripts/extract-pikachu-beach-dx.py`. The bundled manifest catalogues 139 GameMaker sprite resources (1,094 extracted sprite frame PNGs) and 59 WAV resources. The browser runtime does not execute or embed the Windows EXE.

The LuckyDex DX mode includes the recovered game's defining systems represented in the approved spec: slippery movement, jump/wave airtime, Thundershock, airborne Iron Tail, tilt/spin tricks, rings, HP pickups, Seaking/Lapras/Natu allies, difficulty/distance options and Articuno / Zapdos / Moltres / Lugia / Wailord boss progression. Exact GameMaker VM bytecode is not executed; numeric values that were not directly recoverable are deterministic browser-port values and are not claimed as byte-for-byte GameMaker behaviour.

## Persistence, records and achievements

- Flat v0.52.0 Pikachu's Beach state migrates under `state.arcade.pikachuBeach.classic` without losing score, clear, Radness or Lucky Wave history.
- Migration is idempotent and preserves an existing DX branch.
- Classic and DX have separate permanent records; DX records key score history by difficulty/distance and retain boss/allies/rings/combat metrics.
- Existing Classic achievements continue to read migrated Classic state.
- DX has its own achievement set covering clears, difficulty, combat/tricks, boss/allies and rare-event progress.

## Lucky Wave reward verification

Both modes use one shared **Lucky Wave** setting and the reserved-safe reward pipeline.

Settings rates are still:

- Off: 0%
- Vanilla: 2%
- Test: 25%
- Always: 100%

The five reward classes are preserved and directly exercised by tests:

- Lucky Coins / money
- Card Dust
- Pack Voucher / ticket
- Card
- Sealed booster

Tests verify mode metadata, one-time delivery, the matching mode's prize counter, card/booster resolution before claim, pending reservation on save switch, duplicate-safe delivery and retry after reopen.

## Focused verification

Command:

```text
node --test tests/v0530-pikachu-beach-*.test.cjs tests/v0520-pikachu-beach-*.test.cjs
```

Result: **68 / 68 passed**.

The broader release/regression command additionally included Arcade records state/registry/achievement review, the v0.51+ release identity check and Arcade catalogue regression.

Result: **76 / 76 passed**.

JavaScript syntax checks passed for the Pikachu's Beach runtime plus modified Arcade platform/records/achievements/session/app files. `scripts/extract-pikachu-beach-dx.py` also passed Python bytecode compilation.

A release metadata regression initially caught `package-lock.json` still reporting v0.52.0 after `package.json` had moved to v0.53.0. That test was observed failing, the lock metadata was updated to v0.53.0, and the same release test then passed.

## Wider suite

`npm test` was run from the working source tree. The first three programs completed successfully:

- `adventure-battle-v0404.test.cjs`: 5 / 5
- `adventure-battle-v0411.test.cjs`: 23 / 23
- `adventure-battle.test.cjs`: 18 / 18

The runner then stopped when `adventure-core.test.cjs` attempted to load the unavailable `playwright` module (`MODULE_NOT_FOUND`). Therefore a complete `npm test` pass is **not claimed** in this environment.

A separate non-browser Arcade sweep ran 152 Arcade-oriented test programs: 136 passed and 16 failed. Every one of those 16 failures was rerun against the untouched v0.52.0 baseline commit and failed there identically, so no new wider-Arcade failure was introduced by v0.53.0 in that sweep.

## Visual/browser verification limitation

Fresh automated browser screenshots are **not claimed**. Playwright is unavailable in this environment, so the planned portrait browser pass could not be performed. Static integration tests verify mode-picker wiring, locally bundled assets, controls below the playfields, independent multi-touch pointer state, keyboard mappings, pause-on-hide/pagehide hooks, optional-audio degradation and mode-specific result metrics. On-device visual testing is still appropriate, especially for DX control comfort and sprite scaling.

Representative recovered DX player/wave/ring/ally/enemy/boss assets and Classic Yellow-derived surfer assets were manually inspected during extraction for transparency/cropping.

## Package verification

The exact source archive was extracted into a clean directory and the 76-test release/regression command was rerun against that extracted copy.

Result: **76 / 76 passed**.

`unzip -t` reports no compressed-data errors.

Final source archive SHA-256:

`58b1335fc24d0d6fbb1496b1a61022f9385519cf6ea2fc41abc71b7d3cae86f3`

The current report is supplied alongside the archive rather than embedded in it so that the report can contain the archive's final SHA-256 without creating a self-referential hash.

## Version / identity

- versionName: `0.53.0`
- versionCode: `5300`
- package / lock version: `0.53.0`
- applicationId remains `com.example.luckydex`
- existing signing configuration remains in place
- No Codex was used for this implementation.

## Android build

No APK build is claimed. This delivery is the source archive and test report.
