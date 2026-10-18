# v0.22.3 Berry Picker phone repair

## Scope and causes

The provided phone image (`artifacts/v0223/baseline/phone-berry.jpg`) showed tiny berries along the top edge, a request bubble centered on the trunk, and instruction text covering Start. The old stylesheet positioned the instruction absolutely and used 14% berry boxes (about 48px at 360px). Local item PNGs include transparent margins, reducing the actual visible berries to about 32–35px.

The old touch handler prevented default on touchstart/touchend, selected a berry without updating the highlight, and depended on compatibility clicks for tap feeding. General Arcade button CSS also overrode the berry's `touch-action:none`, allowing the browser to cancel native drags. The fix remains in the existing Amie owner; Tile Puzzle composition, recipes, state, and save format are unchanged.

## Composition and sizes

The same central tree backdrop and local aspect-preserving berry sprites remain. Berry hitboxes are square, 22% of scene width, with a 64px minimum and 88px maximum. The PNG sheet is displayed at 120% of the inner target to compensate for its transparent margins; its opaque berry remains smaller than its hitbox. At 360px phone width the targets measure 75.67px, the sheet box 86px, and actual opaque berries measure 51.6–60.2px wide and 54.47–63.07px tall. Razz is 57.33px square, about 79% larger than its former approximately 32px appearance.

Easy uses three targets at 40% of scene height. Normal/unlimited use a three-plus-two arrangement at 32% and 50%. Hard uses four-plus-three at those same two heights. All targets have at least a 10px horizontal gap on the smallest tested phone, with separated rows. Pokémon occupy the bottom 27% of the scene, beginning at 72%; request bubbles sit at each requester's right side, away from its centered sprite and the central trunk. The helper has a dedicated normal-flow grid row above Start/Restart.

Ready hard-mode measurements (CSS pixels):

| Viewport | Scene height | Target side | First / second band y | Target gap | Start bottom |
|---|---:|---:|---:|---:|---:|
| 360×800 | 554.50 | 75.67 | 338.44 / 438.25 | 10.33 | 788 |
| 393×873 | 619.50 | 82.05 | 363.23 / 474.75 | 11.20 | 857 |
| 412×915 | 661.50 | 86.23 | 376.67 / 495.75 | 11.77 | 899 |
| 360×724 usable area | 502.75 | 75.67 | 306.88 / 397.38 | 10.33 | 712 |

The running helper can wrap to two lines; the scene flexes to keep Restart fully inside the available viewport.

## Input behavior

- Engines with PointerEvent use one pointer path for mouse, pen, and touch. Older engines receive the existing touch fallback exclusively, avoiding duplicate gestures.
- Pointerdown/touchstart immediately selects and highlights the berry with a pale border, background, glow, and `aria-pressed`. Ordinary taps are not prevented.
- Motion beyond 8px starts the drag ghost. Only drag movement/release prevents default. Document tracking plus pointer capture allows movement outside the berry; physical release coordinates identify the Pokémon rather than the captured event target.
- A drag-created compatibility click cannot reselect a successfully delivered berry. Tap feeding also accepts physical touch/pen pointerup (or touchend in fallback), because Chromium/WebView can suppress a click immediately following a failed drag. Delivery clears selection, so a later click cannot score twice.
- Failed drops, pointercancel/touchcancel, and lost capture retain the highlighted selection for tap-to-feed recovery. Cleanup removes the ghost, tracking listeners, and capture; closing/restarting disposes run timers. A second finger cannot replace the active berry gesture.

Scoring, patience, misses, three-miss unlimited mode, rewards, best scores, and persisted fields remain unchanged.

## Evidence

`tests/v0223-berry-touch.test.cjs` initially failed against v0.22.2 with a sub-56px touch target. It now uses the complete app with actual touchscreen taps and CDP native touch motion/cancellation/multitouch at 360×800, 393×873, 412×915, and a 360×724 usable viewport. It tests every mode's geometry and opaque-pixel sizes; native tap/tap-target and drag; immediate tap-target recovery after failed drop/cancel; two fingers; exit while holding a drag; clean reentry; and zero remaining run intervals, timeouts, or gesture listeners. A further 360×800 run disables PointerEvent to exercise the real native touch fallback.

`tests/amie-recovery.test.cjs` verifies pointer cancellation/lost capture, tile swaps and solved-state persistence, completed-run rewards and best-score preservation, and resource cleanup. Its fixture now includes the actual shared game CSS and measures Berry while visible; it moves beyond the drag threshold before asserting a ghost. The old unlimited-miss fixture now selects the wrong berry before each feed, matching the existing selection-clearing behavior.

Both owned tests passed after the final implementation. Parent release QA runs the entire suite.

Geometry evidence: `artifacts/v0223/berry/layout-touch-results.json`.

Visually inspected active hard-mode screenshots: `artifacts/v0223/berry/360x800-hard.png`, `393x873-hard.png`, `412x915-hard.png`, and `360x724-hard.png`; legacy fallback screenshot: `360x800-fallback-hard.png`.

Browser phone emulation is verified; a physical Samsung Android/WebView run remains a device acceptance check. No Berry-specific visual or behavior failures remain in the verified browser runs.
