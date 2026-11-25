# Chilling Reign independent audit — v0.69.511

## Scope
Reviewed the pinned 233 collector prints against the generated catalogue, effect descriptors and shared engine, with a new independent test file rather than only the original attack smoke suite. All 168 distinct full-print identities and 65 equivalent reprints retain identical gameplay metadata and effects; 233/233 remain enabled. This is a targeted rules/interaction audit, not proof of all historical combinations.

## Corrections
- Shaymin #123, Return: the original descriptor set `optional: true` on `drawToHandSize`, whose resolver ignores it. Use an explicit post-damage choice to draw to six or decline. Both controllers tested.
- Electrode #222 (secret reprint of Vivid Voltage #46): match CPU Buzzap Generator safety/recipient policy by Ability name rather than one print ID. In particular, do not voluntarily lose the last opposing Prize to a self-KO. Retain the original player legality.
- Greedent #128, Brazen Tail: Super Energy Removal 2 has an independent two-tails self-discard outcome. The v510 pure-opponent-removal denylist already excludes this card; its existing outcome guard prevents opposing Energy removal on two heads, but not self-discard. Confirmed without changing the engine. Both outcomes tested for both controllers.
- Secret Bronzong and Snorlax: actual movement and turn-ending draw outcomes verified on both controllers.

## Remaining verification
All prints remain deck eligible. The established hybrid Energy Zone adaptation and per-type Basic Energy accounting are retained; exhaustive cross-era interactions and Android APK/device play are not covered by this audit. The independent test suite is wired into the full SWSH6 preparation gate.
