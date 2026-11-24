# LuckyDex v0.69.467 cumulative CI repair

## Verified failing GitHub tasks
- [v465](https://github.com/FlintFireforge116/lucky-dex/actions/runs/45487691949): `:app:auditSM75ForApk`, Dragon Majesty mono-Water generation returned 29/30 compatible owned cards. Reproduced locally. The useful Trainer threshold counted alternate arts separately even though they share a name-based copy limit. Both narrow-pool fallback conditions now count distinct Trainer names.
- [v466](https://github.com/FlintFireforge116/lucky-dex/actions/runs/45492579847): `:app:preflightSM1ContractForApk`, `player invisible set swsh1`. Picker era groups were separate from the rows. They now derive from rows automatically.

## Protection
The shared prepare script runs the actual failing historical tests plus the SM2 picker and performance tests. Existing Gradle gates remain intact. New regressions exercise all three picker orders and four seeds under both player build styles. Existing CPU test remains unchanged. No rollback, no new cards, no weakened legality or Tool filters.

## Limits
Android APK compilation and generated-only historical assets must still be checked by GitHub Actions. The known offline XY placeholder assertion remains intact.
