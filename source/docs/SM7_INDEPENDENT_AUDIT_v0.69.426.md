# Celestial Storm — independent audit v0.69.426

Canonical source: pinned Git blob `11606d6f86947a5906324a60d330ff88c702218b`, 187 prints (including four alternate variants), 232 printed attacks and 51 printed Abilities. Generated readiness: 187 playable, zero gated.

## Corrections
- Swampert Hydro Pump: include Water-providing rainbow and matching Unit Energy units in the printed Water count; unrelated Unit Energy does not contribute.
- Blaziken-GX Explosive Kick: legal typed discard choices include matching Special Energy; strict typed removal cannot fall back to an unrelated Basic or Special Energy.
- Oricorio Captivating Salsa: apply Burn and Confusion only after successfully switching the opposing Active; do not affect the original Active if no legal Bench target exists.
- Friend Ball: match the opponent's effective current types, including Kecleon's Unit Color 2, rather than the printed type only.

## Verification
- New independent outcome suite: 10/10 (five scenarios for each side).
- Full SM7 preflight: 146/146; both attack sweeps cover all 232 printed attacks (464 side-specific executions).
- Full SM6 preflight: 90/90.
- Full SM5 preflight: 235/235.
- Gradle source guard and matched Termux/Gradle SM7 test lists pass. GitHub Android APK build and physical-device validation remain separate and unverified.

Audit coverage is regression evidence, not exhaustive proof of every possible cross-set board state.
