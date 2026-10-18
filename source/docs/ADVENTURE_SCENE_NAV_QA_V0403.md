# v0.40.3 scene/navigation QA

The supplied v0.40.2 ZIP is the sole source, SHA-256
`71ab5acca6bf6db74d1b984c4b68dc26a083529cb1d6f51a1553b36965c559e2`.
The root baseline inventory passed 47/47 focused programs before production edits.
The new immutable pin records all 7,110 original files. The v0.40.3 preservation
checker verifies the pin against the original archive on every invocation,
requires exact individually approved changed paths, permits only intended release
markers, and always requires exact regional-engine bytes.

## Baseline visual gate

`scripts/adventure-scene-nav-baseline-v0403.cjs` generated 20 fresh offline Chrome
screenshots: all ten required places at 320×568 and 412×915. The QA agent manually
inspected `artifacts/v0403/baseline/contact-sheet.jpg`; full geometry and semantic
records are in `baseline.json`. These presentation fixtures select existing
authored nodes and waypoints; they never simulate a first-badge win.

At 412×915, ordinary town/route scenes were 396×588.4, Sprout Tower and Violet
Gym 396×637.4, and Violet City 396×539.4. At 320×568 the same scenes were 308 wide
and 212.4–310.4 high. All scenes expanded independently of their original
384×160 image. The tall captures showed large repeated grass/floor regions.
New Bark, Pallet and Azalea shared the same two-house composition. Route 124's
yellow striped dock was visible at both sizes. Violet City and Azalea each had a
local Gym action plus a duplicate footer destination. Objective strips exposed
encounter gating and no player avatar appeared. Baseline overflow was zero.

## RED evidence

Before renderer/art implementation, the six new browser cases all failed for
the intended missing behavior:

- Tall New Bark scene height 588.4 exceeded its 4:3 cap 304.
- Native images had aspect 2.4 instead of 4:3.
- New Bark had no player avatar.
- Violet City exposed one duplicate footer Gym control instead of zero.
- Place profiles lacked a concise objective.
- Violet Gym lacked a Leave Gym action.

The real first-Gym/Route32 acceptance case also ran RED against the old 2.4
native image. Its normal chapter driver reuses the v0.40.2 PP-bearing battle
chooser. It cannot inject battle victories, rewards, checkpoint recovery or node
selection. Regional spot checks use existing-node presentation fixtures separately.

A later preservation audit noticed that concise objective copy had removed the
accepted waypoint count. A seventh browser case ran RED with a missing compact
header counter (`0 !== 1`), then the renderer restored `data-place-progress` in
the region header. The case checks Route30 `1/3`, actual travel to Route31 `2/3`
and serialized reload at `2/3`, while the objective remains world-facing.

## Verification interfaces

`data-place-scene` is the actual scene image. `data-place-avatar` identifies the
static player overlay. The profile owns `objective` and `nextId`; local
destination actions own `destinationId`; a visible travel footer exposes
`data-destination-id`. The new tests examine rendered bounds, loaded native image
dimensions, pane/document overflow, world-facing copy, local/footer destination
uniqueness and non-rewarding Gym→City behavior.

The 412×915 proportion check uses usable height after the header and footer.
Native 4:3 scenes may shrink on short phones; they must remain at least 100px
high, keep readable avatars, preserve complete scene bounds and require no scroll.
Gym preparation, battle and badge results omit the map player overlay.

## Accepted v0.40.2 test adaptations

The existing first-Gym driver now chooses an available local Gym action before
looking for a footer. This follows the required duplicate-control removal while
preserving its real battle turns, party synchronization, tools, healing, reload,
exact chapter path and badge checks. The strict Pewter Gym local-action assertion
adds only `leave-gym`; it still requires the challenge and excludes town services.
The old menu geometry check reproduced its obsolete full-width failure
(`painted=0.9247`, minimum 0.95). Its replacement checks that the complete painted
image fits the bounded frame and remains at least 150×90 pixels; the original
maximum 48px action/tool gap and all original menu/tool assertions remain.
The original accepted Battle, Party, picker, Moves/TM and Mart checks are retained.

`scripts/adventure-scene-nav-preserved-ui-v0403.cjs` copies the existing preserved
UI capture checks with only its evidence output moved to the v0.40.3 directory.
It passed all five viewport sizes: Party, custom picker, Moves, TM Case, Mart,
purchase confirmation and compact FIGHT. No transactions are committed in this
visual fixture.

## Final run commands

```text
node --test tests/adventure-scene-nav-browser-v0403.test.cjs tests/adventure-scene-nav-chapter-v0403.test.cjs
node scripts/adventure-scene-nav-acceptance-v0403.cjs
node scripts/adventure-scene-nav-preserved-ui-v0403.cjs
python scripts/adventure-scene-nav-preservation-v0403.py --allow-file tests/adventure-scene-nav-approved-edits-v0403.json --output artifacts/v0403/source-preservation.json
```

## Final browser and visual result

The initial six browser cases and real chapter case passed against the delivered
native assets and renderer (`artifacts/v0403/scene-nav-browser-tests.log`, 53.6
seconds). After restoring header progress, all seven browser cases passed again
(`header-progress-green.log`, 58.4 seconds), with zero failures. The
geometry test inspected ten required places at all five sizes. Every pane and
document stayed within its viewport, loaded native images were 384×288, and
normal scenes included a fully bounded legible player. Gym preparation, battle
and badge results omitted the scene avatar.

The complete ordinary UI chapter passed independently at 320×568, 360×640,
360×780, 412×915 and 768×1024. Final runs used 25, 20, 17, 21 and 21 actual PP-bearing
battle actions respectively. Each reached the dedicated Falkner badge result,
preserved it through reload, advanced to Route32 and preserved that place through
reload. Each also verified a real Gym→City→Gym excursion without advancement,
healing, claim, currency or inventory changes. Eight regional spot checks passed
per size: Pallet, Route1, Viridian, Route101, Route124, Petalburg, Azalea and Union
Cave. `acceptance.json` contains 16 chapter captures plus eight spot records per
viewport, **120 actual screenshots** total.

The QA agent manually inspected all five original UI galleries (75 chosen place views),
the detailed 412 scene gallery and actual short/tall badge results. Authored New
Bark's asymmetric T-junction, Pallet's central road/fence/water and Azalea's
treehouse/civic layout are distinct. Player sprites stand on paths, interior
floor or the Route124 beach, clear of landmarks. Route124 has an intentional
native coast bend and complete water rocks with no striped bridge/dock. No new
stretching, seams, clipped sprites, repeated filler bands or awkward overlays
were observed. Text and action hierarchy remain readable at 320×568.

At 412×915 the native scene is 396×297: 43.8% of usable content height with a
footer, 40.2% without. Player size is 32.3 pixels. At tablet size the frame is
576×360 with a centered 472-pixel-wide 4:3 native window and 39.3-pixel player.
The 800-pixel journey card leaves a plain dark mat below it on tall phones and
tablets; spare menu space is plain background rather than stretched scene art.
This was visually coherent and raised no actionable issue.

Gallery creation is reproducible with
`scripts/adventure-scene-nav-contact-sheets-v0403.py`; review images are under
`artifacts/v0403/acceptance/*-ui-gallery.jpg` and `*-scene-gallery.png`. All five
chapter/spot runs and the galleries were regenerated after the final coastal
rock crop correction and again after the final compact header counter. The final
galleries include Route30 and Route31, expanding to 85 chosen place views. The
corrected 412 scene gallery and 360 Route124 capture were re-inspected; both
retain complete isolated rocks and safe beach placement. Full 320/412/768 Route
30/31 screenshots and the 360×780 Tower were inspected after the header update:
counts are legible on one line, with unchanged scene/header geometry. The final
`header-progress-matrix.json` records `1/3`, reloaded `1/3`, `2/3` and `3/3` at
all five sizes, with zero overflow. The separate browser regression verifies
Route31 reload at `2/3`.

Final visual review corrected intermediate Route30/31 objectives from `Trainer
battle` to `Follow the path`: the required trainer is at Sprout Tower. The root
flow regression ran RED→GREEN before this copy-only fix. QA now explicitly
asserts `Follow the path` on both route waypoints and `Trainer battle` at the
Tower in the rendered scene helper; the browser counter case also verifies the
route copy before/after travel and reload. All 120 screenshots, ten galleries
and the header matrix were regenerated after this final objective correction.
Actual 320 Route30, 412 Route31 and 360×780 Tower screenshots were re-inspected;
the copy is truthful, concise and legible, with unchanged progress and geometry.

The preservation checker passed against the explicit 55-path approval list:
7,056 original files exact, 49 approved original edits, five narrowly normalized
release-marker files, no failures and byte-exact regional engine. The list includes
all 40 native PNG paths individually (six are new), only the documented fixture
adaptations, scene reconstruction tests, root presentation files, original scene
builder/catalog/manifest/contact sheet, README and two historical release checks.
The root reruns preservation after its final README/report/build work.
Chrome QA does not replace physical Android WebView testing.
