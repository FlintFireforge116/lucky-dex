# LuckyDex v0.69.200 — Holon Energy rule/metadata/build audit

Base: v0.69.199. Apply this patch to canonical `~/lucky-dex/source/`.

## Root cause

EX Delta Species Holon Energy FF/GL/WP was marked `specialEnergy` and had `deckMeta.preferredEnergyTypes`, but the Classic auto-builder only reserved special energy for legacy neo cost cards and used later special-energy cards as generic filler. Its strategic selection considered Trainers but **never ranked Special Energy by printed basic-energy triggers or specific Pokémon payoffs**. Rayquaza's Delta Guard, and the Castform / Eeveelution Holon interactions, were not included as actual builder dependencies. This allowed correct battle effects to go unused in automatically built decks.

## Changes

- EX Delta Species metadata records each Holon Energy's two distinct Basic Energy triggers and their benefit, including the Pokémon-ex exclusion. They still provide **Colorless** Energy, not the activating basic type.
- Rule-derived `specialEnergyPayoffs` for Rayquaza δ, Castform, Rain Castform, Snow-cloud Castform; `specialEnergySearches` for Flareon δ, Jolteon δ, Vaporeon δ, Sunny Castform.
- Shared metadata pipeline exposes generic `basicEnergyTriggers`, `specialEnergyConditions`, `specialEnergyPayoffs`, `specialEnergySearches` for future expansion rules.
- Shared `specialEnergyScore` compares actual configured **Basic Energy Zone types** to printed conditions, and accounts for a focal Pokémon's benefit.
- Builder reserves one matching protective Holon Energy for a type deck, or two when the core explicitly gains a Holon payoff, *before* generic Trainer filler. Existing set/owned-card/quantity and 30-card rules remain in force. Ineligible variants are not inserted as generic filler.
- Ex-focused builds do not mistake Eevee pre-evolution for a valid Special Energy protection target (printed rule ignores these effects on Pokémon-ex).
- CPU attachments favour the recipient whose Holon interaction is actually live, including Rayquaza δ, across difficulty settings. Existing battle effects remain unchanged.

## Tests

- `tests/v07200-holon-synergy-audit.test.cjs`: 10 tests; special-energy conditions, search/payoff tags, type-specific builds, Rayquaza core, Pokémon-ex exclusion, owned/set filtering, CPU type decks, Holon Guard self-damage toggle, FF/GL/WP combat effects, AI recipient selection.
- Focused broader regression: 63 tests passed before the final CPU-selection refinement; targeted Delta/AI suite: 23/23 passed after that refinement.
- Broad historical all-deck test run exceeded environment's execution limit; do not treat that incomplete run as a pass.

## Handoff

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.200.zip -d source
cd source
node --test tests/v07200-holon-synergy-audit.test.cjs  # optional if Node available
cd ..
git add source
git commit -m "LuckyDex v0.69.200 Holon Energy synergies"
git push origin main
```
