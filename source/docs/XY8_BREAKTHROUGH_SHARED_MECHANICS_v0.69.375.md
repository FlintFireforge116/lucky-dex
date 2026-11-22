# BREAKthrough mechanic-first continuation — v0.69.375

Builds on v0.69.374 successfully built version (same base).

## Implemented in this pass

- Attack shared conditions: Starmie Balance Bind equal Bench count, M Glalie-EX Cryo Mouth 10+ damage counters, Vanilluxe Frigid Breath (both sides, Supporter and Stadium lock until next owner turn) and coin-dependent Deep Freeze, Gengar Creep Show 3+ counters KO.
- Mega Mewtwo Vanishing Strike Stadium bonus and conditional resistance/effects bypass; Psychic Infinity counts Energy units on both Active Pokémon and ignores weakness. Applies to alternate prints.
- BREAK Marowak Bone Revenge counts **actual opponent Prize cards taken**, not KO points; Piloswine Gathering Footsteps adds retreat units of its evolution family; Mamoswine Primordial Boom checks actual Stadium ownership; Xerneas Rainbow Force uses unique Bench Pokémon types; Meowth Exhausted Tackle routes heads/tails to correct Pokémon.
- Shared ability/Tool rules: Magnemite Sparkling Induction; Cresselia My Way; Yveltal Fright Night reuses Tool suppression; Mr. Mime Bench Barrier prevents attack damage to Bench; Florges Calming Aroma reduces Fairy-coloured attack costs; Assault Vest; Float Stone; three matching Mega Spirit Links.
- Auto deck builder no longer adds these Spirit Links without corresponding actual Mega prints. It also avoids Tool auto-filler when Yveltal Fright Night would suppress those effects.
- New scenario tests in `tests/v07375-breakthrough-shared-mechanics.test.cjs` are mandatory through Gradle's `auditXY8ForApk`.

## Still gated after this pass (28 projected prints, verify with generated coverage ledger)

Attacks: Parasect #2 Colorful Spores, Pinsir #3 Overhead Throw, M Houndoom-EX #22/#154 Inferno Fang, Seaking #28 Soaking Horn, Raichu #49 Thunderclap Shot, Mewtwo-EX #62/#158/#164 Damage Change, Cacturne #88 Derail, Aromatisse #106 Heavy Perfume, Haxorus #111 Dragon Dance.

Abilities: Vivillon #15 Energy Color, Magnezone #54 Magnetic Circuit, Haunter #59 Gothic Fear, Mismagius #66 Twisted Incantation, Zoroark #91 Stand In, Smeargle #123 Second Coat.

Trainers/Tools/Stadium: Brigette #134/#161, Buddy-Buddy Rescue #135, Heavy Boots #141, Parallel City #145, Reserved Ticket #147, Super Rod #149, Town Map #150.

Special Energy: Burning Energy #151, Rainbow Energy #152.

## Validation and limits

Focused tests exercise shared descriptors and live effect handlers with both affected sides and differing board states. The source retains a build-time stub for XY8, so the 165-print pin is generated and fully audited during GitHub CI, not in this source-only patch. APK build must be confirmed after upload.
