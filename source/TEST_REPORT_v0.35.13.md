# LuckyDex v0.35.13 verification report

## Patch scope

### HS Trainer Kit — Gyarados
- Corrected the actual pack-preparation failure rather than only hardening the card-index decoder.
- The live card index preserves distinct print IDs (`TK4G-20` and `TK4G-20-2`), but the currently indexed Trainer Kit pool is smaller than LuckyDex's four-card mini-pack profile.
- Fixed/special mini-pack profiles now opt into exact-print repeats only when the indexed pool contains fewer unique print identities than the requested pack size. Standard booster duplicate protection is unchanged.
- Compact-object card-index aliases remain supported as defensive compatibility, but are not treated as the root cause of the Gyarados failure.

### Dragon Vault
- Restored a five-card all-holo product model.
- Cards 1–20 normalize to `No Rarity` while retaining `holo` finish.
- Kyurem 21/20 normalizes to `Secret Rare` and retains `holo` finish.
- Lucky Pack no longer converts Dragon Vault's slots into impossible rare-only requirements.

### Dragon Vault wrapper
- Normal rendering resolves Dragon Vault to the authentic Salamence wrapper scan hosted by Bulbagarden Archives:
  `https://archives.bulbagarden.net/media/upload/b/b7/Dragon_Vault_Booster_Salamence.jpg`
- The archive identifies the current scan as 685×1280 (1.47 MB), replacing the historical 109×199 image.
- The existing bundled `booster-art-v0260/dv1.webp` remains as an offline/network-failure fallback rather than being enlarged as the primary art.
- Saved sealed packs use the same high-resolution primary/fallback behavior.
- Reusable mini-pack sprites deliberately remain on bundled local artwork.

## Verification

- Focused v0.35.13 card / rarity / pack regressions: PASS.
- v0.26.5 complete direct pack-art audit: PASS — 144 physical packshots / 150 name aliases.
- v0.26.6 reusable booster-mini audit: PASS — 144 standalone pack sprites.
- Non-browser regression sweep: **222 test programs, 272 tests passed, 0 failed**.
- JavaScript syntax checks for all modified runtime modules: PASS.
- v0.35.13 release metadata: PASS (`versionName 0.35.13`, `versionCode 3513`).

## Environment limitations

`npm test` begins successfully and passes all 18 `adventure-battle` tests, then stops at `adventure-core.test.cjs` because `playwright` is not installed in this container. The 21 Playwright-dependent test programs were therefore excluded from the independent non-browser sweep above.

An Android APK was not built locally because the container does not provide a `gradle` executable / Android build environment. The existing GitHub Actions APK workflow can build the packaged source after it is committed as `LuckyDex_source.zip`.
