# LuckyDex v0.63.1 – Tumbling camera + Rampage exit hardening

## Changes
- Tumbling Togepi camera anchor moved from the lower course to the top third (`26%`).
- Tumbling look-ahead increased from `185` to `260` course units so the tall phone arena displays substantially more upcoming track, hazards and arrows.
- Racer, obstacle and finish-line rendering now all use the same camera anchor from core configuration.
- Rampage Rollout close lifecycle now resets joystick/player input before discarding race state, clears pause bookkeeping, and hides the pause overlay during teardown.
- Release metadata updated to v0.63.1.

## Verification
- New regression test was written first and observed failing for both the old Tumbling camera and old Rampage teardown ordering.
- After implementation, all patch-carried tests pass: 23/23 assertions/subtests across 8 test programs.
- Changed JavaScript files pass `node --check`.
- Release ZIP integrity checked with `unzip -t`.

## Scope note
The exact Android-level Rampage crash could not be reproduced in this patch-only environment, so the Rampage change is targeted lifecycle hardening based on the exit path rather than a claim that a specific native/WebView exception was reproduced. If the crash recurs, LuckyDex's stored runtime-error diagnostic should be inspected to identify the device-side exception.
