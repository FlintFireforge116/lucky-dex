# LuckyDex v0.69.196 — EX Delta Species (ex11)

Baseline: v0.69.195 (classic hand cap=8, updated EX Unseen Forces Tools).
Source layout: changed files relative to `~/lucky-dex/source/`.

## Content
- 114 English cards registered: 95 Pokémon, 14 Trainers, 5 Special Energy.
- 147 printed attacks represented; 107 attacks across the 68 battle-enabled Pokémon have passed deterministic legal-attack and effect-choice smoke checks.
- 82/114 cards marked FULL and eligible for Classic battle; the remaining 32 are PARTIAL/battle-disabled (not silently implemented as plain damage).
- 3 Pokémon-ex and three Pokémon ★ prints are catalogued; printed two-Prize and one-Star deck rules apply only when supported cards are unlocked.
- Official EX Delta Species art addresses and distinct identities are preserved.
- Added ex11 to player/CPU deck-builder set filters, Classic catalogue, set picker and opponent builder.
- δ-type species evolve from their legal non-δ stages, keeping dual-type attack/Energy requirements.
- Implemented printed conditional effects for Holon Energy FF, GL and WP, EX Darkness/Metal print rules, and the reviewed Trainer/attack/Power subset.
- Fixed Starmie δ Metal Navigation's allowed ordered Zone / physical draw-deck choice and recovered physical Basic Energy destinations. Holon Supporter discard costs block play when no other hand card exists.
- Classic 8-card hand cap and Pocket's separate rules preserved.

## Gated 32 cards
Marowak δ (#10), Metagross δ (#11), Mewtwo δ (#12), Tyranitar δ (#16), Umbreon δ (#17), Azurill (#20), Holon's Electrode (#21), Holon's Magneton (#22), Hypno (#23), Sandslash δ (#27), Slowking (#28), Swellow (#32), Weezing (#33), Ditto (#36), Dragonair δ (#42), Golbat (#43), Hariyama (#44), Illumise (#45), Skarmory (#55), Volbeat (#56), Beldum δ (#59), Drowzee (#67), Holon's Magnemite (#70), Holon's Voltorb (#71), Holon Farmer (#91), Holon Lass (#92), Holon Research Tower (#94), Holon Ruins (#96), Super Scoop Up (#100), Groudon ★ (#111), Kyogre ★ (#112), Metagross ★ (#113).

The Holon Pokémon-as-Energy alternate attachment and return-to-hand flow, complex Prize manipulation, optional multi-step attacks/Powers, and the corresponding CPU actions require completion before these cards can become FULL.

## Tests and release limitations
- 10 new outcome and integration tests: full roster and strict partial gating, complete dual-type CPU decks, two Holon Energy conditional effects, Holon Supporter cost, Starmie two Energy sources, physical discard recovery, 8-card Classic hand, and all 107 playable attack/choice paths.
- Selected v07187–v07196 EX and Energy suite: 160/160 passed in Node. Existing earlier v07193–v07195 subset: 56/56 passed.
- Not all 114 card effects are battle-enabled or proven. No on-device Android touch test performed; no APK was compiled in this environment. No Collection ownership/saves were modified by patch.
- Follow-up: finish the remaining 32 partial cards with printed-effect outcome tests, then perform CPU-versus-CPU and live Android UI coverage before EX Legend Maker.

## Installation
Patch ZIP root contains paths beneath `source/`, not repository root. Apply on top of v0.69.195 after pulling GitHub changes, then commit and push as usual. VersionName 0.69.196 / versionCode 7176.
