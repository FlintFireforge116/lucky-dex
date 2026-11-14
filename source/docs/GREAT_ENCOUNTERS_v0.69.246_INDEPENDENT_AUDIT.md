# LuckyDex — Great Encounters (dp4) Independent Card-by-Card Audit

**Version:** 0.69.246  
**Reference:** Historical Great Encounters printed-card data (Pokémon TCG card-data repository, `cards/en/dp4.json`), and the current LuckyDex dp4 catalog, Classic effect-resolution engine, deck-builder metadata and test suite.  
**Scope:** 106 numbered cards (100 Pokémon, six Trainers); 172 catalog attacks and 28 named Poké-Powers/Bodies.

## Summary

- **106/106 battle-enabled**, 0 blocking catalog errors, 0 catalog warnings; all 16 generated CPU deck checks legal.
- **80/80 Great Encounters regression tests** passed; **43/43 selected Secret Wonders and Baby Evolution tests** passed.
- **354/356 synthetic Great Encounters smoke paths completed** without a recorded exception; two Rare Candy scenarios were skipped due to incomplete synthetic prerequisites. These are **not passes**. Diamond & Pearl follow-on sets dp2 and dp3 retain 356/356 and 408/408 smoke paths respectively.
- The auditor reports **five nonblocking passive-ability review flags**: Marvel Scale, Sleeping Pulse, Toxic Virus, Sunlight and LINK. Their effect entries are intentionally no-ops because their passive behaviour is handled by shared rules; further real-device boundary testing remains useful.
- **70 of the 106 distinct card IDs occur explicitly in test files**, according to the auditor; the remainder rely on general/smoke coverage and are not individually certified by a dedicated outcome test. No claim of exhaustive gameplay correctness is made.

## Corrections made in this independent pass

1. **Mawile — Jaw Bite (#24):** The +20 bonus is associated with the original Defending Pokémon and applies after Weakness and Resistance on your next turn, not to whichever Pokémon happens to be targeted later.
2. **Zigzagoon — Pull Out (#96):** Search covers the separate Basic Energy discard ledger as well as the physical discard pile, and uses real card-art selections.
3. **Houndoom — Black Fire (#18):** Discard choices recognise attached Special Darkness and Rainbow Energy when they provide the required types, with the correct Burn or +30 branch.
4. **Blaziken — Flame Kick (#1):** Two eligible Fire-providing Energy units can be paid using real attached Special Energy as well as Basic Energy; cards are removed once, into their correct discard zone.
5. **Rotom — Astonish (#7):** A random concealed opposing hand card is revealed and shuffled into the opponent's deck, rather than letting the opponent choose which card to shuffle. The opponent may immediately redraw that card at turn start.
6. **Unown H — HEAL (#29):** The printed requirement of H, E, A and L all on the Bench is impossible with LuckyDex's default three Bench spaces. A *format-specific adaptation* permits all four named Unown across the Active slot and three Bench slots. The source and rules now document this exception.
7. **Card text / auditor:** Removed bogus “under implementation review” attack text from plain-damage attacks, restored the printed meaning of Solrock's Sol Charge (#85), and taught the automated auditor to detect those placeholder descriptions in future sets.
8. **Deck building:** Added cross-card partner preferences for Lunatone/Solrock, Illumise/Volbeat and Igglybuff/Wigglytuff, plus conditional Darkness-energy metadata for Houndoom and Huntail.

**Not a rules change:** The normal 30-card Classic construction, separate Energy Zone, hand attachment allowance, five Prizes and three Bench spaces remain as implemented. We have not silently changed any global format limits.

## Individual card ledger

Every line is an actual numbered print registered in the source. “Direct test” means that the card ID is referenced by at least one test file, **not** that all its effects are proven. “Smoke only” identifies coverage gaps worth pursuing with later targeted gameplay scenarios. Review tags describe complexity, not a confirmed defect.

### 1–32 — Holo/Rare Pokémon

| # | Card | Registered printed mechanics | Implementation verification |
|---:|---|---|---|
| 1 | Blaziken | Fire Dance / Flame Kick | Direct test reference; custom handler; choice / energyMovement |
| 2 | Cresselia | Moon Twinkle / Lunar Dance | Direct test reference; custom handler; choice / energyMovement |
| 3 | Darkrai | Reach Over / Darkness Pursuit | Direct test reference; custom handler; deckSearch |
| 4 | Darkrai | Darkness Roar / Sleep Hole | Direct test reference; custom handler; choice / status |
| 5 | Pachirisu | Call for Family / Smash Short | Direct test reference; custom handler; choice / deckSearch |
| 6 | Porygon-Z | Tri Attack / Conversion (Power/Body) | Direct test reference; custom handler; energyMovement / coin |
| 7 | Rotom | Astonish / Telebeam | Direct test reference; custom handler; choice / deckSearch / coin |
| 8 | Sceptile | Leaf Blade / Wild Growth (Power/Body) | Direct test reference; energyMovement / coin |
| 9 | Swampert | Hammer Arm / Wash Out (Power/Body) | Direct test reference; custom handler; energyMovement |
| 10 | Tangrowth | Power Whip / Stick and Absorb | Direct test reference; custom handler; choice / timing / energyMovement |
| 11 | Togekiss | Air Scroll / Serene Grace (Power/Body) | Smoke only — scenario useful; custom handler; energyMovement / deckSearch / coin |
| 12 | Altaria | Dragonbreath / Cotton Cloud | Direct test reference; timing / coin |
| 13 | Beedrill | Band Attack / Twineedle | Smoke only — scenario useful; coin |
| 14 | Butterfree | Parallel Drain / Dozing Scales | Direct test reference; custom handler; status / coin |
| 15 | Claydol | Spinning Attack / Cosmic Power (Power/Body) | Direct test reference; custom handler; choice |
| 16 | Dialga | Time Bellow / Flash Cannon | Direct test reference; custom handler; choice / energyMovement |
| 17 | Exploud | Ambient Noise / Hyper Voice | Direct test reference; custom handler; timing |
| 18 | Houndoom | Dark Fang / Black Fire | Direct test reference; custom handler; choice / energyMovement |
| 19 | Hypno | Dream Catcher / Hypnoblast | Direct test reference; custom handler; status |
| 20 | Kingler | Crabhammer / Scissor Blow | Smoke only — scenario useful |
| 21 | Lapras | Carry In / Wave Splash | Direct test reference; custom handler; energyMovement |
| 22 | Latias | Miraculous Light / Mist Ball | Direct test reference; energyMovement |
| 23 | Latios | Energy Draw / Luster Purge | Direct test reference; custom handler; energyMovement / deckSearch / coin |
| 24 | Mawile | Pick Out / Jaw Bite | Direct test reference; custom handler; choice / privacy / timing |
| 25 | Milotic | Twister / Marvel Scale (Power/Body) | **Passive review**; custom handler; choice / coin |
| 26 | Palkia | Spacial Rend / Transback | Direct test reference; custom handler; choice / energyMovement / deckSearch / coin |
| 27 | Primeape | Whump / Anger Point (Power/Body) | Direct test reference; timing / coin |
| 28 | Slowking | Psych Up / Trump Card (Power/Body) | Smoke only — scenario useful; custom handler; timing / deckSearch |
| 29 | Unown [H] | Hidden Power / HEAL (Power/Body) | Direct test reference; custom handler |
| 30 | Wailord | Sink Deep / Sleeping Pulse (Power/Body) | **Passive review**; custom handler; timing / status |
| 31 | Weezing | Offensive Gas / Toxic Virus (Power/Body) | **Passive review**; timing / status / coin |
| 32 | Wigglytuff | Ballon Attack / Good Night Melody (Power/Body) | Direct test reference; custom handler; status |

### 33–66 — Uncommon and Common Pokémon

| # | Card | Registered printed mechanics | Implementation verification |
|---:|---|---|---|
| 33 | Arbok | Deadly Poison / Wrap | Smoke only — scenario useful; status / coin |
| 34 | Cacturne | Pin Missile / Needle Arm | Smoke only — scenario useful; coin |
| 35 | Combusken | Bulk Up / Double Kick | Direct test reference; timing / coin |
| 36 | Delibird | Present / Ice Ball | Smoke only — scenario useful; deckSearch / coin |
| 37 | Floatzel | Agility / Aqua Jet | Smoke only — scenario useful; choice / timing / coin |
| 38 | Gorebyss | Sweet Temptation / Psychic Snap | Direct test reference; custom handler; choice |
| 39 | Granbull | Daunt / Rage | Smoke only — scenario useful; timing |
| 40 | Grovyle | Greenness / Poison Breath | Smoke only — scenario useful; choice |
| 41 | Hariyama | Palm Strike / Spirited Throw | Direct test reference; custom handler; coin |
| 42 | Huntail | Scary Face / Threaten and Drop | Direct test reference; custom handler; timing / energyMovement / coin |
| 43 | Linoone | Switcheroo / Overrun | Direct test reference; custom handler |
| 44 | Loudred | Bass Control / Stomp | Smoke only — scenario useful; choice / coin |
| 45 | Magcargo | Lava Plume / Magma Armor (Power/Body) | Direct test reference; custom handler; choice / status |
| 46 | Marshtomp | Pound / Muddy Bomb | Direct test reference; custom handler |
| 47 | Metapod | Ram / Emerge (Power/Body) | Direct test reference; coin |
| 48 | Pelipper | Guzzle / Jet Return | Direct test reference; custom handler; choice / energyMovement |
| 49 | Porygon2 | Speed Attack / Download (Power/Body) | Direct test reference; custom handler |
| 50 | Purugly | Swagger / Fury Swipes | Smoke only — scenario useful; energyMovement / coin |
| 51 | Relicanth | Primal Calling / Sleep Swirl | Smoke only — scenario useful; choice / status |
| 52 | Seviper | Tail Blade / Poison Tail | Smoke only — scenario useful; timing / coin |
| 53 | Skarmory | Air Crash / Steel Wing | Smoke only — scenario useful; timing / energyMovement / coin |
| 54 | Slowbro | Amnesia / Zen Headbutt | Smoke only — scenario useful; choice / timing |
| 55 | Togetic | Speed Dive / Sweet Kiss | Direct test reference; custom handler; choice |
| 56 | Unown [F] | Hidden Power / FAKE (Power/Body) | Direct test reference; custom handler; choice / coin |
| 57 | Unown [G] | Hidden Power / GUARD (Power/Body) | Direct test reference; custom handler |
| 58 | Wailmer | Tsunami / Ram | Smoke only — scenario useful; coin |
| 59 | Zangoose | Slash / Cutting Claw | Smoke only — scenario useful |
| 60 | Baltoy | Psychic Balance / Spin Turn | Smoke only — scenario useful |
| 61 | Buizel | Headbutt / Surf | Direct test reference |
| 62 | Cacnea | Sand Attack / Poison Sting | Direct test reference; timing / coin |
| 63 | Caterpie | Tackle / Pupate (Power/Body) | Direct test reference; coin |
| 64 | Clamperl | Clamp / Sparkling Pearl | Direct test reference; coin |
| 65 | Drowzee | Hypnosis / Headbutt | Direct test reference; status |
| 66 | Ekans | Shed Skin / Poison Fang | Smoke only — scenario useful; coin |

### 67–96 — Common Pokémon

| # | Card | Registered printed mechanics | Implementation verification |
|---:|---|---|---|
| 67 | Feebas | Splash / Fast Evolution | Direct test reference; deckSearch |
| 68 | Glameow | Captivate / Slash | Smoke only — scenario useful |
| 69 | Houndour | Ember / Smash Kick | Smoke only — scenario useful; energyMovement / coin |
| 70 | Igglybuff | Inquire / Baby Evolution (Power/Body) | Direct test reference; custom handler |
| 71 | Illumise | Firefly Scent / Scent Conduct (Power/Body) | Direct test reference; custom handler; status / deckSearch / coin |
| 72 | Jigglypuff | Hypnotic Gaze / Expand | Direct test reference; timing / status |
| 73 | Kakuna | Stiffen / Spit Poison | Smoke only — scenario useful; timing |
| 74 | Koffing | Tackle / Smogscreen | Smoke only — scenario useful |
| 75 | Krabby | Irongrip / Guillotine | Smoke only — scenario useful |
| 76 | Lunatone | Knock Over / Gravity Change (Power/Body) | Direct test reference; custom handler; choice |
| 77 | Luvdisc | Rendezvous / Synchro Dance | Direct test reference; custom handler; energyMovement |
| 78 | Makuhita | Punch / Arm Thrust | Smoke only — scenario useful; energyMovement / coin |
| 79 | Mankey | Light Punch / Rage | Smoke only — scenario useful |
| 80 | Mudkip | Mud Spatter / Endeavor | Smoke only — scenario useful; coin |
| 81 | Porygon | Calculate / Sharpen | Smoke only — scenario useful; deckSearch |
| 82 | Slowpoke | Rest / Tumble Over | Smoke only — scenario useful; timing / status |
| 83 | Slugma | Steady Firebreathing / Body Slam | Smoke only — scenario useful; coin |
| 84 | Snubbull | Roar / Bite | Smoke only — scenario useful |
| 85 | Solrock | Sol Charge / Sunlight (Power/Body) | **Passive review**; custom handler; energyMovement |
| 86 | Swablu | Super Speed / Shoot Through | Smoke only — scenario useful; coin |
| 87 | Tangela | Vine Invite / Grass Knot | Smoke only — scenario useful |
| 88 | Togepi | Yawn / Find a Friend | Direct test reference; status / deckSearch / coin |
| 89 | Torchic | Peck / Singe | Direct test reference |
| 90 | Treecko | Energy Ball / Absorb | Direct test reference; custom handler; choice |
| 91 | Unown [L] | Hidden Power / LINK (Power/Body) | **Passive review**; custom handler; choice / energyMovement |
| 92 | Volbeat | Firefly Light / Light Conduct (Power/Body) | Direct test reference; custom handler; coin |
| 93 | Weedle | Call for Family / String Shot | Direct test reference; deckSearch / coin |
| 94 | Whismur | Mumble / Uproar | Smoke only — scenario useful; custom handler; coin |
| 95 | Wingull | Water Drip / Wing Attack | Smoke only — scenario useful |
| 96 | Zigzagoon | Pull Out / Double Stab | Direct test reference; custom handler; coin |

### 97–106 — Trainers and LV.X

| # | Card | Registered printed mechanics | Implementation verification |
|---:|---|---|---|
| 97 | Amulet Coin | Trainer effect | Direct test reference |
| 98 | Felicity's Drawing | Trainer effect | Direct test reference; custom handler; choice |
| 99 | Leftovers | Trainer effect | Direct test reference |
| 100 | Moonlight Stadium | Trainer effect | Direct test reference |
| 101 | Premier Ball | Trainer effect | Direct test reference; custom handler; deckSearch |
| 102 | Rare Candy | Trainer effect | Direct test reference; choice |
| 103 | Cresselia LV.X | Moon Skip / Full Moon Dance (Power/Body) | Direct test reference; custom handler |
| 104 | Darkrai LV.X | Endless Darkness / Dark Shadow (Power/Body) | Direct test reference; status / coin |
| 105 | Dialga LV.X | Metal Flash / Time Skip (Power/Body) | Direct test reference; custom handler; timing / coin |
| 106 | Palkia LV.X | Hydro Reflect / Restructure (Power/Body) | Direct test reference; custom handler; choice / energyMovement |

## Remaining targeted checks for phone gameplay

- **Reactive passive boundaries:** Check Milotic Marvel Scale against different LV.X targets, Wailord Sleeping Pulse on each between-turn sleep check, Weezing Toxic Virus when both players have Poisoned Pokémon, Solrock Sunlight with Lunatone present/absent, and Unown L LINK when mixed Unown attacks are used.
- **Choice UI / hidden information:** Verify Rotom Astonish exposes only the one selected card; use real artwork for hand, discard and Prize choices, while maintaining unrevealed Prize privacy.
- **Rare Candy smoke harness:** Add complete Basic + evolution + hand contents for both sides so the last two synthetic skips can become meaningful checks. A focused legal-action test already passes.
- **Cross-set Energy:** Try Houndoom's Black Fire and Blaziken's Flame Kick using Basic, Special and Rainbow Energy in mixed configurations, confirming correct discard, damage and Special-Energy effects.
- **Known adaptation:** Unown HEAL in the default three-Bench Classic game is intentionally playable with H/E/A/L distributed over Active + Bench; a future expansion of Bench capacity must re-check this rule against the original print.

This report is a **printed-card catalog/handler review plus targeted outcome testing**, not a guarantee that every possible battle state, CPU decision and Android rendering has been reproduced. The five passive-implementation review flags remain nonblocking and are explicitly documented.
