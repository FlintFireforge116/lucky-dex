# LuckyDex v0.57.2 — Topsy-Turvy Beyblade collision pass

## User feedback addressed
- Rapid Spin collisions still felt too weak after v0.57.1.
- Desired feel: battling tops / Beyblade-style impacts rather than soft sumo shoves.
- No unrelated gameplay systems were changed.

## Changes
- Rapid Spin active reach increased from +14 to +22 core units.
- Rapid Spin active window increased from 420ms to 500ms.
- One-sided Rapid Spin blast increased from 520 to 720 base impulse, with additional approach-speed contribution.
- Added meaningful attacker recoil on a successful spin impact, so contacts ricochet instead of pushing through each other.
- Added dedicated spin-vs-spin clash physics: both Hitmontop are blasted apart symmetrically.
- Added a separate 900 impact-speed ceiling while preserving the normal 355 movement-speed ceiling.
- Crucially, collision velocity is no longer clamped back to normal movement speed on the next frame; impact momentum now decays naturally through drag.
- Ordinary non-spin body collisions remain unchanged.
- Rapid Spin visual animation is faster, larger and brighter to match the expanded impact envelope.
- Release identity advanced to v0.57.2 / Android versionCode 5702.
- package-lock release metadata was aligned with package.json.

## New regression coverage
- A Rapid Spin hit must launch a victim above 1.8× normal drive speed and recoil the attacker.
- Impact momentum must remain above normal drive speed on the following frame rather than being hard-clamped.
- Simultaneous Rapid Spins must blast both Hitmontop apart at high speed.

## Verification
- Topsy-Turvy core tests: 15/15 pass.
- Wider Arcade / Stadium 2 Kids Club / records / state regression set: 62/62 pass.
- JavaScript syntax checks pass for both Topsy-Turvy runtime files.
- Release metadata is aligned at v0.57.2 across package.json, package-lock.json, Gradle, runtime and visible UI.
- 300 deterministic stress matches (100 each on Easy / Normal / Hard) all reached a natural first-to-five winner before the 60-second horn.
  - Easy: 100/100; average 19.46s; slowest 35.33s; average total KOs 10.84.
  - Normal: 100/100; average 16.89s; slowest 31.46s; average total KOs 10.30.
  - Hard: 100/100; average 15.72s; slowest 24.10s; average total KOs 10.07.
- Repository-wide `npm test` still cannot complete in this extracted source environment because `node_modules/playwright` is absent. The runner reaches `adventure-core.test.cjs` and stops with `MODULE_NOT_FOUND: playwright`; this is unrelated to the Topsy-Turvy changes.
