# LuckyDex Crimson Invasion (SM4) continuation — v0.69.404

**Status:** Tested locally; GitHub Actions Android APK build not yet confirmed.

## Scope

- Preserved the complete **126-print**, SHA-pinned Crimson Invasion offline catalogue, its distinct collector IDs/art and all previous supported sets.
- Increased **battle/deck-ready prints from 54 to 83** (**+29**). The other **43 remain visible but gated** until their printed effects work fully. No version number or release contract changed.
- Regenerated the offline card asset and coverage report from `scripts/sm4_verified.py` and `scripts/build-sm4.py`; this ZIP contains both source and regenerated output.
- Implemented exact printed attack, Ability, Stadium and Supporter rules with shared effects, not per-card placeholder no-ops. Includes Multiply, Recover, Waterfall Evolution, Pain Amplifier, Severe Poison, Absorption-GX, Regigigas's Seal of Antiquity, Sap Sipper, Fluffy, Volt Switch, Energy Catch, Chaos Wheel, Tower-Go-Round-GX, Draco Melody, Devoured Field, Lusamine, and others.
- Extended the battle engine's `damageFromDamage` primitive only when explicitly requested with `source='self', all=true, benchOnly=true` to count damaged friendly Bench for Revenge Cannon.
- Corrected the generic SM4 outcome-test setup to satisfy Regigigas's printed prerequisite; did **not** disable its Ability to make tests pass.

## Independent test coverage

`tests/v07421-crimson-invasion-continuation.test.cjs` covers playable print counts, validated effects, passive modifiers on both sides, correct damage and poison outcomes, Prize-scaling GX attacks, physical discard retrieval, Energy conservation, genuine Bench placement, Regigigas's prerequisite and the legal Volt Switch target. It is included in **both** the Python preflight and mandatory Android Gradle `auditSM4ForApk` chain.

Run locally at `source/`:

```bash
python3 scripts/preflight-sm4-release.py --full
```

## Termux installation

Save this patch ZIP into Android's `Download` folder. From the existing LuckyDex repository root:

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.404_SM4_CRIMSON_INVASION_CONTINUATION.zip -d source
(cd source && python3 scripts/preflight-sm4-release.py --full)
git add source
git commit -m "LuckyDex v0.69.404 SM4 Crimson Invasion continuation (83/126)"
git push origin main
```

A successful `git push` is separate from verifying GitHub Actions compiled the APK. The patch does not contain or claim an APK.
