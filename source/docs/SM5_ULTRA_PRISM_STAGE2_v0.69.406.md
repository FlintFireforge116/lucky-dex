# LuckyDex v0.69.406 — Ultra Prism Stage 2

## Scope

Cumulative source patch built on the Stage 1 pinned Ultra Prism integration, retaining the independent Crimson Invasion audit fix.

- Adds 37 attack rules and 10 Trainer/Stadium rules, matched against the complete printed effect text of the pinned official SM5 catalogue. It reuses validated engine mechanisms, rather than marking cards enabled with placeholder effects.
- Notable attacks: Super Speed, Panic Poison, Hunter’s Nails, Synthesis, Charge, Searching Magnet, Clean Hit, Disconnect, Sand Tomb, Overclock, Ascension, and others.
- Notable Trainers: Cynthia, Gardenia, Lana, Looker, Mars, Order Pad, Looker Whistle, Pokémon Fan Club, Volkner, and Mt. Coronet.
- Adds a narrowly scoped shared `sm5Rule:mars` for real conditional draw-then-discard behaviour, for player and CPU, preserving physical card identity.
- Keeps discard Energy and the virtual Energy Zone completely separate: searching for basic Energy works through the Energy Zone, but Mt. Coronet recovers only previously discarded Metal Energy.
- Preserves 178 canonical prints, 237 printed attack instances, 37 Abilities, 27 Pokémon-GX, six Prism Stars, 36 Trainer prints and five Energy prints, including all alternate art variants.
- Card prints with unsupported attacks, Abilities, Prism Star restrictions or Special Energy rules remain explicitly gated rather than superficially playable. Full battle-ready print count is computed during offline generation from the canonical catalogue, not guessed.

## Audit and build safeguards

- New `tests/v07427-ultra-prism-stage2-outcomes.test.cjs` runs 21 individual outcome tests and is mandatory via `auditSM5ForApk` and `scripts/preflight-sm5-release.py --full`.
- Verified all **47/47 Stage 2 mapping printed-text fingerprints** directly against the pinned official GitHub `cards/en/sm5.json` blob `66cbd13b706b789de3b8cce2f5c9fc95135a33b0`.
- `scripts/preflight-sm5-release.py` checks all Stage 2 rules against the immutable printed-source text and fails the build for mismatches.
- Gradle preflight chain still tests all preceding sets. Version contracts and pinned source attestation are retained.
- `scripts/prepare-sm5.sh` now reuses an already attested SM5 source without attempting a second download; a first-time installation downloads the exact Git-blob-pinned source, generates the playable asset and runs full SM5 preflight.

## Verified in this environment

- New SM5 Stage 2 outcome tests: **21/21 PASS**.
- Combined deck-quality, Crimson Invasion and new Stage 2 tests: **45/45 PASS** before the extra Cynthia regression case was added; individual new 21/21 re-run after the addition.
- Full SM4 release gate: **124/124 PASS**, retains 126/126 playable.
- Full SM3 release gate: **146/146 PASS**, retains 177/177 playable.
- Full SM2 release gate: **114/114 PASS**, retains 180/180 playable.
- SM1, XY11, XY12 structural preflights: PASS; version-dependent SM1/XY12 integration: 13/13 PASS.
- Actual full SM5 canonical-source gate: **not runnable locally** until official SM5 compact file is prepared (the source is intentionally not invented or substituted). Mandatory on Termux and GitHub.
- Actual GitHub Actions APK build: **not verified**.

## Install on Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.406_SM5_ULTRA_PRISM_STAGE2.zip -d source
sh source/scripts/prepare-sm5.sh
git add source
git commit -m "LuckyDex v0.69.406 Ultra Prism SM5 stage 2"
git push origin main
```

The preparation step stops before any push if pinned-source or gameplay audits fail. Do not skip it. No generated SM5 placeholder is included in this ZIP.
