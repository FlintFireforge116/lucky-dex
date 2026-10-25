# LuckyDex v0.69.29 battlefield verification

## Baseline and boundaries

The user's `lucky-dex-main.zip` is the sole authoritative product baseline, reporting v0.69.28 / Android7009. SHA-256: `d568bfc2e0a6da2da85906a653b2ddfd2c7c17111c68bc55b62976e389ad0342`. Work used a fresh extraction of its `lucky-dex-main/source/`, not older LuckyDex trees or Git history. Release is v0.69.29 / Android7010, with the same application ID and signing keystore.

No save migration or new persistent fields are needed. Core, AI, data, decks, effects, Solo, progression and TCG achievement modules remain byte-for-byte unchanged. App shell changes are restricted to the build marker. Unrelated Adventure, pack opening, Clefairy, ownership, alternate-art identity and rewards are not refactored. The repository-root GitHub workflow is unchanged and still builds directly from `source/`.

## Implementation / changed files

- `app/src/main/assets/tcgp-battle-ui.js`: one current renderer with explicit board anchors; count-aware hand placement and resize handling; legal-action dispatch retained; touch distinguishes horizontal hand scrolling from vertical card dragging; drag and CPU timers cancel on exit/re-render. Unused superseded renderers are retired in place.
- `app/src/main/assets/tcgp-battle.css`: accumulated battlefield overrides replaced by one responsive grid. Opponent, centre, player, Bench, Active, pile, hand and Energy footprints are reserved. Menus/help remain. Empty discard outlines explicitly reset generic empty-state padding.
- `app/src/main/assets/tcgp-battle-layout.js`: new deterministic pure fan/scroll-span geometry, with no engine or state dependency.
- `app/src/main/assets/index.html`: load the helper before UI and update visible version labels. `app-v0167.js`: build marker only.
- `app/build.gradle`, `package.json`, `package-lock.json`: consistent release metadata; signing configuration unchanged.
- `tests/v06923-tcgp-battle-layout.test.cjs`, `tests/v06927-tcgp-center-drag.test.cjs`: replace obsolete private-renderer/fixed-size assertions with the current layout contract, backed by the stronger browser tests below. Existing core/legality assertions remain.
- Five new `tests/v06929-tcgp-*.test.cjs` files: hand geometry, actual DOM bounds, real UI interactions, release markers, deterministic stress.
- Four new `scripts/` utilities: browser fixture, focused test inventory, visual captures, changed-only patch packaging/audit. `README.md`, this report and the implementation plan document the release.

No source files are deleted; no deletion-list file is required. Build-generated booster-art JSON changes were detected during diff auditing and restored to the supplied baseline rather than included as unrelated changes.

## Test-first evidence

Initial new hand tests failed because the helper did not exist; browser geometry failed on overlapping opponent regions. New cancellation and long-hand touch tests reproduced a lingering ghost and horizontal swipes incorrectly becoming drags. A CPU-exit test reproduced the delayed battlefield scroll lock returning after close. All are green after the corresponding fixes.

Independent read-only review found one P2: the global `.empty` padding expanded the discard's inner outline beyond its reserved button. A new inner-pile bounds assertion failed at360×720 before the scoped padding reset and passed afterwards across all requested viewports. No other concrete blocker was found. Review inspected four artwork screenshots and the UI/engine interaction boundary; final verification did not require another review loop.

## Verification results (2026-10-25)

- `node scripts/tcgp-test-inventory.cjs final`: **19 programs passed, 0 failed**. The supplied baseline's14 focused TCG programs also passed before edits.
- New geometry test exercises360×720,360×800,393×873,412×915,430×932; setup hand5 and live hands1/3/5/10/20, full benches, actual card/action/pile-child bounds, separate zones, no document vertical overflow and a bounded hand viewport. Twenty cards is synthetic layout stress only; the engine's10-card cap is unchanged.
- Eleven real browser interaction tests: required manual Active, optional Bench/no autofill, first-player Energy restriction, Basic Bench placement, Active/Bench evolution, centre Trainer play, relevant multi-target choices, illegal drop rejection, Energy target/payment/token, attack damage, retreat target/payment, equipped sleeve, both public discard inspectors, pointer cancellation, close during drag/CPU thinking, horizontal touch scroll/last-card inspect and vertical touch drag.
- 500 seeded headless Beginner matches terminate under existing turn/hand/Bench limits;20 selected seeds repeat with identical outcomes.
- `node scripts/tcgp-visual-qa.cjs`: **34 real-art captures, five viewports, no captured runtime errors**. Fresh screenshots inspected across every requested size, plus shortest-viewport card details, discard, relevant evolution targets and attached Energy/equipped sleeve. Temporary artwork cache uses existing card URLs and is not a release asset.
- `gradle --offline --no-daemon assembleDebug`: **BUILD SUCCESSFUL**, final runtime files included. `aapt` confirms `com.example.luckydex`, versionName0.69.29, versionCode7010, minSdk26. `apksigner verify --verbose --print-certs` passes APK Signature Schemev2 with the supplied permanent keystore; certificate SHA-256 `069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`.
- Full `node scripts/run-tests.cjs`: **not all green**. Both untouched-baseline and final runs stop at `adventure-location-browser-v0402.test.cjs`: “Map appears exactly once” and “New Bark Town one Map tool” expect1 but find0. Six other cases in that program pass. Later full-run programs are not reached; focused TCG tests run independently above. No unrelated Adventure change was made to silence these failures.
- Packaging script compares exact bytes against the supplied ZIP, includes only changed/new source-relative files, CRC-checks the patch, simulates applying it over the baseline via independently hashed entries, and verifies reconstructed source equality. It checks protected modules/keystore/workflow and compares current battlefield assets with the built APK. Final ZIP SHA-256 and exact file manifest are in the detached `LuckyDex_patch_audit_v0.69.29.json`.

## Reproduction and limitations

Install project dependencies, then run `node scripts/tcgp-test-inventory.cjs final`. Set `LUCKYDEX_BROWSER` to a locally installed Chrome/Chromium executable if Playwright's browser is unavailable. This verification used desktop Chrome with mobile viewports and CDP touch input, not a physical Android phone or emulator. Device-specific gesture feel, system bars and nonzero safe-area insets still merit a device smoke test; CSS reserves safe-area insets.

For screenshots, `LUCKYDEX_TCGP_QA_ART` can point to a temporary directory containing the existing CDN artwork filenames. The refactor does not add bundled card art or change existing artwork/network policy; it does not claim every card image is available offline. Functional browser tests run with external requests blocked and exercise the existing fallback presentation.

Build from canonical `source/` with the existing Gradle setup. On this Windows environment, the existing full-run browser tests needed a local-Chrome preload adapter supplied outside the patch; that adapter changes executable selection only, not assertions. Full-suite failures above remain disclosed.

Apply `LuckyDex_patch_v0.69.29.zip` directly over `~/lucky-dex/source/`. Do not delete/recreate `source/`, commit a full source ZIP, or change the GitHub workflow to unpack an archive. No remote Git commit or push was performed by this task.
