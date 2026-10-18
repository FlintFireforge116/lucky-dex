# LuckyDex v0.22.3 — targeted phone fixes

5 October 2026. Baseline: supplied `LuckyDex_v0.22.2_SOURCE.zip`, SHA-256 `a1ae7ef854bcf00e711df4abb4b887176192fbca5c2ffb9fd6788dc13571041d`. Branch: `fix/v0223-targeted-mobile-fixes`. Release: **0.22.3 / code 223**.

## 1–3. Venue assets, Kalos and Ruins

Seven headers were replaced; the approved Moon Stage is byte-for-byte unchanged. Every asset is packaged locally. Exact source links, crops, hashes and focal points: [venue provenance](V0223_VENUE_SOURCES.md) and `arcade/venues-v0223/manifest.json`.

| Venue | Selected artwork |
|---|---|
| Kalos Amie Garden | Original XY Pokémon-Amie nature menu wallpaper, an unretouched 320×240 crop of the bundled retail background sheet. The renderer supplies the title; the giant Puff/play-menu capture is gone. |
| Goldenrod | Complete HGSS Game Corner building panel, without foreground player/Pokémon Center. |
| Celadon | HGSS Game Corner / Prize Corner building panel, without tutorial arrows. |
| Lilycove | Emerald Contest Hall exterior, replacing ORAS. |
| Moon Stage | Existing `moon_stage_bg3.png`, unchanged. |
| Oreburgh | Museum crop from the authentic DPPt city capture, replacing BDSP. |
| Ruins of Alph | Actual HGSS daytime location-preview panel, 256×160. |
| Indigo | Clean HGSS League building/approach panel. |

World/venue headers use `clamp(200px,40vh,430px)`, a 45vh upper bound and per-image cropping. Tested headers occupy 40% of usable phone height. Enter, indicators and game cards are below the image; titles no longer collide with indicators. There is no blurred filler layer. Routing remains in the existing owner.

## 4. Berry size, hitbox and positions

Old opaque artwork was roughly 32px at 360w. New targets are **75.67px square at 360w**, 82.05px at 393w and 86.23px at 412w; CSS limits are 64–88px. Opaque artwork is approximately **52–63px at 360w**, preserving aspect. Targets exceed the visible artwork and have roughly 10–12px spacing.

Easy berries start 40% down the scene; other modes use 32% and 50% bands. Hard mode is spaced **4+3**. Customers start at 72%, with request bubbles separate from the trunk. Instructions are in normal flow above Start/Restart, not an overlay across the button.

One supported gesture path handles Pointer Events or legacy touch fallback. An 8px threshold distinguishes tap from drag; captured/identifier-tracked gestures use physical release coordinates. Failed/cancelled drops retain visible selection for tap-to-feed. Requester physical pointer-up handles Android compatibility-click suppression, while feeding clears selection to avoid duplicates. Exit, restart, expiry and capture loss release listeners/ghosts. Score, rewards and saved bests are retained. [Measured touch evidence](V0223_BERRY.md).

## 5. Exact Fossil structure

The strip cause was `.dig-cell-v019.empty` inheriting app-wide `.empty { grid-column:1/-1; padding:38px 12px; }`.

The board is **6 columns × 7 rows: 42 independent square buttons**. Explicit automatic grid placement and namespaced states (`fossil-covered/empty/metal/treasure`) prevent row spans. No decorative strip/crack overlay remains. Empty soil is a bounded soil color, metal is a single obstruction plate, and each find uses an intact local fossil icon.

Existing rules remain: **12 digs**, one reveal costs one dig, revealed cells are disabled/inert, contents are predetermined, and all finds or zero digs ends the site. Each fossil occupies one cell. Win/loss payouts are unchanged. Tests cover immutable metal, repeated taps, complete sprites, win/loss/replay and one reward.

## 6. Exact Ball anti-stall fix

The screenshot wedge was reproduced with the unchanged production callback: `(30,491)` against peg `(62,515)` stayed there after 30 simulation seconds. The wall/peg corridor was **52px for a 60px ball**; bottom pegs also crowded divider caps.

Radius stays **30**. Seven staggered rows now use margins **74/122** and `y=105+row*71`: 64px edge clearance, over 65px nearest diagonal clearance, and 69px between the bottom peg edge and divider tops. Divider caps have collision handling.

The existing RAF substep monitors speed below **30px/s for 0.65s**, or less than **4px downward progress for 1.2s**. It chooses a nearby collision-clear continuation 8–80px down/up to 80px sideways and nudges with 55px/s lateral and 45px/s downward velocity. It does not choose a reward slot, award points, add pin bonuses or create a second timer/loop. Aim, board style, three balls, slot/jackpot/payout logic remain unchanged.

**1,320 seeded drops passed**, worst 7.328 simulation seconds; the screenshot state lands in 0.512s. Old-geometry recovery is explicitly exercised without bonus. Independent review tested **423 additional stationary states** near pegs/walls/dividers; all land, worst 5.688s. Native browser RAF cancellation/reentry is tested, with controlled-clock production landing. Host scheduling once delivered 1.72 physics seconds in 15.325 wall seconds; the moving ball was not a deadlock. [Physics evidence and timing limits](V0223_BALL.md).

## 7. Screenshot QA and tests

- **20 active test programs and both offline asset guards pass.** Real touch/drag, fallback, cancellation, multitouch, gesture disposal, grid geometry, immutable reveals, bounded physics, save/import/legacy progress and restored games are covered. Uncaught production errors fail browser tests.
- Layout covers 360×800, 393×873, 412×915 and reduced usable heights 360×724/720/700. Headers stay within 35–45%; important controls fit without primary-action page scrolling or crossing the simulated phone boundary.
- `artifacts/v0223/qa/` contains all venues, world, Berry, Fossil, Ball and preserved Clefairy/Blender/Tile captures plus four contact sheets. They were visually inspected against the five unmodified Samsung reference captures in `artifacts/v0223/baseline/`.
- Independent review found no critical/important defect. Extra touch probes cover lost capture, restart during capture and expiry during a drag.
- Clefairy owner/scene/style, Blender owner/style, Android Activity/Manifest and Tile functions/recipes/TARGET synchronization are unchanged from v0.22.2. The single-owner architecture is preserved.
- Android assembly and v2 signature pass. VersionCode increases 222→223. All **4,270 packaged source assets** match the working source; **4,229 manifest entries** match APK hashes. Original development signer retained: `069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`.
- Package `com.example.luckydex`, origin `file:///android_asset/index.html`, `luckyDexSave`, migrations and unknown/legacy progress are retained. Signing keys are excluded from source/Git exports.

## 8. Remaining known issues

No known targeted defect remains in tested routes. Physical Samsung installation/update, touch and inset behavior remain unverified: ADB reports no connected device, so actual `adb install -r` save survival could not be tested. Browser evidence and unchanged native code are not presented as hardware validation. Earlier emulator setup was unavailable without a hypervisor driver. Original pixel assets retain native resolution; Kalos uses an authentic menu background with a live title, not a baked location-title panel.

## Deliverables

`artifacts/LuckyDex_source.zip`, `LuckyDex_v0.22.3_SOURCE.zip`, `LuckyDex-v0.22.3-debug.apk`, `LuckyDex_v0.22.3_QA.zip`, `LuckyDex_v0.22.3_SHA256.txt` and `v0223/release-verification.json`. The GitHub workflow was updated for these checks but not dispatched remotely; APK evidence is the local Gradle build.
