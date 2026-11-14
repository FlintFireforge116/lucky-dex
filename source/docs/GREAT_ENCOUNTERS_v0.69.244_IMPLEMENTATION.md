# LuckyDex Classic — Great Encounters v0.69.244 continuation

## Coverage and limitations

- Canonical set: 106 collector-number prints (100 Pokémon, 6 Trainers), all registered with correct card identifiers and artwork URLs.
- Battle enabled: **100/106**; **6 intentionally gated** pending complete effect/choice/timing implementations.
- Verified by synthetic auditor: 338/342 actions completed, 4 scenarios skipped for missing synthetic prerequisites (not failures and not successful assertions); 16/16 legal generated CPU decks; no catalog errors/warnings.
- Automated regression tests: 51/51 targeted dp4 tests passed, plus 108/108 selected cross-set tests. Physical Android UI device testing has **not** happened in this session.
- Card registration and smoke execution do **not** independently certify every printed effect, player-visible modal, or CPU decision in a real match.

## Implemented in this patch

- Blaziken: Fire Dance attaches Fire from discard to a selected Pokémon; Flame Kick checks and discards two Fire Energy then lets the player choose the opposing target.
- Cresselia: Stadium-dependent healing and optional two-Energy healing; Cresselia LV.X Full Moon Dance moves a selected counter across boards, and Moon Skip gives an additional Prize after an attack KO.
- Porygon-Z: Basic Energy discard changes the Pokémon's type; Sceptile: Basic Grass Energy multiplier for Grass team.
- Swampert: optional repeatable Water/Fighting Energy movement from a Benched Pokémon to the Active.
- Togekiss: evolve-from-hand Power searches the original top-ten-card window, excluding cards that become visible only after an attachment.
- Dialga: Flash Cannon returns Energy and devolves the defending Pokémon; Houndoom: real hand discard and optional Fire/Darkness effect; Latios: conditional Energy search and mandatory Luster Purge discard.
- Palkia: Stadium search/discard and optional Transback; Slowking: KO-dependent deck search; Unown H: real hand discard and alphabet Bench condition.
- Marshtomp: selected 30 damage plus 10 on others; Pelipper: hand Energy attachments, healing and Energy return to deck; Porygon2: physical Supporter discard and copy.
- Solrock: discarded Basic Energy to Bench and team resistance interaction; Amulet Coin and Leftovers: active end-turn effects; Moonlight Stadium: zero Psychic/Darkness retreat on both boards.
- Milotic: Twister's two coins and per-head Energy selections; LV.X attack protection.
- Wailord: sleep attack and between-turn healing; Weezing: coin status and additional Poison damage on both boards.
- Unown F: optional attack coin; opponent must actually choose heads/tails for the concealed-coin Power.
- Cross-set fix: Houndoom's extra Darkness damage now correctly accounts for Weakness and Resistance without applying Resistance twice.

## Printed-card implementation ledger

| # | Card | Status | Printed attack(s) | Poké-Power / Poké-Body |
|---:|---|---|---|---|
| 1 | Blaziken | Enabled | Fire Dance; Flame Kick | — |
| 2 | Cresselia | Enabled | Moon Twinkle; Lunar Dance | — |
| 3 | Darkrai | Enabled | Reach Over; Darkness Pursuit | — |
| 4 | Darkrai | Enabled | Darkness Roar; Sleep Hole | — |
| 5 | Pachirisu | Enabled | Call for Family; Smash Short | — |
| 6 | Porygon-Z | Enabled | Tri Attack | Conversion |
| 7 | Rotom | Enabled | Astonish; Telebeam | — |
| 8 | Sceptile | Enabled | Leaf Blade | Wild Growth |
| 9 | Swampert | Enabled | Hammer Arm | Wash Out |
| 10 | Tangrowth | Enabled | Power Whip; Stick and Absorb | — |
| 11 | Togekiss | Enabled | Air Scroll | Serene Grace |
| 12 | Altaria | Enabled | Dragonbreath; Cotton Cloud | — |
| 13 | Beedrill | Enabled | Band Attack; Twineedle | — |
| 14 | Butterfree | Enabled | Parallel Drain; Dozing Scales | — |
| 15 | Claydol | Enabled | Spinning Attack | Cosmic Power |
| 16 | Dialga | Enabled | Time Bellow; Flash Cannon | — |
| 17 | Exploud | Enabled | Ambient Noise; Hyper Voice | — |
| 18 | Houndoom | Enabled | Dark Fang; Black Fire | — |
| 19 | Hypno | Enabled | Dream Catcher; Hypnoblast | — |
| 20 | Kingler | Enabled | Crabhammer; Scissor Blow | — |
| 21 | Lapras | Enabled | Carry In; Wave Splash | — |
| 22 | Latias | Enabled | Miraculous Light; Mist Ball | — |
| 23 | Latios | Enabled | Energy Draw; Luster Purge | — |
| 24 | Mawile | **GATED** | Pick Out; Jaw Bite | — |
| 25 | Milotic | Enabled | Twister | Marvel Scale |
| 26 | Palkia | Enabled | Spacial Rend; Transback | — |
| 27 | Primeape | Enabled | Whump | Anger Point |
| 28 | Slowking | Enabled | Psych Up | Trump Card |
| 29 | Unown [H] | Enabled | Hidden Power | HEAL |
| 30 | Wailord | Enabled | Sink Deep | Sleeping Pulse |
| 31 | Weezing | Enabled | Offensive Gas | Toxic Virus |
| 32 | Wigglytuff | Enabled | Ballon Attack | Good Night Melody |
| 33 | Arbok | Enabled | Deadly Poison; Wrap | — |
| 34 | Cacturne | Enabled | Pin Missile; Needle Arm | — |
| 35 | Combusken | Enabled | Bulk Up; Double Kick | — |
| 36 | Delibird | Enabled | Present; Ice Ball | — |
| 37 | Floatzel | Enabled | Agility; Aqua Jet | — |
| 38 | Gorebyss | Enabled | Sweet Temptation; Psychic Snap | — |
| 39 | Granbull | Enabled | Daunt; Rage | — |
| 40 | Grovyle | Enabled | Greenness; Poison Breath | — |
| 41 | Hariyama | Enabled | Palm Strike; Spirited Throw | — |
| 42 | Huntail | Enabled | Scary Face; Threaten and Drop | — |
| 43 | Linoone | Enabled | Switcheroo; Overrun | — |
| 44 | Loudred | Enabled | Bass Control; Stomp | — |
| 45 | Magcargo | Enabled | Lava Plume | Magma Armor |
| 46 | Marshtomp | Enabled | Pound; Muddy Bomb | — |
| 47 | Metapod | Enabled | Ram | Emerge |
| 48 | Pelipper | Enabled | Guzzle; Jet Return | — |
| 49 | Porygon2 | Enabled | Speed Attack | Download |
| 50 | Purugly | Enabled | Swagger; Fury Swipes | — |
| 51 | Relicanth | Enabled | Primal Calling; Sleep Swirl | — |
| 52 | Seviper | Enabled | Tail Blade; Poison Tail | — |
| 53 | Skarmory | Enabled | Air Crash; Steel Wing | — |
| 54 | Slowbro | Enabled | Amnesia; Zen Headbutt | — |
| 55 | Togetic | Enabled | Speed Dive; Sweet Kiss | — |
| 56 | Unown [F] | Enabled | Hidden Power | FAKE |
| 57 | Unown [G] | **GATED** | Hidden Power | GUARD |
| 58 | Wailmer | Enabled | Tsunami; Ram | — |
| 59 | Zangoose | Enabled | Slash; Cutting Claw | — |
| 60 | Baltoy | Enabled | Psychic Balance; Spin Turn | — |
| 61 | Buizel | Enabled | Headbutt; Surf | — |
| 62 | Cacnea | Enabled | Sand Attack; Poison Sting | — |
| 63 | Caterpie | Enabled | Tackle | Pupate |
| 64 | Clamperl | Enabled | Clamp; Sparkling Pearl | — |
| 65 | Drowzee | Enabled | Hypnosis; Headbutt | — |
| 66 | Ekans | Enabled | Shed Skin; Poison Fang | — |
| 67 | Feebas | Enabled | Splash; Fast Evolution | — |
| 68 | Glameow | Enabled | Captivate; Slash | — |
| 69 | Houndour | Enabled | Ember; Smash Kick | — |
| 70 | Igglybuff | Enabled | Inquire | Baby Evolution |
| 71 | Illumise | Enabled | Firefly Scent | Scent Conduct |
| 72 | Jigglypuff | Enabled | Hypnotic Gaze; Expand | — |
| 73 | Kakuna | Enabled | Stiffen; Spit Poison | — |
| 74 | Koffing | Enabled | Tackle; Smogscreen | — |
| 75 | Krabby | Enabled | Irongrip; Guillotine | — |
| 76 | Lunatone | Enabled | Knock Over | Gravity Change |
| 77 | Luvdisc | Enabled | Rendezvous; Synchro Dance | — |
| 78 | Makuhita | Enabled | Punch; Arm Thrust | — |
| 79 | Mankey | Enabled | Light Punch; Rage | — |
| 80 | Mudkip | Enabled | Mud Spatter; Endeavor | — |
| 81 | Porygon | Enabled | Calculate; Sharpen | — |
| 82 | Slowpoke | Enabled | Rest; Tumble Over | — |
| 83 | Slugma | Enabled | Steady Firebreathing; Body Slam | — |
| 84 | Snubbull | Enabled | Roar; Bite | — |
| 85 | Solrock | Enabled | Sol Charge | Sunlight |
| 86 | Swablu | Enabled | Super Speed; Shoot Through | — |
| 87 | Tangela | Enabled | Vine Invite; Grass Knot | — |
| 88 | Togepi | Enabled | Yawn; Find a Friend | — |
| 89 | Torchic | Enabled | Peck; Singe | — |
| 90 | Treecko | Enabled | Energy Ball; Absorb | — |
| 91 | Unown [L] | **GATED** | Hidden Power | LINK |
| 92 | Volbeat | Enabled | Firefly Light | Light Conduct |
| 93 | Weedle | Enabled | Call for Family; String Shot | — |
| 94 | Whismur | Enabled | Mumble; Uproar | — |
| 95 | Wingull | Enabled | Water Drip; Wing Attack | — |
| 96 | Zigzagoon | Enabled | Pull Out; Double Stab | — |
| 97 | Amulet Coin | Enabled | — | — |
| 98 | Felicity's Drawing | Enabled | — | — |
| 99 | Leftovers | Enabled | — | — |
| 100 | Moonlight Stadium | Enabled | — | — |
| 101 | Premier Ball | Enabled | — | — |
| 102 | Rare Candy | Enabled | — | — |
| 103 | Cresselia LV.X | Enabled | Moon Skip | Full Moon Dance |
| 104 | Darkrai LV.X | **GATED** | Endless Darkness | Dark Shadow |
| 105 | Dialga LV.X | **GATED** | Metal Flash | Time Skip |
| 106 | Palkia LV.X | **GATED** | Hydro Reflect | Restructure |

## Deliberately gated until proper player/CPU resolution

- **#24 Mawile** — Mawile: face-down Prize revelation and copied Supporter effects must preserve visibility/owner choices.
- **#57 Unown [G]** — Unown G: physically converting a benched Unown into a Pokémon Tool while respecting attachment, discard and protection.
- **#91 Unown [L]** — Unown L: LINK must expose playable attack options from all Unown in play and enforce each copied Energy cost.
- **#104 Darkrai LV.X** — Darkrai LV.X: double sleep-recovery coin flips, special double-tails KO and Basic Darkness Body bonus on all attacks.
- **#105 Dialga LV.X** — Dialga LV.X: Time Skip can terminate either player’s turn at a special point after draw; needs correct priority/order.
- **#106 Palkia LV.X** — Palkia LV.X: opponent-controlled and owner-controlled switches plus optional transfer of all Energy to multiple Benched Pokémon.

## Developer/test instructions

Run from `~/lucky-dex/source`:

```sh
node --test tests/v07243-great-encounters.test.cjs tests/v07244-great-encounters-stage2.test.cjs tests/v07244-great-encounters-remaining.test.cjs
node scripts/audit-classic-set.cjs --set dp4 --smoke --no-write
```

Continue from **v0.69.244** before implementing the six remaining gated cards. Keep card art and all face-down information correct. Re-run previous sets' regression tests after shared battle-engine modifications.
