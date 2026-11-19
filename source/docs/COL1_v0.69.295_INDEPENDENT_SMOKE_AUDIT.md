# LuckyDex Classic audit — col1 / Call of Legends

**Status:** No definite catalog/schema failures; 0 warnings; 0 follow-up flags.

**Coverage:** 106/106 enabled, 0 gated. 138 attacks, 14 named abilities; 5/106 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 19 |
| privacy | 6 |
| timing | 15 |
| energyMovement | 24 |
| status | 19 |
| deckSearch | 20 |
| coin | 35 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

296/296 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 80 cards flagged.

- **col1-2 Deoxys** — energyMovement
- **col1-3 Dialga** — deckSearch
- **col1-4 Espeon** — choice, status, coin
- **col1-5 Forretress** — timing, coin
- **col1-6 Groudon** — deckSearch, coin
- **col1-7 Gyarados** — energyMovement
- **col1-8 Hitmontop** — timing, coin
- **col1-9 Ho-Oh** — energyMovement, coin
- **col1-11 Jirachi** — choice, energyMovement, coin
- **col1-12 Kyogre** — coin
- **col1-13 Leafeon** — status
- **col1-15 Lugia** — choice
- **col1-16 Magmortar** — energyMovement, deckSearch
- **col1-17 Ninetales** — choice, energyMovement, status
- **col1-18 Pachirisu** — choice, energyMovement
- **col1-20 Rayquaza** — energyMovement
- **col1-21 Smeargle** — choice, privacy, status, coin
- **col1-22 Umbreon** — timing, coin
- **col1-23 Ampharos** — choice, energyMovement, deckSearch, coin
- **col1-24 Cleffa** — status, deckSearch
- **col1-27 Meganium** — status
- **col1-28 Mismagius** — privacy, status, coin
- **col1-29 Mr. Mime** — choice, status, coin
- **col1-30 Pidgeot** — timing, coin
- **col1-31 Skarmory** — deckSearch
- **col1-32 Slowking** — choice, status, deckSearch, coin
- **col1-33 Snorlax** — timing
- **col1-34 Tangrowth** — energyMovement, status, coin
- **col1-35 Typhlosion** — energyMovement
- **col1-36 Tyrogue** — status
- **col1-37 Ursaring** — coin
- **col1-38 Weezing** — status
- **col1-39 Zangoose** — choice, privacy, timing
- **col1-41 Croconaw** — timing
- **col1-42 Donphan** — coin
- **col1-43 Flaaffy** — choice, status, coin
- **col1-44 Flareon** — energyMovement
- **col1-45 Jolteon** — timing, coin
- **col1-46 Magby** — status
- **col1-47 Mime Jr.** — status
- **col1-48 Pidgeotto** — energyMovement, coin
- **col1-49 Quilava** — energyMovement
- **col1-50 Riolu** — timing
- **col1-51 Seviper** — status
- **col1-52 Vaporeon** — choice
- **col1-54 Clefairy** — timing
- **col1-55 Cyndaquil** — energyMovement, coin
- **col1-57 Hitmonchan** — timing, coin
- **col1-59 Houndour** — coin
- **col1-60 Koffing** — timing, coin
- **col1-64 Mawile** — choice, privacy, energyMovement, status, deckSearch, coin
- **col1-66 Phanpy** — coin
- **col1-67 Pidgey** — deckSearch
- **col1-68 Pineco** — timing, coin
- **col1-69 Relicanth** — choice, timing
- **col1-70 Slowpoke** — coin
- **col1-72 Tangela** — status, deckSearch
- **col1-73 Teddiursa** — timing, coin
- **col1-74 Totodile** — coin
- **col1-75 Vulpix** — energyMovement, status, coin
- **col1-76 Cheerleader's Cheer** — choice
- **col1-77 Copycat** — deckSearch
- **col1-78 Dual Ball** — deckSearch, coin
- **col1-79 Interviewer's Questions** — choice, privacy, deckSearch
- **col1-80 Lost Remover** — energyMovement
- **col1-81 Lost World** — choice
- **col1-82 Professor Elm's Training Method** — deckSearch
- **col1-83 Professor Oak's New Theory** — deckSearch
- **col1-84 Research Record** — deckSearch
- **col1-85 Sage's Training** — choice, privacy, deckSearch
- **col1-86 Darkness Energy** — energyMovement
- **col1-87 Metal Energy** — energyMovement
- **col1-SL1 Deoxys** — energyMovement
- **col1-SL2 Dialga** — deckSearch
- **col1-SL3 Entei** — energyMovement, deckSearch
- **col1-SL4 Groudon** — deckSearch, coin
- **col1-SL5 Ho-Oh** — energyMovement, coin
- **col1-SL6 Kyogre** — coin
- **col1-SL7 Lugia** — choice
- **col1-SL10 Rayquaza** — energyMovement

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| col1-1 Clefable | enabled | 2 | 0 |  | 0 |
| col1-2 Deoxys | enabled | 1 | 0 | energyMovement | 0 |
| col1-3 Dialga | enabled | 1 | 0 | deckSearch | 0 |
| col1-4 Espeon | enabled | 2 | 0 | choice, status, coin | 0 |
| col1-5 Forretress | enabled | 2 | 0 | timing, coin | 0 |
| col1-6 Groudon | enabled | 1 | 0 | deckSearch, coin | 0 |
| col1-7 Gyarados | enabled | 2 | 0 | energyMovement | 0 |
| col1-8 Hitmontop | enabled | 2 | 0 | timing, coin | 0 |
| col1-9 Ho-Oh | enabled | 2 | 0 | energyMovement, coin | 0 |
| col1-10 Houndoom | enabled | 2 | 0 |  | 0 |
| col1-11 Jirachi | enabled | 1 | 1 | choice, energyMovement, coin | 0 |
| col1-12 Kyogre | enabled | 1 | 0 | coin | 0 |
| col1-13 Leafeon | enabled | 2 | 0 | status | 0 |
| col1-14 Lucario | enabled | 2 | 0 |  | 0 |
| col1-15 Lugia | enabled | 2 | 0 | choice | 0 |
| col1-16 Magmortar | enabled | 2 | 0 | energyMovement, deckSearch | 0 |
| col1-17 Ninetales | enabled | 1 | 1 | choice, energyMovement, status | 0 |
| col1-18 Pachirisu | enabled | 1 | 1 | choice, energyMovement | 0 |
| col1-19 Palkia | enabled | 1 | 0 |  | 0 |
| col1-20 Rayquaza | enabled | 1 | 0 | energyMovement | 0 |
| col1-21 Smeargle | enabled | 1 | 1 | choice, privacy, status, coin | 0 |
| col1-22 Umbreon | enabled | 2 | 0 | timing, coin | 0 |
| col1-23 Ampharos | enabled | 2 | 0 | choice, energyMovement, deckSearch, coin | 0 |
| col1-24 Cleffa | enabled | 1 | 1 | status, deckSearch | 0 |
| col1-25 Feraligatr | enabled | 2 | 0 |  | 0 |
| col1-26 Granbull | enabled | 2 | 0 |  | 0 |
| col1-27 Meganium | enabled | 2 | 0 | status | 0 |
| col1-28 Mismagius | enabled | 2 | 0 | privacy, status, coin | 0 |
| col1-29 Mr. Mime | enabled | 1 | 1 | choice, status, coin | 0 |
| col1-30 Pidgeot | enabled | 2 | 0 | timing, coin | 0 |
| col1-31 Skarmory | enabled | 2 | 0 | deckSearch | 0 |
| col1-32 Slowking | enabled | 1 | 1 | choice, status, deckSearch, coin | 0 |
| col1-33 Snorlax | enabled | 2 | 0 | timing | 0 |
| col1-34 Tangrowth | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| col1-35 Typhlosion | enabled | 2 | 0 | energyMovement | 0 |
| col1-36 Tyrogue | enabled | 1 | 1 | status | 0 |
| col1-37 Ursaring | enabled | 2 | 0 | coin | 0 |
| col1-38 Weezing | enabled | 2 | 0 | status | 0 |
| col1-39 Zangoose | enabled | 2 | 0 | choice, privacy, timing | 0 |
| col1-40 Bayleef | enabled | 2 | 0 |  | 0 |
| col1-41 Croconaw | enabled | 2 | 0 | timing | 0 |
| col1-42 Donphan | enabled | 2 | 0 | coin | 0 |
| col1-43 Flaaffy | enabled | 2 | 0 | choice, status, coin | 0 |
| col1-44 Flareon | enabled | 2 | 0 | energyMovement | 0 |
| col1-45 Jolteon | enabled | 2 | 0 | timing, coin | 0 |
| col1-46 Magby | enabled | 1 | 1 | status | 0 |
| col1-47 Mime Jr. | enabled | 1 | 1 | status | 0 |
| col1-48 Pidgeotto | enabled | 2 | 0 | energyMovement, coin | 0 |
| col1-49 Quilava | enabled | 2 | 0 | energyMovement | 0 |
| col1-50 Riolu | enabled | 1 | 0 | timing | 0 |
| col1-51 Seviper | enabled | 2 | 0 | status | 0 |
| col1-52 Vaporeon | enabled | 2 | 0 | choice | 0 |
| col1-53 Chikorita | enabled | 2 | 0 |  | 0 |
| col1-54 Clefairy | enabled | 2 | 0 | timing | 0 |
| col1-55 Cyndaquil | enabled | 1 | 0 | energyMovement, coin | 0 |
| col1-56 Eevee | enabled | 2 | 0 |  | 0 |
| col1-57 Hitmonchan | enabled | 2 | 0 | timing, coin | 0 |
| col1-58 Hitmonlee | enabled | 2 | 0 |  | 0 |
| col1-59 Houndour | enabled | 1 | 0 | coin | 0 |
| col1-60 Koffing | enabled | 2 | 0 | timing, coin | 0 |
| col1-61 Magikarp | enabled | 1 | 0 |  | 0 |
| col1-62 Magmar | enabled | 2 | 0 |  | 0 |
| col1-63 Mareep | enabled | 1 | 0 |  | 0 |
| col1-64 Mawile | enabled | 2 | 0 | choice, privacy, energyMovement, status, deckSearch, coin | 0 |
| col1-65 Misdreavus | enabled | 2 | 0 |  | 0 |
| col1-66 Phanpy | enabled | 1 | 1 | coin | 0 |
| col1-67 Pidgey | enabled | 2 | 0 | deckSearch | 0 |
| col1-68 Pineco | enabled | 2 | 0 | timing, coin | 0 |
| col1-69 Relicanth | enabled | 2 | 0 | choice, timing | 0 |
| col1-70 Slowpoke | enabled | 1 | 0 | coin | 0 |
| col1-71 Snubbull | enabled | 2 | 0 |  | 0 |
| col1-72 Tangela | enabled | 2 | 0 | status, deckSearch | 0 |
| col1-73 Teddiursa | enabled | 1 | 0 | timing, coin | 0 |
| col1-74 Totodile | enabled | 1 | 0 | coin | 0 |
| col1-75 Vulpix | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| col1-76 Cheerleader's Cheer | enabled | 0 | 0 | choice | 0 |
| col1-77 Copycat | enabled | 0 | 0 | deckSearch | 0 |
| col1-78 Dual Ball | enabled | 0 | 0 | deckSearch, coin | 0 |
| col1-79 Interviewer's Questions | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| col1-80 Lost Remover | enabled | 0 | 0 | energyMovement | 0 |
| col1-81 Lost World | enabled | 0 | 0 | choice | 0 |
| col1-82 Professor Elm's Training Method | enabled | 0 | 0 | deckSearch | 0 |
| col1-83 Professor Oak's New Theory | enabled | 0 | 0 | deckSearch | 0 |
| col1-84 Research Record | enabled | 0 | 0 | deckSearch | 0 |
| col1-85 Sage's Training | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| col1-86 Darkness Energy | enabled | 0 | 0 | energyMovement | 1 |
| col1-87 Metal Energy | enabled | 0 | 0 | energyMovement | 1 |
| col1-88 Grass Energy | enabled | 0 | 0 |  | 0 |
| col1-89 Fire Energy | enabled | 0 | 0 |  | 0 |
| col1-90 Water Energy | enabled | 0 | 0 |  | 0 |
| col1-91 Lightning Energy | enabled | 0 | 0 |  | 1 |
| col1-92 Psychic Energy | enabled | 0 | 0 |  | 0 |
| col1-93 Fighting Energy | enabled | 0 | 0 |  | 0 |
| col1-94 Darkness Energy | enabled | 0 | 0 |  | 1 |
| col1-95 Metal Energy | enabled | 0 | 0 |  | 1 |
| col1-SL1 Deoxys | enabled | 1 | 0 | energyMovement | 0 |
| col1-SL2 Dialga | enabled | 1 | 0 | deckSearch | 0 |
| col1-SL3 Entei | enabled | 1 | 1 | energyMovement, deckSearch | 0 |
| col1-SL4 Groudon | enabled | 1 | 0 | deckSearch, coin | 0 |
| col1-SL5 Ho-Oh | enabled | 2 | 0 | energyMovement, coin | 0 |
| col1-SL6 Kyogre | enabled | 1 | 0 | coin | 0 |
| col1-SL7 Lugia | enabled | 2 | 0 | choice | 0 |
| col1-SL8 Palkia | enabled | 1 | 0 |  | 0 |
| col1-SL9 Raikou | enabled | 1 | 1 |  | 0 |
| col1-SL10 Rayquaza | enabled | 1 | 0 | energyMovement | 0 |
| col1-SL11 Suicune | enabled | 1 | 1 |  | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

