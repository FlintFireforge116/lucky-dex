# LuckyDex v0.69.255 — Legends Awakened Stage 4

**Status:** 80/146 battle-ready collector prints (+18 since v0.69.254); 66 collection-visible prints are still deliberately excluded from Classic battle and CPU decks.

## New audited cards

Dragonite (2), Gliscor (5), Mamoswine (9), Jirachi (31), Lopunny (33), Regigigas (37), Uxie (43), Grumpig (56), Ledian (60), Mightyena (66), Persian (68), Piloswine (69), Swellow (73), Bellsprout (85), Hitmonchan (99), Hitmonlee (100), Shinx (118), Sneasel (120).

All new printed attacks are registered from exact archived card snapshots and run with real outcome effects, including independent flip results, delayed KOs, selected Benched hits, chosen deck returns, status/Power locks and attached Energy transfer. Four new Poké-Body/Poké-Power triggers (Lopunny, Regigigas, Uxie, Swellow) run through the shared trigger/passive pipeline. Unsupported LV.X, Deoxys Form Change, Fossils and remaining Trainer effects have **not** been marked complete.

## Shared correctness changes

- Return-to-hand now prioritises the physical Pokémon/evolution stack when the Classic eight-card hand limit is hit by a whole-stack return, preserving the Pokémon instead of retaining only overflow Energy.
- Correct printed Tool/Technical Machine/Supporter/Stadium/Item subtypes are present on the bundled catalogue even while the Trainers themselves are battle-gated. This supports hand searches and effects such as Sneasel Rob.
- Classic Confusion attacks that fail their coin flip cause 30 self-damage; Grumpig Magical Step adjusts the damage to 60. The event is in the normal attack-turn flow.
- Power-only locks do not automatically lock unrelated Poké-Bodies.

## Build / handoff

Source-relative patch. From `~/lucky-dex` unzip into `source` and `git add source; git commit; git push origin main`. APK preBuild performs archived metadata regeneration and the four Legends Awakened suites. Run locally:

```sh
python3 tests/test_dp6_build_pipeline.py
node --test tests/v07251-legends-awakened-stage1.test.cjs tests/v07252-legends-awakened-expanded.test.cjs tests/v07254-legends-awakened-batch3.test.cjs tests/v07255-legends-awakened-batch4.test.cjs tests/v07195-classic-hand-cap-and-tools.test.cjs
```

74/74 key tests passed locally, plus archived effect parity. The full unfiltered repository test glob exceeded execution limits. Previous GitHub Actions #543 (v0.69.254) completed successfully; this patch needs a new push to confirm Android APK build. No APK/device test is claimed.
