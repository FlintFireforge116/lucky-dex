# LuckyDex Classic audit — bw6 / Dragons Exalted

**Status:** No definite catalog/schema failures; 0 warnings; 57 follow-up flags.

**Coverage:** 128/128 enabled, 0 gated. 200 attacks, 20 named abilities; 13/128 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 18 |
| privacy | 2 |
| timing | 21 |
| energyMovement | 26 |
| status | 22 |
| deckSearch | 16 |
| coin | 46 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

402/408 actions executed; 6 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 108 cards flagged.

- **bw6-1 Hoppip** — coin
- **bw6-2 Skiploom** — coin
- **bw6-3 Jumpluff** — choice, coin
- **bw6-5 Yanmega** — timing, coin
- **bw6-6 Wurmple** — status, coin
- **bw6-7 Silcoon** — timing; attack Harden: custom rule bw6:harden has no obvious source literal; inspect dispatcher.
- **bw6-8 Beautifly** — energyMovement, deckSearch; attack Triple Energy: custom rule bw6:tripleEnergy has no obvious source literal; inspect dispatcher.
- **bw6-10 Nincada** — timing, coin
- **bw6-11 Ninjask** — choice, deckSearch; ability Cast-off Shell: custom rule bw6:castOffShell has no obvious source literal; inspect dispatcher.
- **bw6-12 Roselia** — coin
- **bw6-13 Roselia** — coin
- **bw6-14 Roserade** — status, coin
- **bw6-15 Roserade** — choice, status, deckSearch, coin
- **bw6-16 Maractus** — status, coin; attack Reinforced Needle: custom rule bw6:reinforcedNeedle has no obvious source literal; inspect dispatcher.
- **bw6-17 Foongus** — coin
- **bw6-18 Vulpix** — status
- **bw6-19 Ninetales** — choice, status; attack Hexed Flame: custom rule bw6:hexedFlame has no obvious source literal; inspect dispatcher.
- **bw6-21 Magmortar** — timing, energyMovement
- **bw6-22 Ho-Oh-EX** — choice, energyMovement, coin; attack Rainbow Burn: custom rule bw6:rainbowBurn has no obvious source literal; inspect dispatcher.; ability Rebirth: custom rule bw6:rebirth has no obvious source literal; inspect dispatcher.
- **bw6-23 Magikarp** — coin
- **bw6-24 Gyarados** — coin
- **bw6-25 Wailmer** — status, coin
- **bw6-26 Wailord** — timing, coin; attack Water Cannon: custom rule bw6:waterCannon has no obvious source literal; inspect dispatcher.
- **bw6-27 Feebas** — coin; attack Add-a-Dash: custom rule bw6:addADash has no obvious source literal; inspect dispatcher.
- **bw6-28 Milotic** — status, deckSearch
- **bw6-29 Spheal** — coin; attack Unstoppable Roll: custom rule bw6:unstoppableRoll has no obvious source literal; inspect dispatcher.
- **bw6-31 Walrein** — timing, status
- **bw6-34 Tympole** — status, coin
- **bw6-35 Palpitoad** — status
- **bw6-36 Seismitoad** — timing; attack Echoed Voice: custom rule bw4:echoedVoice has no obvious source literal; inspect dispatcher.
- **bw6-37 Alomomola** — energyMovement, coin
- **bw6-38 Mareep** — timing, coin; attack Thunder Jolt: custom rule bw6:thunderJolt has no obvious source literal; inspect dispatcher.
- **bw6-39 Flaaffy** — timing
- **bw6-40 Ampharos** — energyMovement; ability Electromagnetic Wall: custom rule bw6:electromagneticWall has no obvious source literal; inspect dispatcher.
- **bw6-41 Electrike** — coin
- **bw6-42 Electrike** — coin
- **bw6-43 Manectric** — source review; attack Energy Crush: custom rule bw6:energyCrush has no obvious source literal; inspect dispatcher.; attack Flash Impact: custom rule bw6:flashImpact has no obvious source literal; inspect dispatcher.
- **bw6-44 Manectric** — energyMovement, coin; attack Energy Assist: custom rule bw6:energyAssist has no obvious source literal; inspect dispatcher.
- **bw6-45 Emolga** — deckSearch
- **bw6-46 Mew-EX** — energyMovement; attack Replace: custom rule bw6:replace has no obvious source literal; inspect dispatcher.; ability Versatile: custom rule bw6:versatile has no obvious source literal; inspect dispatcher.
- **bw6-47 Dustox** — status, coin
- **bw6-48 Shedinja** — source review; attack Cursed Drop: custom rule bw6:cursedDrop has no obvious source literal; inspect dispatcher.
- **bw6-51 Drifblim** — energyMovement; attack Shadow Steal: custom rule bw6:shadowSteal has no obvious source literal; inspect dispatcher.
- **bw6-52 Sigilyph** — source review; ability Safeguard: custom rule bw6:safeguard has no obvious source literal; inspect dispatcher.
- **bw6-53 Trubbish** — status
- **bw6-54 Garbodor** — source review; ability Garbotoxin: custom rule bw6:garbotoxin has no obvious source literal; inspect dispatcher.
- **bw6-55 Gothita** — deckSearch
- **bw6-56 Gothorita** — status
- **bw6-57 Gothitelle** — coin; attack Doom Decree: custom rule bw6:doomDecree has no obvious source literal; inspect dispatcher.
- **bw6-59 Golurk** — timing
- **bw6-61 Marowak** — timing; attack Vortex Chop: custom rule bw6:vortexChop has no obvious source literal; inspect dispatcher.
- **bw6-63 Baltoy** — deckSearch; attack Reverse Spin: custom rule bw6:reverseSpin has no obvious source literal; inspect dispatcher.
- **bw6-64 Claydol** — coin; attack Rapid Spin: custom rule bw6:rapidSpin has no obvious source literal; inspect dispatcher.
- **bw6-65 Roggenrola** — coin
- **bw6-66 Boldore** — coin
- **bw6-67 Gigalith** — source review; attack Revenge Cannon: custom rule bw6:revengeCannon has no obvious source literal; inspect dispatcher.
- **bw6-68 Throh** — choice, status, coin; attack Superpower: custom rule bw6:superpower has no obvious source literal; inspect dispatcher.
- **bw6-70 Stunfisk** — timing
- **bw6-71 Terrakion-EX** — energyMovement; attack Pump-up Smash: custom rule bw6:pumpUpSmash has no obvious source literal; inspect dispatcher.
- **bw6-73 Honchkrow** — choice
- **bw6-75 Houndoom** — status
- **bw6-76 Stunky** — energyMovement, coin
- **bw6-77 Skuntank** — timing, status, coin
- **bw6-79 Lairon** — coin; attack Wreak Havoc: custom rule bw6:wreakHavoc has no obvious source literal; inspect dispatcher.
- **bw6-80 Aggron** — choice, deckSearch, coin; attack Giga Horn: custom rule bw6:gigaHorn has no obvious source literal; inspect dispatcher.
- **bw6-81 Registeel-EX** — timing; attack Triple Laser: custom rule bw6:tripleLaser has no obvious source literal; inspect dispatcher.
- **bw6-82 Probopass** — choice, energyMovement
- **bw6-83 Durant** — coin; attack Pull Out: custom rule bw6:pullOut has no obvious source literal; inspect dispatcher.
- **bw6-84 Altaria** — source review; ability Fight Song: custom rule bw6:fightSong has no obvious source literal; inspect dispatcher.
- **bw6-85 Rayquaza-EX** — energyMovement, deckSearch; attack Celestial Roar: custom rule bw6:celestialRoar has no obvious source literal; inspect dispatcher.; attack Dragon Burst: custom rule bw6:dragonBurst has no obvious source literal; inspect dispatcher.
- **bw6-87 Gible** — timing, coin
- **bw6-89 Gabite** — choice, privacy, deckSearch; ability Dragon Call: custom rule bw6:dragonCall has no obvious source literal; inspect dispatcher.
- **bw6-90 Garchomp** — energyMovement, deckSearch
- **bw6-91 Garchomp** — timing
- **bw6-92 Giratina-EX** — deckSearch
- **bw6-93 Deino** — energyMovement, status, coin
- **bw6-94 Deino** — timing
- **bw6-95 Zweilous** — energyMovement, coin
- **bw6-96 Zweilous** — energyMovement; attack Draw In: custom rule bw6:drawIn has no obvious source literal; inspect dispatcher.
- **bw6-97 Hydreigon** — choice, energyMovement; ability Dark Trance: custom rule bw6:darkTrance has no obvious source literal; inspect dispatcher.
- **bw6-98 Hydreigon** — energyMovement, coin
- **bw6-99 Aipom** — coin
- **bw6-100 Ambipom** — coin
- **bw6-101 Slakoth** — status
- **bw6-102 Vigoroth** — coin
- **bw6-103 Slaking** — energyMovement; ability Unobservant: custom rule bw6:unobservant has no obvious source literal; inspect dispatcher.
- **bw6-104 Swablu** — status
- **bw6-106 Bidoof** — status
- **bw6-107 Bibarel** — choice, timing, status
- **bw6-110 Bouffalant** — source review; attack Gold Breaker: custom rule bw6:goldBreaker has no obvious source literal; inspect dispatcher.; ability Bouffer: custom rule bw6:bouffer has no obvious source literal; inspect dispatcher.
- **bw6-111 Rufflet** — privacy, deckSearch, coin; attack Chirp: custom rule bw6:chirp has no obvious source literal; inspect dispatcher.
- **bw6-112 Braviary** — coin
- **bw6-113 Devolution Spray** — choice
- **bw6-114 Giant Cape** — choice; card effect: custom rule bw6:giantCape has no obvious source literal; inspect dispatcher.
- **bw6-115 Rescue Scarf** — choice; card effect: custom rule bw6:rescueScarf has no obvious source literal; inspect dispatcher.
- **bw6-116 Tool Scrapper** — choice; card effect: custom rule bw6:toolScrapper has no obvious source literal; inspect dispatcher.
- **bw6-117 Blend Energy GrassFirePsychicDarkness** — energyMovement
- **bw6-118 Blend Energy WaterLightningFightingMetal** — energyMovement
- **bw6-119 Ho-Oh-EX** — choice, energyMovement, coin; attack Rainbow Burn: custom rule bw6:rainbowBurn has no obvious source literal; inspect dispatcher.; ability Rebirth: custom rule bw6:rebirth has no obvious source literal; inspect dispatcher.
- **bw6-120 Mew-EX** — energyMovement; attack Replace: custom rule bw6:replace has no obvious source literal; inspect dispatcher.; ability Versatile: custom rule bw6:versatile has no obvious source literal; inspect dispatcher.
- **bw6-121 Terrakion-EX** — energyMovement; attack Pump-up Smash: custom rule bw6:pumpUpSmash has no obvious source literal; inspect dispatcher.
- **bw6-122 Registeel-EX** — timing; attack Triple Laser: custom rule bw6:tripleLaser has no obvious source literal; inspect dispatcher.
- **bw6-123 Rayquaza-EX** — energyMovement, deckSearch; attack Celestial Roar: custom rule bw6:celestialRoar has no obvious source literal; inspect dispatcher.; attack Dragon Burst: custom rule bw6:dragonBurst has no obvious source literal; inspect dispatcher.
- **bw6-124 Giratina-EX** — deckSearch
- **bw6-125 Serperior** — timing, energyMovement; ability Royal Heal: custom rule bw1:royalHeal has no obvious source literal; inspect dispatcher.
- **bw6-126 Reuniclus** — choice; ability Damage Swap: custom rule bw1:damageSwap has no obvious source literal; inspect dispatcher.
- **bw6-127 Krookodile** — timing; attack Bombast: custom rule bw5:bombast has no obvious source literal; inspect dispatcher.
- **bw6-128 Rayquaza** — deckSearch

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| bw6-1 Hoppip | enabled | 1 | 0 | coin | 2 |
| bw6-2 Skiploom | enabled | 1 | 0 | coin | 2 |
| bw6-3 Jumpluff | enabled | 1 | 1 | choice, coin | 2 |
| bw6-4 Yanma | enabled | 1 | 0 |  | 0 |
| bw6-5 Yanmega | enabled | 2 | 0 | timing, coin | 0 |
| bw6-6 Wurmple | enabled | 1 | 0 | status, coin | 0 |
| bw6-7 Silcoon | enabled | 2 | 0 | timing | 0 |
| bw6-8 Beautifly | enabled | 2 | 0 | energyMovement, deckSearch | 0 |
| bw6-9 Cascoon | enabled | 2 | 0 |  | 0 |
| bw6-10 Nincada | enabled | 1 | 0 | timing, coin | 0 |
| bw6-11 Ninjask | enabled | 1 | 1 | choice, deckSearch | 0 |
| bw6-12 Roselia | enabled | 2 | 0 | coin | 0 |
| bw6-13 Roselia | enabled | 1 | 0 | coin | 0 |
| bw6-14 Roserade | enabled | 2 | 0 | status, coin | 0 |
| bw6-15 Roserade | enabled | 1 | 1 | choice, status, deckSearch, coin | 0 |
| bw6-16 Maractus | enabled | 2 | 0 | status, coin | 0 |
| bw6-17 Foongus | enabled | 1 | 0 | coin | 0 |
| bw6-18 Vulpix | enabled | 1 | 0 | status | 0 |
| bw6-19 Ninetales | enabled | 1 | 1 | choice, status | 0 |
| bw6-20 Magmar | enabled | 2 | 0 |  | 0 |
| bw6-21 Magmortar | enabled | 2 | 0 | timing, energyMovement | 0 |
| bw6-22 Ho-Oh-EX | enabled | 1 | 1 | choice, energyMovement, coin | 1 |
| bw6-23 Magikarp | enabled | 1 | 0 | coin | 0 |
| bw6-24 Gyarados | enabled | 2 | 0 | coin | 0 |
| bw6-25 Wailmer | enabled | 2 | 0 | status, coin | 0 |
| bw6-26 Wailord | enabled | 2 | 0 | timing, coin | 0 |
| bw6-27 Feebas | enabled | 1 | 0 | coin | 0 |
| bw6-28 Milotic | enabled | 2 | 0 | status, deckSearch | 0 |
| bw6-29 Spheal | enabled | 1 | 0 | coin | 0 |
| bw6-30 Sealeo | enabled | 2 | 0 |  | 0 |
| bw6-31 Walrein | enabled | 2 | 0 | timing, status | 0 |
| bw6-32 Buizel | enabled | 1 | 0 |  | 0 |
| bw6-33 Floatzel | enabled | 2 | 0 |  | 0 |
| bw6-34 Tympole | enabled | 1 | 0 | status, coin | 0 |
| bw6-35 Palpitoad | enabled | 2 | 0 | status | 0 |
| bw6-36 Seismitoad | enabled | 2 | 0 | timing | 0 |
| bw6-37 Alomomola | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw6-38 Mareep | enabled | 2 | 0 | timing, coin | 0 |
| bw6-39 Flaaffy | enabled | 2 | 0 | timing | 0 |
| bw6-40 Ampharos | enabled | 1 | 1 | energyMovement | 0 |
| bw6-41 Electrike | enabled | 2 | 0 | coin | 0 |
| bw6-42 Electrike | enabled | 1 | 0 | coin | 0 |
| bw6-43 Manectric | enabled | 2 | 0 |  | 0 |
| bw6-44 Manectric | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw6-45 Emolga | enabled | 2 | 0 | deckSearch | 0 |
| bw6-46 Mew-EX | enabled | 1 | 1 | energyMovement | 0 |
| bw6-47 Dustox | enabled | 2 | 0 | status, coin | 0 |
| bw6-48 Shedinja | enabled | 1 | 1 |  | 1 |
| bw6-49 Drifloon | enabled | 1 | 0 |  | 0 |
| bw6-50 Drifloon | enabled | 2 | 0 |  | 0 |
| bw6-51 Drifblim | enabled | 2 | 0 | energyMovement | 0 |
| bw6-52 Sigilyph | enabled | 1 | 1 |  | 0 |
| bw6-53 Trubbish | enabled | 2 | 0 | status | 0 |
| bw6-54 Garbodor | enabled | 1 | 1 |  | 0 |
| bw6-55 Gothita | enabled | 1 | 0 | deckSearch | 0 |
| bw6-56 Gothorita | enabled | 2 | 0 | status | 0 |
| bw6-57 Gothitelle | enabled | 2 | 0 | coin | 0 |
| bw6-58 Golett | enabled | 2 | 0 |  | 0 |
| bw6-59 Golurk | enabled | 2 | 0 | timing | 0 |
| bw6-60 Cubone | enabled | 2 | 0 |  | 0 |
| bw6-61 Marowak | enabled | 2 | 0 | timing | 0 |
| bw6-62 Nosepass | enabled | 1 | 0 |  | 0 |
| bw6-63 Baltoy | enabled | 2 | 0 | deckSearch | 0 |
| bw6-64 Claydol | enabled | 2 | 0 | coin | 0 |
| bw6-65 Roggenrola | enabled | 2 | 0 | coin | 0 |
| bw6-66 Boldore | enabled | 2 | 0 | coin | 0 |
| bw6-67 Gigalith | enabled | 2 | 0 |  | 0 |
| bw6-68 Throh | enabled | 2 | 0 | choice, status, coin | 0 |
| bw6-69 Sawk | enabled | 2 | 0 |  | 0 |
| bw6-70 Stunfisk | enabled | 2 | 0 | timing | 0 |
| bw6-71 Terrakion-EX | enabled | 2 | 0 | energyMovement | 0 |
| bw6-72 Murkrow | enabled | 2 | 0 |  | 0 |
| bw6-73 Honchkrow | enabled | 2 | 0 | choice | 0 |
| bw6-74 Houndour | enabled | 2 | 0 |  | 0 |
| bw6-75 Houndoom | enabled | 2 | 0 | status | 0 |
| bw6-76 Stunky | enabled | 1 | 0 | energyMovement, coin | 0 |
| bw6-77 Skuntank | enabled | 2 | 0 | timing, status, coin | 0 |
| bw6-78 Aron | enabled | 1 | 0 |  | 0 |
| bw6-79 Lairon | enabled | 2 | 0 | coin | 0 |
| bw6-80 Aggron | enabled | 1 | 1 | choice, deckSearch, coin | 0 |
| bw6-81 Registeel-EX | enabled | 2 | 0 | timing | 2 |
| bw6-82 Probopass | enabled | 2 | 0 | choice, energyMovement | 1 |
| bw6-83 Durant | enabled | 2 | 0 | coin | 0 |
| bw6-84 Altaria | enabled | 1 | 1 |  | 0 |
| bw6-85 Rayquaza-EX | enabled | 2 | 0 | energyMovement, deckSearch | 2 |
| bw6-86 Gible | enabled | 2 | 0 |  | 0 |
| bw6-87 Gible | enabled | 2 | 0 | timing, coin | 0 |
| bw6-88 Gabite | enabled | 2 | 0 |  | 0 |
| bw6-89 Gabite | enabled | 1 | 1 | choice, privacy, deckSearch | 0 |
| bw6-90 Garchomp | enabled | 2 | 0 | energyMovement, deckSearch | 0 |
| bw6-91 Garchomp | enabled | 2 | 0 | timing | 0 |
| bw6-92 Giratina-EX | enabled | 2 | 0 | deckSearch | 0 |
| bw6-93 Deino | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| bw6-94 Deino | enabled | 2 | 0 | timing | 0 |
| bw6-95 Zweilous | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw6-96 Zweilous | enabled | 2 | 0 | energyMovement | 0 |
| bw6-97 Hydreigon | enabled | 1 | 1 | choice, energyMovement | 0 |
| bw6-98 Hydreigon | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw6-99 Aipom | enabled | 1 | 0 | coin | 0 |
| bw6-100 Ambipom | enabled | 2 | 0 | coin | 0 |
| bw6-101 Slakoth | enabled | 1 | 0 | status | 0 |
| bw6-102 Vigoroth | enabled | 1 | 0 | coin | 0 |
| bw6-103 Slaking | enabled | 1 | 1 | energyMovement | 0 |
| bw6-104 Swablu | enabled | 2 | 0 | status | 0 |
| bw6-105 Swablu | enabled | 1 | 0 |  | 0 |
| bw6-106 Bidoof | enabled | 1 | 0 | status | 0 |
| bw6-107 Bibarel | enabled | 2 | 0 | choice, timing, status | 0 |
| bw6-108 Audino | enabled | 2 | 0 |  | 0 |
| bw6-109 Minccino | enabled | 2 | 0 |  | 0 |
| bw6-110 Bouffalant | enabled | 1 | 1 |  | 1 |
| bw6-111 Rufflet | enabled | 2 | 0 | privacy, deckSearch, coin | 0 |
| bw6-112 Braviary | enabled | 2 | 0 | coin | 0 |
| bw6-113 Devolution Spray | enabled | 0 | 0 | choice | 0 |
| bw6-114 Giant Cape | enabled | 0 | 0 | choice | 2 |
| bw6-115 Rescue Scarf | enabled | 0 | 0 | choice | 1 |
| bw6-116 Tool Scrapper | enabled | 0 | 0 | choice | 0 |
| bw6-117 Blend Energy GrassFirePsychicDarkness | enabled | 0 | 0 | energyMovement | 2 |
| bw6-118 Blend Energy WaterLightningFightingMetal | enabled | 0 | 0 | energyMovement | 1 |
| bw6-119 Ho-Oh-EX | enabled | 1 | 1 | choice, energyMovement, coin | 0 |
| bw6-120 Mew-EX | enabled | 1 | 1 | energyMovement | 0 |
| bw6-121 Terrakion-EX | enabled | 2 | 0 | energyMovement | 0 |
| bw6-122 Registeel-EX | enabled | 2 | 0 | timing | 0 |
| bw6-123 Rayquaza-EX | enabled | 2 | 0 | energyMovement, deckSearch | 0 |
| bw6-124 Giratina-EX | enabled | 2 | 0 | deckSearch | 0 |
| bw6-125 Serperior | enabled | 1 | 1 | timing, energyMovement | 0 |
| bw6-126 Reuniclus | enabled | 1 | 1 | choice | 0 |
| bw6-127 Krookodile | enabled | 2 | 0 | timing | 0 |
| bw6-128 Rayquaza | enabled | 2 | 0 | deckSearch | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

