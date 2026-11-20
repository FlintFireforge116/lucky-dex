# LuckyDex v0.69.312 — Plasma Storm (BW8) integration

## Installation and first online data preparation

This patch adds the Plasma Storm (BW8) generator, battle rules, 138-print catalogue registration, tests, metadata, and Android build integration. The pinned *original public card data* is first fetched from `PokemonTCG/pokemon-tcg-data` by `scripts/build-bw8.py` and SHA-verified. It needs internet on its first run; after that the generated source and card catalogue should be committed, making future builds offline.

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.312_BW8_PLASMA_STORM.zip -d source
cd source
sh scripts/prepare-bw8.sh
cd ..
git add source
git commit -m "LuckyDex v0.69.312 Plasma Storm full set and rules"
git push origin main
```

## Results (at patch preparation time)

- 138 original numbered English collector prints identified (including secret-rare #136–138), with pinned source Git blob SHA `5ae56545ca722ef9ebfee78ae434ce416efa4277`.
- Catalogue generation, EX/Team Plasma/ACE SPEC metadata, set picker, opponents, deck builder, owned-card projection and build task are integrated.
- Physical Plasma Energy and the Plasma Trainers, optional attack choices, type boosts, targeted damage, Poison/checkup and EX prize enhancements have explicit code paths.
- 70 existing BW6/BW7 Node regression tests passed locally after inserting an empty BW8 module fixture, and 9 independent Plasma-specific engine tests passed. The fixture is deliberately **not** included in this patch.
- Not yet verified: the newly fetched 138-print catalogue, per-print coverage count and CPU autobuild tests, actual Gradle APK, and device gameplay. These are run by the mandatory prepare/build checks once the pinned source is available on Termux/GitHub.
- Togekiss #104 **Bright Veil** is intentionally gated because preventing just the effects of an opposing Item *on your Pokémon*, without interfering with unrelated Item effects, still needs targeted battle-engine plumbing. Other unhandled printed effects are also automatically gated, never left as silent `noop`.

## First preparation details

`scripts/prepare-bw8.sh` creates:
- `data/classic/bw8-print-compact.json` — original 138-print metadata, derived from the SHA-pinned blob.
- `app/src/main/assets/tcg-classic-plasma-storm.js` — generated playable cards, gated unsupported cards, EX/Trainer/Special Energy identity and deck metadata.
- `docs/BW8_BUILD_COVERAGE.json` — actual battle-ready and gated-card counts.

If the first fetch fails (e.g. offline GitHub connectivity), keep the ZIP and rerun `sh scripts/prepare-bw8.sh` while online; no generated data is created until its SHA is confirmed.
