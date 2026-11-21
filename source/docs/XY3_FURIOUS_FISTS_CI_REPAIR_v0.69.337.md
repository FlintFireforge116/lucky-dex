# LuckyDex v0.69.337 — Furious Fists build and audit repair

GitHub build #625 (`:app:auditXY3ForApk`) failed with exactly two audit assertions after completing the official 114-card generation step:

1. `v07334-furious-fists-stage1.test.cjs` expected Machamp #46 to be battle-ready, but the verified script's stage1 conservative-gate removal had deleted the `Machamp Crush` mapping. The completion update re-enabled #46 but did not restore this attack, so its generated status was PARTIAL. The verified source now restores the opponent-turn 40 damage-reduction modifier before generation. Its valid lifetime and battle-readiness have a dedicated regression.
2. `v07336-furious-fists-independent-audit.test.cjs` compared printed compact `['G', ...]` cost arrays directly against registered attack costs. Since v0.69.329, the **shared registry intentionally converts those arrays to comma-free energy-code strings** (`'G...'`) for battle legality, UI, CPU and deckbuilder. The audit now compares the registered string against `printed.join('')` to preserve exact symbol counts and order.

The patch also updates Gradle version 7337, title and settings screen, JavaScript boot marker and corresponding test expectations, without rewriting other battle handlers.

## Local tests performed

- Furious Fists Stage 1, completion and independent audits: **26 passed, 0 failed, 5 skipped**. Five tests require the official XY3 catalogue that GitHub's generator materialises during the build.
- Supreme Victors version consistency and all-catalogue energy checks: **11 passed, 0 failed**.
- Shared Classic deck-quality checks: **6 passed, 0 failed**.
- JS syntax, Python syntax and ZIP integrity checked.

**A full Android APK build and the five generated-catalogue assertions remain unverified until GitHub Actions runs this patch.**

## Installation in Termux

```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.337_FURIOUS_FISTS_CI_REPAIR.zip -d source

git add source
git commit -m "LuckyDex v0.69.337 Furious Fists CI audit repair"
git push origin main
```
