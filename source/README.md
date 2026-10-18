## v0.59.1 — Barrier Ball mobile start fix

Barrier Ball's phone-sized ready panel is now compact enough to keep **START MATCH** fully visible and tappable. The duplicated long rules paragraph is hidden inside the in-court mobile ready panel because the same full instructions remain available from the first-play popup and the top-right info button. No gameplay rules or physics changed. Android identity remains `com.example.luckydex`, versionName `0.59.1`, versionCode `5901`. No Codex was used.

## v0.59.0 — Barrier Ball

Pokémon Stadium 2 Kids Club now includes Barrier Ball: four Mr. Mime defend a four-way court, slide their Barrier along their goal, return Poké Balls, and use A for a high-speed smash. Barrier movement at contact adds curve, multiple balls can enter play, scoring follows the faithful +1 scorer / -1 defender rule with a zero floor, and the round ends at five points or 60 seconds. Includes Easy/Normal/Hard CPU play, records, four achievements, and first-play/help instructions. No fabricated rare event was added. Android identity remains `com.example.luckydex`, versionName `0.59.0`, versionCode `5900`. No Codex was used.

## v0.58.0 — Arcade instructions everywhere

Every current Arcade game/activity now has a shared first-play instruction sheet covering its goal, controls, rules and a practical tip. The sheet appears before gameplay starts the first time each game is opened, then remains available from a top-right ⓘ button on future visits. Seen state is saved per game in the existing Arcade save data, existing saves migrate automatically, and reopening help pauses/resumes games that expose the shared pause lifecycle. All 35 current Arcade entries are covered. No gameplay balance, achievements, rewards or rare-event odds changed. Android identity remains `com.example.luckydex`, versionName `0.58.0`, versionCode `5800`. No Codex was used.

# LuckyDex v0.56.1

LuckyDex v0.56.1 rebuilds **Furret’s Frolic** around the Stadium 2 interaction model instead of free 2D movement. Each Pokémon now commits to one of four discrete grass patches, remains locked there while the direction is held, and snaps back through its central burrow when released or when switching sides. Furret-body contact never moves a ball: **A / HIT is the only player action that imparts force**.

The playfield has been redrawn for readability with smaller, grass-buried actors, visible home burrows and patch targets, narrow colour-coded scoring mouths and four corner chutes. Four balls enter from the corners at the start, later balls keep feeding in, non-goal walls rebound them back into play, and ball-to-ball collisions now exchange momentum. Poké / Great / Ultra / Master Ball values remain 1 / 2 / 3 / 5 and the authentic late-match Master Ball test control remains available. CPU players use the same patch-lock + A-hit rules, with difficulty affecting reactions, movement and hit accuracy.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.56.1`, versionCode `5601`. No Codex was used.

## v0.56.0 — Furret’s Frolic initial integration

LuckyDex v0.56.0 added **Furret’s Frolic** to Pokémon Stadium 2 · Kids Club as the next one-game Stadium 2 recreation. Its initial free-movement implementation has been superseded by the v0.56.1 proper patch-lock rebuild above.

## v0.55.8 — Picross accessibility + TCG Pocket 10-pack reveal

LuckyDex v0.55.8 is a focused **Picross accessibility + TCG Pocket 10-pack reveal pass**. Pokémon Picross now has a **MAGNIFY** mode that takes over the phone screen, enlarges puzzle cells, keeps column clues pinned across the top and row clues pinned down the left while the board scrolls, and provides explicit zoom controls. A dedicated **PAN** tool lets players move around 15×15 and 20×15 boards by touch without accidentally marking cells, while FILL / EMPTY remain available in the same bottom control strip.

TCG Pocket 10-pack purchases still cost exactly 4,500 Lucky Coins and still roll all ten boosters independently. The difference is presentation: tearing the 10-pack stack now enters the normal card-opening cinematic flow pack-by-pack instead of jumping directly to the 50-card summary. Each booster keeps its own five-card progress, and any independently rolled **Rare Pack** or **God Pack** plays the existing special intro when that booster is reached. The grouped 10-pack summary remains at the end and no pack is rerolled or charged twice.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.55.8`, versionCode `5508`. No Codex was used.

## v0.55.7 — Picross area layout + TCG Pocket OPEN 10

LuckyDex v0.55.7 is a focused **Picross + TCG Pocket quality pass**. Pokémon Picross now uses a roomier two-column phone layout with progress kept inside each area card instead of overlapping the area name.

TCG Pocket now has a dedicated **OPEN 10** option. It costs exactly ten normal Pocket packs (4,500 Lucky Coins at the current 450-coin pack price), rolls all ten boosters independently for normal / Rare Pack / God Pack outcomes, counts all ten packs correctly for stats and daily progress, and finishes on a grouped 10-pack results screen rather than forcing 50 individual card swipes.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.55.7`, versionCode `5507`. No Codex was used.

## v0.55.6 — Kanto Adventure full-playthrough quality pass

LuckyDex v0.55.6 is a **Kanto Adventure full-playthrough quality pass** based on end-to-end player feedback. Adventure now uses the full six battle stats (HP / Attack / Defense / Sp. Atk / Sp. Def / Speed), Physical and Special moves use their correct attacking and defending stats, Fake Out obeys first-turn and immunity rules, Journey move sets reconcile newly available Collection moves, and the Kanto Champion receives a dedicated difficulty bump without globally hardening normal route fights.

Kanto wild encounters are now location-specific, including proper Viridian Forest hunting and Route 19 no longer inheriting Pokémon Mansion encounters. Completed stops can be revisited from the Journey Map for local hunting without rewinding story progress. Mart access follows actual location services, the Champion result has a proper journey-finish action, and a Link Cable item provides an in-game route for standard direct trade evolutions.

The Pokémon Challenge Course now shows a clear HOW TO PLAY explanation before each event. Dust Exchange rarity filtering is multi-select and displayed in rarity order rather than alphabetical order. Ancient Power and other stat-change text now uses real Sp. Atk / Sp. Def labels.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.55.6`, versionCode `5506`. No Codex was used.

## v0.55.5 — Gutsy Golbat bat-flight pass

LuckyDex v0.55.5 is a focused **Gutsy Golbat bat-flight pass**. The shuffled Backmarker / Front-runner / Brawler personality model remains intact, but the Brawler no longer prefers the leader, the player, or high-heart rivals. Each short chaos decision now picks between an equally weighted random rival, a visible heart / loose heart, or an arbitrary cave point, then can switch again a fraction of a second later.

All flyers now move with a more frantic cave-flight feel: stronger lateral acceleration and caps, a sharper flap impulse, faster vertical recovery, more frequent AI jukes, and stronger racer-to-racer rebound. Collision knockback now holds briefly before normal steering retakes control so body checks visibly sling both flyers apart instead of being immediately damped away.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.55.5`, versionCode `5505`. No Codex was used.

## v0.55.2 — Gutsy Golbat collision/control pass

LuckyDex v0.55.2 is a focused **Gutsy Golbat feel pass**. Racer contact now always resolves with physical separation and rebound, while only sufficiently hard body checks scatter a heart. CPU flyers have distinct lateral biases and periodic jukes so the pack contests different hearts and crosses paths instead of simply stacking at the leading edge. The player horizontal boundary now reaches almost the full cave width, and the finish marker sweeps into a reachable part of the arena.

The touch controls are rebuilt for one-handed play: **right-handed is the default**, with LEFT/RIGHT steering grouped on the left and the large FLAP button on the right. A persistent **LEFT-HANDED** mode mirrors the layout.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.55.2`, versionCode `5502`. No Codex was used.

## v0.55.0 — Gutsy Golbat

LuckyDex v0.55.0 adds **Gutsy Golbat** to Pokémon Stadium 2 · Kids Club as the first ROM-informed Stadium 2 recreation. The LuckyDex-native game uses the supplied Stadium 2 rules as reference: tap A/FLAP to rise, steer through the cave, collect hearts, avoid Magnemite, and finish with more hearts than three CPU Golbat. Magnemite collisions scatter up to three held hearts back into the cave, heavy rival collisions can knock one loose, and scattered hearts can be recovered. Easy, Normal and Hard alter CPU reaction/steering/aggression.

A rare **Golden Heart** can appear in the cave, is worth five hearts, has an achievement, and its odds are exposed in Settings for forced testing. Gutsy Golbat also has persistent records, five achievements, meaningful Lucky Coin rewards, touch-first LEFT / FLAP / RIGHT controls, keyboard controls, pause/resume, and a complete Arcade result review. Only Gutsy Golbat was added in this Stadium 2 pass; Clear Cut Challenge remains unchanged.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.55.0`, versionCode `5500`. No Codex was used.

## v0.54.2 — Picross catalogue, completed-stage review + reward rebalance

LuckyDex v0.54.2 corrects the **Pokémon Picross catalogue** after phone testing exposed that physical 3×5 screen positions had been mistaken for stage numbers. All 31 areas now use the stage numbers stored in the original Pokémon Picross area data, while the existing puzzle resources keep their save IDs so prior clears stay attached to the picture actually solved. Pokémon and tutorial pictures now carry English reveal names, including the special forms present in the source catalogue.

Completed Picross levels now reopen as a **locked solved board** with their picture and name visible. They remain completed and do not start a timer or grant another first-clear reward; **REPLAY PUZZLE** explicitly starts a fresh solve while retaining the completion record. First-clear Lucky Coin rewards are also raised to 60 / 150 / 300 / 450 for 5×5 / 10×10 / 15×15 / 20×15 puzzles, with mistakes not reducing the base payout.

Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.54.2`, versionCode `5402`. No Codex was used.



## v0.53.3 — Beach combat presentation + card-art identity guard

- Locks the Beach stage and live HUD/playfield/controls to a stable full width so combat/status changes cannot resize the game.
- Recolours the old purple lower sea to the recovered wave-blue palette and lets the live playfield consume spare vertical space.
- Adds a timed Iron Tail presentation: Pikachu spins through the melee window and a metallic swipe/hit flash appears at the actual attack range.
- Validates card artwork against card identity before modal reuse; stale mismatched art and cross-catalog hints are cleared and safely re-resolved.

## v0.53.2 — Pikachu’s Beach compact mobile layout



- Replaced the split D-pad/action block with a full-width 2×3 grid: JUMP / ▲ / ATTACK over ◀ / ▼ / ▶.

- Removed the blank DX playfield/HUD from the ready state and replaced it with a small Surfing Pikachu hero.

- Compacted difficulty, distance, companion hints and Start so the pre-run view does not need its own scrolling.

- Reduced the phone playfield height and locked the Beach game surface against internal vertical scrolling.



## v0.53.1 — Pikachu’s Beach DX clarity pass



Pikachu’s Beach now opens directly into Super Surfing Pikachu DX. The dedicated Tail/Tilt control is gone: ATTACK fires Thunderbolt on the water and becomes Iron Tail while airborne, while left/right steering performs airborne spins automatically. Waves use the compact recovered animation, vary vertically, require Pikachu to line up with them, and return him to the lane he launched from rather than forcing every landing to the bottom waterline.



Companion effects are now shown in-game: Seaking sweeps up five rings, Lapras restores 20 HP and grants a five-second shield, and Natu actively fires at enemies and bosses. Boss attacks are visible recovered attack sprites with real collision checks instead of hidden lane damage. Recovered animation frames now cycle for the principal player, wave, ally, enemy, boss and attack sprites. Result achievement descriptions have an explicit high-contrast colour. A Lucky Wave now has to be physically caught and then landed cleanly before its prize can be banked.



## v0.53.0 — Pikachu’s Beach Classic + DX expansion



v0.53.0 introduced a two-mode Summer Beach House: a Yellow-derived Classic surfing implementation and a port of the supplied Super Surfing Pikachu DX resources/systems. DX added recovered local sprites/audio, slippery movement, jumping, ranged attacks, airborne Iron Tail, rings, HP pickups, Seaking/Lapras/Natu allies and five boss families (Articuno, Zapdos, Moltres, Lugia and Wailord). v0.53.1 subsequently retired the Classic mode from the playable UI while preserving its migrated save data.



## Verification



See `TEST_REPORT_v0.53.3.md` for focused regression, reward-delivery, package-integrity and environment details. Build caches and generated APKs are not included in the source archive.



## v0.51.0 — Dream World Seek overhaul



Pokémon Seek is now a scene-first, connected-location Dream World search game. Eight supported areas use locally bundled source-verified scenery: Pleasant Forest, Windswept Sky, Sparkling Sea, Spooky Manor, Rugged Mountain, Icy Cave, Dream Park and Pokémon Café Forest. Dream Ruins is omitted because suitable source material was not found. Scene arrangements are authored LuckyDex compositions, not historical room-map reproductions.



Choose a destination and difficulty, follow graph-based Listen clues, select a visible spot, then SEARCH. Target, decoy, clue, lost-berry and rare discoveries occupy real scene spots. Easy has two locations and 110 seconds; Normal up to three and 90 seconds; Hard uses the full area and 75 seconds. Results show exploration stats and every scoring component, persistent bests, achievements, rewards, PLAY AGAIN and BACK TO DREAM WORLD.



Dream Sparkle retains Settings Off / Vanilla 2% / Test 25% / Always 100%. Collection immediately reserves and saves a prize; offline resolution remains retryable, exiting cannot discard a collected prize, and concurrent delivery cannot duplicate it. Existing saves and achievement IDs are retained, with two additive exploration achievements. Ice Cream physics, Wailord gameplay and the removed cone arrows are unchanged.



Android identity remains `com.example.luckydex`, permanent signer unchanged; versionName `0.51.0`, versionCode `5100`. See [test report](TEST_REPORT_v0.51.0.md), [scene/encounter notes](docs/SEEK_V0510_DESIGN_NOTES.md), and [asset provenance](docs/DREAM_WORLD_SEEK_ASSETS.md). External artwork rights are not inferred from repository hosting.



## v0.50.5 — supplied baseline



Dream World now has its third activity, **Pokémon Seek**. The 90-second search uses a 3×3 manor layout, two hiding places per room, directional movement and **Listen Carefully** distance clues. Finding the target scores for the find plus time remaining, wrong Pokémon pause the clock briefly, and the original-style lost-item bonus is present. The game ships with Easy / Normal / Hard, permanent records, a Dream World results screen and six achievements. A rare **Dream Sparkle** can appear near the target area and uses the reserved-safe Arcade prize flow; Settings exposes Off / Vanilla 2% / Test 25% / Always 100% controls. Ice Cream Scoop also masks the baked-in white navigation arrows beside the cone without altering its physics. Android identity remains `com.example.luckydex`, versionName `0.50.5`, versionCode `5005`. No Codex was used.



## v0.50.4 — Dream World top layout cleanup



Dream World top layout is now structurally separated on both Ice Cream Scoop and Wailord’s Water Spout: the venue header sits in normal document flow, the HUD starts below it with its own spacing, and the playfield begins below the HUD instead of sharing the same top layer. The decorative header mascots are hidden on these two screens to keep the top bar clean. No gameplay, achievements, records or rare-event settings changed. Android identity remains `com.example.luckydex`, versionName `0.50.4`, versionCode `5004`. No Codex was used.



## v0.50.3 — Dream World UI + results polish



Dream World now uses compact start cards and cleaner in-game controls. Wailord’s Water Spout hides the instruction banner outside live play, reduces the bottom UI to left / SHOOT / right plus a slim status strip, and its end review is score-first with max multiplier, ball, combo, splash and reward details. Ice Cream Scoop keeps its v0.50.2 per-scoop physics while using a smaller start card and compact drop/status strip. Both games use a dedicated Dream World-styled end-of-run review screen with score as the headline metric, records, rewards, replay, records and venue actions. Existing achievements and forceable rare-event settings are unchanged. Android identity remains `com.example.luckydex`, versionName `0.50.3`, versionCode `5003`. No Codex was used.



## v0.50.2 — Dream World mechanics polish



Wailord’s Water Spout now uses only the left/right controls for movement. Pokémon caught on the water stream stay attached to Wailord until the player presses the new SHOOT button, then launch using their catch position for trajectory; any Pokémon splashing into the water still resets the combo/multiplier. Normal remains a 15-ball clear. Ice Cream Scoop has replaced the old aggregate lean/topple thresholds with per-scoop physics bodies: every scoop carries its own position, velocity, rotation and angular velocity, support is evaluated from the loaded stack’s centre of mass, and scoops roll/slip/fall individually when physical support is lost. Existing achievements and forceable rare-event settings are unchanged. Android identity remains `com.example.luckydex`, versionName `0.50.2`, versionCode `5002`. No Codex was used.



## v0.50.1 — Dream World visual polish



Dream World now uses original Pokémon Dream World artwork for the venue and both minigame playfields, with the bundled venue SVG retained as an offline fallback. Ice Cream Scoop adds a Combee supervisor/20-inch target treatment, stronger contrast, non-selectable game UI and slightly more sensitive lean/collapse tuning. Wailord’s Water Spout uses the Dream World sea presentation, darker readable HUD/panels, smaller/cleaner Wailord staging and removes the tiny moving Pokémon name tags. Rare-event settings and all existing achievements remain unchanged. Android identity remains `com.example.luckydex`, versionName `0.50.1`, versionCode `5001`. No Codex was used.



## v0.49.0 — Dream World · Ice Cream Scoop



Dream World is now a dedicated Arcade location with **Ice Cream Scoop** as its first activity. Scoops sweep across the screen and must be dropped onto the growing tower; overlap, cumulative lean and difficulty-specific stability determine whether the scoop lands or the tower collapses. Easy / Normal / Hard each change speed, scoop width and stability. Runs track height, score, perfects, streaks and difficulty bests in Arcade Records.



A rare **Dream Scoop** can appear during a run, with Off / Vanilla 2% / Test 25% / Always controls in Settings. Landing it safely grants a reserved-safe random Arcade prize and unlocks a hidden achievement. Six Ice Cream Scoop achievements ship with the game, including height, Hard-mode, perfect-chain, Dream Scoop and full 20-scoop tower goals. Android identity remains `com.example.luckydex`, versionName `0.49.0`, versionCode `4900`. No Codex was used.



---



## v0.48.2 — Slot icon art pass



The Mauville Slot Machine now uses actual dedicated slot symbol art for the non-Pokémon reels instead of plain text glyphs: custom Red 7, Blue 7, Cherry, Replay and Power icons now render in the reels and paytable, while Azurill, Lotad and Pikachu continue to use the in-game Pokémon sprites. A dedicated Prize / Mystery Gift icon is also shown in win and jackpot result banners so rewards read more cleanly at a glance. Android identity remains `com.example.luckydex`, versionName `0.48.2`, versionCode `4802`. No Codex was used.



## v0.48.1 — Game Corner consolidation + spinning Slot Machine reels



Arcade navigation is restored to the venue carousel from v0.47.4. Only the Game Corners are consolidated: Arcade now has one top-level **Game Corner** venue, which opens a regional submenu for **Goldenrod** (Voltorb Flip), **Celadon** (Poké Ball Drop), and **Mauville** (Roulette + Slot Machine). Existing game IDs, saves, records, achievements and mechanics are unchanged.



The Mauville Slot Machine now uses continuously scrolling vertical reel strips while each reel is live, with each stopped reel snapping to its real resolved position. The redundant 1 / 2 / 3 coin labels and large spinning/instruction panel were removed; stake controls now show only 25 / 50 / 75 Lucky Coins and the cabinet keeps only compact result feedback. Android identity remains `com.example.luckydex`, versionName `0.48.1`, versionCode `4801`. No Codex was used.



---



## v0.48.0 — Mauville Slot Machine + unified Arcade browser



The existing Game Corner now includes a Gen III-inspired Mauville Slot Machine with 1/2/3-coin betting (scaled to 25/50/75 Lucky Coins), the original five payline progression, manual left-to-right reel stopping, up-to-four-symbol regular reel slip, instant Reel Time stopping, scaled Gen III payout ratios, Pika Power, Replay, machine luck, Red/Blue 7 state changes, permanent records and achievements. Rare Reel Time remains forceable from Settings at Off / 2% / 25% / 100%, and interrupted paid spins are refunded safely.



Arcade now opens directly to one **All Games** catalogue. **Locations** is a secondary browser that groups those same games by their existing venues. Launching through either route preserves the same saves, records, achievements and game IDs, while Back returns to the route the player came from. Android identity remains `com.example.luckydex`, versionName `0.48.0`, versionCode `4800`. No Codex was used.



## v0.47.2 — Mauville Roulette table polish



Roulette now gives the wheel the visual priority it needs on phones: the larger wheel sits above the complete betting mat, the four Pokémon are interleaved around the 12 slots, and Pokémon sprites are no longer enclosed by decorative circles. The wheel itself now spins for just over three seconds while the ball travels in the opposite direction before settling. Colour and Pokémon group bets highlight every currently valid covered slot on both the mat and wheel.



A rare **Golden Ball** can appear on any spin and awards a bonus equal to 10× the current stake in addition to any normal winning payout. Golden Balls persist visibly in their settled pocket for the six-ball table, have permanent records and a hidden achievement, and can be forced from Settings at Off / 2% / 25% / 100%. Android identity remains `com.example.luckydex`, versionName `0.47.2`, versionCode `4702`. No Codex was used.



## v0.45.4 — Elemental Gauntlet attack-system rewrite



Elemental Gauntlet no longer reskins the same lane/circle hazards. Each element now has genuinely different mechanics: Fire uses falling meteors and sweeping fire fronts with safe gaps; Water uses riptides and whirlpools; Electric uses branching bolt strikes and chain-lightning arcs; Ice uses diagonal shard volleys and crystalline freeze bursts; Psychic uses expanding mind waves and full-arena angled psi beams.



The old fixed group/cluster cadence has also been removed. Easy, Normal, Hard and Goldenrod divisions now use continuously varying stochastic attack gaps with overlapping telegraphs and occasional bursts, so there is no repeating attack/rest beat to learn. The finite passive Sp. Def shield and 30 HP reserve remain unchanged, as do Prismatic Storm controls, records and achievements. Android identity remains `com.example.luckydex`, versionName `0.45.4`, versionCode `4504`. Codex was not used.



## v0.45.3 — Elemental Gauntlet endurance pass



Elemental Gauntlet's passive Sp. Def shield is now a finite run-long resource: it never regenerates between hits, waves or downtime. Hard has been extended into sustained bullet-hell phases rather than short bursts, rising from roughly 27 hazards / 8 seconds in Fire to 42 hazards / 12 seconds in Psychic. Normal and Easy are also longer, while Hard retains its clustered, overlapping attack timing and bespoke elemental visuals.



## v0.45.1 — Elemental Gauntlet intensity pass



Elemental Gauntlet now plays as a proper escalating bullet-hell survival event. The old generic Defend meter has become a real rechargeable shield whose maximum strength scales directly with the chosen Pokémon’s base Special Defense. Shielded impacts consume that pool before HP, can visibly break through, and high-Sp. Def Pokémon therefore have much more emergency protection without replacing skilled dodging.



Attack density and timing have been rebuilt, especially on Hard: hazards arrive in overlapping clusters rather than isolated single telegraphs, later waves carry substantially more pressure, and Hard is intentionally a survival-grade step above Normal. Each element now has distinct attack presentation and geometry: flame bursts / fire walls, rushing water / water orbs, jagged lightning bolts / electric fields, ice shards / beams, and expanding psychic shockwaves / unstable psychic orbs. The existing Prismatic Storm settings control, records, Goldenrod integration and seven Elemental Gauntlet achievements remain intact.



Android identity remains `com.example.luckydex`, versionName `0.45.1`, versionCode `4501`. This was implemented directly in the supplied v0.45.0 source; Codex was not used.



## v0.45.0 — Elemental Gauntlet (Special Defense)



Elemental Gauntlet is now the fifth playable Pokémon Challenge Course / Goldenrod event. Choose a caught Pokémon and survive five telegraphed special-attack waves — Fire, Water, Electric, Ice and Psychic — by dragging clear of danger or holding Defend when trapped. Player execution remains decisive: a clean dodge always takes zero damage, while the Pokémon’s real base Special Defense strongly changes the cost of getting hit. Exhibition supports Easy / Normal / Hard, and the existing three-round Division Cup / Type Cup framework supports the new event with seeded CPU scoring and trophies.



A rare **Prismatic Storm** mixes elemental hazards through all five waves and awards a reserved-safe rare prize when cleared. Its normal chance is 2%, with Off / 2% / 25% / 100% controls in Settings for testing. Seven achievements cover first play, 10 plays, full clear, Hard clear, flawless clear, Prismatic survival and a Master Division win. Permanent records track clears, best scores, remaining HP, perfect waves, dodges, defended hits, damage and Prismatic results. Existing Goldenrod Grand Champion requirements are deliberately unchanged so previously earned achievements are not invalidated.



Android identity remains `com.example.luckydex`, versionName `0.45.0`, versionCode `4500`. See `TEST_REPORT_v0.45.0.md` for verification and environment limitations. This pass was edited directly from the supplied v0.44.0 source; Codex was not used.



## v0.44.0 — Pokémon sleeve catalogue



Based solely on the supplied v0.43.1 source. Profile → Customise now contains 202 offline sleeve designs: 114 physical TCG, all 78 reference TCG Pocket designs, and 10 illustrated LuckyDex originals. Search, source/theme filters and larger previews support phone browsing. All 30 legacy IDs remain valid; four starter sleeves remain free. Small themed reward groups use existing saved Adventure, collection, TCG, Arcade and Goldenrod evidence, with secret requirements concealed until discovery. Shared pack and Trade backs follow the equipped sleeve.



Android identity remains `com.example.luckydex`, versionName `0.44.0`, versionCode `4400`. See `TEST_REPORT_v0.44.0.md` for checks and inherited baseline test failures, `docs/COSMETICS_SOURCES_v0440.md` for provenance, and `docs/COSMETICS_PROGRESSION_v0440.md` for durable unlock rules. No publication or external repository change is part of this delivery.



## v0.43.1 — Impact Trial low-Defense expression



Impact Trial now gives very low-Defense Pokémon a much heavier Harden workload and much harsher unblocked damage, while preserving zero damage for perfect Harden clears. Defense below 20 no longer flattens to the same effective value, and tournament CPU scoring uses the same low-end separation.



Android identity remains `com.example.luckydex`, versionName `0.43.1`, versionCode `4301`. See `TEST_REPORT_v0.43.1.md` for verification details.



## v0.43.0 — Goldenrod stat expression and Type Cup trophies



Goldenrod stats now use one steep, diminishing shared curve but express themselves physically in each event: Speed changes Dash pace/acceleration, Attack sets Power Trial ceiling, Defense changes Impact workload/mitigation, and Sp. Atk changes Target Range projectile power/trajectory. CPU rivals use the same stat curve. The Trophy Cabinet now exposes separate Type Cup trophy tracks, and Target Range removes the incorrect prop/tree treatment.



Android identity remains `com.example.luckydex`, versionName `0.43.0`, versionCode `4300`. See `TEST_REPORT_v0.43.0.md` for verification details.



## v0.42.4 — Target Range tournament balance



Based only on the supplied v0.42.3 source archive. This is a bounded balance

release: Target Range shooting, visuals, controls, Golden Target behavior and the

shared Goldenrod tournament rules are unchanged. Only Target Range simulated

opponent scoring was retuned so Rookie is forgiving without becoming automatic,

with a clearer step-up through Poké, Great, Ultra and Master.



In the deterministic balance sample used by the regression suite, Rookie AI has

a median round score of about 71 (90th percentile about 85, rare maximum about

97). A 75-point player round takes a Rookie podium in roughly 70% of sampled

fields; a 90-point round wins roughly 91%, leaving occasional standout rivals.

Later rounds receive only modest score escalation because they already contain

more player targets.



See `TEST_REPORT_v0.42.4.md` for exact verification and environment limitations.

Android identity remains `com.example.luckydex`, versionName `0.42.4`, versionCode

`4204`.



## v0.40.25 — Sushi-Go-Round three-ring redesign



Sushi-Go-Round now uses a cleaner three-ring shared conveyor built around direct plate selection instead of a single fixed EAT station. All four Lickitung remain fixed around a smaller table; plates move continuously and in sync, the player taps any glowing plate currently in reach, and the old centre copy / on-plate names and prices / oversized EAT control are removed. A compact side menu carries the value information instead.



The belt has been slowed from the original stepped 6.24 s lap equivalent to a smooth 7.2 s lap. Three staggered rings provide multiple choices at each station while preserving the existing 60-second scoring, combo, hot-tea, records, rewards and achievement rules. CPU decision cadence was retuned for the wider choice set so Normal remains competitive rather than allowing CPUs to vacuum all three rings.



See `TEST_REPORT_v0.40.25.md` for verification details.