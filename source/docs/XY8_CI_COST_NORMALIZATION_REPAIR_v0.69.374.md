# BREAKthrough XY8 GitHub CI repair — v0.69.374 (2026-11-22)

## Confirmed GitHub failure

- Run: https://github.com/FlintFireforge116/lucky-dex/actions/runs/45015786200
- Task: `:app:auditXY8ForApk` after `generateXY8ForApk`.
- Failing test: `Pinned XY8 runtime retains complete official catalogue and no fake enabled descriptors` in `tests/v07374-breakthrough-mechanic-first.test.cjs`.
- Error: `TypeError: a.cost.join is not a function` at line 66 of the previous version.
- The shared Classic catalogue registration converts attack costs from arrays to canonical Energy-code strings; this is intended and was already accounted for by Ancient Origins and Phantom Forces audits.

## Corrective patch

- The printed-attack audit now normalises either array or string costs to a canonical exact Energy-code sequence before comparing every generated attack with its original printed source row.
- New local test explicitly asserts that the audit accepts both `['P','C','C']` and `'PCC'` and rejects unrelated types.
- `LUCKYDEX_MASTER_RULES.txt` updated to v2.57 with the post-generation runtime/source representation contract.
- No cards, mechanics, player data, APK version code, Java/Kotlin or Gradle dependencies were modified. `v0.69.374` remains the Android app version.

## Tests and limitations

- `node --test tests/v07374-breakthrough-mechanic-first.test.cjs tests/v07374-breakthrough-lvx-reuse.test.cjs tests/v07333-classic-deck-quality.test.cjs`
- Local result: 18 passed, 0 failed, 1 skipped; the skipped test is the 165-card generated-catalogue audit because the source repository intentionally retains a build-time stub. The specific array-vs-string compatibility check is covered by a new, non-skipped test.
- Latest prior GitHub run confirmed generator, earlier deck-quality preflight and other pre-XY8 steps succeeded, and the generated-catalogue test produced the single failure above.
- The full APK build still requires a new GitHub push. Do **not** claim it succeeded until the latest Actions run completes successfully.

## Installation

```
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.374_XY8_PRINTED_COST_CI_REPAIR.zip -d source
git add source
git commit -m "Fix XY8 generated-catalogue cost audit on CI"
git push origin main
```
