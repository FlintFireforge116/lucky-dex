# LuckyDex v0.26.7 verification report

## Root cause

The physical card index carried exact card identities but many image URLs came directly from the legacy metadata source. For Shining Legends #11 Torkoal that URL is a `pkmncards.com` hotlink. `packArtworkCandidatesV163()` returned immediately whenever `LuckyDexCardArt.resolveLocal()` produced any URL, so a dead/blocked indexed URL prevented the already-existing exact PokémonTCG and Scrydex fallbacks from being considered.

## Fix

- Removed the physical-index URL short-circuit. The indexed URL remains the first candidate, but failed decoding can continue into identity-safe alternate providers.
- Added `scripts/card_art_overlay_v0267.py`, which overlays stable PokémonTCG artwork only when set identity, collector number and normalized card name all agree.
- Updated the physical index GitHub workflow to checkout the pinned PokémonTCG dataset and apply that overlay globally while retaining the original validated metadata/index structure.
- Added a minimum stable-overlay coverage guard and a Shining Legends #11 Torkoal regression smoke check.
- Bumped Android/package/runtime version to 0.26.7 / versionCode 267 without changing package ID or signing key.

## Local verification

- v0.26.7 regression test demonstrated RED before the runtime fix, then GREEN after implementation.
- v0.26.7 stable-art fixture verifies exact Shining Legends/Torkoal mapping and rejects same-number/wrong-name artwork.
- All non-Playwright Node test programs pass locally after the change.
- JavaScript syntax checks and Python overlay compilation pass.
- Existing offline asset-integrity scripts pass.

The Playwright-dependent browser subset could not be run in this container because `playwright` is not installed and `npm ci` could not complete in the container environment. GitHub Actions still installs Playwright before running the full `npm test` suite.
