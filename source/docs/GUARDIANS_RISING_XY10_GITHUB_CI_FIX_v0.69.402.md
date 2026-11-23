# Guardians Rising — XY10 preflight compatibility fix (v0.69.402)

**GitHub Actions:** failed LuckyDex APK workflow runs #708 and #709, 23 November 2026.

**Confirmed failure:** `:app:preflightXY10ContractForApk` → `tests/v07385-fates-collide-stage3.test.cjs`, test "Endgame same-turn real damage KO check is present in the Classic Prize award path".

The old source-string assertion insisted on the exact adjacency `deltaPlus+xy10Endgame-bw9LifeDew`. Guardians Rising legitimately added `+sm2Extra` to this same Prize formula for Wages of Fluff. That string no longer matched, so GitHub stopped **before** any SM2 audit or Android compilation.

**Change:** replace fragile literal adjacency with independent positive checks for `+xy10Endgame` and `+sm2Extra`, and independent negative check for `-bw9LifeDew`, in the effective Prize formula. All existing runtime assertions are retained. The patch does not alter game rules, JavaScript engine code, generated catalogue, Gradle configuration, or app version.

**Pre-release checks:**

- Confirmed old test failed 1 of 9 locally with the same regex mismatch.
- Fixed test now passes 9/9.
- `python3 scripts/preflight-xy10-release.py`: 75/75 passed.
- `python3 scripts/preflight-xy10-release.py --full`: 75/75 passed with pinned official XY10 generation.
- `python3 scripts/preflight-sm2-release.py --full`: 113/113 passed with pinned official SM2 generation.
- The actual GitHub APK build still requires checking after pushing this change.

**Prevention:** whenever introducing a cross-era Prize modifier, audit all earlier preflight source-shape tests and validate each modifier's meaning/sign instead of requiring unrelated expression terms to remain adjacent.
