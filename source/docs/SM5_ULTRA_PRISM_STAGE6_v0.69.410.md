# LuckyDex 0.69.410 — Ultra Prism Stage 6 implementation and audit

## Scope and inherited fixes

Cumulative source patch based on **LuckyDex 0.69.409 SM5 Stage 5 release-gate fix** (not the unfixed Stage 5 source). It preserves the official 178-print SHA-pinned SM5 catalogue, prior mechanic changes and all prior audits.

### Newly text-locked and battle-validated printed effects

**10 attacks:** Frost Bullet (chosen Benched target), Wash Arrow (chosen Benched target), Frost Crush (attached Energy total), Rebel-GX (opponent Bench scaling), Flickering Spores (Sleep), Psychic (Cresselia Energy scaling), Moongeist Beam (healing restriction that expires), Push Down (optional defending switch), Lunar Fall-GX (specific real Basic non-GX knockout, including Bench), and Special Mow (physical Special Energy removal only).

**6 Abilities:** Invasion, Ultra Road, Gyro Unit, Magnetic Circuit (repeatable Metal Energy attachment from physical hand), Roto Motor (9 actual Tools in discard), Freezing Gaze (opposing GX/EX suppression, including discard-zone Darkrai-GX Restoration).

**1 Item:** Pal Pad (recover two physical Supporter references from discard to deck and shuffle; no Basic Energy Zone materialisation).

The mappings are strictly opted in by the full official printed text. Cards not yet supported remain gated; no claims are made that the 178-print expansion is fully playable.

## Targeted bug fixes and guards

- `Lunar Fall-GX`: the first generic knockout descriptor passed validation but failed to remove a Benched target in battle. Replaced with a dedicated legal target choice and real knockout; GX targets excluded.
- `Moongeist Beam`: ensure its healing block is enforced and expires after opponent's next turn, instead of being an inert descriptor.
- `Glaceon-GX`: ensure `Freezing Gaze` suppresses GX Abilities from the discard, not just the in-play action generator. Hard-block Darkrai-GX Restoration while Glaceon is Active.
- Avoid stale SM2 audit filename `v07410-guardians-rising-audit` when actual file and Gradle gate use `v07409`.
- Bump shared release to `0.69.410`, Android `versionCode 7410`, align every earlier-set release contract, preflight version check, and two older hardcoded JS assertions. The mandatory Gradle APK SM5 audit now includes Stage 6.

## Local verified results

| Gate | Result |
|---|---:|
| Stage 6 battle outcome suite | **19/19 pass** |
| SM5 Stages 2–6 combined | **94/94 pass** |
| SM4 Crimson Invasion full preflight | **124/124 pass** |
| SM3 Burning Shadows full preflight | **146/146 pass** |
| SM2 Guardians Rising full preflight | **114/114 pass** |
| SM1 Sun & Moon full preflight | **64/64 pass** |
| XY12 Evolutions structural/contract gate | **38/38 pass** |
| Gradle source checker | **pass** |
| SHA-pinned official SM5 catalogue gate (`preflight-sm5-release.py --full`) | **Requires Termux preparation** |
| Actual GitHub Actions APK | **Not verified locally** |

The full 178-print SM5 catalogue and source attestation are generated from the pinned Git blob during `sh source/scripts/prepare-sm5.sh` and are not available in the offline packaging environment. Run that preparation before pushing; it performs mandatory tests and blocks commit on error.

### Termux installation

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.410_SM5_ULTRA_PRISM_STAGE6.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.410 Ultra Prism stage 6" && \
git push origin main
```

This is a source-only cumulative ZIP, not an APK.
