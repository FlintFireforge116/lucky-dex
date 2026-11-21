# LuckyDex v0.69.345 — XY Primal Clash Stage 3

Baseline: user-confirmed successful Android/GitHub build of v0.69.344. No cards or official collector prints removed; all 164 XY5 prints remain in the immutable pinned catalogue (217 printed attacks, 13 Ability occurrences and 22 Ancient Traits). This patch is a staged gameplay expansion, **not** a declaration that every XY5 print is fully battle-ready. Cards with an unsupported printed effect remain present in the collection but gated from battling and automatic deck building.

## Newly implemented attack resolution

- **Primal Kyogre-EX — Tidal Storm** (#55 and #149): the 150-damage attack hits opponent Benched Pokémon-EX for 30 each, then offers a target for the mandatory movement of up to two actual attached Energy cards from the attacking Pokémon to one of its own Benched Pokémon. Both Basic Energy counters and attached printed Special Energy references move, without crediting or consuming the Energy Zone or discard. Resolve target and both Energy choices before completing attack/turn/Prize sequencing.
- **Primal Groudon-EX — Gaia Volcano** (#86 and #151): calculates the printed 100 additional damage if *any* Stadium exists, then discards that actual Stadium card to its physical owner's discard; with no Stadium, no bonus. These Groudon prints remain **gated**, because their Ω Barrier trait still needs a comprehensive Trainer-effect audit.
- **M Aggron-EX — Megaton Slam** (#94 and #154): optional coin decision; declining causes the printed 120 damage with no coin, heads adds 120, tails damages each own Benched Pokémon by 20. Coin result and effects resolve in the attack sequence.
- **M Gardevoir-EX — Brilliant Arrow** (#106 and #156): counts Fairy Energy attached across all friendly Pokémon, including correctly typed Special Energy, at 30 damage per Energy; no conversion of unrelated types.
- **Gardevoir-EX — Shining Wind** (#105 and #155): next-opponent-turn Weakness guard with normal switch/turn clearing.

## Passive Abilities, Tools and Stadiums

- **Aegislash — Miracle Guard**: teammates have no Weakness while its Ability is active. **Rhyperior — Rock Wall**: reduce opposing attack damage to every friendly Pokémon by 10 after normal Weakness/Resistance. **Bouffalant — Sap Sipper**: +40 attacking Grass Pokémon. These passives obey Ability suppression; some prints (e.g. Ω Barrier Rhyperior) remain gated if *another* printed mechanic is incomplete.
- **Rough Seas** (#137): once per player turn, heal 30 damage from friendly Water and Lightning Pokémon, using shared α Recovery double-healing logic where appropriate.
- **Scorched Earth** (#138): once per player turn, discard a *real* Fire/Fighting Energy card from hand, then draw two actual deck cards. Separate Energy Zone attachment/ledger does not meet its hand requirement; no action is offered without a legal card.
- **Shrine of Memories** (#139): evolved Pokémon can access printed previous-Evolution attacks when their usual Energy requirements are met.
- **Silent Lab** (#140): suppresses the Abilities of Basic Pokémon on both sides; leaves Stage 1/2 Abilities unaffected.
- **Weakness Policy** (#142 and #164): holder has no Weakness; removes neither its actual Tool nor Resistance.
- **Acro Bike** (#122): reveal/choose one of two physical top-deck cards, send the other real card to the physical discard. **Repeat Ball** (#136): select an actual deck Pokémon whose name matches a Pokémon in play and move that reference into hand.

## Ω Barrier: partial engine integration, prints still gated

A central effect-protection guard now rejects an opponent's Item/Supporter effect targeting an Ω Barrier Pokémon, while not blocking attacks, Pokémon Tools or Stadium cards. The six Ω Barrier prints **remain marked unsupported** until older bespoke Trainer effect handlers and other battle pipelines are audited. Do not silently unlock any of them, including Primal Groudon-EX. Keep all printed texts visible in the card inspector.

## Deck-building safeguards

Primal Clash Spirit Link only with matching Mega/Primal; Shield/Wonder Energy only if there are Metal/Fairy recipients. For new Trainers: Rough Seas needs a Water/Lightning target; Scorched Earth needs physical Fire/Fighting Basic Energy in the actual 30-card deck (not simply a Fire/Fighting Energy Zone plan); Shrine of Memories needs a real connected Evolution line; Silent Lab is avoided if it would suppress owned Basic Pokémon Abilities; Repeat Ball needs duplicate named Pokémon in the constructed deck. Manual retained card choices remain exempt from these auto-selection filters.

## Verification and CI

`tests/v07345-primal-clash-stage3.test.cjs` tests physical target movement, bonus damage, coins and status, optional damage, Special Energy, Trainer choices, field/passive rules, targeted Ω Barrier protection and legal actions. Run after `generateXY5ForApk` via Gradle's `auditXY5ForApk` before Android merges assets, alongside earlier XY5 stages. Cross-era local tests are run on available source; official 164-print source, exact collector numbers/Energy costs and random/competitive 30-card decks are verified in GitHub after the pinned generator runs. A local pass is not proof of GitHub APK success.

## Termux

```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.345_PRIMAL_CLASH_STAGE3.zip -d source

git add source
git commit -m "LuckyDex v0.69.345 Primal Clash gameplay stage 3"
git push origin main
```
