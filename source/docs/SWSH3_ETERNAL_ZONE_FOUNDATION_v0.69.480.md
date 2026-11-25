# v0.69.480 — Eternal Zone foundation (not yet released as playable)

Starting point: verified v0.69.479. All 199 previously enabled prints remain enabled. Eternatus VMAX (swsh3-117 and swsh3-192) remains gated by the generator. The tests temporarily enable only the two fixture prints; production gating is unchanged.

## Implemented
- A live, owner-specific predicate checks that an unsuppressed Eternal Zone source is in play and that all of that controller's Pokémon have effective Darkness typing. Multiple sources are handled; no flags are set for unrelated boards.
- Reuses the physical eight-slot Sky Field UI and owner-selected discard flow. On loss of the Ability the controller returns to the printed five-slot baseline (persisted for that controller, consistent with the hybrid Sky Field policy). Existing restrictive Stadium and Roadblock precedence is retained in this foundation. Discard selected Pokémon and attachments without KO/Prizes.
- Direct hand Bench, normal evolution, Rare Candy, Fossil/Doll, LEGEND and selected hand/discard entry actions consult the placement predicate. Top Entry and generic deck/discard placement and evolution handlers check before removing physical cards, including Capture Energy and Pokémon Breeder's Nurturing. Generic choice filters apply only to identified placement choices, not ordinary searches to hand.
- Dread End counts effective Darkness typing and reaches 270 with nine Pokémon. Existing attack filters remain unchanged unless the new effectiveType option is explicitly set.

## Remaining release blockers
The engine contains numerous historical bespoke placement paths (over 100 call sites of benchCard, plus direct Bench mutations and direct evolutions). Some consume a physical card before checking the placement result; simply rejecting at benchCard could lose cards or leave a dangling choice. Audit and migrate those paths to shared legality checks BEFORE requesting choices or removing a physical ref. Check hand, discard, deck, prize, opponent-forced placement, direct evolution, replacement/transformation, and conditional typing; exclude invalid candidates, preserve origin zones, and finish effects cleanly if no eligible target exists. Test both sides, including turn/checkup/KO/promotion timing, both controllers losing the Ability at once, cross-era Stadium precedence, and CPU trim choices. Review the exact interaction of Sky Field and Eternal Zone loss separately. Do not remove the two production gates until this work is verified.

This patch is infrastructure, not a set-completion or audit release. Android compilation and exhaustive historical gameplay validation remain unverified.

## Final verification
- SWSH3 full release preflight: 107/107, including 14 new fixture tests.
- SWSH1/SWSH2/Sky Field/deck performance: 296/296.
- Complete historical SM1 Gradle gameplay group: 48/48.
- Gradle static source and SWSH3 release parity passed. No full Android or exhaustive historical test run.
