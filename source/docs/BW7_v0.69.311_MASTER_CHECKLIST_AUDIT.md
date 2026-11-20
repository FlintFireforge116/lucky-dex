# LuckyDex — Boundaries Crossed (BW7) master-checklist audit

**Date:** 20 November 2026  
**Source:** user-supplied `lucky-dex-main.zip` / `source/docs/LUCKYDEX_MASTER_RULES.txt` (v0.69.310 additions).  
**Correction package:** v0.69.311.

## Result

**Conditional code-level pass after fixes; not a fully device-verified pass.** The full numbered set is battle-enabled, test cases and additional CPU constructions are clean, and five material checklist discrepancies have been corrected. The synthetic audit still has specific skipped actions and manual review flags. Neither an Android APK build nor phone gameplay was performed.

## Checklist outcomes

| Master-checklist area | Result | Direct evidence / boundary |
|---|---|---|
| Set roster and printed definitions | PASS, catalog level | 153/153 numbered cards registered, 216 attacks, 21 abilities, 0 static errors, 0 warnings. This is not an independent full printed-text comparison for every action. |
| 30-card deck, evolutionary chains, ACE SPEC | PASS, automated | 16/16 standard CPU builds and 135/135 additional seeded builds legal. ACE SPEC total-one restriction covered by `v07310` tests. |
| Player decisions and card identity | PASS for named cases | Hugh, Dusknoir, Audino, Tools, Landorus, Psyduck, Flygon and Energy Search choices have targeted tests. Uncovered cases need interactive checks. |
| Basic Energy Zone versus physical discard/deck | PASS for targeted cases | Draw In and Dragon Stream consume discard stock, and Energy Search now distinguishes physical cards from the Energy Zone; special-card UID preservation tested. |
| Special Energy cross-set interactions | CORRECTED | Firefighting, Land's Judgment and Flying Beatdown include eligible physical Special Energy, with exact selection when necessary. |
| Active versus Bench Weakness/Resistance | CORRECTED | Charizard Split Bomb uses the shared multi-target damage pipeline; Vileplume Allergy Panic multiplier (160 on Active), normal Bench hit (40) checked. |
| Abilities, conditions and turn boundaries | PASS for named cases | Direct regression tests cover selected BW7 abilities and restrictions; wider timing and condition combinations remain review items. |
| Prize and knockout sequence | PARTIAL | EX/ACE SPEC/prize and some choice tests pass; full animation timing and device interactions are not covered. |
| CPU decision quality | PARTIAL | Legal construction is tested. Tactical ability timing, energy usage and real-game robustness need live-game coverage. |
| Build/package integration | SOURCE VERIFIED | New tests added to Gradle build gate and a source-relative patch verifier passes; GitHub Actions/APK build and Android operation are unverified. |

## Concrete discrepancies found and corrected

1. **Charizard #20 — Split Bomb:** manually adding 40 to target damage skipped the Active's Weakness, Resistance and guard pipeline; switched to the existing generic `multiTargetDamage` handler. Regression: Active Vileplume with Allergy Panic takes 160; Bench still 40.
2. **Psyduck #33 — Firefighting:** previously discarded only typed Basic Fire counters; now recognises Fire-providing physical Special Energy (including BW6 Blend GRPD), preserves UID in opponent's discard, and asks which to discard where needed.
3. **Landorus-EX #89/#144 — Land's Judgment:** optional 70-damage boost previously required and discarded Basic Fighting counters only. Now Fighting-providing Special Energy qualifies, and all eligible Basic/Special attachments are discarded into their correct stores.
4. **Flygon #99 — Flying Beatdown:** optional Grass/Fighting discard did not recognise Special Energy. Now supports two distinct eligible cards/counters; gives a source-pair choice when alternatives exist, and retains Paralysis on success. One wildcard card cannot be counted twice.
5. **Energy Search #128:** previously grouped Basic cards from physical deck and Energy Zone by type and silently favoured the physical deck. Now offers separate provenance-labelled choices and preserves existing physical UID.

## Verification ledger

- **Full original BW7 tests:** 26/26 pass.
- **New v0.69.311 independent checklist cases:** 10/10 pass.
- **Combined BW7 tests:** 36/36 pass.
- **Compatibility tests, BW5–BW6 and BW7:** 79/79 pass on the final suite run.
- **BW7 synthetic action audit:** 466/468 executed, **0 exceptions**, **2 skipped**; both skipped actions refer to Computer Search #137 in the generic harness (one per side), not automatically a card failure.
- **CPU builds:** 16/16 standard audits, plus 135/135 additional 30-card BW7 builds spanning 9 types and 15 seeds.
- **Static audit:** 0 definite errors, 0 warnings, **59 review flags**, **121 cards tagged for manual scenarios**. These flags are not a list of 59 broken cards.

## Open validation work

The source inventory has broad printed-effect coverage, but synthetic checks and source scans cannot certify every coin branch, opponent AI decision, prize-order animation, multi-step mobile picker or every cross-set combination. Computer Search #137 is directly regression-tested through two selected discard costs and deck search, even though the broad synthetic smoke harness skipped its two generic attempts. Perform live matches that exercise selected-card prompts and prize timing.

The actual Android build was not run here; successful Node tests and a safe patch layout do **not** guarantee a successful GitHub APK build.
