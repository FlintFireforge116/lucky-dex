# LuckyDex v0.69.147 — Aquapolis attack-effect audit

Baseline: v0.69.146. Scope: all Aquapolis Pokémon attack definitions, including the 32 separate holo print identities, and their effects within the existing Classic TCG battle engine. Reference for printed attacks: `PokemonTCG/pokemon-tcg-data/cards/en/ecard2.json`. This pass preserves printed attack names and text intent. No rules redesign.

## Confirmed

- Vileplume #43 / H31 **Poison Scent** is correctly implemented: heads Poison + Confusion; tails Poison + Sleep. Both outcomes are covered by regression tests.
- The deterministic all-card attack sweep resolves each attack with multiple coin paths, checks for supported effect handlers and nonnegative damage, and applies queued effects.

## Fixes

- Houndoom #15 / H11 **Fireworks**: corrected the coin condition; **tails** discards one Fire Energy, heads keeps it. Previously inverted.
- Houndoom #14 **Burn Up**: discarding all Fire Energy no longer discards Water or other unrelated Energy.
- Typed Energy discard costs for Growlithe #51 **Ember**, Ponyta #102 **Ember**, and Tentacool #113 **Recover** can no longer substitute an unrelated basic Energy card. Where the discarded Energy is a use cost, attacks with no eligible attached Energy are not offered.
- Onix #98 **Crush**: each attached Energy *card* counts toward coin flips, including Special Energy.
- Seadra #58 **Water Bullet**: counts attached Water-providing Special Energy cards as well as basic Water Energy for coin flips, without counting unrelated Metal Energy.
- Elekid #9 **Energy Kick**: moves actual selected Special Energy cards to an opponent's Benched Pokémon, preserving card identity, or selected basic Energy; formerly only basic Energy could be selected.
- Removed hard-coded build numbers from three older Aquapolis regression checks to prevent unrelated future build bumps from failing those tests.

## Testing and limits

Run: `node --test source/tests/v0714*.test.cjs` from the repository root.

The audit tests are `source/tests/v07147-aquapolis-move-audit.test.cjs`. They exercise both sides of coin outcomes for every Aquapolis attack definition and include focused tests for the corrected move rules. Running an attack in a deterministic harness is not the same as a physical-device test, exhaustive every-game-state search or a full baseline of every expansion. A full repository historical test suite and a device APK test were not performed.
