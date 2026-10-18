# LuckyDex v0.47.1 Verification Report

## Scope
Presentation and mobile-layout correction for the v0.47.0 Mauville Roulette implementation.

## Changes
- Fixed the Roulette game shell overriding the Arcade header reserve, which caused the back/menu header to overlap Roulette content on phones.
- Hid the redundant shared Arcade session strip inside Roulette to recover vertical space.
- Rebuilt the wheel presentation around a Gen III-style radial landing track: each of the 12 Pokémon/colour segments now has one aligned inner ball pocket rather than a floating white circle offset from the segment.
- Settled balls now fill the matching pocket; the animated loose ball is only visible while spinning.
- Reworked the table with a stronger Game Corner/felt presentation, cream/gold frame and clearer betting cells.
- Mobile Roulette now keeps the wheel and the complete 4×3 betting mat visible side-by-side, with compact stake, selection, Spin and result feedback beneath.
- Roulette rules, odds, Lucky Coin stakes, Service Day, rescue event, records, achievements and interrupted-spin safety are unchanged.

## Fresh verification
- TDD presentation suite: **3/3 pass** after being observed failing against the v0.47.0 presentation.
- Roulette core/integration/presentation/release suite: **14/14 pass**.
- Arcade records + achievement regression selection: **23/23 pass**.
- Broad non-browser/non-release regression comparison: v0.47.1 produced **805 passes / 43 inherited failures**, and untouched v0.47.0 produced the exact same **43 failing test programs**; there are **0 new-only failures** and **0 baseline-only failures**.
- JavaScript syntax checks pass for modified Roulette/runtime build files.
- Authentic Arcade asset validation passes: 44 authentic scenes/sheets/crops, 2,098 offline sprites and 2,078 actor assets.
- Venue validation passes: all 8 local venue assets.
- Adventure asset validator passes: 829 images / 1,025 species.
- Fossil Museum validator passes: 42 images.
- Sleeve validator passes: all 202 sleeve images.
- Android application ID remains `com.example.luckydex`; versionName `0.47.1`, versionCode `4701`.

## Scope preservation
Compared with supplied v0.47.0 before adding this report: 8 existing files changed, 2 tests added, 0 baseline files removed, and 7,521 baseline files remain byte-identical. No image assets were modified.

Browser-only Playwright tests were not run because Playwright is not installed in this extracted environment. A direct headless Chromium preview attempt is not counted as verification because Chromium is blocked by the container GPU/runtime environment. No Codex was used.
