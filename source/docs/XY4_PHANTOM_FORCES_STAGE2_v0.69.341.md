# LuckyDex v0.69.341 — Phantom Forces gameplay, Stage 2

Baseline: v0.69.340 successful GitHub release. The *official* XY4 catalogue generator remains unchanged: 124 total prints, 162 printed attacks and 15 printed abilities.

## Newly completed mechanics

- `XY4` attack and activated/triggered/passive rule handlers use shared effect-choice UI and real physical card references.
- Turbo Bolt, Bronzong Metal Links, Hydreigon Dark Impulse, Leavanny Coordinate and Jellicent Meddling use the **correct owner**, selected recipient and actual discarded/deck Energy/Tool cards, not created substitute cards.
- AZ, Battle Compressor, Enhanced Hammer, Sycamore, Lysandre's Trump Card, Target Whistle and Xerosic perform explicit player/CPU choices and actual zone transfers.
- Night Attack, Cursed Drop, Sneaky Bite, Surprise Bite, Fainting Spell, Hyper Hypnosis, Hyper Whirlpool, Chrono Wind, Lucky Punch, Fly, Tender Vengeance, Charge Dash and other attacks have mapped effects.
- Gourgantic, High Density Armor, Mighty Shield, Bide Barricade, Slip Trip, Tasting, Flare Command and Spirit Links have supporting battle hooks.
- Trick Coin reuses the single-reroll action replay mechanism; Goodra prevents both teams from attaching Tools from hand; B Cancel and Submission Hold expire after the printed opponent turn; Swadloon Protect flips visibly.
- Malamar-EX's optional Hyper Hypnosis choice now retains the fact that Energy was originally attached **from hand** through the choice-resolution step.

## Still gated (not automatically usable)

The following complex prints require a later specialised implementation and audit: 2 Venomoth Dizzying Wind, 25 Pachirisu Trick Sticker, 30 Heliolisk Parabolic Spark, 97 Head Ringer, 98 Jamming Net, 102 Robo Substitute. Mega Gengar-EX Phantom Gate (#35, #121) and Diancie Sparkle (#71) are enabled with choice and attack-gate tests. Their gallery and collector records remain available but their unsupported effects do not silently execute.

## Validation

- Build audit task `auditXY4ForApk` runs both `v07339` stage-one and `v07341` completion battle-state tests *after* generating official print data. Standard energy and deck-building suites remain downstream.
- Local tests simulate both sides' hands, decks, discard piles, Energy discard ledgers, Bench selections, and coin results. The GitHub APK build and full official-card integration remain to be confirmed.
- The Android `versionCode` 7341, `versionName` 0.69.341, title display and JS boot version must remain synchronised.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.341_PHANTOM_FORCES_STAGE2.zip -d source
git add source
git commit -m "LuckyDex v0.69.341 Phantom Forces gameplay stage 2"
git push origin main
```
