# LuckyDex v0.69.155 — Delta Reign card-reveal artwork runtime fix

## Symptom
Delta Reign pack reveals displayed the generated `LOCAL CARD PREVIEW` SVG even when the 141 card scans were committed to GitHub and the Android start screen reported v0.69.154.

## Changes
- `preloadPackCard()` now tests the identity-verified Delta Reign scan at `file:///android_asset/delta-reign-cards/<number>_<name>.webp` **before** cached artwork and the network-only fallback path. Other sets are unaffected.
- On web builds the same verified file is resolved relatively; if a local file is missing, the exact corresponding GitHub raw asset is tried online.
- Android Gradle `preBuild` now refuses to produce an APK unless all 141 local WebP scans exist, have the expected filename, size and WebP signature. This prevents the release version and the packaged artwork from getting out of sync.
- Version advanced to 0.69.155 (versionCode 7135), making it easy to distinguish the APK from the earlier 0.69.154 build with the same version code but possibly without the scans.
- v0.69.154 manifest test updated to accept the eight verified source-host URL filename aliases; the bundled local filenames remain unchanged.

## Validation
- Node runtime tests cover local offline scan loading, identity mapping for common/Trainer/secret prints, online fallback, cross-set identity rejection and build guard configuration.
- 154 focused and historical automated tests passed.
- Not verified on a physical Android device; the next GitHub Actions APK build will validate the 141 files in the repository before packaging.

## Files not bundled in this hotfix
The 141 WebP scans already exist in `source/app/src/main/assets/delta-reign-cards/` on the user's GitHub main branch. They are not duplicated in the ZIP. The APK build now fails clearly if the scans are missing.
