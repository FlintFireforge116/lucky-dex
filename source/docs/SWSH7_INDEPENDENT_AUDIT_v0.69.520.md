# Evolving Skies independent audit — v0.69.520

## Scope
All 237 prints remain enabled. Verified full-print metadata, all 176 distinct identities and 61 equivalent reprints, plus 54 generated 30-card decks (nine available types, three seeds, both controllers). No Dragon Energy Zone. Independent gameplay tests use actual legal actions and physical card references.

## Corrections
- Primeval Beak: guard Gym Challenge Erika's Venusaur Growth against attaching physical Grass Energy to the locked Pokémon; preserve the cards in hand, and preserve the separate pre-existing Zone fallback only if no matching hand Energy exists. Recognize both basic Energy metadata formats.
- Lt. Surge's Treaty: route actual Prize-taking through the standard queue instead of shifting the first hidden card into hand. Preserve each player's claim, count exactly once, and allow owner-turn Treasure Energy reactions. Peonia's exchange remains a non-claim with no Prize reaction or increment; both controllers tested. The printed Dream Ball trigger is documented at https://asia.pokemon-card.com/ph/card-search/detail/1720/ .
- CPU Treasure Energy: rank recipient by reduction in printed attack Energy deficits, favor Active only as a tiebreaker, not unconditional preference. CPU Dream Ball: rank legal deck choices by HP, compatible attack cost and evolution stage rather than top-deck order. No opponent private information used.

## Limits
This is a targeted audit, not exhaustive rules certification. Unusual historical Prize and Supporter combinations, legacy hybrid Zone adaptations, and Android APK/device testing remain separate. The independent test file runs in both full offline preparation and Gradle APK gate.
