# LuckyDex v0.69.402 Guardians Rising build correction

The first Stage 1 ZIP included a stub SM2 battle module but did not include `data/classic/sm2-print-compact.json`. Thus the mandatory GitHub Gradle task was forced to download an external source. It also included a strict post-generation assertion expecting attack Energy costs to stay as arrays even though the Classic battle registry normalises them to cost strings. Local source-only checks did not exercise those failure paths.

This replacement patch is cumulative: it contains the entire original SM2 Stage 1 patch and the earlier v0.69.401 attack/Energy fixes. Install **only this patch** instead of stacking it on the failed Stage 1 patch.

Remedies:
- Bundles exact 180 original SM2 prints as a compact local source file, with SHA-256 in the release contract and validation in both generator and preflight. No internet access is required at build time.
- Ships generated `tcg-classic-guardians-rising.js` rather than a zero-card stub.
- Corrects the integration test to check exact printed costs through the engine's normalisation, whether represented as an array or a canonical string.
- Preserves 57 Stage 1 battle-enabled prints and clearly gates 123 unsupported prints, rather than silently treating their missing effects as successful.
- Preflight uses `python3 scripts/preflight-sm2-release.py --full` to exercise the real source, generation, deck and effect tests.

Locally run on 23 November 2026:
- `python3 scripts/preflight-sm2-release.py --full`: 42/42 passing.
- Sun & Moon/attack/Energy/SM2 regression suite: 102/102 passing.

Android/Gradle GitHub APK build **not** verified in this environment. A failure may have additional causes that require the actual GitHub Actions job log.
