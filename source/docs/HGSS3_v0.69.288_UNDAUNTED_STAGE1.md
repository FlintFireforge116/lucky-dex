# LuckyDex v0.69.288 — HGSS Undaunted Stage 1

## Authentic print catalogue
- Pinned to PokemonTCG/pokemon-tcg-data commit `7ee26f8d2914651ccc854244a79ec7049aec66d1`, blob SHA `1aa80099ee71f088bd009dc6499152075cee648c`.
- **91 distinct collector prints**: numbered 1–90 plus secret Alph Lithograph `THREE`.
- 80 Pokémon, 9 Trainers, 2 special Energy. Preserves print attack text, stats, weaknesses, resistances and Poké-Power versus Poké-Body classification.
- 50 battle-enabled cards. Remaining 41 are visible to collectors but excluded from player/CPU battle decks pending faithful mechanics. This is a STAGE 1 pass, not a full completion audit.

## Executable mapped mechanics
- Choice-aware Steel Coat searches a physical Metal Energy in the deck, selects a friendly Pokémon, attaches it and shuffles the deck.
- Fresh-Picked Fruit chooses a friendly Benched Pokémon and heals 60 damage.
- Raichu Prime Voltage Increase moves a real Lightning Energy from a different friendly Pokémon to Raichu, repeatedly where legal; special Rainbow Energy is eligible while attached.
- Umbreon Prime Evoblast counts Eevee evolutions in play and applies its +10 per Pokémon before Weakness/Resistance.
- Printed variable-damage attacks include Sneasel Beat Up (one flip per Pokémon in play), Forretress Everyone Explode Now (Pineco/Forretress count plus self-spread), Mismagius Poltergeist (opponent Trainer/Supporter/Stadium cards in hand), Leafeon Miasma Wind (conditions on defender), Honchkrow Vengeance (Darkness Pokémon in discard), Combee Enraged Assault (damaged Benched Vespiquen), and Hariyama Backward Belt Throw (optional recoil with increased damage).
- Unown DARK searches the printed Darkness Energy from deck on the correct Bench trigger.
- Both two-half LEGEND pairs are correctly represented but **gated together** pending the printed multi-target discard and extra-Prize timing. They cannot enter player or CPU decks as mismatched halves.
- Undaunted Special Darkness/Metal Energy effects are still gated pending verification of type-conditional +10/-10 damage; their printed artwork is collectible.

## Release checks
- Run `python3 scripts/build-hgss3.py` to regenerate and validate the pinned set.
- Run `node --test tests/v07288-undaunted-stage1.test.cjs` (mandatory GitHub build gate).
- Run `node scripts/audit-classic-set.cjs --set hgss3 --smoke --no-write` (mandatory GitHub build gate).
- Cross-set regression runs include v07283-87 HGSS compatibility tests.

## Next implementation pass
Complete all remaining 41 gated prints, prioritising the two LEGEND pairs, six Pokémon Prime interactions, Trainers/Stadiums and new Special Energy cards, then independently audit game/CPU/optional choices. Never mark an unimplemented complex printed rule as battle-enabled.
