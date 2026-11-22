# Fates Collide v0.69.384 — GitHub Gradle syntax repair

## Confirmed root cause

* Run 45040073029 (v0.69.383): The preflight executed the official catalogue test before generating `data/classic/xy10-print-compact.json`. Stage 2 corrected phase separation.
* Run 45041389228 (v0.69.384): Gradle fails **before any task runs** because `app/build.gradle` line 919 misses the closing quote in `auditXY10ForApk` `commandLine`. The parser reports `Unexpected input: '{' @ line 916`; this is a misleading downstream location.

## Changes

1. Fix exactly one malformed Groovy string argument in the XY10 audit task.
2. Provide `scripts/check-gradle-source.py`, a standalone pre-push source parser that checks quote/comment/delimiter balance and exact audit test arguments and their existence. It explicitly tests that the original malformed syntax is rejected.
3. Invoke the parser plus its self-tests from `preflight-xy10-release.py`. **Note:** a Gradle task cannot execute this preflight when Gradle itself cannot parse; Termux must execute the standalone checker before `git push`.
4. Update project master rules v2.69. No card effects changed, no version bump.

## Local release commands

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.384_FATES_COLLIDE_GRADLE_PARSE_REPAIR.zip -d source
python3 source/scripts/check-gradle-source.py --self-test && \
(cd source && GITHUB_ACTIONS=true python3 scripts/preflight-xy10-release.py) && \
git add source && \
git commit -m "Fix v0.69.384 Gradle syntax and add pre-push audit" && \
git push origin main
```

## What remains unverified

The standalone check is **not** an actual Gradle Groovy compiler; the full Gradle build and the official pinned 129-print catalogue audit can only be confirmed after pushing to GitHub.
