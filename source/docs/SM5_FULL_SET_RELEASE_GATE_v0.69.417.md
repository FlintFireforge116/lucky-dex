# Ultra Prism (SM5) — full-set completion gate and independent audit handoff

Date: 23 November 2026. App version remains **0.69.417**; this source-only patch does not change gameplay or Android versionCode.

## Why the extra gate exists

Prior SM5 stage releases validated groups of attack, Ability and Trainer effects but did not make **zero gated prints** a hard prerequisite for declaring the entire set complete. A test suite with 227 passing outcomes does not itself prove all 178 official prints are enabled.

The new `tests/v07439-ultra-prism-final-coverage.test.cjs` is mandatory in both Termux and Gradle/CI. It verifies:

- the complete SHA-pinned official 178-print catalogue in collector-number order (including letter variants);
- **178/178 playable and deck-eligible, 0 gated**; no `PARTIAL` or `unsupported` descriptors anywhere;
- the 237 printed attack records, each exact cost/text/damage string and its effect descriptor;
- all 37 Ability records, 36 Trainer and 5 Special Energy prints;
- non-noop effects for all attacks with substantive printed instructions;
- each alternate-art print matches the normal print; all six Prism Stars retain one-copy restrictions.

`preflight-sm5-release.py --full` now calls the reusable v2.79 `audit-expansion-readiness.py` tool with `--require-complete`, writes the current grouped blocker ledger at `docs/SM5_CURRENT_GAP_LEDGER.md`, and then runs the normal SM5 tests. A partial set now **fails closed with an exact actionable ledger**, not a vague percentage or a falsely successful completion claim.

## Printed-mechanic inventory

The official SM5 pinned blob has **237 attack print instances**. **51** have no printed effect text (ordinary damage attacks), leaving **186 effect-bearing attack print instances**. In the current source, the Stage 2–13 registries plus earlier verified adapters cover all these printed signatures. Four of the 186 use existing, explicitly checked generic handlers: Yanmega's *Supersonic*, Toxicroak's *Poison Jab*, and two prints of *Teleport* (Cosmog and Cosmoem). Both unmatched Ability names, *Water Bubble* and *Solid Unit*, are implemented in `sm5_verified.py` as existing passives. The remaining three Trainer names outside the stage-specific mappings, *Lillie*, *Lusamine* and *Crushing Hammer*, resolve through older printed-text reuse. Five Special Energy prints already use Stage 4 shared mechanics.

This is a **source-level signature inventory**, not a substitute for the generated canonical catalogue plus actual battle outcomes; it does not independently certify that every print is enabled.

## Tests actually run in this offline working copy

- SM5 Stages 2–13 gameplay outcome suite: **227 passed / 0 failed**.
- Crimson Invasion SM4 full release: **124 passed / 0 failed**.
- Burning Shadows SM3 full release: **146 passed / 0 failed**.
- Guardians Rising SM2 tests with bounded concurrency: **114 passed / 0 failed**. The default-concurrency invocation stalled; the bounded rerun succeeded.
- Sun & Moon SM1 exact full test list with bounded concurrency: **64 passed / 0 failed**.
- Evolutions XY12 structural gate: **38 passed / 0 failed** (not the full XY12 gate).
- New SM5 completion test: JavaScript syntax checked; it **cannot run** without `data/classic/sm5-print-compact.json` and `docs/SM5_CANONICAL_SOURCE.json` generated from the pinned source on Termux.
- v2.79 static release parity and Gradle source guard: passed. GitHub APK build: not run locally.

## Termux release sequence

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.417_SM5_COMPLETION_GATE.zip -d source
sh source/scripts/prepare-sm5.sh
python3 source/scripts/audit-expansion-readiness.py --set sm5 --root source --require-complete --report docs/SM5_CURRENT_GAP_LEDGER.md
# Only when the preceding commands pass:
git add source
git commit -m "LuckyDex SM5 strict 178-card completion audit"
git push origin main
```

The `prepare-sm5.sh` step now invokes the reusable strict checker as part of the full preflight; running the explicit check again is optional if the preparation step succeeded. A failed gate should be investigated using the generated gap ledger **before** committing or pushing. Do not weaken the test to proceed.

## Status

This is a **completion-audit release gate**, not a claim that the 178-print test has passed in this offline container. The exact final playable count and Android APK build status must come from the prepared Termux source and GitHub Actions, respectively.
