# LuckyDex v0.53.2 Test Report

## Scope

v0.53.2 is a bounded Pikachu's Beach DX mobile-layout polish release based on v0.53.1.

### User-visible changes

- Replaces the split D-pad/action control layout with one full-width 2×3 grid: **JUMP · ▲ · ATTACK / ◀ · ▼ · ▶**.
- Keeps the full Jump/Attack labels and actual directional arrow symbols while making every control a larger touch target.
- Removes the empty purple/sky gameplay viewport and zeroed HUD from the pre-run screen.
- Adds a compact recovered Surfing Pikachu icon to the ready card instead of using the full playfield as decoration.
- Compacts the ready card, difficulty, distance and companion guidance so Start is visible without scrolling.
- Hides duplicate ready-state status/instruction text and keeps only the useful best-score footer.
- Reduces the live mobile playfield height responsively so gameplay controls remain visible without scrolling.
- Keeps all v0.53.1 DX gameplay, companions, bosses, Lucky Wave rewards, achievements, records and Settings rare-event controls unchanged.

## Focused verification

The complete Pikachu's Beach test set is run with:

```bash
node --test tests/*pikachu-beach*.test.cjs
```

Result on the release source tree: **82/82 passed**. This includes the new v0.53.2 layout regression plus the existing DX gameplay, migration, reward-safety, achievements, records, boss, companion, wave and metadata coverage.

Cross-cutting Arcade checks for achievement review, records, rare rewards, rare odds/settings, rare reveal polish and achievements: **30/30 passed**. The Arcade Records browser QA test reports its existing Playwright-unavailable skip while the test file itself passes.

Static release checks include:

- `git diff --check`
- `node --check` on the active Pikachu's Beach DX controller/core/content/launcher scripts
- release metadata consistency across package, Gradle, runtime and visible UI
- exact 2×3 control order and ready-state compact-layout assertions

## Wider suite

`npm test` is attempted. It completes the first three Adventure test programs (**46 tests passed**) and then stops at `adventure-core.test.cjs` because the `playwright` module is not installed (`MODULE_NOT_FOUND` from `scripts/recovery-browser.cjs`). This is an environment/dependency stop, not a claim that the complete project suite passed.

## Build / visual limitations

- There is no Gradle wrapper in the supplied source tree, so no APK was built in this environment.
- Playwright is not installed, so no fresh browser/device screenshot pass is claimed for v0.53.2.
- The supplied Android screenshots were used to define the spacing/control problems and the v0.53.2 static layout regressions.

## Package verification

The final source ZIP is extracted into a clean directory. ZIP integrity is checked, and the full Pikachu's Beach suite is rerun against that extracted copy before delivery. The final SHA-256 is reported with the delivered artifact.
