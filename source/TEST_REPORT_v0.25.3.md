# LuckyDex v0.25.3 Test Report

## Scope
Verification of the v0.25.3 rarity/finish normalization, Secret Rare reveal treatment, fullscreen Oreburgh Museum, pixel-art mining assets, curated Tile Puzzle scenes, compatibility and Android update identity.

## Automated regression sweep
A fresh sweep of every `tests/*.cjs` program on the final implementation tree produced:

- **60 total test programs checked**
- **45 runnable programs passed**
- **0 runnable failures**
- **15 Playwright-dependent programs skipped** because the extracted workspace does not contain the Playwright Node package

The Playwright skips are an environment limitation, not treated as passes. GitHub Actions remains the intended browser/APK build environment.

## v0.25.3 targeted coverage
- `v0253-card-rarity.test.cjs`: normalized rarity/finish separation, source-data precedence, Secret Rare impact, Gold Secret combined classification, Common Reverse Holo behavior.
- `v0253-rarity-consumers.test.cjs`: pack reveal, app rarity tier/Dust/Rare Hits and trade consumer integration.
- `v0253-museum-assets.test.cjs`: local pixel-art museum/mining assets and manifest integrity.
- `v0253-museum-fullscreen.test.cjs`: fullscreen museum scene, overlay plaque, genuine display surfaces and orientation hooks.
- `v0253-tile-puzzle-scenes.test.cjs`: curated local scene library and removal of synthetic Tile Puzzle composition.
- `v0253-release.test.cjs`: versionCode/versionName/applicationId/permanent signer release contract.

## Syntax + offline assets
JavaScript syntax checks passed for the modified runtime scripts, including the shared rarity model, pack/app/trade consumers, Fossil/Museum runtime and Tile Puzzle scene/runtime scripts.

Offline asset verification passed for:
- Adventure assets
- Arcade venue assets
- Fossil/Museum asset manifest
- v0.25.3 curated Tile Puzzle scenes and museum image references

Visual sanity renders were also inspected for all museum exhibits and curated Tile Puzzle slices. These renders are verification artifacts only and are not runtime dependencies.

## Update identity
- applicationId: `com.example.luckydex`
- versionCode: `253`
- versionName: `0.25.3`
- Keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- Certificate SHA-256 fingerprint: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`

## Local environment limitation
No Gradle wrapper/system Gradle executable is present in this extracted source workspace, so a local APK build was not performed. The existing GitHub Actions workflow is the APK build/signing verification path.
