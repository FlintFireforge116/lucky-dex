# Ball Drop Layered Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Poké Ball Drop so the approved v0.27.4/v0.27.5 visual composition is split into independently redrawn layers, with the seven prize wells physically integrated into the static cabinet bottom and no whole-board flash when one element changes.

**Architecture:** Keep the existing `720 x 1004` board model and every approved gameplay coordinate. Replace the single canvas with six pixel-aligned canvases plus the existing DOM overlays; move each existing draw responsibility into one layer-specific renderer and update game events so they invalidate only the layer/region they own. Preserve `draw()` as a compatibility alias for an explicit full initialization render, not as the normal animation/update path.

**Tech Stack:** Vanilla JavaScript, HTML5 Canvas 2D, existing Arcade DOM/CSS, Node regression tests, Android WebView wrapper.

**Spec:** `docs/superpowers/specs/2026-10-07-ball-drop-layered-rendering-design.md`

## Global Constraints

- Release as LuckyDex `v0.27.5`, Android `versionCode 275`.
- Preserve application ID, signing configuration, save schema, and installed-app upgrade path.
- Preserve the v0.27.4 `720 x 1004`, 11-row board geometry, pin coordinates, slot coordinates, power-up coordinates, ball radii, physics, RNG/reward odds, persistent prize rules, and shared end-of-game card reveal behavior.
- Use v0.27.4 as the authoritative visual template; do not re-space/redesign the board by eye.
- All six canvases use intrinsic `width="720" height="1004"` and the same CSS-scaled rectangle.
- No new runtime dependency.
- Existing aliases remain compatible; add `LuckyDexBallDropV0275`.

## Review Focus

- Async Card/Booster image completion must repaint only its current slot and must not repaint a slot that has since been replaced by another reward.
- Multiple simultaneous Rain-ball landings may refresh different prize slots without clearing unrelated prize content or the static machine.
- Special-pin hit effects may animate on the effects layer while the pins/backboard remain unchanged.
- Pointer aiming must remain accurate when the visible interaction surface is a stacked/absolute layer rather than the old single canvas.
- Stop/reopen/replay must cancel animation/effect work and perform a clean one-time layer initialization without stale balls/effects.

---

### Task 1: Introduce the pixel-aligned layer stack without changing placement

**Files:**
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade.css`
- Create: `tests/v0275-ball-drop-layers.test.cjs`

**Interfaces:**
- Consumes: existing `.ball-drop-machine`, `#ballDropToastStack`, `#ballDropLanding`, and `720 x 1004` board contract.
- Produces: canvases `ballDropBackboardCanvas`, `ballDropPinsCanvas`, `ballDropPrizeCanvas`, `ballDropPowerupCanvas`, `ballDropBallCanvas`, `ballDropEffectsCanvas`; interaction surface `ballDropAimSurface`.

- [ ] **Step 1: Write the failing layer-structure test**

Assert that `index.html` contains all six canvas IDs exactly once, each with `width="720" height="1004"`; the old `#ballDropCanvas` is absent; toast/landing DOM remains inside `.ball-drop-machine`; and CSS stacks all canvases with `position:absolute; inset:0; width:100%; height:100%` while preserving the machine's `720/1004` aspect ratio.

- [ ] **Step 2: Run the test and verify RED**

Run: `node tests/v0275-ball-drop-layers.test.cjs`

Expected: FAIL because the page still contains only `#ballDropCanvas`.

- [ ] **Step 3: Replace the one-canvas markup with the approved layer stack**

Keep the same `.ball-drop-machine` location and DOM overlays. Add a dedicated `#ballDropAimSurface` covering the board; decorative canvases use `pointer-events:none`, and only the aim surface handles aiming gestures.

- [ ] **Step 4: Update CSS to stack layers without altering the approved phone footprint**

Preserve `.ball-drop-machine{width:94%; ...}` and `aspect-ratio:720/1004`. Ensure all canvases are aligned to the exact same rectangle and DOM overlays keep their current z-order above canvases.

- [ ] **Step 5: Run the focused test and existing phone-fit/UI guards**

Run: `node tests/v0275-ball-drop-layers.test.cjs && node tests/v0273-ball-drop-fit.test.cjs && node tests/v0272-ball-drop-ui.test.cjs`

Expected: PASS after updating superseded single-canvas assertions in the older UI guard to accept the layer stack while retaining the `720 x 1004`/phone-fit requirements.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/index.html app/src/main/assets/arcade.css tests/v0275-ball-drop-layers.test.cjs tests/v0272-ball-drop-ui.test.cjs
git commit -m "refactor: split Ball Drop board into aligned layers"
```

---

### Task 2: Split the existing v0.27.4 drawing code by ownership and integrate the prize wells into the backboard

**Files:**
- Modify: `app/src/main/assets/arcade-ball-drop.js`
- Modify: `tests/v0275-ball-drop-layers.test.cjs`

**Interfaces:**
- Consumes: Task 1 canvas IDs and existing `BOARD_CONFIG`, `drawPokeball`, `drawSpecialPin`, `drawNormalPin`, `drawPowerup`, `drawPrizeSlot` visual primitives.
- Produces: `renderBackboard()`, `renderPins(now)`, `renderPrizeSlot(slot)`, `renderPrizeBoard()`, `renderPowerups()`, `renderBalls()`, `renderEffects(now)`, `renderAllLayers()`; legacy `draw()` delegates to `renderAllLayers()`.

- [ ] **Step 1: Extend the test harness with instrumented contexts and write RED ownership assertions**

Create fake contexts per canvas that count `clearRect`, `fillRect`, `stroke`, and `drawImage`. Assert that a full initialization touches all required layers once and that the backboard renderer owns the cabinet gradient/frame, legend, aim rail, seven chute dividers, integrated well/floor geometry. Assert the prize renderer does **not** paint the old opaque full-slot backgrounds.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/v0275-ball-drop-layers.test.cjs`

Expected: FAIL because the current `draw()` still paints every visual onto one canvas and `drawPrizeSlot()` owns the old opaque underlay.

- [ ] **Step 3: Implement the layer lookup/context helpers and static backboard renderer**

Use `BOARD_CONFIG.width/height` as the sole coordinate space. Copy the existing v0.27.4 gradient, neon frame, gold inner line, legend and aim rail coordinates exactly. Move slot dividers and bottom/floor/well treatment into `renderBackboard()` so the wells are physically part of the cabinet.

- [ ] **Step 4: Implement pins, prize, power-up, ball and effects renderers using existing coordinates**

`renderPins()` draws the existing normal/special pins at current model coordinates. `renderPrizeSlot(slot)` clears only that slot rectangle and draws reward content transparently over the static well. `renderPowerups()` draws only pickups. `renderBalls()` owns the idle aim ball plus active main/rain balls. `renderEffects()` owns transient special-pin glow/highlights and may begin empty/minimal except for existing hit glow.

- [ ] **Step 5: Keep `draw()` only as full-render compatibility**

Implement `draw()` as an alias/delegator to `renderAllLayers()` so older callers/tests/public API do not break, but do not use it in frame/update paths in later tasks.

- [ ] **Step 6: Run focused rendering tests**

Run: `node tests/v0275-ball-drop-layers.test.cjs`

Expected: PASS for identical dimensions, layer ownership, integrated wells, and no opaque prize-strip paint.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-ball-drop.js tests/v0275-ball-drop-layers.test.cjs
git commit -m "refactor: separate Ball Drop render ownership"
```

---

### Task 3: Replace whole-board redraws with targeted invalidation

**Files:**
- Modify: `app/src/main/assets/arcade-ball-drop.js`
- Modify: `tests/v0275-ball-drop-layers.test.cjs`
- Modify: `tests/v0223-ball-stalls.test.cjs`

**Interfaces:**
- Consumes: Task 2 layer renderers.
- Produces: targeted update behavior for `prepareTurn`, pointer aiming, animation frames, power-up collection, prize hydration/refresh, special-pin effects and image loading.

- [ ] **Step 1: Write failing redraw-isolation tests**

Instrument layer contexts and assert: pointer aim changes clear only the ball layer; one animation frame clears only ball/effects; collecting one power-up does not clear backboard/pins/prize; `refreshPrizeSlot(model, i)` clears only slot `i`; async Card/Booster image readiness redraws only the same still-current slot; special-pin hit does not clear backboard/prize/power-up layers.

- [ ] **Step 2: Add lifecycle/stale-async cases to the same test**

Replace a prize object before an old image/hydration callback resolves and assert the callback does not repaint/overwrite the new prize. Start/stop/reopen and assert stale RAF/effect work cannot mutate the new run.

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `node tests/v0275-ball-drop-layers.test.cjs`

Expected: FAIL because `prepareTurn`, `aimFromPointer`, `checkPowerups`, `settleBall`, animation and image callbacks still call whole-board `draw()`.

- [ ] **Step 4: Make image loading slot-aware**

Change the cached-image readiness path so Ball sprite readiness calls only `renderBalls()`, while Card/Booster prize art readiness receives `(model, slot, prize)` identity and calls `renderPrizeSlot(slot)` only when that exact prize is still installed in that run/slot.

- [ ] **Step 5: Replace each whole-board update with its owner renderer**

`prepareTurn()` initializes static layers only when starting/replaying a run; pointer aiming calls `renderBalls()`; animation frames call `renderBalls()` and `renderEffects(now)`; pickup collection clears/redraws only that pickup region; prize hydration/refresh redraws only its slot; settlement highlight/landing effect stays on prize/effects/DOM layers as appropriate.

- [ ] **Step 6: Preserve special-pin glow without forcing pin redraw every frame**

Keep pin glyphs static on `ballDropPinsCanvas`; draw temporary hit halos on `ballDropEffectsCanvas` from `hitUntil` state during active frames. Clear only effects when the glow expires.

- [ ] **Step 7: Update the anti-stall/browser harness to provide the layer DOM contract**

Replace its synthetic `#ballDropCanvas` with the six required canvases + aim surface while keeping all existing physics/cancellation assertions unchanged.

- [ ] **Step 8: Run targeted tests and the physics harness**

Run: `node tests/v0275-ball-drop-layers.test.cjs && node tests/v0223-ball-stalls.test.cjs`

Expected: layer/isolation assertions PASS; non-browser physics section reports all seeded drops landing; browser continuation may skip/fail only if Playwright is unavailable, exactly as in v0.27.4.

- [ ] **Step 9: Commit**

```bash
git add app/src/main/assets/arcade-ball-drop.js tests/v0275-ball-drop-layers.test.cjs tests/v0223-ball-stalls.test.cjs
git commit -m "fix: redraw only changed Ball Drop layers"
```

---

### Task 4: Preserve v0.27.4 gameplay/reward behavior across the refactor

**Files:**
- Modify: `tests/v0275-ball-drop-layers.test.cjs`
- Modify only if required by regressions: `app/src/main/assets/arcade-ball-drop.js`

**Interfaces:**
- Consumes: existing v0.27.4 reward/persistence/card-reveal API and layered rendering from Tasks 1–3.
- Produces: verified behavioral equivalence for gameplay/RNG with rendering decoupled.

- [ ] **Step 1: Add regression assertions for persistent prizes during targeted redraws**

Run a model where one slot wins/refreshes and assert the other six prize object identities and visual slot render counts remain unchanged. Cover two different Rain balls settling into different slots before turn completion.

- [ ] **Step 2: Run v0.27.1–v0.27.4 Ball Drop/reveal suites**

Run:
```bash
node tests/v0271-ball-drop-chaos.test.cjs
node tests/v0272-ball-drop-polish.test.cjs
node tests/v0273-ball-drop-fit.test.cjs
node tests/v0274-ball-drop-persistence.test.cjs
node tests/v0274-arcade-card-reveal.test.cjs
node tests/arcade-ball-drop.test.cjs
```

Expected: PASS without changing reward odds, power-up types, row count, radii, slot persistence or card-reveal semantics.

- [ ] **Step 3: If any regression fails, fix only rendering-coupling defects**

Do not rebalance or alter approved v0.27.4 gameplay to satisfy a rendering test.

- [ ] **Step 4: Commit**

```bash
git add app/src/main/assets/arcade-ball-drop.js tests/v0275-ball-drop-layers.test.cjs
git commit -m "test: preserve Ball Drop gameplay through layer refactor"
```

---

### Task 5: Release identity, documentation, full verification and versioned package

**Files:**
- Modify: `app/build.gradle`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `README.md`
- Modify: `CODEX_HANDOVER.md`
- Create: `TEST_REPORT_v0.27.5.md`
- Create: `tests/v0275-release.test.cjs`
- Package: `/mnt/data/LuckyDex_source_v0.27.5.zip`

**Interfaces:**
- Consumes: completed layered renderer.
- Produces: `v0.27.5 / versionCode 275`, `LuckyDexBallDropV0275`, verified versioned source ZIP.

- [ ] **Step 1: Write the failing release-identity test**

Assert Android `275 / 0.27.5`, package and lockfile `0.27.5`, runtime `__LUCKYDEX_BUILD='0.27.5'`, visible app version `v0.27.5`, unchanged application ID/signing references, and presence of `LuckyDexBallDropV0275` while retaining older Ball Drop aliases.

- [ ] **Step 2: Run release test and verify RED**

Run: `node tests/v0275-release.test.cjs`

Expected: FAIL on v0.27.4 metadata/missing alias.

- [ ] **Step 3: Update release metadata and alias**

Set all version markers to v0.27.5/275 and add `root.LuckyDexBallDropV0275=api` without removing `LuckyDexBallDropV0180`, `V0271`, `V0272`, or `V0274`.

- [ ] **Step 4: Update README/handover and create test report**

Document the rendering architecture, authoritative-template rule, integrated wells, targeted redraw behavior and the unchanged gameplay/reward contract.

- [ ] **Step 5: Run the complete project test command**

Run: `npm test`

Expected: 0 non-browser failures. Record every Playwright-only skip/unavailable test by count/name if this environment still lacks the browser dependency.

- [ ] **Step 6: Run fresh syntax, physics and offline asset audits**

Run the same JS syntax, `tests/v0223-ball-stalls.test.cjs` non-browser physics section, Arcade sprite/actor, Adventure and Fossil asset-integrity commands used for v0.27.4. Record exact results in `TEST_REPORT_v0.27.5.md`.

- [ ] **Step 7: Package the versioned source ZIP**

Create `/mnt/data/LuckyDex_source_v0.27.5.zip` from the completed source tree. Do not also create an ambiguous unversioned download artifact.

- [ ] **Step 8: Re-extract the packaged ZIP and rerun v0.27.5 guards against packaged bytes**

At minimum run `tests/v0275-ball-drop-layers.test.cjs`, `tests/v0275-release.test.cjs`, `tests/v0274-ball-drop-persistence.test.cjs`, and `tests/v0274-arcade-card-reveal.test.cjs` from the re-extracted package.

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add app/build.gradle package.json package-lock.json app/src/main/assets/app-v0167.js app/src/main/assets/index.html app/src/main/assets/arcade-ball-drop.js README.md CODEX_HANDOVER.md TEST_REPORT_v0.27.5.md tests/v0275-release.test.cjs
git commit -m "release: LuckyDex v0.27.5 layered Ball Drop renderer"
```
