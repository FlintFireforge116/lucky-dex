# LuckyDex v0.69.307 — Dark Explorers independent audit

**Apply over v0.69.306**; all patch paths relative to `source`.

## Corrected gameplay

1. Leafeon Energy Assist accepted unrelated physical discard cards as Energy. It now searches only Basic Energy physical cards and tracked Basic Energy ledger entries.
2. Charge Beam from Tynamo and Klang could offer Pokémon/Items or misrepresent physical Special Energy as generic Basic Energy. Search now accepts Energy cards only; attached physical Special Energy retains its identity.
3. Raikou-EX Volt Bolt's chosen damage previously ran outside standard damage matching. It now selects the target before damage, applies Weakness/Resistance to Active as printed (not to Bench), and discards real Lightning Energy through the shared ledger.
4. Cofagrigus Chuck could discard further Tool cards and inflict a second direct damage packet after the attack. Now selected Tool card IDs are deducted once after a single pre-matchup damage calculation.
5. Kyogre-EX Dual Splash now applies Weakness and Resistance when one of its two target Pokémon is the Active, while keeping Bench damage unmodified.
6. Ultra Ball, Dark Patch, and Enhanced Hammer are gated when printed mandatory costs/targets are unavailable.

## Validation

* 9 independent focused tests cover physical and ledger Energy, Special Energy identity, player target selection and real attacks, actual Tool discards and Item legality.
* Pooled recent-era regression test suite, printed 111-card synthetic audit and CPU deck checks are run independently; see the external report for the final counts.
* Sources are the pinned print compact JSON and latest v0.69.306 implementation. No Android APK build or device test has been performed here.
