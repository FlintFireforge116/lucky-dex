# LuckyDex v0.69.417 — Ultra Prism Stage 13

This is a cumulative, source-only continuation from Stage 12. It includes the earlier Crimson Invasion corrections, Ultra Prism Stages 1–12, and six newly text-locked attack mappings. All new functionality remains checked against the SHA-pinned official `sm5` source **during `prepare-sm5.sh` on Termux**.

## Newly implemented attacks

- **Fury Swipes:** two canonical SM5 prints (#21 Chimchar and #28 Alolan Sandshrew), exactly three independent flips at 10 damage per heads.
- **Slam:** two independent coin flips at 50 damage per heads.
- **Splatter:** select one opposing Active or Benched Pokémon for 20 attack damage; apply Weakness and Resistance on the Active target, never on the Bench.
- **Agility:** one coin; only heads prevents attack damage/effects through the opponent's next turn.
- **Turbo Drive:** 120 attack damage; optionally choose a Benched recipient, then attach one **discarded** Basic Energy card either from the physical discard pile or the finite discarded-Basic ledger. The fresh Energy Zone is never an eligible source. The CPU can use the identical choice chain. Physical discard card UID is retained in the audit log and removed from the discard pile upon attachment; Basic Energy is represented by the existing attachment ledger.
- **Fast Raid:** remains legal for Pheromosa-GX on its first turn when going first; other SM5 attacks are gated on the first player's first turn. The earlier sets' Classic hybrid first-turn behaviour is intentionally unchanged.

All mappings require matching the **full printed attack text**, not merely an attack name. Newly implemented `sm5Rule` keys are rejected by the effect validator unless explicitly listed; no placeholder effects have been enabled.

## Local checks

- Stage 13 focused player/CPU outcome suite: **12/12 pass**.
- Combined Ultra Prism Stages 2–13 outcome suite: **227/227 pass**.
- Crimson Invasion full preflight: **124/124 pass**.
- Burning Shadows full preflight: **146/146 pass**.
- Guardians Rising full preflight: **114/114 pass**.
- Sun & Moon full preflight: **64/64 pass**.
- Evolutions XY12 full release gate and deck-builder check: **pass**.
- Gradle source guard, JavaScript/Python syntax, ZIP integrity and byte-for-byte ZIP/source parity: **pass**.

The new Stage 13 test is mandatory in both `scripts/preflight-sm5-release.py` and `app/build.gradle`. The release number is `0.69.417` (Android versionCode `7417`); prior release version assertions are updated without weakening their tests.

**Outstanding:** This offline working copy does not contain the official `sm5-print-compact.json` and its attestation; therefore it cannot independently report the exact enabled/remaining print count or claim the full 178-print official preflight passed. Termux `prepare-sm5.sh` will download and validate the canonical source and run the full gate. The GitHub Actions Android APK build also remains unverified. A complete independent card audit is still recommended after the full set is enabled.

## Termux

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.417_SM5_ULTRA_PRISM_STAGE13.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.417 Ultra Prism stage 13" && \
git push origin main
```

