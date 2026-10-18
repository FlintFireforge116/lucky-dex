# LuckyDex v0.40.13 Test Report

## Scope

v0.40.13 adds the first LuckyDex cosmetics layer: **30 locally packaged card sleeves**, one global equipped sleeve, Profile → Customise, retroactive achievement-linked unlocks, and an expanded achievement/secret pool.

### Cosmetics and Customise

- 30 stable sleeve IDs with local `.webp` artwork; no external image dependency.
- One global active sleeve with mandatory `luckydex-default` fallback.
- Profile → Customise supports All / Owned / Locked plus themed category filtering.
- Undiscovered secret sleeves expose only `???` until their secret achievement is discovered.
- Pack card backs use the active sleeve through a CSS overlay while preserving the protected pack-opening runtime byte-for-byte.
- Trade receive card backs use the same active sleeve state through the shared card-back renderer.
- Invalid/corrupt active sleeve IDs normalize back to the default sleeve.

### Achievement expansion

- 30 new achievements total.
- 10 are genuinely hidden secrets.
- Sleeve rewards are additive and do not replace existing coins, tickets, dust, cards, or other achievement rewards.
- Existing durable save evidence retroactively unlocks earned sleeves without replaying currency rewards.
- Event-only achievements use new v0.40.13 telemetry and are not guessed retroactively when old saves cannot prove the event.
- Multiple retroactive unlocks aggregate into one transient `Previous accomplishments recognised` summary.
- Import/reset paths normalize cosmetics and v0.40.13 telemetry safely.
- `LuckyDexCosmeticsV0413.devUnlockAll()` exposes all sleeves for development testing without persisting by default.

## TDD / focused verification

The new v0.40.13 tests were written and observed failing before the corresponding implementation work. Preservation failures also drove a RED→GREEN integration correction: protected `pack-opening-v0160.js` and protected shared function declarations were restored exactly, with v0.40.13 behavior moved to CSS/external wrappers.

Final self-review also caught that the three basic LuckyDex sleeves were labelled always available but only the default was normalized as unlocked. The regression was reproduced RED, fixed in the cosmetics core, and the full suite returned GREEN with all four basic sleeves available immediately.

Final focused command covers all v0.40.13 tests plus v0.40.11/v0.40.12 release and Voltorb regressions.

Result: **44/44 tests/subtests passed, 0 failures**.

## Full test inventory — working source

All **373** `tests/*.test.cjs` programs were classified individually from the final working source.

- Runnable in this environment: **347**
- Playwright/browser-dependent and environment-blocked: **26**
- Genuine failures: **0**
- Timeouts: **0**

The 347 runnable programs were then executed together with Node's test runner (`--test-concurrency=8`).

Result:

- **601 tests/subtests**
- **601 PASS**
- **0 FAIL**
- **0 skipped/cancelled**

The 26 blocked programs are not counted as passes:

- `tests/adventure-core.test.cjs`
- `tests/adventure-file-origin.test.cjs`
- `tests/adventure-lifecycle.test.cjs`
- `tests/adventure-location-browser-v0402.test.cjs`
- `tests/adventure-location-legacy-sections-v0402.test.cjs`
- `tests/adventure-location-menu-v0402.test.cjs`
- `tests/adventure-persistence.test.cjs`
- `tests/adventure-regional-browser.test.cjs`
- `tests/adventure-runtime.test.cjs`
- `tests/adventure-scene-nav-browser-v0403.test.cjs`
- `tests/adventure-scene-nav-chapter-v0403.test.cjs`
- `tests/adventure-tools-browser-v040.test.cjs`
- `tests/adventure3-navigation.test.cjs`
- `tests/adventure3-presentation.test.cjs`
- `tests/adventure3-ux-v0401-battle.test.cjs`
- `tests/adventure3-ux-v0401-journey.test.cjs`
- `tests/adventure3-ux-v0401-tools.test.cjs`
- `tests/amie-recovery.test.cjs`
- `tests/arcade-dash-browser.test.cjs`
- `tests/v0223-ball-stalls.test.cjs`
- `tests/v0223-berry-touch.test.cjs`
- `tests/v0223-layout-grid.test.cjs`
- `tests/v0320-ball-drop-render.test.cjs`
- `tests/v0340-dash-previews.test.cjs`
- `tests/v0340-dash-repeated-races.test.cjs`
- `tests/v0340-dash-viewport.test.cjs`

They require the Playwright/browser runtime unavailable in this execution environment.

## Asset and preservation verification

Fresh checks from the working source:

- v0.40.13 sleeve catalogue/assets: **PASS** — exactly 30 stable IDs and all 30 local non-empty WebP files.
- Adventure preservation: **PASS — 5,945 protected files** unchanged.
- Shared save/pack/Collection/Dust/trade/navigation declarations: **PASS — 211 declarations** byte-identical.
- Older v0.33.1 preservation baseline: **PASS — 840 files**.
- Arcade Dash asset/course/Gen 3 integrity: **PASS**.
- Fossil Museum asset contract: **PASS — 41 item sprites**.
- Museum/mining asset contract: **PASS**.
- Fossil/card asset contract: **PASS**.
- Complete Dig asset audit: **PASS — 41 upstream sprites + TCG runtime placeholder**.
- Rock Harden local sprite/quarry integrity: **PASS**.
- Adventure location-scene pixel/build verifier: **2/2 PASS** (one Pillow deprecation warning only).
- Changed/new JavaScript syntax via `node --check`: **PASS**.

## Release identity

- Package version: **0.40.13**
- Android `versionCode`: **4013**
- Android `versionName`: **0.40.13**
- Asset builder UA: **LuckyDex-asset-builder/0.40.13**
- Runtime build marker: **0.40.13**
- Visible app version: **v0.40.13**

## Final ZIP integrity

The final source ZIP is built only after these working-source checks. A fresh extraction is then retested before release. Because an archive cannot truthfully contain its own SHA256 inside a file without changing that SHA256, the exact final hash is recorded in the companion report distributed alongside the ZIP after packaging.

## Device checks recommended

1. Open Profile → Customise and confirm the four default LuckyDex sleeves are available immediately.
2. Equip two different sleeves in succession and open a pack after each; the pack back should change without needing an app restart.
3. Check a Trade receive animation uses the same globally equipped sleeve.
4. Open All / Locked / a themed category and confirm undiscovered Secret sleeves remain `???` with no leaked art/name.
5. Use a save with prior Kanto/Johto/Hoenn or other qualifying progress and confirm one compact `Previous accomplishments recognised` summary appears rather than repeated toasts.
6. Confirm already-earned sleeve rewards do not add coins/dust/tickets again.
7. Export/import a save with a non-default equipped sleeve and confirm that sleeve remains active.
8. Temporarily test `LuckyDexCosmeticsV0413.devUnlockAll()` from development tools/console if needed; relaunch without persistence and confirm the save was not altered.
