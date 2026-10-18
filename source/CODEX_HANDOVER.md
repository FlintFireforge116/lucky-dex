# v0.45.0 Elemental Gauntlet handover

Sole baseline for this pass: the user-supplied v0.44.0 `LuckyDex_source.zip`, SHA-256 `37454930d9bd623630b20d4795a5a05069b17ee1be877db0ff16ae496dd8839f` (7,485 files). This pass was implemented directly in the supplied source; **Codex was not used**. Android remains `com.example.luckydex`; versionName 0.45.0, versionCode 4500.

Elemental Gauntlet is the fifth live Goldenrod Challenge Course event and owns Special Defense. Runtime files are `arcade-elemental-gauntlet-core.js`, `arcade-elemental-gauntlet.js` and `arcade-elemental-gauntlet.css`. Canonical base Sp. Def for species 1–1025 is bundled through `arcade-special-stats.js`. Clean dodges take zero damage; Sp. Def only changes the price of mistakes, and Defend is a limited mitigation fallback. The five waves are Fire / Water / Electric / Ice / Psychic. Exhibition uses Easy / Normal / Hard; Goldenrod uses the existing Rookie→Master Division and Type Cup framework.

The rare event is **Prismatic Storm** at 2% vanilla odds, with Settings controls Off / 2% / 25% / 100%. It reuses the existing reserved-safe Arcade rare-reward pipeline under `elementalGauntletPrismatic`. New permanent records and seven achievements are wired. The pre-existing `goldenrod_grand_champion` four-event condition is intentionally unchanged for backward achievement compatibility; `goldenrod_elemental_master` covers the new Master win independently.

Focused Challenge Course regressions and v0.45.0 feature/release tests are in the test tree. Historical tests that hard-coded the old four-event registry were advanced only to recognise the fifth event; their gameplay assertions were not weakened. See `TEST_REPORT_v0.45.0.md` for exact verification and the local browser-test limitation.

---

# v0.44.0 sleeve catalogue handover

Sole baseline: supplied v0.43.1 LuckyDex_source.zip, SHA256 3465e1716efe96188a8ba26b65f29ddbc273670c20f0667b5c9b2511cc8a55ea. The external repository was not modified. Android remains com.example.luckydex; versionName 0.44.0, versionCode 4400.

The existing cosmetics-v0413 catalogue/core/customise remain the owners. The expanded registry contains 202 locally packaged sleeve designs (114 Physical TCG, 78 Pocket, 10 LuckyDex originals), preserving all 30 old IDs. Rebuild metadata with node scripts/build-sleeve-catalogue-v0440.cjs, then node scripts/document-sleeves-v0440.cjs. Offline audit: python scripts/verify-sleeves-v0440.py (Pillow and Node required).

See TEST_REPORT_v0.44.0.md for final verification and 72 independently reproduced historical v0.43.1 suite failures. These failures are retained honestly; do not treat the entire old suite as green. New focused feature/release checks pass. Source URLs/prompts and durable unlock rules are recorded under docs/COSMETICS_*_v0440.md and scripts/data/sleeves-*-v0440.json. No remote sleeve images are required at runtime. Full-resolution acquisition images, stock/snapshot copies and local browser dependencies are excluded from the source archive.

---

# Current handover — LuckyDex v0.40.0 /4000

Adventure 3.0 is the current release. `LuckyDexAdventure` owns one home/navigation entry; internal Journey UI, Wild Hunt and tools modules share its services. Persistent Kanto/Johto/Hoenn schema2 journeys retain badges/checkpoints/claim flags. Old active Expedition is archived without payout. Do not reintroduce the legacy selector or Region retreat/reset design.

Party editing belongs to Adventure. Owned and synced levels remain distinct. Mart and teaching use confirmation tokens, revalidation and rollback. Battle priority, Speed and seeded ties determine move order. Keep the fixed simplified combat coefficients documented in `docs/ADVENTURE_BATTLE_V040.md`.

Before further development read `TEST_REPORT_v0.40.0.md`, `docs/ADVENTURE_JOURNEYS_V040.md`, `docs/ADVENTURE_BALANCE_V040.md`, and the approved brief in `docs/USER_ADVENTURE3_BRIEF.md`. Preserve original signer/application ID/saveVersion7 and the unrelated v0.39.1 systems. Targeted Adventure tests pass36/36; full continuing inventory311/327 has16 reproduced baseline failures. Native Android runtime testing remains unverified.

## Historical handovers


## LuckyDex v0.30.0 handover

- Pokémon Dash v2: top-down 540×720 Gen 3-inspired racer with larger 96–112 px sprites.
- Modes: Quick Race and 18 Type Leagues; leagues are three-race cups with 10/6/4/3/2/1 scoring and time tie-breaks.
- Difficulty Speed bands: Easy 20–65, Normal 55–100, Hard 90–135, Expert 125–180.
- Quick rewards: Easy 120/80/55/35/25/20; Normal 150/100/70/45/30/25; Hard 180/120/85/55/40/30; Expert 240/160/110/70/50/40. League final rewards are 3× the corresponding Quick reward and are paid only after race 3.
- Dash save migration is additive and preserves v0.29 career totals.
- Android identity remains `com.example.luckydex`; permanent dev keystore config is unchanged.
# Historical handover — v0.29.2 God Pack production polish

- Release identity: **v0.29.2 / versionCode 293**, unchanged `com.example.luckydex` application ID and permanent signer.
- God Pack production denominator remains **1000** and `FORCE_TEST_GOD_PACK=false`.
- Lucky Pack is now **1/500** and only rolls when God Pack does not trigger.
- God Pack intro copy is reduced to **GOD PACK** only; GOD PACK COMPLETE remains on the summary.
- Pack generation, spectacle, persistence and lifetime stats otherwise remain unchanged from v0.29.1.
- See `TEST_REPORT_v0.29.2.md`.
