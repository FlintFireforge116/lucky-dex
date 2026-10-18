# LuckyDex v0.37.1 Test Report

## Scope

v0.37.1 is a bounded Kids Club achievement expansion. It adds three achievements each for Dig! Dig! Dig! and Magikarp’s Splash, with no gameplay, persistence-schema, reward-engine, or Arcade lifecycle changes.

### Dig! Dig! Dig!
- **Excavation Crew** — finish 25 races — 600 Coins + 30 Dust.
- **Three Layers Down** — win on Easy, Normal, and Hard — 1,000 Coins + 1 Ticket.
- **Mole Machine** *(secret)* — finish in **7.50 seconds or less** — 1,500 Coins + 100 Dust.

### Magikarp’s Splash
- **Splash Veteran** — win 10 rounds — 800 Coins + 40 Dust.
- **Master of the Pond** — win on Easy, Normal, and Hard — 1,000 Coins + 1 Ticket.
- **Thirty Splash Salute** *(secret)* — score 30+ in one round — 1,500 Coins + 100 Dust.

Existing Dig and Magikarp achievements remain unchanged.

## Verification

### New v0.37.1 tests
- `tests/v0371-kids-club-achievements.test.cjs` — PASS.
  - Confirms all six entries exist with the approved names/rewards.
  - Confirms Easy/Normal/Hard completion counts are derived from existing `winsByDifficulty` state.
  - Confirms **7.69 s does not unlock Mole Machine** and **7.50 s does**.
  - Confirms score 29 does not unlock Thirty Splash Salute and score 30 does.
  - Confirms both mastery achievements remain secret until complete.
- `tests/v0371-release.test.cjs` — PASS.
  - Confirms `0.37.1`, versionCode `3701`, runtime/title/build metadata, and asset-builder user agent are aligned.

### Historical feature regressions
- `tests/v0360-dig-state-achievements.test.cjs` — PASS.
- `tests/v0370-magikarp-state-achievements.test.cjs` — PASS.
- `tests/v0370-release.test.cjs` — PASS as a forward-compatible v0.37.0 release-floor check.

### Broad regression pass
- **251 / 251 non-browser Node test programs PASS.**
- **23 browser/recovery-browser tests were not executed** because this extracted source environment does not contain the Playwright dependency.
- `node --check` passes for the modified achievement catalogue and the main runtime file.

## Environment limitations

- `node_modules/playwright` is absent, so Playwright-backed browser/mobile QA is not claimed as run for this source-only pass.
- The source ZIP does not contain a Gradle wrapper (`gradlew`), so an APK compile is not claimed from this environment.

These are environment limitations, not observed LuckyDex assertion failures.
