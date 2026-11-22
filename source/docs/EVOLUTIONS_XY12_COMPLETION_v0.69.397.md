# LuckyDex XY12 Evolutions — completed integration v0.69.397

## Coverage and source

- Pinned upstream Git blob `7e80c06b0f3e5621058a29e26c90023d1033e65f` from Pokémon TCG Evolutions XY12.
- **113/113 prints enabled**, **0 gated**, 129 printed attack instances, 11 Abilities, four Pokémon BREAK, no dual-type cards, ten physically printed Energy cards.
- `docs/XY12_BUILD_COVERAGE.json` records regenerated coverage; `scripts/xy12_release_contract.json` requires every number 1–113 to remain enabled.
- Alternate-art printings reuse exact base-print mechanics. BREAK attacks inherit their previous-stage attacks. All Spirit Links are evolution-specific.

## Implemented effect groups

- Attack calculations: Beedrill Swarming Sting, Ninetales BREAK Explosive Fireball, Poliwrath Dashing Punch, Starmie BREAK Break Star, Raichu Spark Bolt, Machoke Karate Chop, Machamp BREAK Boomerang Lariat, Raticate Shadowy Bite.
- Turn-target/conditions: Ninetales Lure, Arcanine Scorching Breath, Nidoking BREAK Toxic Drill, Gastly Little Grudge, Mewtwo Barrier, Porygon Conversion 3, Dream Eater and the original print's restrictions.
- Abilities: Charizard Energy Burn, Arcanine Burning Road, Starmie Space Beacon, Electrode Buzzap Thunder, Mew Neutral Shield, Diglett Submerge, Machamp Counterattack, Rattata Mischievous Fang, Dragonite-EX Pull Up.
- Trainers: Brock's Grit, Misty's Determination, Super Potion, Here Comes Team Rocket, alongside generic historic rules used by ordinary Potion, Switch, Revive, Spirit Links, Energy Retrieval and others.
- Print-specific card zone: Evolutions' nine Basic Energy cards and Double Colorless Energy are **physical cards**; the hybrid Energy Zone is separate.

## Tested in this release

Run `python3 scripts/preflight-xy12-release.py --full` in the `source` directory. It regenerates and checks the pinned print catalogue and runs both `tests/v07396-evolutions-integration.test.cjs` and `tests/v07397-evolutions-completion.test.cjs`, followed by `tests/v07333-classic-deck-quality.test.cjs`. `auditXY12ForApk` runs the same set-specific tests in the Gradle pipeline. Then run full XY11 and XY10 preflights for cross-set regressions.

The new tests exercise real game-engine paths for Buzzap Thunder's KO and prize awards, Energy Burn suppression, Neutral Shield and Submerge, Burning Road, Counterattack; they also cover target/attachment choices and printed energy symbols.

## Limitations and next audit

- Imakuni?'s Doduo Frenzied Escape and Harmonize have physical card throwing/singing instructions that cannot meaningfully be enacted in a digital app. Their digital analogue preserves legal retreat and printed attack damage and is explicitly marked as an adaptation.
- The generator/effect-validator tests prove all cards are mapped and local interaction tests exercise their principal actions; they do not mathematically exhaust cross-era combinations. Run a separate independent card-by-card audit before final sign-off.
- A green local preflight is **not** evidence that the GitHub APK has built. Confirm the actual Actions workflow for v0.69.397.
