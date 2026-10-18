# Ball Drop v0.32 geometry rebuild

## Scoped architecture

The existing 720×1004 board, staggered eleven-row lattice, aiming, seven reward wells, six special pins, pickups and layered canvas rendering remain the integration points. Rewards and persistence are outside this change.

Replace each circular pin with a compact mirrored triangle whose upper face is sloped. Alternate the interior slope direction by row, and mirror it across the board midpoint. Edge triangles reach the side wall, with their upper face pushing the ball inward; this removes the narrow wall/pin pocket. One geometry helper supplies both the canvas path and closest-face collision calculation, so visible solids and physics agree. Keep the opaque sprite collision radii and 2ms production substeps.

Use circle-versus-convex-triangle contact resolution with normal bounce and tangential friction. Recheck containment after contacts and Warp. Preserve the named special-pin effects, including Web's capture/release and the intentional Warp teleport; retain normal gravity at 1300. A low-speed watchdog is secondary protection, using a small deterministic velocity impulse without moving the ball or awarding hits. It must not interrupt Web capture or a ball already inside a reward well.

Assumptions: the existing simplified spin/friction model and reward timing remain appropriate; a mathematically exact stationary point above a triangle corner is unstable but may require the secondary watchdog. Ordinary seeded drops must make progress without repeated watchdog reliance. Verify face deflection, mirrored edges, contact containment, power-pin activation, old resumed wedge states, tiny recovery and repeated seeded main/rain drops.

## Implemented behavior

Triangles use the original 9px pin radius as their compact envelope. Interior upper faces slope at approximately 39°; the alternating wall ramps extend visibly to the boundary, eliminating the old narrow pocket. Canvas fills and collision contacts share these three vertices. Circle-to-triangle collision uses the closest segment/corner, with normal rebound and the existing spin/friction model. Normal gravity, Gravity power, Web capture/seep, Explosion, paired Warp and Metronome resolution remain intact. Both side walls and the top boundary enforce the opaque ball collision radius, including after power contacts.

The secondary watchdog adds 8px/s sideways and 12px/s downward, deterministically away from nearby support and toward the interior at a wall. It never changes position or awards a hit. It requires sustained low speed for 1.25s, or 0.9s of low speed plus at least 1.25s without downward progress; fast bounces cannot trigger it. Web capture and balls in reward wells are excluded. No storage keys, prize rules or public API names changed.

## Verification

- The new sloped-contact regression failed on the circular implementation before geometry changes. The native-canvas pixel regression also failed on v0.31's circular crown and passed on the shared triangle renderer.
- `node tests/v0320-ball-drop-slopes.test.cjs`: 264 seeded main launches across 11 aim positions including both extreme walls, plus 60 rain balls; all 324 land within 10.886 physics seconds. No main-ball launch needed the watchdog. Tests also cover mirrored contact response, top rebound, resting points and exact stationary tips, tiny deterministic recovery, every named power-pin collision and onward landing.
- All 15 Ball Drop test programs pass, including v0.22.3's forced phone wall wedge (2.176s), old resumed wedge (local slot 0), 88 production RAF drops (worst 10.800s), native-browser RAF landing (4.176s in the final run), cancellation/reentry, rewards, persistence, pickups and targeted redraws.
- Native Chrome canvas rendering checked at a 393px phone viewport; `artifacts/v0320/ball-drop-slopes-phone.png` records the shared sloped solids and neon presentation. Metronome redraw produces no browser errors.
- JavaScript syntax check passes. Runtime tests use the bundled Node packages through `NODE_PATH` because the source copy has no installed `node_modules`.
- The complete project runner was invoked and stopped at `adventure-regional-engine.test.cjs` (`serializable regional run owner`) while the separately implemented Adventure work was in progress. The release owner must rerun the complete suite after integrating that work.

Limits: this is the existing discrete, small-substep arcade solver, not a general continuous rigid-body engine. The seeded stress bound is physics time, not wall-clock rendering time on a busy device. A deliberately exact zero-motion corner state may use one tiny secondary impulse; ordinary tested drops resolve through geometry alone. APK/on-device verification belongs to the final combined release pass.

Combined release follow-up: Adventure integration completed. Final full inventory is 162/175 passing; all 13 non-passing programs reproduce on v0.31.0, and all 15 Ball Drop programs pass. Android combined build/signature/payload verification completed by the release owner.
