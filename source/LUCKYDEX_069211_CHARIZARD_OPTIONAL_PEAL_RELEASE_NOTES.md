# LuckyDex v0.69.211 — Charizard δ Peal of Thunder optional trigger

## Report / root cause

In v0.69.210, evolving ex14-4 Charizard δ immediately spliced the top five real draw-deck cards and proceeded to target selection. This effectively forced Peal of Thunder even though the printed Power says **may** look at the top five cards.

## Correct rule (C-EX14-POWER-009)

When played from hand to evolve, offer **Use Peal of Thunder** and **Decline Peal of Thunder** first. Declining leaves the physical deck, hand and discard unchanged. Choosing Use reveals up to five actual physical cards; the player selects one Pokémon and may attach any number of eligible revealed Energy, even none; other revealed cards are discarded. Double Rainbow restrictions remain enforced. This never uses the unlimited Basic Energy Zone.

CPU Beginner/Intermediate/Advanced/Expert chooses Use if a physical Energy card remains somewhere in its deck, otherwise Decline. It does not inspect the order of the top five before choosing. The separate Metal Burn discard effect remains unchanged, as the user confirmed it works.

## Files / testing

- `app/src/main/assets/tcgp-battle-effects.js`: move Peal top-five splice after opt-in
- `app/src/main/assets/tcgp-battle-ai.js`: sensible CPU optional decision
- `tests/v07211-charizard-peal-optional.test.cjs`: decline, accept, zero attachments, four CPU levels
- `tests/v07210-crystal-charizard-physical-energy.test.cjs`: acknowledge new activation choice in existing tests
- `docs/LUCKYDEX_MASTER_RULES.txt`: C-EX14-POWER-009 and v2.5 update
- Updated version labels and Android versionCode to 7191

State-level Node tests only. No Android phone QA or GitHub push performed.
