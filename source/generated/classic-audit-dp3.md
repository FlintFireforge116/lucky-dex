# LuckyDex Classic audit — dp3 / Secret Wonders

**Status:** No definite catalog/schema failures; 1 warnings; 0 follow-up flags.

**Coverage:** 46/132 enabled, 86 gated. 194 attacks, 45 named abilities; 16/132 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 5 |
| privacy | 4 |
| timing | 8 |
| energyMovement | 3 |
| status | 8 |
| deckSearch | 3 |
| coin | 17 |

## Generated CPU decks

Not requested.

## Synthetic battle action checks

158/158 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

- **WARNING** dp3-33 [C-AUDIT-003] Evolution parent "Burmy" is absent by exact name from the full catalog; verify alternate spelling or Fossil support.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 31 cards flagged.

- **dp3-49 Farfetch'd** — timing
- **dp3-54 Lombre** — timing, coin
- **dp3-58 Pidgeotto** — coin
- **dp3-62 Roselia** — status
- **dp3-64 Shelgon** — timing
- **dp3-74 Vibrava** — energyMovement, coin
- **dp3-75 Wartortle** — timing
- **dp3-77 Bulbasaur** — status, coin
- **dp3-81 Carvanha** — privacy, coin
- **dp3-83 Clefairy** — coin
- **dp3-87 Electabuzz** — coin
- **dp3-88 Grimer** — timing, coin
- **dp3-91 Lickitung** — coin
- **dp3-93 Magmar** — status
- **dp3-94 Mareep** — coin
- **dp3-97 Nidoran ♂** — status, coin
- **dp3-99 Pidgey** — timing
- **dp3-100 Psyduck** — status, coin
- **dp3-102 Ralts** — coin
- **dp3-103 Rattata** — timing, coin
- **dp3-108 Shroomish** — coin
- **dp3-112 Squirtle** — status, coin
- **dp3-113 Stantler** — privacy, status, deckSearch
- **dp3-115 Trapinch** — timing
- **dp3-116 Venonat** — coin
- **dp3-118 Wooper** — choice, status
- **dp3-120 Night Maintenance** — choice, energyMovement, deckSearch
- **dp3-123 Professor Rowan** — deckSearch
- **dp3-124 Rival** — choice, privacy
- **dp3-125 Roseanne's Research** — choice, energyMovement
- **dp3-126 Team Galactic's Mars** — choice, privacy

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| dp3-1 Ampharos | gated | 1 | 1 |  | 0 |
| dp3-2 Blastoise | gated | 1 | 1 |  | 0 |
| dp3-3 Charizard | gated | 1 | 1 |  | 0 |
| dp3-4 Entei | gated | 1 | 1 |  | 0 |
| dp3-5 Flygon | gated | 1 | 1 |  | 0 |
| dp3-6 Gallade | gated | 2 | 0 |  | 0 |
| dp3-7 Gardevoir | gated | 1 | 1 |  | 0 |
| dp3-8 Gastrodon East Sea | gated | 1 | 1 |  | 0 |
| dp3-9 Gastrodon West Sea | gated | 2 | 0 |  | 0 |
| dp3-10 Ho-Oh | gated | 1 | 1 |  | 0 |
| dp3-11 Jumpluff | gated | 1 | 1 |  | 0 |
| dp3-12 Lickilicky | gated | 2 | 0 |  | 0 |
| dp3-13 Ludicolo | gated | 1 | 1 |  | 0 |
| dp3-14 Lugia | gated | 2 | 0 |  | 0 |
| dp3-15 Mew | gated | 2 | 0 |  | 0 |
| dp3-16 Raikou | gated | 1 | 1 |  | 0 |
| dp3-17 Roserade | gated | 2 | 0 |  | 0 |
| dp3-18 Salamence | gated | 2 | 0 |  | 0 |
| dp3-19 Suicune | gated | 1 | 1 |  | 0 |
| dp3-20 Venusaur | gated | 1 | 1 |  | 0 |
| dp3-21 Absol | gated | 2 | 0 |  | 0 |
| dp3-22 Arcanine | gated | 1 | 1 |  | 0 |
| dp3-23 Banette | gated | 2 | 0 |  | 0 |
| dp3-24 Dugtrio | gated | 2 | 0 |  | 0 |
| dp3-25 Electivire | gated | 1 | 1 |  | 0 |
| dp3-26 Electrode | gated | 1 | 1 |  | 0 |
| dp3-27 Furret | gated | 2 | 0 |  | 0 |
| dp3-28 Golduck | gated | 2 | 0 |  | 0 |
| dp3-29 Golem | gated | 2 | 0 |  | 0 |
| dp3-30 Jynx | gated | 2 | 0 |  | 0 |
| dp3-31 Magmortar | gated | 2 | 1 |  | 0 |
| dp3-32 Minun | gated | 1 | 1 |  | 0 |
| dp3-33 Mothim | gated | 2 | 0 |  | 0 |
| dp3-34 Nidoking | gated | 2 | 0 |  | 0 |
| dp3-35 Pidgeot | gated | 2 | 0 |  | 0 |
| dp3-36 Plusle | gated | 1 | 1 |  | 0 |
| dp3-37 Sharpedo | gated | 1 | 1 |  | 0 |
| dp3-38 Sunflora | gated | 1 | 1 |  | 0 |
| dp3-39 Unown [S] | gated | 1 | 1 |  | 0 |
| dp3-40 Weavile | gated | 2 | 1 |  | 0 |
| dp3-41 Wormadam Plant Cloak | gated | 1 | 1 |  | 0 |
| dp3-42 Wormadam Sandy Cloak | gated | 1 | 1 |  | 0 |
| dp3-43 Wormadam Trash Cloak | gated | 1 | 1 |  | 0 |
| dp3-44 Xatu | gated | 1 | 1 |  | 0 |
| dp3-45 Breloom | gated | 2 | 0 |  | 0 |
| dp3-46 Charmeleon | gated | 2 | 0 |  | 0 |
| dp3-47 Cloyster | gated | 2 | 0 |  | 0 |
| dp3-48 Donphan | gated | 2 | 0 |  | 0 |
| dp3-49 Farfetch'd | enabled | 2 | 0 | timing | 1 |
| dp3-50 Flaaffy | gated | 2 | 0 |  | 0 |
| dp3-51 Ivysaur | enabled | 2 | 0 |  | 0 |
| dp3-52 Kecleon | gated | 1 | 1 |  | 0 |
| dp3-53 Kirlia | gated | 2 | 0 |  | 0 |
| dp3-54 Lombre | enabled | 2 | 0 | timing, coin | 0 |
| dp3-55 Miltank | gated | 2 | 0 |  | 0 |
| dp3-56 Muk | gated | 1 | 1 |  | 0 |
| dp3-57 Nidorino | gated | 2 | 0 |  | 0 |
| dp3-58 Pidgeotto | enabled | 2 | 0 | coin | 0 |
| dp3-59 Pinsir | gated | 2 | 0 |  | 0 |
| dp3-60 Quagsire | gated | 1 | 1 |  | 0 |
| dp3-61 Raticate | gated | 2 | 0 |  | 0 |
| dp3-62 Roselia | enabled | 2 | 0 | status | 0 |
| dp3-63 Sableye | gated | 2 | 0 |  | 0 |
| dp3-64 Shelgon | enabled | 2 | 0 | timing | 1 |
| dp3-65 Skiploom | gated | 1 | 1 |  | 0 |
| dp3-66 Smeargle | gated | 2 | 0 |  | 0 |
| dp3-67 Smoochum | gated | 1 | 1 |  | 0 |
| dp3-68 Unown [K] | gated | 1 | 1 |  | 0 |
| dp3-69 Unown [N] | gated | 1 | 1 |  | 0 |
| dp3-70 Unown [O] | gated | 1 | 1 |  | 0 |
| dp3-71 Unown [X] | gated | 1 | 1 |  | 0 |
| dp3-72 Unown [Z] | gated | 1 | 1 |  | 0 |
| dp3-73 Venomoth | gated | 1 | 1 |  | 0 |
| dp3-74 Vibrava | enabled | 2 | 0 | energyMovement, coin | 0 |
| dp3-75 Wartortle | enabled | 2 | 0 | timing | 1 |
| dp3-76 Bagon | enabled | 2 | 0 |  | 1 |
| dp3-77 Bulbasaur | enabled | 2 | 0 | status, coin | 0 |
| dp3-78 Burmy Plant Cloak | gated | 1 | 1 |  | 0 |
| dp3-79 Burmy Sandy Cloak | gated | 1 | 1 |  | 0 |
| dp3-80 Burmy Trash Cloak | gated | 1 | 1 |  | 0 |
| dp3-81 Carvanha | enabled | 2 | 0 | privacy, coin | 0 |
| dp3-82 Charmander | enabled | 2 | 0 |  | 1 |
| dp3-83 Clefairy | enabled | 1 | 0 | coin | 1 |
| dp3-84 Corsola | gated | 2 | 0 |  | 1 |
| dp3-85 Diglett | enabled | 2 | 0 |  | 1 |
| dp3-86 Duskull | gated | 1 | 0 |  | 0 |
| dp3-87 Electabuzz | enabled | 2 | 0 | coin | 0 |
| dp3-88 Grimer | enabled | 2 | 0 | timing, coin | 0 |
| dp3-89 Growlithe | enabled | 2 | 0 |  | 0 |
| dp3-90 Hoppip | enabled | 1 | 1 |  | 0 |
| dp3-91 Lickitung | enabled | 2 | 0 | coin | 0 |
| dp3-92 Lotad | enabled | 2 | 0 |  | 1 |
| dp3-93 Magmar | enabled | 2 | 0 | status | 0 |
| dp3-94 Mareep | enabled | 2 | 0 | coin | 0 |
| dp3-95 Murkrow | gated | 1 | 0 |  | 0 |
| dp3-96 Natu | gated | 2 | 0 |  | 0 |
| dp3-97 Nidoran ♂ | enabled | 2 | 0 | status, coin | 0 |
| dp3-98 Phanpy | enabled | 2 | 0 |  | 0 |
| dp3-99 Pidgey | enabled | 2 | 0 | timing | 0 |
| dp3-100 Psyduck | enabled | 2 | 0 | status, coin | 1 |
| dp3-101 Qwilfish | gated | 1 | 1 |  | 0 |
| dp3-102 Ralts | enabled | 2 | 0 | coin | 0 |
| dp3-103 Rattata | enabled | 2 | 0 | timing, coin | 0 |
| dp3-104 Sentret | gated | 2 | 0 |  | 0 |
| dp3-105 Shellder | enabled | 2 | 0 |  | 0 |
| dp3-106 Shellos East Sea | gated | 2 | 0 |  | 0 |
| dp3-107 Shellos West Sea | gated | 2 | 0 |  | 0 |
| dp3-108 Shroomish | enabled | 2 | 0 | coin | 0 |
| dp3-109 Shuckle | gated | 1 | 1 |  | 0 |
| dp3-110 Shuppet | enabled | 2 | 0 |  | 1 |
| dp3-111 Spinda | gated | 2 | 0 |  | 0 |
| dp3-112 Squirtle | enabled | 2 | 0 | status, coin | 1 |
| dp3-113 Stantler | enabled | 2 | 0 | privacy, status, deckSearch | 1 |
| dp3-114 Sunkern | gated | 2 | 0 |  | 0 |
| dp3-115 Trapinch | enabled | 2 | 0 | timing | 0 |
| dp3-116 Venonat | enabled | 2 | 0 | coin | 0 |
| dp3-117 Voltorb | enabled | 2 | 0 |  | 0 |
| dp3-118 Wooper | enabled | 2 | 0 | choice, status | 0 |
| dp3-119 Bebe's Search | enabled | 0 | 0 |  | 0 |
| dp3-120 Night Maintenance | enabled | 0 | 0 | choice, energyMovement, deckSearch | 0 |
| dp3-121 PlusPower | enabled | 0 | 0 |  | 0 |
| dp3-122 Professor Oak's Visit | gated | 0 | 0 |  | 0 |
| dp3-123 Professor Rowan | enabled | 0 | 0 | deckSearch | 1 |
| dp3-124 Rival | enabled | 0 | 0 | choice, privacy | 0 |
| dp3-125 Roseanne's Research | gated | 0 | 0 | choice, energyMovement | 0 |
| dp3-126 Team Galactic's Mars | gated | 0 | 0 | choice, privacy | 0 |
| dp3-127 Potion | enabled | 0 | 0 |  | 0 |
| dp3-128 Switch | enabled | 0 | 0 |  | 0 |
| dp3-129 Darkness Energy | enabled | 0 | 0 |  | 1 |
| dp3-130 Metal Energy | enabled | 0 | 0 |  | 1 |
| dp3-131 Gardevoir LV.X | gated | 1 | 1 |  | 0 |
| dp3-132 Honchkrow LV.X | gated | 2 | 0 |  | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

