# Ultra Prism (SM5) — first integration batch — v0.69.405

This patch adds the official 178-print Ultra Prism set to the shared Classic30 battle index, player deck builder, CPU deck generator, set selector and card viewer. The pinned upstream JSON Git blob is `66cbd13b706b789de3b8cce2f5c9fc95135a33b0` from commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072` in `PokemonTCG/pokemon-tcg-data`.

## Prepare before GitHub push (required once)

This ChatGPT environment cannot download raw GitHub files into the ZIP creation container. To **avoid shipping an invented or incomplete 178-print database**, the source-only ZIP instead includes a one-time Termux preparer that fetches the immutable official JSON, verifies the Git blob SHA, writes `data/classic/sm5-print-compact.json`, generates the playable asset and records a SHA-256 attestation. Those generated files are then committed and GitHub builds **offline**, just like previous sets.

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.405_SM5_ULTRA_PRISM_STAGE1.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.405 Ultra Prism SM5 stage 1" && \
git push origin main
```

This is a **stage 1** integration, not a claim that all cards are playable. The generator safely gates cards whose effects or Prism Star rules are not yet supported. The full catalog retains all 178 official print names, attacks, printed Energy costs, effects text and source art links. `docs/SM5_BUILD_COVERAGE.json` records the exact enabled and gated counts after preparation. No untested generic no-op is used for printed effects.

Prism Star cards remain disabled until their one-per-deck and Lost Zone handling is implemented in the battle and deck-builder engine; similarly Unit Energy and Super Boost Energy are not misrepresented as omnitype Colorless. The generated preflight covers the source checksum, print counts, basic effect validation, no-gated-card deck paths, and all alternate-art variants.

**Local build validation:** Prior SM1–SM4 version/Gradle structural checks and repository JS/Python syntax checks can run without the SM5 canonical file. Full SM5 generated catalogue and Android APK tests must be run on a network-enabled machine after the one-time preparer, then confirmed in GitHub Actions. Do not report a local Android APK build as passed before that.
