# LuckyDex v0.24.3 Test Report

## Scope
- Permanent Android update/signing identity.
- Physical pack Release Date chronology no longer falls back to alphabetical ordering for partial/equal date metadata.

## Regression evidence
- `tests/v0243-release-signing.test.cjs`: PASS after RED→GREEN.
- Existing v0.24.2 Pack chronology/accordion contract: PASS.
- Existing v0.24 / v0.24.1 update/save/signing compatibility contracts: PASS after adapting the legacy test to the hardened signer variable.
- 21 non-browser test programs: PASS.
- Arcade asset audit: PASS (44 authentic scenes; 2,098 offline sprites; 2,078 actors).
- Venue audit: PASS (8/8).
- Adventure asset audit: PASS (829 images; 1,025 species; 0 errors).
- 18 top-level asset JS files: syntax PASS.
- HTML IDs: 224 total, 0 duplicates.
- GitHub Actions workflow YAML: parses successfully.

## Permanent signer verification
- applicationId: `com.example.luckydex`
- versionCode: `243`
- versionName: `0.24.3`
- canonical keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`
- Gradle now fails if the canonical keystore is absent.
- CI now fails if an optional keystore secret differs from the canonical signer; no ephemeral debug-signing fallback remains.

## Environment limitation
The browser-dependent Playwright programs could not be rerun locally because dependency restoration timed out and left an incomplete Playwright installation. The failure occurs before app code executes. GitHub CI still installs Playwright and runs the full suite before building the APK.

No local Gradle executable is installed, so the Android APK itself must be compiled by the included GitHub Actions workflow.
