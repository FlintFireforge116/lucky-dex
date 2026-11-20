# LuckyDex v0.69.323 — XY Base independent GitHub build failure repair

**Source of diagnosis:** the actual GitHub Actions job logs for runs [611](https://github.com/FlintFireforge116/lucky-dex/actions/runs/44814505828) and [612](https://github.com/FlintFireforge116/lucky-dex/actions/runs/44816496037), on 20 November 2026. This is a diagnostic/patch handoff, not a claim of an APK build.

## Actual errors

1. **v0.69.321** (run 611) failed during `:app:auditSupremeVictorsForApk`: `Boot JS version differs from Gradle 0.69.321`. The boot JS and HTML still said 0.69.320; this was fixed in 0.69.322 and remains fixed here.
2. **v0.69.322** (run 612) failed during `:app:auditXY1ForApk`: `XY-only legal CPU recovery preserves 30 cards, actual ownership and Fairy Energy`, assertion `at least four types should have fully owned, legal single-set rescues`. The original XY fallback discarded otherwise legal evolving Basics without considering their completed evolution lines, exhausting its candidates.

Both failures occurred **before Android APK compilation**. No changes to Android compiler dependencies are required.

## Changes

- Replace the XY-only recovery heuristic with an exact-size, complete-family composition algorithm. Select only eligible, actually owned XY prints from requested Energy type (or Colorless support), and include all the parents of selected evolutions, preventing orphan Stage 1/Stage 2/MEGA cards. Never fabricate a needed card, never use foreign-set filler, never exceed four of a printed name or use Basic Energy as a physical deck card. Reserve 14 Pokémon and 16 owned Trainers/Special Energy cards, maintaining the existing legal validation and Energy compatibility checks. If the requested type cannot be built legally, return no fallback instead of a misleading deck.
- Keep the >=4 type expectation from the failing source-dependent test; update its earlier Basic-only assumption to verify that any included evolved Pokémon has a real in-deck prerequisite and any evolving Basic has a usable evolution included.
- Add independent `v07323-xy-build-repair.test.cjs` verifying mode isolation, original ownership, full 30-card legality, evolution lines and Fairy Energy. This test runs in the Gradle XY gate after pinned-source generation.
- Remove a hardcoded `7322` from the existing version guard: verify `versionCode` matches the patch number of the current `0.69.x` release. Update Gradle, boot JS, HTML and versionCode to **0.69.323 / 7323**. The prior Supreme Victors version gate remains active.

## Verification performed locally

- A **temporary, non-shipping, source-shaped 146-print fixture** based on authentic printed XY names, stages and Energy cost patterns for several genuine evolution families produced 6 legal, owned, XY-only archetypes: Grass, Water, Fighting, Darkness, Fairy, Colorless. Full original failing XY test plus new independent recovery test passed. The fixture itself does NOT represent or replace the official-source catalogue.
- BW9, BW10, BW11, XY Base integration/audit/build repair tests together: **97 total, 93 passed, 0 failed, 4 skipped** (missing unrelated pinned-source fixture checks).
- After removal of the synthetic source fixture, the clean-tree run reported **97 tests, 89 passed, 0 failed, 8 skipped**; the two independent old/new release-version checks also passed.
- `node --check` passed for the deck-builder JavaScript. The GitHub workflow must still regenerate the **official** pinned `xy1-print-compact.json` and run the Android Gradle build; any remaining failure must be diagnosed from its new log, not assumed resolved.

## Install (same as the last successful release)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.323_XY_GITHUB_BUILD_FIX.zip -d source
git add source
git commit -m "LuckyDex v0.69.323 XY Base GitHub build repair"
git push origin main
```
