# LuckyDex v0.42.4 — Target Range tournament balance

Verified 2026-10-15. Baseline: user-supplied `LuckyDex_source.zip` at v0.42.3.
This was implemented directly in the extracted source; Codex was not used for
this balance pass.

## Scope

Bounded Target Range tournament balance only. The shooting mechanics, portrait
range presentation, controls, target generation, Golden Target behavior,
progression, rewards and other Goldenrod games were not retuned.

`app/src/main/assets/arcade-goldenrod-adapters.js` now gives Target Range its own
division-specific simulated score bands instead of the generic shared formula.
The existing AI performance model (stat compression, consistency, risk,
mistakes, seeded variance) is preserved and is converted into event-appropriate
Target Range scores by division.

## Balance target and measured result

New failing-first tests pin the intended Rookie behavior:

- A 75-point Rookie round should podium most of the time, but not always.
- A 90-point Rookie round should usually win, while rare standout AI rounds can
  still beat it.
- Each higher division must step up clearly from the previous one.
- Later tournament rounds receive only modest score inflation because the player
  already gets more targets in later rounds.

Deterministic sample distributions from the final tree (round 1):

| Division | P10 | P25 | Median | P75 | P90 | Max |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Rookie | 58.3 | 63.9 | 71.0 | 78.9 | 85.1 | 97.0 |
| Poké | 84.1 | 88.8 | 96.0 | 103.0 | 108.9 | 116.6 |
| Great | 113.4 | 119.2 | 127.8 | 136.3 | 141.4 | 154.5 |
| Ultra | 148.0 | 153.2 | 160.7 | 168.7 | 175.2 | 179.4 |
| Master | 179.5 | 186.0 | 194.6 | 202.4 | 204.3 | 204.3 |

Across 1,000 deterministic five-opponent Rookie fields used by the regression:

- 75 points podiums in 69.7% of fields.
- 90 points wins in 90.7% of fields.

This is intentionally not a guaranteed win curve.

## TDD evidence

`tests/v0424-target-range-balance.test.cjs` was written before the production
change. On the supplied v0.42.3 formula all four new tests failed:

1. Rookie median/upper score band was far too high.
2. A 75-point round had a 0% podium rate in the sampled fields.
3. Division score spacing did not match the intended event ladder.
4. Round escalation was not pinned to the Target Range scoring model.

After the Target Range-specific scoring bands were implemented, all 4/4 pass.
A separate v0.42.4 release identity test was also observed failing on 0.42.3
before the release metadata bump, then passing after the bump.

## Verification

Final non-browser focused regression command covers Goldenrod core/adapters,
Dash/Power/Impact cup integration, Target Range core/progression/tournament/UI,
records, rare rewards, reward reveal, achievements, Power/Impact regressions,
and the new balance/release tests:

- **151/151 tests pass**.

Additional checks:

- `node --check app/src/main/assets/arcade-goldenrod-adapters.js` — PASS.
- `python3 scripts/fetch_arcade_v0200_assets.py --check` — PASS; 44 scenes and
  2,098 Arcade sprites verified.
- `python3 scripts/verify_v0223_venues.py` — PASS; 8 venue assets verified.
- `python3 scripts/verify_adventure_assets.py` — PASS; 829 images / 1,025
  species verified.
- `python3 scripts/verify_fossil_museum_v0250_assets.py` — PASS; 42 images.

The historical `npm test` entry point was run on the final tree. It completes
**46/46 runnable tests** across the first three programs, then stops when
`adventure-core.test.cjs` imports the unavailable development dependency
`playwright`. This is an environment limitation and is not represented as a
full-suite pass.

## Changed files versus supplied v0.42.3

Gameplay/balance:
- `app/src/main/assets/arcade-goldenrod-adapters.js`

Release identity/documentation:
- `app/build.gradle`
- `app/src/main/assets/app-v0167.js`
- `app/src/main/assets/index.html`
- `package.json`
- `package-lock.json`
- `README.md`

Tests:
- `tests/v0424-target-range-balance.test.cjs`
- `tests/v0424-target-range-release.test.cjs`
- `tests/helpers/current-target-range-release.cjs`
- `tests/v0423-target-range-release.test.cjs` converted to the same historical
  current-release fixture pattern used by the v0.42.1/v0.42.2 tests.

Android application identity remains `com.example.luckydex`.
