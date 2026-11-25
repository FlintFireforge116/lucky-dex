# Packaged release preparation — v0.69.504 onward

## Installing a supplied release (Termux)

Keep your existing repository and apply the cumulative ZIP to `source`. Replace the old set-specific preparation command with the universal fast verifier:

```sh
cd ~/lucky-dex
unzip -t /sdcard/Download/LuckyDex_504.zip && \
unzip -o /sdcard/Download/LuckyDex_504.zip -d source && \
sh source/scripts/prepare-release.sh && \
git add source && \
git commit -m "LuckyDex v0.69.504 fast release preparation" && \
git push origin main
```

Fast mode verifies the packaged source file hashes, historical TCG generated catalogues and pinned compact/coverage data, the release contracts, and all APK/UI version fields. It does not invoke generators, Node, the network, Gradle, or gameplay tests. It does not modify source files. A mismatch or missing file returns a nonzero exit code so the `&&` chain cannot commit or push. Do not regenerate the manifest on your phone to silence a mismatch. Reapply the ZIP, inspect the reported file names and verify the base version. A locally modified historical file can legitimately fail the manifest check.

For optional full validation of an unchanged package:

```sh
sh source/scripts/prepare-release.sh --full
```

This checks the manifest first and then runs the original set preparation chain (`prepare-swsh5.sh` for v504). The original set-specific scripts remain available without a manifest check when intentionally developing or rebuilding locally. A full rebuild is not a substitute for checking a supplied archive if the archive fails its manifest.

## Authoring subsequent releases

1. Integrate and test new cards, keep source contracts and Gradle test parity intact, update all version fields.
2. Run the complete original set-specific preparation script on the final candidate, not the fast verifier. Require successful exit, zero failures/skips, and coverage/gating parity. Run `python3 -B tests/test_release_manifest.py` as well.
3. Build the cumulative patch path list, newline-delimited and relative to `source`. Include all changed generated assets, scripts, data, release docs, and the universal verifier. Include the appropriate current full preparation script. Carry forward cumulative members and compare all manifest-covered historical generated files with the known base, packaging any missing or changed required assets. Do not rely on device-side regeneration to fill gaps.
4. From `source`, run `python3 -B scripts/release_manifest.py --create /path/to/patch-path-list.txt --full-script prepare-<set>.sh` **only after** the final full validation passes. The manifest covers all patch members except itself plus the historical TCG catalogue/source/coverage/version patterns, and must be regenerated after any packaged file change. Add `scripts/packaged_release_manifest.json` to the ZIP. Do not edit any covered file after sealing the manifest.
5. Run the exact fast shell command against a fresh ZIP overlay and verify the ZIP CRC. Test failure on a changed or missing file. Record both full and fast preparation results. Do not report the fast verification as a gameplay test or an APK compilation.

The manifest is a release consistency check, not a digital signature or proof of test execution. Its scope is the package and specified TCG data/metadata, not every file in the repository. GitHub's existing Gradle generation, test dependencies and APK build remain unchanged. No historical tests are removed. Device timings will vary; the speed gain is elimination of redundant local generation/tests, not a change to Git network performance.
