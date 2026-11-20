# LuckyDex v0.69.326 — XY Flashfire independent master-checklist audit

## Audit basis and build status

- The prior commit `v0.69.325` was inspected through the actual [GitHub Actions build log](https://github.com/FlintFireforge116/lucky-dex/actions/runs/44827329429). The Gradle `auditXY2ForApk` test failed at **test 11**, after official generation completed: the test tried `for (... of e.effects)` when `e.effects` was the boolean `true` for full attack-prevention flags. The source-generation report was **81 battle-enabled / 110 official printed rows, 153 attacks, 13 Abilities**, with 29 gated prints. Android compilation was not reached.
- Official pinned Flashfire data: `PokemonTCG/pokemon-tcg-data`, `cards/en/xy2.json`, Git blob `f531c9d28f16f48c23217e0f5b8ccb0dd1f242e8`. The 110 rows include numbered cards 1–109 plus the alternate Blacksmith print **88a**. The generator verifies source hash, print identities, attacks, and Abilities.
- This patch does **not** include the locally generated mock catalogue or coverage report. The official catalogue is generated inside GitHub by the existing Gradle build gate. The new v0.69.326 GitHub build is **not yet confirmed**.

## Confirmed build fix

`tests/v07325-flashfire.test.cjs` now descends only into effect arrays. The `effects: true` flag is valid metadata, not an array of subeffects, so the old test had been rejecting a correct rule. The audit also expands the allowed rule-handler coverage for newly verified mechanisms, instead of disabling validation. The prebuild `auditXY2ForApk` task now runs both `v07325-flashfire.test.cjs` and the new `v07326-flashfire-audit.test.cjs`.

## Card-specific audited corrections

| Flashfire print | Printed feature | Concrete correction / test |
|---|---|---|
| #1 Caterpie, #2 Metapod | Adaptive Evolution | Evolution from hand is legal on the first turn and the same turn a Pokémon entered play, only while its own Ability is not suppressed. Existing evolution blockers still apply. Two-stage chain tested. |
| #2 Metapod | Harden | Implemented the previously missing handler: prevent damage of **60 or less**, evaluated after matchup on opponent's next turn, never 80 damage. |
| #10 Maractus | Exciting Shake / Prickly Needles | Sets the next owner's-turn six-coin flag. The current turn uses two flips, next own turn six, then reverts to two. The attack's actual damage is 20 times heads. |
| #36 Helioptile | Destructive Beam | Added the printed coin-flip Energy-discard mapping to the existing exact active-Pokémon Energy selection/physical discard handler. |
| #60 Forretress | Thorn Tempest | Offers an **optional** choice on evolution from hand. If accepted, places one damage counter on **each opponent Pokémon** before knockouts are resolved. Declining or evolving from deck does nothing. |
| #61 Durant | Chip Off | Randomly discards distinct, physical hand card references until the opponent has four cards; no invented cards or repeated UIDs. |
| #64 Floette | Flower Veil | Continuous +20 max HP for each own Grass Pokémon per unsuppressed Floette, including Bench Pokémon. Does not affect opposing Grass Pokémon. |
| #71 Dragalge | Poison Barrier | Prevents manual retreat of an opposing Poisoned Active while any unsuppressed Dragalge is in play. Does not block forced switching or consume retreat Energy. |
| #80 Snorlax | Stir and Snooze | Sleeping Snorlax flips two coins at checkup and wakes only if both are heads. |
| #95 Protection Cube | Recoil protection | Prevents damage caused by the Pokémon's **own attack** while the physical Tool is attached, without cancelling opponent damage or unrelated non-attack effects. |

These changes remove nine explicit printed-effect gates and map one previously unmapped attack. Based on the prior official generation, expected new coverage is **91 / 110 battle-enabled prints, 19 gated**, pending GitHub confirmation. All battle-enabled declarations are re-audited for schema validation and supported runtime rules by the build test.

## Remaining 19 explicitly unsupported prints

The following are deliberately excluded from legal decks until the printed interaction is implemented and individually audited; keeping the card art and collection entry is not the same as enabling a battle card.

| Collector # | Pokémon | Remaining work |
|---|---|---|
| 7 | Shiftry | Leaf Draw: discard the selected physical Grass Energy from hand for three draws, with Ability use accounting |
| 9 | Roserade | Whiplash: repeat coins and repeatedly choose opposing Energy cards to discard |
| 20 | Pyroar | Scorching Fang: optional Fire Energy discard with pre-damage bonus choice |
| 21 | Qwilfish | Counterattack Quills: retaliation even when the defender is Knocked Out |
| 23 | Milotic | Energy Grace: self-KO, three discarded Basic Energy attachments, Prize timing |
| 27 | Luvdisc | Heart Wink: stop the next opponent first-turn draw on heads |
| 29 | Floatzel | Rescue: select three physical Pokémon references from discard, then shuffle |
| 34 | Luxray | Fang Snipe: reveal opponent hand and choose exact Trainer for discard |
| 35 and 101 | Magnezone-EX | Dual Bullet: exactly two explicit independent target selections including Bench |
| 38 | Duskull | Revival: target opposing Basic Pokémon in discard and bench it legally |
| 39 | Dusclops | Cursed Drop: distribute four counters among selected opposing targets |
| 40 | Dusknoir | Shadow Void: repeatable friendly damage transfer and Pain Pellets targeting |
| 43 | Meowstic | Ear Influence: repeatable damage counter redistribution on opponent's board |
| 49 | Barbaracle | Rock Rush: optional multiple physical Fighting hand discards and damage scaling |
| 50 | Sneasel | Flash Claw: opponent chooses which card to discard |
| 74 | Goodra | Gooey Regeneration: repeated Energy-discard-to-heal Ability with selection |
| 82 | Furret | Buried Treasure Hunt: exact top-four inspection, choose two, discard other two |
| 85 | Lopunny | Big Jump: whole evolution stack and attached physical cards returned to hand |

## CPU legality and synergy

- An offline full-set-like source fixture was used to exercise `rescueXY2Deck` on Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal, Fairy, and Colorless. **All 10** returned 30-card decks; both the Classic deck validator and owned-quantity validator passed; no orphan evolution lines were detected. This verifies generator/builder interactions, **not** optimal card synergy in every possible battle.
- The genuine v0.69.325 GitHub source-generation pass and CPU test had already passed before the brittle audit test failed. The current patch retains the same CPU builder and its set restriction.

## Verification details

- Flashfire-focused tests with a **temporary official-shaped fixture**: **28/28 passed**, zero failures. The fixture includes an artificial set of card texts and is **not official source evidence**.
- Combined selected Flashfire, XY Base, Legendary Treasures, Supreme Victors and HGSS cross-set run with fixture: **91 passed, 0 failed, 8 skipped**. The skips belonged to unrelated missing source-generated catalogues.
- Clean-tree targeted XY2/XY1 build-gate run after removing the fixture: **41 passed, 0 failed, 11 skipped**. The skipped source-dependent Flashfire tests are executed in GitHub after source generation.
- JavaScript syntax checks for changed battle-engine files; Python bytecode checks for the effect map and catalogue generator; ZIP integrity checks.
- An actual Android APK compilation and on-device interactions have **not** been verified for v0.69.326. Report new build failures rather than relaxing the audit gates.

## Upgrade

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.326_FLASHFIRE_MASTER_AUDIT_BUILD_FIX.zip -d source
git add source
git commit -m "LuckyDex v0.69.326 Flashfire audit and GitHub build fix"
git push origin main
```
