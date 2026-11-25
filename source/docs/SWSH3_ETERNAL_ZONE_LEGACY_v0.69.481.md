# v0.69.481 — Eternal Zone legacy placement migration

Starting point: v0.69.480, with both Eternatus VMAX prints still gated. This patch preserves 199/201 playable prints and migrates historical choice/placement handlers to the live placement predicate rather than relying on rejection after a card has been removed from its source zone.

## Changes
- Nine shared EX-era deck-search helpers (EX Hidden Legends, FRLG, Team Rocket Returns, Deoxys, Team Magma vs Team Aqua, Legend Maker, Holon Phantoms, Crystal Guardians and Unseen Forces) restrict the candidate predicate for Bench/evolution destinations only. Normal searches to hand and Energy attachment retain their existing behaviour.
- Gym Challenge Invigorate, Group Attack and Max Revive; Neo Destiny automatic discard revival, Provoke and Eerie Howl; Skyridge Call Friends/Call Nidoran; Unseen Forces Unown E; Dragons Exalted Cast Off Shell/Rebirth and Plasma Storm Gather Order use pre-placement restrictions.
- SM-era TopBench/OakSetup, Eternal Light, Spirit Burner, Research Lab, Captivating Wink, Gloom, Red Eyes, Strike Run, Super Growth, Dusk Stone and Evolution filter their placement pools. Unown E, Cast Off Shell and Rebirth also reuse the shared physical Bench slot allocator.
- Eighteen bilateral regression tests cover mixed deck/hand/discard pools, no card loss, opponent placement and unrestricted normal search-to-hand effects.

## Remaining release blockers
This is a compatibility migration, not a completion release. Additional older direct mutations/placement paths still require audit (including concealed Pokémon, replacement/transformation, prize placement and remaining bespoke evolution/search handlers). Cross-era continuous typing, simultaneous suppression, timing and Stadium precedence also require verification before enabling the two variants. Retain the production gates. Do not claim complete compatibility based solely on smoke coverage.

## Verification
- Full Darkness Ablaze preflight 125/125; new tests 18/18.
- SWSH1/SWSH2/Sky Field/deck-performance 296/296.
- SM1 historical Gradle gameplay gate 48/48.
- Gradle static source and release version parity passed. Full APK build unverified.
- Extended historical test sweep not clean; older non-gate tests report failures (including EX4 attack routing/CPU choice and obsolete selector assertions). The first nine observed failures were reproduced using the v480 effects file with the same unchanged core/catalogue; these were not silently repaired or relaxed. See additional regression notes below. Exhaustive historical verification remains incomplete.
