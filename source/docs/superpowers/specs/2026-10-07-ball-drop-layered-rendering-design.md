# Ball Drop Layered Rendering Design

**Version target:** LuckyDex v0.27.5

## Goal

Refactor Poké Ball Drop so visual updates redraw only the element that changed instead of clearing and repainting the entire machine, while preserving the exact v0.27.4 board composition as the visual template. The prize wells must become the physical bottom of the board rather than looking like a strip laid over it.

## User-facing outcome

The machine should look like the existing v0.27.4 board, not a newly guessed layout. The current 11-row geometry, aiming rail, pin coordinates, power-up coordinates, special-pin positions, seven prize positions, ball sizes, physics, reward odds, persistence rules, event log, reward reveals, and neon visual language remain unchanged unless a layer boundary requires a purely structural rendering change.

The seven reward wells are integrated into the board frame: the pin field ends naturally into seven chutes/wells, the dividers and floor are part of the machine's static backboard, and reward contents sit inside those wells. There is no separate-looking reward strip floating over the bottom.

## Authoritative template

v0.27.4 is the source of truth for placement. Existing coordinates in `arcade-ball-drop.js` and the current screenshot-approved composition are retained. The refactor splits that composition into layers; it does not redesign it.

No layer may independently invent a different coordinate system. Every canvas uses the same intrinsic `720 x 1004` coordinate space and is stacked pixel-for-pixel in one `.ball-drop-machine` container. CSS scaling applies to the container as a whole.

## Rendering architecture

The current single `#ballDropCanvas` is replaced by independent stacked canvases/DOM overlays, all aligned to the same board rectangle.

1. **Backboard canvas** (`ballDropBackboardCanvas`)
   - Static gradient, neon cabinet/frame, gold inner line, legend panel, aim rail, chute walls, seven integrated prize wells, bottom/floor geometry.
   - Drawn on run start/open and resize/reinitialization only.
   - Does not redraw for animation, aiming, prize changes, power-up collection, or card/booster image loading.

2. **Pins canvas** (`ballDropPinsCanvas`)
   - Normal pins and special move pins.
   - Normal pins remain static.
   - Special-pin hit glow may redraw this layer when a hit effect starts/ends; it must not cause other layers to repaint.

3. **Prize canvas** (`ballDropPrizeCanvas`)
   - Reward content inside the seven backboard wells: coin values, Mystery, Card artwork, Booster artwork, and settled-slot highlight if retained.
   - Initial full prize render once the run board exists.
   - When a slot is won/refreshed or asynchronously hydrated, redraw only the affected slot region, not the entire canvas.
   - Untouched prize slots remain visually unchanged.

4. **Power-up canvas** (`ballDropPowerupCanvas`)
   - Mid-board power-up icons only.
   - Drawn at run start.
   - Collecting one clears/redraws only that pickup's bounding region.
   - Other power-ups remain untouched.

5. **Ball canvas** (`ballDropBallCanvas`)
   - Aim Poké Ball, active main ball, and Poké Ball Rain balls.
   - This is the only canvas cleared/redrawn continuously during physics animation.
   - Pointer aiming is wired to this canvas/container and updates only the ball canvas.

6. **Effects canvas** (`ballDropEffectsCanvas`)
   - Temporary warp/bounce/speed/web/metronome visual effects and optional impact flashes/trails.
   - Independently cleared/redrawn for effect lifetime.
   - Initial v0.27.5 scope may keep effects minimal, but the layer must exist so future effects never force a board repaint.

7. **DOM UI overlays**
   - Existing event log above the board remains DOM.
   - Toast stack and landing/winnings overlay remain DOM.
   - They do not trigger any canvas repaint.

## Coordinate and hit-testing contract

Physics continues to operate in the existing 720×1004 board coordinate space. All pin, slot, power-up, ball, floor, and chute coordinates remain sourced from `BOARD_CONFIG` and the same model objects used in v0.27.4.

Pointer aiming converts screen X to board X using the stacked board/container bounding rectangle. The user can continue tapping/dragging across the launch area. Layering must not intercept aiming unexpectedly; decorative canvases use `pointer-events:none`, while the designated interaction surface receives pointer events.

## Prize-well integration

The static backboard owns the seven wells and their dividers. `slotTop` remains the top entrance to the prize area and `floorY` remains the ball-settle/floor reference unless tests demonstrate a coordinate mismatch. The prize canvas draws only the reward content inside each existing well; it does not paint an opaque slot background that hides the backboard.

Card/Booster artwork is clipped/contained inside its well. Coin and Mystery labels use transparent backgrounds over the built-in well treatment. Winning a prize may flash/highlight that well on the prize/effects layer, but must not redraw the backboard.

## State/update rules

- `prepareTurn()` must never trigger a whole-machine redraw.
- `setAimX()`/pointer movement updates the aim ball only.
- Physics frames update the ball canvas and any active effects only.
- Collecting a power-up updates that pickup region and any model/UI consequences only.
- Special-pin activation updates the pins/effects layers only.
- Card/Booster art load completion updates the specific prize slot only.
- Winning/refilling a prize updates the specific slot only.
- Event log/toasts/landing updates stay DOM-only.
- Starting/replaying a run may perform full initialization renders for all layers.

## Asset strategy

This refactor does not require new external artwork. The existing v0.27.4 canvas-rendered visuals are the template. The implementation decomposes those drawing responsibilities into separate assets/layers in code, reusing the existing Poké Ball sprite and Card/Booster art URLs.

Where useful, a static backboard render may be cached in its own canvas after first draw. Do not rasterize the whole current board into one PNG, because prize wells, pins, and future theme changes need independent ownership. The goal is separable render assets, not merely a screenshot underlay.

## Compatibility and release constraints

- Release as LuckyDex `v0.27.5`, Android `versionCode 275`.
- Preserve application ID, signing configuration, save schema, and installed-app upgrade path.
- Preserve v0.27.4 gameplay/RNG behavior and 11-row physics geometry.
- Existing public Ball Drop API aliases remain compatible; add `LuckyDexBallDropV0275`.
- No new runtime dependency.
- Card/booster persistence and end-of-game card reveal behavior from v0.27.4 must remain unchanged.

## Testing requirements

Add regression coverage that proves:

- The board is composed of the required independent layers with identical intrinsic dimensions.
- Static backboard draw is not called by aim movement, ball animation frame, power-up collection, prize hydration, or single-slot refresh.
- Prize refresh/hydration redraws only the target slot.
- Collecting one power-up does not redraw pins/backboard/prizes.
- Ball animation clears only the ball layer (plus effect layer when needed).
- Pointer aiming still maps correctly after layered canvases are introduced.
- Prize wells are owned by the backboard and prize drawing no longer paints the old opaque strip underlay.
- All v0.27.4 reward persistence/card reveal tests continue to pass.
- Physics anti-stall and asset integrity checks remain green.

## Non-goals

- No rebalance of reward odds.
- No change to number/type of power-ups or special pins.
- No redesign of the approved neon theme.
- No new board dimensions, row count, ball sizes, pin coordinates, or physics tuning.
- No broader Arcade rendering rewrite beyond Poké Ball Drop.
