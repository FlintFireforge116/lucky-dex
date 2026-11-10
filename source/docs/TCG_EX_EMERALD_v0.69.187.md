# EX Emerald (ex9) — v0.69.187 implementation notes

Date: 10 November 2026. For overarching rule precedence, read the current `LUCKYDEX_MASTER_RULES.txt` first. This file is a set-specific record, not a replacement.

## Source and registration

- Canonical card record: `pokemon-tcg-data/cards/en/ex9.json` (107 cards, numbers 1–107). Artwork uses Pokémon TCG image URL for each numbered card.
- Includes 11 Pokémon-ex, 11 Trainer cards, 4 Special Energy variants, 6 Basic Energy art variants and secret Farfetch'd.
- Full registry: `tcg-classic-emerald.js`, imported by `tcg-classic-battle-data.js` and index script.
- Classic set picker, normal card ownership lookup, 30-card player deck builder and CPU opponent deck selector contain `ex9`.
- Basic Energy artwork cards retain catalogue identity; routine Basic Energy is provided by LuckyDex's Energy Zone.

## Battle implementation

- Attack, Poké-Power/Body, Trainer, Tool, Stadium and Special Energy metadata reflect printed card text. The `ex9:` effect dispatcher in `tcgp-battle-effects.js` applies choices, targeted direct counter placements, move flags and trainer operations.
- Powers, Bodies and Energy handling: Form Change; Heal Dance; Water Cyclone; Baby Evolution; Blaze; Green Essence; Battle Frontier; Cursed Glare; Magma Armor; Dark Hole; Wise Aura; Mystic Scale; Rai-shield; Feebas/Swablu shields; Oran/Lum Berry; Double Rainbow, Multi, Darkness and Metal Energy.
- Printed effects overriding ordinary LuckyDex hybrid zones must honour explicit source and destination: Mr. Stone's Project may return Basic Pokémon or Basic Energy; Regirock ex's Mend takes actual discarded Fighting Energy; deck top-card effects use the draw deck.
- Direct-target moves choose the real board slot. Pure Power distributes its three counters by repeated choices; do not translate it into one ordinary 30-damage attack.

## Mandatory QA and limits

- `tests/v07187-ex-emerald.test.cjs`: registration, legal player/CPU generated decks, all attacks with two simulated runs, Trainers/choices, direct targeting, preview boost, damage distributions, discarded Energy and Bench protections.
- `tests/v07187-ex-emerald-audit.test.cjs`: Energy special cases, key Powers/Bodies, effect destinations, status, damage counters and cross-set conditions.
- Re-run recent prior-expansion tests for effect compatibility before release.
- Simulation tests check typical input and edge cases, **not** every possible battle state or Android touch interaction. Check specific oddities in Test Lab and report any inconsistency for targeted regression.
- No unrelated overall Bench/Prize-format decision was made: see open issues in the master rules.

Next chronological retail set: EX Unseen Forces (ex10), pending confirmation.

## v0.69.189 secondary audit — printed effects and cross-era Energy

- Combusken ex9-25 **Lava Burn** deals its printed 20 to Active AND 10 to the chosen opposing Bench. If no Bench exists, it still deals 20 to Active.
- EX Emerald PokéNav ex9-81 selects only from the actual top three, then permits reordering the remaining cards; with no eligible card it can reorder all three.
- Regice ex9-98 **Iceberg Crush** permits choosing which Basic or Special Energy to discard, rather than discarding an arbitrary first attachment.
- Double Rainbow ex9-87 reduces attack damage to each individual Active and Bench target, including attacks that ignore Weakness/Resistance.
- EX-era Special Darkness ex9-86 (and ex1-93) adds +10 before Weakness only to eligible Dark/Darkness attackers. Neo/e-Card prints have different after-Weakness, unrestricted +10 rules and their own drawback; do not unify across eras.
- Refined `deckMeta` role tags for Energy scaling vs true acceleration, sniping, spread and draw/search. EX Deoxys Lady Outing becomes viable in auto-builder under the updated Classic Zone-search rule.
- See `tests/v07189-ex9-energy-audit.test.cjs` and master rules C-ENERGY-013/014, C-METADATA-001, C-CHOICE-001. Node regressions cannot prove all Android touchscreen or multi-expansion interactions.
