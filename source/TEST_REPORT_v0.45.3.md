# LuckyDex v0.45.3 Verification Report

## Scope
Elemental Gauntlet endurance pass based on in-game Hard feedback: a high-Sp. Def Carbink could finish with its shield effectively intact because the shield regenerated and the attack phases were too short.

## Gameplay changes verified
- The passive Special Defense shield is now a finite resource for the entire run.
- Shield regeneration is zero during attacks, between attacks, during wave breaks and across all five waves.
- HP remains a fixed 30-point emergency reserve behind the shield.
- Hard is now a sustained bullet-hell endurance mode rather than a short burst mode.
- Hard deterministic wave pressure rises from 27 hazards / ~8.0 s in Fire to 42 hazards / ~12.1 s in Psychic.
- Normal rises from 15 hazards / ~6.6 s to 23 hazards / ~9.5 s.
- Easy rises from 8 hazards / ~6.6 s to 12 hazards / ~9.3 s.
- Existing clustered Hard timing, elemental attack identities, Prismatic Storm settings control, records and achievements remain intact.
- Runtime copy explicitly tells the player that the shield does not recharge.

## Fresh tests
- Red/green v0.45.3 endurance tests: 2/2 pass.
- Elemental Gauntlet v0.45.0-v0.45.3 focused suites: 17/17 pass.
- Goldenrod / Challenge Course non-browser gameplay regression group: 170/170 pass.
- Arcade Records core/registry/state/UI: 4/4 pass. The registry test deliberately emits a simulated `disk full` warning and passes by verifying safe handling.
- v0.45.3 release identity test: pass; Android application ID remains `com.example.luckydex`.
- `node --check` on the changed Elemental Gauntlet core/runtime: pass.

## Browser-test limitation
Two old Target Range browser fixtures were not runnable in this extracted source environment because Playwright is not bundled in the ZIP and the dependency install attempt timed out. This is an environment limitation, not a test failure in Elemental Gauntlet.

## Offline integrity
- 44 authentic Arcade scenes/sheets/crops verified.
- 2,098 offline Arcade sprites verified.
- 2,078 unretouched Arcade actors verified.
- 8 local venue assets verified.
- Adventure assets verified: 829 images, 1,025 species.
- Fossil Museum assets verified: 42 images.
- Sleeve artwork verified: 202/202 images.
