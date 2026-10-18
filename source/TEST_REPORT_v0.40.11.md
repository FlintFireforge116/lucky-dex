# LuckyDex v0.40.11 — Test / Handover Report

## Scope

v0.40.11 is the systematic Adventure battle-mechanics audit. It audits every move Adventure can expose at or below the level-50 cap and replaces a large set of silent/generic fallbacks with shared mechanic families rather than one-off move patches.

The audited set contains **625 Adventure-accessible moves** from the pinned offline move/learnset snapshot: 405 damage, 52 buff, 29 debuff, 26 status, 13 heal and 100 generated utility `no-op` rows.

See `docs/ADVENTURE_BATTLE_MECHANICS_AUDIT_V0411.md` for the full support/defer matrix.

## Battle mechanics added/corrected

- real -6..+6 Attack / Defense / Speed / Accuracy / Evasion stages with an Adventure-tuned multiplier curve;
- real move power instead of the previous 95-power cap;
- recoil, drain, critical hits, flinch and damaging secondary stat changes;
- confusion and binding/trap volatiles;
- Leech Seed residual drain/heal;
- Protect-family turn protection;
- Rest, Haze, Heal Bell/Aromatherapy and Focus Energy;
- fixed/conditional damage families: OHKO, Super Fang, level damage, Endeavor, Final Gambit, False Swipe;
- variable-power families: Flail/Reversal, Water Spout/Eruption, Low Kick/Grass Knot, Gyro Ball, Heavy Slam/Heat Crash, Electro Ball;
- self-KO and recharge families;
- Rain/Sun/Sandstorm/Hail/Snowscape weather, including core damage/residual effects;
- Encore, Disable, Taunt, Mean Look/Block, Wish, Ingrain/Aqua Ring, Perish Song;
- Tailwind and Trick Room speed control;
- Teleport wild escape, Soak, Topsy-Turvy and Speed Swap.

Thirty of the 100 generated `no-op` rows now have explicit Adventure behaviour. The remaining 70 are documented as deferred because they primarily depend on systems LuckyDex does not currently model (held items, abilities, doubles targeting, switch-in hazards, richer terrain/copy/replacement semantics). Their move UI remains explicit that no LuckyDex battle effect is implemented; it does not falsely claim support.

## Balance regression found during the audit

The first full historical sweep exposed repeat defeat loops in two persistent regional simulations after canonical Pokémon stat-stage multipliers were introduced. A controlled comparison showed the new stage curve was the cause: with stage multipliers disabled, all twelve journeys completed again.

The final implementation therefore keeps real -6..+6 stages but uses an **Adventure-tuned ~15% per positive stage with reciprocal negative stages**. This preserves meaningful stat moves without allowing one AI boost to overturn the established campaign/potion economy. The twelve-journey persistent balance simulator passes again with the tuned curve.

## Release identity

- package version: `0.40.11`
- Android `versionCode`: `4011`
- Android `versionName`: `0.40.11`
- visible/app build markers: `v0.40.11`

Historical release-identity preservation tests were extended to recognise v0.40.11 while retaining their older feature/signer assertions.

## Focused verification

Command covered the core reducer, v0.40.4 battle contracts, v0.40.11 mechanics, real battle integration, Adventure 3 battle contracts, move data/view contracts, regional balance simulator and release identity.

Result: **83/83 tests passing, 0 failures**.

The v0.40.11-specific reducer tests cover recoil, real stages/turn order, flinch, confusion, trapping/residual damage, Protect, Rest, Leech Seed, Haze, party status cure, fixed damage, move descriptions, damaging confusion, recharge, weather, Pain Split, Belly Drum, Encore, Disable, Tailwind, Trick Room, Teleport and Perish Song.

## Full non-browser regression — working source

All **363** `tests/*.test.cjs` programs were executed/classified individually.

- runnable in this environment: **337**
- Playwright/browser-dependent and environment-blocked: **26**
- genuine failures: **0**
- timeouts: **0**

The 337 runnable programs were then executed together using Node's test runner.

Result:

- **558 tests/subtests**
- **558 PASS**
- **0 FAIL**
- **0 skipped/cancelled**

The 26 blocked programs are not counted as passes. They require the Playwright/browser runtime unavailable in this session.

## Asset / preservation verification

Fresh checks from the working source:

- changed/new JavaScript syntax (`node --check`): **PASS**
- Adventure location-scene pixel/build verifier: **2/2 PASS**
- all 44 authentic Adventure scenes/sheets/crops: **PASS**
- all 2,098 offline Arcade sprites: **PASS**
- all 2,078 unretouched Arcade actors: **PASS**
- all 8 local venue assets: **PASS**
- Adventure asset registry: 829 images / 1,025 species / 386 back sprites / 37 registry objects: **PASS**
- Fossil Museum assets: 42 images: **PASS**
- protected baseline preservation: **5,946 files PASS**
- older v0.33.1 protected baseline: **840 files PASS**
- protected shared save/pack/Collection/Dust/trade/navigation declarations: **211 PASS**

## Packaged-source verification

The source ZIP was extracted to a fresh directory and verified again.

- v0.40.11 focused battle/release gate: **83/83 PASS**
- test programs classified from extracted ZIP: **337 runnable / 26 Playwright-blocked / 0 genuine failures / 0 timeouts**
- combined extracted runnable suite: **558/558 PASS**
- changed battle/move-view JavaScript syntax: **PASS**
- Adventure/Arcade/venue/Fossil asset checks: **PASS**
- 5,946 protected files, 840 older protected files and 211 shared declarations: **PASS**

The 26 Playwright-dependent programs remain environment-blocked rather than being counted as successes.

## Device checks requested

1. Use a Pokémon with a visible stat move such as Swords Dance/Growl and confirm the battle log reports the real stat change.
2. Test a recoil move and a draining move; HP should move in the correct direction after damage.
3. Test Protect then an incoming attack; the attack should be blocked for that turn.
4. Test Confuse Ray / a confusion secondary effect and a trapping move.
5. Test one weather move and Tailwind/Trick Room if available.
6. Confirm ordinary Adventure progression, capture, switching, item use and post-battle EXP still feel unchanged.
