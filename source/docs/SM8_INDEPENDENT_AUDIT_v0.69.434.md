# Lost Thunder independent audit — v0.69.434

Canonical offline generator: 240 prints, 315 attacks, 61 Abilities, zero explicitly gated. Full SM8 preflight passed 115 tests (107 retained, eight new bilateral outcome tests). SM75 full 78 tests passed; SM1–SM7 release-only preflights passed. These are execution and selected exact outcome checks, not exhaustive proof of all possible combinations. Android APK build remains unverified locally.

## Corrections
- Nightcap now borrows the copied attack's staged pre-damage payment rule without replacing the original attack action, preserving the selected source and the original attack's cost. Both Lava Flow and Mind Blown have bilateral payment, damage and zone tests.
- Blazing Energy converts attached Energy types for the current turn. Fire-typed pre-damage payment choices for Mind Blown and Explosive Jet now accept the transformed cards. Preserve their original physical type on removal; the Fairy ledger conversion now uses the actual basic Fairy card sm1-172. Mind Blown tests check both with and without Blazing Energy.
- Gradle and Termux include the same independent audit test file. Cumulative patch retains earlier files.

Remaining known hybrid limitation: Unown HAND's printed 35-card requirement exceeds normal hand limit; no rule change introduced.
