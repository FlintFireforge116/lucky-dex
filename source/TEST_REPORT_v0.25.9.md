# LuckyDex v0.25.9 test report

## Change under test

- Excavated loose cards use the complete physical TCG catalogue, independent of the save's owned/cached cards.
- Excavated boosters use the complete booster-eligible physical catalogue, independent of opened/discovered sets.
- Booster wrappers resolve real packshots through the v0.25.9 artwork index/resolver.
- Android update identity remains `com.example.luckydex` with the permanent LuckyDex signing key; version advances to 259 / 0.25.9.

## Local verification

- v0.25.9 red/green regression: PASS.
- Non-browser Node regression programs: 56/56 PASS.
- Browser/Playwright programs: 19 not executed locally because Playwright is not installed in this sandbox; GitHub Actions installs Chromium and runs the full `npm test` suite.
- Authentic Arcade source/checksum validation: PASS (44 scenes/sheets/crops).
- Offline Arcade sprite/checksum validation: PASS (2098 sprites; 2078 unretouched actors).
- Adventure asset verification: PASS (829 images / 1025 species).
- Fossil Museum asset verification: PASS (42 images).
- Venue verification: PASS (8 local venue assets).
- Booster-art index builder parser/packshot extraction unit probe: PASS.
- Permanent keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Permanent certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`.

`verify-release.py` requires a built APK and therefore is intentionally left to GitHub Actions after Gradle produces the artifact.
