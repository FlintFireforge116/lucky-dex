# LuckyDex v0.25.6 verification report

Fresh verification on the v0.25.6 source tree:

- Focused artifact reveal/UI regression: PASS.
- Release/signing contract: PASS.
- Historical `.test.cjs` sweep: 66 programs checked; 51 runnable PASS; 0 runnable failures; 15 browser tests skipped because the local workspace does not have the Playwright package.
- Permanent keystore SHA256 remains `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Android applicationId remains `com.example.luckydex`.
- versionCode / versionName are `256` / `0.25.6`.

The actual Android APK build remains delegated to the existing GitHub Actions workflow in this source archive.
