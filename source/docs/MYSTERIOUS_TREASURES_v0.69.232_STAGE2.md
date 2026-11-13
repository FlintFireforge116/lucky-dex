# LuckyDex v0.69.232 — Mysterious Treasures Stage 2 (INCOMPLETE SET)

This is a **source-level incremental implementation patch** to apply after v0.69.231, not the independently requested full-set audit. Source from the prior staged build was used. No APK was built, device-tested or pushed to GitHub.

## Catalogue and battle enablement

- All **124** original Mysterious Treasures collector prints remain collection-visible and selectable by set.
- **91/124 battle-enabled** (83 Pokémon, 5 Trainers, 3 Special Energy); **33 remain gated** from battle and deckbuilding. Earlier version was 72/124.
- **136 enabled printed attack entries**, smoke-exercised from both player and opponent seats (272 action paths). Five Trainers are also playable from both sides (10 legal-play checks).
- All eight Energy-type CPU builds generated legal 30-card Classic decks.
- Existing Base/Jungle/Fossil through Diamond & Pearl functionality retained in the staged source.

## Newly enabled Pokémon (19)

- **001 — Aggron**
- **007 — Celebi**
- **008 — Feraligatr**
- **012 — Magmortar**
- **019 — Abomasnow**
- **024 — Exeggutor**
- **025 — Glalie**
- **032 — Ninetales**
- **044 — Croconaw**
- **045 — Dewgong**
- **061 — Sandslash**
- **068 — Vigoroth**
- **081 — Electrike**
- **082 — Exeggcute**
- **087 — Larvitar**
- **102 — Spheal**
- **121 — Electivire LV.X**
- **122 — Lucario LV.X**
- **123 — Magmortar LV.X**

**Key battle effects:** Aggron's optional Hard Metal recoil and discarded-Energy recovery; Celebi's Energy Zone search and optional Grass redistribution; Feraligatr's authentic hand-Energy count/discard; Magmortar's Magby-dependent hand cost; Abomasnow's reactive Sleep; Exeggutor's per-Energy flips and supply attachment; Glalie's Stage-2 damage reduction and Trainer/Supporter prevention; Ninetales' changeable type; Croconaw's top-five Energy pickup on evolution; Dewgong's sleeping damage reduction; Sandslash's next-turn retaliation; Vigoroth's awake/sleep evolution condition; Electrike's hand-only Energy lock; Exeggcute's selected bench target; Larvitar's optional self-Sleep boost; Spheal's next-turn Rollout modifier; and the three LV.X cards with inherited attacks and their printed effects.

**Source correction during tests:** Aggron's discarded Basic Energy recovery initially mapped some type names to wrong Diamond & Pearl printed Basic Energy IDs. The final patch corrects that mapping and tests the actual returned card IDs (Grass 123, Water 125, Fighting 128, etc.).

### LV.X special actions

- **121 Electivire LV.X:** Active-only level up; inherited Electivire attacks; Pulse Barrier removes actual opposing Tools/Stadiums; Shocking Tail places 20 damage upon opponent Energy attachment from hand, not Energy Zone.
- **122 Lucario LV.X:** Active-only level up and inherited attacks; once-only optional Stance on the level-up action (may be declined); increased incoming damage following Close Combat.
- **123 Magmortar LV.X:** Active-only level up and inherited attacks; Flame Bluster targets one opposing Pokémon, discards two attached Fire Energy and locks only Flame Bluster for the next own turn; Torrid Wave applies stronger Burn.

## Test evidence

- `tests/v07231-mysterious-treasures-integration.test.cjs` plus `tests/v07232-mysterious-treasures-stage2-outcomes.test.cjs`: **30/30 tests passed**. Outcome tests cover Metal/Basic Energy recovery, optional recoil, Energy from hand, selection, healing/damage reduction, evolution stack and triggered abilities, same-turn effects, next-turn limitations, and LV.X.
- Two-batch cross-set Node regression: `v07202–v07215`: **249/249**; `v07216–v07232`: **290/290**. **539/539 selected automated tests passed**. Node `--test --test-concurrency=2` was used in each batch.
- Smoke: **272/272** attack choices exercised across both player/opponent; all **10/10** Trainer play paths; deck legality for **8/8** Energy types. These counts refer to automated test loops contained within the above test suite and should not be added as independent suite totals.
- No Android APK/device testing or actual CPU match quality/visual timing validation has taken place.

## Still gated (33 printed cards)

`dp2-2`, `dp2-3`, `dp2-4`, `dp2-5`, `dp2-6`, `dp2-9`, `dp2-10`, `dp2-11`, `dp2-14`, `dp2-18`, `dp2-20`, `dp2-21`, `dp2-23`, `dp2-26`, `dp2-29`, `dp2-30`, `dp2-31`, `dp2-34`, `dp2-36`, `dp2-37`, `dp2-39`, `dp2-43`, `dp2-46`, `dp2-65`, `dp2-66`, `dp2-67`, `dp2-70`, `dp2-73`, `dp2-111`, `dp2-112`, `dp2-115`, `dp2-116`, `dp2-117`.

The blockers include reactive hand/turn Poké-Powers (e.g. Alakazam Power Cancel), three Unown actions, alternate retreat/energy-cost bodies, Lake Boundary's multiplicative Weakness, Fossil Excavator, Team Galactic's Wager and the two Fossil-as-Pokémon Trainers. **Do not infer that these cards are playable because their artwork is registered.** Fossil evolution endpoints remain restricted if their Basic Fossils are not playable.

## Next implementation steps (not the separate full audit yet)

1. Fossil-as-Pokémon Trainer lifecycle, Armor/Skull Stone, Stage 1 evolution, KO/Prize rules.
2. Advanced reactive and persistent Poké-Powers, Unown I/E/M/T, Stadium weakness and hand/attachment rules.
3. Implement and outcome-test remaining 33; only then perform requested independent 124-card print-to-code audit and Android testing.

## Changed source relative to v0.69.231

Version bumped to **0.69.232**, Android `versionCode` **7221**, and master rules **v2.25**. The ZIP is incremental and includes only file differences.
