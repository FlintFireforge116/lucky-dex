# LuckyDex v0.27.0 verification

## Scope

Focused Link Trade artwork-recovery consistency fix. No Adventure runtime work and no pack-opening behaviour changes are included.

## Root cause

Trade tiles and the full-card modal used different artwork failure paths. `tradeImageFallback()` only exhausted URLs already attached to the Trade listing, while `openCardModal()` could escalate through `resolveCardArtwork(...)`, including `LuckyDexPocket.resolveCard(...)` for exact TCG Pocket identity recovery. This allowed a Trade tile to show `Artwork unavailable` while tapping the same card immediately displayed the correct image.

## Fix

- Added one-shot `recoverTradeArtwork(...)` escalation after ordinary Trade candidates fail.
- Reuses the shared `resolveCardArtwork(card, null, sourceOf(card))` path.
- Keeps exact Pocket set ID, collector number and card name intact.
- Writes recovered artwork back to the Trade card and calls `save()` so the market snapshot persists it.
- A failed recovered URL does not create an infinite retry loop.

## New regression coverage

`tests/v0270-trade-artwork-recovery.test.cjs` verifies the Shining Revelry / Wugtrio ex #019 case reaches the shared resolver with `source=tcgp`, preserves exact identity, swaps the thumbnail to the recovered image, clears the broken state, attempts recovery only once and persists the repaired market card.

`tests/v0270-release.test.cjs` verifies v0.27.0 / versionCode 270 release identity.

Historical release tests whose runtime-version regexes artificially stopped at the v0.26 line were changed to semantic `at least` checks; their original behavioural assertions remain intact.

## Results

- JavaScript syntax checks: PASS.
- Runnable Node test programs in this container: **84 / 84 PASS**.
- Playwright-dependent programs blocked by missing Playwright installation: **15**.
- Application-test failures among all 99 discovered Node programs: **0**.
- Offline authentic Arcade asset checksum/encoding audit: PASS (44 assets).
- Venue asset audit: PASS (8 venues).
- Adventure asset audit: PASS (829 images, 1,025 species; no errors).
- Fossil Museum asset audit: PASS (42 images).

## Browser-suite limitation

Playwright is declared in the repository but is not installed in this execution container. Fifteen test programs therefore stop with the expected missing-Playwright dependency error. GitHub Actions remains the browser/build authority for those suites.
