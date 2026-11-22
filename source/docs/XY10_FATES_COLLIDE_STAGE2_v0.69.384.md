# Fates Collide v0.69.384 — second mechanics pass and CI preflight repair

## Authoritative source

Official Pokémon TCG xy10 set (129 unique prints, 147 printed attacks, 21 Abilities, five BREAK evolutions), pinned Git blob `aa097c8da85e960a5afa4f3b96312f64dcbec871`.

## Previous build defect corrected

v0.69.383 failed GitHub run 45040073029 in `:app:preflightXY10ContractForApk`. This **source-only** preflight inherited `GITHUB_ACTIONS=true`, mistakenly activating the strict test that reads `data/classic/xy10-print-compact.json` before the generator created it. Now the source-only preflight explicitly removes `GITHUB_ACTIONS` for its test child process. The post-generation `auditXY10ForApk` still runs with GitHub environment and MUST check all 129 prints. Do not delete, mock or relax the post-generation audit.

## Verified mechanic reuse and new cards

- #1 Shuckle: Hide a Berry draws two and selects a physical hand card for placement on deck bottom.
- #7 Serperior: Coil grants next-own-turn +60 to either printed attack; Slashing Strike locks only that attack next turn.
- #21 White Kyurem: Fire-conditional 20 to up to two opposing Bench Pokémon; Blizzard Burn next-turn attack lock.
- #43/#43a Regirock-EX: Regi Power stacks +10 on other Fighting Pokémon's damage to the Active, not itself; respects Ability suppression.
- #52 Zygarde: Lookout chosen switch; Aura Break locks Darkness/Fairy defenders only.
- #63 Lucario: Fight Alone scales by the opponent's excess in-play Pokémon.
- #78 Lugia: Pressure reduces attack damage to any of its owner's Pokémon while Active, before Weakness and Resistance, including Bench damage; respects Ability suppression and inherited BREAK abilities.
- #86 Minccino: Cleaning Up chooses the opposing Pokémon and removes its attached Tool.
- #88 Cinccino: Covet reveals opponent hand and chooses a physical card to put on the deck bottom, no random discard or shuffle.
- #103 Lass's Special: draws based only on opposing Benched Basics, not their Active/Evolutions.
- #109 Random Receiver: reveals until first actual Supporter, preserving other cards in deck and shuffling.
- #115 Strong Energy: physical +20 Fighting attack bonus and Fighting-only attachment, using existing XY3 support, without double counting.

The first-pass mappings and stage-one required-enabled prints remain. The official generator will determine the actual playable count; the stage-two estimate is at least mid-70s. **Do not claim complete set.**

## Still gated deliberately

- Moltres Flying Flare: optional damage choice after damage calculation was found to throw at runtime; needs a pre-damage choice solution.
- Devolution Spray: correct return-to-hand is partly present, but its post-devolution no-evolution timing must be enforced.
- Omanyte, Kabuto and Aerodactyl Restored entry; Fossil Items; Choice-heavy global abilities and attacks, alternate KO, broad discard Energy, Power Memory, special Stadium effects, and other incomplete printed effects.

## Required audit

1. `GITHUB_ACTIONS=true python3 scripts/preflight-xy10-release.py` must pass offline without expecting the generated catalogue.
2. `node --test tests/v07383-fates-collide-integration.test.cjs tests/v07383-fates-collide-effects.test.cjs tests/v07384-fates-collide-stage2.test.cjs` must pass. Stage 2 tests exercise actual battle states and physical cards, not only printed descriptors.
3. Full cross-set regression suite, especially current XY8/XY9 release contracts and deck builder.
4. The GitHub Gradle task `auditXY10ForApk`, ordered after `generateXY10ForApk`, runs the same tests with `GITHUB_ACTIONS=true`, requires the exact 129-print catalogue and legal CPU/player decks, and rejects any required print that is gated.
5. Keep app versionName/versionCode/title/boot and both xy9/xy10 release contracts synchronized.

GitHub APK outcome for v0.69.384 is **unverified until user pushes**.
