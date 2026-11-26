# LuckyDex Classic audit — swsh9 / Brilliant Stars

**Status:** No definite catalog/schema failures; 0 warnings; 2 follow-up flags.

**Coverage:** 185/186 enabled, 1 gated. 235 attacks, 34 named abilities; 89/186 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 74 |
| privacy | 16 |
| timing | 21 |
| energyMovement | 40 |
| status | 13 |
| deckSearch | 36 |
| coin | 22 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

Not requested (run with --smoke).

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 129 cards flagged.

- **swsh9-4 Breloom** — status
- **swsh9-5 Tropius** — status
- **swsh9-7 Grotle** — choice, privacy, deckSearch
- **swsh9-14 Shaymin VSTAR** — choice
- **swsh9-17 Charizard V** — timing
- **swsh9-18 Charizard VSTAR** — energyMovement
- **swsh9-22 Entei V** — choice
- **swsh9-23 Torkoal** — timing, coin
- **swsh9-24 Chimchar** — energyMovement
- **swsh9-25 Monferno** — energyMovement
- **swsh9-26 Infernape** — energyMovement, deckSearch
- **swsh9-27 Simisear V** — choice, energyMovement
- **swsh9-28 Kingler V** — choice, deckSearch, coin
- **swsh9-29 Kingler VMAX** — choice, deckSearch
- **swsh9-30 Staryu** — coin
- **swsh9-31 Lapras** — status
- **swsh9-33 Crawdaunt** — energyMovement
- **swsh9-34 Snorunt** — status, coin
- **swsh9-35 Piplup** — status, coin
- **swsh9-37 Empoleon** — choice
- **swsh9-38 Buizel** — timing, coin
- **swsh9-39 Floatzel** — choice
- **swsh9-40 Lumineon V** — choice, privacy, deckSearch
- **swsh9-43 Beartic** — timing
- **swsh9-45 Raichu V** — choice, energyMovement, deckSearch
- **swsh9-46 Electabuzz** — status, coin
- **swsh9-48 Raikou V** — choice
- **swsh9-50 Luxio** — status, coin
- **swsh9-54 Clefable** — choice, deckSearch, coin
- **swsh9-58 Baltoy** — coin
- **swsh9-60 Duskull** — status, coin
- **swsh9-61 Dusclops** — status
- **swsh9-62 Dusknoir** — choice, energyMovement
- **swsh9-63 Chimecho** — choice, privacy, energyMovement, deckSearch
- **swsh9-64 Whimsicott V** — timing
- **swsh9-65 Whimsicott VSTAR** — timing, energyMovement
- **swsh9-66 Sigilyph** — choice, energyMovement, coin
- **swsh9-67 Dedenne** — status
- **swsh9-68 Mimikyu V** — choice, timing
- **swsh9-70 Milcery** — privacy, deckSearch
- **swsh9-71 Alcremie** — energyMovement
- **swsh9-74 Trapinch** — coin
- **swsh9-77 Wormadam** — timing
- **swsh9-79 Lucario** — choice, energyMovement, deckSearch
- **swsh9-81 Sawk** — energyMovement, coin
- **swsh9-84 Grimer** — status
- **swsh9-85 Muk** — status
- **swsh9-87 Weavile** — choice, privacy, coin
- **swsh9-88 Honchkrow V** — choice, privacy
- **swsh9-89 Spiritomb** — timing
- **swsh9-90 Purrloin** — coin
- **swsh9-91 Liepard** — choice
- **swsh9-92 Impidimp** — deckSearch
- **swsh9-95 Morpeko V** — choice
- **swsh9-100 Heatran** — timing
- **swsh9-103 Klang** — timing
- **swsh9-104 Klinklang** — coin
- **swsh9-105 Zamazenta V** — choice
- **swsh9-106 Flygon V** — energyMovement
- **swsh9-109 Garchomp** — choice, timing, deckSearch
- **swsh9-110 Axew** — deckSearch, coin
- **swsh9-114 Dracovish V** — timing
- **swsh9-116 Castform** — energyMovement
- **swsh9-117 Starly** — coin
- **swsh9-119 Staraptor** — energyMovement, deckSearch
- **swsh9-121 Bibarel** — choice, coin
- **swsh9-122 Arceus V** — choice, energyMovement, deckSearch
- **swsh9-123 Arceus VSTAR** — choice, energyMovement, deckSearch
- **swsh9-124 Minccino** — choice, deckSearch
- **swsh9-125 Cinccino** — coin
- **swsh9-126 Tornadus** — choice
- **swsh9-127 Hawlucha** — choice, energyMovement
- **swsh9-128 Drampa V** — deckSearch
- **swsh9-129 Acerola's Premonition** — choice, privacy
- **swsh9-130 Barry** — choice
- **swsh9-131 Blunder Policy** — choice, coin; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh9-132 Boss's Orders** — choice
- **swsh9-133 Café Master** — choice, energyMovement, deckSearch
- **swsh9-134 Cheren's Care** — choice
- **swsh9-135 Choice Belt** — choice
- **swsh9-136 Cleansing Gloves** — choice
- **swsh9-137 Collapsed Stadium** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh9-138 Cynthia's Ambition** — choice, timing
- **swsh9-139 Fresh Water Set** — choice
- **swsh9-140 Friends in Galar** — choice
- **swsh9-141 Gloria** — choice, deckSearch
- **swsh9-142 Hunting Gloves** — choice
- **swsh9-143 Kindler** — choice, privacy, energyMovement, deckSearch
- **swsh9-144 Magma Basin** — energyMovement
- **swsh9-145 Marnie's Pride** — choice, energyMovement
- **swsh9-146 Pot Helmet** — choice
- **swsh9-147 Professor's Research** — choice
- **swsh9-148 Roseanne's Backup** — choice, deckSearch
- **swsh9-149 Team Yell's Cheer** — choice, deckSearch
- **swsh9-150 Ultra Ball** — choice, privacy, deckSearch
- **swsh9-151 Double Turbo Energy** — energyMovement
- **swsh9-153 Charizard V** — timing
- **swsh9-154 Charizard V** — timing
- **swsh9-155 Lumineon V** — choice, privacy, deckSearch
- **swsh9-156 Lumineon V** — choice, privacy, deckSearch
- **swsh9-157 Pikachu V** — choice, energyMovement
- **swsh9-158 Raichu V** — choice, energyMovement, deckSearch
- **swsh9-160 Whimsicott V** — timing
- **swsh9-161 Honchkrow V** — choice, privacy
- **swsh9-162 Honchkrow V** — choice, privacy
- **swsh9-163 Zamazenta V** — choice
- **swsh9-164 Flygon V** — energyMovement
- **swsh9-165 Arceus V** — choice, energyMovement, deckSearch
- **swsh9-166 Arceus V** — choice, energyMovement, deckSearch
- **swsh9-167 Barry** — choice
- **swsh9-168 Cheren's Care** — choice
- **swsh9-169 Cynthia's Ambition** — choice, timing
- **swsh9-170 Kindler** — choice, privacy, energyMovement, deckSearch
- **swsh9-171 Marnie's Pride** — choice, energyMovement
- **swsh9-172 Roseanne's Backup** — choice, deckSearch
- **swsh9-173 Shaymin VSTAR** — choice
- **swsh9-174 Charizard VSTAR** — energyMovement
- **swsh9-175 Whimsicott VSTAR** — timing, energyMovement
- **swsh9-176 Arceus VSTAR** — choice, energyMovement, deckSearch
- **swsh9-177 Cheren's Care** — choice
- **swsh9-178 Cynthia's Ambition** — choice, timing
- **swsh9-179 Kindler** — choice, privacy, energyMovement, deckSearch
- **swsh9-180 Roseanne's Backup** — choice, deckSearch
- **swsh9-181 Galarian Articuno V** — choice, status
- **swsh9-182 Galarian Zapdos V** — timing, energyMovement
- **swsh9-183 Galarian Moltres V** — choice, energyMovement
- **swsh9-184 Arceus VSTAR** — choice, energyMovement, deckSearch
- **swsh9-185 Magma Basin** — energyMovement
- **swsh9-186 Ultra Ball** — choice, privacy, deckSearch

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| swsh9-1 Exeggcute | enabled | 2 | 0 |  | 2 |
| swsh9-2 Exeggutor | enabled | 2 | 0 |  | 1 |
| swsh9-3 Shroomish | enabled | 1 | 0 |  | 2 |
| swsh9-4 Breloom | enabled | 2 | 0 | status | 1 |
| swsh9-5 Tropius | enabled | 1 | 1 | status | 1 |
| swsh9-6 Turtwig | enabled | 2 | 0 |  | 2 |
| swsh9-7 Grotle | enabled | 1 | 1 | choice, privacy, deckSearch | 1 |
| swsh9-8 Torterra | enabled | 2 | 0 |  | 1 |
| swsh9-9 Burmy | enabled | 1 | 0 |  | 0 |
| swsh9-10 Wormadam | enabled | 2 | 0 |  | 0 |
| swsh9-11 Mothim | enabled | 2 | 0 |  | 0 |
| swsh9-12 Cherubi | enabled | 1 | 1 |  | 1 |
| swsh9-13 Shaymin V | enabled | 2 | 0 |  | 1 |
| swsh9-14 Shaymin VSTAR | enabled | 1 | 1 | choice | 1 |
| swsh9-15 Karrablast | enabled | 1 | 0 |  | 0 |
| swsh9-16 Zarude V | enabled | 2 | 0 |  | 0 |
| swsh9-17 Charizard V | enabled | 2 | 0 | timing | 2 |
| swsh9-18 Charizard VSTAR | enabled | 2 | 0 | energyMovement | 1 |
| swsh9-19 Magmar | enabled | 2 | 0 |  | 1 |
| swsh9-20 Magmortar | enabled | 2 | 0 |  | 1 |
| swsh9-21 Moltres | enabled | 1 | 0 |  | 0 |
| swsh9-22 Entei V | enabled | 1 | 1 | choice | 1 |
| swsh9-23 Torkoal | enabled | 2 | 0 | timing, coin | 0 |
| swsh9-24 Chimchar | enabled | 1 | 0 | energyMovement | 0 |
| swsh9-25 Monferno | enabled | 2 | 0 | energyMovement | 0 |
| swsh9-26 Infernape | enabled | 2 | 0 | energyMovement, deckSearch | 1 |
| swsh9-27 Simisear V | enabled | 2 | 0 | choice, energyMovement | 0 |
| swsh9-28 Kingler V | enabled | 2 | 0 | choice, deckSearch, coin | 0 |
| swsh9-29 Kingler VMAX | enabled | 2 | 0 | choice, deckSearch | 0 |
| swsh9-30 Staryu | enabled | 1 | 0 | coin | 0 |
| swsh9-31 Lapras | enabled | 1 | 0 | status | 0 |
| swsh9-32 Corphish | enabled | 2 | 0 |  | 1 |
| swsh9-33 Crawdaunt | enabled | 2 | 0 | energyMovement | 0 |
| swsh9-34 Snorunt | enabled | 2 | 0 | status, coin | 1 |
| swsh9-35 Piplup | enabled | 1 | 0 | status, coin | 0 |
| swsh9-36 Prinplup | enabled | 1 | 0 |  | 0 |
| swsh9-37 Empoleon | enabled | 1 | 1 | choice | 1 |
| swsh9-38 Buizel | enabled | 1 | 0 | timing, coin | 0 |
| swsh9-39 Floatzel | enabled | 2 | 0 | choice | 0 |
| swsh9-40 Lumineon V | enabled | 1 | 1 | choice, privacy, deckSearch | 1 |
| swsh9-41 Manaphy | enabled | 1 | 1 |  | 1 |
| swsh9-42 Cubchoo | enabled | 1 | 0 |  | 0 |
| swsh9-43 Beartic | enabled | 2 | 0 | timing | 0 |
| swsh9-44 Eiscue | enabled | 2 | 0 |  | 1 |
| swsh9-45 Raichu V | enabled | 2 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh9-46 Electabuzz | enabled | 2 | 0 | status, coin | 0 |
| swsh9-47 Electivire | enabled | 2 | 0 |  | 1 |
| swsh9-48 Raikou V | enabled | 1 | 1 | choice | 1 |
| swsh9-49 Shinx | enabled | 1 | 0 |  | 0 |
| swsh9-50 Luxio | enabled | 1 | 0 | status, coin | 0 |
| swsh9-51 Luxray | enabled | 2 | 0 |  | 1 |
| swsh9-52 Pachirisu | enabled | 1 | 0 |  | 0 |
| swsh9-53 Clefairy | enabled | 2 | 0 |  | 1 |
| swsh9-54 Clefable | enabled | 2 | 0 | choice, deckSearch, coin | 1 |
| swsh9-55 Starmie | enabled | 2 | 0 |  | 0 |
| swsh9-56 Mewtwo | enabled | 2 | 0 |  | 1 |
| swsh9-57 Granbull V | enabled | 2 | 0 |  | 1 |
| swsh9-58 Baltoy | enabled | 1 | 0 | coin | 1 |
| swsh9-59 Claydol | enabled | 2 | 0 |  | 0 |
| swsh9-60 Duskull | enabled | 1 | 0 | status, coin | 0 |
| swsh9-61 Dusclops | enabled | 1 | 0 | status | 0 |
| swsh9-62 Dusknoir | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh9-63 Chimecho | enabled | 2 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh9-64 Whimsicott V | enabled | 2 | 0 | timing | 0 |
| swsh9-65 Whimsicott VSTAR | enabled | 2 | 0 | timing, energyMovement | 1 |
| swsh9-66 Sigilyph | enabled | 2 | 0 | choice, energyMovement, coin | 1 |
| swsh9-67 Dedenne | enabled | 1 | 0 | status | 2 |
| swsh9-68 Mimikyu V | enabled | 1 | 1 | choice, timing | 1 |
| swsh9-69 Mimikyu VMAX | enabled | 2 | 0 |  | 1 |
| swsh9-70 Milcery | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh9-71 Alcremie | enabled | 1 | 1 | energyMovement | 1 |
| swsh9-72 Hitmontop | enabled | 2 | 0 |  | 0 |
| swsh9-73 Nosepass | enabled | 1 | 0 |  | 0 |
| swsh9-74 Trapinch | enabled | 1 | 0 | coin | 1 |
| swsh9-75 Vibrava | enabled | 1 | 0 |  | 1 |
| swsh9-76 Flygon | enabled | 2 | 0 |  | 0 |
| swsh9-77 Wormadam | enabled | 2 | 0 | timing | 0 |
| swsh9-78 Riolu | enabled | 1 | 0 |  | 0 |
| swsh9-79 Lucario | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh9-80 Throh | enabled | 2 | 0 |  | 0 |
| swsh9-81 Sawk | enabled | 1 | 0 | energyMovement, coin | 0 |
| swsh9-82 Golett | enabled | 2 | 0 |  | 0 |
| swsh9-83 Golurk | enabled | 2 | 0 |  | 0 |
| swsh9-84 Grimer | enabled | 1 | 0 | status | 0 |
| swsh9-85 Muk | enabled | 1 | 1 | status | 1 |
| swsh9-86 Sneasel | enabled | 2 | 0 |  | 0 |
| swsh9-87 Weavile | enabled | 2 | 0 | choice, privacy, coin | 1 |
| swsh9-88 Honchkrow V | enabled | 1 | 1 | choice, privacy | 1 |
| swsh9-89 Spiritomb | enabled | 2 | 0 | timing | 1 |
| swsh9-90 Purrloin | enabled | 1 | 0 | coin | 0 |
| swsh9-91 Liepard | enabled | 1 | 1 | choice | 1 |
| swsh9-92 Impidimp | enabled | 2 | 0 | deckSearch | 0 |
| swsh9-93 Morgrem | enabled | 2 | 0 |  | 0 |
| swsh9-94 Grimmsnarl | enabled | 2 | 0 |  | 0 |
| swsh9-95 Morpeko V | enabled | 2 | 0 | choice | 1 |
| swsh9-96 Aggron V | enabled | 2 | 0 |  | 1 |
| swsh9-97 Aggron VMAX | enabled | 2 | 0 |  | 1 |
| swsh9-98 Wormadam | enabled | 2 | 0 |  | 0 |
| swsh9-99 Probopass | enabled | 2 | 0 |  | 0 |
| swsh9-100 Heatran | enabled | 2 | 0 | timing | 0 |
| swsh9-101 Escavalier | enabled | 1 | 1 |  | 0 |
| swsh9-102 Klink | enabled | 2 | 0 |  | 0 |
| swsh9-103 Klang | enabled | 2 | 0 | timing | 0 |
| swsh9-104 Klinklang | enabled | 1 | 1 | coin | 0 |
| swsh9-105 Zamazenta V | enabled | 1 | 1 | choice | 0 |
| swsh9-106 Flygon V | enabled | 2 | 0 | energyMovement | 1 |
| swsh9-107 Gible | enabled | 1 | 0 |  | 0 |
| swsh9-108 Gabite | enabled | 1 | 0 |  | 0 |
| swsh9-109 Garchomp | enabled | 1 | 1 | choice, timing, deckSearch | 0 |
| swsh9-110 Axew | enabled | 1 | 0 | deckSearch, coin | 1 |
| swsh9-111 Fraxure | enabled | 2 | 0 |  | 1 |
| swsh9-112 Haxorus | enabled | 2 | 0 |  | 1 |
| swsh9-113 Druddigon | enabled | 2 | 0 |  | 0 |
| swsh9-114 Dracovish V | enabled | 2 | 0 | timing | 1 |
| swsh9-115 Farfetch'd | enabled | 1 | 0 |  | 0 |
| swsh9-116 Castform | enabled | 2 | 0 | energyMovement | 1 |
| swsh9-117 Starly | enabled | 1 | 0 | coin | 0 |
| swsh9-118 Staravia | enabled | 1 | 0 |  | 0 |
| swsh9-119 Staraptor | enabled | 2 | 0 | energyMovement, deckSearch | 0 |
| swsh9-120 Bidoof | enabled | 1 | 0 |  | 1 |
| swsh9-121 Bibarel | enabled | 1 | 1 | choice, coin | 1 |
| swsh9-122 Arceus V | enabled | 2 | 0 | choice, energyMovement, deckSearch | 0 |
| swsh9-123 Arceus VSTAR | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh9-124 Minccino | enabled | 2 | 0 | choice, deckSearch | 0 |
| swsh9-125 Cinccino | enabled | 2 | 0 | coin | 0 |
| swsh9-126 Tornadus | enabled | 1 | 1 | choice | 0 |
| swsh9-127 Hawlucha | enabled | 2 | 0 | choice, energyMovement | 0 |
| swsh9-128 Drampa V | enabled | 2 | 0 | deckSearch | 1 |
| swsh9-129 Acerola's Premonition | enabled | 0 | 0 | choice, privacy | 1 |
| swsh9-130 Barry | enabled | 0 | 0 | choice | 2 |
| swsh9-131 Blunder Policy | enabled | 0 | 0 | choice, coin | 1 |
| swsh9-132 Boss's Orders | enabled | 0 | 0 | choice | 1 |
| swsh9-133 Café Master | enabled | 0 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh9-134 Cheren's Care | enabled | 0 | 0 | choice | 1 |
| swsh9-135 Choice Belt | enabled | 0 | 0 | choice | 1 |
| swsh9-136 Cleansing Gloves | enabled | 0 | 0 | choice | 1 |
| swsh9-137 Collapsed Stadium | enabled | 0 | 0 |  | 1 |
| swsh9-138 Cynthia's Ambition | enabled | 0 | 0 | choice, timing | 1 |
| swsh9-139 Fresh Water Set | enabled | 0 | 0 | choice | 1 |
| swsh9-140 Friends in Galar | enabled | 0 | 0 | choice | 0 |
| swsh9-141 Gloria | enabled | 0 | 0 | choice, deckSearch | 1 |
| swsh9-142 Hunting Gloves | enabled | 0 | 0 | choice | 1 |
| swsh9-143 Kindler | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 1 |
| swsh9-144 Magma Basin | enabled | 0 | 0 | energyMovement | 1 |
| swsh9-145 Marnie's Pride | enabled | 0 | 0 | choice, energyMovement | 1 |
| swsh9-146 Pot Helmet | enabled | 0 | 0 | choice | 1 |
| swsh9-147 Professor's Research | enabled | 0 | 0 | choice | 0 |
| swsh9-148 Roseanne's Backup | enabled | 0 | 0 | choice, deckSearch | 1 |
| swsh9-149 Team Yell's Cheer | enabled | 0 | 0 | choice, deckSearch | 1 |
| swsh9-150 Ultra Ball | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh9-151 Double Turbo Energy | gated | 0 | 0 | energyMovement | 1 |
| swsh9-152 Shaymin V | enabled | 2 | 0 |  | 0 |
| swsh9-153 Charizard V | enabled | 2 | 0 | timing | 0 |
| swsh9-154 Charizard V | enabled | 2 | 0 | timing | 0 |
| swsh9-155 Lumineon V | enabled | 1 | 1 | choice, privacy, deckSearch | 0 |
| swsh9-156 Lumineon V | enabled | 1 | 1 | choice, privacy, deckSearch | 0 |
| swsh9-157 Pikachu V | enabled | 1 | 0 | choice, energyMovement | 1 |
| swsh9-158 Raichu V | enabled | 2 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh9-159 Granbull V | enabled | 2 | 0 |  | 0 |
| swsh9-160 Whimsicott V | enabled | 2 | 0 | timing | 0 |
| swsh9-161 Honchkrow V | enabled | 1 | 1 | choice, privacy | 1 |
| swsh9-162 Honchkrow V | enabled | 1 | 1 | choice, privacy | 1 |
| swsh9-163 Zamazenta V | enabled | 1 | 1 | choice | 0 |
| swsh9-164 Flygon V | enabled | 2 | 0 | energyMovement | 0 |
| swsh9-165 Arceus V | enabled | 2 | 0 | choice, energyMovement, deckSearch | 0 |
| swsh9-166 Arceus V | enabled | 2 | 0 | choice, energyMovement, deckSearch | 0 |
| swsh9-167 Barry | enabled | 0 | 0 | choice | 0 |
| swsh9-168 Cheren's Care | enabled | 0 | 0 | choice | 0 |
| swsh9-169 Cynthia's Ambition | enabled | 0 | 0 | choice, timing | 0 |
| swsh9-170 Kindler | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh9-171 Marnie's Pride | enabled | 0 | 0 | choice, energyMovement | 0 |
| swsh9-172 Roseanne's Backup | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh9-173 Shaymin VSTAR | enabled | 1 | 1 | choice | 0 |
| swsh9-174 Charizard VSTAR | enabled | 2 | 0 | energyMovement | 1 |
| swsh9-175 Whimsicott VSTAR | enabled | 2 | 0 | timing, energyMovement | 0 |
| swsh9-176 Arceus VSTAR | enabled | 1 | 1 | choice, energyMovement, deckSearch | 0 |
| swsh9-177 Cheren's Care | enabled | 0 | 0 | choice | 0 |
| swsh9-178 Cynthia's Ambition | enabled | 0 | 0 | choice, timing | 0 |
| swsh9-179 Kindler | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh9-180 Roseanne's Backup | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh9-181 Galarian Articuno V | enabled | 1 | 1 | choice, status | 1 |
| swsh9-182 Galarian Zapdos V | enabled | 1 | 1 | timing, energyMovement | 1 |
| swsh9-183 Galarian Moltres V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh9-184 Arceus VSTAR | enabled | 1 | 1 | choice, energyMovement, deckSearch | 0 |
| swsh9-185 Magma Basin | enabled | 0 | 0 | energyMovement | 0 |
| swsh9-186 Ultra Ball | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

