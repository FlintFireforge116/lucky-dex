# LuckyDex v0.69.171 — EX Team Magma vs Team Aqua CPU Bench recovery

Base build: v0.69.170.

## Cause

The Classic CPU's general effect-choice handler selected `Skip` for every optional choice, including searches that would have added useful Pokémon to its hand or Bench. EX4 Team Aqua Ball, Team Magma Ball, Team Conspirator, Archie, Dual Ball, and Call for Family can present such optional `deckCard` choices. A generated 30-card Team Magma deck can have seven Basic Pokémon; opening with only one Basic is legal, but the CPU was skipping the searches intended to rebuild its Bench.

## Changes

* For EX4 deck searches, choose a useful legal card instead of `Skip` when an eligible card exists. Prefer Basic Pokémon when the Bench is empty, and Pokémon over ordinary Energy.
* When the Classic CPU has an empty Bench and a Basic in hand, Bench it before other actions, across all difficulty levels.
* Preserve the existing general `Skip` policy for other optional effects; do not alter deck-building, card ownership, prizes, or player interactions.
* Update Android, runtime and both app-visible version labels to v0.69.171. Replace two legacy hardcoded release-version assertions with version-aware tests.

## Verification

* New outcome tests: CPU benches an available Basic; Team Magma Ball searches then benches on Beginner/Intermediate/Advanced/Expert; Team Aqua Ball/Conspirators search; Archie places a Team Aqua Pokémon straight on the Bench.
* `v07171-ex4-cpu-bench-choices`, `v07170-ex-magma-aqua-outcome-audit`, `v06983-bench-and-surge-ai`: 25/25 passing.
* `v07169-ex-magma-aqua`: 12/12 passing.
* Broader older test batch exceeded runtime limit; no claim of exhaustive cross-set verification. On-device playtesting still needed.
