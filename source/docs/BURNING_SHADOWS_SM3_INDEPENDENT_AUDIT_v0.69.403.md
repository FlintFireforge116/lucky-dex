# Burning Shadows SM3 — Independent completion audit (v0.69.403)

## Ground truth and scope

The pinned, offline SM3 catalogue contains **177/177 enabled collector prints**, with 274 printed attacks, 27 Abilities, 40 Pokémon-GX prints, and three Basic Energy prints. The previous completed SM3 GitHub APK build was **Actions #714, success**. This audit is a source/runtime follow-up to that baseline, not a claim that the new ZIP has built on GitHub.

The existing full SM3 preflight passed 132/132 tests at baseline. The independent audit reviewed untested type-sensitive and cross-set cases with actual `legalActions` / `applyAction` battle steps, not merely schema checks.

## Confirmed failures and repairs

1. **Charizard-GX Crimson Storm / Tapu Fini-GX Hydro Shot:** strict typed discards previously ignored Rainbow Energy and conditionally typed Special Energy. When the attack required three Fire or two Water, it could leave an eligible attached Special Energy behind instead of discarding it. Repair: a shared card-aware typed-provider predicate for Rainbow (`Miracle`), Prism Energy (Basic Pokémon only), and both printed Blend Energy groups, applied consistently to typed `discardEnergyCard` operations. It spends the physical Special card once and never spends unrelated Basic types.
2. **Necrozma-GX Prismatic Burst:** the damage calculation ignored Psychic-providing Rainbow/Prism/eligible Blend cards. Repair: count each eligible attached Special card exactly once and ensure the subsequent typed discard removes the same eligible resources.
3. **Weakness Policy SM3 #126:** despite a valid Tool descriptor, both Active and relevant Bench damage computations checked only the older XY5 print IDs. Repair: include SM3 #126 in the same suppression paths while preserving existing XY5 behaviour.

## New independent battle tests

`tests/v07418-burning-shadows-independent-audit.test.cjs` contains 13 outcome tests covering GX weakness/resistance filtering, strict typed Energy discards, conditional Rainbow/Prism/Blend providers and opposite-type exclusions, Weakness Policy, Lana with attached Rainbow, Po Town on the opponent's turn, and Golisopod-GX switch-with-empty-Bench. These tests are mandatory in `auditSM3ForApk` and in `preflight-sm3-release.py --full`.

## Release controls

Keep the **versionName 0.69.403 and versionCode 7403**, pinned catalogue and all earlier SM3/XY10/SM2 tests unchanged. Apply this source-relative incremental patch to the *successfully built, complete Stage 4* source. Run full release preflight, prior cross-set tests and a clean install replay. A successful source-only preflight does not guarantee an Android APK build, which must still be checked after pushing.

No finite test suite guarantees correctness of all possible battle states, especially legacy cross-set Special Energy interactions and niche conditional state combinations.
