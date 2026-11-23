# Ultra Prism Stage 4 (v0.69.408)

Cumulative continuation with official-print-locked Special Energy and four passive Abilities.

- Unit Energy GrassFireWater 137/170 and LightningPsychicMetal 138/171: individual physical-card assignments, no fake three-unit Energy.
- Super Boost Energy ◇ 136: conditional 1/4 unit energy while attached to Stage 2 and when three Stage 2 Pokémon exist. One per deck, Lost Zone on discard.
- Prism Star rules: one per name across alternate prints; redirect physically discarded Prism cards to their owner's Lost Zone with the same original UID. Other five Prism Stars remain gated until their printed effects are supported.
- Abilities: Intimidating Fang, Power Huddle, Flashing Head, Earthen Shield, with positional and opposing-card restrictions. Existing four-set regressions must pass.
- Add an independent 14-test SM5 Stage 4 outcome gate to both preflight-sm5-release.py and the mandatory Gradle APK gate.
- Source SHA pin: `66cbd13b706b789de3b8cce2f5c9fc95135a33b0`. Run `sh source/scripts/prepare-sm5.sh` to generate and verify the full 178-print catalogue. GitHub APK build is not verified by the local tests.
