# Detective Pikachu CI recovery — v0.69.443

## Confirmed failures

- [v0.69.441](https://github.com/FlintFireforge116/lucky-dex/actions/runs/45408925480): `:app:auditSM1ForApk`, `v07333-classic-deck-quality.test.cjs:70`, DET1-only competitive deck could assemble 16 of 30 compatible cards. This is a tiny no-Trainer set with incomplete evolution lines; the earlier standalone assertion did not reflect that limitation. The patch retains the full standalone test for other sets and explicitly tests the mixed DET1+SM9 pool in both styles with a focused DET1 card, ownership, legal deck size and synergy, plus CPU legality.
- [v0.69.442](https://github.com/FlintFireforge116/lucky-dex/actions/runs/45411471822): `:app:auditBW6IndependentForApk`, `v07309-dragons-exalted-independent-audit.test.cjs:42`, expected 60 but received 40. Bouffalant's printed Bouffer reduces attack damage by 20 after Weakness and Resistance. The previous test fixture expected no reduction. Corrected the original fixture to use unprotected Rayquaza-EX and added a dedicated Bouffer Active/Bench test. Shared damage logic is unchanged from 442.

## Validation

- 18/18 DET1 prints remain enabled; no changes to runtime mechanics or APK build gate dependencies.
- BW6 independent regression: 6/6 passed.
- Classic deck quality: 11/11 passed with locally available generated catalogues.
- DET1 integration and outcomes: 48/48 passed.
- The DET1 full preflight includes these historical files and the previously failing BREAKpoint file.
- Full Android APK and full all-catalogue regression are not verified locally.
- Complete updated DET1 preflight: 48 DET1 tests plus 30 historical tests, all passed (no skips). A broader 191-file local run was not completed; several legacy catalogue generators are unavailable offline.
