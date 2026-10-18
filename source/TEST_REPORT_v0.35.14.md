# LuckyDex v0.35.14 verification report

## Scope

This release corrects the HS Trainer Kit product model and the remaining Dragon Vault/reveal UI issues reported from v0.35.13.

### HS Trainer Kit
- `HS Trainer Kit—Gyarados` and `HS Trainer Kit—Raichu` are fixed 30-card Half Deck products.
- Both use explicit 1–30 manifests rather than random booster collation.
- The v0.35.13 `allowExactRepeat` workaround has been removed.
- Deck positions have unique LuckyDex IDs and preserve `No Rarity` metadata.
- Gyarados 20/30 and Raichu 19/30 are non-holo; position 30 is Holofoil.
- Non-signature cards reuse exact HeartGold & SoulSilver / HS Energy artwork while retaining Trainer Kit collection identity.
- Fixed-product cards are excluded from legacy artwork-identity deduplication so they cannot merge into ordinary HGSS collection cards.

### Dragon Vault / rarity presentation
- Dragon Vault remains a 5-card all-holo product.
- Cards 1–20 remain `No Rarity`; Kyurem 21/20 is `Secret Rare`.
- Explicit `No Rarity` no longer displays as `UNKNOWN RARITY`.
- Foil `No Rarity` cards display `HOLOFOIL`; non-foil cards display `NO RARITY`.
- Runtime Dragon Vault artwork now points to a local APK asset path. Gradle preBuild materializes the authentic 685×1280 Salamence wrapper from the archival source; the old 109×199 image is fallback-only.

### Opener UI
- Fixed Half Decks use a dedicated deck-box presentation rather than the generic pointy booster wrapper.
- Shop format copy identifies them as `30-card Half Deck` / fixed preconstructed decks.
- Opener instruction is spaced below the absolute Shop/Back button to prevent overlap.
- Fixed product completion copy reads `HALF DECK COMPLETE`.

## Fresh verification

- v0.35.14 focused regression suite: **7/7 passed**.
- Non-browser JS suite: **224 test programs / 280 assertions-or-program counts, 0 failures**.
- Playwright-dependent programs skipped: **27** because Playwright is not installed in this execution environment.
- Modified JavaScript syntax: `node --check` passed for all changed runtime modules.
- Release metadata test: passed for versionName `0.35.14`, versionCode `3514`, unchanged applicationId `com.example.luckydex`.
- Arcade asset integrity: 44 scenes/sheets/crops, 2,098 offline sprites and 2,078 actor source/output images passed checksum/encoding validation.
- Venue assets: 8/8 passed.
- Adventure assets: 829 images, 1,025 species and 37 registry objects passed with 0 errors.
- Fossil Museum assets: 42/42 passed.
- Booster artwork audit: 144/156 physical catalogue rows have bundled packshots; the remaining 12 are explicitly non-booster products.

## Environment limitation

Gradle is not installed in this execution environment, so an Android APK compile could not be run here. The existing GitHub Actions workflow will execute Gradle after the source ZIP is pushed. The Dragon Vault high-resolution wrapper is intentionally materialized during Gradle `preBuild`; if the archive is unavailable at build time, the app retains the old local thumbnail only as a fallback instead of failing the build.
