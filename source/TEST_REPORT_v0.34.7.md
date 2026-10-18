# LuckyDex v0.34.7 verification report

## Scope

- Generalises Pocket bonus-card collation beyond Fantastical Parade.
- `A4` Wisdom of Sea and Sky: 8.330% chance of a sixth card; bonus-only pool is restricted to collector numbers 032, 066, 070, 075, 077, 101, 166 and 171.
- `A4a` Secluded Springs: 8.330% chance of a sixth card; bonus-only pool is restricted to collector numbers 023, 059, 063 and 077.
- `B1`, `B1a`, `B2`, `B2a`, `B3`, `B3a`, `B3b`, `B4` and `B4a`: 5.238% chance of a sixth card; One Shiny and Two Shiny cards are restricted to the bonus position.
- `B2b` Mega Shine: 5.238% chance of a sixth card; its bonus-only pool includes One Shiny, Two Shiny and immersive Mew #086. Mew #085 remains a normal Three Star card and is not accepted by the bonus-only Mew rule.
- `B4b` Deluxe Pack: Mega: four cards normally; 1.666% chance of a fifth card restricted to Two Shiny.
- `A4b` Deluxe Pack: ex remains a four-card product with no +1-card variant.
- LuckyDex God Pack behavior remains intentionally unchanged at 1/1,000.
- Android/app release identity is `0.34.7` / `347`; application ID remains `com.example.luckydex`.

## Design rule preserved

LuckyDex translates authentic pack structure, slot ownership and rarity excitement while removing the monetisation/access restrictions around attempts. The player earns pack openings through gameplay; this patch does not add Pocket timers, subscriptions, paid odds, stamina gates or other pay-to-win mechanics.

## TDD evidence

- `tests/v0347-pocket-bonus-collation.test.cjs` was written and run before production changes. It failed with `Wisdom of Sea and Sky must gain a sixth card below 8.330%` (`5 !== 6`).
- After implementation the same test passes and covers the A4/A4a, Series B, Mega Shine, Deluxe Pack: Mega and non-applicable A-series cases.
- The test also proves bonus-only cards are rejected from normal positions, preventing shiny/baby bonus cards from leaking into the first five/four slots.
- `tests/v0347-release.test.cjs` was run before the version bump and failed against `versionCode 346`; after the release bump it passes.
- The older v0.34.6 release identity test was converted to the same forward-compatible `v0.34.6+` contract already used by v0.34.4/v0.34.5, so future version bumps do not create a false regression.

## Focused verification

Passed:

- `node --check app/src/main/assets/pack-policy-v0343.js`
- `node --check app/src/main/assets/app-v0167.js`
- `node --check app/src/main/assets/tcgp-source-v0160.js`
- `node tests/v0343-pack-policy.test.cjs`
- `node tests/v0343-pack-builder.test.cjs`
- `node tests/v0343-pack-collation.test.cjs`
- `node tests/v0345-live-collation.test.cjs`
- `node tests/v0346-fantastical-wotc-collation.test.cjs`
- `node tests/v0347-pocket-bonus-collation.test.cjs`
- `node tests/v0291-god-pack.test.cjs`
- `node tests/v0347-release.test.cjs`

One-million-pack policy simulations produced:

- Wisdom of Sea and Sky: 8.332% bonus packs
- Secluded Springs: 8.344% bonus packs
- Mega Rising: 5.288% bonus packs
- Mega Shine: 5.229% bonus packs
- Deluxe Pack: Mega: 1.665% bonus packs
- Deluxe Pack: ex: 0% bonus packs

The small deviations are consistent with random simulation around the configured 8.330%, 5.238% and 1.666% probabilities.

## Full active test inventory

The repository contains **208** `.cjs` test programs after adding the two v0.34.7 tests.

- **193 passed**
- **15 could not start because the `playwright` module is not installed in this execution environment**
- **0 other failures**

`npm test` begins normally and passes the first test program, then stops when the first Playwright-backed browser test attempts to require the unavailable module. To avoid hiding later failures, all 208 test programs were then executed individually and classified as above.

## Asset verification

Passed:

- Arcade authentic scenes/sheets/crops: 44
- Offline Arcade sprites: 2,098
- Unretouched Arcade actors: 2,078
- Venue assets: 8
- Adventure images: 829; species: 1,025; back sprites: 386; registry objects: 37
- Fossil Museum images: 42

## APK/build limitation

This runtime has no Gradle wrapper, no `gradle` executable, and no configured Android SDK (`ANDROID_HOME` / `ANDROID_SDK_ROOT` are empty), so an APK was not compiled locally. The existing GitHub workflow remains the APK build step.
