# v0.69.559 — Typed top-deck Energy adaptation

The user approved extending the Magma Spurt hybrid approach to the other affected cards before continuing new sets. Existing printed definitions remain intact; the shared runtime uses the original card-specific count, base damage, multiplier, and matching Energy types. Eleven additional prints plus the previously adapted Magma Spurt share one resolution/preview/AI rule. Each heads samples the next finite Zone unit; tails do not consume. Discard nonmatching sampled types and credit the Basic Energy ledger. Physical deck, physical discard, current drawn Energy, attachments (apart from Raikou's intended transfer) are unaffected. Existing normal damage pipeline still applies.

| Prints | Attack | Coins | Damage |
|---|---|---:|---|
| gym1-37 | Lava Burst | 5 | 20 × Fire |
| neo4-39 | Rushing Magma | 5 | 20 × Fire |
| bw8-23 | Fiery Licks | 4 | 50 × Fire |
| swsh5-82 | Big Sand Cannon | 6 | 60 × Fighting |
| pl4-3 | Magma Mantle | 3 | 60 + 20 × Fire/Metal |
| swsh1-24/188 | Combustion Pillar | 1 | 90 + 90 × Fire |
| ecard3-17/H16 | Eruption | 1 per side | 20 + 20 × Fire |
| dp3-16 | Thunder Climb | 3 | 50 + 10 × Lightning; attach captured Lightning to chosen Pokémon |
| sm9-30 | Distilled Blast | 7 | 30 + 30 × Water; return sampled Water, shuffle Zone |

Decisions for unique mechanics: Magcargo samples both Zones, not the physical decks; Raikou captures Lightning outside discard until the existing mandatory target choice; Gyarados discards non-Water sampled Energy rather than milling non-Energy physical cards and returns/shuffles sampled Water. These are deliberate adaptations, not changes to printed text. AI uses a capped binomial expectation based on declared types; preview shows a conservative range. Physical Special Energy counting effects, variable-length deck mill, opponent-deck milling and any-Energy attachment are not converted; see v0.69.558 candidate list. No new expansion enabled, both DTE gates unchanged.

Targeted validation: 260/260 passed (113 new tests) across new bilateral Zone tests, Magma Spurt, Battle Styles outcomes and Secret Wonders completion. Updated old Sandaconda/Raikou tests to assert the new intentional rule; unrelated tests remain unchanged.

Full standard release preparation: 2,820/2,820 tests passed (507/507 final suite), exit 0.
