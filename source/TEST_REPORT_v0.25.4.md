# LuckyDex v0.25.4 test report

## Focused RED → GREEN coverage
- `tests/v0254-fossil-card-assets.test.cjs`
  - pins `BURIED_CARD_SITE_CHANCE` at 0.04
  - pins all buried-card tier thresholds including tier 6 / Secret Rare at the top 0.5%
  - seeded 10,000-wall Monte Carlo verifies generated card-site frequency remains near 4%
  - verifies the buried-card resolver uses the shared full-card rarity classifier
  - verifies active fossil/stone IDs point to the v0.25.4 local item namespace and required files exist
- `tests/v0254-release.test.cjs`
  - pins v0.25.4 / versionCode 254
  - verifies application ID and permanent signer identity contract

Both tests were observed failing before their respective implementation/version changes and passing afterwards.

## Full Node regression suite
- Total `.cjs` test programs: **62**
- Runnable passes: **47**
- Runnable failures: **0**
- Playwright-dependent skips: **15** (local Playwright package/browser runtime unavailable in this extracted workspace)

## Additional verification
- `node --check` passed for the modified Fossil/Museum core, app resolver and Fossil/Museum UI module.
- All **45** active Fossil Dig catalogue entries resolve to local packaged assets; missing/remote asset count: **0**.
- Permanent keystore SHA-256 verified as:
  `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- Android application ID remains `com.example.luckydex`.
- Android version is `versionCode 254`, `versionName 0.25.4`.

The final source archive receives a separate ZIP integrity/version/signer check after packaging.
