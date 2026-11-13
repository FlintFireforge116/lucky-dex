# LuckyDex Classic audit — dp2 / Mysterious Treasures

**Status:** No definite catalog/schema failures; 0 warnings; 5 follow-up flags.

**Coverage:** 124/124 enabled, 0 gated. 168 attacks, 37 named abilities; 79/124 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 25 |
| privacy | 9 |
| timing | 28 |
| energyMovement | 23 |
| status | 6 |
| deckSearch | 17 |
| coin | 49 |

## Generated CPU decks

16/16 legal 30-card decks across eight Energy types (two seeds each).

## Synthetic battle action checks

356/356 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 99 cards flagged.

- **dp2-1 Aggron** — energyMovement
- **dp2-2 Alakazam** — timing
- **dp2-3 Ambipom** — coin
- **dp2-4 Azelf** — timing, energyMovement
- **dp2-5 Blissey** — choice, timing, energyMovement, deckSearch
- **dp2-6 Bronzong** — energyMovement
- **dp2-7 Celebi** — choice, energyMovement, deckSearch
- **dp2-8 Feraligatr** — choice
- **dp2-9 Garchomp** — energyMovement; attack Dragon Fang: no-op effect despite conditional printed text; verify custom attack resolver.
- **dp2-10 Honchkrow** — deckSearch
- **dp2-11 Lumineon** — energyMovement
- **dp2-12 Magmortar** — timing, energyMovement, coin
- **dp2-14 Mesprit** — choice
- **dp2-15 Raichu** — choice, energyMovement, deckSearch
- **dp2-16 Typhlosion** — energyMovement
- **dp2-17 Tyranitar** — energyMovement
- **dp2-18 Uxie** — timing
- **dp2-19 Abomasnow** — status, coin
- **dp2-20 Ariados** — coin
- **dp2-23 Crobat** — choice, timing, deckSearch, coin
- **dp2-24 Exeggutor** — choice, energyMovement, deckSearch, coin
- **dp2-25 Glalie** — timing, coin; ability Craggy Face: no-op effect; verify separately implemented passive/continuous rule.
- **dp2-26 Gyarados** — coin
- **dp2-27 Kricketune** — status
- **dp2-28 Manectric** — energyMovement
- **dp2-29 Mantine** — timing
- **dp2-32 Ninetales** — choice, energyMovement
- **dp2-34 Slaking** — coin
- **dp2-35 Sudowoodo** — timing
- **dp2-37 Unown [I]** — choice, privacy, timing, deckSearch
- **dp2-38 Ursaring** — timing
- **dp2-39 Walrein** — coin
- **dp2-41 Bayleef** — coin
- **dp2-42 Chingling** — deckSearch
- **dp2-44 Croconaw** — privacy, timing
- **dp2-45 Dewgong** — status; ability Cold Fat: no-op effect; verify separately implemented passive/continuous rule.
- **dp2-46 Dodrio** — choice, coin
- **dp2-48 Gabite** — choice, coin
- **dp2-49 Girafarig** — deckSearch, coin
- **dp2-50 Golbat** — privacy
- **dp2-51 Graveler** — coin
- **dp2-54 Magmar** — energyMovement
- **dp2-56 Nidorina** — choice
- **dp2-57 Octillery** — choice, energyMovement
- **dp2-59 Pupitar** — timing, coin
- **dp2-60 Quilava** — energyMovement, coin
- **dp2-62 Sealeo** — choice
- **dp2-63 Shieldon** — timing, coin
- **dp2-65 Unown [E]** — timing, coin
- **dp2-66 Unown [M]** — choice, coin
- **dp2-67 Unown [T]** — choice, privacy, deckSearch, coin
- **dp2-68 Vigoroth** — coin
- **dp2-69 Abra** — privacy, deckSearch
- **dp2-70 Aipom** — choice, timing
- **dp2-72 Barboach** — coin
- **dp2-73 Bidoof** — source review; attack Tackle: no-op effect despite conditional printed text; verify custom attack resolver.
- **dp2-74 Bronzor** — coin
- **dp2-75 Buizel** — coin
- **dp2-76 Chansey** — timing, coin
- **dp2-77 Chikorita** — status, coin
- **dp2-78 Croagunk** — timing, coin
- **dp2-80 Doduo** — timing, coin
- **dp2-81 Electrike** — timing, energyMovement, coin
- **dp2-82 Exeggcute** — choice, coin
- **dp2-83 Finneon** — timing, coin
- **dp2-84 Geodude** — choice
- **dp2-87 Larvitar** — choice
- **dp2-88 Magby** — status, coin
- **dp2-89 Magikarp** — coin
- **dp2-90 Murkrow** — deckSearch
- **dp2-91 Nidoran ♀** — coin
- **dp2-92 Paras** — coin
- **dp2-93 Pichu** — coin
- **dp2-94 Pikachu** — coin
- **dp2-95 Remoraid** — coin
- **dp2-96 Sandshrew** — timing
- **dp2-97 Seel** — coin
- **dp2-98 Shinx** — energyMovement, coin
- **dp2-99 Slakoth** — status
- **dp2-100 Snorunt** — coin
- **dp2-101 Snover** — privacy, coin
- **dp2-102 Spheal** — timing, coin
- **dp2-103 Spinarak** — timing, coin
- **dp2-105 Teddiursa** — timing
- **dp2-108 Zubat** — coin
- **dp2-109 Bebe's Search** — deckSearch
- **dp2-110 Dusk Ball** — privacy, deckSearch
- **dp2-111 Fossil Excavator** — privacy, deckSearch
- **dp2-112 Lake Boundary** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **dp2-113 Night Maintenance** — choice, energyMovement, deckSearch
- **dp2-114 Quick Ball** — privacy, deckSearch
- **dp2-115 Team Galactic's Wager** — choice
- **dp2-116 Armor Fossil** — coin
- **dp2-117 Skull Fossil** — coin
- **dp2-118 Multi Energy** — energyMovement
- **dp2-121 Electivire LV.X** — timing, energyMovement
- **dp2-122 Lucario LV.X** — choice, timing
- **dp2-123 Magmortar LV.X** — choice, timing, energyMovement
- **dp2-124 Time-Space Distortion** — choice, coin

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| dp2-1 Aggron | enabled | 2 | 0 | energyMovement | 2 |
| dp2-2 Alakazam | enabled | 1 | 1 | timing | 1 |
| dp2-3 Ambipom | enabled | 2 | 0 | coin | 1 |
| dp2-4 Azelf | enabled | 1 | 1 | timing, energyMovement | 2 |
| dp2-5 Blissey | enabled | 1 | 1 | choice, timing, energyMovement, deckSearch | 1 |
| dp2-6 Bronzong | enabled | 1 | 1 | energyMovement | 2 |
| dp2-7 Celebi | enabled | 2 | 0 | choice, energyMovement, deckSearch | 2 |
| dp2-8 Feraligatr | enabled | 2 | 0 | choice | 4 |
| dp2-9 Garchomp | enabled | 1 | 1 | energyMovement | 2 |
| dp2-10 Honchkrow | enabled | 1 | 1 | deckSearch | 1 |
| dp2-11 Lumineon | enabled | 1 | 1 | energyMovement | 1 |
| dp2-12 Magmortar | enabled | 2 | 0 | timing, energyMovement, coin | 2 |
| dp2-13 Meganium | enabled | 2 | 0 |  | 1 |
| dp2-14 Mesprit | enabled | 1 | 1 | choice | 2 |
| dp2-15 Raichu | enabled | 2 | 0 | choice, energyMovement, deckSearch | 2 |
| dp2-16 Typhlosion | enabled | 1 | 1 | energyMovement | 0 |
| dp2-17 Tyranitar | enabled | 2 | 0 | energyMovement | 0 |
| dp2-18 Uxie | enabled | 1 | 1 | timing | 3 |
| dp2-19 Abomasnow | enabled | 1 | 1 | status, coin | 2 |
| dp2-20 Ariados | enabled | 1 | 1 | coin | 1 |
| dp2-21 Bastiodon | enabled | 1 | 1 |  | 1 |
| dp2-22 Chimecho | enabled | 2 | 0 |  | 0 |
| dp2-23 Crobat | enabled | 1 | 1 | choice, timing, deckSearch, coin | 1 |
| dp2-24 Exeggutor | enabled | 2 | 0 | choice, energyMovement, deckSearch, coin | 1 |
| dp2-25 Glalie | enabled | 1 | 1 | timing, coin | 1 |
| dp2-26 Gyarados | enabled | 1 | 1 | coin | 1 |
| dp2-27 Kricketune | enabled | 2 | 0 | status | 0 |
| dp2-28 Manectric | enabled | 2 | 0 | energyMovement | 0 |
| dp2-29 Mantine | enabled | 1 | 1 | timing | 1 |
| dp2-30 Mr. Mime | enabled | 1 | 1 |  | 1 |
| dp2-31 Nidoqueen | enabled | 1 | 1 |  | 1 |
| dp2-32 Ninetales | enabled | 1 | 1 | choice, energyMovement | 2 |
| dp2-33 Rampardos | enabled | 2 | 0 |  | 0 |
| dp2-34 Slaking | enabled | 1 | 1 | coin | 1 |
| dp2-35 Sudowoodo | enabled | 2 | 0 | timing | 0 |
| dp2-36 Toxicroak | enabled | 1 | 1 |  | 1 |
| dp2-37 Unown [I] | enabled | 1 | 1 | choice, privacy, timing, deckSearch | 1 |
| dp2-38 Ursaring | enabled | 2 | 0 | timing | 0 |
| dp2-39 Walrein | enabled | 1 | 1 | coin | 1 |
| dp2-40 Whiscash | enabled | 2 | 0 |  | 0 |
| dp2-41 Bayleef | enabled | 2 | 0 | coin | 0 |
| dp2-42 Chingling | enabled | 1 | 1 | deckSearch | 0 |
| dp2-43 Cranidos | enabled | 2 | 0 |  | 1 |
| dp2-44 Croconaw | enabled | 1 | 1 | privacy, timing | 1 |
| dp2-45 Dewgong | enabled | 1 | 1 | status | 1 |
| dp2-46 Dodrio | enabled | 2 | 0 | choice, coin | 1 |
| dp2-47 Dunsparce | enabled | 2 | 0 |  | 0 |
| dp2-48 Gabite | enabled | 2 | 0 | choice, coin | 0 |
| dp2-49 Girafarig | enabled | 2 | 0 | deckSearch, coin | 0 |
| dp2-50 Golbat | enabled | 1 | 0 | privacy | 1 |
| dp2-51 Graveler | enabled | 2 | 0 | coin | 0 |
| dp2-52 Happiny | enabled | 1 | 1 |  | 1 |
| dp2-53 Lairon | enabled | 2 | 0 |  | 0 |
| dp2-54 Magmar | enabled | 2 | 0 | energyMovement | 1 |
| dp2-55 Masquerain | enabled | 2 | 0 |  | 0 |
| dp2-56 Nidorina | enabled | 2 | 0 | choice | 0 |
| dp2-57 Octillery | enabled | 2 | 0 | choice, energyMovement | 0 |
| dp2-58 Parasect | enabled | 2 | 0 |  | 0 |
| dp2-59 Pupitar | enabled | 2 | 0 | timing, coin | 0 |
| dp2-60 Quilava | enabled | 1 | 0 | energyMovement, coin | 0 |
| dp2-61 Sandslash | enabled | 2 | 0 |  | 1 |
| dp2-62 Sealeo | enabled | 1 | 0 | choice | 1 |
| dp2-63 Shieldon | enabled | 2 | 0 | timing, coin | 1 |
| dp2-64 Tropius | enabled | 2 | 0 |  | 0 |
| dp2-65 Unown [E] | enabled | 1 | 1 | timing, coin | 1 |
| dp2-66 Unown [M] | enabled | 1 | 1 | choice, coin | 2 |
| dp2-67 Unown [T] | enabled | 1 | 1 | choice, privacy, deckSearch, coin | 1 |
| dp2-68 Vigoroth | enabled | 2 | 0 | coin | 2 |
| dp2-69 Abra | enabled | 2 | 0 | privacy, deckSearch | 0 |
| dp2-70 Aipom | enabled | 2 | 0 | choice, timing | 2 |
| dp2-71 Aron | enabled | 1 | 0 |  | 0 |
| dp2-72 Barboach | enabled | 1 | 0 | coin | 1 |
| dp2-73 Bidoof | enabled | 1 | 0 |  | 4 |
| dp2-74 Bronzor | enabled | 1 | 0 | coin | 0 |
| dp2-75 Buizel | enabled | 1 | 0 | coin | 3 |
| dp2-76 Chansey | enabled | 2 | 0 | timing, coin | 1 |
| dp2-77 Chikorita | enabled | 2 | 0 | status, coin | 0 |
| dp2-78 Croagunk | enabled | 2 | 0 | timing, coin | 1 |
| dp2-79 Cyndaquil | enabled | 2 | 0 |  | 2 |
| dp2-80 Doduo | enabled | 2 | 0 | timing, coin | 1 |
| dp2-81 Electrike | enabled | 1 | 0 | timing, energyMovement, coin | 1 |
| dp2-82 Exeggcute | enabled | 1 | 0 | choice, coin | 1 |
| dp2-83 Finneon | enabled | 2 | 0 | timing, coin | 0 |
| dp2-84 Geodude | enabled | 1 | 0 | choice | 0 |
| dp2-85 Gible | enabled | 1 | 0 |  | 0 |
| dp2-86 Kricketot | enabled | 2 | 0 |  | 0 |
| dp2-87 Larvitar | enabled | 2 | 0 | choice | 1 |
| dp2-88 Magby | enabled | 1 | 1 | status, coin | 1 |
| dp2-89 Magikarp | enabled | 2 | 0 | coin | 1 |
| dp2-90 Murkrow | enabled | 2 | 0 | deckSearch | 1 |
| dp2-91 Nidoran ♀ | enabled | 2 | 0 | coin | 1 |
| dp2-92 Paras | enabled | 2 | 0 | coin | 0 |
| dp2-93 Pichu | enabled | 1 | 1 | coin | 0 |
| dp2-94 Pikachu | enabled | 1 | 1 | coin | 0 |
| dp2-95 Remoraid | enabled | 2 | 0 | coin | 0 |
| dp2-96 Sandshrew | enabled | 2 | 0 | timing | 0 |
| dp2-97 Seel | enabled | 1 | 0 | coin | 0 |
| dp2-98 Shinx | enabled | 1 | 0 | energyMovement, coin | 0 |
| dp2-99 Slakoth | enabled | 1 | 0 | status | 2 |
| dp2-100 Snorunt | enabled | 2 | 0 | coin | 1 |
| dp2-101 Snover | enabled | 2 | 0 | privacy, coin | 0 |
| dp2-102 Spheal | enabled | 2 | 0 | timing, coin | 1 |
| dp2-103 Spinarak | enabled | 2 | 0 | timing, coin | 0 |
| dp2-104 Surskit | enabled | 1 | 0 |  | 0 |
| dp2-105 Teddiursa | enabled | 2 | 0 | timing | 1 |
| dp2-106 Totodile | enabled | 2 | 0 |  | 1 |
| dp2-107 Vulpix | enabled | 1 | 0 |  | 0 |
| dp2-108 Zubat | enabled | 2 | 0 | coin | 1 |
| dp2-109 Bebe's Search | enabled | 0 | 0 | deckSearch | 1 |
| dp2-110 Dusk Ball | enabled | 0 | 0 | privacy, deckSearch | 1 |
| dp2-111 Fossil Excavator | enabled | 0 | 0 | privacy, deckSearch | 2 |
| dp2-112 Lake Boundary | enabled | 0 | 0 |  | 1 |
| dp2-113 Night Maintenance | enabled | 0 | 0 | choice, energyMovement, deckSearch | 0 |
| dp2-114 Quick Ball | enabled | 0 | 0 | privacy, deckSearch | 0 |
| dp2-115 Team Galactic's Wager | enabled | 0 | 0 | choice | 2 |
| dp2-116 Armor Fossil | enabled | 0 | 0 | coin | 3 |
| dp2-117 Skull Fossil | enabled | 0 | 0 | coin | 2 |
| dp2-118 Multi Energy | enabled | 0 | 0 | energyMovement | 3 |
| dp2-119 Darkness Energy | enabled | 0 | 0 |  | 1 |
| dp2-120 Metal Energy | enabled | 0 | 0 |  | 2 |
| dp2-121 Electivire LV.X | enabled | 1 | 1 | timing, energyMovement | 2 |
| dp2-122 Lucario LV.X | enabled | 1 | 1 | choice, timing | 1 |
| dp2-123 Magmortar LV.X | enabled | 1 | 1 | choice, timing, energyMovement | 1 |
| dp2-124 Time-Space Distortion | enabled | 0 | 0 | choice, coin | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

