# LuckyDex v0.25.7 verification report

Fresh verification on the final v0.25.7 source tree:

- 71 JavaScript test programs checked.
- 56 runnable tests passed.
- 0 runnable failures.
- 15 browser/Playwright-dependent programs skipped because Playwright is not installed in this local workspace.
- `node --check` passed for the modified Fossil Dig/Museum JavaScript.
- v0.25.7 asset provenance manifest parses successfully.
- 42 unique sprite files are represented in the provenance manifest.
- 41 sourced sprites match their recorded upstream Git blob SHA exactly; the remaining TCG-card file is the explicit runtime placeholder.
- 45 active dig rewards have a recovery mask in `recovery-masks.json`.
- 44 non-TCG active rewards were independently re-derived from their final PNG alpha geometry and matched the runtime recovery masks with 0 mismatches.
- 10,000 generated dig walls passed placement fuzzing with 3–6 finds, no overlaps, and no out-of-bounds cells.
- The same 10,000-wall run produced a 6.51% buried-card site rate, consistent with the configured 6% chance.
- Active Fossil Dig / Museum catalogue uses only `arcade/fossil-museum-v0257/items/`.
- applicationId remains `com.example.luckydex`.
- versionCode / versionName are `257` / `0.25.7`.
- `package.json` and `package-lock.json` are both `0.25.7`.
- permanent keystore SHA256 remains `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
