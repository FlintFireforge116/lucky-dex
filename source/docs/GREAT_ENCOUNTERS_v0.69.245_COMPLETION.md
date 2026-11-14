# Great Encounters — v0.69.245 completion

**Expansion**: Diamond & Pearl — Great Encounters (dp4), 106 card prints (100 Pokémon and 6 Trainers).

**Implemented:** 106/106 cards battle-enabled in source, compared with 100/106 in v0.69.244. All six formerly gated cards are included.

| Print | New implemented and targeted-tested interactions |
|---|---|
| Mawile #24 | Pick Out choices between either player's hidden Prize slots, keeps the revealed Prize; Supporter effect copied when applicable. Jaw Bite +20 after type matchup on next own turn. |
| Unown G #57 | GUARD transforms into a physical Tool after discarding attachments; attack effects blocked but damage persists. Hidden Power 50 or 10 when Unown G has damage. |
| Unown L #91 | LINK borrows any Unown in play, paying printed Energy; Hidden Power chooses/reorders physical cards from either player's discard. |
| Darkrai LV.X #104 | Endless Darkness double-coin Sleep and double-tails KO; Dark Shadow damage boost from physical Basic Darkness Energy, non-stacking. |
| Dialga LV.X #105 | Time Skip uses opponent's two coins and next-turn after-draw skip; Metal Flash attack lock. |
| Palkia LV.X #106 | Restructure assigns first switching choice to opponent, second to user; Hydro Reflect distributes all attached Basic/Special Energy among Bench. |

**Cross-cutting changes:** preserve distinction between CPU/UI choices that differ by hidden Prize index, Tool index or Special Energy UID. The master rules now record the concrete mechanics and potential timing hazards.

**Test strategy:** `node --test tests/v07243-great-encounters.test.cjs tests/v07244-great-encounters-stage2.test.cjs tests/v07244-great-encounters-remaining.test.cjs tests/v07245-great-encounters-completion.test.cjs`; `node scripts/audit-classic-set.cjs --set dp4 --smoke` plus dp2/dp3 regression checks.

**Limitations:** A smoke path only confirms the action runs in synthetic play. It does NOT verify all printed rulings, a visually correct Android UI, or AI strength in live matches. Auditor risk flags and skipped paths are not automatically clean passes. Independent print-by-print audit should follow this implementation pass.
