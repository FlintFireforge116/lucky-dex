# LuckyDex Classic audit — bw1 / Black & White

**Status:** No definite catalog/schema failures; 0 warnings; 19 follow-up flags.

**Coverage:** 115/115 enabled, 0 gated. 160 attacks, 5 named abilities; 0/115 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 19 |
| privacy | 3 |
| timing | 10 |
| energyMovement | 14 |
| status | 16 |
| deckSearch | 7 |
| coin | 40 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

340/346 actions executed; 4 skipped (not necessarily defects); 2 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 77 cards flagged.

- **bw1-2 Snivy** — coin
- **bw1-3 Servine** — status, coin
- **bw1-4 Servine** — energyMovement, status, coin
- **bw1-5 Serperior** — source review; attack Leaf Storm: custom rule bw1:leafStorm has no obvious source literal; inspect dispatcher.
- **bw1-6 Serperior** — timing, energyMovement; ability Royal Heal: custom rule bw1:royalHeal has no obvious source literal; inspect dispatcher.
- **bw1-8 Simisage** — coin
- **bw1-9 Petilil** — coin
- **bw1-10 Lilligant** — status, coin; attack Leaf Storm: custom rule bw1:leafStorm has no obvious source literal; inspect dispatcher.
- **bw1-11 Maractus** — coin
- **bw1-12 Maractus** — coin
- **bw1-13 Deerling** — coin
- **bw1-17 Pignite** — deckSearch; attack Flame Charge: custom rule bw1:flameCharge has no obvious source literal; inspect dispatcher.
- **bw1-18 Pignite** — energyMovement
- **bw1-19 Emboar** — energyMovement
- **bw1-20 Emboar** — choice, energyMovement; ability Inferno Fandango: custom rule bw1:infernoFandango has no obvious source literal; inspect dispatcher.
- **bw1-22 Simisear** — coin
- **bw1-23 Darumaka** — coin
- **bw1-24 Darumaka** — status
- **bw1-25 Darmanitan** — status, coin
- **bw1-26 Reshiram** — energyMovement
- **bw1-28 Oshawott** — coin
- **bw1-29 Dewott** — coin
- **bw1-30 Dewott** — coin
- **bw1-34 Simipour** — status, coin
- **bw1-35 Basculin** — energyMovement, coin
- **bw1-37 Swanna** — timing; attack Feather Dance: custom rule bw1:featherDance has no obvious source literal; inspect dispatcher.
- **bw1-39 Alomomola** — status
- **bw1-41 Blitzle** — coin
- **bw1-42 Zebstrika** — coin
- **bw1-44 Joltik** — status, coin
- **bw1-46 Galvantula** — timing
- **bw1-48 Munna** — status
- **bw1-49 Musharna** — status
- **bw1-51 Swoobat** — timing, coin
- **bw1-53 Whirlipede** — status
- **bw1-54 Scolipede** — status
- **bw1-55 Solosis** — deckSearch; attack Cell Culture: custom rule bw1:cellCulture has no obvious source literal; inspect dispatcher.
- **bw1-56 Duosion** — energyMovement
- **bw1-57 Reuniclus** — choice; ability Damage Swap: custom rule bw1:damageSwap has no obvious source literal; inspect dispatcher.
- **bw1-60 Gurdurr** — timing; attack Bulk Up: custom rule bw1:bulkUp has no obvious source literal; inspect dispatcher.
- **bw1-63 Sandile** — timing
- **bw1-64 Krokorok** — choice, timing; attack Torment: custom rule bw1:torment has no obvious source literal; inspect dispatcher.
- **bw1-65 Krookodile** — choice, timing; attack Torment: custom rule bw1:torment has no obvious source literal; inspect dispatcher.
- **bw1-69 Scrafty** — status, coin
- **bw1-70 Zorua** — coin
- **bw1-71 Zoroark** — choice, deckSearch
- **bw1-72 Vullaby** — coin
- **bw1-73 Mandibuzz** — source review; attack Blindside: custom rule bw1:blindside has no obvious source literal; inspect dispatcher.
- **bw1-74 Klink** — status, coin
- **bw1-75 Klang** — status, coin
- **bw1-76 Klinklang** — choice, energyMovement, coin
- **bw1-78 Patrat** — coin
- **bw1-79 Watchog** — status, coin
- **bw1-83 Stoutland** — timing, coin; attack Odor Sleuth: custom rule bw1:odorSleuth has no obvious source literal; inspect dispatcher.
- **bw1-84 Pidove** — coin
- **bw1-85 Tranquill** — coin
- **bw1-86 Unfezant** — timing, coin
- **bw1-87 Audino** — coin
- **bw1-88 Minccino** — coin
- **bw1-89 Cinccino** — coin
- **bw1-90 Bouffalant** — coin
- **bw1-91 Bouffalant** — coin
- **bw1-92 Energy Retrieval** — choice, energyMovement
- **bw1-93 Energy Search** — choice, privacy, energyMovement, deckSearch
- **bw1-94 Energy Switch** — choice, energyMovement; card effect: custom rule bw1:energySwitch has no obvious source literal; inspect dispatcher.
- **bw1-95 Full Heal** — choice
- **bw1-96 PlusPower** — choice
- **bw1-97 Poké Ball** — choice, privacy, deckSearch, coin
- **bw1-98 Pokédex** — choice, deckSearch
- **bw1-99 Pokémon Communication** — choice, privacy, deckSearch
- **bw1-100 Potion** — choice
- **bw1-101 Professor Juniper** — choice; card effect: custom rule bw1:professorJuniper has no obvious source literal; inspect dispatcher.
- **bw1-102 Revive** — choice; card effect: custom rule bw1:revive has no obvious source literal; inspect dispatcher.
- **bw1-103 Super Scoop Up** — choice, coin
- **bw1-104 Switch** — choice
- **bw1-113 Reshiram** — energyMovement
- **bw1-115 Pikachu** — energyMovement; attack Energize: custom rule bw1:energize has no obvious source literal; inspect dispatcher.

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| bw1-1 Snivy | enabled | 2 | 0 |  | 0 |
| bw1-2 Snivy | enabled | 1 | 0 | coin | 0 |
| bw1-3 Servine | enabled | 2 | 0 | status, coin | 0 |
| bw1-4 Servine | enabled | 1 | 0 | energyMovement, status, coin | 0 |
| bw1-5 Serperior | enabled | 2 | 0 |  | 0 |
| bw1-6 Serperior | enabled | 1 | 1 | timing, energyMovement | 0 |
| bw1-7 Pansage | enabled | 2 | 0 |  | 0 |
| bw1-8 Simisage | enabled | 2 | 0 | coin | 0 |
| bw1-9 Petilil | enabled | 1 | 0 | coin | 0 |
| bw1-10 Lilligant | enabled | 2 | 0 | status, coin | 0 |
| bw1-11 Maractus | enabled | 2 | 0 | coin | 0 |
| bw1-12 Maractus | enabled | 2 | 0 | coin | 0 |
| bw1-13 Deerling | enabled | 2 | 0 | coin | 0 |
| bw1-14 Sawsbuck | enabled | 2 | 0 |  | 0 |
| bw1-15 Tepig | enabled | 2 | 0 |  | 0 |
| bw1-16 Tepig | enabled | 1 | 0 |  | 0 |
| bw1-17 Pignite | enabled | 2 | 0 | deckSearch | 0 |
| bw1-18 Pignite | enabled | 2 | 0 | energyMovement | 0 |
| bw1-19 Emboar | enabled | 2 | 0 | energyMovement | 0 |
| bw1-20 Emboar | enabled | 1 | 1 | choice, energyMovement | 0 |
| bw1-21 Pansear | enabled | 2 | 0 |  | 0 |
| bw1-22 Simisear | enabled | 2 | 0 | coin | 0 |
| bw1-23 Darumaka | enabled | 1 | 0 | coin | 0 |
| bw1-24 Darumaka | enabled | 2 | 0 | status | 0 |
| bw1-25 Darmanitan | enabled | 2 | 0 | status, coin | 0 |
| bw1-26 Reshiram | enabled | 2 | 0 | energyMovement | 0 |
| bw1-27 Oshawott | enabled | 2 | 0 |  | 0 |
| bw1-28 Oshawott | enabled | 1 | 0 | coin | 0 |
| bw1-29 Dewott | enabled | 2 | 0 | coin | 0 |
| bw1-30 Dewott | enabled | 1 | 0 | coin | 0 |
| bw1-31 Samurott | enabled | 2 | 0 |  | 0 |
| bw1-32 Samurott | enabled | 1 | 1 |  | 0 |
| bw1-33 Panpour | enabled | 2 | 0 |  | 0 |
| bw1-34 Simipour | enabled | 2 | 0 | status, coin | 0 |
| bw1-35 Basculin | enabled | 1 | 0 | energyMovement, coin | 0 |
| bw1-36 Ducklett | enabled | 1 | 0 |  | 0 |
| bw1-37 Swanna | enabled | 2 | 0 | timing | 0 |
| bw1-38 Alomomola | enabled | 2 | 0 |  | 0 |
| bw1-39 Alomomola | enabled | 2 | 0 | status | 0 |
| bw1-40 Blitzle | enabled | 1 | 0 |  | 0 |
| bw1-41 Blitzle | enabled | 1 | 0 | coin | 0 |
| bw1-42 Zebstrika | enabled | 2 | 0 | coin | 0 |
| bw1-43 Zebstrika | enabled | 2 | 0 |  | 0 |
| bw1-44 Joltik | enabled | 1 | 0 | status, coin | 0 |
| bw1-45 Joltik | enabled | 1 | 0 |  | 0 |
| bw1-46 Galvantula | enabled | 2 | 0 | timing | 0 |
| bw1-47 Zekrom | enabled | 2 | 0 |  | 0 |
| bw1-48 Munna | enabled | 2 | 0 | status | 0 |
| bw1-49 Musharna | enabled | 2 | 0 | status | 0 |
| bw1-50 Woobat | enabled | 1 | 0 |  | 0 |
| bw1-51 Swoobat | enabled | 2 | 0 | timing, coin | 0 |
| bw1-52 Venipede | enabled | 2 | 0 |  | 0 |
| bw1-53 Whirlipede | enabled | 2 | 0 | status | 0 |
| bw1-54 Scolipede | enabled | 2 | 0 | status | 0 |
| bw1-55 Solosis | enabled | 2 | 0 | deckSearch | 0 |
| bw1-56 Duosion | enabled | 2 | 0 | energyMovement | 0 |
| bw1-57 Reuniclus | enabled | 1 | 1 | choice | 0 |
| bw1-58 Timburr | enabled | 1 | 0 |  | 0 |
| bw1-59 Timburr | enabled | 2 | 0 |  | 0 |
| bw1-60 Gurdurr | enabled | 2 | 0 | timing | 0 |
| bw1-61 Throh | enabled | 2 | 0 |  | 0 |
| bw1-62 Sawk | enabled | 2 | 0 |  | 0 |
| bw1-63 Sandile | enabled | 2 | 0 | timing | 0 |
| bw1-64 Krokorok | enabled | 2 | 0 | choice, timing | 0 |
| bw1-65 Krookodile | enabled | 2 | 0 | choice, timing | 0 |
| bw1-66 Purrloin | enabled | 2 | 0 |  | 0 |
| bw1-67 Liepard | enabled | 2 | 0 |  | 0 |
| bw1-68 Scraggy | enabled | 1 | 0 |  | 0 |
| bw1-69 Scrafty | enabled | 2 | 0 | status, coin | 0 |
| bw1-70 Zorua | enabled | 1 | 0 | coin | 0 |
| bw1-71 Zoroark | enabled | 2 | 0 | choice, deckSearch | 0 |
| bw1-72 Vullaby | enabled | 1 | 0 | coin | 0 |
| bw1-73 Mandibuzz | enabled | 2 | 0 |  | 0 |
| bw1-74 Klink | enabled | 1 | 0 | status, coin | 0 |
| bw1-75 Klang | enabled | 2 | 0 | status, coin | 0 |
| bw1-76 Klinklang | enabled | 1 | 1 | choice, energyMovement, coin | 0 |
| bw1-77 Patrat | enabled | 2 | 0 |  | 0 |
| bw1-78 Patrat | enabled | 1 | 0 | coin | 0 |
| bw1-79 Watchog | enabled | 2 | 0 | status, coin | 0 |
| bw1-80 Lillipup | enabled | 2 | 0 |  | 0 |
| bw1-81 Lillipup | enabled | 2 | 0 |  | 0 |
| bw1-82 Herdier | enabled | 2 | 0 |  | 0 |
| bw1-83 Stoutland | enabled | 2 | 0 | timing, coin | 0 |
| bw1-84 Pidove | enabled | 1 | 0 | coin | 0 |
| bw1-85 Tranquill | enabled | 2 | 0 | coin | 0 |
| bw1-86 Unfezant | enabled | 2 | 0 | timing, coin | 0 |
| bw1-87 Audino | enabled | 1 | 0 | coin | 0 |
| bw1-88 Minccino | enabled | 1 | 0 | coin | 0 |
| bw1-89 Cinccino | enabled | 2 | 0 | coin | 0 |
| bw1-90 Bouffalant | enabled | 2 | 0 | coin | 0 |
| bw1-91 Bouffalant | enabled | 2 | 0 | coin | 0 |
| bw1-92 Energy Retrieval | enabled | 0 | 0 | choice, energyMovement | 0 |
| bw1-93 Energy Search | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| bw1-94 Energy Switch | enabled | 0 | 0 | choice, energyMovement | 0 |
| bw1-95 Full Heal | enabled | 0 | 0 | choice | 0 |
| bw1-96 PlusPower | enabled | 0 | 0 | choice | 0 |
| bw1-97 Poké Ball | enabled | 0 | 0 | choice, privacy, deckSearch, coin | 0 |
| bw1-98 Pokédex | enabled | 0 | 0 | choice, deckSearch | 0 |
| bw1-99 Pokémon Communication | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| bw1-100 Potion | enabled | 0 | 0 | choice | 0 |
| bw1-101 Professor Juniper | enabled | 0 | 0 | choice | 0 |
| bw1-102 Revive | enabled | 0 | 0 | choice | 0 |
| bw1-103 Super Scoop Up | enabled | 0 | 0 | choice, coin | 0 |
| bw1-104 Switch | enabled | 0 | 0 | choice | 0 |
| bw1-105 Grass Energy | enabled | 0 | 0 |  | 0 |
| bw1-106 Fire Energy | enabled | 0 | 0 |  | 0 |
| bw1-107 Water Energy | enabled | 0 | 0 |  | 0 |
| bw1-108 Lightning Energy | enabled | 0 | 0 |  | 0 |
| bw1-109 Psychic Energy | enabled | 0 | 0 |  | 0 |
| bw1-110 Fighting Energy | enabled | 0 | 0 |  | 0 |
| bw1-111 Darkness Energy | enabled | 0 | 0 |  | 0 |
| bw1-112 Metal Energy | enabled | 0 | 0 |  | 0 |
| bw1-113 Reshiram | enabled | 2 | 0 | energyMovement | 0 |
| bw1-114 Zekrom | enabled | 2 | 0 |  | 0 |
| bw1-115 Pikachu | enabled | 2 | 0 | energyMovement | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

