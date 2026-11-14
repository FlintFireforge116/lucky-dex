# LuckyDex Classic audit — dp4 / Great Encounters

**Status:** No definite catalog/schema failures; 0 warnings; 5 follow-up flags.

**Coverage:** 106/106 enabled, 0 gated. 172 attacks, 28 named abilities; 67/106 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 28 |
| privacy | 1 |
| timing | 20 |
| energyMovement | 22 |
| status | 15 |
| deckSearch | 14 |
| coin | 43 |

## Generated CPU decks

16/16 legal 30-card decks across eight Energy types (two seeds each).

## Synthetic battle action checks

352/356 actions executed; 4 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 84 cards flagged.

- **dp4-1 Blaziken** — choice, energyMovement
- **dp4-2 Cresselia** — choice, energyMovement
- **dp4-3 Darkrai** — deckSearch
- **dp4-4 Darkrai** — choice, status
- **dp4-5 Pachirisu** — choice, deckSearch
- **dp4-6 Porygon-Z** — energyMovement, coin
- **dp4-7 Rotom** — choice, deckSearch, coin
- **dp4-8 Sceptile** — energyMovement, coin
- **dp4-9 Swampert** — energyMovement
- **dp4-10 Tangrowth** — choice, timing, energyMovement
- **dp4-11 Togekiss** — energyMovement, deckSearch, coin
- **dp4-12 Altaria** — timing, coin
- **dp4-13 Beedrill** — coin
- **dp4-14 Butterfree** — status, coin
- **dp4-15 Claydol** — choice
- **dp4-16 Dialga** — choice, energyMovement
- **dp4-17 Exploud** — timing
- **dp4-18 Houndoom** — choice, energyMovement
- **dp4-19 Hypno** — status
- **dp4-21 Lapras** — energyMovement
- **dp4-22 Latias** — energyMovement
- **dp4-23 Latios** — energyMovement, deckSearch, coin
- **dp4-24 Mawile** — choice, privacy, timing
- **dp4-25 Milotic** — choice, coin; ability Marvel Scale: no-op effect; verify separately implemented passive/continuous rule.
- **dp4-26 Palkia** — choice, energyMovement, deckSearch, coin
- **dp4-27 Primeape** — timing, coin
- **dp4-28 Slowking** — timing, deckSearch
- **dp4-30 Wailord** — timing, status; ability Sleeping Pulse: no-op effect; verify separately implemented passive/continuous rule.
- **dp4-31 Weezing** — timing, status, coin; ability Toxic Virus: no-op effect; verify separately implemented passive/continuous rule.
- **dp4-32 Wigglytuff** — status
- **dp4-33 Arbok** — status, coin
- **dp4-34 Cacturne** — coin
- **dp4-35 Combusken** — timing, coin
- **dp4-36 Delibird** — deckSearch, coin
- **dp4-37 Floatzel** — choice, timing, coin
- **dp4-38 Gorebyss** — choice
- **dp4-39 Granbull** — timing
- **dp4-40 Grovyle** — choice
- **dp4-41 Hariyama** — coin
- **dp4-42 Huntail** — timing, energyMovement, coin
- **dp4-44 Loudred** — choice, coin
- **dp4-45 Magcargo** — choice, status
- **dp4-47 Metapod** — coin
- **dp4-48 Pelipper** — choice, energyMovement
- **dp4-50 Purugly** — energyMovement, coin
- **dp4-51 Relicanth** — choice, status
- **dp4-52 Seviper** — timing, coin
- **dp4-53 Skarmory** — timing, energyMovement, coin
- **dp4-54 Slowbro** — choice, timing
- **dp4-55 Togetic** — choice
- **dp4-56 Unown [F]** — choice, coin
- **dp4-58 Wailmer** — coin
- **dp4-62 Cacnea** — timing, coin
- **dp4-63 Caterpie** — coin
- **dp4-64 Clamperl** — coin
- **dp4-65 Drowzee** — status
- **dp4-66 Ekans** — coin
- **dp4-67 Feebas** — deckSearch
- **dp4-69 Houndour** — energyMovement, coin
- **dp4-71 Illumise** — status, deckSearch, coin
- **dp4-72 Jigglypuff** — timing, status
- **dp4-73 Kakuna** — timing
- **dp4-76 Lunatone** — choice
- **dp4-77 Luvdisc** — energyMovement
- **dp4-78 Makuhita** — energyMovement, coin
- **dp4-80 Mudkip** — coin
- **dp4-81 Porygon** — deckSearch
- **dp4-82 Slowpoke** — timing, status
- **dp4-83 Slugma** — coin
- **dp4-85 Solrock** — source review; ability Sunlight: no-op effect; verify separately implemented passive/continuous rule.
- **dp4-86 Swablu** — coin
- **dp4-88 Togepi** — status, deckSearch, coin
- **dp4-90 Treecko** — choice
- **dp4-91 Unown [L]** — choice, energyMovement; ability LINK: no-op effect; verify separately implemented passive/continuous rule.
- **dp4-92 Volbeat** — coin
- **dp4-93 Weedle** — deckSearch, coin
- **dp4-94 Whismur** — coin
- **dp4-96 Zigzagoon** — coin
- **dp4-98 Felicity's Drawing** — choice
- **dp4-101 Premier Ball** — deckSearch
- **dp4-102 Rare Candy** — choice
- **dp4-104 Darkrai LV.X** — status, coin
- **dp4-105 Dialga LV.X** — timing, coin
- **dp4-106 Palkia LV.X** — choice, energyMovement

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| dp4-1 Blaziken | enabled | 2 | 0 | choice, energyMovement | 1 |
| dp4-2 Cresselia | enabled | 2 | 0 | choice, energyMovement | 3 |
| dp4-3 Darkrai | enabled | 2 | 0 | deckSearch | 2 |
| dp4-4 Darkrai | enabled | 2 | 0 | choice, status | 1 |
| dp4-5 Pachirisu | enabled | 2 | 0 | choice, deckSearch | 1 |
| dp4-6 Porygon-Z | enabled | 1 | 1 | energyMovement, coin | 1 |
| dp4-7 Rotom | enabled | 2 | 0 | choice, deckSearch, coin | 0 |
| dp4-8 Sceptile | enabled | 1 | 1 | energyMovement, coin | 1 |
| dp4-9 Swampert | enabled | 1 | 1 | energyMovement | 2 |
| dp4-10 Tangrowth | enabled | 2 | 0 | choice, timing, energyMovement | 1 |
| dp4-11 Togekiss | enabled | 1 | 1 | energyMovement, deckSearch, coin | 0 |
| dp4-12 Altaria | enabled | 2 | 0 | timing, coin | 1 |
| dp4-13 Beedrill | enabled | 2 | 0 | coin | 0 |
| dp4-14 Butterfree | enabled | 2 | 0 | status, coin | 1 |
| dp4-15 Claydol | enabled | 1 | 1 | choice | 1 |
| dp4-16 Dialga | enabled | 2 | 0 | choice, energyMovement | 1 |
| dp4-17 Exploud | enabled | 2 | 0 | timing | 1 |
| dp4-18 Houndoom | enabled | 2 | 0 | choice, energyMovement | 1 |
| dp4-19 Hypno | enabled | 2 | 0 | status | 2 |
| dp4-20 Kingler | enabled | 2 | 0 |  | 0 |
| dp4-21 Lapras | enabled | 2 | 0 | energyMovement | 1 |
| dp4-22 Latias | enabled | 2 | 0 | energyMovement | 1 |
| dp4-23 Latios | enabled | 2 | 0 | energyMovement, deckSearch, coin | 1 |
| dp4-24 Mawile | enabled | 2 | 0 | choice, privacy, timing | 1 |
| dp4-25 Milotic | enabled | 1 | 1 | choice, coin | 2 |
| dp4-26 Palkia | enabled | 2 | 0 | choice, energyMovement, deckSearch, coin | 1 |
| dp4-27 Primeape | enabled | 1 | 1 | timing, coin | 1 |
| dp4-28 Slowking | enabled | 1 | 1 | timing, deckSearch | 0 |
| dp4-29 Unown [H] | enabled | 1 | 1 |  | 0 |
| dp4-30 Wailord | enabled | 1 | 1 | timing, status | 4 |
| dp4-31 Weezing | enabled | 1 | 1 | timing, status, coin | 1 |
| dp4-32 Wigglytuff | enabled | 1 | 1 | status | 1 |
| dp4-33 Arbok | enabled | 2 | 0 | status, coin | 0 |
| dp4-34 Cacturne | enabled | 2 | 0 | coin | 0 |
| dp4-35 Combusken | enabled | 2 | 0 | timing, coin | 1 |
| dp4-36 Delibird | enabled | 2 | 0 | deckSearch, coin | 0 |
| dp4-37 Floatzel | enabled | 2 | 0 | choice, timing, coin | 0 |
| dp4-38 Gorebyss | enabled | 2 | 0 | choice | 1 |
| dp4-39 Granbull | enabled | 2 | 0 | timing | 0 |
| dp4-40 Grovyle | enabled | 2 | 0 | choice | 0 |
| dp4-41 Hariyama | enabled | 2 | 0 | coin | 1 |
| dp4-42 Huntail | enabled | 2 | 0 | timing, energyMovement, coin | 1 |
| dp4-43 Linoone | enabled | 2 | 0 |  | 1 |
| dp4-44 Loudred | enabled | 2 | 0 | choice, coin | 0 |
| dp4-45 Magcargo | enabled | 1 | 1 | choice, status | 1 |
| dp4-46 Marshtomp | enabled | 2 | 0 |  | 1 |
| dp4-47 Metapod | enabled | 1 | 1 | coin | 1 |
| dp4-48 Pelipper | enabled | 2 | 0 | choice, energyMovement | 1 |
| dp4-49 Porygon2 | enabled | 1 | 1 |  | 1 |
| dp4-50 Purugly | enabled | 2 | 0 | energyMovement, coin | 0 |
| dp4-51 Relicanth | enabled | 2 | 0 | choice, status | 0 |
| dp4-52 Seviper | enabled | 2 | 0 | timing, coin | 0 |
| dp4-53 Skarmory | enabled | 2 | 0 | timing, energyMovement, coin | 0 |
| dp4-54 Slowbro | enabled | 2 | 0 | choice, timing | 0 |
| dp4-55 Togetic | enabled | 2 | 0 | choice | 1 |
| dp4-56 Unown [F] | enabled | 1 | 1 | choice, coin | 2 |
| dp4-57 Unown [G] | enabled | 1 | 1 |  | 1 |
| dp4-58 Wailmer | enabled | 2 | 0 | coin | 0 |
| dp4-59 Zangoose | enabled | 2 | 0 |  | 0 |
| dp4-60 Baltoy | enabled | 2 | 0 |  | 0 |
| dp4-61 Buizel | enabled | 2 | 0 |  | 4 |
| dp4-62 Cacnea | enabled | 2 | 0 | timing, coin | 1 |
| dp4-63 Caterpie | enabled | 1 | 1 | coin | 1 |
| dp4-64 Clamperl | enabled | 2 | 0 | coin | 1 |
| dp4-65 Drowzee | enabled | 2 | 0 | status | 1 |
| dp4-66 Ekans | enabled | 2 | 0 | coin | 0 |
| dp4-67 Feebas | enabled | 2 | 0 | deckSearch | 1 |
| dp4-68 Glameow | enabled | 2 | 0 |  | 0 |
| dp4-69 Houndour | enabled | 2 | 0 | energyMovement, coin | 0 |
| dp4-70 Igglybuff | enabled | 1 | 1 |  | 1 |
| dp4-71 Illumise | enabled | 1 | 1 | status, deckSearch, coin | 1 |
| dp4-72 Jigglypuff | enabled | 2 | 0 | timing, status | 1 |
| dp4-73 Kakuna | enabled | 2 | 0 | timing | 0 |
| dp4-74 Koffing | enabled | 2 | 0 |  | 0 |
| dp4-75 Krabby | enabled | 2 | 0 |  | 0 |
| dp4-76 Lunatone | enabled | 1 | 1 | choice | 1 |
| dp4-77 Luvdisc | enabled | 2 | 0 | energyMovement | 1 |
| dp4-78 Makuhita | enabled | 2 | 0 | energyMovement, coin | 0 |
| dp4-79 Mankey | enabled | 2 | 0 |  | 0 |
| dp4-80 Mudkip | enabled | 2 | 0 | coin | 0 |
| dp4-81 Porygon | enabled | 2 | 0 | deckSearch | 0 |
| dp4-82 Slowpoke | enabled | 2 | 0 | timing, status | 0 |
| dp4-83 Slugma | enabled | 2 | 0 | coin | 0 |
| dp4-84 Snubbull | enabled | 2 | 0 |  | 0 |
| dp4-85 Solrock | enabled | 1 | 1 |  | 1 |
| dp4-86 Swablu | enabled | 2 | 0 | coin | 0 |
| dp4-87 Tangela | enabled | 2 | 0 |  | 0 |
| dp4-88 Togepi | enabled | 2 | 0 | status, deckSearch, coin | 1 |
| dp4-89 Torchic | enabled | 2 | 0 |  | 3 |
| dp4-90 Treecko | enabled | 2 | 0 | choice | 2 |
| dp4-91 Unown [L] | enabled | 1 | 1 | choice, energyMovement | 2 |
| dp4-92 Volbeat | enabled | 1 | 1 | coin | 1 |
| dp4-93 Weedle | enabled | 2 | 0 | deckSearch, coin | 4 |
| dp4-94 Whismur | enabled | 2 | 0 | coin | 0 |
| dp4-95 Wingull | enabled | 2 | 0 |  | 0 |
| dp4-96 Zigzagoon | enabled | 2 | 0 | coin | 1 |
| dp4-97 Amulet Coin | enabled | 0 | 0 |  | 2 |
| dp4-98 Felicity's Drawing | enabled | 0 | 0 | choice | 2 |
| dp4-99 Leftovers | enabled | 0 | 0 |  | 2 |
| dp4-100 Moonlight Stadium | enabled | 0 | 0 |  | 1 |
| dp4-101 Premier Ball | enabled | 0 | 0 | deckSearch | 1 |
| dp4-102 Rare Candy | enabled | 0 | 0 | choice | 0 |
| dp4-103 Cresselia LV.X | enabled | 1 | 1 |  | 2 |
| dp4-104 Darkrai LV.X | enabled | 1 | 1 | status, coin | 1 |
| dp4-105 Dialga LV.X | enabled | 1 | 1 | timing, coin | 1 |
| dp4-106 Palkia LV.X | enabled | 1 | 1 | choice, energyMovement | 2 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

