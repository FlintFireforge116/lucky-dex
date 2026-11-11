# LuckyDex v0.69.198 — EX Delta Species completion

Based on the uploaded v0.69.197 `lucky-dex-main.zip` source.

## EX Delta Species

- 114/114 printed cards battle-enabled and deck-eligible (up from 82).
- Completed 32 previously blocked cards and added native effects/power choices for Metagross δ, Mewtwo δ, Tyranitar δ, Azurill, Hypno, Slowking, Swellow, Dragonair, Golbat, Holon Pokémon, and Pokémon ★ Critical Collection.
- EX Delta Species Supporters (Holon Farmer / Lass), Holon Ruins, Holon Research Tower, and Super Scoop Up are playable with their printed choices, prerequisites, and restrictions.
- Holon's Electrode / Magneton can be attached from hand as Special Energy providing 2 of any type, returning an attached Energy card; Holon's Magnemite / Voltorb provide Colorless when attached. The same cards remain playable as Pokémon.
- Holon Research Tower supports Metal *or* original Energy type per Basic Energy attached to δ Pokémon; no double-spending.
- Fixed attacking player vs. defending player choice for Hypno's Sleep Inducer; correct number of Pokémon ★ prize-based Energy recovery; Kyogre ★'s next-turn attack lock.
- Added Slowking Psychic Option's Special Energy selection, and updated attachment-sensitive damage counts.

## CPU and UI/version alignment

- CPU can attach Holon Pokémon as Special Energy from hand; optional beneficial recovery/search choices no longer default to Skip for the EX11 rules.
- CPU values the two new Stadiums based on its board; avoids several clearly unhelpful EX11 Trainers.
- Android versionCode/name, runtime build marker, and both visible HTML version labels updated to 0.69.198.

## Regression coverage

- `tests/v07196-ex-delta-species.test.cjs` updated to reflect 114 battle-enabled cards and 147 attacks.
- New `tests/v07198-delta-species-completion.test.cjs` covers the Holon attachment mechanics, Energy Tower spending, prize counts, Trainer choices, defending-player switches, CPU deck building, Powers, and coin-result attack lock.
- Test Lab rules and the 30-card classic format are unchanged. The Classic hand cap remains 8 cards.

## Install

Apply the patch archive at the canonical `~/lucky-dex/source/`, *not* on an exported build archive. If the current source is different from v0.69.197, inspect/merge before applying. Commit and push to GitHub to trigger your usual Android build workflow.

### From Termux (storage permission already granted)

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_delta_species_patch_v0.69.198.zip -d source
grep 'versionName' source/app/build.gradle
node --test source/tests/v07196-ex-delta-species.test.cjs source/tests/v07197-unown-delta-audit.test.cjs source/tests/v07198-delta-species-completion.test.cjs
git add source
git commit -m 'Complete EX Delta Species v0.69.198'
git push origin main
```

The ZIP contains source modifications, not a prebuilt APK. Node testing is optional if Node is not installed on your Termux setup.
