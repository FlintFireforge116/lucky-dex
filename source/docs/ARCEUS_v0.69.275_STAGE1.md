# Platinum—Arceus (pl4) — LuckyDex v0.69.275, Stage 1

The project master rules have been read and updated. This patch follows the completed 153-print Supreme Victors pl3 set. **Do not describe this release as 111/111 playable**: it is an authentic 111-print collection/deck integration with conservative Battle gating.

## Exact print source and initial preparation

The original English 2009 Platinum: Arceus collector list has 111 prints (numbers `1` through `99`, `AR1`–`AR9`, `SH10`–`SH12`). Each print has its own ID, artwork and text. The build generator verifies the raw upstream Git blob SHA `2cbff9e0d363c2fc516328bd03aada50c4d99373` before transforming any card; the URL is pinned to commit `cd8994de02bdd356dd2d2cb98fdf7b105a5f377d` so later upstream changes cannot silently alter gameplay. No paraphrased card texts are substituted.

The authentic source cannot be obtained from the offline patch-generation environment, so the patch includes an **unplayable zero-card bootstrap** and a mandatory first-run preparation script rather than a fake 111-print source. After extracting into `source`, run `sh source/scripts/prepare-arceus.sh` to download the exact source and generate the real `tcg-classic-arceus.js`. Both `data/classic/pl4-print-source.json` and generated JS must be committed with the other files. Gradle refuses to package an APK if this preparation was skipped or verification/tests fail.

## Implemented integration

- `pl4` is selectable in collection, Classic deck builder and CPU opponent filter.
- Collection ownership resolves authentic numbered, `AR` and `SH` IDs separately.
- Stage and evolution metadata preserve distinct variants, SP identities and LV.X requirements; missing parents are not silently tolerated.
- Arceus AR1–AR9 and Arceus LV.X #94–#96 can exceed the ordinary four-copy rule, but other species retain it and owned copies still matter for user decks.
- Proven ordinary attack primitives are mapped (conditions, coins, bench damage, searches, targeted damage, Energy discards, modifier effects). Unknown attack secondary effects or Powers/Bodies gate the complete print, with explicit reasons and no CPU deck eligibility.
- Printed Fossil cards require authentic in-play behavior/trigger Powers and stay gated until actually implemented. AR5 six-Arceus Ripple Swell is unplayable with the app's three-Bench current rule; it has **not** been weakened to an easier requirement.

## Verification limitations

The new v07275 tests check 111 distinct prints, exact battle metadata and source texts, ownership, Arceus unlimited deck copies, normal four-copy limits, disabled mechanics, CPU pools, and valid effect schema. They run in the Android Gradle build only *after* the original JSON has been fetched/generated. Local prior-set regression tests pass, but this environment has not generated the real pl4 JSON or compiled an Android APK. GitHub Actions and device testing remain mandatory, and Stage 2 should implement and test additional printed interactions instead of treating the registered print count as coverage.
