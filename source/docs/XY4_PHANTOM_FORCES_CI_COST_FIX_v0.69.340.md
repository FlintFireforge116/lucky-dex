# LuckyDex v0.69.340 — Phantom Forces CI cost audit repair

## Exact GitHub build failure
Build #628, `:app:auditXY4ForApk`: the fifth test compared a shared Classic
registry attack cost encoded as a compact string (`"GC"`) to the official
compact source encoded as `['G','C']`. This caused a false negative after
the generator had successfully created all 124 print entries. The other
five tests in the Phantom Forces suite passed.

## Repair
Normalize only the test *comparison* (array cost -> joined symbol string;
string cost -> unchanged). Preserve every printed Energy symbol and its order.
Added a storage-format regression test and synchronized Gradle/HTML/boot to
v0.69.340. No battle/card/AI/deck data changed; guarded future mechanics
remain gated until they are genuinely implemented.

## Verification
Run `node --test tests/v07339-phantom-forces-stage1.test.cjs` from `source/`.
The full generated-catalogue check executes on GitHub *after* XY4 generation.

## Additional compatibility fix
The old Furious Fists audit still expected v0.69.339 and would reject the
next app version. Both XY3 and XY4 now derive the expected display/boot
version from Android Gradle, enforcing exact parity while avoiding recurring
false failures on later releases.
