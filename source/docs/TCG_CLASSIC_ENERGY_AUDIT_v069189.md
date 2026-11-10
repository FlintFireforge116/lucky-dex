# LuckyDex Classic TCG Energy / EX Emerald second audit — v0.69.189

Date: 10 November 2026. Base version: v0.69.188. Format: converted Classic, not Pokémon TCG Pocket. Authoritative shared document: `LUCKYDEX_MASTER_RULES.txt` revision 1.4.

## Changes applied

1. **Printed-era Darkness Energy:** Neo Genesis `neo1-104`, Expedition `ecard1-158`, Aquapolis `ecard2-142`: +10 after Weakness/Resistance, usable on non-Dark Pokémon, retain printed between-turn self-damage where applicable. EX Ruby & Sapphire `ex1-93`, EX Emerald `ex9-86`: +10 before Weakness/Resistance only for Darkness/Dark-named attacker, without older drawback. Handle normal and repeat attacks and display previews that describe the old after-Weakness bonus.
2. **Double Rainbow `ex9-87`:** -10 to all attacked targets including selected Bench target; also applies when the attack bypasses Weakness/Resistance. Attack preview follows this.
3. **EX Emerald Combusken `ex9-25` Lava Burn:** 20 to Defending Active plus 10 to exactly one selected opposing Bench. Attack usable when opponent has empty Bench. Selection identifies UID/slot.
4. **EX Emerald `ex9-81` PokéNav:** Only actual top three of physical deck, never the Energy Zone. Pick eligible Pokémon or Energy; arrange remaining two. When none eligible, allow reordering all three without inventing a card.
5. **EX Emerald Regice ex `ex9-98` Iceberg Crush:** User chooses particular attached Basic or Special Energy, including distinct types, when heads and Regirock ex in play.
6. **EX Emerald energy/strategy metadata:** distinguish attacking damage proportional to Energy from real acceleration; add spread/snipe and draw/search roles accurately.
7. **EX Deoxys `ex8-87` Lady Outing:** remove obsolete auto-builder exclusion; Classic `C-ENERGY-002` makes its Basic Energy deck-search legal via Energy Zone. Correct derived metadata (search and energy, not opposing disruption).
8. **Legacy expectation repair:** EX Ruby & Sapphire generated Basic Energy from Zone uses the shared canonical Basic print (`neo1-107` for Fire), not a hardcoded ex1 print. Test now verifies correct Energy type, actual hand destination and unchanged draw deck; legacy Lady Outing test now accepts a legal deck that may include the card.

## Automation evidence

- `node --test tests/v071{41..89}*.test.cjs` (excluding the two Delta Reign artwork tests that hardcode a nonexistent `/mnt/data/source` path in this environment): **537/537 passed** across e-Card, classic deck builds, all recent Gen 3 EX sets, EX Deoxys, EX Emerald and new v189 outcome assertions.
- `tests/v07189-ex9-energy-audit.test.cjs`: **18/18 passed**.
- Older Base/Jungle/Fossil/Neo test selection: **90/105 passed**, 15 failures. Repeated exactly on the untouched v0.69.188 source **90/105**, confirming no new regression in those tests; failures are mainly obsolete version/catalogue/Basic-Darkness assumptions, an old absolute-path fixture and older sparse-ownership deck-building expectations. These failures are NOT claimed fixed and should be investigated separately if the current UI exhibits their behaviours.
- Node syntax checks passed for all changed battle/metadata/deck-builder JavaScript. No physical Android touch-device QA done.

## Manual Android Test Lab recommendations

- EX Emerald Combusken: Lava Burn with 0 and 2 opposing Bench Pokémon; tap desired one and confirm only it takes 10 while Active takes 20.
- Neo Darkness attached to a non-Dark attacker vs Weakness target: 20 damage doubles to 40, then becomes 50; EX Darkness attached to eligible Dark attacker: 20+10 first, then doubled to 60.
- EX Emerald Double Rainbow: Swift 60 becomes 50, and Lava Burn Bench 10 becomes 0.
- EX Emerald PokéNav: choose a top-three eligible Pokémon, then reorder the remaining two; when three Trainers are top, reorder all three without a draw.
- Regice ex + Regirock ex: choose an opposing Special Energy rather than the first Basic, verify it enters physical discard.
- EX Deoxys Lady Outing: build an Energy-ramp deck, play Supporter and select Energy Zone types into hand. Zone and hand normal attachment limits still remain separate.

Next expansion remains EX Unseen Forces (ex10); do not silently modify old set behaviours to match a different generation of printed Energy card.
