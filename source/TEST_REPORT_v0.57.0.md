# LuckyDex v0.57.0 — Topsy-Turvy

## Added
- Pokémon Stadium 2 Kids Club: **Topsy-Turvy**.
- Four Hitmontop in a circular ring-out arena.
- Momentum-based movement and ordinary body bumps.
- A-button Rapid Spin with a 3-second recharge and stronger knockback.
- 60-second match; first to 5 ring-outs wins immediately, otherwise the highest KO total wins at the horn.
- Easy / Normal / Hard CPU profiles.
- CPU roles are shuffled each match (`bully`, `counter`, `opportunist`) rather than tied to COM slots.
- Ring-out credit, respawn safety window, fall tracking, records and rewards.
- Achievements: Top Spinner, Ring Leader, Spin Doctor, and hidden Untouchable Top.
- No artificial rare event was added, so there is no unnecessary Developer/Settings force toggle.

## Release integration
- Stadium 2 Kids Club selector expanded to include Topsy-Turvy.
- Arcade state migration and permanent records added.
- Release identity advanced to v0.57.0 / Android versionCode 5700.
- Existing registry/integration tests that intentionally hard-coded the prior three-game Stadium 2 list were updated for the fourth game.

## Verification
- New Topsy-Turvy core tests: 10/10 pass.
- Relevant Kids Club / Arcade state / records / release regression set: 86/86 pass.
- JavaScript syntax checks pass for all modified runtime JS files.
- 300 deterministic CPU-only simulations (100 per difficulty) all reached a natural first-to-five winner.
- Repository-wide `npm test` begins successfully but cannot complete in this source-only environment because the existing `playwright` dev dependency is not installed. It stops at `adventure-core.test.cjs` with `MODULE_NOT_FOUND: playwright`; 46 tests had passed before that environment dependency was reached.
- Android APK build was not attempted because this source ZIP does not include a Gradle wrapper and the host does not provide a `gradle` executable.
