# LuckyDex v0.36.1 — Dig! Dig! Dig! polish report

## Scope

This patch is a bounded follow-up to v0.36.0. It keeps the Stadium-style rules, 80-dig distance, rewards, persistence, Kids Club routing, Easy/Normal balance and no-rubber-banding rule intact while making Hard substantially more competitive and improving the Gen III race feedback.

Release identity:

- `versionName 0.36.1`
- `versionCode 3601`
- `applicationId com.example.luckydex` unchanged

## Gameplay tuning

Hard COM profile changed from `120–185 ms` base intervals to `90–130 ms`, with jitter reduced to `10 ms`, error chance reduced to `2%`, and hesitation chance reduced to `3%` (`35–75 ms`). CPU timing remains generated independently of player position/progress; no rubber-banding or catch-up logic was introduced.

A deterministic 300-seed benchmark across three COM racers per seed produced these CPU finish-time distributions:

- Easy: p10 `20.92 s`, median `22.84 s`, p90 `26.63 s`
- Normal: p10 `14.73 s`, median `16.08 s`, p90 `19.09 s`
- Hard: p10 `8.01 s`, median `8.61 s`, p90 `10.26 s`

This deliberately makes Hard a large jump while leaving the two lower modes recognisable.

## Presentation polish

- Every racer now gets a short visible left/right dig pose based on its most recent accepted input.
- Dirt particles appear only during the short dig pulse instead of remaining latched on after the first player input.
- Shaft depth movement is step-smoothed and includes subtle depth markers plus a compact progress strip.
- The required next control is highlighted directly on L/R as well as in the central NEXT panel.
- Button presses receive a short physical down-state.
- The finish water now uses the bundled Gen III `shore-water.png` tile with a stepped animation.
- Finished Sandshrew receive a short pixel-style pop at breakthrough.
- Native Sandshrew proportions remain 35×39 on phone and exact integer 2× (70×78) on the large layout.

## Changed production/release files

- `app/src/main/assets/arcade-dig-dig-dig-core.js`
- `app/src/main/assets/arcade-dig-dig-dig.js`
- `app/src/main/assets/arcade-dig-dig-dig.css`
- `app/src/main/assets/arcade/kids-club/SOURCES.md`
- `app/src/main/assets/index.html`
- `app/src/main/assets/app-v0167.js`
- `app/build.gradle`
- `package.json`
- `package-lock.json`
- `README.md`

Historical v0.36.0 tests were made forward-compatible where they had intentionally frozen the previous Hard cadence, previous flat-water asset, or exact `0.36.0` release marker. Their behavioural/fairness/integration guarantees remain active.

New tests:

- `tests/v0361-dig-polish.test.cjs`
- `tests/v0361-release.test.cjs`

## Verification

### Focused Dig/release checks

PASS:

- `tests/v0360-dig-core.test.cjs`
- `tests/v0360-dig-integration.test.cjs`
- `tests/v0360-dig-presentation.test.cjs`
- `tests/v0360-dig-lifecycle.test.cjs`
- `tests/v0360-release.test.cjs`
- `tests/v0361-dig-polish.test.cjs`
- `tests/v0361-release.test.cjs`

Both modified Dig JavaScript files also pass `node --check`.

### Wider non-browser regression pass

`240/240` test programs that do not import the Playwright/recovery browser harness passed. `28` browser-dependent programs were excluded from that pass because this extracted source workspace has no installed Playwright module.

A direct `npm test` was also attempted. It progressed through the preceding tests and then stopped at `adventure-core.test.cjs` because `scripts/recovery-browser.cjs` could not resolve the missing `playwright` package. This is an environment/dependency limitation rather than a LuckyDex assertion failure; a full browser-backed suite is **not claimed as passed**.

### Offline asset integrity

PASS:

- `python3 scripts/fetch_arcade_v0200_assets.py --check`
- `python3 scripts/verify_v0223_venues.py`
- `python3 scripts/verify_adventure_assets.py`
- `python3 scripts/verify_fossil_museum_v0250_assets.py`

The checks verified all packaged Arcade scenes/sprites/actors, venue assets, Adventure images/data and Fossil Museum assets.

### Android build

Not run: this source distribution does not contain a `gradlew`/`gradlew.bat` wrapper, so an APK build cannot be truthfully verified in this container. Android package identity/version markers are covered by static release tests.

## Review notes

A final source-diff review against the packaged v0.36.0 baseline found no change to Ekans, Kids Club routing, rewards, save-state shape, or the no-rubber-banding CPU architecture. One mobile-compatibility issue found during review — CSS `calc()` division in the new depth strip — was pinned with a failing test and changed to a numeric inherited custom property before release.

Browser/mobile visual QA still needs the normal on-device play-test, particularly for how the faster Hard cadence feels in hand and how the new particle/finish effects read at real phone refresh rates.
