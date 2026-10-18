# LuckyDex v0.45.5 Verification Report

## Scope
Elemental Gauntlet consequence/balance pass following an in-game Hard clear where a Sp. Def 150 Carbink absorbed six shielded hits, kept its full 30 HP reserve, received 5/5 Perfect Waves, and was labelled Flawless.

## Gameplay changes verified
- Hard no longer adds more hazard spam; the v0.45.4 attack patterns, counts, timing and continuous irregular scheduling are preserved.
- Hard now applies a 1.60x shield-drain consequence multiplier on mistakes. Sp. Def still affects both shield capacity and incoming special-damage resistance.
- Normal and Easy retain their existing 1.00x shield-drain consequence, so the difficulty increase is concentrated on Hard.
- Goldenrod Ultra uses a 1.25x shield-drain consequence and Master uses 1.60x, matching the intended late-division pressure curve.
- Shield remains passive, finite and non-regenerating for the whole run.
- HP remains the fixed 30-point emergency reserve behind the shield.
- A shielded hit now invalidates Perfect Wave even when HP damage is zero.
- FLAWLESS CLEAR / the Untouchable achievement now require a true no-hit clear, not merely zero HP damage.
- Result review now separates Shield Lost from HP Damage Taken so shielded mistakes are visible rather than reported as zero damage.

## Deterministic Carbink balance sample
Using Sp. Def 150 (185 shield) on Hard and representative hit base damages of 26, 24, 27, 28, 32 and 29:
- Hit 1: shield 185 -> 153
- Hit 2: shield 153 -> 124
- Hit 3: shield 124 -> 90
- Hit 4: shield 90 -> 55
- Hit 5: shield 55 -> 15
- Hit 6: shield breaks; HP falls from 30 to 17

The same six representative hits on Normal leave 84/185 shield and 30/30 HP, confirming that Normal has not inherited the Hard punishment multiplier.

## Fresh verification
- v0.45.5 red/green consequence suite: 4/4 pass.
- v0.45.5 release identity suite: 1/1 pass.
- Goldenrod / Challenge Course non-browser behaviour regression group: 180/180 pass.
- Arcade Records core/registry/state/UI: 4/4 pass. The registry test intentionally emits a simulated `disk full` warning and passes by verifying safe handling.
- `node --check` on Elemental Gauntlet core/runtime: pass.
- Offline asset integrity: 44 Arcade scenes/sheets/crops, 2,098 sprites, 2,078 actors, 8 venue assets, 829 Adventure images / 1,025 species, 42 Fossil Museum images, and all 202 sleeve images pass their existing audits.
- Android application ID remains `com.example.luckydex`; versionName `0.45.5`, versionCode `4505`.

## Existing environment limitations
- Target Range browser fixtures are not runnable in this extracted source environment because the ZIP does not include Playwright/node_modules.
- Historical release-identity tests that deliberately hard-code old versions are not current-release behaviour regressions and are excluded from the current behaviour count.

## Scope preservation
This release is based directly on v0.45.4. No attack geometry, hazard counts, cadence, Pokémon/sleeve/image assets, rare-event settings, save identity, or unrelated game mechanics are intentionally changed.

Codex was not used.
