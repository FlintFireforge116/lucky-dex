# Secret Wonders (dp3) — print-by-print independent implementation audit

**Release:** LuckyDex v0.69.241, 14 November 2026

**Reference:** Pokémon TCG card data, `PokemonTCG/pokemon-tcg-data/cards/en/dp3.json` (printed card names, numbering, HP, evolution, Energy costs, attack names, abilities, Trainer descriptions).

## Audit scope and meaning

- Compared the *132 collector-number prints* and their card identity, evolution, types, HP, Energy costs, attack/ability listings and effect registrations with the referenced Secret Wonders data. There are **120 Pokémon, 10 Trainers, 2 Special Energy**, **194 attack entries** and **45 named Powers/Bodies**. All 132 records are battle-enabled.
- Inspected the custom effects and shared UI choices. Fixed specific printed-rule deviations and tested real post-action states (see below).
- The automatic smoke runner exercises attack/Trainer resolution from both sides but does **not** exhaustively test the true printed ruling of every attack, every random branch, every stadium/tool pairing, or APK rendering. A test file merely mentioning an ID is evidence of attention, not proof of correctness.
- Auditor result: **0 catalog errors**, **0 schema warnings**, **408/408 smoke paths**, **16/16 legal CPU builds**. **101 cards** have mechanical risk tags recommending further scenario checks.

## Concrete printed-rule and UI defects corrected

1. **Dusk Ball** search from the bottom seven now carries the actual collector print ID through selection, rendering the card art instead of a text tile. The same pattern was extended across older cards, reprinted Trainers, Special Energy, evolution and discard recovery choices.
2. **Furret — Baton Pass:** the attacking player can switch and move zero, some or all Energy cards; Special Energy moves as the original physical card. Previously all Energy was forced across.
3. **Nidoking — Poison Rub:** the attacking player may switch the opponent’s Active Pokémon **before attack damage**. The actual new defender receives damage and Poison; skipping retains the original target. Previously the opponent selected a switch after damage.
4. **Golem — Double Throw:** choose two distinct opposing Pokémon, with active Weakness/Resistance correctly applied. It no longer double-hits the same Pokémon when alternatives exist.
5. **Jumpluff — Cottonweed Punch; Cloyster — Spine Missile; Xatu — Energy Singe:** chosen Active targets now use the real attack damage calculation and defensive protection, while Benched targets retain their no-Weakness/Resistance exception.
6. **Choice privacy:** face-down Prizes and unknown opponent hand cards continue to show concealed options. Numeric decisions and yes/no effects remain readable text rather than misleading card fronts.

## Outstanding limits / further in-game tests

- High-risk effects in the ledger retain risk tags; these are follow-up scenarios, **not** confirmed implementation failures.
- Verify true Android card artwork loading at mobile sizes, particularly duplicate species/prints, because Node tests validate the computed art path but not the Android WebView or remote image availability.
- Recheck LV.X and KO/Prize sequencing, copied Supporters, optional chains, opponent decisions and special Energy under actual match play. 16 legal CPU deck builds are not proof of competitive CPU tactics.

## All 132 prints — identity, registered rules and audit risk

| # | Card | Identity | Registered attacks / abilities / effects | Risk tags | Test file mentions |
|---:|---|---|---|---|---:|
| 1 | Ampharos | Stage 2; 130 HP; Lightning | **Cluster Bolt** [LCC] (70) → dp3:1:clusterBolt; **Jamming** → dp3:1:jamming | choice, energyMovement | 1 |
| 2 | Blastoise | Stage 2; 120 HP; Water | **Hydro Pump** [WWC] (50+) → dp3:2:hydroPump; **Waterlog** → dp3:2:waterlog | energyMovement | 2 |
| 3 | Charizard | Stage 2; 130 HP; Fire | **Blast Burn** [RRRC] (120) → dp3:3:blastBurn; **Fury Blaze** → dp3:3:furyBlaze | energyMovement, coin | 2 |
| 4 | Entei | Basic; 80 HP; Fire | **Blaze Roar** [RRR] (60) → dp3:4:blazeRoar; **Burning Coat** → dp3:4:burningCoat | energyMovement, coin | 0 |
| 5 | Flygon | Stage 2; 120 HP; Fighting | **Sand Sonic** [FCC] (60+) → dp3:5:sandSonic; **Irritating Buzz** → dp3:5:irritatingBuzz | timing | 1 |
| 6 | Gallade | Stage 2; 130 HP; Fighting | **Sonic Blade** [FC] → dp3:6:sonicBlade; **Psychic Cut** [PCC] (60+) → dp3:6:psychicCut | privacy | 1 |
| 7 | Gardevoir | Stage 2; 110 HP; Psychic | **Psychic Lock** [PCC] (60) → dp3:7:psychicLock; **Telepass** → dp3:7:telepass | choice, timing | 1 |
| 8 | Gastrodon East Sea | Stage 1; 100 HP; Water | **Dwindling Wave** [WCC] (80-) → dp3:8:dwindling; **Osmotic Pressure** → dp3:8:osmoticPressure | choice | 1 |
| 9 | Gastrodon West Sea | Stage 1; 100 HP; Fighting | **Raging Flood** [FC] (20+) → dp3:9:raging; **Wild Waves** [FCCC] (80) → dp3:9:wildWaves | none | 1 |
| 10 | Ho-Oh | Basic; 90 HP; Fire | **Rainbow Wing** [CCCC] (20×) → dp3:10:rainbowWing; **Phoenix Turn** → dp3:10:phoenixTurn | energyMovement, coin | 1 |
| 11 | Jumpluff | Stage 2; 90 HP; Grass | **Cottonweed Punch** [GG] → dp3:11:cottonweedPunch; **Cotton Spore** → dp3:11:cottonSpore | choice, timing, coin | 2 |
| 12 | Lickilicky | Stage 1; 110 HP; Colorless | **Tongue Reel** [CC] → dp3:12:tongueReel; **Boundless Power** [CCCC] (80) → lock | choice, timing, coin | 0 |
| 13 | Ludicolo | Stage 2; 100 HP; Water | **Nature Power** [WWC] (60+) → dp3:13:naturePower; **Rain Dish** → healSelf | none | 1 |
| 14 | Lugia | Basic; 90 HP; Colorless | **Silver Wing** [C] (20) → dp3:14:silverWing; **Psychic Destruction** [PCC] (120) → dp3:14:psychicDestruction | choice, energyMovement, coin | 1 |
| 15 | Mew | Basic; 60 HP; Psychic | **Psychic Balance** [] → dp3:15:psychicBalance; **Re-creation** [PCC] → dp3:15:reCreation | choice, energyMovement | 0 |
| 16 | Raikou | Basic; 80 HP; Lightning | **Thunder Climb** [LLL] (50+) → dp3:16:thunderClimb; **Thunder Rumble** → dp3:16:thunderRumble | choice, energyMovement | 1 |
| 17 | Roserade | Stage 1; 90 HP; Grass | **Sleep Poison** [G] (20) → status+status; **Magical Leaf** [GCC] (40+) → coinFlip | status, coin | 2 |
| 18 | Salamence | Stage 2; 140 HP; Colorless | **Direct Hit** [CC] (50) → damageRule; **Dragon Finish** [RRWW] → dp3:18:dragonFinish | energyMovement | 4 |
| 19 | Suicune | Basic; 70 HP; Water | **Cure Stream** [WWW] (60) → modifier; **Aqua Recover** → dp3:19:aquaRecover | choice, timing | 0 |
| 20 | Venusaur | Stage 2; 130 HP; Grass | **Giant Bloom** [GGC] (60) → coinFlip; **Miracle Aroma** → dp3:20:miracleAroma | choice, coin | 1 |
| 21 | Absol | Basic; 70 HP; Darkness | **Baleful Wind** [C] → dp3:21:balefulWind; **Raid** [D] (10) → dp3:21:raid | none | 1 |
| 22 | Arcanine | Stage 1; 100 HP; Fire | **Inferno Onrush** [RRCC] (120) → selfDamage; **Flame Dash** → dp3:22:flameDash | timing, energyMovement | 0 |
| 23 | Banette | Stage 1; 80 HP; Psychic | **Ghost Head** [] → dp3:23:ghostHead; **Spiteful Pain** [PP] (40+) → dp3:23:spitefulPain | choice, deckSearch | 0 |
| 24 | Dugtrio | Stage 1; 90 HP; Fighting | **Dig Trap** [FC] → dp3:24:digTrap; **Pit Trap** [FFC] (50+) → dp3:24:pitTrap | timing, coin | 1 |
| 25 | Electivire | Stage 1; 100 HP; Lightning | **Discharge** [LCC] (50×) → dp3:25:discharge; **Motor Drive** → dp3:25:motorDrive | energyMovement, coin | 1 |
| 26 | Electrode | Stage 1; 80 HP; Lightning | **Ion Blast** [LC] (40+) → dp3:26:ionBlast; **Energy Shift** → dp3:26:energyShift | energyMovement | 1 |
| 27 | Furret | Stage 1; 90 HP; Colorless | **Keen Eye** [] → dp3:27:keenEye; **Baton Pass** [CC] (40) → dp3:27:batonPass | choice, energyMovement | 1 |
| 28 | Golduck | Stage 1; 90 HP; Water | **Encore** [P] (20) → dp3:28:encore; **Break Beam** [WP] (40+) → dp3:28:breakBeam | choice, timing | 1 |
| 29 | Golem | Stage 2; 130 HP; Fighting | **Double Throw** [FFC] → dp3:29:doubleThrow; **Megaton Rock** [FFFC] (80) → dp3:29:megatonRock | choice, timing | 2 |
| 30 | Jynx | Basic; 70 HP; Psychic | **Icy Kiss** [WC] (30) → status; **Lovely Kiss** [PC] → dp3:30:lovelyKiss | status | 1 |
| 31 | Magmortar | Stage 1; 110 HP; Fire | **Flame Blast** [R] (20×) → energyDamage; **Fireball Bazooka** [RCC] (40) → dp3:31:fireballBazooka; **Flame Body** → healSelf | choice | 1 |
| 32 | Minun | Basic; 60 HP; Lightning | **Tag Play —** [L] (20) → dp3:32:tagPlayMinus; **Minus Charge** → dp3:32:minusCharge | choice, energyMovement | 1 |
| 33 | Mothim | Stage 1; 80 HP; Grass | **Silver Wind** [] → modifier; **Raging Scales** [GC] (30+) → bonusDamage | timing | 1 |
| 34 | Nidoking | Stage 2; 130 HP; Psychic | **Poison Rub** [CC] (20) → dp3:34:poisonRub; **Pride Attack** [PPCC] (60+) → dp3:34:prideAttack | timing, coin | 1 |
| 35 | Pidgeot | Stage 2; 120 HP; Colorless | **Mirror Move** [CC] → dp3:35:mirrorMove; **Whirlwind** [CC] (50) → forceOpponentSwitch | none | 2 |
| 36 | Plusle | Basic; 60 HP; Lightning | **Tag Play +** [L] (20) → dp3:36:tagPlayPlus; **Plus Charge** → dp3:36:plusCharge | choice, energyMovement | 0 |
| 37 | Sharpedo | Stage 1; 80 HP; Darkness | **Strike Wound** [WCC] (60+) → dp3:37:strikeWound; **Rough Skin** → damage | none | 1 |
| 38 | Sunflora | Stage 1; 80 HP; Grass | **Petal Dance** [GG] (30×) → dp3:38:petalDance; **Grass Whistle** → heal | status, coin | 1 |
| 39 | Unown [S] | Basic; 50 HP; Psychic | **Hidden Power** [C] (10) → coinFlip; **Set** → dp3:39:set | energyMovement, coin | 0 |
| 40 | Weavile | Stage 1; 80 HP; Water | **Shadow Charge** [] → dp3:40:shadowCharge; **Chip Off** [DD] (40) → dp3:40:chipOff; **Dark Engage** → dp3:40:darkEngage | choice | 1 |
| 41 | Wormadam Plant Cloak | Stage 1; 80 HP; Grass | **Leaf Hurricane** [GCC] (60) → dp3:41:leafHurricane; **Plant Cloak** → modifier | status | 1 |
| 42 | Wormadam Sandy Cloak | Stage 1; 80 HP; Fighting | **Push Over** [FCC] (40+) → energyDamage; **Sandy Cloak** → preventEffects | none | 1 |
| 43 | Wormadam Trash Cloak | Stage 1; 70 HP; Metal | **Iron Tackle** [MMC] (70) → selfDamage; **Trash Cloak** → modifier | none | 1 |
| 44 | Xatu | Stage 1; 80 HP; Psychic | **Energy Singe** [PC] → dp3:44:energySinge; **Psychic Shift** → dp3:44:psychicShift | choice, energyMovement, status | 1 |
| 45 | Breloom | Stage 1; 100 HP; Grass | **Drain Punch** [FC] (40) → dp3:45:drainPunch; **Homing Uppercut** [FCC] (60+) → dp3:45:homingUppercut | none | 1 |
| 46 | Charmeleon | Stage 1; 80 HP; Fire | **Fire Fang** [R] (20) → status; **Flare Tail** [RRC] (50+) → dp3:46:flareTail | energyMovement, status, coin | 1 |
| 47 | Cloyster | Stage 1; 80 HP; Water | **Withdraw** [] → dp3:47:withdraw; **Spine Missile** [WC] → dp3:47:spineMissile | choice, coin | 0 |
| 48 | Donphan | Stage 1; 100 HP; Fighting | **Rapid Spin** [FC] (40) → dp3:48:rapidSpin; **Bash In** [FFCC] (70+) → dp3:48:bashIn | none | 1 |
| 49 | Farfetch'd | Basic; 60 HP; Colorless | **Swords Dance** [C] → nextAttackBonus; **Leek Slap** [C] (30) → lock | timing | 3 |
| 50 | Flaaffy | Stage 1; 80 HP; Lightning | **Attract Current** [C] (10) → dp3:50:attractCurrent; **Electromagnetic Kick** [LLC] (60) → coinFlip | deckSearch, coin | 0 |
| 51 | Ivysaur | Stage 1; 80 HP; Grass | **Leech Seed** [GC] (20) → healSelf; **Razor Leaf** [GGC] (60) → noop | none | 0 |
| 52 | Kecleon | Basic; 70 HP; Colorless | **Blind Scratch** [CC] (60) → dp3:52:blindScratch; **Camouflage** → dp3:52:camouflage | energyMovement, coin | 0 |
| 53 | Kirlia | Stage 1; 80 HP; Psychic | **Psychic Research** [P] → dp3:53:psychicResearch; **Telekinesis** [PCC] → damageRule+selectedDamage | choice | 0 |
| 54 | Lombre | Stage 1; 70 HP; Water | **Torment** [CC] (20) → coinFlip; **Absorb** [WW] (40) → healSelf | timing, coin | 0 |
| 55 | Miltank | Basic; 90 HP; Colorless | **Healing Milk** [] → dp3:55:healingMilk; **Continuous Tumble** [CC] (20×) → coinDamage | coin | 2 |
| 56 | Muk | Stage 1; 80 HP; Psychic | **Panic Liquid** [PPC] (50) → status+lock; **Toxic Sludge** → dp3:56:toxicSludge | timing, status | 0 |
| 57 | Nidorino | Stage 1; 80 HP; Psychic | **Spirited Drill** [CC] (20) → modifier; **Poison Horn** [PCC] (40) → status | timing, status | 1 |
| 58 | Pidgeotto | Stage 1; 70 HP; Colorless | **Wing Attack** [C] (20) → noop; **Quick Attack** [CC] (30+) → coinFlip | coin | 0 |
| 59 | Pinsir | Basic; 80 HP; Grass | **Grip and Squeeze** [G] (20) → lock; **Power Guillotine** [GCC] (100) → dp3:59:powerGuillotine | timing, coin | 1 |
| 60 | Quagsire | Stage 1; 90 HP; Water | **Muddy Water** [WCC] (60) → benchDamage; **Aqua Healing** → healSelf | none | 1 |
| 61 | Raticate | Stage 1; 70 HP; Colorless | **Gnaw Off** [C] (10+) → coinFlip; **Sneaky Attack** [C] (20+) → bonusDamage | coin | 1 |
| 62 | Roselia | Basic; 70 HP; Grass | **Sleep Powder** [C] → status; **Razor Leaf** [G] (10) → noop | status | 0 |
| 63 | Sableye | Basic; 60 HP; Darkness | **Rummage** [C] → dp3:63:rummage; **Shadow Sneak** [DC] (20+) → dp3:63:shadowSneak | choice, deckSearch | 1 |
| 64 | Shelgon | Stage 1; 80 HP; Colorless | **Focus Energy** [C] → nextAttackBonus; **Protect Charge** [CCC] (30) → modifier | timing | 1 |
| 65 | Skiploom | Stage 1; 60 HP; Grass | **U-turn** [G] (20) → switch; **Cotton Balloon** → modifier | none | 0 |
| 66 | Smeargle | Basic; 70 HP; Colorless | **Color Pick** [] → dp3:66:colorPick; **Trace** [C] → dp3:66:trace | choice, energyMovement, deckSearch, coin | 0 |
| 67 | Smoochum | Basic; 50 HP; Psychic | **Psykiss** [] → dp3:67:psykiss; **Baby Evolution** → dp3:67:babyEvolution | energyMovement, deckSearch, coin | 1 |
| 68 | Unown [K] | Basic; 60 HP; Psychic | **Hidden Power** [P] (20) → noop; **Kind** → heal | none | 1 |
| 69 | Unown [N] | Basic; 50 HP; Psychic | **Hidden Power** [C] (10) → coinFlip; **Nod** → dp3:69:nod | coin | 1 |
| 70 | Unown [O] | Basic; 50 HP; Psychic | **Hidden Power** [C] (10) → coinFlip; **ONE** → dp3:70:one | coin | 1 |
| 71 | Unown [X] | Basic; 50 HP; Psychic | **Hidden Power** [C] (10) → coinFlip; **X-RAY** → dp3:71:xray | deckSearch, coin | 1 |
| 72 | Unown [Z] | Basic; 50 HP; Psychic | **Hidden Power** [PC] → dp3:72:hiddenPower; **ZERO** → dp3:72:zero | none | 1 |
| 73 | Venomoth | Stage 1; 80 HP; Grass | **Disturbance Dive** [GG] (50) → dp3:73:disturbanceDive; **Dangerous Scales** → dp3:73:dangerousScales | timing, status | 1 |
| 74 | Vibrava | Stage 1; 80 HP; Fighting | **Sand Wind** [F] → dp1:58:aquaShower; **Hyper Beam** [FCC] (40) → coinFlip | energyMovement, coin | 0 |
| 75 | Wartortle | Stage 1; 80 HP; Water | **Giant Wave** [WW] (40) → lock; **Shell Attack** [CCC] (50) → noop | timing | 1 |
| 76 | Bagon | Basic; 50 HP; Colorless | **Bite** [C] (10) → noop; **Rage** [CC] (10+) → damageFromDamage | none | 2 |
| 77 | Bulbasaur | Basic; 60 HP; Grass | **Shake Vine** [] → status; **Bullet Seed** [GC] (10×) → coinDamage | status, coin | 2 |
| 78 | Burmy Plant Cloak | Basic; 40 HP; Grass | **Plant Cloak Tackle** [C] (10+) → bonusDamage; **Wear Cloak** → attachEnergyFromDiscard | energyMovement | 0 |
| 79 | Burmy Sandy Cloak | Basic; 40 HP; Grass | **Sandy Cloak Tackle** [C] (10+) → bonusDamage; **Wear Cloak** → attachEnergyFromDiscard | energyMovement | 0 |
| 80 | Burmy Trash Cloak | Basic; 40 HP; Grass | **Trash Cloak Tackle** [C] (10+) → bonusDamage; **Wear Cloak** → attachEnergyFromDiscard | energyMovement | 0 |
| 81 | Carvanha | Basic; 50 HP; Darkness | **Slash** [W] (10) → noop; **Bite Away** [DC] (20) → coinFlip | privacy, coin | 0 |
| 82 | Charmander | Basic; 50 HP; Fire | **Gnaw** [] (10) → noop; **Lava Burn** [RR] (20) → selectedDamage | none | 5 |
| 83 | Clefairy | Basic; 60 HP; Colorless | **Double Slap** [C] (10×) → coinDamage | coin | 5 |
| 84 | Corsola | Basic; 70 HP; Water | **Rally** [C] → dp3:84:rally; **Hook** [WC] (30) → noop | choice, deckSearch | 3 |
| 85 | Diglett | Basic; 50 HP; Fighting | **Down Draw** [C] → draw; **Mud Spatter** [FF] (30) → noop | none | 4 |
| 86 | Duskull | Basic; 50 HP; Psychic | **Astonish** [P] → coinFlip | choice, privacy, deckSearch, coin | 2 |
| 87 | Electabuzz | Basic; 70 HP; Lightning | **Thundershock** [L] (10) → coinFlip; **Thunder** [LLC] (60) → coinFlip | coin | 1 |
| 88 | Grimer | Basic; 60 HP; Psychic | **Mud Bomb** [C] (10) → noop; **Gunky** [P] → attackCoinGate | timing, coin | 0 |
| 89 | Growlithe | Basic; 70 HP; Fire | **Roar** [C] → forceOpponentSwitch; **Dig Claws** [RC] (20) → noop | none | 0 |
| 90 | Hoppip | Basic; 30 HP; Grass | **Hover Heal** [G] (10) → removeStatus; **Cottonweed** → modifier | none | 0 |
| 91 | Lickitung | Basic; 80 HP; Colorless | **Lick** [C] (10) → coinFlip; **Stomp** [CC] (10+) → coinFlip | coin | 0 |
| 92 | Lotad | Basic; 50 HP; Water | **Water Sport** [W] (10+) → dp3:92:waterSport; **Ram** [WC] (20) → noop | none | 1 |
| 93 | Magmar | Basic; 70 HP; Fire | **Fire Punch** [C] (10) → noop; **Smog** [RC] (20) → status | status | 0 |
| 94 | Mareep | Basic; 50 HP; Lightning | **Thundershock** [L] (10) → coinFlip; **Static Shock** [LC] (20) → noop | coin | 0 |
| 95 | Murkrow | Basic; 50 HP; Darkness | **Feint Attack** [DC] → damageRule+selectedDamage | choice | 1 |
| 96 | Natu | Basic; 40 HP; Psychic | **Bothering Wave** [C] (20) → dp3:96:botheringWave; **Future Sight** [P] → dp3:96:futureSight | energyMovement, deckSearch, coin | 1 |
| 97 | Nidoran ♂ | Basic; 60 HP; Psychic | **Collect** [C] → draw; **Poison Skin** [P] → coinFlip+coinFlip | status, coin | 0 |
| 98 | Phanpy | Basic; 60 HP; Fighting | **Flail** [C] (10×) → damageFromDamage; **Take Down** [FC] (30) → selfDamage | none | 0 |
| 99 | Pidgey | Basic; 50 HP; Colorless | **Growl** [C] → modifier; **Peck** [CC] (20) → noop | timing | 1 |
| 100 | Psyduck | Basic; 60 HP; Water | **Delusion** [C] → draw; **Migraine** [C] (10) → coinFlip | status, coin | 1 |
| 101 | Qwilfish | Basic; 70 HP; Water | **Nerve Shot** [WW] (20) → coinFlip; **Balloon Sting** → dp3:101:balloonSting | timing, coin | 0 |
| 102 | Ralts | Basic; 60 HP; Psychic | **Smack** [C] (10) → noop; **Confuse Ray** [P] → coinFlip | coin | 0 |
| 103 | Rattata | Basic; 30 HP; Colorless | **Tail Whip** [C] → coinFlip; **Bite** [C] (20) → noop | timing, coin | 1 |
| 104 | Sentret | Basic; 60 HP; Colorless | **Grope** [C] → dp3:104:grope; **Scratch** [C] (10) → noop | choice, privacy, deckSearch | 1 |
| 105 | Shellder | Basic; 50 HP; Water | **Shell Rest** [C] → healSelf; **Tongue Slap** [WC] (20) → noop | none | 0 |
| 106 | Shellos East Sea | Basic; 60 HP; Water | **Shell Hunting** [C] → benchFromDeck; **Sprinkle Water** [W] (10) → noop | choice, deckSearch | 1 |
| 107 | Shellos West Sea | Basic; 60 HP; Water | **Mud Spatter** [C] (10) → noop; **Recover** [W] → discardEnergy+healSelf | energyMovement | 1 |
| 108 | Shroomish | Basic; 50 HP; Grass | **Headbutt** [C] (10) → noop; **Toxic Spore** [GC] (20) → coinFlip | coin | 0 |
| 109 | Shuckle | Basic; 60 HP; Grass | **Ferment Poison** [GC] (10) → dp3:109:fermentPoison; **Pot Shell** → dp3:109:potShell | energyMovement, status | 0 |
| 110 | Shuppet | Basic; 50 HP; Psychic | **Gossip** [P] → damage; **Hang Down** [CC] (20) → noop | none | 1 |
| 111 | Spinda | Basic; 70 HP; Colorless | **Dish Out** [C] → draw+draw; **Synchro Punch** [C] (10+) → dp3:111:synchroPunch | energyMovement | 1 |
| 112 | Squirtle | Basic; 50 HP; Water | **Bubble** [] → coinFlip; **Aqua Tail** [WC] (20+) → coinDamageByEnergy | status, coin | 1 |
| 113 | Stantler | Basic; 70 HP; Colorless | **Lead** [] → searchChosen; **Frighten Horn** [CC] (20) → status | privacy, status, deckSearch | 1 |
| 114 | Sunkern | Basic; 40 HP; Grass | **Sun Soak** [C] → dp3:114:sunSoak; **Seed Bomb** [G] (20) → noop | coin | 0 |
| 115 | Trapinch | Basic; 50 HP; Fighting | **Inviting Trap** [C] → forceOpponentSwitch; **Sand Tomb** [F] (10) → lock | timing | 0 |
| 116 | Venonat | Basic; 50 HP; Grass | **Stun Spore** [C] → coinFlip; **Signal Beam** [G] (10) → coinFlip | coin | 0 |
| 117 | Voltorb | Basic; 50 HP; Lightning | **Speed Ball** [L] (20) → noop; **Big Explosion** [LC] (50) → selfDamage | none | 0 |
| 118 | Wooper | Basic; 60 HP; Water | **Yawn** [C] → status; **Splatter** [W] → damageRule+selectedDamage | choice, status | 0 |
| 119 | Bebe's Search | Supporter | dp2:109:bebe — Put one card from your hand on top of your deck, then search for one Pokémon. You cannot play this if it is your only hand card. | none | 2 |
| 120 | Night Maintenance | Item | dp2:113:nightMaintenance — Shuffle up to three Pokémon and Basic Energy cards from your discard pile back into your deck. | choice, energyMovement, deckSearch | 1 |
| 121 | PlusPower | Item | modifier — Attach to one of your Pokémon until end of turn; its attacks do 10 more to the Defending Pokémon. | none | 0 |
| 122 | Professor Oak's Visit | Supporter | dp3:122:oakVisit — Draw three cards, then put one card from hand on the bottom of your deck. | none | 2 |
| 123 | Professor Rowan | Supporter | dp1:112:rowan — Keep one card from your hand, shuffle the rest into your deck and draw four cards. | deckSearch | 3 |
| 124 | Rival | Supporter | dp1:113:rival — Reveal five cards from the top of your deck. Your opponent chooses three to put into your hand; return and shuffle the others. | choice, privacy | 2 |
| 125 | Roseanne's Research | Supporter | dp3:125:roseanne — Search for up to two in any combination of Basic Pokémon and Basic Energy cards; put them into hand. | choice, energyMovement | 1 |
| 126 | Team Galactic's Mars | Supporter | draw+dp3:126:marsBottom — Draw two cards, then choose one opponent hand card without looking and put it on the bottom of their deck. | choice, privacy | 1 |
| 127 | Potion | Item | heal — Remove two damage counters from one of your Pokémon. | none | 3 |
| 128 | Switch | Item | switch — Switch your Active Pokémon with one of your Benched Pokémon. | none | 0 |
| 129 | Darkness Energy | Darkness | specialEnergy — Provides Darkness Energy; adds 10 damage only while attached to a Darkness Pokémon. | none | 2 |
| 130 | Metal Energy | Metal | specialEnergy — Provides Metal Energy; reduces incoming attack damage by 10 only while attached to a Metal Pokémon. | none | 1 |
| 131 | Gardevoir LV.X | Level-Up; 130 HP; Psychic | **Bring Down** [PP] → dp3:131:bringDown; **Teleportation** → dp3:131:teleportation | choice, status | 2 |
| 132 | Honchkrow LV.X | Level-Up; 110 HP; Darkness | **Feint Attack** [CC] → damageRule+selectedDamage; **Darkness Wing** [DDC] (60) → dp3:132:darknessWing | choice | 0 |

## Verification and developer commands

From `~/lucky-dex/source`:

```bash
node scripts/audit-classic-set.cjs --set dp3 --smoke
node --test tests/v07236-classic-card-auditor.test.cjs tests/v07237-secret-wonders-stage1.test.cjs tests/v07238-secret-wonders-stage2.test.cjs tests/v07239-secret-wonders-stage3.test.cjs tests/v07240-secret-wonders-completion.test.cjs tests/v07241-secret-wonders-independent-audit.test.cjs
```

See `source/generated/classic-audit-dp3.md` and its JSON companion for the generated risk inventory, per-card tags, catalog findings and detailed smoke results.
