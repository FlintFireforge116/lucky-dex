# LuckyDex v0.26.4 verification

## Booster artwork audit

- Audited English physical product-art catalogue rows: **156**
- Genuine packshot assets bundled locally in the source/APK: **144**
- Image integrity: **144/144 valid** (WebP/PNG/JPEG signature and size checks)
- Explicit non-booster rows without packshots: **12** (`basep`, `bp`, `smp`, `sve`, `swsh45sv`, `swshp`, `tk1a`, `tk1b`, `tk2a`, `tk2b`, `xy0`, `xyp`)
- Runtime manifest resolves by physical product ID, normalized set name, and—during the GitHub APK build—the current LuckyDex card-index set key.
- Regression coverage explicitly includes Base Set, Jungle, Skyridge, Ruby & Sapphire, Shining Legends and Perfect Order.
- APK booster-art verification performs **no network access**, so GitHub API rate limits cannot break the build.

## Pack presentation

- Real pack artwork now occupies essentially the full sealed-pack area (`inset: 0 2%`).
- Old oversized gold/blue outer wrapper, striped crimps, foil overlay and shell shine are hidden for real packshots.
- Artless/non-booster collection envelopes keep only a slim neutral fallback frame.

## Regression verification

- **69** non-browser Node test programs passed.
- **4** offline asset-integrity checks passed.
- **19** browser/Playwright-dependent programs were not executed locally because Playwright is not installed in this sandbox; the GitHub workflow remains responsible for browser execution.
- JS syntax checks passed for the edited runtime files.
- Python compilation passed for the booster-art audit script.
- Permanent LuckyDex keystore hash remains protected by the release regression test.

## Android identity

- `applicationId`: `com.example.luckydex`
- `versionCode`: `264`
- `versionName`: `0.26.4`
- Existing permanent LuckyDex signer retained.
