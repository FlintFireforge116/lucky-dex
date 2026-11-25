# Chilling Reign — stage 5 (v0.69.509)

230 of 233 canonical prints playable (+10). Three remain gated: Greedent #128 (Brazen Tail), Rugged Helmet #152/#228.

## Implemented
- Weavile: mark the defending Pokémon, require positive opposing Rapid Strike attack damage on the next attacking turn; clear the mark on switch/evolution.
- Gardevoir: only actual top two cards are eligible; optional basic Energy attachment to chosen allied Pokémon, other cards to hand.
- Banette: reuse seven-counter Resolute Spite/Spiteful Sigh pre-damage choice. Counters are not recoil.
- Malamar: stage selections of actual Rapid Strike hand refs before damage, shuffle those refs into deck; CPU stops when estimated knockout damage is reached.
- Passimian: reuse opposing Bench attack-damage calculation, with one unsuppressed Throwing Coach bonus for Rapid Strike attackers hitting V/GX Bench targets.
- Spiritomb: distribute one damage counter per opposing discarded Pokémon, then shuffle the opposing Pokémon refs into deck only if any counters were placed.
- Aggron: Seismic Rift applies recoil and friendly Bench damage, not enemy Bench damage.
- Peonia and two alternate prints: optional selections from own Prize zone, mandatory equal replacement from hand; no prize score change.

## Remaining work
Brazen Tail must protect only attached Energy from opposing Item/Supporter effects, not protect the Pokémon from unrelated effects or attacks. Audit the shared and legacy return/discard/shuffle paths rather than using broad Pokémon-effect immunity. Rugged Helmet requires the defender's controller to choose an attached Energy after positive opposing attack damage to the Active, including knockout, while respecting Tool suppression and the existing attack-resume/KO sequence. These effects are deliberately not enabled yet.

Focused outcomes and integration: 111/111, including both controllers and CPU Malamar stop. Manifest unit tests: 12/12. APK and device validation and independent whole-set audit are separate.
Full offline preparation: 1,654/1,654 test invocations, exit 0, zero failed/skipped/cancelled.
