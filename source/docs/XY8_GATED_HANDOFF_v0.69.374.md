# XY8 BREAKthrough remaining 52 projected prints — mechanic-first handoff (repaired)

This is the **pre-CI static inventory** against the pinned official XY8 catalogue and `scripts/xy8_verified.py` as of 2026-11-22. Originally projected 108 mapped and 57 gated; the 2026-11-22 repair projects **113 mapped and 52 gated** after sharing the LV.X inheritance path with BREAK. Exact numbers require build generation. For the exact compiled result, inspect the build-generated `docs/XY8_BUILD_COVERAGE.json` and card `support.reasons`; never mark a print playable until its whole printed effect is implemented and tested.

Instead of implementing these in arbitrary number batches, address their shared mechanics **once**, and then unlock every affected print together. Where a card has multiple unresolved effects, both must pass before enabling it.

## Group 1 — LV.X-reused BREAK upgrade, no separate BREAK engine

- The previous LV.X stack is reused for five BREAK cards: Chesnaught #12,
  Raichu #50, Zoroark #92, Florges #104 and Noivern #113. Their mapped
  printed attacks/Ability are already in xy8_verified.py and no longer gated
  merely because the word BREAK appears.
- Marowak BREAK #79 remains gated ONLY because Bone Revenge needs its precise
  opponent-Prize-taken damage scaling; add a tested reusable damage rule.
- Live inheritance includes previous attacks and Abilities, previous type,
  Weakness/Resistance/Retreat, new HP and printed moves, plus attachments.
- Difference from LV.X: BREAK evolves Active or Bench as a normal evolution;
  LV.X levels up Active only. Regression tests cover both forms and defensive
  inheritance. Add phone/CPU tests during full-set audit.


## Group 2 — Trainers / Tools / Stadium (13)

- 133 Assault Vest — conditional prevention when opponent has Special Energy.
- 134 and 161 Brigette — choose exactly 1 Basic EX or up to 3 non-EX Basics onto Bench with correct space and deck state.
- 135 Buddy-Buddy Rescue — each player chooses a Pokémon from their own discard (opponent first).
- 137 Float Stone — continuous retreat cost zero.
- 139 Glalie Spirit Link, 142 Houndoom Spirit Link, 144 Mewtwo Spirit Link — matching Mega evolution without turn-ending, respecting tool slot and timing.
- 141 Heavy Boots — dynamic +20 max HP and Confusion prevention only for retreat-cost-three-plus holder.
- 145 Parallel City — orientation selected at placement, owner-dependent asymmetric effects and immediate bench-size enforcement.
- 147 Reserved Ticket — selected card goes on top of deck after shuffle, not into hand.
- 149 Super Rod — choose any 3 total actual Pokémon/basic Energy from discard and shuffle to deck.
- 150 Town Map — all prize cards become permanently face-up without changing choice/order.

## Group 3 — Special Energy (2)

- 151 Burning Energy — attach to Fire only, correct Fire provision, and reattach after discarded by an attack of its Fire holder.
- 152 Rainbow Energy — any-type effective provision only in play, correct attachment damage counter, preserve its actual physical card identity.

## Group 4 — Unresolved Pokémon Abilities (11)

- 15 Vivillon: Energy Color — once-per-turn coin, seek Basic Energy and attach to chosen Pokémon with zone/physical semantics.
- 51 Magnemite: Sparkling Induction — dynamic active Retreat Cost based on matching Magnemite Bench count.
- 54 Magnezone: Magnetic Circuit — repeatable Lightning attachment from hand to chosen Pokémon, using genuine physical hand cards.
- 59 Haunter: Gothic Fear — optional evolution-entry trigger affecting both Active Pokémon.
- 66 Mismagius: Twisted Incantation — optional evolution trigger shuffling opponent hand, drawing by their remaining Prizes.
- 70 Cresselia: My Way — dynamic zero Retreat Cost when Stadium present.
- 91 Zoroark: Stand In — activated switch from this specific Benched Zoroark to Active.
- 94 Yveltal: Fright Night — suppress all Tools while Yveltal is Active.
- 97 Mr. Mime: Bench Barrier — protect Benched Pokémon from attack damage dynamically.
- 103 Florges: Calming Aroma — continuous team attack cost reduction in Fairy units.
- 123 Smeargle: Second Coat — exchange a real attached Basic Energy with a different-type Basic Energy from discard.

## Group 5 — Unresolved Pokémon attacks (print-specific or new shared conditions)

- 2 Parasect: Colorful Spores — distinct Basic Energy types and distinct three Pokémon targets.
- 3 Pinsir: Overhead Throw — choose precisely one own Bench target for self-bench damage.
- 22 / 154 M Houndoom-EX: Inferno Fang — optional discard all Fire Energy BEFORE calculating +80.
- 28 Seaking: Soaking Horn — track whether this specific Pokémon was healed during this turn.
- 30 Starmie: Balance Bind — equal Bench counts prerequisite to Paralysis.
- 35 / 156 M Glalie-EX: Cryo Mouth — require at least ten actual damage counters.
- 45 Vanilluxe: Frigid Breath + Deep Freeze — lock both Supporter and Stadium; conditional status by each flip result.
- 49 Raichu: Thunderclap Shot — damage every opponent Pokémon-EX, including Active and Bench.
- 60 Gengar: Creep Show — knock out defending Pokémon at three or more damage counters, without ordinary 3-counter damage.
- 62 / 158 / 164 Mewtwo-EX: Damage Change — swap all damage counters between attacker and opposing Active correctly.
- 63 / 159 M Mewtwo-EX: Vanishing Strike — Stadium-conditioned bonus and only-then bypass Resistance and effects.
- 64 / 160 M Mewtwo-EX: Psychic Infinity — both Active Pokémon's Energy units; ignore Weakness, not other effects.
- 81 Piloswine: Gathering Footsteps — count the retreat costs of your Swinub/Piloswine/Mamoswine.
- 82 Mamoswine: Primordial Boom — Stadium ownership/orientation-specific bonus/heal (Thick Fat Ability mapped).
- 88 Cacturne: Derail — discard a physical Special Energy from opponent Active with owner choice.
- 106 Aromatisse: Heavy Perfume — confusion with *six* rather than three counters as a special rule.
- 107 Xerneas: Rainbow Force — unique Pokémon *types* on own Bench, not count of Pokémon.
- 111 Haxorus: Dragon Dance — stack +100 only for that Haxorus while Active, cap damage increase.
- 114 Meowth: Exhausted Tackle — coin flip must route damage to opposing Active OR attacker, not both.

## Next test requirements

After implementing shared mechanisms, rerun `node --test tests/v0736*.test.cjs tests/v0737*.test.cjs` and add turn-by-turn player/CPU tests for each newly unlocked print. Include deck-building checks (stage legality, support partners, Energy costs, fossil compatibility), choice UIs, actual Energy Zone and physical discard ownership, and knockout/Prize timing. Only declare completion when *165/165 prints battleEnabled* in the real generated ledger and GitHub's APK build succeeds.
