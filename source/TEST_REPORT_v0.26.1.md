# LuckyDex v0.26.1 verification

## User-reported regressions fixed

1. **Generic gold/blue booster wrapper instead of real physical pack art**
   - Root cause: the repository-level APK workflow builds the uploaded source ZIP directly and does not execute the workflow stored inside that ZIP, so `build-booster-art-index.py` never materialised the local packshots.
   - Fix: the runtime still prefers the local v0.26.0 manifest, but now has an exact fallback to the matching `1niceroli/ptcg-assets/<set>/packshots` GitHub directory when the local manifest is empty. This means the existing repository workflow can still display the real pack artwork.

2. **TCG Pocket did not use the complete GitHub card catalogue / LOCAL CARD PREVIEW**
   - Root cause: Pocket remained on the older flibustier metadata + fragile artwork fallback chain while the physical TCG used the complete exact GitHub index architecture.
   - Fix: Pocket now prefers a LuckyDex exact index when present and otherwise reads PocketDecks' complete v5 GitHub catalogue directly. Exact card image URLs and exact booster artwork are taken from the same card/set records. The old feed is resilience-only fallback.
   - Existing cached Pocket cards from older LuckyDex versions are deliberately rehydrated; stale artwork is repaired in the background and again on image failure.

3. **TCG Pocket pack art**
   - Pocket expansion metadata now supplies `boosters[].artwork_front`, so the pack-opening screen uses the real corresponding pack image rather than the generic wrapper.

## Update identity

- applicationId: `com.example.luckydex`
- versionCode: `261`
- versionName: `0.26.1`
- signing keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- signing certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`

## Verification performed

- `node --check` passed for the modified runtime JavaScript.
- 64 non-browser `.cjs` regression programs: **64 passed / 0 failed**.
- Authentic Arcade asset audit: **44 scenes/sheets/crops, 2,098 sprites, and 2,078 unretouched actors passed checksum/encoding validation**.
- Permanent signing key hash and certificate fingerprint verified against the previous LuckyDex identity.
- The browser/Playwright subset was not runnable in this container because `node_modules/playwright` is not installed and this environment has no package-network access. No claim is made that those 19 browser tests were executed locally.
- Gradle is not installed in this container, so the Android APK itself was not assembled locally. The existing GitHub APK workflow remains the build authority after `LuckyDex_source.zip` is replaced.

## GitHub connector note

A direct attempt to create the new repository workflow through the connected GitHub integration returned HTTP 403 (`Resource not accessible by integration`). v0.26.1 therefore does **not** depend on that repository edit: the physical pack-art resolver and PocketDecks direct GitHub path both work with the repository's existing outer APK workflow. The only required user action is replacing the repository's `LuckyDex_source.zip` with this v0.26.1 source archive.
