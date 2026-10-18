# LuckyDex v0.26.5 verification

- Physical booster artwork no longer depends on a runtime JSON manifest fetch.
- Each physical set is assigned a concrete bundled local booster-art path in the app set object.
- Direct artwork table covers 144 physical packshots and 150 normalized display-name aliases.
- Known smoke sets: Base Set, Jungle, Ruby & Sapphire, Skyridge, Shining Legends, Perfect Order.
- Saved sealed-pack rows prefer the current exact local artwork path over stale saved artwork.
- Android identity preserved: `com.example.luckydex`; permanent keystore unchanged.
- Version: `versionCode 265`, `versionName 0.26.5`.
- 73 non-browser test programs passed.
- 4 offline asset-integrity checks passed.
- 19 Playwright/Chromium-dependent programs were not runnable in this sandbox because Playwright is not installed.
- Android assemble was not runnable locally because this source archive does not include a Gradle wrapper and the sandbox has no system Gradle; GitHub Actions remains the Android build environment.
