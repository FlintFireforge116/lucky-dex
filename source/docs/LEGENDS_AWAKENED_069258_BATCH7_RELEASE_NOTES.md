# Legends Awakened v0.69.258 — Batch 7

**Coverage:** 123/146 battle-ready Pokémon/Trainer prints (+12), 23 remain gated.

New cards: #6 Fire Heatran; #13 Probopass; #14 Rayquaza; #18 Armaldo; #36 Regice; #38 Regirock; #39 Registeel; #76 Unown [J]; #78 Unown [U]; #79 Unown [V]; #80 Unown [W]; #81 Unown [Y].

Reused: real Energy movement/discard, multi-step choices, activated Power once-per-turn and status restrictions, passive damage prevention, owner-controlled switch, bench damage and typed deck searches. Fixed nested `effectChoice` metadata to preserve the current stage and added legal-actions guards for empty cost/target cases. All printed card actions receive explicit effects and CPU actions use the same legality rules.

**Verification:** 128/128 targeted dp6 tests pass, 107/107 selected older and shared regression tests pass, generated/offline metadata audit validates 103 audited snapshots. The full Android Gradle build was not run locally. Upstream archival JSON is unavailable to the isolated container; GitHub's existing `source/data/classic/dp6-print-source.json` is used during its build. Previous version v0.69.257 succeeded in GitHub Actions #546.

Install this patch relative to `~/lucky-dex/source` and push using the standard Termux command. It does not change repository-root GitHub workflows. Keep remaining dp6 cards gated until audited.
