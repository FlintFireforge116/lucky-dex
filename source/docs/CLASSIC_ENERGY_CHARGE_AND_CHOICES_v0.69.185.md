# LuckyDex v0.69.185 — Classic TCG Energy Charge and attack choices

## EX Deoxys Energy Charge (ex8-86)
The printed card says to shuffle two recovered Energy cards (or one if only one exists) into the **draw deck** on heads. Earlier versions took Basic Energy from `energyDiscard` but appended its type to `energySupply`, which kept the draw deck counter unchanged. The card now creates a physical Basic Energy reference in the 30-card draw deck for each recovered Basic Energy; Special Energy references return to that same deck. This is an in-battle change and does not alter the required 30-card starting deck or the normal one-energy-per-turn Energy Zone.

Recovered Basic Energy has `zoneGenerated:false` so that once drawn it uses ordinary hand-attachment rules and cannot be attached for free beyond the turn's normal energy allowance. Energy Zone stays unchanged. Existing EX Deoxys Camerupt/Metagross effects still directly attach recovered Energy and are unaffected.

## Optional attack outcomes
The Classic live context action cards now show the action's `choiceLabel` when present, in addition to the attack name and damage preview. This makes EX Deoxys Magcargo's Knock Over explicitly display **Keep Stadium** vs **Discard Stadium**, and makes optional energy-discard/bonus choices legible in the same shared UI.

## Tests
- `node --test tests/v0718*.test.cjs` — 67 passed.
- The broader historical suite includes five obsolete assertions for early version numbers and replaced UI markup. These are unrelated to the new logic.

## Files
- app/build.gradle
- app/src/main/assets/index.html
- app/src/main/assets/app-v0167.js
- app/src/main/assets/tcgp-battle-effects.js
- app/src/main/assets/tcgp-battle-ui.js
- tests/v07182-ex-deoxys.test.cjs (version assertion update)
- tests/v07183-ex-deoxys-audit.test.cjs (correct draw-deck expectation)
- tests/v07185-energy-charge-choice-clarity.test.cjs (new regression coverage)
