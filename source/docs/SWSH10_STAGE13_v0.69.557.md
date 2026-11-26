# v0.69.557 — adaptive Trainer selection and DTE follow-up

## Deck builder
The wide-pool (at least four available Trainer sets and 24 Trainer names) builder now ranks eligible support from the actual chosen Pokémon core and Energy plan. It avoids the fixed generic historical filler package, while preserving specialist reservations, legality, explicitly retained cards and narrow-pool behaviour. Printed effects rather than reminder text determine roles; marginal role coverage, core/type affinity and seeded name-level variation reduce repeatedly filling the deck with the same generic Trainers. Conditional guards prevent selecting specialist cards without the requisite targets or physical Energy. Player and CPU share this path. Same inputs and seed remain reproducible. This is a heuristic, not a guarantee of optimal play or distinct decks on every build. Android performance has not been measured.

## DTE
Dark Raticate Spread Poison now resolves its mandatory selected Bench damage in addition to the poison status. Walrein ex Water Arrow's extra Active damage is Icy Aura checkup damage, not attack damage. Arceus-era Cloak Shard, Mega Shot and Sky Spear use the proper selected attack damage dispatcher; Sky Spear and Thunder Snipe apply outgoing damage before discarding the attached Energy that modifies the attack. Correct legal fixture setup for Team Magma's Groudon (including its reprint) and Zapdos. The new outcome tests cover both sides, Active versus Bench and relevant payment timing. Keep both DTE prints gated pending the remaining zero/unexercised patterns and broader attack/payment audit. No catalogue definitions changed; Astral Radiance 215/216, Brilliant Stars 185/186.

APK and device verification remain outstanding.

Neutral-target audit: 422 candidates, 372 damaging outcomes, 50 zero/unexercised, zero errors and zero unexplained differences. The prior 12 fixture errors and four raw differences have been resolved or classified using explicit non-attack damage expectations. These results are not evidence of full attack coverage. Retained diagnostic: SWSH9_SWSH10_DTE_LEGACY_DIAGNOSTIC_v0.69.557.json.

## Release validation
Full `prepare-swsh10.sh` exited 0: 2,688/2,688 standard gameplay test invocations, including 375/375 final Astral Radiance/DTE/deck-builder/performance tests. Additional Arceus and deck-quality sweep: 33/33. The prior seven unrelated legacy failures documented in v0.69.556 have not been addressed by this release.
