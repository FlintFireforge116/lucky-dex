# v0.22.3 targeted phone fixes

Request: `V0223_REQUEST.md`; baseline: supplied v0.22.2 ZIP, imported on `fix/v0223-targeted-mobile-fixes` (commits 7664922 / 8172fe4).

Keep the existing owners, router, native WebView margin-inset strategy, save key/schema/origin, package ID and signing identity. Clefairy, Blender and Tile Puzzle behavior are outside the change scope.

1. Capture baseline defects with real browser tests and the five supplied Samsung screenshots. Record failing pre-fix results.
2. In `arcade-world.js` and `arcade.css`, contain art at 35–45% of usable height, keep title/controls unobstructed and games below the hero. Select authentic location/menu/title/building images with provenance in `arcade/venues-v0223/`.
3. In the existing `arcade-amie` owner, enlarge/lower berries and touch targets, repair reliable drag/tap fallback and keep Start unobstructed. Retain Tile Puzzle and save/reward semantics.
4. In the existing `arcade-classics` owner, keep one reveal/one dig rules but render 6 columns × 7 rows of independent square cells with namespaced cell-state classes. Remove the grid-spanning `.empty` collision and stale decorations.
5. In the existing Ball Drop owner, reproduce traps, repair radius-30 clearance and add a bounded anti-stall continuation. Keep board style, aim, three balls and payout unchanged; test seeded trajectories and cancellation.
6. Run the complete suite plus targeted touch/layout/physics regressions; inspect screenshots at 360×800, 393×873, 412×915 and Android-like reduced usable heights. Review focused changes.
7. Set version 0.22.3 / 223, build and verify original signer and complete offline payload. Produce unversioned/versioned source ZIPs, APK, report, QA contact sheet and hashes.

Progress and rulings are recorded in `V0223_PROGRESS.md`.
