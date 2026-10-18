# LuckyDex v0.42.3 — Target Range correction

Verified 2026-10-15. Sole source: supplied LuckyDex_source_v0.42.2.zip,
SHA-256 b593fbd478b0bfdd8f70015ee4e2954251e8895b7f9295c79a2b6304e0f1a38c.
No older workspace code was imported. New source lives in LuckyDex-v0423.

## Delivered behavior

- Portrait range fills available height. Pokémon stands low in the foreground,
  firing upward toward progressively smaller/higher targets. Horizon, ground,
  quiet lane, physical target stand/shadow and receding markers establish depth.
- Existing offline type props decorate only the sides; no Dash course panorama.
  All 18 attack silhouette/effect rules remain unchanged, including Mud Bomb and
  Psybeam. No external/CDN runtime dependency was added.
- Distance drives target size/position, 650–1330 ms flight across 10–50 m, drop
  and drift. Smooth arcing flight launches from the rendered Pokémon and ends
  at the exact solved scoring impact. Portrait hit testing measures physical
  pixel distance rather than stretching the round rings into an ellipse.
- Hold charge continuously rises/falls, with a visible ideal release band.
  Easy/Rookie rises in 1600 ms with a forgiving 76–100% window; Master rises in
  1120–1200 ms with a 90–100% window. Release quality changes stability, sway,
  trajectory reliability and clean-hit power; Sp. Atk retains diminishing assist.
- Gentle motion takes 6.5–10 seconds per cycle, with smaller displacement. Targets
  do not time out while aiming. Recovery/feedback lasts 1200 ms. Gold remains
  a four-ring bullseye target with gold trim/centre; only its bullseye wins a prize.
- Hold/drag on the pad or scene. Each target starts from a fixed low neutral aim,
  independent of target/stat/wind. This lets a precise upward thumb stroke reach
  every target without automatic aiming. Cancelling a gesture never fires.
- Flight frames/timers are owned by the current round; close/restart invalidates
  old work. Reopening rebinds exactly one shared input path.

The renderer/CSS were refactored in place. Goldenrod framework, six-entrant
standings, Exhibition/Division/Type Cups, eligibility, progression/trophies,
record/achievement schemas, rare one-time settlement and other games were not
redesigned. Preservation checks verify their source bytes.

## TDD and review

Before implementation, new tests reproduced the banner, capped focus, insufficient
depth, old fast motion, aspect-dependent scoring, wrong launch origin and stale
flight callbacks affecting a newly opened run. Golden bullseye and visual-path
endpoint preservation checks were green on baseline.

A focused read-only review found insufficient downward thumb travel from the
bottom pad after increasing gallery height. A real-pointer regression reproduced
that failure before the fix. Fixed low neutral aim plus shared gallery input
preserves precision. Real pointer input now bullseyes both 10 m and 50 m targets
on 360×640, 360×780 and 412×915. The same reviewer independently reran those two
new regressions and confirmed the sole Important issue resolved.

Review scope decisions: inherited pause-during-flight timing and the unchanged
asynchronous reward-completion path were not redesigned; no new defect was
established there. Existing stat tolerance outside exact painted ring boundaries
is intentional assist, not a new scoring bonus. Browser coordinate assertions are
supplemented by actual pointer bullseyes, but are not a physical-device pixel audit.

## Exact commands and results

Use Node and Playwright from the available local development runtime. On this
machine Chrome was explicitly selected at:
C:/Program Files/Google/Chrome/Application/chrome.exe.
NODE_PATH points to the bundled development node_modules, not a runtime CDN.

| Verification | Result |
| --- | --- |
| node scripts/target-range-verification.cjs baseline | Untouched input: 62/67 programs pass, 5 inherited failures |
| node scripts/target-range-verification.cjs verified | Final: **66/70 programs pass**, 4 inherited failures below |
| All Target Range programs within verified inventory | **12/12 programs, 64/64 tests pass** |
| New v0423 Target Range tests | **3 programs, 15/15 tests pass** (7 core, 7 browser, 1 release) |
| node scripts/target-range-visual-qa.cjs | **72 offline captures pass**, five viewports, all 18 type scenes |
| python scripts/target-range-contact-sheets.py | Three contact sheets generated and inspected |
| node scripts/verify-adventure3-source.cjs | **576 JavaScript sources parse** |
| python scripts/verify-target-range-scope.py | **6,103 protected app files byte-identical**, three release-only files narrowly normalized |
| node --require ./scripts/test-browser-runtime.cjs scripts/run-tests.cjs | Normal npm-test entry point: 11 programs pass, stops at unrelated Adventure fixture |

The normal repository runner was actually executed. It stops at
adventure-location-browser-v0402.test.cjs: 6/8 tests pass, with the two failures
“starting town ... separate unique tool strip” and “first-Gym chapter ... real
PP-bearing battle moves” both expecting a Map tool absent from the current
baseline UI. That Adventure source was not changed. This is not a claim that
the entire historical repository suite passes or that all later programs ran.

Focused failing-first commands included node --test on the three new files,
and --test-name-pattern on “ordinary bottom” and “gallery also” before their
fixes. Final raw stdout/status for every scoped program is retained in
artifacts/v0423/verified-tests.json; the untouched comparison is baseline-tests.json.
Intermediate inventories are retained transparently, not presented as final green.

## Inherited scoped failures

The four final failing programs also failed before any production edits:

- v0340-dash-previews.test.cjs: historical preview hash versus seeded section.
- v0340-dash-repeated-races.test.cjs: old data-venue-game=dash navigation fixture.
- v0340-dash-viewport.test.cjs: the same obsolete Dash navigation fixture.
- v0390-arcade-records-browser.test.cjs: historical records hub game-count fixture.

The fifth baseline failure, v0421-target-range-release.test.cjs, required the
retired 0.42.1 marker even on supplied 0.42.2. Historical Target Range and adjacent
Power/Impact release checks now validate coherent current metadata, while the new
release regression explicitly requires 0.42.3/4203. Their gameplay assertions
were retained. Obsolete banner/capped-focus/Dash-panorama source regexes were
replaced with live browser/behavior checks for the approved new brief.

## Visual and offline acceptance

Checked 320×568, 360×640, 360×780, 412×915 and 768×1024. Gallery is portrait,
document/horizontal/pane overflow is at most 1 rounding pixel, shooter centre is
below 84% of the playfield, and the input pad clears the viewport bottom by at
least 12 px plus safe-area treatment. No required active-play scrolling.

At every viewport, 10/50 m captures verify visibly different target size/depth.
At 360×780, all 18 type themes are captured at both distances. Gold, ideal hold,
Psybeam flight and impact feedback are captured separately. Full-size examples
and all three contact sheets were visually inspected. The final QA run occurred
after the thumb-reach fix and gold-label cleanup.

All browser contexts used the actual full file:// app with offline:true, not
mocked game renderers. Pokémon/scenery art is bundled. Source preservation also
verifies all 18 projectile CSS rule sets and the reward/record/finish section
unchanged from the ZIP. No art download or runtime dependency was introduced.

## Changed files

Gameplay: app/src/main/assets/arcade-target-range-core.js,
arcade-target-range.js and arcade-target-range.css only.

Release-only: app/build.gradle (0.42.3/4203 and asset-builder User-Agent),
app/src/main/assets/index.html, app-v0167.js, package.json and package-lock.json.
Android applicationId stays com.example.luckydex; supplied development keystore
bytes are unchanged.

Tests: v0420 focus contract; v0421 polish/release; v0422 landscape/release;
adjacent v0431/v0433/v0434/v0435 Power and v0436/v0437/v0438/v0439 Impact release
metadata assertions. New v0423 core/browser/release tests and a shared metadata
helper. No adjacent gameplay test was disabled to hide a failure.

Support: README, approved brief and short note under docs/, scoped inventory,
browser fixture, visual/contact-sheet, source-preservation and packaging scripts.
The complete exact changed/new filename manifest is
artifacts/v0423/source-preservation.json.

## Source package and limitations

LuckyDex_source_v0.42.3.zip is generated by
python scripts/package-target-range-v0423.py. The packager checks CRC, every
archive/source byte and every fresh-extracted byte, and emits the adjacent .sha256
and package-verification JSON. It excludes builds, dependencies, SDK properties,
old artifacts, QA extraction trees and APK binaries. A fresh extracted tree is
used for final syntax, preservation, release and Target Range regression checks.

This is the requested source-only output. No APK build or physical Android/
WebView execution was performed in this pass. Device FPS, native gesture
navigation, accessibility text scaling and OEM rendering remain unverified.
Browser layout evidence does not replace testing on the user's handset.
No push, merge or external publication was performed.

## Scoped program inventory

Each row is one independently executed program from verified-tests.json.

| Program | Result |
| --- | --- |
| arcade-dash-assets.test.cjs | PASS |
| arcade-dash-browser.test.cjs | PASS |
| arcade-dash-config.test.cjs | PASS |
| arcade-dash-course-assets.test.cjs | PASS |
| arcade-dash-course-sections.test.cjs | PASS |
| arcade-dash-course.test.cjs | PASS |
| arcade-dash-gen3-assets.test.cjs | PASS |
| arcade-dash-integration.test.cjs | PASS |
| arcade-dash-league-integration.test.cjs | PASS |
| arcade-dash-league.test.cjs | PASS |
| arcade-dash-polish.test.cjs | PASS |
| arcade-dash-render-contract.test.cjs | PASS |
| arcade-dash-ui.test.cjs | PASS |
| arcade-dash-v033-finish.test.cjs | PASS |
| arcade-dash-v033-ui-contract.test.cjs | PASS |
| arcade-dash.test.cjs | PASS |
| v0340-dash-cache.test.cjs | PASS |
| v0340-dash-footprints.test.cjs | PASS |
| v0340-dash-previews.test.cjs | FAIL — inherited |
| v0340-dash-renderer.test.cjs | PASS |
| v0340-dash-repeated-races.test.cjs | FAIL — inherited |
| v0340-dash-scenery-bounds.test.cjs | PASS |
| v0340-dash-steering.test.cjs | PASS |
| v0340-dash-viewport.test.cjs | FAIL — inherited |
| v0341-bugfix-achievements.test.cjs | PASS |
| v0343-dash-course-identity.test.cjs | PASS |
| v0343-dash-gameplay.test.cjs | PASS |
| v03511-ekans-achievements.test.cjs | PASS |
| v0360-dig-state-achievements.test.cjs | PASS |
| v0370-magikarp-state-achievements.test.cjs | PASS |
| v0371-kids-club-achievements.test.cjs | PASS |
| v0380-rock-harden-state-achievements.test.cjs | PASS |
| v0390-arcade-records-browser.test.cjs | FAIL — inherited |
| v0390-arcade-records-core.test.cjs | PASS |
| v0390-arcade-records-registry.test.cjs | PASS |
| v0390-arcade-records-state.test.cjs | PASS |
| v0390-arcade-records-ui.test.cjs | PASS |
| v0406-rare-rewards.test.cjs | PASS |
| v0408-reward-reveal.test.cjs | PASS |
| v0410-dash-goldenrod.test.cjs | PASS |
| v0410-goldenrod-adapters.test.cjs | PASS |
| v0410-goldenrod-core.test.cjs | PASS |
| v0410-goldenrod-integration.test.cjs | PASS |
| v0410-goldenrod-settlement.test.cjs | PASS |
| v0410-goldenrod-state.test.cjs | PASS |
| v0410-goldenrod-ui.test.cjs | PASS |
| v0410-impact-tournament.test.cjs | PASS |
| v0410-power-tournament.test.cjs | PASS |
| v0413-achievements.test.cjs | PASS |
| v0420-target-range-adapter.test.cjs | PASS |
| v0420-target-range-core.test.cjs | PASS |
| v0420-target-range-progression.test.cjs | PASS |
| v0420-target-range-tournament.test.cjs | PASS |
| v0420-target-range-ui.test.cjs | PASS |
| v0421-snore-war-endless-achievements.test.cjs | PASS |
| v0421-target-range-polish.test.cjs | PASS |
| v0421-target-range-release.test.cjs | PASS |
| v0422-target-range-landscape.test.cjs | PASS |
| v0422-target-range-release.test.cjs | PASS |
| v0423-target-range-browser.test.cjs | PASS |
| v0423-target-range-core.test.cjs | PASS |
| v0423-target-range-release.test.cjs | PASS |
| v0431-power-trial.test.cjs | PASS |
| v0433-power-trial-ui.test.cjs | PASS |
| v0434-power-trial-polish.test.cjs | PASS |
| v0435-power-trial-dome.test.cjs | PASS |
| v0436-impact-trial.test.cjs | PASS |
| v0437-impact-harden.test.cjs | PASS |
| v0438-impact-harden-tuning.test.cjs | PASS |
| v0439-impact-input-polish.test.cjs | PASS |
