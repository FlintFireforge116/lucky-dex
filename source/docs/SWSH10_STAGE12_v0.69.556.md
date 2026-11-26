# Astral Radiance stage 12 — v0.69.556

Shared damage audit, no new cards enabled. Astral Radiance remains 215/216 playable; Brilliant Stars remains 185/186. Both Double Turbo Energy prints are still gated.

## Repairs
- Reviewed legacy opposing selected/spread damage writes, including EX-era direct hits and deferred choice continuations, Stormfront Voltage Shoot, later HeartGold/SoulSilver and Black & White families and Sun & Moon Synchronoise.
- Apply the existing `outgoingAttackDamage` once per raw hit (before existing defender reductions); leave existing Active matchup routes alone. Preserve the floor at zero, friendly hits and explicit counter placement. Feint Attack/no-matchup hits still receive the outgoing modifier, without reintroducing defender Weakness/Resistance.
- Explicit counter-placement callers Delta Mind, Deceive and Dragon Roar overflow bypass the outgoing modifier. Existing unrelated defense/target semantics are not comprehensively reworked.
- `tests/v07556-double-turbo-legacy.test.cjs` checks 75 repaired attack patterns on both sides against the original DCE control and the reduced DTE outcome. Four additional cases exercise counter placement. The diagnostic now exports its fixture function so the tests use actual core action/choice resolution.

## Diagnostic delta
Identical synthetic neutral-target scan: 422 candidates, 360 damaging outcomes, 50 zero/unexercised damage outcomes, 12 errors. Raw differences fell from 154 to 4 (150 repaired bilateral cases). The four residual comparisons are two patterns on both sides: Dark Raticate Spread Poison (mixed poison/printed Bench damage; needs exact separate outcome) and Walrein ex Water Arrow (unexplained pre-existing 10 Active damage while selected Bench correctly decreases 40→20; needs separate review). The comparison is a diagnostic, not a claim that all attack paths are correct.

Unexercised cases: Team Magma's Groudon Linear Attack (original and Celebrations), Wormadam Trash Cloak Cloak Shard, Pikachu Mega Shot, Arceus Sky Spear, and Zapdos Thunder Snipe. Check legal fixtures, nested selectedDamage dispatch, required targets and Energy discard timing. Check the 50 zero cases, Active-versus-Bench and suppression, Wide Lens, Energy paid/discarded during an attack, and broader non-scanned direct damage paths before enabling both DTE prints. Do not conflate these audit gaps with confirmed DTE bugs. The 154 new targeted tests pass. The diagnostic report is retained at SWSH9_SWSH10_DTE_LEGACY_DIAGNOSTIC_v0.69.556.json.

## Additional historical regression comparison
An optional older-suite sweep (225 tests) returned 218 passes and seven failures with both the v0.69.555 engine and the revised engine, with identical failing test names: Aqua Reverse switch/weakness, Suicune ex Reverse Stream Energy return, Walrein Hydro Reverse Energy return, Lady Outing Energy selection, React Energy deck inclusion, Aerodactyl Primal Light Energy selection, and Mr. Stone Project Energy selection. These are pre-existing test failures, not new regressions established by this comparison. They are separate from the official release preparation gates. No APK/device execution was performed.

## Release validation
The historical preparation passed 2,313 gameplay tests and all preceding source gates. The final Astral Radiance gate initially caught missing Gradle registration of the new test file; after registering it alongside the original Astral Radiance tests, the full final preflight passed static parity and all 336 gameplay tests. Combined standard test invocations: 2,649 passed, zero gameplay failures. Only Gradle test registration changed between the preceding suites and the final preflight.
