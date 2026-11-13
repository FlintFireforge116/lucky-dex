# LuckyDex v0.69.229 — Classic TCG choice clarity and Prize resolution hotfix

**Baseline:** v0.69.228 source; applies as an incremental overlay to `source/` (no save/collection changes). Android `versionName=0.69.229`, `versionCode=7218`. Master rules updated from v2.21 to v2.22.

## User repro
The Classic TCG screenshot showed Clefable's Metronome as two identical menu cards, both saying `Metronome · 0 DMG`, even though the opponent's Pokémon had two distinct attacks. The human Prize picker appeared above the still-running coin/KO presentation.

## Fix 1 — real copied-attack identity
- Copy-attack options are resolved from the legal action's `choiceCardId` and `choiceAttackIndex` rather than the invoking attack's zero base damage.
- The play chooser displays the **copied Pokémon card artwork** and **copied attack name, printed damage / effect-only distinction and printed effect text**. For example, Gengar's Life Drain versus Shadow Dance are not identical entries.
- Generic effect-choice attack tiles now display the attack name even when card art exists; card-specific option text stays visible with art. Ordinary attacks retain their previous labels.
- The battle core's chosen copied attack and random resolution are unchanged; this is presentation clarity, not a gameplay adaptation.

## Fix 2 — finish attack presentation before the Prize picker
- After a game action produces a mandatory Classic human Prize choice plus attack, coin, knockout or other logged resolution, the renderer temporarily hides only the Prize selection interface.
- The mid-battle lane says the attack is resolving. Coin flip visualisation, attack/bench damage, status, KO and draw animations play to completion.
- When animations finish, or the user explicitly skips the presentation, the official hidden/face-up Prize choice becomes visible; it does not auto-award the player a Prize.
- When animation is unavailable, the existing immediate callback path releases the Prize hold to avoid deadlock. Starting or exiting a battle resets the hold. Other effect choices aren't hidden.

## Verification
- `node --test tests/v07229-choice-prize-presentation.test.cjs`: 5/5 passed.
- `node --test tests/v07229-dp1-choice-label-audit.test.cjs`: 1/1 passed; all DP1 multi-option attack choices in its generated scenarios were distinguishable.
- `node --test --test-concurrency=2 tests/v07222*.test.cjs ... tests/v07229*.test.cjs`: 145/145 in the final selected Diamond & Pearl v07222–v07229 run (new choice-label audit included).
- Cross-set targeted test selection (EX Hidden Legends Lanturn optional labels, Board target UI, D&P LV.X final): 35/35 passed.
- A historical UI module-order assertion in `v06920-tcgp-battle-ui.test.cjs` is outdated relative to the current source script order and failed before these changes; the other 22 tests in that mixed selection passed. That assertion was not changed by this patch.
- **Not tested:** real Android visual timing, asset load latency, live user tapping, APK build or GitHub deployment.

## Files changed
`app/build.gradle`, `app/src/main/assets/app-v0167.js`, `app/src/main/assets/index.html`, `app/src/main/assets/tcgp-battle-ui.js`, `app/src/main/assets/tcgp-battle.css`, `docs/LUCKYDEX_MASTER_RULES.txt`, this audit and two `tests/v07229*` files.
