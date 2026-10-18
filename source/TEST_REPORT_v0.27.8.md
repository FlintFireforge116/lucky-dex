# LuckyDex v0.27.8 test report

Scope: final Ball Drop polish.

- Edge pegs: 6 px inset, collision/wall clearance regression ensures no ball-sized wedge.
- Powered pins: stronger Explosion and Gravity; Sticky Web hard-stops initial momentum and ramps seep strength without repeated reset.
- Notifications: fixed two-row event-log footprint prevents board layout shift.
- Ball Drop focused regressions: PASS.
- Historical non-browser suite: 100 passed / 0 failed; 19 browser/Playwright-dependent programs unavailable in this environment.
- Production physics stress: 88 seeded drops across 11 aim positions landed; worst simulated drop 9.504 s; forced wall-wedge case landed in slot 0.
