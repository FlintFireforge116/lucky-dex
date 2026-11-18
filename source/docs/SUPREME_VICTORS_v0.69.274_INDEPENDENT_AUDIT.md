# Supreme Victors v0.69.274 — independent checklist and corrections

Source baseline: the GitHub-pushed v0.69.273 Supreme Victors completion, rebuilt from the official archived print data and all three installed Supreme Victors patches. GitHub Actions for v0.69.273 completed successfully before this audit.

## Verified scope

- **153/153** real collector prints retained, including 146 Pokémon and 7 Trainer cards; **254** printed attacks and **34** named Poké-Powers/Bodies.
- All printed names, types, stages, HP, weakness/resistance, retreat, attack costs and texts, power descriptions, and rarity checked against `data/classic/pl3-print-source.json`. Executable effect definitions validated by the new strict test.
- **153/153** remain battle-enabled. The full printed-card archive is not replaced or altered by this patch.
- **51/51** Supreme Victors tests pass (40 previous + 11 independent outcome/deck tests).
- **273/273** original Classic GitHub preflight tests pass; **164/164** recent Stormfront, Platinum and Rising Rivals tests pass.
- Independent Classic auditor: **0 definite errors, 0 warnings and 0 review flags**; synthetic battle smoke **520/522** actions resolved; 2 had no legal action in the generated test scene. The smoke is not exhaustive printed-effect certification.
- **370/370** assembled decks checked for complete 30-card lists, legal evolution dependencies, payable printed attack costs, and matching Stadium beneficiaries: **145** successful individual Supreme Victors Pokémon focuses plus **225** CPU combinations (9 Energy preferences × 25 seeds).

## Confirmed bugs and repairs

1. **Energy-transfer choice consumed but didn't move Energy:** the shared transfer helper rejected the null optional slot argument. This affected **Magmortar Flame Ball**, **Camerupt Moving Fire**, **Charizard G LV.X Call for Power**, and **Yanma Baton Pass**. Now the selected physical attachment actually changes owner/target without creating Energy.
2. **Absol G Feint Attack** ignored Weakness and Resistance but incorrectly applied defending Poké-Body protection. It now bypasses effects, including **Milotic SH7 Aqua Mirage**, as printed.
3. **Battle Tower** was automatically included in **227 of 370** focused and CPU deck constructions without a friendly LV.X, sometimes helping only the opponent. It is now automatically selected only with LV.X. **Champion's Room** likewise requires friendly Pokémon SP. Manually saved Stadium choices remain intact.
4. **Primeape** was rejected as a main Pokémon because a later-era evolution exists. Evolution endpoint analysis now respects the latest era represented by the requested sets.
5. **Rayquaza C and Rayquaza C LV.X** built into a two-type Energy Zone despite Final Blowup requiring Water, Psychic and Fighting, or failed focus entirely. Their explicitly focused family now receives all three types. Normal non-Rayquaza decks remain limited to their existing two-type plan.

## Intentional restriction

**Staravia #85** cannot produce a full *Supreme Victors-only* focused evolution deck because Supreme Victors does not contain ordinary Staraptor. The deck builder rejects the incomplete line rather than placing an orphan Staravia, as requested by the deck-coherence checklist. Adding Diamond & Pearl (`dp1`) to the selected sets makes a complete Starly → Staravia → Staraptor deck possible and is tested.

## Boundaries

This is a source/runtime, generator, choice-outcome and deck-construction audit. It is stronger than a simple count check but does **not** exhaustively certify every possible matchup, every exact damage outcome, all AI decisions in a full match, or device-specific UI behaviour. The APK build is to be confirmed by GitHub after this v0.69.274 patch is pushed.

Full per-print checklist: `docs/SUPREME_VICTORS_v0.69.274_CHECKLIST.csv`. A test filename or literal card ID mention in that ledger is **not** proof of an individually verified outcome. The separate focused tests above provide outcome evidence for the corrected interactions.
