# Recovery ledger — plan: docs/superpowers/plans/2026-10-05-luckydex-recovery.md

Baseline commit: 5f2956e. Branch: fix/v021-stability-ui-recovery.

Ruling: Execute authorized recovery continuously; no additional design approval is needed because the user supplied detailed repair priorities and completion gates.

Ruling: Use this initially empty workspace as the isolated recovery checkout; preserve baseline in Git and do not create a second checkout.

Ruling: Exclude supplied development signing key from Git and exported source; retain local key for upgrade-compatible builds. Automatic review rejected broad staging; explicit exclusion succeeded.

Task 1: complete. Browser reproduction: Ball Drop exit retains arcade-open=true. No uncaught Trade exception reproduced with empty initial save; Android device unavailable. Baseline APK builds and verifies; device runtime still untested.

Pre-flight: router consumes each game cleanup; game owners consume shared platform/state and result session. Assets supply local paths to each game. Version/build gates depend on browser, asset and visual checks.

Task 2: complete. Trade expired-slot recursion reproduced and repaired; one router/owner registry; explicit idempotent cleanup. Commit7cd6f4d established the initial ownership/assets recovery.
Task 3: complete for candidate scope.4,220localassets verified; game ratios, images, touch regions and six contact sheets at three phone sizes. Exact missing retail-fidelity resources documented rather than approximated.
Task 4: candidate verification complete. Eleven active behavioral/browser programs and asset integrity pass; independent review's four findings repaired with red-to-green regressions. Android0.21.0/211assembles and original signer verifies. Headless emulator stayed offline; no hardware/device native runtime validation.
Ruling: user confirmed no device available and explicitly requested candidate delivery. Deliver source/APK/QA with native coverage gap and fidelity limits, retain recovery branch, do not merge/publish.
