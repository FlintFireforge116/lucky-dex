# Darkness Ablaze build repair — v0.69.479

Base v478; cumulative changed-files patch (can overlay v477 or v478). No new playable cards. 199/201.

## Reproduced failure
`node --test --test-name-pattern='Prize|prize' tests/v07401-sun-moon-independent-audit.test.cjs` failed on v478: ordinary GX KO claims had an unexpected `discardInstead: false` field. The assertion is an existing APK gate and was not modified. Only true Billowing Smoke claims now include the field. Two new bilateral current-set tests assert normal hand destination and player claim shape; the existing Smoke tests assert discard destination and player special claim shape.

## Validation
- Original failing targeted regression and Prize/Smoke tests: 7/7.
- Complete SM1 APK test group: 48/48.
- Darkness Ablaze full preflight: 93/93, current set generated from pinned source.
- Recent SWSH1/SWSH2 and deck performance: 287/287.
- Source release contracts: 15 newer contracts using their shared checker and 8 older native source-mode preflights all passed. Shared release version and Gradle source guard passed.
- No actual GitHub run log was available, so this is a reproduced local CI gate failure, not confirmation that it was the only remote failure. No full Android build, nested full Termux prep, or exhaustive historical gameplay sweep performed.
