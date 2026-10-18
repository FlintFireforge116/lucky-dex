# LuckyDex v0.26.0 verification

## Verified locally

- JavaScript syntax checks: `app-v0167.js`, `pack-flow-v0165.js`, Fossil Museum runtime/core, and `booster-art-v0260.js`.
- Python syntax check: `scripts/build-booster-art-index.py`.
- 58 non-browser Node regression programs passed.
- 13 browser/Playwright programs are intentionally delegated to the GitHub workflow because Playwright is not installed in this sandbox; the workflow runs `npm ci` and installs Chromium before `npm test`.
- Authentic Arcade asset audit passed: 44 scenes/sheets/crops, 2,098 offline sprites, and 2,078 unretouched actor assets.
- Android identity verified: `com.example.luckydex`, versionCode 260, versionName 0.26.0.
- Permanent keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Signing certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`.

## Booster artwork

The GitHub workflow runs `scripts/build-booster-art-index.py` before Gradle. That script discovers English physical sets with real packshots, downloads one representative packshot per eligible set into `app/src/main/assets/booster-art-v0260/`, writes the local manifest, and refuses to continue if Base Set artwork is absent. Runtime artwork resolution is local-only.
