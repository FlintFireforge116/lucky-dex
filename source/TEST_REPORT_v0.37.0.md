# LuckyDex v0.37.0 — Magikarp’s Splash Test Report

**Release:** 0.37.0  
**Android versionCode:** 3700  
**Package:** `com.example.luckydex`  
**Feature:** Pokémon Stadium Kids Club — Magikarp’s Splash, recreated in LuckyDex’s Gen III visual language.

## Implemented

- Added `Magikarp’s Splash` as the third Stadium Kids Club game beside Ekans’ Hoop Hurl and Dig! Dig! Dig!.
- Added a DOM-free jump/timing core with a 20,000 ms round, hold-for-height counter hits, a 110 ms early / 90 ms late Quick Splash landing window, shared-rank ties, and the approved placement rewards.
- Added four simultaneous competitors: YOU + COM 1–3.
- CPU opponents are seeded, naturally variable, and independent of player state; there is no rubber-banding.
- Added the Gen III presentation using the local #129 Magikarp sprite at its native 44×57 aspect ratio, local water art, mechanical counters, pixel effects, and responsive four-lane layout.
- Added pointer/touch + Space/A controls, OS-repeat rejection, pause-safe absolute timing, visibility/pagehide pause handling, and exactly-once completion/reward persistence.
- Added Magikarp save records and four achievements.
- Added a Kids Club-only three-game Gen III selector treatment while preserving the generic selector for every other Arcade venue.
- Berry Blender was used as a timing/input reference only; its production code was not modified or coupled to Magikarp’s Splash.

## CPU distribution verification

COM 1 was simulated over deterministic seeds 1–200 for each difficulty:

| Difficulty | Range | Median | Approved common band | In band |
| --- | ---: | ---: | ---: | ---: |
| Easy | 9–18 | 14 | 12–18 | 187/200 (93.5%) |
| Normal | 17–26 | 21 | 19–24 | 185/200 (92.5%) |
| Hard | 22–31 | 27 | 25–29 | 184/200 (92.0%) |

Hard naturally produces occasional 30/31 scores. CPU state was also verified to be repeatable for equal seeds and unchanged when player score/phase data is mutated.

## v0.37.0 focused verification

The ten `v0370-*` test programs were run on the final tree:

- `v0370-kids-club-selector.test.cjs` — PASS
- `v0370-magikarp-core.test.cjs` — PASS
- `v0370-magikarp-cpu.test.cjs` — PASS
- `v0370-magikarp-integration.test.cjs` — PASS
- `v0370-magikarp-lifecycle.test.cjs` — PASS
- `v0370-magikarp-presentation.test.cjs` — PASS
- `v0370-magikarp-runtime.test.cjs` — PASS
- `v0370-magikarp-state-achievements.test.cjs` — PASS
- `v0370-release.test.cjs` — PASS
- `v0370-magikarp-browser.test.cjs` — explicit SKIP because the Playwright module is not installed in this extracted source environment

### Final-review regressions added

Two real edge cases were found during the final self-review and fixed using RED→GREEN regression tests:

1. **Malformed nested save records.** `undefined`, `NaN`, or non-numeric values in `bestScores` / `winsByDifficulty` could survive migration. They now normalize to zero while unrelated Arcade state is preserved.
2. **Release/cancel during pause.** A touch release delivered while the app was background-paused could previously be timestamped against wall-clock pause time and turn a short hold into a scoring hold. Paused releases are now anchored to the pause instant, so no phantom score is created.

The final review also explicitly pins:

- one rebound only for unusual duplicate/early press + release ordering inside the Quick Splash window;
- queued Quick Splash survival across pause/resume;
- rejection of grounded launches at the 20,000 ms cutoff while allowing an already-airborne final jump to score and land;
- shared-rank ties, including a tied lead counting as 1st for payout/win persistence;
- safe nested migration without erasing unrelated Arcade data.

## Broad regression verification

Every test program that does not require the unavailable Playwright/browser recovery dependency was run individually on the final tree:

**249 / 249 PASS**

A textual dependency scan identified **23 browser-dependent test programs** that require Playwright or the Playwright-backed recovery harness and were excluded from that non-browser count.

Running the repository’s normal `npm test` command reaches `adventure-core.test.cjs` and then stops because `scripts/recovery-browser.cjs` cannot load the missing `playwright` module. This is an environment/dependency limitation, not a LuckyDex assertion failure, so this report does **not** claim the complete browser-backed suite passed.

## Offline asset verification

All four available offline validation commands passed on the final tree:

- `python3 scripts/fetch_arcade_v0200_assets.py --check`
  - 44 authentic scenes/sheets/crops verified
  - 2,098 offline Arcade sprites verified
  - 2,078 unretouched Arcade actors verified
- `python3 scripts/verify_v0223_venues.py`
  - PASS; 8 venue assets verified
- `python3 scripts/verify_adventure_assets.py`
  - PASS; 829 images, 1,025 species, 386 back sprites, 37 registry objects, zero errors
- `python3 scripts/verify_fossil_museum_v0250_assets.py`
  - PASS; 42 images verified

## JavaScript syntax verification

`node --check` passed for the new/modified Magikarp core, owner, Arcade platform, Arcade world, achievement, and session JavaScript files.

## Android build availability

This source bundle does not include a `gradlew` Gradle wrapper and no system Gradle executable is available in the execution environment. An APK build therefore could not be run here. No Android-build pass is claimed.

## Review note

A fresh reviewer/subagent was not available in this harness, so the final whole-change review was performed as a separate self-review by the implementer. This is weaker than an independent reviewer and is disclosed here explicitly.

## Release conclusion

Within the capabilities of this extracted source environment, v0.37.0 passes all focused non-browser feature/release tests, all 249 available non-browser regression programs, and all four offline asset validation commands. Browser-backed and Android build verification remain environment-limited as described above.
