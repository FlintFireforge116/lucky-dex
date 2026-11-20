# LuckyDex Classic audit — bw7 / Boundaries Crossed

**Status:** No definite catalog/schema failures; 0 warnings; 60 follow-up flags.

**Coverage:** 153/153 enabled, 0 gated. 216 attacks, 21 named abilities; 15/153 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 31 |
| privacy | 6 |
| timing | 17 |
| energyMovement | 21 |
| status | 34 |
| deckSearch | 12 |
| coin | 63 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

466/468 actions executed; 2 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 121 cards flagged.

- **bw7-2 Gloom** — status
- **bw7-3 Vileplume** — status; ability Allergy Panic: custom rule bw7:allergyPanic has no obvious source literal; inspect dispatcher.
- **bw7-4 Bellossom** — status, coin; attack Grass Knot: custom rule bw7:grassKnot has no obvious source literal; inspect dispatcher.
- **bw7-6 Tangrowth** — timing; attack Hundred Furious Lashes: custom rule bw7:hundredFurious has no obvious source literal; inspect dispatcher.
- **bw7-8 Heracross** — coin; attack Giga Horn: custom rule bw7:gigaHorn has no obvious source literal; inspect dispatcher.
- **bw7-9 Celebi-EX** — source review; ability Time Recall: custom rule bw7:timeRecall has no obvious source literal; inspect dispatcher.
- **bw7-10 Shaymin** — deckSearch, coin
- **bw7-12 Servine** — coin
- **bw7-13 Serperior** — coin
- **bw7-15 Whimsicott** — timing, status, coin; attack Fluffy Tag: custom rule bw7:fluffyTag has no obvious source literal; inspect dispatcher.
- **bw7-16 Petilil** — status, coin
- **bw7-17 Lilligant** — coin
- **bw7-18 Charmander** — energyMovement; attack Draw In: custom rule bw7:drawInFire has no obvious source literal; inspect dispatcher.
- **bw7-20 Charizard** — energyMovement; attack Split Bomb: custom rule bw7:splitBomb has no obvious source literal; inspect dispatcher.
- **bw7-21 Numel** — energyMovement
- **bw7-22 Camerupt** — energyMovement, status, coin
- **bw7-23 Victini** — coin
- **bw7-25 Pignite** — coin
- **bw7-26 Emboar** — energyMovement, coin
- **bw7-27 Darumaka** — coin
- **bw7-28 Darmanitan** — coin
- **bw7-29 Squirtle** — coin; ability Shell Shield: custom rule bw7:shellShield has no obvious source literal; inspect dispatcher.
- **bw7-30 Wartortle** — timing, coin
- **bw7-31 Blastoise** — choice, energyMovement; ability Deluge: custom rule bw7:deluge has no obvious source literal; inspect dispatcher.
- **bw7-32 Psyduck** — status, coin
- **bw7-33 Psyduck** — energyMovement; attack Firefighting: custom rule bw7:firefighting has no obvious source literal; inspect dispatcher.
- **bw7-34 Golduck** — status
- **bw7-35 Golduck** — choice, timing, energyMovement
- **bw7-37 Azumarill** — coin; attack Deep Dive: custom rule bw7:deepDive has no obvious source literal; inspect dispatcher.
- **bw7-38 Delibird** — status, deckSearch, coin
- **bw7-41 Samurott** — energyMovement
- **bw7-43 Swanna** — choice, coin; attack Defog: custom rule bw7:defog has no obvious source literal; inspect dispatcher.
- **bw7-45 Jellicent** — status, coin; ability Stickiness: custom rule bw7:stickiness has no obvious source literal; inspect dispatcher.
- **bw7-46 Cryogonal** — coin
- **bw7-48 Keldeo** — coin
- **bw7-49 Keldeo-EX** — choice; ability Rush In: custom rule bw7:rushIn has no obvious source literal; inspect dispatcher.
- **bw7-50 Pikachu** — coin
- **bw7-57 Zebstrika** — deckSearch, coin; attack Flame Charge: custom rule bw1:flameCharge has no obvious source literal; inspect dispatcher.
- **bw7-59 Spoink** — coin
- **bw7-60 Grumpig** — status; attack Extrasensory: custom rule bw7:extrasensory has no obvious source literal; inspect dispatcher.
- **bw7-61 Duskull** — status
- **bw7-62 Dusclops** — choice, deckSearch; attack Astonish: custom rule bw7:astonish has no obvious source literal; inspect dispatcher.
- **bw7-63 Dusknoir** — choice; ability Sinister Hand: custom rule bw7:sinisterHand has no obvious source literal; inspect dispatcher.
- **bw7-64 Croagunk** — status, coin
- **bw7-65 Croagunk** — status
- **bw7-66 Toxicroak** — status
- **bw7-67 Cresselia-EX** — timing; ability Sparkling Particles: custom rule bw7:sparklingParticles has no obvious source literal; inspect dispatcher.
- **bw7-68 Munna** — choice, status, coin; ability Long-Distance Hypnosis: custom rule bw7:longDistanceHypnosis has no obvious source literal; inspect dispatcher.
- **bw7-69 Musharna** — status; attack Telekinesis: custom rule bw7:telekinesis has no obvious source literal; inspect dispatcher.; attack Dream Waltz: custom rule bw7:dreamWaltz has no obvious source literal; inspect dispatcher.
- **bw7-70 Woobat** — privacy
- **bw7-71 Swoobat** — coin; attack Jet Woofer: custom rule bw7:jetWoofer has no obvious source literal; inspect dispatcher.
- **bw7-72 Venipede** — status
- **bw7-73 Whirlipede** — status
- **bw7-74 Scolipede** — status; attack Venoshock: custom rule bw7:venoshock has no obvious source literal; inspect dispatcher.
- **bw7-76 Gothorita** — energyMovement, coin
- **bw7-77 Meloetta** — timing; attack Echoed Voice: custom rule bw4:echoedVoice has no obvious source literal; inspect dispatcher.
- **bw7-79 Sandslash** — timing, coin
- **bw7-80 Gligar** — status, coin
- **bw7-81 Gliscor** — timing, status
- **bw7-83 Trapinch** — energyMovement, coin
- **bw7-85 Crustle** — coin; ability Sturdy: custom rule bw7:sturdy has no obvious source literal; inspect dispatcher.
- **bw7-86 Mienfoo** — coin
- **bw7-88 Mienshao** — coin
- **bw7-89 Landorus-EX** — choice, energyMovement; attack Hammerhead: custom rule bw7:hammerhead has no obvious source literal; inspect dispatcher.; attack Land's Judgment: custom rule bw7:landsJudgment has no obvious source literal; inspect dispatcher.
- **bw7-90 Purrloin** — coin
- **bw7-91 Liepard** — choice, status, coin; attack Assist: custom rule bw7:assist has no obvious source literal; inspect dispatcher.
- **bw7-93 Mandibuzz** — coin
- **bw7-94 Scizor** — timing; attack Steel Slash: custom rule bw7:steelSlash has no obvious source literal; inspect dispatcher.
- **bw7-95 Skarmory** — coin
- **bw7-96 Skarmory** — status, coin
- **bw7-98 Vibrava** — coin
- **bw7-99 Flygon** — choice, timing, energyMovement, status; attack Flying Beatdown: custom rule bw7:flyingBeatdown has no obvious source literal; inspect dispatcher.; ability Sand Slammer: custom rule bw7:sandSlammer has no obvious source literal; inspect dispatcher.
- **bw7-100 Black Kyurem** — energyMovement, coin
- **bw7-101 Black Kyurem-EX** — timing, status, coin
- **bw7-102 White Kyurem** — coin
- **bw7-103 White Kyurem-EX** — energyMovement, status, coin; attack Dragon Stream: custom rule bw7:dragonStream has no obvious source literal; inspect dispatcher.
- **bw7-104 Rattata** — status, coin
- **bw7-105 Raticate** — source review; attack Gnaw Through: custom rule bw7:gnawThrough has no obvious source literal; inspect dispatcher.; attack Super Fang: custom rule bw7:superFang has no obvious source literal; inspect dispatcher.
- **bw7-106 Meowth** — status, coin
- **bw7-107 Farfetch'd** — coin
- **bw7-108 Ditto** — choice; ability Transform: custom rule bw7:transform has no obvious source literal; inspect dispatcher.
- **bw7-109 Snorlax** — coin
- **bw7-110 Togepi** — status, coin
- **bw7-111 Dunsparce** — timing, coin
- **bw7-113 Skitty** — coin
- **bw7-114 Delcatty** — energyMovement, deckSearch, coin; attack Gather Energy: custom rule bw7:gatherEnergy has no obvious source literal; inspect dispatcher.
- **bw7-115 Spinda** — coin
- **bw7-117 Lopunny** — coin; attack Healing Melody: custom rule bw7:healingMelody has no obvious source literal; inspect dispatcher.
- **bw7-118 Patrat** — deckSearch
- **bw7-119 Watchog** — timing, status; attack Psych Up: custom rule bw7:psychUp has no obvious source literal; inspect dispatcher.
- **bw7-122 Stoutland** — coin; ability Sentinel: custom rule bw7:sentinel has no obvious source literal; inspect dispatcher.
- **bw7-123 Pidove** — coin
- **bw7-124 Tranquill** — energyMovement
- **bw7-125 Unfezant** — energyMovement, coin
- **bw7-126 Audino** — choice, timing, status, coin
- **bw7-127 Aspertia City Gym** — source review; card effect: custom rule bw7:aspertiaCityGym has no obvious source literal; inspect dispatcher.
- **bw7-128 Energy Search** — choice, privacy, energyMovement, deckSearch
- **bw7-129 Great Ball** — choice, privacy, deckSearch; card effect: custom rule bw2:greatBall has no obvious source literal; inspect dispatcher.
- **bw7-130 Hugh** — choice; card effect: custom rule bw7:hugh has no obvious source literal; inspect dispatcher.
- **bw7-131 Poké Ball** — choice, privacy, deckSearch, coin; card effect: custom rule bw7:pokeBall has no obvious source literal; inspect dispatcher.
- **bw7-132 Potion** — choice
- **bw7-133 Rocky Helmet** — choice; card effect: custom rule bw7:rockyHelmet has no obvious source literal; inspect dispatcher.
- **bw7-134 Skyla** — choice, privacy, deckSearch; card effect: custom rule bw7:skyla has no obvious source literal; inspect dispatcher.
- **bw7-135 Switch** — choice
- **bw7-136 Town Map** — choice; card effect: custom rule bw7:townMap has no obvious source literal; inspect dispatcher.
- **bw7-137 Computer Search** — choice, deckSearch; card effect: custom rule bw7:computerSearch has no obvious source literal; inspect dispatcher.
- **bw7-138 Crystal Edge** — choice; card effect: custom rule bw7:crystalEdge has no obvious source literal; inspect dispatcher.
- **bw7-139 Crystal Wall** — choice; card effect: custom rule bw7:crystalWall has no obvious source literal; inspect dispatcher.
- **bw7-140 Gold Potion** — choice
- **bw7-141 Celebi-EX** — source review; ability Time Recall: custom rule bw7:timeRecall has no obvious source literal; inspect dispatcher.
- **bw7-142 Keldeo-EX** — choice; ability Rush In: custom rule bw7:rushIn has no obvious source literal; inspect dispatcher.
- **bw7-143 Cresselia-EX** — timing; ability Sparkling Particles: custom rule bw7:sparklingParticles has no obvious source literal; inspect dispatcher.
- **bw7-144 Landorus-EX** — choice, energyMovement; attack Hammerhead: custom rule bw7:hammerhead has no obvious source literal; inspect dispatcher.; attack Land's Judgment: custom rule bw7:landsJudgment has no obvious source literal; inspect dispatcher.
- **bw7-145 Black Kyurem-EX** — timing, status, coin
- **bw7-146 White Kyurem-EX** — energyMovement, status, coin; attack Dragon Stream: custom rule bw7:dragonStream has no obvious source literal; inspect dispatcher.
- **bw7-147 Bianca** — choice
- **bw7-148 Cheren** — choice
- **bw7-149 Skyla** — choice, privacy, deckSearch; card effect: custom rule bw7:skyla has no obvious source literal; inspect dispatcher.
- **bw7-150 Golurk** — timing
- **bw7-152 Altaria** — source review; ability Fight Song: custom rule bw6:fightSong has no obvious source literal; inspect dispatcher.
- **bw7-153 Rocky Helmet** — choice; card effect: custom rule bw7:rockyHelmet has no obvious source literal; inspect dispatcher.

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| bw7-1 Oddish | enabled | 2 | 0 |  | 1 |
| bw7-2 Gloom | enabled | 2 | 0 | status | 1 |
| bw7-3 Vileplume | enabled | 1 | 1 | status | 1 |
| bw7-4 Bellossom | enabled | 2 | 0 | status, coin | 0 |
| bw7-5 Tangela | enabled | 2 | 0 |  | 0 |
| bw7-6 Tangrowth | enabled | 2 | 0 | timing | 0 |
| bw7-7 Scyther | enabled | 2 | 0 |  | 1 |
| bw7-8 Heracross | enabled | 2 | 0 | coin | 0 |
| bw7-9 Celebi-EX | enabled | 1 | 1 |  | 1 |
| bw7-10 Shaymin | enabled | 2 | 0 | deckSearch, coin | 0 |
| bw7-11 Snivy | enabled | 2 | 0 |  | 0 |
| bw7-12 Servine | enabled | 2 | 0 | coin | 0 |
| bw7-13 Serperior | enabled | 2 | 0 | coin | 0 |
| bw7-14 Cottonee | enabled | 1 | 0 |  | 0 |
| bw7-15 Whimsicott | enabled | 2 | 0 | timing, status, coin | 0 |
| bw7-16 Petilil | enabled | 1 | 0 | status, coin | 0 |
| bw7-17 Lilligant | enabled | 2 | 0 | coin | 0 |
| bw7-18 Charmander | enabled | 2 | 0 | energyMovement | 0 |
| bw7-19 Charmeleon | enabled | 2 | 0 |  | 0 |
| bw7-20 Charizard | enabled | 2 | 0 | energyMovement | 0 |
| bw7-21 Numel | enabled | 1 | 0 | energyMovement | 0 |
| bw7-22 Camerupt | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| bw7-23 Victini | enabled | 2 | 0 | coin | 0 |
| bw7-24 Tepig | enabled | 2 | 0 |  | 0 |
| bw7-25 Pignite | enabled | 2 | 0 | coin | 0 |
| bw7-26 Emboar | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw7-27 Darumaka | enabled | 1 | 0 | coin | 0 |
| bw7-28 Darmanitan | enabled | 2 | 0 | coin | 0 |
| bw7-29 Squirtle | enabled | 1 | 1 | coin | 0 |
| bw7-30 Wartortle | enabled | 2 | 0 | timing, coin | 0 |
| bw7-31 Blastoise | enabled | 1 | 1 | choice, energyMovement | 0 |
| bw7-32 Psyduck | enabled | 1 | 0 | status, coin | 0 |
| bw7-33 Psyduck | enabled | 1 | 0 | energyMovement | 0 |
| bw7-34 Golduck | enabled | 2 | 0 | status | 0 |
| bw7-35 Golduck | enabled | 2 | 0 | choice, timing, energyMovement | 0 |
| bw7-36 Marill | enabled | 2 | 0 |  | 0 |
| bw7-37 Azumarill | enabled | 2 | 0 | coin | 0 |
| bw7-38 Delibird | enabled | 2 | 0 | status, deckSearch, coin | 0 |
| bw7-39 Oshawott | enabled | 2 | 0 |  | 0 |
| bw7-40 Dewott | enabled | 2 | 0 |  | 0 |
| bw7-41 Samurott | enabled | 2 | 0 | energyMovement | 0 |
| bw7-42 Ducklett | enabled | 1 | 0 |  | 0 |
| bw7-43 Swanna | enabled | 2 | 0 | choice, coin | 0 |
| bw7-44 Frillish | enabled | 1 | 0 |  | 0 |
| bw7-45 Jellicent | enabled | 1 | 1 | status, coin | 0 |
| bw7-46 Cryogonal | enabled | 1 | 0 | coin | 0 |
| bw7-47 Keldeo | enabled | 2 | 0 |  | 0 |
| bw7-48 Keldeo | enabled | 2 | 0 | coin | 0 |
| bw7-49 Keldeo-EX | enabled | 1 | 1 | choice | 0 |
| bw7-50 Pikachu | enabled | 2 | 0 | coin | 0 |
| bw7-51 Voltorb | enabled | 1 | 0 |  | 0 |
| bw7-52 Electrode | enabled | 2 | 0 |  | 0 |
| bw7-53 Electabuzz | enabled | 2 | 0 |  | 0 |
| bw7-54 Electivire | enabled | 2 | 0 |  | 0 |
| bw7-55 Chinchou | enabled | 1 | 0 |  | 0 |
| bw7-56 Blitzle | enabled | 1 | 0 |  | 0 |
| bw7-57 Zebstrika | enabled | 2 | 0 | deckSearch, coin | 0 |
| bw7-58 Wobbuffet | enabled | 1 | 0 |  | 0 |
| bw7-59 Spoink | enabled | 1 | 0 | coin | 0 |
| bw7-60 Grumpig | enabled | 2 | 0 | status | 0 |
| bw7-61 Duskull | enabled | 1 | 0 | status | 0 |
| bw7-62 Dusclops | enabled | 2 | 0 | choice, deckSearch | 0 |
| bw7-63 Dusknoir | enabled | 1 | 1 | choice | 0 |
| bw7-64 Croagunk | enabled | 1 | 0 | status, coin | 0 |
| bw7-65 Croagunk | enabled | 1 | 0 | status | 0 |
| bw7-66 Toxicroak | enabled | 2 | 0 | status | 0 |
| bw7-67 Cresselia-EX | enabled | 1 | 1 | timing | 0 |
| bw7-68 Munna | enabled | 1 | 1 | choice, status, coin | 0 |
| bw7-69 Musharna | enabled | 2 | 0 | status | 0 |
| bw7-70 Woobat | enabled | 2 | 0 | privacy | 0 |
| bw7-71 Swoobat | enabled | 2 | 0 | coin | 0 |
| bw7-72 Venipede | enabled | 1 | 1 | status | 0 |
| bw7-73 Whirlipede | enabled | 1 | 1 | status | 0 |
| bw7-74 Scolipede | enabled | 1 | 1 | status | 0 |
| bw7-75 Gothita | enabled | 2 | 0 |  | 0 |
| bw7-76 Gothorita | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw7-77 Meloetta | enabled | 2 | 0 | timing | 0 |
| bw7-78 Sandshrew | enabled | 2 | 0 |  | 0 |
| bw7-79 Sandslash | enabled | 2 | 0 | timing, coin | 0 |
| bw7-80 Gligar | enabled | 2 | 0 | status, coin | 0 |
| bw7-81 Gliscor | enabled | 2 | 0 | timing, status | 0 |
| bw7-82 Makuhita | enabled | 1 | 0 |  | 0 |
| bw7-83 Trapinch | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw7-84 Dwebble | enabled | 1 | 0 |  | 0 |
| bw7-85 Crustle | enabled | 1 | 1 | coin | 0 |
| bw7-86 Mienfoo | enabled | 1 | 0 | coin | 0 |
| bw7-87 Mienfoo | enabled | 1 | 0 |  | 0 |
| bw7-88 Mienshao | enabled | 2 | 0 | coin | 0 |
| bw7-89 Landorus-EX | enabled | 2 | 0 | choice, energyMovement | 1 |
| bw7-90 Purrloin | enabled | 1 | 0 | coin | 0 |
| bw7-91 Liepard | enabled | 2 | 0 | choice, status, coin | 0 |
| bw7-92 Vullaby | enabled | 2 | 0 |  | 0 |
| bw7-93 Mandibuzz | enabled | 2 | 0 | coin | 0 |
| bw7-94 Scizor | enabled | 2 | 0 | timing | 0 |
| bw7-95 Skarmory | enabled | 2 | 0 | coin | 0 |
| bw7-96 Skarmory | enabled | 2 | 0 | status, coin | 0 |
| bw7-97 Klink | enabled | 1 | 0 |  | 0 |
| bw7-98 Vibrava | enabled | 2 | 0 | coin | 0 |
| bw7-99 Flygon | enabled | 1 | 1 | choice, timing, energyMovement, status | 0 |
| bw7-100 Black Kyurem | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw7-101 Black Kyurem-EX | enabled | 2 | 0 | timing, status, coin | 0 |
| bw7-102 White Kyurem | enabled | 2 | 0 | coin | 0 |
| bw7-103 White Kyurem-EX | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| bw7-104 Rattata | enabled | 1 | 0 | status, coin | 0 |
| bw7-105 Raticate | enabled | 2 | 0 |  | 0 |
| bw7-106 Meowth | enabled | 1 | 0 | status, coin | 0 |
| bw7-107 Farfetch'd | enabled | 1 | 0 | coin | 0 |
| bw7-108 Ditto | enabled | 0 | 1 | choice | 0 |
| bw7-109 Snorlax | enabled | 2 | 0 | coin | 0 |
| bw7-110 Togepi | enabled | 1 | 0 | status, coin | 0 |
| bw7-111 Dunsparce | enabled | 2 | 0 | timing, coin | 0 |
| bw7-112 Taillow | enabled | 1 | 0 |  | 0 |
| bw7-113 Skitty | enabled | 2 | 0 | coin | 0 |
| bw7-114 Delcatty | enabled | 2 | 0 | energyMovement, deckSearch, coin | 0 |
| bw7-115 Spinda | enabled | 1 | 0 | coin | 0 |
| bw7-116 Buneary | enabled | 2 | 0 |  | 0 |
| bw7-117 Lopunny | enabled | 2 | 0 | coin | 0 |
| bw7-118 Patrat | enabled | 1 | 0 | deckSearch | 0 |
| bw7-119 Watchog | enabled | 2 | 0 | timing, status | 0 |
| bw7-120 Lillipup | enabled | 2 | 0 |  | 0 |
| bw7-121 Herdier | enabled | 2 | 0 |  | 0 |
| bw7-122 Stoutland | enabled | 1 | 1 | coin | 0 |
| bw7-123 Pidove | enabled | 1 | 0 | coin | 0 |
| bw7-124 Tranquill | enabled | 1 | 0 | energyMovement | 0 |
| bw7-125 Unfezant | enabled | 2 | 0 | energyMovement, coin | 0 |
| bw7-126 Audino | enabled | 1 | 1 | choice, timing, status, coin | 1 |
| bw7-127 Aspertia City Gym | enabled | 0 | 0 |  | 1 |
| bw7-128 Energy Search | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 1 |
| bw7-129 Great Ball | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| bw7-130 Hugh | enabled | 0 | 0 | choice | 1 |
| bw7-131 Poké Ball | enabled | 0 | 0 | choice, privacy, deckSearch, coin | 0 |
| bw7-132 Potion | enabled | 0 | 0 | choice | 0 |
| bw7-133 Rocky Helmet | enabled | 0 | 0 | choice | 1 |
| bw7-134 Skyla | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| bw7-135 Switch | enabled | 0 | 0 | choice | 0 |
| bw7-136 Town Map | enabled | 0 | 0 | choice | 0 |
| bw7-137 Computer Search | enabled | 0 | 0 | choice, deckSearch | 1 |
| bw7-138 Crystal Edge | enabled | 0 | 0 | choice | 1 |
| bw7-139 Crystal Wall | enabled | 0 | 0 | choice | 1 |
| bw7-140 Gold Potion | enabled | 0 | 0 | choice | 0 |
| bw7-141 Celebi-EX | enabled | 1 | 1 |  | 0 |
| bw7-142 Keldeo-EX | enabled | 1 | 1 | choice | 0 |
| bw7-143 Cresselia-EX | enabled | 1 | 1 | timing | 0 |
| bw7-144 Landorus-EX | enabled | 2 | 0 | choice, energyMovement | 0 |
| bw7-145 Black Kyurem-EX | enabled | 2 | 0 | timing, status, coin | 0 |
| bw7-146 White Kyurem-EX | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| bw7-147 Bianca | enabled | 0 | 0 | choice | 0 |
| bw7-148 Cheren | enabled | 0 | 0 | choice | 1 |
| bw7-149 Skyla | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| bw7-150 Golurk | enabled | 2 | 0 | timing | 0 |
| bw7-151 Terrakion | enabled | 2 | 0 |  | 0 |
| bw7-152 Altaria | enabled | 1 | 1 |  | 0 |
| bw7-153 Rocky Helmet | enabled | 0 | 0 | choice | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

