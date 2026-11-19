# LuckyDex 0.69.298 — Black & White: Emerging Powers

**Base:** v0.69.297 Black & White Base independent audit. Install this ZIP over that version.

## Integration

- 98/98 distinct prints, including full-art Thundurus 97/98 and Tornadus 98/98.
- 91 Pokémon, 7 Trainers, 164 attacks, 2 Abilities.
- Exact print identities, attack costs, texts, basic stats, evolution parents, and resistance/weakness from pinned authoritative `bw2` metadata.
- Set index, pack/collection ownership projection, card-set picker, CPU set filters, Classic deck builder, and Test Lab registry integration.
- No internet needed during Termux/GitHub builds; the generator validates the pinned source checksum.

## Important battle features

- Gothitelle Magic Room actively blocks opposing Item plays only while Gothitelle is Active.
- Krookodile Black Eyes is optional, active-only and selects valid opposing Active Energy.
- Leavanny Nurturing evolves actual chosen Pokémon from a chosen matching deck card.
- Whimsicott Helping Hand and Thundurus Charge take Energy from the deck or ordered Basic Energy Zone.
- Great Ball, Max Potion, Crushing Hammer, Recycle, Charge Beam, Energy Wheel and Hurricane move actual cards or tracked Basic Energy.
- Sigilyph Psychic Assault, Mandibuzz Dark Pulse and Ferrothorn Power Whip compute dynamic damage before matchup modifiers.
- Swoobat Phat Sound uses three rolls for all opposing Pokémon; Superpower and Quick Tail Smash have optional choices.
- Named-move locks for Sacred Sword and Zap Cannon; opponent move choice for Encore.
- Roggenrola Harden and old/new Ability separation respected.

## Source test results (v0.69.298)

- Printed roster: **98/98 present and battle enabled**.
- Card audit: **0 errors, 0 warnings, 36 static follow-up flags** (mostly due to custom rule dispatcher references).
- Set smoke: **342/342 scenarios executed, 0 skipped**.
- CPU audit sample: **16/16 valid decks**.
- Dedicated Emerging Powers tests: **26/26 passed**.
- Combined Undaunted, Triumphant, Call of Legends, Black & White Base and Emerging Powers: **134/134 passed**.
- Separate seed sweep: **108/108 valid 30-card BW2 CPU decks** with required evolution ancestors (within dedicated tests).

**Important:** The smoke scenarios and targeted regression tests do not establish exhaustive printed-effect correctness. The 36 static review flags should be reassessed in a future independent audit. Android APK compilation and on-device tests have *not* been run in this workspace.

## Termux installation

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.298_BW2_EMERGING_POWERS.zip -d source
git add source
git commit -m "LuckyDex v0.69.298 Emerging Powers complete set"
git push origin main
```
