# Forbidden Light independent audit — v0.69.421

## Results
- 150 of 150 generated prints enabled; zero gated; all 211 printed attacks and 25 Abilities preserved.
- 422 battle execution paths (211 attacks on each side), with choice resolution and no stuck effectChoice phase. Conditions are supplied for gated attack requirements. This is an execution smoke sweep, not exhaustive proof of all possible board states or every conditional effect.
- Three corrected findings: Act Tough uses effective Darkness from Unit Energy; Hyperspace Ring includes printed Item Tools; Overrun's Bench damage is mandatory if a target exists and does not block Active damage when there is no Bench.
- Full SM6 preparation 90/90 tests; Ultra Prism 235/235 tests in regression run; XY12/SM1 integration 13/13 after updating stale version checks. SM1–SM5, XY11–XY12 static gates pass. Actual GitHub APK for v0.69.421 pending. User confirmed v0.69.420 APK built.
- New test file wired to Termux and Gradle. Cumulative patch contains v419 and v420 files plus corrections.
