# LuckyDex Classic audit — dp3 / Secret Wonders

**Status:** No definite catalog/schema failures; 0 warnings; 0 follow-up flags.

**Coverage:** 132/132 enabled, 0 gated. 194 attacks, 45 named abilities; 83/132 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 35 |
| privacy | 7 |
| timing | 24 |
| energyMovement | 31 |
| status | 19 |
| deckSearch | 14 |
| coin | 46 |

## Generated CPU decks

16/16 legal 30-card decks across eight Energy types (two seeds each).

## Synthetic battle action checks

408/408 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 101 cards flagged.

- **dp3-1 Ampharos** — choice, energyMovement
- **dp3-2 Blastoise** — energyMovement
- **dp3-3 Charizard** — energyMovement, coin
- **dp3-4 Entei** — energyMovement, coin
- **dp3-5 Flygon** — timing
- **dp3-6 Gallade** — privacy
- **dp3-7 Gardevoir** — choice, timing
- **dp3-8 Gastrodon East Sea** — choice
- **dp3-10 Ho-Oh** — energyMovement, coin
- **dp3-11 Jumpluff** — choice, timing, coin
- **dp3-12 Lickilicky** — choice, timing, coin
- **dp3-14 Lugia** — choice, energyMovement, coin
- **dp3-15 Mew** — choice, energyMovement
- **dp3-16 Raikou** — choice, energyMovement
- **dp3-17 Roserade** — status, coin
- **dp3-18 Salamence** — energyMovement
- **dp3-19 Suicune** — choice, timing
- **dp3-20 Venusaur** — choice, coin
- **dp3-22 Arcanine** — timing, energyMovement
- **dp3-23 Banette** — choice, deckSearch
- **dp3-24 Dugtrio** — timing, coin
- **dp3-25 Electivire** — energyMovement, coin
- **dp3-26 Electrode** — energyMovement
- **dp3-27 Furret** — choice, energyMovement
- **dp3-28 Golduck** — choice, timing
- **dp3-29 Golem** — choice, timing
- **dp3-30 Jynx** — status
- **dp3-31 Magmortar** — choice
- **dp3-32 Minun** — choice, energyMovement
- **dp3-33 Mothim** — timing
- **dp3-34 Nidoking** — timing, coin
- **dp3-36 Plusle** — choice, energyMovement
- **dp3-38 Sunflora** — status, coin
- **dp3-39 Unown [S]** — energyMovement, coin
- **dp3-40 Weavile** — choice
- **dp3-41 Wormadam Plant Cloak** — status
- **dp3-44 Xatu** — choice, energyMovement, status
- **dp3-46 Charmeleon** — energyMovement, status, coin
- **dp3-47 Cloyster** — choice, coin
- **dp3-49 Farfetch'd** — timing
- **dp3-50 Flaaffy** — deckSearch, coin
- **dp3-52 Kecleon** — energyMovement, coin
- **dp3-53 Kirlia** — choice
- **dp3-54 Lombre** — timing, coin
- **dp3-55 Miltank** — coin
- **dp3-56 Muk** — timing, status
- **dp3-57 Nidorino** — timing, status
- **dp3-58 Pidgeotto** — coin
- **dp3-59 Pinsir** — timing, coin
- **dp3-61 Raticate** — coin
- **dp3-62 Roselia** — status
- **dp3-63 Sableye** — choice, deckSearch
- **dp3-64 Shelgon** — timing
- **dp3-66 Smeargle** — choice, energyMovement, deckSearch, coin
- **dp3-67 Smoochum** — energyMovement, deckSearch, coin
- **dp3-69 Unown [N]** — coin
- **dp3-70 Unown [O]** — coin
- **dp3-71 Unown [X]** — deckSearch, coin
- **dp3-73 Venomoth** — timing, status
- **dp3-74 Vibrava** — energyMovement, coin
- **dp3-75 Wartortle** — timing
- **dp3-77 Bulbasaur** — status, coin
- **dp3-78 Burmy Plant Cloak** — energyMovement
- **dp3-79 Burmy Sandy Cloak** — energyMovement
- **dp3-80 Burmy Trash Cloak** — energyMovement
- **dp3-81 Carvanha** — privacy, coin
- **dp3-83 Clefairy** — coin
- **dp3-84 Corsola** — choice, deckSearch
- **dp3-86 Duskull** — choice, privacy, deckSearch, coin
- **dp3-87 Electabuzz** — coin
- **dp3-88 Grimer** — timing, coin
- **dp3-91 Lickitung** — coin
- **dp3-93 Magmar** — status
- **dp3-94 Mareep** — coin
- **dp3-95 Murkrow** — choice
- **dp3-96 Natu** — energyMovement, deckSearch, coin
- **dp3-97 Nidoran ♂** — status, coin
- **dp3-99 Pidgey** — timing
- **dp3-100 Psyduck** — status, coin
- **dp3-101 Qwilfish** — timing, coin
- **dp3-102 Ralts** — coin
- **dp3-103 Rattata** — timing, coin
- **dp3-104 Sentret** — choice, privacy, deckSearch
- **dp3-106 Shellos East Sea** — choice, deckSearch
- **dp3-107 Shellos West Sea** — energyMovement
- **dp3-108 Shroomish** — coin
- **dp3-109 Shuckle** — energyMovement, status
- **dp3-111 Spinda** — energyMovement
- **dp3-112 Squirtle** — status, coin
- **dp3-113 Stantler** — privacy, status, deckSearch
- **dp3-114 Sunkern** — coin
- **dp3-115 Trapinch** — timing
- **dp3-116 Venonat** — coin
- **dp3-118 Wooper** — choice, status
- **dp3-120 Night Maintenance** — choice, energyMovement, deckSearch
- **dp3-123 Professor Rowan** — deckSearch
- **dp3-124 Rival** — choice, privacy
- **dp3-125 Roseanne's Research** — choice, energyMovement
- **dp3-126 Team Galactic's Mars** — choice, privacy
- **dp3-131 Gardevoir LV.X** — choice, status
- **dp3-132 Honchkrow LV.X** — choice

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| dp3-1 Ampharos | enabled | 1 | 1 | choice, energyMovement | 1 |
| dp3-2 Blastoise | enabled | 1 | 1 | energyMovement | 2 |
| dp3-3 Charizard | enabled | 1 | 1 | energyMovement, coin | 2 |
| dp3-4 Entei | enabled | 1 | 1 | energyMovement, coin | 0 |
| dp3-5 Flygon | enabled | 1 | 1 | timing | 1 |
| dp3-6 Gallade | enabled | 2 | 0 | privacy | 1 |
| dp3-7 Gardevoir | enabled | 1 | 1 | choice, timing | 1 |
| dp3-8 Gastrodon East Sea | enabled | 1 | 1 | choice | 1 |
| dp3-9 Gastrodon West Sea | enabled | 2 | 0 |  | 1 |
| dp3-10 Ho-Oh | enabled | 1 | 1 | energyMovement, coin | 1 |
| dp3-11 Jumpluff | enabled | 1 | 1 | choice, timing, coin | 1 |
| dp3-12 Lickilicky | enabled | 2 | 0 | choice, timing, coin | 0 |
| dp3-13 Ludicolo | enabled | 1 | 1 |  | 1 |
| dp3-14 Lugia | enabled | 2 | 0 | choice, energyMovement, coin | 1 |
| dp3-15 Mew | enabled | 2 | 0 | choice, energyMovement | 0 |
| dp3-16 Raikou | enabled | 1 | 1 | choice, energyMovement | 1 |
| dp3-17 Roserade | enabled | 2 | 0 | status, coin | 2 |
| dp3-18 Salamence | enabled | 2 | 0 | energyMovement | 3 |
| dp3-19 Suicune | enabled | 1 | 1 | choice, timing | 0 |
| dp3-20 Venusaur | enabled | 1 | 1 | choice, coin | 1 |
| dp3-21 Absol | enabled | 2 | 0 |  | 1 |
| dp3-22 Arcanine | enabled | 1 | 1 | timing, energyMovement | 0 |
| dp3-23 Banette | enabled | 2 | 0 | choice, deckSearch | 0 |
| dp3-24 Dugtrio | enabled | 2 | 0 | timing, coin | 1 |
| dp3-25 Electivire | enabled | 1 | 1 | energyMovement, coin | 1 |
| dp3-26 Electrode | enabled | 1 | 1 | energyMovement | 1 |
| dp3-27 Furret | enabled | 2 | 0 | choice, energyMovement | 0 |
| dp3-28 Golduck | enabled | 2 | 0 | choice, timing | 1 |
| dp3-29 Golem | enabled | 2 | 0 | choice, timing | 1 |
| dp3-30 Jynx | enabled | 2 | 0 | status | 1 |
| dp3-31 Magmortar | enabled | 2 | 1 | choice | 1 |
| dp3-32 Minun | enabled | 1 | 1 | choice, energyMovement | 1 |
| dp3-33 Mothim | enabled | 2 | 0 | timing | 1 |
| dp3-34 Nidoking | enabled | 2 | 0 | timing, coin | 0 |
| dp3-35 Pidgeot | enabled | 2 | 0 |  | 2 |
| dp3-36 Plusle | enabled | 1 | 1 | choice, energyMovement | 0 |
| dp3-37 Sharpedo | enabled | 1 | 1 |  | 1 |
| dp3-38 Sunflora | enabled | 1 | 1 | status, coin | 1 |
| dp3-39 Unown [S] | enabled | 1 | 1 | energyMovement, coin | 0 |
| dp3-40 Weavile | enabled | 2 | 1 | choice | 1 |
| dp3-41 Wormadam Plant Cloak | enabled | 1 | 1 | status | 1 |
| dp3-42 Wormadam Sandy Cloak | enabled | 1 | 1 |  | 1 |
| dp3-43 Wormadam Trash Cloak | enabled | 1 | 1 |  | 1 |
| dp3-44 Xatu | enabled | 1 | 1 | choice, energyMovement, status | 0 |
| dp3-45 Breloom | enabled | 2 | 0 |  | 1 |
| dp3-46 Charmeleon | enabled | 2 | 0 | energyMovement, status, coin | 1 |
| dp3-47 Cloyster | enabled | 2 | 0 | choice, coin | 0 |
| dp3-48 Donphan | enabled | 2 | 0 |  | 1 |
| dp3-49 Farfetch'd | enabled | 2 | 0 | timing | 3 |
| dp3-50 Flaaffy | enabled | 2 | 0 | deckSearch, coin | 0 |
| dp3-51 Ivysaur | enabled | 2 | 0 |  | 0 |
| dp3-52 Kecleon | enabled | 1 | 1 | energyMovement, coin | 0 |
| dp3-53 Kirlia | enabled | 2 | 0 | choice | 0 |
| dp3-54 Lombre | enabled | 2 | 0 | timing, coin | 0 |
| dp3-55 Miltank | enabled | 2 | 0 | coin | 1 |
| dp3-56 Muk | enabled | 1 | 1 | timing, status | 0 |
| dp3-57 Nidorino | enabled | 2 | 0 | timing, status | 1 |
| dp3-58 Pidgeotto | enabled | 2 | 0 | coin | 0 |
| dp3-59 Pinsir | enabled | 2 | 0 | timing, coin | 1 |
| dp3-60 Quagsire | enabled | 1 | 1 |  | 1 |
| dp3-61 Raticate | enabled | 2 | 0 | coin | 1 |
| dp3-62 Roselia | enabled | 2 | 0 | status | 0 |
| dp3-63 Sableye | enabled | 2 | 0 | choice, deckSearch | 1 |
| dp3-64 Shelgon | enabled | 2 | 0 | timing | 1 |
| dp3-65 Skiploom | enabled | 1 | 1 |  | 0 |
| dp3-66 Smeargle | enabled | 2 | 0 | choice, energyMovement, deckSearch, coin | 0 |
| dp3-67 Smoochum | enabled | 1 | 1 | energyMovement, deckSearch, coin | 1 |
| dp3-68 Unown [K] | enabled | 1 | 1 |  | 1 |
| dp3-69 Unown [N] | enabled | 1 | 1 | coin | 1 |
| dp3-70 Unown [O] | enabled | 1 | 1 | coin | 1 |
| dp3-71 Unown [X] | enabled | 1 | 1 | deckSearch, coin | 1 |
| dp3-72 Unown [Z] | enabled | 1 | 1 |  | 1 |
| dp3-73 Venomoth | enabled | 1 | 1 | timing, status | 1 |
| dp3-74 Vibrava | enabled | 2 | 0 | energyMovement, coin | 0 |
| dp3-75 Wartortle | enabled | 2 | 0 | timing | 1 |
| dp3-76 Bagon | enabled | 2 | 0 |  | 1 |
| dp3-77 Bulbasaur | enabled | 2 | 0 | status, coin | 2 |
| dp3-78 Burmy Plant Cloak | enabled | 1 | 1 | energyMovement | 0 |
| dp3-79 Burmy Sandy Cloak | enabled | 1 | 1 | energyMovement | 0 |
| dp3-80 Burmy Trash Cloak | enabled | 1 | 1 | energyMovement | 0 |
| dp3-81 Carvanha | enabled | 2 | 0 | privacy, coin | 0 |
| dp3-82 Charmander | enabled | 2 | 0 |  | 4 |
| dp3-83 Clefairy | enabled | 1 | 0 | coin | 4 |
| dp3-84 Corsola | enabled | 2 | 0 | choice, deckSearch | 3 |
| dp3-85 Diglett | enabled | 2 | 0 |  | 3 |
| dp3-86 Duskull | enabled | 1 | 0 | choice, privacy, deckSearch, coin | 1 |
| dp3-87 Electabuzz | enabled | 2 | 0 | coin | 1 |
| dp3-88 Grimer | enabled | 2 | 0 | timing, coin | 0 |
| dp3-89 Growlithe | enabled | 2 | 0 |  | 0 |
| dp3-90 Hoppip | enabled | 1 | 1 |  | 0 |
| dp3-91 Lickitung | enabled | 2 | 0 | coin | 0 |
| dp3-92 Lotad | enabled | 2 | 0 |  | 1 |
| dp3-93 Magmar | enabled | 2 | 0 | status | 0 |
| dp3-94 Mareep | enabled | 2 | 0 | coin | 0 |
| dp3-95 Murkrow | enabled | 1 | 0 | choice | 1 |
| dp3-96 Natu | enabled | 2 | 0 | energyMovement, deckSearch, coin | 1 |
| dp3-97 Nidoran ♂ | enabled | 2 | 0 | status, coin | 0 |
| dp3-98 Phanpy | enabled | 2 | 0 |  | 0 |
| dp3-99 Pidgey | enabled | 2 | 0 | timing | 1 |
| dp3-100 Psyduck | enabled | 2 | 0 | status, coin | 1 |
| dp3-101 Qwilfish | enabled | 1 | 1 | timing, coin | 0 |
| dp3-102 Ralts | enabled | 2 | 0 | coin | 0 |
| dp3-103 Rattata | enabled | 2 | 0 | timing, coin | 1 |
| dp3-104 Sentret | enabled | 2 | 0 | choice, privacy, deckSearch | 1 |
| dp3-105 Shellder | enabled | 2 | 0 |  | 0 |
| dp3-106 Shellos East Sea | enabled | 2 | 0 | choice, deckSearch | 1 |
| dp3-107 Shellos West Sea | enabled | 2 | 0 | energyMovement | 1 |
| dp3-108 Shroomish | enabled | 2 | 0 | coin | 0 |
| dp3-109 Shuckle | enabled | 1 | 1 | energyMovement, status | 0 |
| dp3-110 Shuppet | enabled | 2 | 0 |  | 1 |
| dp3-111 Spinda | enabled | 2 | 0 | energyMovement | 1 |
| dp3-112 Squirtle | enabled | 2 | 0 | status, coin | 1 |
| dp3-113 Stantler | enabled | 2 | 0 | privacy, status, deckSearch | 1 |
| dp3-114 Sunkern | enabled | 2 | 0 | coin | 0 |
| dp3-115 Trapinch | enabled | 2 | 0 | timing | 0 |
| dp3-116 Venonat | enabled | 2 | 0 | coin | 0 |
| dp3-117 Voltorb | enabled | 2 | 0 |  | 0 |
| dp3-118 Wooper | enabled | 2 | 0 | choice, status | 0 |
| dp3-119 Bebe's Search | enabled | 0 | 0 |  | 1 |
| dp3-120 Night Maintenance | enabled | 0 | 0 | choice, energyMovement, deckSearch | 0 |
| dp3-121 PlusPower | enabled | 0 | 0 |  | 0 |
| dp3-122 Professor Oak's Visit | enabled | 0 | 0 |  | 2 |
| dp3-123 Professor Rowan | enabled | 0 | 0 | deckSearch | 2 |
| dp3-124 Rival | enabled | 0 | 0 | choice, privacy | 1 |
| dp3-125 Roseanne's Research | enabled | 0 | 0 | choice, energyMovement | 1 |
| dp3-126 Team Galactic's Mars | enabled | 0 | 0 | choice, privacy | 1 |
| dp3-127 Potion | enabled | 0 | 0 |  | 2 |
| dp3-128 Switch | enabled | 0 | 0 |  | 0 |
| dp3-129 Darkness Energy | enabled | 0 | 0 |  | 2 |
| dp3-130 Metal Energy | enabled | 0 | 0 |  | 1 |
| dp3-131 Gardevoir LV.X | enabled | 1 | 1 | choice, status | 1 |
| dp3-132 Honchkrow LV.X | enabled | 2 | 0 | choice | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

