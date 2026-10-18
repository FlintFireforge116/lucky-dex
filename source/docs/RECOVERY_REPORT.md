# LuckyDex 0.21.0 recovery candidate

5 October 2026. Branch: `fix/v021-stability-ui-recovery`. Package: `com.example.luckydex`; versionName `0.21.0`, versionCode `211` (supplied baseline: 210).

The code recovery, offline asset packaging, browser regression and local Android build are verified. This is a recovery candidate, **not a claim that physical Android runtime QA or retail-game visual parity is complete**. An isolated headless emulator could not boot. The user confirmed no device is available and requested delivery of this candidate; see `ANDROID_BUILD.md` for evidence. No supplied save was reset or signing key exported.

## Root causes and crash evidence

1. **Trade stack overflow:** a saved market from an earlier four-hour window triggered `updateTradeClock → renderTradeBoard → updateTradeClock` before the slot could advance. Navigation: launch/title → home → Trade with an expired `state.trade.currentSlot`; also active market rollover. Real Chromium reproduced repeated uncaught `RangeError: Maximum call stack size exceeded` (157 errors in the independent probe). Source: `trade-v0163.js`, those two functions. Clock painting is now pure; only the clock tick requests a refresh, and board rendering advances the slot. Expired entry/rollover/reentry regressions pass with zero errors. Evidence: `artifacts/review/trade-expired-before.json`, `trade-refresh-before.log`, production regression `tests/recovery-trade-refresh.cjs`.
2. **Ball Drop navigation failure:** its newer stop path cancelled physics but retained `body.arcade-open`, so navigation/chrome remained in game state. The first regression failed with `true !== false`. One router now calls the owner and always restores chrome on game exit, unrelated route change, visibility loss and native pause. Actual three-ball completion, early exit, result Back, reentry and game switching pass. A native Android Ball Drop exception was not captured; browser evidence establishes the navigation defect and its repair.
3. **Overlapping owners:** v0.17–v0.20 scripts replaced global open/close functions, cloned controls and mutated shared DOM. Different owners cancelled different timers. Delayed callbacks and abandoned drag listeners could affect later sessions. Superseded generations and observer/reparenting layers were removed; the ten games now have explicit owners and idempotent cleanup.
4. **Save access and migration:** Arcade IIFEs read `window.state`, while the app used a global lexical `let state`. A getter now exposes the live object. Stadium venue normalization was corrected. Existing Amie best scores/streak/times are updated again. Tests retain counts, shiny variants, unknown metadata and legacy fields.
5. **Graphics/scaling:** all declared authentic scene files were missing from the supplied ZIP; CI downloaded them. Runtime sprites remained remote. Raw Emerald tiled sheets were treated as ready-to-display pictures. Stacked CSS stretched boards and duplicated Voltorb HUD IDs. Assets are committed; original tile maps are assembled; transparent actor padding is cropped without changing original pixels; obsolete selectors and duplicate HUD markup are removed.

Trade overlays now cancel confirmation/animation waits, reset face classes before each exchange and preserve the transaction if its cosmetic animation is interrupted. A double cash-out regression found and fixed duplicate Voltorb rewards.

## Code removed and consolidated

[Runtime owners](RUNTIME_OWNERS.md) gives every active file and cleanup path. Removed old Amie/world/zone/expansion/quality owners, inactive Ditto/Safari shells, Moon-stage Clefairy implementation/generated graphics, generated venue directories, obsolete polish observers and fidelity DOM shelves. Retained game rules were consolidated in files without version suffixes. 146 legacy Arcade CSS selectors were removed. Trade/binder styles were rescued from mixed overlays into their existing stylesheet. Historical implementation-string tests were retired; behavioral model tests were adapted to active owners.

## Asset audit and references

[Asset audit](ASSET_AUDIT.md) and [game-by-game references](GAME_REFERENCES.md) document provenance and limitations. Offline checks validate **4,220 source/display files**: 44 authentic references/extracts/maps/crops, 2,098 original sprites/icons and 2,078 unretouched alpha-bounds actor crops. All source/output hashes pass. Essential Arcade graphics have no runtime external URL dependency; all eight venues and visible game images load with remote requests blocked. CI verifies committed files and no longer fetches venue art at build time.

Ball Drop, Unown Decoder and the silhouette quiz are LuckyDex originals inspired by Pokémon, not falsely identified as retail minigames. Functional Canvas geometry remains in the original prize board; no generated art is used to impersonate a retail scene.

## Visual QA

Production screenshots cover all ten games in ready/running states, every venue, world, Trade, home and results at **360×800, 412×915 and 393×873**. Six contact sheets plus full-resolution captures are in `artifacts/qa/`; source/display comparisons are in `artifacts/arcade-assets-contact.png`. They were visually inspected. Idle quiz/Unown scenes were filled with genuine local glyph/sprite assets, actors enlarged by removing transparent margins, and the Blender's live RPM placed on its original meter. Source ratios and horizontal fit are tested, and every initial primary control fits and receives a real touch.

The composition preserves landscape game surfaces within portrait phones; unused space is letterboxing around the centered scene, not scrollable empty panels. This is an adaptation, not visual parity. Missing fidelity assets remain explicit: clean full Tile Puzzle stage/retail actor animations; separate Stadium actors and clean classroom; complete Underground strata/crack/tool sprites; Emerald-specific Lilycove exterior; verified retail provenance for reconstruction Voltorb tile faces. Current essential substitutes are authentic reference/cropped images or documented community-maintained sprites, not invented geometric art.

## Verification

- Entire active suite: **11 test programs plus offline asset integrity passed**, `node scripts/run-tests.cjs` (`npm test` after installing pinned dependencies).
- Runtime: 30 game/viewport combinations, 24 venue checks, repeated unrelated section navigation, real touch/hit tests, initial/reentry controls, result fit, offline images and game resource cleanup. Any uncaught exception or production console error fails the suite.
- Separate runtime regressions: expired Trade slot, cancellation/last-copy confirmation, committed transaction during interrupted animation, cancelled flip replay, Blender countdown interruption, actual three-ball physics completion/background exit, cancelled classroom lesson, Amie personal bests/reward deduplication and legacy-save migration.
- Android `:app:assembleDebug` passed locally; APK manifest and v2 signature verified. Original development signer retained. APK asset inventory/checksum comparison is included in packaging evidence.
- GitHub Actions workflow was updated to run the suite and validate committed graphics; it was **not dispatched remotely** from this local ZIP checkout.

## Remaining limitations

Android installation/launch, actual WebView console/logcat, gesture Back/system-bar insets and physical pause/resume require a booted emulator or connected device. Report their final verification status in `ANDROID_BUILD.md`; do not infer them from compilation or browser tests. Source fidelity gaps above remain. Normal card/Pokémon metadata services retain their existing online/cached behavior; the new offline guarantee concerns essential Arcade graphics and game play.

## Deliverables

- `artifacts/LuckyDex-v0.21.0-source.zip` — committed source, tests, assets and documentation; no signing key/caches.
- `artifacts/LuckyDex-v0.21.0-candidate-debug.apk` — local build using supplied development signer.
- `artifacts/LuckyDex-v0.21.0-QA.zip` — full captures/contact sheets, asset/reference notes, crash reproduction and test/build logs.
- `artifacts/release-verification.json` — hashes, package/version and packaged source-asset comparison.
