# Guardians Rising (SM2) — final independent battle-mechanic audit

**Date:** 23 November 2026  
**App release family:** v0.69.402 / versionCode 7402  
**Baseline:** `LuckyDex_patch_v0.69.402_GUARDIANS_RISING_FINAL_34_COMBINED.zip`.

## Scope

- Cross-checked generated SM2 catalogue against pinned compact source and all 180 unique collector prints (including 11 alternate prints).
- Existing 287 attacks, 30 Abilities, 42 GX attacks, Trainer and basic Energy catalogues retained with the original 180/180 battle-enabled registration.
- Re-executed the existing integration, attack and deck-building suites. Added independent, scenario-based tests for delayed effects, full-choice continuations, direct Trainer attachments, hybrid Energy coin behavior, and Stadium symmetry.

## Confirmed bug and fix

**Chandelure (#13), Shady Move:** The runtime filtered out a damage-counter destination if 10 more damage would exactly equal its HP, even though the printed Ability can cause a knockout. Changed all three target-eligibility / resolution comparisons from `< max HP` to `<= max HP`. The live `legalActions/applyAction` regression transfers the counter, knocks out the correct opponent and exercises Prize selection to award precisely one Prize. Does not expand the legal targets beyond this correction.

## New independent regression cases

`tests/v07412-guardians-rising-independent-outcomes.test.cjs`:

1. Chandelure Shady Move lethal damage, source counter removal, knockout and Prize choice.
2. Oricorio Vital Dance: two separate Zone search flips on tails and no invented Energy.
3. Aqua Patch: discard-ledger Water attachment to Benched Water Pokémon without deck-search flips.
4. Absol Doom News: deferred knockout tracks the originally defending Pokémon after switch.
5. Mallow: exact two physical searched cards become deck top in chosen order.
6. Aether Paradise: applies to eligible Basic Pokémon on either side, never evolved Grass.
7. Energy Loto: no Energy Zone substitution when top seven physical cards contain no Energy.

## Checks and limitations

- The full source preflight combines the above with mandatory SM2 generation and player/CPU card and deckbuilder suites; APK/Android compilation remains separately verified by GitHub.
- These tests do not prove every possible board state, but the newly identified lethal-target error is now covered by a mandatory regression.
- The patch is **cumulative** and includes all previous v0.69.401 attack and Energy changes and v0.69.402 SM2 completion changes.
