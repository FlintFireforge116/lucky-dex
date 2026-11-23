# Crimson Invasion (SM4) — independent post-completion gameplay audit — v0.69.404

**Basis:** uploaded original `lucky-dex-main.zip` and cumulative `LuckyDex_patch_v0.69.404_SM4_CRIMSON_INVASION_126_OF_126_COMPLETE.zip`, compared with the bundled SHA-pinned SM4 print source. All results below are local only; GitHub Android APK compilation cannot be confirmed from this container.

## Audit scope

- Catalogue and generation: all 126 individual collector prints; 193 printed attacks; 23 Abilities; 25 GX prints; all four Energy prints; pinned source hash, exact attack costs/HP/types, alt-print gameplay parity and card validation.
- Runtime battle outcomes: independently replays human/CPU hand-size damage; optional and conditional attacks; selected Energy, Tools and Prize transfers; Trainer locks, Energy mechanics, Abilities and earlier release audits.
- Regression: the completed-set SM4 suite, earlier Burning Shadows suite, and inherited cross-set/energy tests.

## Confirmed defect and fix

**Mismagius #40 — Dark Arts** (and older **SM1 Krookodile #85 — False Accusation**) declared the source of the hand-card count as `opponent`, but the shared `handCountDamage` calculation always read `own(ctx).hand`. Reproduction: attacker one card / opponent five cards, SM4 Dark Arts dealt 20 instead of 100. Fixed the shared reducer to count `other(ctx).hand` when `source==='opponent'` or `side==='opponent'`, retaining self-hand defaults for all previous attacks. Verified the reverse hand-size scenario, CPU attacker side and older SM1 additive attack.

## Mandatory independent outcome checks

New `tests/v07423-crimson-invasion-independent-audit.test.cjs` covers 12 distinct cases, including 126-print audit, 193-attack validation, all rarity/alt-art parity, mirrored hand sources, Iron Hand healing, Lucha Fight modifier, Punishing Slap off-Active Energy, Chaos Wheel hand lock, Sudden Sting same-turn condition, and Draco Melody physical deck handling. This new file is mandatory in both `scripts/preflight-sm4-release.py --full` and Android Gradle `auditSM4ForApk`.

## Running locally

```sh
cd ~/lucky-dex/source
python3 scripts/preflight-sm4-release.py --full
python3 scripts/preflight-sm3-release.py --full
```

**Release:** source-only cumulative patch relative to `source/` (unzip with `-d source`). Version stays 0.69.404 / versionCode 7404. Check the Actions page after pushing; running local Node/Python tests does not prove that Gradle built a downloadable APK.

## Local regression results (23 November 2026)

| Source preflight | Tests | Result |
|---|---:|---|
| SM4 Crimson Invasion (with new independent audit) | 124 | PASS |
| SM3 Burning Shadows | 145 | PASS |
| SM2 Guardians Rising | 113 | PASS |
| SM1 Sun & Moon | 63 | PASS |

All 126 SM4 prints remain playable and deck-eligible (no gates). The SHA-pinned catalogue and historical Android version contracts are unchanged. No live Android Gradle build was available in the audit environment.
