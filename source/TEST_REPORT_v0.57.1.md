# LuckyDex v0.57.1 — Topsy-Turvy collision / arena tuning

## User feedback addressed
- Rapid Spin needed more reliable, more forceful collision.
- The Topsy-Turvy arena needed more usable space.
- No unrelated gameplay systems were changed.

## Changes
- Increased playable arena radius from 276 to 306 core units (~10.9% larger radius).
- Increased visible arena cap from 680px to 740px and stage cap from 760px to 820px.
- Reworked the arena artwork boundary so the visible ring edge matches the larger physics boundary.
- Rapid Spin now receives a +14 core-unit active collision reach beyond ordinary body contact.
- Rapid Spin shove increased from 390 to 520 while ordinary body collision remains unchanged.
- Spin visual ring expanded to better communicate the wider active contact envelope.
- Release identity advanced to v0.57.1 / Android versionCode 5701.

## Verification
- Added regression tests proving a 66px separation is outside normal contact but inside active Rapid Spin contact.
- Added regression tests proving the enlarged arena remains inside the renderable playfield.
- Added UI integration coverage for the larger arena surface.
- Relevant Stadium 2 Kids Club / records / Topsy-Turvy regression set: 84/84 pass.
- JavaScript syntax checks pass for both Topsy-Turvy runtime files.
- 300 deterministic stress matches (100 each on Easy / Normal / Hard) all reached a natural first-to-five winner before the 60-second horn.
  - Easy average total KOs: 7.99; slowest winner: 40.8s.
  - Normal average total KOs: 8.68; slowest winner: 43.9s.
  - Hard average total KOs: 9.23; slowest winner: 48.55s.
- Repository-wide `npm test` starts successfully but remains blocked by the source package environment missing the existing `playwright` dependency. It stops at `adventure-core.test.cjs` with `MODULE_NOT_FOUND: playwright` after the first 46 tests pass.
