# v0.69.495 — historical preparation repair

The v494 DET1 dependency failure was reproduced locally: 29 of 30 tests passed; the lone failure required `discardKnockedOut(s,slot)`. v494 intentionally passed the live battle state into this helper so attached Special Energy suppression works when discarding cards. The v495 assertion checks `discardKnockedOut(state,s,slot)` in the specific Splash Energy branch. No battle engine change.

Two bilateral tests verify Splash rescue, Recycle Energy return, physical discards, normal Prize awards and promotion with and without Spectral Breach. For offline checks before the pinned XY9 catalogue is generated, the test supplies the explicitly verified Special Energy descriptor; when available it uses the actual catalogue card.

Verification: exact `sh scripts/prepare-swsh4.sh` completed exit 0 on Node 22.16.0 / Python 3.13.5; all 25 historical source gates passed; 1368 test invocations passed (zero failed, skipped or cancelled). The affected DET1 dependency passed 32/32 and Vivid Voltage passed 152/152. Full Android APK compilation, generated older catalogue audits outside this prepare chain and device verification remain unverified.

Vivid Voltage remains 203/203. Cumulative patch includes v494 files and the repaired historical test.
