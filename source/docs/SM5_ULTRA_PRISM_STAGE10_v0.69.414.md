# LuckyDex v0.69.414 — Ultra Prism Stage 10 implementation and audit

Cumulative source patch over the Stage 9 v0.69.413 ZIP, retaining Stages 1–9 and the Stage 5 Prism Star release-gate fix. Unsupported prints remain explicitly gated; this patch does **not** claim 178/178 playable.

## Nine new printed-effect mappings

**Six attacks:** Dialga-GX **Timeless-GX** (genuine extra owner turn with turn draw, no between-turn checkup), Palkia-GX **Zero Vanish-GX** (all opposing Pokémon Energy shuffled into deck), Solgaleo-GX **Sol Burst-GX** (up to five Energy attachments with real target choices and Energy-Zone coin flips), Palkia-GX **Spatial Control** (repeatable choice to move Basic and physical Special Energy from the Bench), Magmortar **Fire Blaster** (optional discard of exactly two attached Energy for +80), and Lopunny **Happy Turn** (optional shuffle itself and its attachments into deck; Active promotion required).

**Two Abilities:** Lunala-GX **Psychic Transfer** (repeatable Energy movement when a source and other Pokémon exist), and Abomasnow **Blessings of the Frost** (evolve from hand to recover Water Energy from physical discard or the spent-Energy ledger, never fresh Zone Energy).

**One Pokémon Tool:** **Ancient Crystal** (reduces damage by 30, after Weakness and Resistance, only for equipped Regirock/Regice/Registeel/Regigigas).

All new effects use exact name + complete official printed-text matching to a pinned 178-print canonical SM5 catalogue, not a name-only shortcut. Their effect descriptors and engine code are in `scripts/sm5_stage10_verified.py` and `app/src/main/assets/tcgp-battle-effects.js`, with Timeless turn handling and Ancient Crystal damage handling in `tcgp-battle-core.js`. Alternate-art GX prints reuse exact matching printed effects.

## Gameplay and regression tests

| Test | Local result |
|---|---|
| New Stage 10 battle outcome tests | **17/17 passed** |
| Combined SM5 Stage 2–10 live-game outcome tests | **176/176 passed** |
| Crimson Invasion (SM4) full release gate | **124/124 passed** |
| Burning Shadows (SM3) full release gate | **146/146 passed** |
| Guardians Rising (SM2) full release gate | **114/114 passed** |
| Sun & Moon (SM1) full release gate | **64/64 passed** |
| Evolutions (XY12) full release gate | **38/38 integration + 9/9 deck quality passed** |
| JavaScript/Python syntax and Gradle source self-test | **Passed** |
| Cumulative ZIP CRC/integrity and file-by-file byte parity | **Passed** |
| 178-print SM5 generated catalogue source preflight | **Requires Termux `prepare-sm5.sh`**; canonical compact source not available to this isolated local working copy |
| Actual GitHub Android APK | **Not yet observed** |

The release `0.69.414`, `versionCode 7414`, Stage 10 printed-effect counts and mandatory `tests/v07435-ultra-prism-stage10-outcomes.test.cjs` are wired into both Gradle and the SM5 preflight. Earlier release preflight scripts and their contracts are updated to this version, with all previous gate assertions intact. The source attestation continues to require pinned blob SHA `66cbd13b706b789de3b8cce2f5c9fc95135a33b0`.

## Runtime invariants

- Timeless extra turns start only after the attacking action and choices finish; CPU and player share the mechanic. Normal attack restrictions, GX once-per-game and knockout sequencing still apply.
- Zero Vanish conserves actual physical Special Energy UIDs. Classic Basic Energy spent/attached in the virtual ledger is represented in the recovered deck ledger and does not affect the attacker's side.
- Sol Burst always uses individually selected actual Energy cards or the existing Energy Zone coin-flip search, up to five; a tails flip does not silently generate Energy.
- Spatial Control and Psychic Transfer never silently copy Special Energy. The repeatable Spatial Control choice chain has exactly one correctly ordered Stop option after each move.
- Happy Turn preserves attached Special Energy card UIDs when returning to deck and surfaces a legal Active promotion afterwards. Fire Blaster is allowed to discard two Basic Energy of the same type if physically attached.

## Termux installation

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.414_SM5_ULTRA_PRISM_STAGE10.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.414 Ultra Prism stage 10" && \
git push origin main
```

The `&&` chain stops on preflight failure. If Termux reports a source mismatch or a failed assertion, provide the full console output and avoid pushing the partial release.
