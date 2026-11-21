# LuckyDex v0.69.342 — XY Phantom Forces full audit

Base: v0.69.341 successful GitHub Actions run #630. This patch completes the previously gated six prints, and corrects additional attacks uncovered during independent audit.

## New gameplay rules

- Venomoth #2 — Dizzying Wind checks each opponent Trainer with a coin; tails cancels its effect.
- Pachirisu #25 — Trick Sticker temporarily changes Defending Pokémon weakness to Lightning.
- Heliolisk #30 — Parabolic Spark chooses the number of attached Lightning Energy to discard, then deals 30 times that number.
- Team Flare Head Ringer #97 and Jamming Net #98 attach to opponent Pokémon-EX and modify attack costs or damage respectively. Discards return to original owners.
- Robo Substitute #102 — Item-in-hand, 30 HP Pokémon-on-Bench, no Retreat and no Prize on KO; voluntary discard supported.
- Jellicent #21 — Ensnaring Spray adds 10 damage per Energy attached to the opponent's Active Pokémon.
- Galvantula #27 — Cobweb Trip chooses an opposing Benched Pokémon to switch to Active and Confuses the newly Active Pokémon.

## Audit contract

The offline behavioural tests run without the generated official catalogue. The independent official audit and deck samples run after `generateXY4ForApk` during GitHub Actions, checking the full 124 records, all 162 printed attacks and 15 Ability print occurrences, cost symbols, alternate print parity, enabled mechanics and 30-card generated decks. All known gated print numbers are cleared from `scripts/xy4_verified.py`.

## Release status

A targeted local run is not a substitute for the Android build. This patch is prepared for GitHub Actions; do not mark its APK build successful until the upload builds.

## Termux

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.342_PHANTOM_FORCES_FULL_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.342 Phantom Forces full completion and audit"
git push origin main
```
