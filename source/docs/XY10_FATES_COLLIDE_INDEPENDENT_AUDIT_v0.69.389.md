# XY10 Fates Collide — independent gameplay and deck audit (v0.69.389)

## Scope and verified baseline

- Project supplied by owner: LuckyDex source ZIP with v0.69.388 complete Fates Collide integration.
- Pinned local official catalogue: 129 distinct XY10 printed variants, 147 attack print entries, 21 Abilities, 5 BREAK cards; 129/129 battle-enabled.
- Source + full pinned generation + existing stage checks: **69/69** baseline passing. Pinned original print costs and all official numbers are asserted by `v07383-fates-collide-integration.test.cjs`.
- Baseline pass is **not** proof that every complex gameplay interaction or every generated deck is sensible.

## Discovered and corrected

1. **Irrelevant trainer filler.** Generated human/CPU 30-card decks passed legality checks but auto-added Power Memory without Zygarde-EX, Fairy Drop / Fairy Garden without Fairy Energy, Devolution Spray without a real Evolution, Fossil Excavation Kit without physical Fossil Items and matchup-specific Mega Catcher without known target. The shared synergy report did not catch several of these. The builder now filters unsupported auto-added Trainers, the shared synergy score recognises mismatches, and manual kept choices remain respected.
2. **Repetitive support.** The compact 30-card deck builder could fill multiple slots with situational Trainers across disparate archetypes. Cap generic situational XY10 Stadiums and Items, favour real matching Pokémon support, and reserve **physical Strong Energy** for Fighting and **Double Colorless Energy** for relevant attacks before generic fillers. Basic Energy remains in the separate Energy Zone.
3. **Alakazam-EX Kinesis was mandatory, despite the printed optional effect.** Present a Use/Skip choice after evolving from hand, with the optional opposing Bench target. Tests check declining, applying Active counters and selecting the Bench target.
4. **Rotom Plasmagic removed damage from the player's board even when the opponent Active prevented effects.** Now checks protection before moving damage counters, preventing free counter loss. Tests cover both protected and unprotected targets.

## Checks added to the build gate

- `tests/v07389-fates-collide-independent-audit.test.cjs` verifies coverage, generated player/CPU decks over multiple seeds/types, dead Trainer detection, Special Energy matching, Kinesis choices, Plasmagic counter transfers and Moltres/Genesect optional attack selections.
- Included in source-only XY10 preflight, full pinned-catalogue preflight, Gradle `auditXY10ForApk`, and Gradle self-test enforcement. Previous XY10 stage tests remain required.
- Versions synchronized to v0.69.389 (`versionCode` 7389), release contracts, title screen and boot metadata.

## Validation / boundaries

- The reproducible local full pinned-catalogue preflight and focused regressions passed during patch preparation; an actual GitHub Actions **APK build has not been verified**.
- This independent sweep checks cards, effect mappings, attack costs, many targeted gameplay paths and randomly assembled decks. It does **not** simulate every possible battle-state combination. The explicit regression tests guard the failures discovered here.
- For Android / Termux apply the overlay rooted at `source/`, then run `python3 source/scripts/check-gradle-source.py --self-test` and `(cd source && python3 scripts/preflight-xy10-release.py --full)` before committing and pushing. The pinned catalogue must be obtainable or cached correctly; a source-only pass is never a substitute for the full test.
