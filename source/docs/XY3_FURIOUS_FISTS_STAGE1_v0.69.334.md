# LuckyDex v0.69.334 — XY Furious Fists, stage 1

## Included

- Authentic pinned **114 print records** for `xy3`, numbered 1–113 plus `55a` alternate Mega Lucario-EX; **159 printed attacks** and **14 printed Abilities** in source data. These are verified against the public `PokemonTCG/pokemon-tcg-data` Git blob `9996bfa724c3d7fc23c9fcc31341cd521311ecb1`.
- Generation script `scripts/build-xy3.py` automatically downloads (when needed), SHA-verifies and caches the original print reference in GitHub Actions **before** battle audits and Android asset merging. This handoff uses the same source-relative ZIP + git commit workflow; no additional Termux generator step.
- Cards carry official names, print numbers, rarity, images, stage/evolution/EX/Mega metadata, printed attack text and costs, resistances, and a conservative, explicit effect contract.
- Reuse of verified shared effects for simple attacks, coin-flips, status, healing, energy payment, select/retreat and simple hand/deck interactions. This is a **staged release**: unsupported mechanics are individually gated (`battleEnabled=false`, `deckEligible=false`) and listed in `docs/XY3_BUILD_COVERAGE.json` after official generation. Gated cards remain registered for metadata/progress but are deliberately excluded from player/CPU deck construction.
- Set registration in Classic battle, player and CPU deck selectors, opponent generator, owned-card print projector, app boot script and global audit.
- New local/CI tests cover catalogue completeness, print identity, exact version, generation task sequencing, legal enabled effects, gated conditional cards and offline sample rule behaviours.
- `LUCKYDEX_MASTER_RULES.txt` updated with new set notes, deferred mechanics and exact Termux handoff.

## Especially important follow-up mechanics (NOT claimed battle-ready in stage 1)

Herbal/Strong Special Energy; Fossil Researcher/Jaw/Sail Fossil with Restored Amaura/Tyrunt; Fighting Stadium/Focus Sash/Training Center/Mountain Ring; global Pokémon Abilities such as Fighting Fury and Ice Shield; choice-based damage/discard moves; Mega Evolution chains whose earlier stages are gated. These require their proper timing, physical-card identity, human choices, CPU logic and regression tests rather than fake no-op support.

## Evidence and limits

- Earlier **v0.69.333 APK build succeeded**, GitHub Actions run #622.
- New v0.69.334 print-source generation and complete Android build are **not locally verified**, because downloaded archive has empty xy1/xy2 generated catalogues and the official xy3 full print data is fetched during GitHub Actions.
- Source-independent `v07334` regression checks and JS/Python syntax checks are local; full 114-print and real-APK checks run only after GitHub downloads/generates the pinned source.
- If GitHub fails, inspect exact job and test failure before changing a user-installed APK. Don't disable tests to obtain false success.

## Termux

```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.334_FURIOUS_FISTS_STAGE1.zip -d source

git add source
git commit -m "LuckyDex v0.69.334 Furious Fists stage 1"
git push origin main
```
