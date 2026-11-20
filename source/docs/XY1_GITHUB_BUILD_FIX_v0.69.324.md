# LuckyDex v0.69.324 — XY Base / HGSS Rainbow Energy build fix

## Failure reproduced from GitHub Actions

- Run 44818977815, v0.69.323: `:app:auditHGSS1ForApk` failed.
- Test: `tests/v07282-heartgold-soulsilver-stage1.test.cjs`, "8 Basic Energy prints remain zoned, double Colorless and Rainbow are special playable Energy".
- Previous assertion required the **exact literal source text** `'hgss1-104'].includes(card.id)`.
- After XY Rainbow `xy1-131` was added to the same list, the correct battle code reads `'hgss1-104','xy1-131'].includes(card.id)`; its behaviour is unaffected, but the order-dependent source-text test fails.

## Fix

Replaced the brittle static source-string assertion with an actual HGSS Rainbow Energy attachment during a Classic battle. The test now checks:

1. A physical HGSS Rainbow Energy card is attachable from hand.
2. Attachment adds exactly 10 self-damage.
3. The same physical UID is attached to the target Pokémon.
4. The attached card supplies one Miracle (rainbow) Energy.

The battle engine already implemented all these behaviours: **no gameplay behaviour was changed**.

Version metadata is consistent at 0.69.324 / versionCode 7324 in Gradle, boot JavaScript and both visible HTML labels. Earlier XY CPU-deck repairs from 0.69.323 are preserved.

## Local verification

- `tests/v07282-heartgold-soulsilver-stage1.test.cjs` and `tests/v07284-hgss1-independent-audit.test.cjs`: **31/31 passed**.
- `tests/v07291-triumphant-stage1.test.cjs` and `tests/v07293-triumphant-independent-audit.test.cjs`: **18/18 passed**.
- Version-compatible checks in Supreme Victors, HGSS, Unleashed, Undaunted and Triumphant: **5/5 passed**.
- Additional targeted Rainbow and XY tests: **8/8 passed**.
- Full local HGSS all-in-one sweeps reached numerous passing tests but exceeded the execution limit; they are **not** counted as completed.
- The GitHub APK build has **not** been rerun yet. The pinned XY generated card catalogue is not stored in this patch.

## Apply in Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.324_XY_HGSS_BUILD_FIX.zip -d source

git add source
git commit -m "LuckyDex v0.69.324 XY HGSS Rainbow build repair"
git push origin main
```
