# LuckyDex v0.24.3

## Packs chronology
- Release Date sorting now uses exact known dates first.
- My First Battle is pinned to 29 Sep 2023; Scarlet & Violet—151 to 22 Sep 2023; 30th Celebration to 16 Sep 2026.
- When source metadata only supplies a year/equal date, the authoritative physical catalogue chronology ordinal is used instead of alphabetically sorting ties.
- Physical catalogue rows now carry `_catalogOrder` from the validated card-art index.
- Pack rows display compact exact dates when known, making the active chronology visible.

## Permanent Android update identity
- Restored the original stable LuckyDex development signing keystore to `app/luckydex-dev.keystore`.
- `.gitignore` explicitly allows that canonical key to remain in source control.
- Gradle refuses to build without it.
- GitHub Actions verifies both the keystore SHA-256 and certificate fingerprint and refuses a mismatched signing secret.
- Removed silent fallback to a fresh runner debug key.

This establishes v0.24.3 as the permanent signing baseline. If the currently installed APK was signed by a previous ephemeral runner debug key, Android will require one final uninstall/reinstall for v0.24.3; later builds using this source can update it normally.
