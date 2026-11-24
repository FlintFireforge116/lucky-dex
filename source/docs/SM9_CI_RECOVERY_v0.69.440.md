# v0.69.440 — CI recovery (no new card mechanics)

Confirmed GitHub runs #753 and #754 failed the stale SM1 version assertion; #755 failed `:app:auditXY9ForApk`, `v07381-breakpoint-completion.test.cjs:106`, because the source regex rejected the added Scoop-Up Block predicate. The executable Splash Energy rescue test passed in #755.

The fragile adjacent-predicate assertion is replaced by actual knockout outcomes, including both player/CPU ownership, opposing Scoop-Up Block enabled/suppressed, attachment discard, normal Prize award, and promotion. Existing attachment checks and normal rescue tests remain. No engine gameplay changes in this release. The SM9 local full preflight executes the repaired XY9 completion file as well as SM9 tests. Release markers synchronized to 0.69.440 / 7440.

Local results: SM9 + targeted XY9 = 117/117; XY9 full file list in source-only mode 69 pass, 2 generated-catalogue skips, 0 failures; all 14 release preflight scripts pass in their default mode. Android APK not built locally; generated XY9 catalogue not present and raw upstream network unavailable in local environment. CI remains authoritative for the full APK.
