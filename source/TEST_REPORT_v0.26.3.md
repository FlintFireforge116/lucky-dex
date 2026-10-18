# LuckyDex v0.26.3 verification

## Build failure root cause
GitHub Actions run 37583567376 failed in `:app:materializeBoosterArt` because `scripts/build-booster-art-index.py` enumerated every set through the unauthenticated GitHub Contents REST API. The runner received `HTTP Error 403: rate limit exceeded` before Android compilation began.

## Fix
- Removed per-set GitHub REST Contents API enumeration from the APK build path.
- Booster artwork discovery now uses a shallow blobless Git fetch of `1niceroli/ptcg-assets` and `git ls-tree` to obtain path metadata without downloading the 2+ GB image repository.
- Selected packshots are downloaded directly from `raw.githubusercontent.com`.
- WebP, PNG, JPG and JPEG packshots remain supported, including PNG-only sets such as Perfect Order.
- Raw downloads retry transient HTTP/network failures.
- Existing v0.26.2 card-summary fit changes are preserved.

## Identity
- applicationId: `com.example.luckydex`
- versionCode: `263`
- versionName: `0.26.3`
- permanent keystore SHA-256 remains `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`

## Verification
- Python syntax: PASS (`scripts/build-booster-art-index.py`)
- v0.26.3 rate-limit regression: PASS
- v0.26.3 release/update identity: PASS
- All available non-browser JS regression programs: 68 PASS
- Offline arcade asset integrity checks: 4 PASS
- Browser/Playwright programs were not run in this sandbox because Playwright is not installed here; the GitHub build environment remains responsible for those.
- External Git/RAW network execution of the artwork materialiser cannot be reproduced in the sandbox because outbound DNS is disabled; the regression verifies the REST rate-limited path has been removed and the GitHub Actions failure trace is addressed at its source.
